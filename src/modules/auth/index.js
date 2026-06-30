const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { query } = require('../../db/pool');
const config = require('../../config');
const { validate } = require('../../middleware/validation');
const { signToken, authenticate } = require('../../middleware/auth');
const { asyncH, badRequest, unauthorized } = require('../../utils/http');

const router = express.Router();

// ── OLS Proxy Gateway ──
// OLS doesn't forward /api/equipements, /api/infos, etc.
// Gateway piggybacks on /api/auth/login (which OLS forwards).
// Frontend sends: POST /api/auth/login { _proxy: 'equipements', type: 'parking' }
async function gatewayHandler(req, res) {
  const proxy = req.body._proxy;
  const params = { ...req.body };
  delete params._proxy;

  const handlers = {
    'equipements': async () => {
      const { type, commune_id, commune, lat, lng, rayon, q, latitude, longitude } = params;
      let sql = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e
                 LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`;
      const p = [];
      if (type) { p.push(type); sql += ` AND e.type = $${p.length}`; }
      if (commune_id) { p.push(commune_id); sql += ` AND e.commune_id = $${p.length}`; }
      if (commune) { p.push('%' + commune + '%'); sql += ` AND c.nom ILIKE $${p.length}`; }
      if (q) { p.push('%' + q + '%'); sql += ` AND (e.nom ILIKE $${p.length} OR e.type ILIKE $${p.length} OR e.adresse ILIKE $${p.length})`; }
      const pLat = lat || latitude; const pLng = lng || longitude;
      if (pLat && pLng) { const r = parseFloat(rayon) || 0.02; p.push(parseFloat(pLat), parseFloat(pLng), r); sql += ` AND ABS(e.lat - $${p.length-2}) < $${p.length} AND ABS(e.lng - $${p.length-1}) < $${p.length}`; }
      sql += ' ORDER BY e.type, e.nom LIMIT 500';
      const { rows } = await query(sql, p);
      return rows;
    },
    'equipements/types': async () => {
      const { rows } = await query('SELECT DISTINCT type FROM equipement_public ORDER BY type');
      return rows.map(r => r.type);
    },
    'infos/contacts': async () => {
      let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE';
      const p = [];
      if (params.categorie) { p.push(params.categorie); sql += ` AND categorie = $${p.length}`; }
      sql += ' ORDER BY ordre, nom';
      const { rows } = await query(sql, p);
      return rows;
    },
    'infos/communiques': async () => {
      const { rows } = await query(
        `SELECT c.*, cm.nom AS commune_nom FROM communique c
         LEFT JOIN commune cm ON cm.id = c.commune_id
         WHERE c.actif = TRUE AND c.statut = 'publie'
           AND (c.date_fin IS NULL OR c.date_fin > NOW()) AND c.date_debut <= NOW()
         ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC
         LIMIT 20`);
      return rows;
    },
  };

  const handler = handlers[proxy];
  if (!handler) return res.status(400).json({ erreur: 'Module inconnu: ' + proxy });
  const data = await handler();
  res.json(data);
}

const registerSchema = z.object({
  telephone: z.string().min(9).max(20),
  motDePasse: z.string().min(6),
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().email().optional(),
  communeId: z.number().int().optional(),
});

const loginSchema = z.object({
  telephone: z.string(),
  motDePasse: z.string(),
});

// POST /api/auth/register — inscription citoyen (also gateway)
router.post('/register', async (req, res, next) => {
  if (req.body && req.body._proxy) {
    try { await gatewayHandler(req, res); } catch(e) { if (!res.headersSent) res.status(500).json({ erreur: e.message }); }
    return;
  }
  next();
}, validate(registerSchema), asyncH(async (req, res) => {
  const { telephone, motDePasse, nom, prenom, email, communeId } = req.body;
  const exists = await query('SELECT 1 FROM utilisateur WHERE telephone=$1', [telephone]);
  if (exists.rowCount) throw badRequest('Ce numéro est déjà inscrit.');

  const hash = await bcrypt.hash(motDePasse, config.bcryptRounds);
  const { rows } = await query(
    `INSERT INTO utilisateur(telephone,email,nom,prenom,mot_de_passe,commune_id,role)
     VALUES ($1,$2,$3,$4,$5,$6,'citoyen')
     RETURNING id, telephone, nom, prenom, role, commune_id, points`,
    [telephone, email || null, nom || null, prenom || null, hash, communeId || null]
  );
  const user = rows[0];
  res.status(201).json({ token: signToken(user), utilisateur: user });
}));

// Gateway route — intercepts _proxy before login validation
router.post('/login', async (req, res, next) => {
  console.log('[GW-CHECK] body:', JSON.stringify(req.body || {}).substring(0, 200));
  if (req.body && req.body._proxy) {
    console.log('[GW-HIT] proxy:', req.body._proxy);
    try {
      await gatewayHandler(req, res);
      console.log('[GW-DONE] headersSent:', res.headersSent);
    } catch(e) {
      console.error('[GW-ERR]', e.message);
      if (!res.headersSent) res.status(500).json({ erreur: e.message });
    }
    return;
  }
  next();
});

// POST /api/auth/login — actual login
router.post('/login', validate(loginSchema), asyncH(async (req, res) => {
  const { telephone, motDePasse } = req.body;
  const { rows } = await query(
    'SELECT * FROM utilisateur WHERE telephone=$1 AND actif=TRUE', [telephone]);
  if (!rows.length) throw unauthorized('Identifiants incorrects.');

  const user = rows[0];
  const ok = await bcrypt.compare(motDePasse, user.mot_de_passe);
  if (!ok) throw unauthorized('Identifiants incorrects.');

  delete user.mot_de_passe;
  res.json({ token: signToken(user), utilisateur: user });
}));

// GET /api/auth/me — profil courant
router.get('/me', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    'SELECT id,telephone,nom,prenom,email,role,commune_id,operateur_id,points FROM utilisateur WHERE id=$1',
    [req.user.id]);
  res.json(rows[0]);
}));

module.exports = router;

// PATCH /api/auth/preferences — mise à jour préférences citoyen
router.patch('/preferences', authenticate, asyncH(async (req, res) => {
  const fields = ['langue','notifications_push','notifications_sms','notifications_email',
                  'consentement_wilaya','consentement_cgu','consentement_geo','quartier','adresse'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) return res.json({ ok: true });
  vals.push(req.user.id);
  const { rows } = await query(`UPDATE utilisateur SET ${sets.join(',')} WHERE id=$${i} RETURNING
    id,telephone,nom,prenom,email,role,commune_id,points,langue,
    notifications_push,notifications_sms,notifications_email,
    consentement_wilaya,consentement_cgu,consentement_geo,quartier,adresse`, vals);
  res.json(rows[0]);
}));

// PATCH /api/auth/password — changement de mot de passe
router.patch('/password', authenticate, asyncH(async (req, res) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  if (!ancienMotDePasse || !nouveauMotDePasse) throw badRequest('Ancien et nouveau mot de passe requis.');
  if (nouveauMotDePasse.length < 6) throw badRequest('Le nouveau mot de passe doit contenir au moins 6 caractères.');

  const { rows } = await query('SELECT mot_de_passe FROM utilisateur WHERE id=$1', [req.user.id]);
  if (!rows.length) throw unauthorized('Utilisateur introuvable.');

  const ok = await bcrypt.compare(ancienMotDePasse, rows[0].mot_de_passe);
  if (!ok) throw unauthorized('Mot de passe actuel incorrect.');

  const hash = await bcrypt.hash(nouveauMotDePasse, config.bcryptRounds);
  await query('UPDATE utilisateur SET mot_de_passe=$1 WHERE id=$2', [hash, req.user.id]);
  res.json({ ok: true, message: 'Mot de passe modifié avec succès.' });
}));
