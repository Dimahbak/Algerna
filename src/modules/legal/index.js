const express = require('express');
const { query } = require('../../db/pool');
const { authenticate } = require('../../middleware/auth');
const { asyncH, badRequest } = require('../../utils/http');
const router = express.Router();

// POST /api/legal/consent — enregistrer un consentement
router.post('/consent', authenticate, asyncH(async (req, res) => {
  const { consent_type, accepted, version_doc } = req.body;
  if (!consent_type) throw badRequest('consent_type requis');
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const ua = req.headers['user-agent'] || null;
  const { rows } = await query(
    `INSERT INTO consentement_log (utilisateur_id, consent_type, accepted, ip_address, user_agent, version_doc)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, consent_type, accepted !== false, ip, ua, version_doc || '1.0']);
  res.status(201).json(rows[0]);
}));

// GET /api/legal/consent — mes consentements
router.get('/consent', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM consentement_log WHERE utilisateur_id=$1 ORDER BY accepted_at DESC', [req.user.id]);
  res.json(rows);
}));

// GET /api/legal/export — exporter mes données (RGPD)
router.get('/export', authenticate, asyncH(async (req, res) => {
  const uid = req.user.id;
  const [user, sigs, rdvs, points, badges, impact, consents] = await Promise.all([
    query('SELECT id,telephone,nom,prenom,email,role,commune_id,points,cree_le FROM utilisateur WHERE id=$1', [uid]),
    query('SELECT id,reference,domaine,description,etat,cree_le,resolu_le FROM signalement WHERE citoyen_id=$1', [uid]),
    query('SELECT r.id,r.numero_ticket,r.statut,r.cree_le,c.debut,s.nom AS service FROM rdv r JOIN creneau c ON c.id=r.creneau_id JOIN service s ON s.id=c.service_id WHERE r.citoyen_id=$1', [uid]),
    query('SELECT delta,motif,le FROM points_journal WHERE citoyen_id=$1 ORDER BY le DESC', [uid]),
    query('SELECT b.nom,b.code,ub.obtenu_le FROM utilisateur_badge ub JOIN badge b ON b.id=ub.badge_id WHERE ub.utilisateur_id=$1', [uid]),
    query('SELECT message,cree_le FROM impact_message WHERE citoyen_id=$1', [uid]),
    query('SELECT consent_type,accepted,accepted_at,version_doc FROM consentement_log WHERE utilisateur_id=$1', [uid]),
  ]);
  res.json({
    profil: user.rows[0],
    signalements: sigs.rows,
    rdv: rdvs.rows,
    points: points.rows,
    badges: badges.rows,
    impact: impact.rows,
    consentements: consents.rows,
    exporte_le: new Date().toISOString(),
  });
}));

// POST /api/legal/delete-request — demande de suppression
router.post('/delete-request', authenticate, asyncH(async (req, res) => {
  // Log la demande dans audit_log (la suppression effective nécessite validation admin)
  await query(
    `INSERT INTO audit_log (action, user_id, module, new_value)
     VALUES ('delete_request', $1, 'legal', '{"status":"pending"}'::jsonb)`, [req.user.id]);
  res.json({ message: 'Votre demande de suppression a été enregistrée. Vous serez contacté sous 30 jours.' });
}));

module.exports = router;
