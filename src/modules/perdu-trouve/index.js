/**
 * Module Perdu-Trouvé — Déclarations citoyennes
 * Registre distinct des signalements EPIC.
 */
const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const { query } = require('../../db/pool');
const { authenticate } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, forbidden } = require('../../utils/http');
const config = require('../../config');

const router = express.Router();
const upload = multer({ dest: config.upload.dir, limits: { fileSize: config.upload.maxBytes } });

function genReference(type) {
  const prefix = type === 'perte' ? 'PER' : 'TRV';
  return prefix + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// ── Garde-fou anti-abus : 3 déclarations/jour/compte ──
async function verifierLimitePT(userId) {
  const { rows } = await query(
    "SELECT COUNT(*)::int AS n FROM declaration_perdu_trouve WHERE declarant_id=$1 AND cree_le >= CURRENT_DATE",
    [userId]);
  return rows[0].n >= 3;
}

// POST / — créer une déclaration (citoyen)
router.post('/',
  authenticate,
  upload.single('photo'),
  asyncH(async (req, res) => {
    const { type, nature, description, lieu, date_fait } = req.body;
    if (!type || !nature || !description) throw badRequest('type, nature et description requis');
    if (!['perte', 'trouve'].includes(type)) throw badRequest('type: perte ou trouve');
    if (!['document_officiel', 'objet'].includes(nature)) throw badRequest('nature: document_officiel ou objet');

    // Garde-fou
    if (await verifierLimitePT(req.user.id)) {
      return res.status(429).json({
        erreur: 'Limite de 3 déclarations par jour atteinte. Réessayez demain.',
        erreur_ar: 'تم بلوغ حد 3 تصريحات في اليوم. حاولوا مجدداً غداً.'
      });
    }

    const reference = genReference(type);
    const photoPath = req.file ? req.file.path : null;
    const { rows } = await query(
      `INSERT INTO declaration_perdu_trouve
       (reference, type, nature, description, lieu, date_fait, photo_path,
        declarant_id, declarant_nom, declarant_tel)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [reference, type, nature, description, lieu || null, date_fait || null, photoPath,
       req.user.id,
       (req.user.prenom || '') + ' ' + (req.user.nom || ''),
       req.user.telephone || null]);
    res.status(201).json(rows[0]);
  }));

// GET /mes-declarations — déclarations du citoyen connecté
router.get('/mes-declarations', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM declaration_perdu_trouve WHERE declarant_id=$1 ORDER BY cree_le DESC`,
    [req.user.id]);
  res.json(rows);
}));

// GET /registre — registre back-office (agent_traitant ou superviseur)
router.get('/registre', authenticate, asyncH(async (req, res) => {
  if (req.user.fonction !== 'agent_traitant' && req.user.fonction !== 'superviseur') {
    throw forbidden();
  }
  const { statut } = req.query;
  let sql = `SELECT d.*, u.prenom AS declarant_prenom, u.nom AS declarant_nom_u
             FROM declaration_perdu_trouve d
             LEFT JOIN utilisateur u ON u.id = d.declarant_id
             WHERE 1=1`;
  const params = [];
  if (statut) { params.push(statut); sql += ` AND d.statut = $${params.length}`; }
  sql += ' ORDER BY d.cree_le DESC LIMIT 200';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// GET /registre/count — compteur pour badge
router.get('/registre/count', authenticate, asyncH(async (req, res) => {
  if (req.user.fonction !== 'agent_traitant' && req.user.fonction !== 'superviseur') {
    throw forbidden();
  }
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM declaration_perdu_trouve WHERE statut='recue'");
  res.json({ recues: rows[0].n });
}));

// PATCH /:id — agent traite ou clôture
router.patch('/:id', authenticate, asyncH(async (req, res) => {
  if (req.user.fonction !== 'agent_traitant' && req.user.fonction !== 'superviseur') {
    throw forbidden();
  }
  const { statut, note_agent } = req.body;
  if (statut && !['traitee', 'cloturee'].includes(statut)) throw badRequest('statut: traitee ou cloturee');
  const sets = ['maj_le=NOW()']; const vals = []; let i = 1;
  if (statut) { sets.push(`statut=$${i++}`); vals.push(statut); sets.push(`traite_par=$${i++}`); vals.push(req.user.id); }
  if (note_agent !== undefined) { sets.push(`note_agent=$${i++}`); vals.push(note_agent); }
  vals.push(req.params.id);
  const { rows } = await query(
    `UPDATE declaration_perdu_trouve SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Déclaration introuvable');
  res.json(rows[0]);
}));

module.exports = router;
