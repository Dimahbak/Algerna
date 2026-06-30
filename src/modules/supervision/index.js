/**
 * Centre de Supervision — Sprint 4
 * Endpoints de pilotage pour responsables Wilaya/APC.
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH } = require('../../utils/http');
const sla = require('../../services/sla');
const router = express.Router();

const ROLE_GATE = requireRole('admin_apc', 'admin_wilaya');
const SLA_TARGET_H = sla.DEFAULT_TARGET_H;

// GET /kpis — indicateurs stratégiques
router.get('/kpis', authenticate, ROLE_GATE, asyncH(async (req, res) => {
  const communeId = req.query.communeId || (req.user.role === 'admin_apc' ? req.user.commune_id : null);
  const where = communeId ? ' AND s.commune_id = ' + Number(communeId) : '';

  const [ouverts, resolusAuj, tempsAvg, missionsCap, critiques, total, conformes] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE s.etat NOT IN ('resolu','rejete')${where}`),
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE s.etat='resolu' AND s.resolu_le >= CURRENT_DATE${where}`),
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le - s.cree_le))/3600))::int AS h FROM signalement s WHERE s.etat='resolu' AND s.resolu_le IS NOT NULL${where}`),
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
  // Separate queries to avoid UNION ORDER BY issues
  const [sigHist, capHist] = await Promise.all([
    query(`SELECT 'signalement' AS type, h.le AS date, h.action, h.etat, h.commentaire,
            u.prenom, u.nom, s.reference, c.nom AS commune
       FROM signalement_historique h
       JOIN signalement s ON s.id = h.signalement_id
       LEFT JOIN utilisateur u ON u.id = h.par_utilisateur
       LEFT JOIN commune c ON c.id = s.commune_id
      ORDER BY h.le DESC LIMIT 15`),
    query(`SELECT 'mission_cap' AS type, mh.le AS date, 'mission_' || mh.etat AS action, mh.etat, mh.commentaire,
            u.prenom, u.nom, s.reference, c.nom AS commune
       FROM mission_cap_historique mh
       JOIN mission_cap m ON m.id = mh.mission_id
       LEFT JOIN signalement s ON s.id = m.signalement_id
       LEFT JOIN utilisateur u ON u.id = mh.par_utilisateur
       LEFT JOIN commune c ON c.id = s.commune_id
      ORDER BY mh.le DESC LIMIT 10`),
  ]);
  const rows = [...sigHist.rows, ...capHist.rows]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
  res.json(rows);
}));

// GET /services — performance par service/EPIC
router.get('/services', authenticate, ROLE_GATE, asyncH(async (req, res) => {
  const { rows } = await query(`
    SELECT e.sigle AS service, e.nom,
           COUNT(s.id)::int AS signalements,
           ROUND(AVG(CASE WHEN s.resolu_le IS NOT NULL THEN EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 END))::int AS temps_moyen,
           COUNT(*) FILTER (WHERE s.etat='resolu' AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_TARGET_H})::int AS conformes,
           COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus,
           COUNT(*) FILTER (WHERE s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_TARGET_H} hours')::int AS en_retard
      FROM signalement s
      JOIN epic e ON e.id = s.epic_id
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
  const { rows } = await query(`
    SELECT c.id, c.nom AS commune,
           COUNT(s.id)::int AS signalements,
           ROUND(AVG(CASE WHEN s.resolu_le IS NOT NULL THEN EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 END))::int AS delai_moyen,
           COUNT(*) FILTER (WHERE s.etat='resolu' AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_TARGET_H})::int AS conformes,
           COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus,
           COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','rejete'))::int AS ouverts
      FROM commune c
      LEFT JOIN signalement s ON s.commune_id = c.id
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
  const [horsDelai, capBloque, hausse] = await Promise.all([
    query(`SELECT s.id, s.reference, s.cree_le, cs.libelle AS categorie, c.nom AS commune
             FROM signalement s
             LEFT JOIN categorie_signal cs ON cs.id=s.categorie_id
             LEFT JOIN commune c ON c.id=s.commune_id
            WHERE s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_TARGET_H} hours'
            ORDER BY s.cree_le ASC LIMIT 10`),
    query(`SELECT m.id, m.type, m.motif_blocage, s.reference, c.nom AS commune
             FROM mission_cap m
             JOIN signalement s ON s.id=m.signalement_id
             LEFT JOIN commune c ON c.id=s.commune_id
            WHERE m.etat='bloque' LIMIT 10`),
    query(`SELECT c.nom AS commune, COUNT(*)::int AS n
             FROM signalement s JOIN commune c ON c.id=s.commune_id
            WHERE s.cree_le >= NOW()-INTERVAL '7 days'
            GROUP BY c.nom HAVING COUNT(*)>=5
            ORDER BY n DESC LIMIT 5`),
  ]);
  res.json({
    hors_delai: horsDelai.rows,
    cap_bloque: capBloque.rows,
    hausse_signalements: hausse.rows,
  });
}));

module.exports = router;
