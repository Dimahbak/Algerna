/**
 * Administration Centrale — Sprint 6
 * Référentiels, utilisateurs, configuration, journal.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../../db/pool');
const { authenticate, requireRole, ROLES } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');
const config = require('../../config');
const configEngine = require('../../services/configEngine');
const router = express.Router();

const ADMIN_GATE = requireRole('admin_wilaya');
const SUPERVISOR_GATE = requireRole('admin_apc', 'admin_wilaya');

// ═══ CONFIGURATION SYSTÈME ═══
router.get('/config', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  res.json(await configEngine.getAll());
}));

router.patch('/config/:cle', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { valeur } = req.body;
  if (valeur === undefined) throw badRequest('valeur requis');
  await configEngine.set(req.params.cle, valeur, req.user.id);
  // Audit
  try { await query('INSERT INTO audit_log (user_id, action, module, new_value, created_at) VALUES ($1,$2,$3,$4,NOW())',
    [req.user.id, 'config_modifie', 'admin', req.params.cle + '=' + valeur]); } catch(e) {}
  res.json({ ok: true, cle: req.params.cle, valeur });
}));

// ═══ COMMUNES ═══
router.get('/communes', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, ci.nom AS circonscription_nom FROM commune c
     LEFT JOIN circonscription ci ON ci.id = c.circonscription_id
     ORDER BY c.nom`);
  res.json(rows);
}));

router.patch('/communes/:id', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const fields = ['nom','nom_ar','code','actif'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE commune SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Commune introuvable');
  res.json(rows[0]);
}));

// ═══ SERVICES (EPIC) ═══
router.get('/services', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { rows } = await query('SELECT * FROM epic ORDER BY categorie, sigle');
  res.json(rows);
}));

router.post('/services', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { sigle, nom, categorie, description } = req.body;
  if (!sigle || !nom) throw badRequest('sigle et nom requis');
  const { rows } = await query(
    'INSERT INTO epic (sigle, nom, categorie, description) VALUES ($1,$2,$3,$4) RETURNING *',
    [sigle, nom, categorie || null, description || null]);
  res.status(201).json(rows[0]);
}));

router.patch('/services/:id', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const fields = ['sigle','nom','categorie','description','actif'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE epic SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Service introuvable');
  res.json(rows[0]);
}));

// ═══ CATÉGORIES SIGNALEMENT ═══
router.get('/categories', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { rows } = await query('SELECT * FROM categorie_signal ORDER BY famille, groupe, libelle');
  res.json(rows);
}));

router.patch('/categories/:id', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const fields = ['libelle','libelle_ar','famille','groupe','criticite','epic_id','keywords'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE categorie_signal SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Catégorie introuvable');
  res.json(rows[0]);
}));

// ═══ ENGAGEMENTS DE SERVICE ═══
router.get('/engagements', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT es.*, cs.libelle AS categorie_nom FROM engagement_service es
     LEFT JOIN categorie_signal cs ON cs.id = es.categorie_id
     ORDER BY es.famille, es.id`);
  res.json(rows);
}));

router.post('/engagements', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { categorie_id, famille, delai_cible_h, seuil_vigilance_pct, seuil_depassement_pct } = req.body;
  const { rows } = await query(
    `INSERT INTO engagement_service (categorie_id, famille, delai_cible_h, seuil_vigilance_pct, seuil_depassement_pct)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [categorie_id || null, famille || null, delai_cible_h || 48, seuil_vigilance_pct || 75, seuil_depassement_pct || 100]);
  res.status(201).json(rows[0]);
}));

router.patch('/engagements/:id', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const fields = ['delai_cible_h','seuil_vigilance_pct','seuil_depassement_pct','actif'];
  const sets = ['modifie_le=NOW()']; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE engagement_service SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Engagement introuvable');
  res.json(rows[0]);
}));

// ═══ UTILISATEURS ═══
router.get('/utilisateurs', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.telephone, u.email, u.nom, u.prenom, u.role, u.commune_id, u.actif, u.cree_le, u.points,
            c.nom AS commune_nom
       FROM utilisateur u
       LEFT JOIN commune c ON c.id = u.commune_id
      ORDER BY u.role, u.nom`);
  res.json(rows);
}));

router.post('/utilisateurs', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { telephone, nom, prenom, email, role, commune_id, mot_de_passe } = req.body;
  if (!telephone || !mot_de_passe) throw badRequest('telephone et mot_de_passe requis');
  const hash = await bcrypt.hash(mot_de_passe, config.bcryptRounds);
  const { rows } = await query(
    `INSERT INTO utilisateur (telephone, nom, prenom, email, role, commune_id, mot_de_passe)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, telephone, nom, prenom, role, commune_id, actif`,
    [telephone, nom || null, prenom || null, email || null, role || 'citoyen', commune_id || null, hash]);
  res.status(201).json(rows[0]);
}));

router.patch('/utilisateurs/:id', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const fields = ['nom','prenom','email','role','commune_id','actif'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (req.body.mot_de_passe) {
    const hash = await bcrypt.hash(req.body.mot_de_passe, config.bcryptRounds);
    sets.push(`mot_de_passe=$${i++}`); vals.push(hash);
  }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE utilisateur SET ${sets.join(',')} WHERE id=$${i}
    RETURNING id, telephone, nom, prenom, role, commune_id, actif`, vals);
  if (!rows.length) throw notFound('Utilisateur introuvable');
  res.json(rows[0]);
}));

// ═══ CATALOGUE MISSIONS CAP ═══
router.get('/catalogue-cap', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { rows } = await query('SELECT * FROM catalogue_mission_cap ORDER BY categorie, nom');
  res.json(rows);
}));

router.post('/catalogue-cap', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { categorie, nom, description, photo_obligatoire, geo_obligatoire, commentaire_obligatoire } = req.body;
  if (!categorie || !nom) throw badRequest('categorie et nom requis');
  const { rows } = await query(
    `INSERT INTO catalogue_mission_cap (categorie, nom, description, photo_obligatoire, geo_obligatoire, commentaire_obligatoire)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [categorie, nom, description || null, photo_obligatoire !== false, geo_obligatoire !== false, commentaire_obligatoire !== false]);
  res.status(201).json(rows[0]);
}));

router.patch('/catalogue-cap/:id', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const fields = ['categorie','nom','description','photo_obligatoire','geo_obligatoire','commentaire_obligatoire','actif'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE catalogue_mission_cap SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Mission introuvable');
  res.json(rows[0]);
}));

// ═══ JOURNAL SYSTÈME ═══
router.get('/journal', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { module: mod, user_id, limit: lim } = req.query;
  let sql = `SELECT al.*, u.prenom, u.nom, u.role
               FROM audit_log al
               LEFT JOIN utilisateur u ON u.id = al.user_id
              WHERE 1=1`;
  const p = [];
  if (mod) { p.push(mod); sql += ` AND al.module = $${p.length}`; }
  if (user_id) { p.push(user_id); sql += ` AND al.user_id = $${p.length}`; }
  sql += ` ORDER BY al.created_at DESC LIMIT ${parseInt(lim) || 50}`;
  const { rows } = await query(sql, p);
  res.json(rows);
}));

// ═══ RÔLES ═══
router.get('/roles', authenticate, SUPERVISOR_GATE, (req, res) => {
  res.json([
    { code: 'citoyen', label_fr: 'Citoyen', label_ar: 'مواطن' },
    { code: 'agent', label_fr: 'Agent', label_ar: 'عون' },
    { code: 'operateur', label_fr: 'Opérateur', label_ar: 'مشغل' },
    { code: 'admin_apc', label_fr: 'Responsable APC', label_ar: 'مسؤول البلدية' },
    { code: 'admin_wilaya', label_fr: 'Responsable Wilaya', label_ar: 'مسؤول الولاية' },
  ]);
});

module.exports = router;
