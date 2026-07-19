/**
 * Centre de Supervision — Sprint 4
 * Endpoints de pilotage pour responsables Wilaya/APC.
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole, hasPerimetre } = require('../../middleware/auth');
const { asyncH, unauthorized, forbidden } = require('../../utils/http');
const sla = require('../../services/sla');
const router = express.Router();

// Validation stricte des dates pour éviter l'injection SQL
function validDate(s) {
  if (!s || typeof s !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T00:00:00Z');
  if (isNaN(d.getTime())) return null;
  return s; // retourne la chaîne validée
}

// Phase 4C — sans fallback
function requireSuperviseur() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.fonction === 'superviseur') return next();
    return next(forbidden());
  };
}
const ROLE_GATE = requireSuperviseur();
const SLA_TARGET_H = sla.DEFAULT_TARGET_H;

// GET /kpis — indicateurs stratégiques
router.get('/kpis', authenticate, ROLE_GATE, asyncH(async (req, res) => {
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeId = req.query.communeId || (isCommune ? req.user.commune_id : null);
  const where = communeId ? ' AND s.commune_id = ' + Number(communeId) : '';

  const [ouverts, resolusAuj, tempsAvg, missionsCap, critiques, total, conformes] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE s.etat NOT IN ('resolu','rejete')${where}`),
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE s.etat='resolu' AND s.resolu_le >= CURRENT_DATE${where}`),
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le - s.cree_le))/3600))::int AS h FROM signalement s WHERE s.etat='resolu' AND s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le${where}`),
    query(`SELECT COUNT(*)::int AS n FROM mission_cap m LEFT JOIN signalement s ON s.id=m.signalement_id WHERE m.etat NOT IN ('termine')${communeId ? ' AND s.commune_id='+Number(communeId) : ''}`),
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_TARGET_H} hours'${where}`),
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE s.etat='resolu'${where}`),
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE s.etat='resolu' AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_TARGET_H}${where}`),
  ]);

  const totalR = total.rows[0].n || 1;
  const pctSla = Math.round((conformes.rows[0].n / totalR) * 100);

  res.json({
    ouverts: ouverts.rows[0].n,
    resolus_aujourdhui: resolusAuj.rows[0].n,
    engagement_pct: pctSla,
    temps_moyen_h: tempsAvg.rows[0].h || 0,
    missions_cap: missionsCap.rows[0].n,
    alertes_critiques: critiques.rows[0].n,
    sla_target_h: SLA_TARGET_H,
  });
}));

// GET /activite — flux temps réel (derniers événements)
router.get('/activite', authenticate, ROLE_GATE, asyncH(async (req, res) => {
  const isCommune = hasPerimetre(req.user, 'commune');
  const cf = isCommune && req.user.commune_id ? ` WHERE s.commune_id = ${Number(req.user.commune_id)}` : '';
  const cfCap = isCommune && req.user.commune_id ? ` AND s.commune_id = ${Number(req.user.commune_id)}` : '';
  // Separate queries to avoid UNION ORDER BY issues
  const [sigHist, capHist] = await Promise.all([
    query(`SELECT 'signalement' AS type, h.le AS date, h.action, h.etat, h.commentaire,
            u.prenom, u.nom, s.reference, c.nom AS commune
       FROM signalement_historique h
       JOIN signalement s ON s.id = h.signalement_id
       LEFT JOIN utilisateur u ON u.id = h.par_utilisateur
       LEFT JOIN commune c ON c.id = s.commune_id
      ${cf}
      ORDER BY h.le DESC LIMIT 15`),
    query(`SELECT 'mission_cap' AS type, mh.le AS date, 'mission_' || mh.etat AS action, mh.etat, mh.commentaire,
            u.prenom, u.nom, s.reference, c.nom AS commune
       FROM mission_cap_historique mh
       JOIN mission_cap m ON m.id = mh.mission_id
       LEFT JOIN signalement s ON s.id = m.signalement_id
       LEFT JOIN utilisateur u ON u.id = mh.par_utilisateur
       LEFT JOIN commune c ON c.id = s.commune_id
      WHERE 1=1${cfCap}
      ORDER BY mh.le DESC LIMIT 10`),
  ]);
  const rows = [...sigHist.rows, ...capHist.rows]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
  res.json(rows);
}));

// GET /services — performance par service/EPIC
router.get('/services', authenticate, ROLE_GATE, asyncH(async (req, res) => {
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeId = req.query.communeId || (isCommune ? req.user.commune_id : null);
  const cf = communeId ? ` AND s.commune_id = ${Number(communeId)}` : '';
  const { rows } = await query(`
    SELECT e.sigle AS service, e.nom,
           COUNT(s.id)::int AS signalements,
           ROUND(AVG(CASE WHEN s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le THEN EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 END))::int AS temps_moyen,
           COUNT(*) FILTER (WHERE s.etat='resolu' AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_TARGET_H})::int AS conformes,
           COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus,
           COUNT(*) FILTER (WHERE s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_TARGET_H} hours')::int AS en_retard
      FROM signalement s
      JOIN epic e ON e.id = s.epic_id
     WHERE 1=1${cf}
     GROUP BY e.sigle, e.nom
     ORDER BY signalements DESC
  `);
  rows.forEach(r => {
    r.engagement_pct = r.resolus > 0 ? Math.round((r.conformes / r.resolus) * 100) : 100;
  });
  res.json(rows);
}));

// GET /communes — performance territoriale
router.get('/communes', authenticate, ROLE_GATE, asyncH(async (req, res) => {
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeFilter = isCommune && req.user.commune_id ? ` WHERE c.id = ${Number(req.user.commune_id)}` : '';
  const { rows } = await query(`
    SELECT c.id, c.nom AS commune,
           COUNT(s.id)::int AS signalements,
           ROUND(AVG(CASE WHEN s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le THEN EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 END))::int AS delai_moyen,
           COUNT(*) FILTER (WHERE s.etat='resolu' AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_TARGET_H})::int AS conformes,
           COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus,
           COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','rejete'))::int AS ouverts
      FROM commune c
      LEFT JOIN signalement s ON s.commune_id = c.id
    ${communeFilter}
     GROUP BY c.id, c.nom
    HAVING COUNT(s.id) > 0
     ORDER BY signalements DESC
  `);
  rows.forEach(r => {
    r.engagement_pct = r.resolus > 0 ? Math.round((r.conformes / r.resolus) * 100) : 100;
    r.niveau = r.engagement_pct >= 80 ? 'conforme' : r.engagement_pct >= 50 ? 'vigilance' : 'difficulte';
  });
  res.json(rows);
}));

// GET /alertes — alertes prioritaires
router.get('/alertes', authenticate, ROLE_GATE, asyncH(async (req, res) => {
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeId = req.query.communeId || (isCommune ? req.user.commune_id : null);
  const cf = communeId ? ` AND s.commune_id = ${Number(communeId)}` : '';

  const [horsDelai, capBloque, hausse] = await Promise.all([
    query(`SELECT s.id, s.reference, s.cree_le, cs.libelle AS categorie, c.nom AS commune
             FROM signalement s
             LEFT JOIN categorie_signal cs ON cs.id=s.categorie_id
             LEFT JOIN commune c ON c.id=s.commune_id
            WHERE s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_TARGET_H} hours'${cf}
            ORDER BY s.cree_le ASC LIMIT 10`),
    query(`SELECT m.id, m.signalement_id, m.type, m.motif_blocage, s.reference, c.nom AS commune
             FROM mission_cap m
             JOIN signalement s ON s.id=m.signalement_id
             LEFT JOIN commune c ON c.id=s.commune_id
            WHERE m.etat='bloque'${cf} LIMIT 10`),
    query(`SELECT c.nom AS commune, COUNT(*)::int AS n
             FROM signalement s JOIN commune c ON c.id=s.commune_id
            WHERE s.cree_le >= NOW()-INTERVAL '7 days'${cf}
            GROUP BY c.nom HAVING COUNT(*)>=5
            ORDER BY n DESC LIMIT 5`),
  ]);
  res.json({
    hors_delai: horsDelai.rows,
    cap_bloque: capBloque.rows,
    hausse_signalements: hausse.rows,
  });
}));

// ═══ COCKPIT EXÉCUTIF (Vague 5A) ═══

// Middleware : capacité pilotage uniquement, pas de fallback role
function requirePilotage() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    const caps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!caps.includes('pilotage')) return next(forbidden());
    return next();
  };
}

// GET /cockpit — données consolidées du cockpit exécutif
router.get('/cockpit', authenticate, requirePilotage(), asyncH(async (req, res) => {
  // ── Période ──
  const periode = req.query.periode || '30j';
  let intervalSQL;
  switch (periode) {
    case 'today':  intervalSQL = "s.cree_le >= CURRENT_DATE"; break;
    case '7j':     intervalSQL = "s.cree_le >= NOW() - INTERVAL '7 days'"; break;
    case '30j':    intervalSQL = "s.cree_le >= NOW() - INTERVAL '30 days'"; break;
    case 'annee':  intervalSQL = "s.cree_le >= DATE_TRUNC('year', NOW())"; break;
    case 'custom':
      const from = req.query.from;
      const to = req.query.to;
      if (!from || !to) return res.status(400).json({ erreur: 'Paramètres from et to requis pour la période personnalisée.' });
      const vFrom = validDate(from), vTo = validDate(to);
      if (!vFrom || !vTo) return res.status(400).json({ erreur: 'Format de date invalide (YYYY-MM-DD requis).' });
      intervalSQL = `s.cree_le >= '${vFrom}'::date AND s.cree_le < ('${vTo}'::date + INTERVAL '1 day')`;
      break;
    default:       intervalSQL = "s.cree_le >= NOW() - INTERVAL '30 days'";
  }

  // ── Périmètre automatique ──
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeFilter = isCommune && req.user.commune_id
    ? ` AND s.commune_id = ${Number(req.user.commune_id)}`
    : '';

  // ── Filtre période pour KPIs "en cours" (pas de filtre date) ──
  const whereEnCours = `WHERE 1=1${communeFilter}`;
  const wherePeriode = `WHERE ${intervalSQL}${communeFilter}`;

  // ── KPIs ──
  const [recus, enCours, enRetard, aValider, tempsMoyen, recusPeriodePrecedente] = await Promise.all([
    // KPI 1 : Dossiers reçus (pendant la période)
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${wherePeriode}`),
    // KPI 2 : Dossiers en cours (tous, pas de filtre date)
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${whereEnCours} AND s.etat NOT IN ('resolu','rejete')`),
    // KPI 3 : En retard (delai_prevu dépassé, non clôturé)
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${whereEnCours} AND s.delai_prevu IS NOT NULL AND NOW() > s.delai_prevu AND s.etat NOT IN ('resolu','rejete')`),
    // KPI 4 : À valider
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${whereEnCours} AND s.etat = 'a_valider'`),
    // KPI 5 : Temps moyen (résolu_le - cree_le, en heures)
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le - s.cree_le))/3600))::int AS h FROM signalement s ${wherePeriode} AND s.etat = 'resolu' AND s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le`),
    // Évolution : période précédente pour KPI 1
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE ${intervalSQL.replace(/NOW\(\)|CURRENT_DATE/g, (m) => {
      if (periode === 'today') return "(CURRENT_DATE - INTERVAL '1 day')";
      if (periode === '7j') return "(NOW() - INTERVAL '7 days')";
      if (periode === '30j') return "(NOW() - INTERVAL '30 days')";
      if (periode === 'annee') return "(DATE_TRUNC('year', NOW()) - INTERVAL '1 year')";
      return m;
    })}${communeFilter}`),
  ]);

  // ── Répartitions ──
  const [parCommune, parOrganisation, parDomaine] = await Promise.all([
    query(`SELECT c.id, c.nom, c.nom_ar, COUNT(s.id)::int AS total
             FROM signalement s
             JOIN commune c ON c.id = s.commune_id
            ${wherePeriode}
            GROUP BY c.id, c.nom ORDER BY total DESC`),
    query(`SELECT o.id, o.nom, o.nom_ar, COUNT(s.id)::int AS total,
              COUNT(*) FILTER (WHERE s.etat = 'resolu')::int AS resolus,
              COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','rejete'))::int AS en_cours,
              COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','rejete')
                AND s.delai_prevu IS NOT NULL AND NOW() > s.delai_prevu)::int AS en_retard
             FROM organisations o
             LEFT JOIN utilisateur u ON u.organisation_id = o.id
             LEFT JOIN signalement s ON s.assigne_a = u.id${communeFilter.replace('AND','AND')}
            WHERE o.actif != FALSE AND o.type IN ('epic','direction')
            GROUP BY o.id, o.nom, o.nom_ar ORDER BY total DESC`),
    query(`SELECT s.domaine, COUNT(*)::int AS total
             FROM signalement s
            ${wherePeriode} AND s.domaine IS NOT NULL
            GROUP BY s.domaine ORDER BY total DESC`),
  ]);

  res.json({
    kpis: {
      recus: recus.rows[0].n,
      recus_precedent: recusPeriodePrecedente.rows[0].n,
      en_cours: enCours.rows[0].n,
      en_retard: enRetard.rows[0].n,
      a_valider: aValider.rows[0].n,
      temps_moyen_h: tempsMoyen.rows[0].h || 0,
    },
    repartitions: {
      communes: parCommune.rows,
      organisations: parOrganisation.rows,
      domaines: parDomaine.rows,
    },
    periode,
    perimetre: isCommune ? 'commune' : 'wilaya',
  });
}));

// ═══ CARTE OPÉRATIONNELLE (Vague 5B) ═══
// Rayon en km pour le calcul des points critiques (≥3 dossiers ouverts dans ce rayon)
const CRITICAL_RADIUS_KM = 0.5;
const CRITICAL_MIN_COUNT = 3;

router.get('/carte', authenticate, requirePilotage(), asyncH(async (req, res) => {
  // ── Périmètre ──
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeFilter = isCommune && req.user.commune_id
    ? ` AND s.commune_id = ${Number(req.user.commune_id)}`
    : '';

  // ── Filtres optionnels ──
  const filters = [];
  const params = [];
  let pi = 1;

  if (req.query.commune) { filters.push(`s.commune_id = $${pi}`); params.push(Number(req.query.commune)); pi++; }
  if (req.query.domaine) { filters.push(`s.domaine = $${pi}`); params.push(req.query.domaine); pi++; }
  if (req.query.etat) { filters.push(`s.etat = $${pi}`); params.push(req.query.etat); pi++; }
  if (req.query.urgence) { filters.push(`s.gravite = $${pi}`); params.push(req.query.urgence); pi++; }
  if (req.query.organisation) {
    filters.push(`s.assigne_a IN (SELECT id FROM utilisateur WHERE organisation_id = $${pi})`);
    params.push(Number(req.query.organisation));
    pi++;
  }

  // Période
  const periode = req.query.periode || '30j';
  let intervalSQL;
  switch (periode) {
    case 'today':  intervalSQL = "s.cree_le >= CURRENT_DATE"; break;
    case '7j':     intervalSQL = "s.cree_le >= NOW() - INTERVAL '7 days'"; break;
    case '30j':    intervalSQL = "s.cree_le >= NOW() - INTERVAL '30 days'"; break;
    case 'annee':  intervalSQL = "s.cree_le >= DATE_TRUNC('year', NOW())"; break;
    case 'custom':
      if (req.query.from && req.query.to) {
        const vFrom = validDate(req.query.from), vTo = validDate(req.query.to);
        if (!vFrom || !vTo) return res.status(400).json({ erreur: 'Format de date invalide (YYYY-MM-DD requis).' });
        intervalSQL = `s.cree_le >= '${vFrom}'::date AND s.cree_le < ('${vTo}'::date + INTERVAL '1 day')`;
      } else { intervalSQL = "1=1"; }
      break;
    default: intervalSQL = "s.cree_le >= NOW() - INTERVAL '30 days'";
  }

  const filterSQL = filters.length ? ' AND ' + filters.join(' AND ') : '';
  const typeFilter = req.query.type; // dossiers, interventions, cap, critiques

  // ── Dossiers ouverts (avec GPS) ──
  let dossiers = [];
  let sansGps = [];
  if (!typeFilter || typeFilter === 'dossiers' || typeFilter === 'interventions' || typeFilter === 'critiques') {
    const etatFilter = typeFilter === 'interventions'
      ? "AND s.etat = 'en_intervention'"
      : "AND s.etat NOT IN ('resolu','rejete')";

    const { rows } = await query(
      `SELECT s.id, s.reference, s.etat, s.domaine, s.gravite, s.lat, s.lng, s.cree_le,
              s.equipe_interne, s.responsable_intervention,
              cs.libelle AS categorie, c.nom AS commune_nom,
              o.nom AS organisation_nom
         FROM signalement s
         LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
         LEFT JOIN commune c ON c.id = s.commune_id
         LEFT JOIN utilisateur u ON u.id = s.assigne_a
         LEFT JOIN organisations o ON o.id = u.organisation_id
        WHERE ${intervalSQL} ${etatFilter}${communeFilter}${filterSQL}
        ORDER BY s.cree_le DESC LIMIT 500`,
      params
    );

    rows.forEach(r => {
      if (r.lat && r.lng && parseFloat(r.lat) !== 0 && parseFloat(r.lng) !== 0) {
        r.type_point = r.etat === 'en_intervention' ? 'intervention' : 'dossier';
        dossiers.push(r);
      } else {
        sansGps.push({ id: r.id, reference: r.reference, etat: r.etat, commune_nom: r.commune_nom, categorie: r.categorie, cree_le: r.cree_le });
      }
    });
  }

  // ── Missions CAP actives ──
  let missions = [];
  if (!typeFilter || typeFilter === 'cap') {
    const capCommuneFilter = isCommune && req.user.commune_id
      ? ` AND s.commune_id = ${Number(req.user.commune_id)}`
      : '';
    const { rows: capRows } = await query(
      `SELECT m.id, m.type, m.priorite, m.etat AS mission_etat, m.lat, m.lng,
              m.commentaire, m.cree_le,
              s.reference, s.domaine, s.etat AS signal_etat,
              c.nom AS commune_nom,
              ua.prenom AS agent_prenom, ua.nom AS agent_nom
         FROM mission_cap m
         JOIN signalement s ON s.id = m.signalement_id
         LEFT JOIN commune c ON c.id = s.commune_id
         LEFT JOIN utilisateur ua ON ua.id = m.affecte_a
        WHERE m.etat NOT IN ('termine','cloture')${capCommuneFilter}
        ORDER BY m.cree_le DESC LIMIT 200`
    );
    capRows.forEach(r => {
      const lat = r.lat || null;
      const lng = r.lng || null;
      if (lat && lng && parseFloat(lat) !== 0 && parseFloat(lng) !== 0) {
        r.type_point = 'cap';
        missions.push(r);
      }
    });
  }

  // ── Points critiques (≥3 dossiers ouverts dans un rayon) ──
  // Calcul SQL via regroupement spatial approximatif (grille ~500m)
  let critiques = [];
  if (!typeFilter || typeFilter === 'critiques') {
    const { rows: critRows } = await query(
      `SELECT ROUND(CAST(s.lat AS numeric), 2) AS lat_group,
              ROUND(CAST(s.lng AS numeric), 2) AS lng_group,
              COUNT(*)::int AS nb,
              JSON_AGG(s.reference ORDER BY s.cree_le DESC) AS refs,
              JSON_AGG(DISTINCT s.domaine) AS domaines,
              MIN(c.nom) AS commune_nom
         FROM signalement s
         LEFT JOIN commune c ON c.id = s.commune_id
        WHERE s.etat NOT IN ('resolu','rejete')
          AND s.lat IS NOT NULL AND s.lng IS NOT NULL
          AND CAST(s.lat AS numeric) != 0${communeFilter}
        GROUP BY lat_group, lng_group
       HAVING COUNT(*) >= ${CRITICAL_MIN_COUNT}
        ORDER BY nb DESC`
    );
    critiques = critRows.map(r => ({
      type_point: 'critique',
      lat: parseFloat(r.lat_group),
      lng: parseFloat(r.lng_group),
      nb: r.nb,
      refs: (r.refs || []).slice(0, 5),
      domaines: r.domaines || [],
      commune_nom: r.commune_nom,
    }));
  }

  res.json({
    dossiers,
    missions,
    critiques,
    sans_gps: sansGps,
    config: { critical_radius_km: CRITICAL_RADIUS_KM, critical_min_count: CRITICAL_MIN_COUNT },
    perimetre: isCommune ? 'commune' : 'wilaya',
  });
}));

// ═══ PERFORMANCE DES ORGANISATIONS (Vague 5C) ═══

router.get('/organisations-performance', authenticate, requirePilotage(), asyncH(async (req, res) => {
  // ── Périmètre ──
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeFilter = isCommune && req.user.commune_id
    ? ` AND s.commune_id = ${Number(req.user.commune_id)}`
    : '';

  // ── Période ──
  const periode = req.query.periode || '30j';
  let intervalSQL;
  switch (periode) {
    case 'today':  intervalSQL = "s.cree_le >= CURRENT_DATE"; break;
    case '7j':     intervalSQL = "s.cree_le >= NOW() - INTERVAL '7 days'"; break;
    case '30j':    intervalSQL = "s.cree_le >= NOW() - INTERVAL '30 days'"; break;
    case 'annee':  intervalSQL = "s.cree_le >= DATE_TRUNC('year', NOW())"; break;
    case 'custom':
      if (req.query.from && req.query.to) {
        const vFrom = validDate(req.query.from), vTo = validDate(req.query.to);
        if (!vFrom || !vTo) return res.status(400).json({ erreur: 'Format de date invalide (YYYY-MM-DD requis).' });
        intervalSQL = `s.cree_le >= '${vFrom}'::date AND s.cree_le < ('${vTo}'::date + INTERVAL '1 day')`;
      } else { intervalSQL = "1=1"; }
      break;
    default: intervalSQL = "s.cree_le >= NOW() - INTERVAL '30 days'";
  }

  // ── Filtres optionnels ──
  const filters = [];
  const params = [];
  let pi = 1;
  if (req.query.commune) { filters.push(`s.commune_id = $${pi}`); params.push(Number(req.query.commune)); pi++; }
  if (req.query.domaine) { filters.push(`s.domaine = $${pi}`); params.push(req.query.domaine); pi++; }
  if (req.query.etat) { filters.push(`s.etat = $${pi}`); params.push(req.query.etat); pi++; }
  if (req.query.urgence) { filters.push(`s.gravite = $${pi}`); params.push(req.query.urgence); pi++; }
  if (req.query.organisation) { filters.push(`o.id = $${pi}`); params.push(Number(req.query.organisation)); pi++; }
  const filterSQL = filters.length ? ' AND ' + filters.join(' AND ') : '';

  const inclureInactives = req.query.inclure_inactives === 'true';

  // ── Identifier l'organisation exécutante de chaque dossier ──
  // L'organisation qui a pris en charge ou démarré l'intervention
  // est celle qui exécute réellement les travaux.
  // On utilise une sous-requête sur l'historique pour trouver
  // la PREMIÈRE transition vers pris_en_charge ou en_intervention.
  // Fallback : assigne_a pour les dossiers sans historique (données de démo).
  const { rows } = await query(
    `WITH org_executante AS (
       SELECT DISTINCT ON (s.id)
              s.id AS signalement_id,
              COALESCE(u_exec.organisation_id, u_assigne.organisation_id) AS organisation_id
         FROM signalement s
         LEFT JOIN LATERAL (
           SELECT h.par_utilisateur
             FROM signalement_historique h
            WHERE h.signalement_id = s.id
              AND h.action IN (
                'transmis_vers_pris_en_charge', 'recu_vers_pris_en_charge',
                'transmis_vers_en_intervention', 'recu_vers_en_intervention',
                'pris_en_charge_vers_en_intervention'
              )
            ORDER BY h.le ASC LIMIT 1
         ) h_exec ON true
         LEFT JOIN utilisateur u_exec ON u_exec.id = h_exec.par_utilisateur
         LEFT JOIN utilisateur u_assigne ON u_assigne.id = s.assigne_a
        WHERE ${intervalSQL}${communeFilter}${filterSQL}
     )
     SELECT o.id AS organisation_id, o.nom, o.nom_ar, o.type,
            COUNT(oe.signalement_id)::int AS dossiers_recus,
            COUNT(*) FILTER (WHERE s.etat = 'resolu')::int AS resolus,
            COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','rejete')
              AND s.delai_prevu IS NOT NULL AND NOW() > s.delai_prevu)::int AS en_retard
       FROM organisations o
       LEFT JOIN org_executante oe ON oe.organisation_id = o.id
       LEFT JOIN signalement s ON s.id = oe.signalement_id
      WHERE o.actif = true
      GROUP BY o.id, o.nom, o.nom_ar, o.type
      ${inclureInactives ? '' : 'HAVING COUNT(oe.signalement_id) > 0'}
      ORDER BY dossiers_recus DESC`,
    params
  );

  // ── Temps moyen : prise en charge → résolution (pas cree_le → resolu_le) ──
  // Calculé par organisation exécutante, via l'historique
  const orgIds = rows.filter(r => r.dossiers_recus > 0).map(r => r.organisation_id);
  let tempsMap = {};
  if (orgIds.length) {
    const { rows: tempsRows } = await query(
      `SELECT u_exec.organisation_id,
              ROUND(AVG(CASE WHEN s.resolu_le >= h_debut.le THEN EXTRACT(EPOCH FROM (s.resolu_le - h_debut.le))/3600 END))::int AS temps_moyen_h
         FROM signalement s
         JOIN LATERAL (
           SELECT h.par_utilisateur, h.le
             FROM signalement_historique h
            WHERE h.signalement_id = s.id
              AND h.action IN (
                'transmis_vers_pris_en_charge', 'recu_vers_pris_en_charge',
                'transmis_vers_en_intervention', 'recu_vers_en_intervention',
                'pris_en_charge_vers_en_intervention'
              )
            ORDER BY h.le ASC LIMIT 1
         ) h_debut ON true
         JOIN utilisateur u_exec ON u_exec.id = h_debut.par_utilisateur
        WHERE s.etat = 'resolu' AND s.resolu_le IS NOT NULL
          AND u_exec.organisation_id = ANY($1::int[])
        GROUP BY u_exec.organisation_id`,
      [orgIds]
    );
    tempsRows.forEach(r => { tempsMap[r.organisation_id] = r.temps_moyen_h; });
  }

  // ── Taux de reprise enrichi ──
  let repriseMap = {};
  if (orgIds.length) {
    const { rows: repriseRows } = await query(
      `SELECT u.organisation_id,
              COUNT(DISTINCT CASE WHEN h.action = 'en_intervention_vers_a_valider' THEN h.signalement_id END)::int AS soumis,
              COUNT(DISTINCT CASE WHEN h.action = 'reprise_demandee' THEN h.signalement_id END)::int AS dossiers_repris,
              COUNT(*) FILTER (WHERE h.action = 'reprise_demandee')::int AS reprises_total
         FROM signalement_historique h
         JOIN signalement s ON s.id = h.signalement_id
         JOIN utilisateur u ON u.id = h.par_utilisateur
        WHERE u.organisation_id = ANY($1::int[])
          AND h.action IN ('en_intervention_vers_a_valider', 'reprise_demandee')
        GROUP BY u.organisation_id`,
      [orgIds]
    );
    repriseRows.forEach(r => { repriseMap[r.organisation_id] = r; });
  }

  // ── Assembler la réponse ──
  const result = rows.map(r => {
    const reprise = repriseMap[r.organisation_id] || { soumis: 0, dossiers_repris: 0, reprises_total: 0 };
    const moyenneReprises = reprise.dossiers_repris > 0
      ? Math.round((reprise.reprises_total / reprise.dossiers_repris) * 10) / 10 : 0;
    return {
      organisation_id: r.organisation_id,
      nom: r.nom,
      type: r.type,
      dossiers_recus: r.dossiers_recus,
      temps_moyen_h: tempsMap[r.organisation_id] || 0,
      taux_resolution: r.dossiers_recus > 0
        ? Math.round((r.resolus / r.dossiers_recus) * 100) : 0,
      resolus: r.resolus,
      en_retard: r.en_retard,
      taux_reprise: reprise.soumis > 0
        ? Math.round((reprise.dossiers_repris / reprise.soumis) * 100) : 0,
      reprises_total: reprise.reprises_total,
      moyenne_reprises_par_dossier: moyenneReprises,
      soumissions: reprise.soumis,
    };
  });

  res.json({
    organisations: result,
    periode,
    perimetre: isCommune ? 'commune' : 'wilaya',
  });
}));

// ═══ PERFORMANCE CAP (Vague 5D) ═══

router.get('/cap-performance', authenticate, requirePilotage(), asyncH(async (req, res) => {
  // ── Périmètre ──
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeFilter = isCommune && req.user.commune_id
    ? ` AND u.commune_id = ${Number(req.user.commune_id)}`
    : '';

  // ── Période ──
  const periode = req.query.periode || '30j';
  let intervalSQL;
  switch (periode) {
    case 'today':  intervalSQL = "m.cree_le >= CURRENT_DATE"; break;
    case '7j':     intervalSQL = "m.cree_le >= NOW() - INTERVAL '7 days'"; break;
    case '30j':    intervalSQL = "m.cree_le >= NOW() - INTERVAL '30 days'"; break;
    case 'annee':  intervalSQL = "m.cree_le >= DATE_TRUNC('year', NOW())"; break;
    case 'custom':
      if (req.query.from && req.query.to) {
        const vFrom = validDate(req.query.from), vTo = validDate(req.query.to);
        if (!vFrom || !vTo) return res.status(400).json({ erreur: 'Format de date invalide (YYYY-MM-DD requis).' });
        intervalSQL = `m.cree_le >= '${vFrom}'::date AND m.cree_le < ('${vTo}'::date + INTERVAL '1 day')`;
      } else { intervalSQL = "1=1"; }
      break;
    default: intervalSQL = "m.cree_le >= NOW() - INTERVAL '30 days'";
  }

  // ── Agents CAP avec leurs indicateurs ──
  const { rows } = await query(
    `SELECT u.id AS agent_id,
            u.prenom, u.nom,
            c.nom AS commune_nom,
            COUNT(m.id)::int AS missions_total,
            COUNT(*) FILTER (WHERE m.etat = 'termine')::int AS missions_realisees,
            COUNT(*) FILTER (WHERE m.etat = 'bloque')::int AS missions_bloquees,
            COUNT(*) FILTER (WHERE m.etat IN ('cree','accepte','en_cours'))::int AS missions_en_cours,
            ROUND(AVG(CASE WHEN m.etat = 'termine' THEN
              EXTRACT(EPOCH FROM (mh_fin.le - m.cree_le))/60 END))::int AS temps_moyen_min,
            COUNT(*) FILTER (WHERE m.type = 'constat')::int AS constats,
            COUNT(*) FILTER (WHERE m.type = 'verification')::int AS verifications,
            COUNT(*) FILTER (WHERE m.type = 'ronde')::int AS rondes,
            COUNT(*) FILTER (WHERE m.type = 'signalement_proactif')::int AS signalements_proactifs,
            COUNT(*) FILTER (WHERE m.type = 'assistance_pmr')::int AS assistance_pmr,
            COUNT(*) FILTER (WHERE m.type = 'stationnement')::int AS stationnement
       FROM utilisateur u
       LEFT JOIN commune c ON c.id = u.commune_id
       LEFT JOIN mission_cap m ON m.affecte_a = u.id AND ${intervalSQL}
       LEFT JOIN LATERAL (
         SELECT mh.le FROM mission_cap_historique mh
         WHERE mh.mission_id = m.id AND mh.etat = 'termine'
         ORDER BY mh.le DESC LIMIT 1
       ) mh_fin ON m.etat = 'termine'
      WHERE u.fonction = 'cap' AND u.actif = true${communeFilter}
      GROUP BY u.id, u.prenom, u.nom, c.nom
      ORDER BY missions_realisees DESC, missions_total DESC`
  );

  res.json({
    agents: rows,
    periode,
    perimetre: isCommune ? 'commune' : 'wilaya',
  });
}));

// ═══ ALERTES STRATÉGIQUES (Vague 5E) ═══
// Seuils configurables
const SEUIL_ORG_DOSSIERS_OUVERTS = 10;
const SEUIL_ORG_DOSSIERS_RETARD = 5;

router.get('/alertes-strategiques', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const isCommune = hasPerimetre(req.user, 'commune');
  const communeFilter = isCommune && req.user.commune_id
    ? ` AND s.commune_id = ${Number(req.user.commune_id)}`
    : '';
  const communeFilterDirect = isCommune && req.user.commune_id
    ? ` WHERE s.commune_id = ${Number(req.user.commune_id)}`
    : '';

  // Filtres optionnels
  const typeAlerte = req.query.type_alerte; // sla, critique, chaud, saturee

  const alertes = [];

  // ── A. SLA dépassé ──
  if (!typeAlerte || typeAlerte === 'sla') {
    const { rows } = await query(
      `SELECT s.id, s.reference, s.etat, s.gravite, s.domaine, s.delai_prevu, s.cree_le,
              c.nom AS commune_nom,
              EXTRACT(EPOCH FROM (NOW() - s.delai_prevu))/3600 AS retard_heures,
              o.nom AS organisation_nom
         FROM signalement s
         LEFT JOIN commune c ON c.id = s.commune_id
         LEFT JOIN utilisateur u ON u.id = s.assigne_a
         LEFT JOIN organisations o ON o.id = u.organisation_id
        WHERE s.delai_prevu IS NOT NULL AND NOW() > s.delai_prevu
          AND s.etat NOT IN ('resolu','rejete')${communeFilter}
        ORDER BY retard_heures DESC LIMIT 50`
    );
    rows.forEach(r => {
      const retardH = Math.round(parseFloat(r.retard_heures));
      alertes.push({
        type: 'sla',
        gravite: retardH > 72 ? 'critique' : retardH > 24 ? 'elevee' : 'normale',
        cle: 'sla_' + r.id,
        signalement_id: r.id,
        reference: r.reference,
        commune: r.commune_nom,
        organisation: r.organisation_nom,
        domaine: r.domaine,
        urgence: r.gravite,
        retard_heures: retardH,
        retard_label: retardH >= 24 ? Math.round(retardH / 24) + ' jour(s)' : retardH + ' heure(s)',
        depuis: r.cree_le,
      });
    });
  }

  // ── B. Incidents critiques ──
  if (!typeAlerte || typeAlerte === 'critique') {
    const { rows } = await query(
      `SELECT s.id, s.reference, s.etat, s.gravite, s.domaine, s.lat, s.lng, s.cree_le,
              c.nom AS commune_nom,
              EXTRACT(EPOCH FROM (NOW() - s.cree_le))/3600 AS depuis_heures,
              o.nom AS organisation_nom
         FROM signalement s
         LEFT JOIN commune c ON c.id = s.commune_id
         LEFT JOIN utilisateur u ON u.id = s.assigne_a
         LEFT JOIN organisations o ON o.id = u.organisation_id
        WHERE s.gravite IN ('danger_immediat','risque_blessure')
          AND s.etat IN ('recu','transmis','pris_en_charge')${communeFilter}
        ORDER BY CASE s.gravite WHEN 'danger_immediat' THEN 0 ELSE 1 END, s.cree_le ASC
        LIMIT 50`
    );
    rows.forEach(r => {
      alertes.push({
        type: 'critique',
        gravite: r.gravite === 'danger_immediat' ? 'critique' : 'elevee',
        cle: 'critique_' + r.id,
        signalement_id: r.id,
        reference: r.reference,
        commune: r.commune_nom,
        organisation: r.organisation_nom,
        domaine: r.domaine,
        urgence: r.gravite,
        depuis_heures: Math.round(parseFloat(r.depuis_heures)),
        depuis: r.cree_le,
      });
    });
  }

  // ── C. Points chauds (réutilise logique 5B — même SQL) ──
  if (!typeAlerte || typeAlerte === 'chaud') {
    const { rows } = await query(
      `SELECT ROUND(CAST(s.lat AS numeric), 2) AS lat_group,
              ROUND(CAST(s.lng AS numeric), 2) AS lng_group,
              COUNT(*)::int AS nb,
              JSON_AGG(s.reference ORDER BY s.cree_le DESC) AS refs,
              JSON_AGG(DISTINCT s.domaine) AS domaines,
              MIN(c.nom) AS commune_nom
         FROM signalement s
         LEFT JOIN commune c ON c.id = s.commune_id
        WHERE s.etat NOT IN ('resolu','rejete')
          AND s.lat IS NOT NULL AND CAST(s.lat AS numeric) != 0${communeFilter}
        GROUP BY lat_group, lng_group
       HAVING COUNT(*) >= ${CRITICAL_MIN_COUNT}
        ORDER BY nb DESC`
    );
    rows.forEach(r => {
      alertes.push({
        type: 'chaud',
        gravite: r.nb >= 6 ? 'critique' : r.nb >= 4 ? 'elevee' : 'normale',
        cle: 'chaud_' + r.lat_group + '_' + r.lng_group,
        lat: parseFloat(r.lat_group),
        lng: parseFloat(r.lng_group),
        nb: r.nb,
        refs: (r.refs || []).slice(0, 5),
        domaines: r.domaines || [],
        commune: r.commune_nom,
        domaine_dominant: (r.domaines || [])[0] || null,
      });
    });
  }

  // ── D. Organisations saturées (réutilise même calcul 5C) ──
  if (!typeAlerte || typeAlerte === 'saturee') {
    const { rows } = await query(
      `SELECT o.id AS organisation_id, o.nom, o.type,
              COUNT(s.id) FILTER (WHERE s.etat NOT IN ('resolu','rejete'))::int AS ouverts,
              COUNT(s.id) FILTER (WHERE s.etat NOT IN ('resolu','rejete')
                AND s.delai_prevu IS NOT NULL AND NOW() > s.delai_prevu)::int AS en_retard
         FROM organisations o
         LEFT JOIN utilisateur u ON u.organisation_id = o.id
         LEFT JOIN signalement s ON s.assigne_a = u.id${communeFilter.replace(/AND/,'AND')}
        WHERE o.actif = true
        GROUP BY o.id, o.nom, o.nom_ar, o.type
       HAVING COUNT(s.id) FILTER (WHERE s.etat NOT IN ('resolu','rejete')) >= ${SEUIL_ORG_DOSSIERS_OUVERTS}
           OR COUNT(s.id) FILTER (WHERE s.etat NOT IN ('resolu','rejete')
                AND s.delai_prevu IS NOT NULL AND NOW() > s.delai_prevu) >= ${SEUIL_ORG_DOSSIERS_RETARD}
        ORDER BY en_retard DESC, ouverts DESC`
    );
    rows.forEach(r => {
      const tauxRetard = r.ouverts > 0 ? Math.round((r.en_retard / r.ouverts) * 100) : 0;
      alertes.push({
        type: 'saturee',
        gravite: r.en_retard >= SEUIL_ORG_DOSSIERS_RETARD ? 'critique' : 'elevee',
        cle: 'saturee_' + r.organisation_id,
        organisation_id: r.organisation_id,
        organisation: r.nom,
        type_org: r.type,
        ouverts: r.ouverts,
        en_retard: r.en_retard,
        taux_retard: tauxRetard,
      });
    });
  }

  // ── Tri : critique > elevee > normale, puis ancienneté ──
  const ordreGravite = { critique: 0, elevee: 1, normale: 2 };
  alertes.sort((a, b) => {
    const ga = ordreGravite[a.gravite] ?? 2;
    const gb = ordreGravite[b.gravite] ?? 2;
    if (ga !== gb) return ga - gb;
    // Ancienneté : plus ancien en premier
    const da = a.depuis ? new Date(a.depuis) : new Date();
    const db = b.depuis ? new Date(b.depuis) : new Date();
    return da - db;
  });

  // ── Déduplication par clé ──
  const seen = new Set();
  const deduped = alertes.filter(a => {
    if (seen.has(a.cle)) return false;
    seen.add(a.cle);
    return true;
  });

  res.json({
    alertes: deduped,
    total: deduped.length,
    par_type: {
      sla: deduped.filter(a => a.type === 'sla').length,
      critique: deduped.filter(a => a.type === 'critique').length,
      chaud: deduped.filter(a => a.type === 'chaud').length,
      saturee: deduped.filter(a => a.type === 'saturee').length,
    },
    seuils: {
      org_dossiers_ouverts: SEUIL_ORG_DOSSIERS_OUVERTS,
      org_dossiers_retard: SEUIL_ORG_DOSSIERS_RETARD,
      points_chauds_min: CRITICAL_MIN_COUNT,
    },
    perimetre: isCommune ? 'commune' : 'wilaya',
  });
}));

// ═══ DEMANDES D'EXPLICATION ═══

// POST /demandes-explication — créer une demande
router.post('/demandes-explication', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { signalement_id, message, delai_heures } = req.body;
  if (!signalement_id || !message) return res.status(400).json({ erreur: 'signalement_id et message requis.' });
  const delai = [24, 48, 72].includes(Number(delai_heures)) ? Number(delai_heures) : 48;
  const echeance = new Date(Date.now() + delai * 3600 * 1000);

  // Trouver l'organisation assignée au dossier
  const { rows: sig } = await query(
    `SELECT s.id, s.reference, s.assigne_a, s.commune_id, u.organisation_id
       FROM signalement s LEFT JOIN utilisateur u ON u.id = s.assigne_a WHERE s.id = $1`, [signalement_id]);
  // Superviseur communal : vérifier périmètre
  if (hasPerimetre(req.user, 'commune') && req.user.commune_id && sig.length && sig[0].commune_id !== req.user.commune_id) {
    return res.status(403).json({ erreur: 'Hors périmètre.' });
  }
  if (!sig.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
  const orgId = sig[0].organisation_id || null;

  const { rows } = await query(
    `INSERT INTO demande_explication (signalement_id, demandeur_id, organisation_id, message, delai_heures, echeance)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, echeance, statut`,
    [signalement_id, req.user.id, orgId, message.trim(), delai, echeance]);

  // Historique
  const auteur = (req.user.prenom || '') + ' ' + (req.user.nom || '');
  await query(
    `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
     VALUES ($1, (SELECT etat FROM signalement WHERE id=$1), $2, 'demande_explication', $3)`,
    [signalement_id, req.user.id, 'Demande d\'explication de ' + auteur.trim() + ' — délai ' + delai + 'h : ' + message.trim()]);

  res.json({ ok: true, demande: rows[0] });
}));

// GET /demandes-explication — lister (avec filtrage statut)
router.get('/demandes-explication', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { statut, signalement_id } = req.query;

  // Auto-update expired ones
  await query(`UPDATE demande_explication SET statut = 'en_retard' WHERE statut = 'en_attente' AND echeance < NOW()`);

  let sql = `SELECT de.*, s.reference, o.nom AS organisation_nom
               FROM demande_explication de
               LEFT JOIN signalement s ON s.id = de.signalement_id
               LEFT JOIN organisations o ON o.id = de.organisation_id
              WHERE 1=1`;
  const params = [];
  if (statut) { params.push(statut); sql += ` AND de.statut = $${params.length}`; }
  if (signalement_id) { params.push(signalement_id); sql += ` AND de.signalement_id = $${params.length}`; }

  // Périmètre commune
  const isCommune = hasPerimetre(req.user, 'commune');
  if (isCommune && req.user.commune_id) {
    sql += ` AND s.commune_id = ${Number(req.user.commune_id)}`;
  }

  sql += ` ORDER BY de.cree_le DESC LIMIT 50`;
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// PATCH /demandes-explication/:id/repondre — répondre (EPIC/agent)
router.patch('/demandes-explication/:id/repondre', authenticate, asyncH(async (req, res) => {
  const { reponse } = req.body;
  if (!reponse || !reponse.trim()) return res.status(400).json({ erreur: 'Réponse requise.' });

  const { rows } = await query(
    `UPDATE demande_explication SET statut = 'repondu', reponse = $1, repondu_par = $2, repondu_le = NOW()
     WHERE id = $3 AND statut IN ('en_attente','en_retard') RETURNING id, signalement_id`,
    [reponse.trim(), req.user.id, req.params.id]);
  if (!rows.length) return res.status(404).json({ erreur: 'Demande introuvable ou déjà répondue.' });

  // Historique
  const auteur = (req.user.prenom || '') + ' ' + (req.user.nom || '');
  await query(
    `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
     VALUES ($1, (SELECT etat FROM signalement WHERE id=$1), $2, 'reponse_explication', $3)`,
    [rows[0].signalement_id, req.user.id, 'Réponse de ' + auteur.trim() + ' : ' + reponse.trim()]);

  res.json({ ok: true });
}));

// ═══ ANNUAIRE ═══
router.get('/annuaire', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { fonction, organisation_id, commune_id, q, inclure_inactifs } = req.query;
  const isCommune = hasPerimetre(req.user, 'commune');

  let sql = `SELECT u.id, u.prenom, u.nom, u.telephone, u.email, u.fonction, u.role,
                    u.niveau_perimetre, u.commune_id, u.organisation_id, u.actif,
                    c.nom AS commune_nom, o.nom AS organisation_nom,
                    (SELECT COUNT(*)::int FROM signalement s WHERE s.assigne_a=u.id AND s.etat NOT IN ('resolu','rejete')) AS dossiers_en_cours,
                    (SELECT COUNT(*)::int FROM mission_cap m WHERE m.affecte_a=u.id AND m.etat NOT IN ('termine')) AS missions_en_cours
               FROM utilisateur u
               LEFT JOIN commune c ON c.id = u.commune_id
               LEFT JOIN organisations o ON o.id = u.organisation_id
              WHERE u.fonction != 'citoyen'` + (inclure_inactifs ? '' : ' AND u.actif = true');
  const params = [];

  // Périmètre commune
  if (isCommune && req.user.commune_id) {
    params.push(Number(req.user.commune_id));
    sql += ` AND u.commune_id = $${params.length}`;
  }

  if (fonction) { params.push(fonction); sql += ` AND u.fonction = $${params.length}`; }
  if (organisation_id) { params.push(Number(organisation_id)); sql += ` AND u.organisation_id = $${params.length}`; }
  if (commune_id) { params.push(Number(commune_id)); sql += ` AND u.commune_id = $${params.length}`; }
  if (q) { params.push('%' + q.toLowerCase() + '%'); sql += ` AND (LOWER(u.prenom || ' ' || u.nom) LIKE $${params.length} OR u.telephone LIKE $${params.length})`; }

  sql += ` ORDER BY u.fonction, u.nom ASC`;
  const { rows } = await query(sql, params);

  // Déduire le supérieur hiérarchique
  const all = rows;
  rows.forEach(u => {
    u.superieur = null;
    if (u.fonction === 'cap' || u.fonction === 'agent_traitant') {
      // → superviseur commune
      const sup = all.find(s => s.fonction === 'superviseur' && s.niveau_perimetre === 'commune' && s.commune_id === u.commune_id);
      if (sup) u.superieur = { id: sup.id, nom: (sup.prenom||'') + ' ' + (sup.nom||''), fonction: 'superviseur' };
      else {
        const supW = all.find(s => s.fonction === 'superviseur' && s.niveau_perimetre === 'wilaya');
        if (supW) u.superieur = { id: supW.id, nom: (supW.prenom||'') + ' ' + (supW.nom||''), fonction: 'superviseur' };
      }
    } else if (u.fonction === 'entite_responsable') {
      const supW = all.find(s => s.fonction === 'superviseur' && s.niveau_perimetre === 'wilaya');
      if (supW) u.superieur = { id: supW.id, nom: (supW.prenom||'') + ' ' + (supW.nom||''), fonction: 'superviseur' };
    } else if (u.fonction === 'superviseur' && u.niveau_perimetre === 'commune') {
      const supW = all.find(s => s.fonction === 'superviseur' && s.niveau_perimetre === 'wilaya');
      if (supW) u.superieur = { id: supW.id, nom: (supW.prenom||'') + ' ' + (supW.nom||''), fonction: 'superviseur' };
    }
  });

  res.json(rows);
}));

// POST /annuaire — créer un contact (superviseur wilaya seulement)
router.post('/annuaire', authenticate, requirePilotage(), asyncH(async (req, res) => {
  if (!req.user.niveau_perimetre || req.user.niveau_perimetre !== 'wilaya') {
    // Commune supervisor can only create in their commune
    if (req.user.niveau_perimetre === 'commune') {
      req.body.commune_id = req.user.commune_id;
    } else {
      return res.status(403).json({ erreur: 'Réservé au superviseur.' });
    }
  }
  const { prenom, nom, fonction, organisation_id, commune_id, telephone, email, creer_compte, mot_de_passe } = req.body;
  if (!prenom || !nom) return res.status(400).json({ erreur: 'Prénom et nom requis.' });

  if (creer_compte && telephone) {
    // Create user account — reuse admin logic
    const bcrypt = require('bcryptjs');
    const pwd = mot_de_passe || Math.random().toString(36).substring(2, 10);
    const hash = await bcrypt.hash(pwd, 12);
    const roleMap = { citoyen:'citoyen', agent_traitant:'agent', cap:'agent', entite_responsable:'operateur', superviseur:'admin_apc' };
    const niveauMap = { agent_traitant:'wilaya', cap:'quartier', entite_responsable:'entite', superviseur:'commune' };
    const capsMap = { agent_traitant:['reception'], cap:['terrain'], entite_responsable:['traitement'], superviseur:['pilotage'] };
    const { rows } = await query(
      `INSERT INTO utilisateur (telephone, prenom, nom, email, role, commune_id, mot_de_passe, fonction, niveau_perimetre, organisation_id, capacites)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, telephone, prenom, nom, fonction`,
      [telephone, prenom, nom, email||null, roleMap[fonction]||'agent', commune_id||null, hash,
       fonction||'agent_traitant', niveauMap[fonction]||'wilaya', organisation_id||null, capsMap[fonction]||[]]);
    // Journal
    await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
      SELECT id, etat, $1, 'annuaire_creation', $2 FROM signalement LIMIT 1`,
      [req.user.id, 'Compte créé : ' + prenom + ' ' + nom + ' (' + (fonction||'') + ')']);
    // Envoyer le mot de passe par email si l'agent a un email
    if (email) {
      try {
        const { sendMail } = require('../../services/emailService');
        await sendMail(email, 'Votre compte Algerna',
          `Bonjour ${prenom},\n\nVotre compte a été créé. Mot de passe provisoire : ${pwd}\nConnectez-vous et changez-le dès que possible.\n\nAlgerna — Wilaya d'Alger`);
      } catch(e) { console.warn('[supervision] email mdp provisoire failed:', e.message); }
    }
    res.status(201).json({ ok: true, utilisateur: rows[0], mot_de_passe_provisoire: pwd });
  } else {
    // Contact simple (dans la table utilisateur mais sans mot de passe exploitable)
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(Math.random().toString(36), 12); // unusable password
    const { rows } = await query(
      `INSERT INTO utilisateur (telephone, prenom, nom, email, role, commune_id, mot_de_passe, fonction, niveau_perimetre, organisation_id, actif)
       VALUES ($1,$2,$3,$4,'agent',$5,$6,$7,'wilaya',$8,true) RETURNING id, prenom, nom, fonction`,
      [telephone||('contact-'+Date.now()), prenom, nom, email||null, commune_id||null, hash, fonction||'agent_traitant', organisation_id||null]);
    await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
      SELECT id, etat, $1, 'annuaire_creation', $2 FROM signalement LIMIT 1`,
      [req.user.id, 'Contact créé : ' + prenom + ' ' + nom]);
    res.status(201).json({ ok: true, utilisateur: rows[0] });
  }
}));

// PATCH /annuaire/:id — modifier un contact
router.patch('/annuaire/:id', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { prenom, nom, telephone, email, fonction, organisation_id, commune_id } = req.body;
  // Commune supervisor can only edit contacts in their commune
  if (hasPerimetre(req.user, 'commune')) {
    const { rows: check } = await query('SELECT commune_id FROM utilisateur WHERE id=$1', [req.params.id]);
    if (check.length && check[0].commune_id !== req.user.commune_id) return res.status(403).json({ erreur: 'Hors de votre périmètre.' });
  }
  const sets = []; const params = [req.params.id]; let pi = 2;
  if (prenom !== undefined) { sets.push(`prenom=$${pi}`); params.push(prenom); pi++; }
  if (nom !== undefined) { sets.push(`nom=$${pi}`); params.push(nom); pi++; }
  if (telephone !== undefined) { sets.push(`telephone=$${pi}`); params.push(telephone); pi++; }
  if (email !== undefined) { sets.push(`email=$${pi}`); params.push(email); pi++; }
  if (fonction !== undefined) { sets.push(`fonction=$${pi}`); params.push(fonction); pi++; }
  if (organisation_id !== undefined) { sets.push(`organisation_id=$${pi}`); params.push(organisation_id); pi++; }
  if (commune_id !== undefined) { sets.push(`commune_id=$${pi}`); params.push(commune_id); pi++; }
  if (!sets.length) return res.status(400).json({ erreur: 'Aucun champ à modifier.' });
  await query(`UPDATE utilisateur SET ${sets.join(',')} WHERE id=$1`, params);
  // Journal
  await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
    SELECT id, etat, $1, 'annuaire_modification', $2 FROM signalement LIMIT 1`,
    [req.user.id, 'Contact modifié : ' + (prenom||'') + ' ' + (nom||'') + ' (id: ' + req.params.id.substring(0,8) + ')']);
  res.json({ ok: true });
}));

// DELETE /annuaire/:id — désactiver ou supprimer
router.delete('/annuaire/:id', authenticate, requirePilotage(), asyncH(async (req, res) => {
  // Only wilaya supervisor can delete
  if (!hasPerimetre(req.user, 'wilaya')) return res.status(403).json({ erreur: 'Suppression réservée au superviseur wilaya.' });
  const { action } = req.query; // 'desactiver' or 'supprimer' or 'reactiver'
  const uid = req.params.id;

  if (action === 'reactiver') {
    await query('UPDATE utilisateur SET actif=true WHERE id=$1', [uid]);
    await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
      SELECT id, etat, $1, 'annuaire_reactivation', $2 FROM signalement LIMIT 1`,
      [req.user.id, 'Contact réactivé : ' + uid.substring(0,8)]);
    return res.json({ ok: true, action: 'reactiver' });
  }

  // Check if user has active dossiers/missions
  const { rows: charge } = await query(
    `SELECT (SELECT COUNT(*)::int FROM signalement WHERE assigne_a=$1 AND etat NOT IN ('resolu','rejete')) AS dossiers,
            (SELECT COUNT(*)::int FROM mission_cap WHERE affecte_a=$1 AND etat NOT IN ('termine')) AS missions`, [uid]);
  const hasCharge = (charge[0].dossiers + charge[0].missions) > 0;

  if (action === 'supprimer') {
    if (hasCharge) return res.status(409).json({ erreur: 'Impossible de supprimer : ' + charge[0].dossiers + ' dossier(s) et ' + charge[0].missions + ' mission(s) en cours. Désactivez plutôt.', dossiers: charge[0].dossiers, missions: charge[0].missions });
    await query('DELETE FROM utilisateur WHERE id=$1', [uid]);
    await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
      SELECT id, etat, $1, 'annuaire_suppression', $2 FROM signalement LIMIT 1`,
      [req.user.id, 'Contact supprimé : ' + uid.substring(0,8)]);
    return res.json({ ok: true, action: 'supprimer' });
  }

  // Default: désactiver
  await query('UPDATE utilisateur SET actif=false WHERE id=$1', [uid]);
  await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
    SELECT id, etat, $1, 'annuaire_desactivation', $2 FROM signalement LIMIT 1`,
    [req.user.id, 'Contact désactivé : ' + uid.substring(0,8)]);
  res.json({ ok: true, action: 'desactiver' });
}));

module.exports = router;
