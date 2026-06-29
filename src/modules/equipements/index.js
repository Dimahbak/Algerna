const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');
const router = express.Router();

// GET / — liste publique, filtrable
router.get('/', asyncH(async (req, res) => {
  const { type, commune_id, lat, lng, rayon } = req.query;
  let sql = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e
             LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`;
  const params = [];
  if (type) { params.push(type); sql += ` AND e.type = $${params.length}`; }
  if (commune_id) { params.push(commune_id); sql += ` AND e.commune_id = $${params.length}`; }
  if (lat && lng) {
    const r = parseFloat(rayon) || 0.02; // ~2km par défaut
    params.push(parseFloat(lat), parseFloat(lng), r);
    sql += ` AND ABS(e.lat - $${params.length-2}) < $${params.length} AND ABS(e.lng - $${params.length-1}) < $${params.length}`;
  }
  sql += ' ORDER BY e.type, e.nom LIMIT 200';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// GET /types — liste des types distincts
router.get('/types', asyncH(async (req, res) => {
  const { rows } = await query('SELECT DISTINCT type FROM equipement_public ORDER BY type');
  res.json(rows.map(r => r.type));
}));

// GET /:id — détail
router.get('/:id', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT e.*, c.nom AS commune_nom FROM equipement_public e
     LEFT JOIN commune c ON c.id = e.commune_id WHERE e.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Équipement introuvable');
  res.json(rows[0]);
}));

// POST / — admin
router.post('/', authenticate, requireRole('admin_apc','admin_wilaya'), asyncH(async (req, res) => {
  const { nom, type, sous_type, commune_id, quartier, adresse, lat, lng,
          horaires, telephone, email, site_web, gestionnaire, statut,
          accessibilite_pmr, description } = req.body;
  if (!nom || !type) throw badRequest('nom et type requis');
  const { rows } = await query(
    `INSERT INTO equipement_public (nom, type, sous_type, commune_id, quartier, adresse,
      lat, lng, horaires, telephone, email, site_web, gestionnaire, statut,
      accessibilite_pmr, description, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'admin') RETURNING *`,
    [nom, type, sous_type||null, commune_id||null, quartier||null, adresse||null,
     lat||null, lng||null, horaires||null, telephone||null, email||null,
     site_web||null, gestionnaire||null, statut||'actif',
     accessibilite_pmr||false, description||null]);
  res.status(201).json(rows[0]);
}));

// PATCH /:id — admin
router.patch('/:id', authenticate, requireRole('admin_apc','admin_wilaya'), asyncH(async (req, res) => {
  const fields = ['nom','type','sous_type','commune_id','quartier','adresse','lat','lng',
    'horaires','telephone','email','site_web','gestionnaire','statut','accessibilite_pmr','description'];
  const sets = ['maj_le=NOW()']; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (vals.length === 0) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE equipement_public SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Équipement introuvable');
  res.json(rows[0]);
}));

// DELETE /:id — admin
router.delete('/:id', authenticate, requireRole('admin_apc','admin_wilaya'), asyncH(async (req, res) => {
  const { rows } = await query('DELETE FROM equipement_public WHERE id=$1 RETURNING id', [req.params.id]);
  if (!rows.length) throw notFound('Équipement introuvable');
  res.json({ deleted: rows[0].id });
}));

module.exports = router;
