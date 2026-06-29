const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');
const router = express.Router();

// GET / — participations ouvertes
router.get('/', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT p.*, c.nom AS commune_nom,
            (SELECT COUNT(*) FROM participation_citoyen pc WHERE pc.participation_id=p.id)::int AS nb_participants
       FROM participation p LEFT JOIN commune c ON c.id=p.commune_id
      WHERE p.actif=TRUE AND p.statut='ouvert' AND (p.date_fin IS NULL OR p.date_fin > NOW())
      ORDER BY p.date_debut DESC LIMIT 20`);
  res.json(rows);
}));

// POST /:id/participer — s'inscrire
router.post('/:id/participer', authenticate, asyncH(async (req, res) => {
  const { reponse } = req.body;
  const { rows } = await query(
    `INSERT INTO participation_citoyen (participation_id, citoyen_id, reponse)
     VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING *`,
    [req.params.id, req.user.id, reponse || null]);
  if (!rows.length) return res.json({ deja: true });
  // Points si définis
  const { rows: p } = await query('SELECT points_gagnes FROM participation WHERE id=$1', [req.params.id]);
  if (p[0]?.points_gagnes > 0) {
    const { awardPoints } = require('../../utils/points');
    await awardPoints(req.user.id, 'participation_enquete', 'participation', req.params.id);
  }
  res.status(201).json(rows[0]);
}));

// POST / — admin crée
router.post('/', authenticate, requireRole('admin_apc','admin_wilaya'), asyncH(async (req, res) => {
  const { titre, description, type, commune_id, quartier, date_debut, date_fin, points_gagnes } = req.body;
  if (!titre) throw badRequest('titre requis');
  const { rows } = await query(
    `INSERT INTO participation (titre, description, type, commune_id, quartier, date_debut, date_fin, points_gagnes, cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [titre, description||null, type||'consultation', commune_id||null, quartier||null,
     date_debut||new Date().toISOString(), date_fin||null, points_gagnes||0, req.user.id]);
  res.status(201).json(rows[0]);
}));

module.exports = router;
