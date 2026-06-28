const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');

const router = express.Router();

// GET /contacts — liste publique
router.get('/contacts', asyncH(async (req, res) => {
  const { categorie } = req.query;
  let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE';
  const params = [];
  if (categorie) { params.push(categorie); sql += ` AND categorie = $${params.length}`; }
  sql += ' ORDER BY ordre, nom';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// POST /contacts — admin
router.post('/contacts', authenticate, requireRole('admin_apc','admin_wilaya'), asyncH(async (req, res) => {
  const { nom, categorie, telephone, email, adresse, commune_id, horaires, lat, lng, niveau } = req.body;
  if (!nom || !categorie) throw badRequest('nom et categorie requis');
  const { rows } = await query(
    `INSERT INTO contact_utile (nom, categorie, telephone, email, adresse, commune_id, horaires, lat, lng, niveau)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [nom, categorie, telephone||null, email||null, adresse||null, commune_id||null, horaires||null, lat||null, lng||null, niveau||'info']);
  res.status(201).json(rows[0]);
}));

// PATCH /contacts/:id — admin
router.patch('/contacts/:id', authenticate, requireRole('admin_apc','admin_wilaya'), asyncH(async (req, res) => {
  const fields = ['nom','categorie','telephone','email','adresse','commune_id','horaires','lat','lng','niveau','actif','ordre'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE contact_utile SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Contact introuvable');
  res.json(rows[0]);
}));

// DELETE /contacts/:id — admin
router.delete('/contacts/:id', authenticate, requireRole('admin_apc','admin_wilaya'), asyncH(async (req, res) => {
  const { rows } = await query('DELETE FROM contact_utile WHERE id=$1 RETURNING id', [req.params.id]);
  if (!rows.length) throw notFound('Contact introuvable');
  res.json({ deleted: rows[0].id });
}));

module.exports = router;
