const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, notFound } = require('../../utils/http');
const router = express.Router();

// GET /api/notifications — mes notifications
router.get('/', authenticate, asyncH(async (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM notification WHERE utilisateur_id=$1';
  const params = [req.user.id];
  if (type) { params.push(type); sql += ` AND type=$${params.length}`; }
  sql += ' ORDER BY cree_le DESC LIMIT 50';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// GET /api/notifications/count — non lues
router.get('/count', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS n FROM notification WHERE utilisateur_id=$1 AND lu=FALSE', [req.user.id]);
  res.json({ unread: rows[0].n });
}));

// PATCH /api/notifications/:id/lu — marquer comme lu
router.patch('/:id/lu', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    'UPDATE notification SET lu=TRUE WHERE id=$1 AND utilisateur_id=$2 RETURNING *',
    [req.params.id, req.user.id]);
  if (!rows.length) throw notFound('Notification introuvable');
  res.json(rows[0]);
}));

// PATCH /api/notifications/lire-tout — tout marquer comme lu
router.patch('/lire-tout', authenticate, asyncH(async (req, res) => {
  await query('UPDATE notification SET lu=TRUE WHERE utilisateur_id=$1 AND lu=FALSE', [req.user.id]);
  res.json({ ok: true });
}));

module.exports = router;
