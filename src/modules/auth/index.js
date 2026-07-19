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
    `INSERT INTO utilisateur(telephone,email,nom,prenom,mot_de_passe,commune_id,role,fonction,niveau_perimetre,capacites)
     VALUES ($1,$2,$3,$4,$5,$6,'citoyen','citoyen','commune','{}')
     RETURNING id, telephone, nom, prenom, role, commune_id, points,
               fonction, niveau_perimetre, perimetre_id, organisation_id, capacites`,
    [telephone, email || null, nom || null, prenom || null, hash, communeId || null]
  );
  const user = rows[0];

  // Générer code de confirmation 6 chiffres
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expireAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  // Marquer le compte comme non confirmé et stocker le code
  await query(
    'UPDATE utilisateur SET email_confirme = false, code_confirmation = $1, code_expire_le = $2 WHERE id = $3',
    [code, expireAt.toISOString(), user.id]);

  // Envoyer email de bienvenue avec le code
  if (email) {
    try {
      const { sendWelcomeEmail } = require('../../services/emailService');
      await sendWelcomeEmail(email, prenom || nom || '', code);
      await query(
        'INSERT INTO citizen_email_list (citizen_id, email, quartier) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING',
        [user.id, email, null]);
    } catch(e) { console.warn('[register] email send failed:', e.message); }
  }

  // Ne PAS renvoyer de token — l'utilisateur doit confirmer d'abord
  res.status(201).json({ confirmation_requise: true, telephone: telephone, message: 'Entrez le code reçu par email pour activer votre compte.' });
}));

// POST /confirm — vérifier le code de confirmation
router.post('/confirm', asyncH(async (req, res) => {
  const { telephone, code } = req.body;
  if (!telephone || !code) throw badRequest('telephone et code requis');

  const { rows } = await query(
    'SELECT id, telephone, nom, prenom, role, commune_id, points, fonction, niveau_perimetre, perimetre_id, organisation_id, capacites, code_confirmation, code_expire_le, email_confirme FROM utilisateur WHERE telephone = $1',
    [telephone]);
  if (!rows.length) throw badRequest('Compte introuvable.');
  const user = rows[0];

  if (user.email_confirme) throw badRequest('Ce compte est déjà confirmé. Connectez-vous directement.');
  if (user.code_confirmation !== code) throw badRequest('Code incorrect.');
  if (new Date(user.code_expire_le) < new Date()) throw badRequest('Code expiré. Veuillez vous réinscrire.');

  // Confirmer le compte
  await query('UPDATE utilisateur SET email_confirme = true, code_confirmation = NULL, code_expire_le = NULL WHERE id = $1', [user.id]);

  // Envoyer email de confirmation
  try {
    const { sendConfirmationEmail } = require('../../services/emailService');
    const { rows: u2 } = await query('SELECT email, prenom FROM utilisateur WHERE id = $1', [user.id]);
    if (u2[0]?.email) await sendConfirmationEmail(u2[0].email, u2[0].prenom || '');
  } catch(e) { console.error('[auth] échec email confirmation inscription:', e.message); }

  // Maintenant connecter l'utilisateur
  res.json({ token: signToken(user), utilisateur: { id: user.id, telephone: user.telephone, nom: user.nom, prenom: user.prenom, role: user.role, fonction: user.fonction } });
}));

// POST /resend-code — renvoyer un nouveau code de confirmation
router.post('/resend-code', asyncH(async (req, res) => {
  const { telephone } = req.body;
  if (!telephone) throw badRequest('telephone requis');
  const { rows } = await query('SELECT id, email, prenom, email_confirme FROM utilisateur WHERE telephone = $1', [telephone]);
  if (!rows.length) throw badRequest('Compte introuvable.');
  if (rows[0].email_confirme) throw badRequest('Ce compte est déjà confirmé.');
  if (!rows[0].email) throw badRequest('Aucun email associé à ce compte.');

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expireAt = new Date(Date.now() + 30 * 60 * 1000);
  await query('UPDATE utilisateur SET code_confirmation = $1, code_expire_le = $2 WHERE id = $3', [code, expireAt.toISOString(), rows[0].id]);

  try {
    const { sendWelcomeEmail } = require('../../services/emailService');
    await sendWelcomeEmail(rows[0].email, rows[0].prenom || '', code);
  } catch(e) { console.warn('[resend-code] email failed:', e.message); }

  res.json({ ok: true, message: 'Un nouveau code a été envoyé à votre email.' });
}));

// Gateway route — intercepts _proxy before login validation
router.post('/login', async (req, res, next) => {
  if (req.body && req.body._proxy) {
    try {
      await gatewayHandler(req, res);
    } catch(e) {
      if (!res.headersSent) res.status(500).json({ erreur: e.message });
    }
    return;
  }
  next();
});

// POST /api/auth/login — actual login (telephone OR email)
router.post('/login', validate(loginSchema), asyncH(async (req, res) => {
  const { telephone, motDePasse } = req.body;
  const isEmail = telephone && telephone.includes('@');
  const { rows } = await query(
    `SELECT u.id, u.telephone, u.nom, u.prenom, u.email, u.role,
            u.commune_id, u.operateur_id, u.points, u.mot_de_passe,
            u.fonction, u.niveau_perimetre, u.perimetre_id,
            u.organisation_id, u.capacites, u.email_confirme,
            u.niveau_compte, (u.nin IS NOT NULL) AS nin_declare, u.quartier_id,
            u.houma_lat, u.houma_lng, u.houma_refus_capture, u.adresse,
            o.nom AS organisation_nom
     FROM utilisateur u LEFT JOIN organisations o ON o.id = u.organisation_id
     WHERE ${isEmail ? 'u.email=$1' : 'u.telephone=$1'} AND u.actif=TRUE`, [telephone]);
  if (!rows.length) throw unauthorized('Identifiants incorrects.');

  const user = rows[0];
  const ok = await bcrypt.compare(motDePasse, user.mot_de_passe);
  if (!ok) throw unauthorized('Identifiants incorrects.');

  // Bloquer si le compte n'est pas confirmé
  if (user.email_confirme === false) {
    return res.status(403).json({ confirmation_requise: true, telephone: telephone, erreur: 'Votre compte n\'est pas encore confirmé. Entrez le code reçu par email.' });
  }

  delete user.mot_de_passe;
  delete user.email_confirme;
  res.json({ token: signToken(user), utilisateur: user });
}));


// POST /api/auth/google — connexion via Google OAuth
router.post('/google', asyncH(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw badRequest('credential requis');

  // Vérifier le token avec Google
  const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  const gData = await gRes.json();

  if (!gRes.ok || gData.error_description) throw badRequest('Token Google invalide');

  // Vérifier l'audience si GOOGLE_CLIENT_ID configuré
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && gData.aud !== clientId) throw badRequest('Token Google invalide (audience)');

  const { sub: googleId, email, given_name: prenom, family_name: nom, name } = gData;
  if (!email) throw badRequest('Email Google non disponible');

  // Chercher l'utilisateur par google_id ou email
  const { rows } = await query(
    `SELECT id, telephone, nom, prenom, email, role, commune_id, operateur_id, points, mot_de_passe, actif, google_id,
            fonction, niveau_perimetre, perimetre_id, organisation_id, capacites,
            niveau_compte, (nin IS NOT NULL) AS nin_declare, quartier_id,
            houma_lat, houma_lng, houma_refus_capture, adresse
     FROM utilisateur WHERE google_id=$1 OR (email=$2 AND email IS NOT NULL) ORDER BY (google_id=$1) DESC LIMIT 1`,
    [googleId, email]
  );

  let user;
  if (rows.length) {
    user = rows[0];
    // Lier google_id si pas encore fait
    if (!user.google_id) {
      await query('UPDATE utilisateur SET google_id=$1 WHERE id=$2', [googleId, user.id]);
      user.google_id = googleId;
    }
  } else {
    // Créer un nouveau compte Google
    const crypto = require('crypto');
    const hash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const telPlaceholder = `google_${googleId}`;
    const { rows: newRows } = await query(
      `INSERT INTO utilisateur(telephone, email, nom, prenom, mot_de_passe, role, google_id, email_confirme, consentement_cgu)
       VALUES($1,$2,$3,$4,$5,'citoyen',$6,true,true) RETURNING id, telephone, nom, prenom, email, role, commune_id, points, fonction, niveau_perimetre, organisation_id, capacites, niveau_compte, quartier_id`,
      [telPlaceholder, email, nom || name || '', prenom || '', hash, googleId]
    );
    user = newRows[0];

    // Email de bienvenue
    try {
      const { sendConfirmationEmail } = require('../../services/emailService');
      await sendConfirmationEmail(email, prenom || '');
    } catch(e) { console.warn('[google-auth] welcome email failed:', e.message); }
  }

  if (!user.actif) throw unauthorized('Compte désactivé.');

  delete user.mot_de_passe;
  res.json({ token: signToken(user), utilisateur: user });
}));

// GET /api/auth/me — profil courant
router.get('/me', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.telephone, u.nom, u.prenom, u.email, u.role,
            u.commune_id, u.operateur_id, u.points,
            u.fonction, u.niveau_perimetre, u.perimetre_id,
            u.organisation_id, u.capacites,
            u.niveau_compte, (u.nin IS NOT NULL) AS nin_declare, u.quartier_id,
            u.houma_lat, u.houma_lng, u.houma_refus_capture,
            u.adresse,
            o.nom AS organisation_nom,
            c.nom AS commune_nom, c.nom_ar AS commune_nom_ar,
            q.nom AS quartier_nom, q.nom_ar AS quartier_nom_ar
     FROM utilisateur u
     LEFT JOIN organisations o ON o.id = u.organisation_id
     LEFT JOIN commune c ON c.id = u.commune_id
     LEFT JOIN quartier q ON q.id = u.quartier_id
     WHERE u.id = $1`,
    [req.user.id]);
  res.json(rows[0]);
}));

// POST /api/auth/forgot — demande de réinitialisation (identifiant = tel ou email)
router.post('/forgot', asyncH(async (req, res) => {
  const { identifiant } = req.body;
  if (!identifiant) return res.json({ ok: true }); // neutre
  const isEmail = identifiant.includes('@');
  const { rows } = await query(
    `SELECT id, email, prenom FROM utilisateur WHERE ${isEmail ? 'email=$1' : 'telephone=$1'} AND actif=TRUE`, [identifiant]);
  // Toujours répondre neutre (ne pas révéler si le compte existe)
  if (!rows.length || !rows[0].email) return res.json({ ok: true, message: 'Si ce compte existe et possède un email, un lien a été envoyé.' });
  const user = rows[0];
  // Generate token
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expire = new Date(Date.now() + 3600000); // 1h
  await query('UPDATE utilisateur SET reset_token=$1, reset_expire=$2 WHERE id=$3', [token, expire, user.id]);
  // Send email
  const { sendResetEmail } = require('../../services/emailService');
  await sendResetEmail(user.email, user.prenom || '', token);
  res.json({ ok: true, message: 'Si ce compte existe et possède un email, un lien a été envoyé.' });
}));

// POST /api/auth/reset — appliquer le nouveau mot de passe
router.post('/reset', asyncH(async (req, res) => {
  const { token, motDePasse } = req.body;
  if (!token || !motDePasse || motDePasse.length < 6) return res.status(400).json({ erreur: 'Token et mot de passe (min 6 car.) requis.' });
  const { rows } = await query('SELECT id FROM utilisateur WHERE reset_token=$1 AND reset_expire > NOW()', [token]);
  if (!rows.length) return res.status(400).json({ erreur: 'Lien expiré ou invalide. Refaites une demande.' });
  const hash = await bcrypt.hash(motDePasse, config.bcryptRounds);
  await query('UPDATE utilisateur SET mot_de_passe=$1, reset_token=NULL, reset_expire=NULL WHERE id=$2', [hash, rows[0].id]);
  res.json({ ok: true });
}));

module.exports = router;

// PATCH /api/auth/preferences — mise à jour préférences citoyen
router.patch('/preferences', authenticate, asyncH(async (req, res) => {
  const fields = ['langue','notifications_push','notifications_sms','notifications_email',
                  'consentement_wilaya','consentement_cgu','consentement_geo','adresse',
                  'quartier_id','houma_lat','houma_lng','houma_refus_capture'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) return res.json({ ok: true });
  vals.push(req.user.id);
  const { rows } = await query(`UPDATE utilisateur SET ${sets.join(',')} WHERE id=$${i} RETURNING
    id,telephone,nom,prenom,email,role,commune_id,points,langue,
    notifications_push,notifications_sms,notifications_email,
    consentement_wilaya,consentement_cgu,consentement_geo,adresse,
    quartier_id,houma_lat,houma_lng,houma_refus_capture,niveau_compte,nin,
    fonction,niveau_perimetre,perimetre_id,organisation_id,capacites`, vals);
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

// PATCH /api/auth/nin — déclarer son NIN (18 chiffres, unique, auto level-up)
router.patch('/nin', authenticate, asyncH(async (req, res) => {
  const { nin } = req.body;
  if (!nin) throw badRequest('NIN requis.');
  if (!/^\d{18}$/.test(nin)) {
    return res.status(400).json({
      erreur: 'Le NIN doit contenir exactement 18 chiffres.',
      erreur_ar: 'رقم التعريف الوطني يجب أن يتكون من 18 رقماً بالضبط.'
    });
  }
  // Unicité
  const { rows: dup } = await query('SELECT id FROM utilisateur WHERE nin=$1 AND id != $2', [nin, req.user.id]);
  if (dup.length) {
    return res.status(409).json({
      erreur: 'Ce NIN est déjà associé à un autre compte.',
      erreur_ar: 'رقم التعريف الوطني مرتبط بحساب آخر.'
    });
  }
  // Enregistrer et passer au niveau 2
  const { rows } = await query(
    `UPDATE utilisateur SET nin=$1, niveau_compte=2 WHERE id=$2
     RETURNING id, nin, niveau_compte`, [nin, req.user.id]);
  res.json(rows[0]);
}));

// GET /api/auth/quota — statut quota signalements du citoyen connecté
router.get('/quota', authenticate, asyncH(async (req, res) => {
  const { rows: u } = await query('SELECT niveau_compte FROM utilisateur WHERE id=$1', [req.user.id]);
  const niveau = u[0]?.niveau_compte || 1;

  if (niveau >= 2) {
    // Niveau 2 : 5 par jour
    const { rows } = await query(
      "SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id=$1 AND cree_le >= CURRENT_DATE",
      [req.user.id]);
    res.json({ niveau, limite: 5, periode: 'jour', utilises: rows[0].n, restants: Math.max(0, 5 - rows[0].n) });
  } else {
    // Niveau 1 : 5 par mois calendaire
    const { rows } = await query(
      "SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id=$1 AND cree_le >= date_trunc('month', CURRENT_DATE)",
      [req.user.id]);
    res.json({ niveau, limite: 5, periode: 'mois', utilises: rows[0].n, restants: Math.max(0, 5 - rows[0].n) });
  }
}));
