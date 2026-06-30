/**
 * Intelligence Opérationnelle — Analyse décisionnelle.
 * S'appuie sur ICUA, SLA, Workflow, CAP, ConfigEngine.
 * Aucune IA : analyses déterministes et explicables.
 */
const { query } = require('../db/pool');
const configEngine = require('./configEngine');
const icuaEngine = require('./icua');
const sla = require('./sla');

/**
 * Résumé global.
 */
async function getSummary() {
  const icua = await icuaEngine.calculer(null);
  const targetH = sla.DEFAULT_TARGET_H;

  const [horsDelai, communesVigilance, servicesDifficulte] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement WHERE etat='recu' AND cree_le < NOW()-INTERVAL '${targetH} hours'`),
    query(`SELECT COUNT(DISTINCT s.commune_id)::int AS n FROM signalement s
           WHERE s.etat NOT IN ('resolu','rejete') AND s.cree_le < NOW()-INTERVAL '${targetH} hours'`),
    query(`SELECT COUNT(DISTINCT s.epic_id)::int AS n FROM signalement s
           WHERE s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${targetH} hours' AND s.epic_id IS NOT NULL`),
  ]);

  return {
    icua: icua.score,
    sante: icua.sante,
    niveau: icua.niveauLabel,
    engagement_pct: icua.composantes.engagement_service.score,
    hors_delai: horsDelai.rows[0].n,
    communes_vigilance: communesVigilance.rows[0].n,
    services_difficulte: servicesDifficulte.rows[0].n,
  };
}

/**
 * Facteurs de dégradation.
 */
async function getFacteurs() {
  const targetH = sla.DEFAULT_TARGET_H;
  const facteurs = [];

  // 1. Temps moyen
  const tps = await query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolu_le-cree_le))/3600))::int AS h
    FROM signalement WHERE etat='resolu' AND resolu_le IS NOT NULL`);
  if (tps.rows[0].h > targetH) {
    facteurs.push({ type: 'temps_moyen', severity: 'high',
      message: `Temps moyen de traitement élevé : ${tps.rows[0].h}h (cible : ${targetH}h)`,
      valeur: tps.rows[0].h, cible: targetH });
  }

  // 2. Signalements anciens
  const anciens = await query(`SELECT COUNT(*)::int AS n FROM signalement
    WHERE etat='recu' AND cree_le < NOW()-INTERVAL '${targetH*2} hours'`);
  if (anciens.rows[0].n > 0) {
    facteurs.push({ type: 'anciens_non_clotures', severity: 'high',
      message: `${anciens.rows[0].n} signalements non clôturés depuis plus de ${targetH*2}h`,
      valeur: anciens.rows[0].n });
  }

  // 3. Taux de résolution faible
  const res = await query(`SELECT COUNT(*) FILTER (WHERE etat='resolu')::int AS r, COUNT(*)::int AS t FROM signalement`);
  const tauxRes = res.rows[0].t > 0 ? Math.round(res.rows[0].r / res.rows[0].t * 100) : 100;
  if (tauxRes < 50) {
    facteurs.push({ type: 'taux_resolution', severity: 'medium',
      message: `Taux de résolution faible : ${tauxRes}%`, valeur: tauxRes });
  }

  // 4. Missions CAP bloquées
  const capBl = await query(`SELECT COUNT(*)::int AS n FROM mission_cap WHERE etat='bloque'`);
  if (capBl.rows[0].n > 0) {
    facteurs.push({ type: 'cap_bloque', severity: capBl.rows[0].n > 3 ? 'high' : 'medium',
      message: `${capBl.rows[0].n} mission(s) CAP bloquée(s)`, valeur: capBl.rows[0].n });
  }

  // 5. Services surchargés
  const seuilSat = await configEngine.getInt('intel.seuil_saturation_service', 20);
  const svcSat = await query(`SELECT e.sigle, COUNT(*)::int AS n
    FROM signalement s JOIN epic e ON e.id=s.epic_id
    WHERE s.etat NOT IN ('resolu','rejete') GROUP BY e.sigle HAVING COUNT(*)>=${seuilSat}`);
  svcSat.rows.forEach(s => {
    facteurs.push({ type: 'service_sature', severity: 'medium',
      message: `Service ${s.sigle} fortement sollicité : ${s.n} signalements ouverts`, valeur: s.n });
  });

  return facteurs.sort((a, b) => (a.severity === 'high' ? 0 : 1) - (b.severity === 'high' ? 0 : 1));
}

/**
 * Priorités d'action recommandées.
 */
async function getPriorites() {
  const targetH = sla.DEFAULT_TARGET_H;
  const nbMax = await configEngine.getInt('intel.nb_recommandations', 8);
  const priorites = [];

  // Signalements les plus anciens
  const anciens = await query(`SELECT s.id, s.reference, s.cree_le, cs.libelle AS categorie, c.nom AS commune,
    ROUND(EXTRACT(EPOCH FROM (NOW()-s.cree_le))/3600)::int AS heures
    FROM signalement s LEFT JOIN categorie_signal cs ON cs.id=s.categorie_id LEFT JOIN commune c ON c.id=s.commune_id
    WHERE s.etat='recu' ORDER BY s.cree_le ASC LIMIT 5`);
  if (anciens.rows.length) {
    priorites.push({ type: 'traiter_anciens', priority: 10,
      message: `Traiter les ${anciens.rows.length} signalements les plus anciens`,
      details: anciens.rows.map(r => `#${r.reference} (${r.commune}, ${r.heures}h)`) });
  }

  // Débloquer CAP
  const capBl = await query(`SELECT m.id, m.motif_blocage, s.reference, c.nom AS commune
    FROM mission_cap m JOIN signalement s ON s.id=m.signalement_id LEFT JOIN commune c ON c.id=s.commune_id
    WHERE m.etat='bloque' LIMIT 5`);
  if (capBl.rows.length) {
    priorites.push({ type: 'debloquer_cap', priority: 9,
      message: `Débloquer ${capBl.rows.length} mission(s) CAP bloquée(s)`,
      details: capBl.rows.map(r => `#${r.reference} — ${r.commune} (${r.motif_blocage})`) });
  }

  // Communes sous seuil
  const seuilComm = await configEngine.getInt('intel.seuil_commune_critique', 50);
  const communes = await icuaEngine.parCommune();
  const commCritiques = communes.filter(c => c.score < seuilComm).slice(0, 5);
  if (commCritiques.length) {
    priorites.push({ type: 'communes_critiques', priority: 8,
      message: `${commCritiques.length} commune(s) avec ICUA < ${seuilComm}%`,
      details: commCritiques.map(c => `${c.commune} : ICUA ${c.score}/100`) });
  }

  return priorites.sort((a, b) => b.priority - a.priority).slice(0, nbMax);
}

/**
 * Analyse par commune avec score de priorité.
 */
async function getCommunes() {
  const communes = await icuaEngine.parCommune();
  const targetH = sla.DEFAULT_TARGET_H;

  // Enrichir avec facteurs
  for (const c of communes) {
    const ouverts = await query(`SELECT COUNT(*)::int AS n FROM signalement WHERE commune_id=$1 AND etat NOT IN ('resolu','rejete')`, [c.commune_id]);
    const horsDelai = await query(`SELECT COUNT(*)::int AS n FROM signalement WHERE commune_id=$1 AND etat='recu' AND cree_le<NOW()-INTERVAL '${targetH} hours'`, [c.commune_id]);
    c.ouverts = ouverts.rows[0].n;
    c.hors_delai = horsDelai.rows[0].n;
    c.priority_score = c.hors_delai * 3 + c.ouverts + (100 - c.score);
    c.facteurs = [];
    if (c.hors_delai > 0) c.facteurs.push(`${c.hors_delai} hors délai`);
    if (c.composantes?.engagement_service?.score < 50) c.facteurs.push(`Engagement < 50%`);
  }

  return communes.sort((a, b) => b.priority_score - a.priority_score);
}

/**
 * Analyse par service.
 */
async function getServices() {
  const targetH = sla.DEFAULT_TARGET_H;
  const { rows } = await query(`
    SELECT e.sigle AS service, e.nom,
           COUNT(s.id)::int AS signalements,
           COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','rejete'))::int AS ouverts,
           COUNT(*) FILTER (WHERE s.etat='recu' AND s.cree_le<NOW()-INTERVAL '${targetH} hours')::int AS hors_delai,
           ROUND(AVG(CASE WHEN s.resolu_le IS NOT NULL THEN EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 END))::int AS temps_moyen,
           COUNT(*) FILTER (WHERE s.etat='resolu' AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600<=${targetH})::int AS conformes,
           COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus
      FROM signalement s JOIN epic e ON e.id=s.epic_id
     GROUP BY e.sigle, e.nom ORDER BY signalements DESC`);

  return rows.map(r => ({
    ...r,
    engagement_pct: r.resolus > 0 ? Math.round(r.conformes / r.resolus * 100) : 100,
    priority_score: r.hors_delai * 3 + r.ouverts,
    niveau: r.resolus > 0 && Math.round(r.conformes / r.resolus * 100) >= 80 ? 'conforme'
      : r.resolus > 0 && Math.round(r.conformes / r.resolus * 100) >= 50 ? 'vigilance' : 'difficulte',
  }));
}

/**
 * Alertes intelligentes.
 */
async function getAlertes() {
  const targetH = sla.DEFAULT_TARGET_H;
  const delaiCapH = await configEngine.getInt('intel.delai_cap_bloque_h', 24);
  const alertes = [];

  // Communes en dégradation (ICUA bas)
  const communes = await icuaEngine.parCommune();
  communes.filter(c => c.score < 30).forEach(c => {
    alertes.push({ type: 'commune_critique', severity: 'danger',
      message: `${c.commune} — ICUA ${c.score}/100 (critique)` });
  });

  // Missions CAP bloquées longtemps
  const capOld = await query(`SELECT m.id, s.reference, c.nom AS commune,
    ROUND(EXTRACT(EPOCH FROM (NOW()-m.maj_le))/3600)::int AS heures
    FROM mission_cap m JOIN signalement s ON s.id=m.signalement_id LEFT JOIN commune c ON c.id=s.commune_id
    WHERE m.etat='bloque' AND m.maj_le < NOW()-INTERVAL '${delaiCapH} hours'`);
  capOld.rows.forEach(r => {
    alertes.push({ type: 'cap_bloque_longtemps', severity: 'warning',
      message: `Mission CAP bloquée depuis ${r.heures}h — #${r.reference} (${r.commune})` });
  });

  // Signalements très anciens
  const tresAnciens = await query(`SELECT COUNT(*)::int AS n FROM signalement
    WHERE etat='recu' AND cree_le < NOW()-INTERVAL '${targetH*4} hours'`);
  if (tresAnciens.rows[0].n > 0) {
    alertes.push({ type: 'signalements_tres_anciens', severity: 'danger',
      message: `${tresAnciens.rows[0].n} signalements non traités depuis plus de ${targetH*4}h` });
  }

  return alertes.sort((a, b) => (a.severity === 'danger' ? 0 : 1) - (b.severity === 'danger' ? 0 : 1));
}

module.exports = { getSummary, getFacteurs, getPriorites, getCommunes, getServices, getAlertes };
