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

module.exports = router;
