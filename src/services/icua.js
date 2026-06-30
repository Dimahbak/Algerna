/**
 * ICUA Engine — Indice Citoyen Urbain ALGERNA
 * Score composite 0-100 mesurant la qualité des services publics.
 * Toutes les pondérations sont lues depuis le ConfigEngine.
 */
const { query } = require('../db/pool');
const configEngine = require('./configEngine');
const sla = require('./sla');

// Cache ICUA (rechargé toutes les 10 min)
let _cache = {};
let _cacheTime = 0;
const CACHE_TTL = 600000;

/**
 * Calcule l'ICUA global ou par commune.
 * @param {number|null} communeId - null pour global
 * @returns {object} { score, sante, niveau, composantes, details }
 */
async function calculer(communeId) {
  const cacheKey = communeId || 'global';
  if (Date.now() - _cacheTime < CACHE_TTL && _cache[cacheKey]) return _cache[cacheKey];

  // Charger les pondérations depuis la config
  const poids = {
    engagement: await configEngine.getInt('icua.poids.engagement', 40),
    resolution: await configEngine.getInt('icua.poids.resolution', 20),
    temps: await configEngine.getInt('icua.poids.temps', 15),
    cap: await configEngine.getInt('icua.poids.cap', 10),
    satisfaction: await configEngine.getInt('icua.poids.satisfaction', 10),
    communication: await configEngine.getInt('icua.poids.communication', 5),
  };

  const seuils = {
    excellent: await configEngine.getInt('icua.seuil.excellent', 90),
    bon: await configEngine.getInt('icua.seuil.bon', 75),
    vigilance: await configEngine.getInt('icua.seuil.vigilance', 60),
  };

  const where = communeId ? ` AND s.commune_id = ${Number(communeId)}` : '';
  const targetH = sla.DEFAULT_TARGET_H;

  // 1. Engagement de Service (% résolus dans le délai)
  const engR = await query(`
    SELECT COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${targetH})::int AS conformes,
           COUNT(*)::int AS total
      FROM signalement s WHERE s.etat='resolu' AND s.resolu_le IS NOT NULL${where}`);
  const engTotal = engR.rows[0].total || 1;
  const engScore = Math.round((engR.rows[0].conformes / engTotal) * 100);

  // 2. Taux de résolution (résolus / total)
  const resR = await query(`
    SELECT COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus,
           COUNT(*)::int AS total
      FROM signalement s WHERE 1=1${where}`);
  const resTotal = resR.rows[0].total || 1;
  const resScore = Math.round((resR.rows[0].resolus / resTotal) * 100);

  // 3. Temps moyen (inversé : plus c'est rapide, plus c'est haut)
  const tpsR = await query(`
    SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600))::int AS moy
      FROM signalement s WHERE s.etat='resolu' AND s.resolu_le IS NOT NULL${where}`);
  const tpsMoy = tpsR.rows[0].moy || targetH;
  const tpsScore = Math.max(0, Math.min(100, Math.round((1 - tpsMoy / (targetH * 3)) * 100)));

  // 4. Activité CAP (missions terminées / créées)
  const capR = await query(`
    SELECT COUNT(*) FILTER (WHERE m.etat='termine')::int AS terminees,
           COUNT(*)::int AS total
      FROM mission_cap m
      ${communeId ? 'JOIN signalement s ON s.id=m.signalement_id WHERE s.commune_id='+Number(communeId) : 'WHERE 1=1'}`);
  const capTotal = capR.rows[0].total || 1;
  const capScore = Math.round((capR.rows[0].terminees / capTotal) * 100);

  // 5. Satisfaction citoyenne (placeholder — confirmations / signalements)
  const satR = await query(`
    SELECT COALESCE(AVG(LEAST(s.nb_confirmations, 5)), 0)::numeric AS moy
      FROM signalement s WHERE 1=1${where}`);
  const satScore = Math.min(100, Math.round(parseFloat(satR.rows[0].moy || 0) * 20));

  // 6. Communication (communiqués publiés cette semaine)
  const comR = await query(`
    SELECT COUNT(*)::int AS n FROM communique
     WHERE statut='publie' AND date_publication >= NOW()-INTERVAL '7 days'`);
  const comScore = Math.min(100, comR.rows[0].n * 20); // 5 publications = 100

  // Calcul composite
  const composantes = {
    engagement_service: { score: engScore, poids: poids.engagement, contribution: Math.round(engScore * poids.engagement / 100 * 10) / 10 },
    taux_resolution: { score: resScore, poids: poids.resolution, contribution: Math.round(resScore * poids.resolution / 100 * 10) / 10 },
    temps_moyen: { score: tpsScore, poids: poids.temps, contribution: Math.round(tpsScore * poids.temps / 100 * 10) / 10 },
    activite_cap: { score: capScore, poids: poids.cap, contribution: Math.round(capScore * poids.cap / 100 * 10) / 10 },
    satisfaction: { score: satScore, poids: poids.satisfaction, contribution: Math.round(satScore * poids.satisfaction / 100 * 10) / 10 },
    communication: { score: comScore, poids: poids.communication, contribution: Math.round(comScore * poids.communication / 100 * 10) / 10 },
  };

  const score = Math.round(
    Object.values(composantes).reduce((sum, c) => sum + c.contribution, 0)
  );

  // Santé opérationnelle
  const sante = Math.round((engScore * 0.5 + resScore * 0.3 + tpsScore * 0.2));

  // Niveau
  let niveau, niveauLabel;
  if (score >= seuils.excellent) { niveau = 'excellent'; niveauLabel = 'Excellent'; }
  else if (score >= seuils.bon) { niveau = 'bon'; niveauLabel = 'Bon fonctionnement'; }
  else if (score >= seuils.vigilance) { niveau = 'vigilance'; niveauLabel = 'Vigilance'; }
  else { niveau = 'critique'; niveauLabel = 'Critique'; }

  const result = {
    score, sante, niveau, niveauLabel,
    composantes,
    seuils,
    temps_moyen_h: tpsMoy,
    commune_id: communeId,
  };

  _cache[cacheKey] = result;
  _cacheTime = Date.now();
  return result;
}

/**
 * Sauvegarde un snapshot ICUA dans l'historique.
 */
async function sauvegarderSnapshot(communeId) {
  const data = await calculer(communeId);
  await query(
    `INSERT INTO icua_historique (commune_id, score, engagement_service, taux_resolution, temps_moyen, activite_cap, satisfaction, communication, sante_operationnelle)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [communeId || null, data.score,
     data.composantes.engagement_service.score,
     data.composantes.taux_resolution.score,
     data.composantes.temps_moyen.score,
     data.composantes.activite_cap.score,
     data.composantes.satisfaction.score,
     data.composantes.communication.score,
     data.sante]);
}

/**
 * Historique ICUA.
 */
async function getHistorique(communeId, jours) {
  const d = jours || 30;
  const { rows } = await query(
    `SELECT * FROM icua_historique
      WHERE (commune_id = $1 OR ($1 IS NULL AND commune_id IS NULL))
        AND calcule_le >= NOW() - INTERVAL '${d} days'
      ORDER BY calcule_le ASC`,
    [communeId || null]);
  return rows;
}

/**
 * ICUA par commune.
 */
async function parCommune() {
  const { rows: communes } = await query('SELECT id, nom FROM commune WHERE actif != FALSE ORDER BY nom');
  const results = [];
  for (const c of communes.slice(0, 30)) { // Limiter pour perf
    try {
      const data = await calculer(c.id);
      results.push({ commune_id: c.id, commune: c.nom, ...data });
    } catch (e) { /* skip */ }
  }
  return results.sort((a, b) => b.score - a.score);
}

function invalidateCache() { _cache = {}; _cacheTime = 0; }

module.exports = { calculer, sauvegarderSnapshot, getHistorique, parCommune, invalidateCache };
