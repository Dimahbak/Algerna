/**
 * Module Quartiers — Alger Propre 2030
 * Référentiel quartiers + créneaux de dépôt des déchets
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, forbidden } = require('../../utils/http');

const router = express.Router();

// ── Auth helpers ──
function isWilaya(user) { return user.role === 'admin_wilaya'; }
function isCommune(user) { return user.role === 'admin_apc' && !!user.commune_id; }
function requireSuperviseur(req, res, next) {
  if (!req.user) return next(forbidden());
  if (isWilaya(req.user) || isCommune(req.user)) return next();
  return next(forbidden());
}

// ══════════════════════════════════════════════════════════
// QUARTIERS
// ══════════════════════════════════════════════════════════

// GET / — liste des quartiers (filtré par commune pour admin_apc)
router.get('/', authenticate, requireSuperviseur, asyncH(async (req, res) => {
  const where = ['1=1'];
  const vals = [];
  let i = 1;
  if (isCommune(req.user)) {
    where.push(`q.commune_id = $${i++}`);
    vals.push(req.user.commune_id);
  } else if (req.query.commune_id) {
    where.push(`q.commune_id = $${i++}`);
    vals.push(Number(req.query.commune_id));
  }
  if (req.query.statut) {
    where.push(`q.statut = $${i++}`);
    vals.push(req.query.statut);
  }
  const { rows } = await query(
    `SELECT q.*, c.nom AS commune_nom, c.nom_ar AS commune_nom_ar,
      (SELECT COUNT(*)::int FROM creneau_depot cd WHERE cd.quartier_id = q.id) AS nb_creneaux
     FROM quartier q
     LEFT JOIN commune c ON c.id = q.commune_id
     WHERE ${where.join(' AND ')}
     ORDER BY c.nom, q.nom`, vals);
  res.json(rows);
}));

// ══════════════════════════════════════════════════════════
// CITOYEN — Propreté Mon Quartier (avant /:id pour éviter le conflit)
// ══════════════════════════════════════════════════════════

// GET /public/communes/:cid — quartiers actifs d'une commune (tout utilisateur authentifié)
router.get('/public/communes/:cid', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT id, nom, nom_ar FROM quartier WHERE commune_id = $1 AND statut = 'actif' ORDER BY nom`,
    [req.params.cid]);
  res.json(rows);
}));

// GET /mon-quartier — quartier + créneaux du citoyen connecté
router.get('/mon-quartier', authenticate, asyncH(async (req, res) => {
  const { rows: u } = await query('SELECT quartier_id, rappel_proprete FROM utilisateur WHERE id=$1', [req.user.id]);
  if (!u.length || !u[0].quartier_id) return res.json({ quartier: null, rappel: u.length ? u[0].rappel_proprete : true });
  const { rows } = await query(
    `SELECT q.*, c.nom AS commune_nom, c.nom_ar AS commune_nom_ar
     FROM quartier q LEFT JOIN commune c ON c.id = q.commune_id WHERE q.id = $1`, [u[0].quartier_id]);
  if (!rows.length) return res.json({ quartier: null, rappel: u[0].rappel_proprete });
  const { rows: creneaux } = await query(
    'SELECT * FROM creneau_depot WHERE quartier_id = $1 ORDER BY jour, heure_debut', [u[0].quartier_id]);
  res.json({ quartier: { ...rows[0], creneaux }, rappel: u[0].rappel_proprete });
}));

// PATCH /mon-quartier — choisir/changer son quartier
router.patch('/mon-quartier', authenticate, asyncH(async (req, res) => {
  const { quartier_id } = req.body;
  if (quartier_id !== null && quartier_id !== undefined) {
    const { rows: q } = await query("SELECT id FROM quartier WHERE id=$1 AND statut='actif'", [quartier_id]);
    if (!q.length) throw badRequest('Quartier introuvable ou inactif');
  }
  await query('UPDATE utilisateur SET quartier_id=$1 WHERE id=$2', [quartier_id || null, req.user.id]);
  res.json({ ok: true });
}));

// PATCH /rappel — réglage des rappels propreté (tous / utiles / aucun)
router.patch('/rappel', authenticate, asyncH(async (req, res) => {
  const { mode } = req.body;
  const valid = ['tous', 'utiles', 'aucun'];
  if (!valid.includes(mode)) throw badRequest('Mode invalide');
  await query('UPDATE utilisateur SET rappel_proprete=$1 WHERE id=$2', [mode, req.user.id]);
  res.json({ ok: true, rappel: mode });
}));

// GET /:id — fiche quartier avec créneaux
router.get('/:id', authenticate, requireSuperviseur, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT q.*, c.nom AS commune_nom, c.nom_ar AS commune_nom_ar
     FROM quartier q LEFT JOIN commune c ON c.id = q.commune_id
     WHERE q.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Quartier introuvable');
  // Cloisonnement commune
  if (isCommune(req.user) && rows[0].commune_id !== req.user.commune_id) throw forbidden();
  const { rows: creneaux } = await query(
    `SELECT * FROM creneau_depot WHERE quartier_id = $1 ORDER BY jour, heure_debut`, [req.params.id]);
  res.json({ ...rows[0], creneaux });
}));

// POST / — créer un quartier (Wilaya uniquement)
router.post('/', authenticate, asyncH(async (req, res) => {
  if (!isWilaya(req.user)) throw forbidden();
  const { nom, nom_ar, commune_id, perimetre, source } = req.body;
  if (!nom || !commune_id) throw badRequest('nom et commune_id requis');
  const { rows } = await query(
    `INSERT INTO quartier (nom, nom_ar, commune_id, perimetre, source)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [nom, nom_ar || null, commune_id, perimetre ? JSON.stringify(perimetre) : null, source || 'officiel']);
  res.status(201).json(rows[0]);
}));

// PATCH /:id — modifier un quartier (Wilaya uniquement)
router.patch('/:id', authenticate, asyncH(async (req, res) => {
  if (!isWilaya(req.user)) throw forbidden();
  const { rows: old } = await query('SELECT * FROM quartier WHERE id=$1', [req.params.id]);
  if (!old.length) throw notFound('Quartier introuvable');
  const fields = ['nom', 'nom_ar', 'commune_id', 'perimetre', 'statut', 'source'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      const v = f === 'perimetre' ? JSON.stringify(req.body[f]) : req.body[f];
      sets.push(`${f} = $${i++}`);
      vals.push(v);
    }
  }
  if (!sets.length) throw badRequest('Rien à modifier');
  sets.push(`maj_le = NOW()`);
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE quartier SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  res.json(rows[0]);
}));

// ══════════════════════════════════════════════════════════
// CRÉNEAUX DE DÉPÔT
// ══════════════════════════════════════════════════════════

// PUT /:id/creneaux — remplace tous les créneaux d'un quartier (Wilaya uniquement)
router.put('/:id/creneaux', authenticate, asyncH(async (req, res) => {
  if (!isWilaya(req.user)) throw forbidden();
  const { rows: qr } = await query('SELECT id FROM quartier WHERE id=$1', [req.params.id]);
  if (!qr.length) throw notFound('Quartier introuvable');
  const creneaux = req.body.creneaux;
  if (!Array.isArray(creneaux)) throw badRequest('creneaux doit être un tableau');
  // Validate each
  for (const c of creneaux) {
    if (c.jour === undefined || !c.heure_debut || !c.heure_fin || !c.type_collecte) {
      throw badRequest('Chaque créneau doit avoir jour, heure_debut, heure_fin, type_collecte');
    }
    if (!['menagers', 'tri', 'encombrants'].includes(c.type_collecte)) {
      throw badRequest('type_collecte invalide: ' + c.type_collecte);
    }
  }
  // Replace all
  await query('DELETE FROM creneau_depot WHERE quartier_id = $1', [req.params.id]);
  for (const c of creneaux) {
    await query(
      `INSERT INTO creneau_depot (quartier_id, jour, heure_debut, heure_fin, type_collecte)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, c.jour, c.heure_debut, c.heure_fin, c.type_collecte]);
  }
  const { rows } = await query(
    'SELECT * FROM creneau_depot WHERE quartier_id = $1 ORDER BY jour, heure_debut', [req.params.id]);
  res.json(rows);
}));

module.exports = router;
