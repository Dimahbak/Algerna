/**
 * Citoyen Sentinelle — consultation des points et classement.
 * (Les gains sont écrits par les autres modules, ex. signalementService.)
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate } = require('../../middleware/auth');
const { asyncH } = require('../../utils/http');

const router = express.Router();

// GET /api/points/moi — solde + journal du citoyen courant
router.get('/moi', authenticate, asyncH(async (req, res) => {
  const solde = await query(
    `SELECT u.points, n.code AS niveau_code, n.nom AS niveau_nom,
            n.seuil_points, n.seuil_pertinence
       FROM utilisateur u
       LEFT JOIN niveau n ON n.id = u.niveau_id
      WHERE u.id = $1`, [req.user.id]);
  const journal = await query(
    'SELECT delta,motif,ref_type,ref_id,le FROM points_journal WHERE citoyen_id=$1 ORDER BY le DESC LIMIT 50',
    [req.user.id]);
  // Niveau suivant
  const { rows: niveaux } = await query('SELECT * FROM niveau ORDER BY seuil_points');
  const currentPoints = solde.rows[0]?.points ?? 0;
  const nextNiveau = niveaux.find(n => n.seuil_points > currentPoints);
  res.json({
    points: currentPoints,
    niveau: solde.rows[0]?.niveau_nom || 'Citoyen',
    niveau_code: solde.rows[0]?.niveau_code || 'citoyen',
    prochain_niveau: nextNiveau ? { nom: nextNiveau.nom, seuil: nextNiveau.seuil_points } : null,
    journal: journal.rows
  });
}));

// GET /api/points/profil — CV civique complet (strictement personnel)
router.get('/profil', authenticate, asyncH(async (req, res) => {
  const uid = req.user.id;
  const [solde, impact, badges, stats] = await Promise.all([
    query(`SELECT u.points, n.code AS niveau_code, n.nom AS niveau_nom
             FROM utilisateur u LEFT JOIN niveau n ON n.id = u.niveau_id
            WHERE u.id = $1`, [uid]),
    query('SELECT message, cree_le FROM impact_message WHERE citoyen_id = $1 ORDER BY cree_le DESC LIMIT 20', [uid]),
    query(`SELECT b.code, b.nom, b.icone, ub.obtenu_le
             FROM utilisateur_badge ub JOIN badge b ON b.id = ub.badge_id
            WHERE ub.utilisateur_id = $1 ORDER BY ub.obtenu_le`, [uid]),
    query(`SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE etat = 'resolu')::int AS resolus,
                  COUNT(DISTINCT commune_id)::int AS communes
             FROM signalement WHERE citoyen_id = $1`, [uid]),
  ]);
  const { rows: niveaux } = await query('SELECT * FROM niveau ORDER BY seuil_points');
  const pts = solde.rows[0]?.points || 0;
  const nextNiv = niveaux.find(n => n.seuil_points > pts);
  res.json({
    points: pts,
    niveau: solde.rows[0]?.niveau_nom || 'Citoyen',
    niveau_code: solde.rows[0]?.niveau_code || 'citoyen',
    prochain_niveau: nextNiv ? { nom: nextNiv.nom, seuil: nextNiv.seuil_points } : null,
    impact: impact.rows,
    badges: badges.rows,
    stats: stats.rows[0],
    // Pas de score comparable, pas de rang individuel
  });
}));

// GET /api/points/avantages — avantages symboliques (débloqués + à venir)
router.get('/avantages', authenticate, asyncH(async (req, res) => {
  const { rows: user } = await query('SELECT niveau_id FROM utilisateur WHERE id = $1', [req.user.id]);
  const niveauId = user[0]?.niveau_id || 1;
  const { rows } = await query(
    `SELECT a.code, a.nom, a.description, a.icone, n.nom AS niveau_requis,
            a.niveau_requis_id, ($1 >= a.niveau_requis_id) AS debloque
       FROM avantage_symbolique a
       JOIN niveau n ON n.id = a.niveau_requis_id
      ORDER BY a.niveau_requis_id`, [niveauId]);
  res.json(rows);
}));

// GET /api/points/impact — messages d'impact du citoyen
router.get('/impact', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    'SELECT message, cree_le FROM impact_message WHERE citoyen_id = $1 ORDER BY cree_le DESC LIMIT 50',
    [req.user.id]);
  res.json(rows);
}));

// GET /api/points/classement-quartiers — émulation collective uniquement
// Jamais de classement d'individus en public
router.get('/classement-quartiers', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT c.id AS commune_id, c.nom AS commune,
            COUNT(DISTINCT u.id)::int AS citoyens_actifs,
            COALESCE(SUM(u.points), 0)::int AS points_collectifs,
            COUNT(DISTINCT s.id) FILTER (WHERE s.etat = 'resolu')::int AS resolus,
            COUNT(DISTINCT s.id)::int AS total_signalements
       FROM commune c
       LEFT JOIN utilisateur u ON u.commune_id = c.id AND u.role = 'citoyen' AND u.points > 0
       LEFT JOIN signalement s ON s.commune_id = c.id
      GROUP BY c.id, c.nom
      HAVING COUNT(DISTINCT u.id) > 0
      ORDER BY points_collectifs DESC
      LIMIT 20`);
  res.json(rows);
}));

// GET /api/points/classement — DÉPRECIÉ, redirige vers quartiers
// Conservé pour compatibilité mais ne retourne plus d'individus en public
router.get('/classement', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT c.nom AS commune, COUNT(DISTINCT u.id)::int AS citoyens,
            SUM(u.points)::int AS points
       FROM utilisateur u JOIN commune c ON c.id = u.commune_id
      WHERE u.role = 'citoyen' AND u.points > 0
      GROUP BY c.nom ORDER BY points DESC LIMIT 20`);
  res.json(rows);
}));

// GET /api/points/badges — badges du citoyen courant
router.get('/badges', authenticate, asyncH(async (req, res) => {
  const { rows: earned } = await query(
    `SELECT b.code, b.nom, b.description, b.icone, ub.obtenu_le
       FROM utilisateur_badge ub JOIN badge b ON b.id = ub.badge_id
      WHERE ub.utilisateur_id = $1 ORDER BY ub.obtenu_le`, [req.user.id]);
  const { rows: all } = await query('SELECT code, nom, description, icone, condition_seuil FROM badge ORDER BY id');
  res.json({ earned, all });
}));

// Vérifier et attribuer les badges après un événement
async function checkAndAwardBadges(userId) {
  const { rows: badges } = await query('SELECT * FROM badge');
  for (const b of badges) {
    // Déjà obtenu ?
    const { rowCount } = await query(
      'SELECT 1 FROM utilisateur_badge WHERE utilisateur_id = $1 AND badge_id = $2',
      [userId, b.id]);
    if (rowCount) continue;

    let count = 0;
    if (b.condition_type === 'signalements_total') {
      const r = await query('SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id = $1', [userId]);
      count = r.rows[0].n;
    } else if (b.condition_type === 'resolus') {
      const r = await query("SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id = $1 AND etat = 'resolu'", [userId]);
      count = r.rows[0].n;
    } else if (b.condition_type === 'commune') {
      const r = await query('SELECT MAX(n)::int AS n FROM (SELECT commune_id, COUNT(*)::int AS n FROM signalement WHERE citoyen_id = $1 GROUP BY commune_id) t', [userId]);
      count = r.rows[0]?.n || 0;
    } else if (b.condition_type === 'famille_eau') {
      const r = await query("SELECT COUNT(*)::int AS n FROM signalement s JOIN categorie_signal cs ON cs.id = s.categorie_id WHERE s.citoyen_id = $1 AND cs.famille = 'eau'", [userId]);
      count = r.rows[0].n;
    } else if (b.condition_type === 'famille_espaces_verts') {
      const r = await query("SELECT COUNT(*)::int AS n FROM signalement s JOIN categorie_signal cs ON cs.id = s.categorie_id WHERE s.citoyen_id = $1 AND cs.famille = 'espaces_verts'", [userId]);
      count = r.rows[0].n;
    }

    if (count >= b.condition_seuil) {
      await query('INSERT INTO utilisateur_badge (utilisateur_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, b.id]);
    }
  }
}

module.exports = router;
module.exports.checkAndAwardBadges = checkAndAwardBadges;
