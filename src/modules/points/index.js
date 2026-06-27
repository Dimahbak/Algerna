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
  const solde = await query('SELECT points FROM utilisateur WHERE id=$1', [req.user.id]);
  const journal = await query(
    'SELECT delta,motif,ref_type,ref_id,le FROM points_journal WHERE citoyen_id=$1 ORDER BY le DESC LIMIT 50',
    [req.user.id]);
  res.json({ points: solde.rows[0]?.points ?? 0, journal: journal.rows });
}));

// GET /api/points/classement — top citoyens (anonymisable)
router.get('/classement', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT prenom, points FROM utilisateur
      WHERE role='citoyen' AND points > 0
      ORDER BY points DESC LIMIT 20`);
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
