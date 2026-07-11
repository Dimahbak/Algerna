/**
 * Notes bidirectionnelles propreté
 * Nassim (EPIC propreté) ↔ Rachid (admin_wilaya)
 * Mourad (admin_apc) : lecture seule, filtré par commune
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate } = require('../../middleware/auth');
const { asyncH, badRequest, forbidden, notFound } = require('../../utils/http');

const router = express.Router();

function isEpicProprete(user) {
  return user.fonction === 'entite_responsable' && Array.isArray(user.capacites) && user.capacites.includes('collecte_dechets');
}
function isWilaya(user) { return user.role === 'admin_wilaya'; }
function isCommune(user) { return user.role === 'admin_apc' && !!user.commune_id; }
function canWrite(user) { return isWilaya(user) || isEpicProprete(user); }
function canRead(user) { return canWrite(user) || isCommune(user); }

// Middleware : au moins lecteur
function requireReader(req, res, next) {
  if (!req.user || !canRead(req.user)) return next(forbidden());
  next();
}

// Visibility filter SQL
function visibilitySQL(user) {
  if (isWilaya(user)) {
    // Rachid voit les notes de l'EPIC propreté
    return { where: `AND n.auteur_id IN (SELECT id FROM utilisateur WHERE 'collecte_dechets' = ANY(capacites))`, params: [] };
  }
  if (isEpicProprete(user)) {
    // Nassim voit les notes de admin_wilaya
    return { where: `AND n.auteur_id IN (SELECT id FROM utilisateur WHERE role = 'admin_wilaya')`, params: [] };
  }
  if (isCommune(user)) {
    // Mourad voit toutes les notes mais filtrées par sa commune ou toutes-communes
    return { where: `AND (n.communes = '{}' OR $X = ANY(n.communes))`, params: [user.commune_id] };
  }
  return { where: 'AND FALSE', params: [] };
}

// GET / — liste des notes visibles
router.get('/', authenticate, requireReader, asyncH(async (req, res) => {
  const vis = visibilitySQL(req.user);
  let paramIdx = 1;
  const params = [];
  let whereExtra = vis.where;
  if (vis.params.length) {
    whereExtra = whereExtra.replace('$X', `$${paramIdx}`);
    params.push(...vis.params);
    paramIdx += vis.params.length;
  }
  const { rows } = await query(
    `SELECT n.*, u.prenom AS auteur_prenom, u.nom AS auteur_nom, u.role AS auteur_role,
            NOT EXISTS (SELECT 1 FROM note_proprete_lu l WHERE l.note_id = n.id AND l.utilisateur_id = $${paramIdx}) AS non_lu
     FROM note_proprete n
     JOIN utilisateur u ON u.id = n.auteur_id
     WHERE TRUE ${whereExtra}
     ORDER BY n.cree_le DESC
     LIMIT 100`,
    [...params, req.user.id]);
  res.json(rows);
}));

// GET /count — nombre de non-lues
router.get('/count', authenticate, requireReader, asyncH(async (req, res) => {
  const vis = visibilitySQL(req.user);
  let paramIdx = 1;
  const params = [];
  let whereExtra = vis.where;
  if (vis.params.length) {
    whereExtra = whereExtra.replace('$X', `$${paramIdx}`);
    params.push(...vis.params);
    paramIdx += vis.params.length;
  }
  const { rows } = await query(
    `SELECT COUNT(*)::int AS unread FROM note_proprete n
     WHERE TRUE ${whereExtra}
       AND NOT EXISTS (SELECT 1 FROM note_proprete_lu l WHERE l.note_id = n.id AND l.utilisateur_id = $${paramIdx})`,
    [...params, req.user.id]);
  res.json({ unread: rows[0].unread });
}));

// POST / — créer une note (EPIC propreté ou admin_wilaya)
router.post('/', authenticate, asyncH(async (req, res) => {
  if (!canWrite(req.user)) throw forbidden();
  const { titre, texte, niveau, communes } = req.body;
  if (!titre || !texte) throw badRequest('titre et texte requis');
  const validNiveaux = ['info', 'important', 'urgent'];
  const niv = validNiveaux.includes(niveau) ? niveau : 'info';
  const communeArr = Array.isArray(communes) ? communes : [];
  const { rows } = await query(
    `INSERT INTO note_proprete (auteur_id, titre, texte, niveau, communes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.user.id, titre, texte, niv, communeArr]);
  res.status(201).json(rows[0]);
}));

// POST /:id/lu — marquer comme lue
router.post('/:id/lu', authenticate, requireReader, asyncH(async (req, res) => {
  await query(
    `INSERT INTO note_proprete_lu (note_id, utilisateur_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [req.params.id, req.user.id]);
  res.json({ ok: true });
}));

// DELETE /:id — supprimer (auteur seulement)
router.delete('/:id', authenticate, asyncH(async (req, res) => {
  const { rows } = await query('SELECT auteur_id FROM note_proprete WHERE id = $1', [req.params.id]);
  if (!rows.length) throw notFound('Note introuvable');
  if (rows[0].auteur_id !== req.user.id) throw forbidden();
  await query('DELETE FROM note_proprete WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
