/**
 * Administration Centrale — Sprint 6
 * Référentiels, utilisateurs, configuration, journal.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../../db/pool');
const { authenticate, requireRole, ROLES, hasCapacite, hasPerimetre } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, unauthorized, forbidden } = require('../../utils/http');
const config = require('../../config');
const configEngine = require('../../services/configEngine');
const router = express.Router();

// Phase 4C — sans fallback
function requireAdminWilaya() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.fonction === 'superviseur' && hasPerimetre(req.user, 'wilaya')) return next();
    return next(forbidden());
  };
}
function requireSuperviseur() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.fonction === 'superviseur') return next();
    return next(forbidden());
  };
}
const ADMIN_GATE = requireAdminWilaya();
const SUPERVISOR_GATE = requireSuperviseur();

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
    `SELECT u.id, u.telephone, u.email, u.nom, u.prenom, u.role,
            u.fonction, u.niveau_perimetre, u.perimetre_id, u.organisation_id, u.capacites,
            u.commune_id, u.actif, u.cree_le, u.points,
            c.nom AS commune_nom, o.nom AS organisation_nom
       FROM utilisateur u
       LEFT JOIN commune c ON c.id = u.commune_id
       LEFT JOIN organisations o ON o.id = u.organisation_id
      ORDER BY u.fonction, u.nom`);
  res.json(rows);
}));

router.post('/utilisateurs', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { telephone, nom, prenom, email, role, commune_id, mot_de_passe,
          fonction, niveau_perimetre, perimetre_id, organisation_id, capacites } = req.body;
  if (!telephone || !mot_de_passe) throw badRequest('telephone et mot_de_passe requis');
  const hash = await bcrypt.hash(mot_de_passe, config.bcryptRounds);
  // Déduire le rôle legacy depuis la fonction + niveau si non fourni
  var legacyRole = role;
  if (!legacyRole && fonction) {
    if (fonction === 'superviseur' && niveau_perimetre === 'wilaya') legacyRole = 'admin_wilaya';
    else {
      var roleMap = { citoyen:'citoyen', agent_traitant:'agent', cap:'agent', entite_responsable:'operateur', superviseur:'admin_apc' };
      legacyRole = roleMap[fonction] || 'citoyen';
    }
  }
  const capsArray = Array.isArray(capacites) ? capacites : (typeof capacites === 'string' && capacites ? capacites.split(',').map(c=>c.trim()) : []);
  const { rows } = await query(
    `INSERT INTO utilisateur (telephone, nom, prenom, email, role, commune_id, mot_de_passe,
                              fonction, niveau_perimetre, perimetre_id, organisation_id, capacites)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id, telephone, nom, prenom, role, commune_id, actif,
               fonction, niveau_perimetre, perimetre_id, organisation_id, capacites`,
    [telephone, nom || null, prenom || null, email || null, legacyRole || 'citoyen', commune_id || null, hash,
     fonction || null, niveau_perimetre || null, perimetre_id || null, organisation_id || null, capsArray]);
  res.status(201).json(rows[0]);
}));

router.patch('/utilisateurs/:id', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const fields = ['nom','prenom','email','role','commune_id','actif',
                  'fonction','niveau_perimetre','perimetre_id','organisation_id'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  // Capacités : tableau PostgreSQL
  if (req.body.capacites !== undefined) {
    var caps = Array.isArray(req.body.capacites) ? req.body.capacites : (typeof req.body.capacites === 'string' ? req.body.capacites.split(',').map(c=>c.trim()) : []);
    sets.push(`capacites=$${i++}`); vals.push(caps);
  }
  if (req.body.mot_de_passe) {
    const hash = await bcrypt.hash(req.body.mot_de_passe, config.bcryptRounds);
    sets.push(`mot_de_passe=$${i++}`); vals.push(hash);
  }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE utilisateur SET ${sets.join(',')} WHERE id=$${i}
    RETURNING id, telephone, nom, prenom, role, commune_id, actif,
              fonction, niveau_perimetre, perimetre_id, organisation_id, capacites`, vals);
  if (!rows.length) throw notFound('Utilisateur introuvable');
  res.json(rows[0]);
}));

// ═══ ORGANISATIONS ═══
router.get('/organisations', authenticate, SUPERVISOR_GATE, asyncH(async (req, res) => {
  const { rows } = await query('SELECT * FROM organisations ORDER BY type, nom');
  res.json(rows);
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

// ═══ CAMPAGNES EMAIL ═══
router.post('/send-campaign', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { subject, body: htmlBody, type, quartier } = req.body;
  if (!subject || !htmlBody) throw badRequest('subject et body requis');

  // Récupérer les destinataires
  let sql = 'SELECT email FROM citizen_email_list WHERE 1=1';
  const params = [];
  if (type === 'alert') { sql += ' AND opted_in_alerts = true'; }
  else if (type === 'news') { sql += ' AND opted_in_news = true'; }
  if (quartier) { params.push(quartier); sql += ` AND quartier = $${params.length}`; }
  const { rows: recipients } = await query(sql, params);

  if (!recipients.length) return res.json({ sent: 0, failed: 0, message: 'Aucun destinataire trouvé.' });

  const { sendCampaignEmail } = require('../../services/emailService');
  const results = await sendCampaignEmail(recipients, subject, htmlBody, type || 'news');

  // Audit
  try {
    await query('INSERT INTO audit_log (user_id, action, module, new_value, created_at) VALUES ($1,$2,$3,$4,NOW())',
      [req.user.id, 'campagne_email', 'admin', subject + ' → ' + results.sent + ' envoyés']);
  } catch(e) {}

  res.json(results);
}));

// GET /admin/email-test — test connexion SMTP
router.get('/email-test', authenticate, ADMIN_GATE, asyncH(async (req, res) => {
  const { testConnection } = require('../../services/emailService');
  res.json(await testConnection());
}));

module.exports = router;
