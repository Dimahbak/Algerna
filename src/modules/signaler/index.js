/**
 * Module SIGNALER — Double chemin de signalement unifié.
 *
 * Porte 1 (guidé)  : familles → sous-cas → formulaire
 * Porte 2 (direct)  : choix EPIC → formulaire
 *
 * Le routage catégorie → EPIC est invisible pour le citoyen.
 * Mapping :
 *   eau            → Direction Eau (epic 17)
 *   espaces_verts  → Direction Espaces Verts (epic 3)
 *   eclairage      → Direction Éclairage (epic 8)
 *   voirie         → Direction Voirie (epic 30)
 *   proprete       → Dir. Propreté Centre (epic 1) si commune.zone='centre',
 *                    Dir. Propreté Périph. (epic 2) si commune.zone='peripherie'
 *   stationnement  → EPIC Parkings (epic 31)
 *   autre          → file de TRI HUMAIN (epic_id = NULL)
 *
 * Le champ commune.zone contrôle le routage déchets/propreté.
 * Par défaut toutes les communes sont en 'centre' (→ Dir. Propreté Centre).
 * Pour ajuster :
 *   UPDATE commune SET zone='peripherie' WHERE nom IN ('Baraki','Birtouta',...);
 */
const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { query, withTransaction } = require('../../db/pool');
const { validate } = require('../../middleware/validation');
const { authenticate, requireRole, requireFonction, hasFonction, hasPerimetre } = require('../../middleware/auth');
const { asyncH, makeReference, badRequest } = require('../../utils/http');
const config = require('../../config');

const router = express.Router();
const upload = multer({ dest: config.upload.dir, limits: { fileSize: config.upload.maxBytes } });

// ── Quota KYC (niveaux de compte) ──
// Niveau 1 : 5/mois calendaire. Niveau 2+ : 5/jour. Filet 15/jour inchangé après.
async function verifierQuotaKYC(citoyenId, res) {
  const { rows: u } = await query('SELECT niveau_compte FROM utilisateur WHERE id=$1', [citoyenId]);
  const niveau = u[0]?.niveau_compte || 1;

  if (niveau >= 2) {
    const { rows } = await query(
      "SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id=$1 AND cree_le >= CURRENT_DATE", [citoyenId]);
    if (rows[0].n >= 5) {
      return res.status(429).json({
        erreur: 'Limite quotidienne atteinte (5 signalements par jour). Réessayez demain.',
        erreur_ar: 'تم بلوغ الحد اليومي (5 بلاغات في اليوم). حاول مجدداً غداً.',
        code: 'QUOTA_JOUR'
      });
    }
  } else {
    const { rows } = await query(
      "SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id=$1 AND cree_le >= date_trunc('month', CURRENT_DATE)", [citoyenId]);
    if (rows[0].n >= 5) {
      // Premier signalement d'un compte neuf : on vérifie s'il en a déjà au moins 1
      // Le message incite sans obliger
      return res.status(429).json({
        erreur: 'Vous avez atteint la limite de 5 signalements ce mois-ci. Vérifiez votre compte pour débloquer tous les services.',
        erreur_ar: 'لقد بلغت حد 5 بلاغات هذا الشهر. قم بتوثيق حسابك لفتح جميع الخدمات.',
        code: 'QUOTA_MOIS',
        avantages_niveau2: [
          { fr: '5 signalements par jour au lieu de 5 par mois', ar: '5 بلاغات في اليوم بدل 5 في الشهر' },
          { fr: 'Suivi prioritaire de vos dossiers', ar: 'متابعة ذات أولوية لملفاتكم' },
          { fr: 'Accès aux statistiques détaillées', ar: 'الوصول إلى الإحصائيات المفصلة' }
        ]
      });
    }
  }
  return null; // OK, pas de blocage
}

// Vérifie qu'un superviseur communal accède à un dossier de sa commune
async function checkCommuneAccess(req, signalementId) {
  if (!hasPerimetre(req.user, 'commune') || !req.user.commune_id) return true;
  const { rows } = await query('SELECT commune_id FROM signalement WHERE id=$1', [signalementId]);
  if (!rows.length) return true; // 404 géré plus loin
  return rows[0].commune_id === req.user.commune_id;
}

// Phase 3B — dual-mode : nouveau modèle avec fallback ancien
const STAFF_FONCTIONS = ['agent_traitant', 'cap', 'entite_responsable', 'superviseur'];
function requireStaff() {
  return (req, res, next) => {
    if (!req.user) return next(require('../../utils/http').unauthorized());
    if (req.user.fonction && STAFF_FONCTIONS.includes(req.user.fonction)) return next();
    return next(require('../../utils/http').forbidden());
  };
}

// ── EPIC IDs pour le routage propreté par zone ──
const EPIC_PRO_CENTRE = 1;
const EPIC_PRO_PERIPH = 2;

const { awardPoints } = require('../../utils/points');

// ── GET /familles — catégories groupées par famille pour le chemin guidé ──
router.get('/familles', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT cs.id, cs.domaine, cs.libelle, cs.libelle_ar, cs.criticite,
            cs.epic_id, cs.famille, cs.groupe, cs.keywords,
            e.sigle AS epic_sigle
       FROM categorie_signal cs
       LEFT JOIN epic e ON e.id = cs.epic_id AND e.actif = TRUE
      WHERE cs.famille IS NOT NULL
      ORDER BY cs.famille, cs.groupe, cs.id`
  );

  // Grouper par famille
  const familles = {};
  for (const r of rows) {
    if (!familles[r.famille]) familles[r.famille] = [];
    familles[r.famille].push(r);
  }
  res.json(familles);
}));

// ── GET /epics — liste des EPIC pour le chemin direct ──
router.get('/epics', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT id, sigle, nom, categorie, description
       FROM epic WHERE actif = TRUE
      ORDER BY sigle`
  );
  res.json(rows);
}));

// ── Moteur de routage catégorie → EPIC ──
// Lit categorie_signal.epic_id en base. Seul cas spécial : propreté sans epic_id
// (routage dynamique par zone commune centre/périphérie).
async function routerEpic(categorieId, communeId) {
  const { rows: catRows } = await query(
    'SELECT epic_id, famille FROM categorie_signal WHERE id = $1', [categorieId]);
  if (!catRows.length) return { epicId: null, triHumain: false };

  const cat = catRows[0];

  // 1. La catégorie a un epic_id en base → routage direct
  if (cat.epic_id) return { epicId: cat.epic_id, triHumain: false };

  // 2. Famille "autre" → tri humain intentionnel
  if (cat.famille === 'autre') return { epicId: null, triHumain: true };

  // 3. Propreté sans epic_id → routage par zone commune (centre/périphérie)
  if (cat.famille === 'proprete') {
    if (!communeId) {
      console.warn(`[ROUTAGE] Commune absente pour catégorie ${categorieId} — fallback Direction Propreté Centre`);
      return { epicId: EPIC_PRO_CENTRE, triHumain: false };
    }
    const { rows: comRows } = await query('SELECT zone FROM commune WHERE id = $1', [communeId]);
    const zone = comRows.length ? comRows[0].zone : 'centre';
    return { epicId: (zone === 'peripherie' ? EPIC_PRO_PERIPH : EPIC_PRO_CENTRE), triHumain: false };
  }

  // 4. Catégorie sans epic_id et hors cas spéciaux → échec de routage
  return { epicId: null, triHumain: false };
}

// ── POST /signalements — soumission unifiée ──
const creerSchema = z.object({
  categorieId: z.coerce.number().int(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  communeId: z.coerce.number().int().optional(),
  description: z.string().max(1000).optional(),
  gravite: z.enum(['danger_immediat', 'risque_blessure', 'degradation']).optional(),
});

// GET /doublons — détection de signalement similaire à proximité
router.get('/doublons', authenticate, asyncH(async (req, res) => {
  const { famille, lat, lng } = req.query;
  if (!famille || !lat || !lng) return res.json({ doublon: null });
  const fLat = parseFloat(lat); const fLng = parseFloat(lng);
  if (!fLat || !fLng) return res.json({ doublon: null });
  // Chercher un signalement de la même famille dans un rayon ~200m (0.002 degré ≈ 222m)
  const { rows } = await query(
    `SELECT s.id, s.reference, s.description, s.etat, s.cree_le, cs.libelle AS categorie,
            c.nom AS commune_nom, s.photo_path
       FROM signalement s
       JOIN categorie_signal cs ON cs.id = s.categorie_id
       LEFT JOIN commune c ON c.id = s.commune_id
      WHERE cs.famille = $1
        AND s.etat NOT IN ('resolu','rejete')
        AND ABS(s.lat - $2) < 0.002 AND ABS(s.lng - $3) < 0.002
      ORDER BY s.cree_le DESC LIMIT 1`,
    [famille, fLat, fLng]);
  res.json({ doublon: rows[0] || null });
}));

// POST /signalements/rapide — parcours simplifié (famille au lieu de categorieId)
router.post('/signalements/rapide',
  authenticate,
  upload.single('photo'),
  asyncH(async (req, res) => {
    const { famille, lat, lng, communeId, description } = req.body;
    if (!famille) throw badRequest('famille requis');
    const citoyenId = req.user.id;
    const photoPath = req.file ? req.file.path : null;

    // Quota KYC (5/mois N1, 5/jour N2) puis filet 15/jour
    if (req.user.fonction === 'citoyen' || req.user.role === 'citoyen') {
      const quotaBlock = await verifierQuotaKYC(citoyenId, res);
      if (quotaBlock) return;
      // Filet de sécurité anti-abus (15/jour, dernier recours)
      const { rows: countRows } = await query(
        "SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id = $1 AND cree_le >= CURRENT_DATE",
        [citoyenId]);
      if (countRows[0].n >= 15) {
        return res.status(429).json({ erreur: 'Limite quotidienne de signalements atteinte (15 par jour). Réessayez demain.' });
      }
    }

    // Trouver la première catégorie de la famille (l'agent affinera ensuite)
    const { rows: catRows } = await query(
      'SELECT id, famille FROM categorie_signal WHERE famille = $1 ORDER BY id LIMIT 1', [famille]);
    if (!catRows.length) throw badRequest('Famille inconnue.');
    const categorieId = catRows[0].id;

    // Domaine depuis la famille
    const domaineMap = { proprete:'proprete', eau:'eau', assainissement:'assainissement', voirie:'voirie', eclairage:'eclairage', espaces_verts:'espaces_verts', securite:'general', stationnement:'general', autre:'general', animaux:'general', nuisances:'general', mobilier_urbain:'general', batiments:'general', environnement:'general', transport:'general', accessibilite:'general' };
    const domaine = domaineMap[famille] || 'general';

    // Routage EPIC
    const { epicId, triHumain } = await routerEpic(categorieId, communeId);
    let operateurId = null;
    if (!epicId && !triHumain && communeId) {
      try { const svc = require('../proprete/signalementService'); operateurId = await svc.resoudreOperateur(communeId, domaine === 'general' ? 'proprete' : domaine); } catch(e) { console.error('[signaler] ÉCHEC routage opérateur — signalement potentiellement orphelin, commune=' + communeId + ', domaine=' + domaine + ':', e.message); }
    }

    const prefixMap = { proprete:'PRO', eau:'EAU', voirie:'VOR', eclairage:'ECL', espaces_verts:'EVT', assainissement:'ASS' };
    const reference = makeReference(prefixMap[domaine] || 'SIG');
    const routageEchoue = !epicId && !operateurId;

    const result = await withTransaction(async (c) => {
      const { rows } = await c.query(
        `INSERT INTO signalement (reference, domaine, categorie_id, citoyen_id, commune_id, operateur_id, epic_id, lat, lng, description, photo_path, etat, sous_categorie_a_affiner, routage_echoue)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'recu',true,$12) RETURNING *`,
        [reference, domaine, categorieId, citoyenId, communeId || null, operateurId, epicId, parseFloat(lat) || 0, parseFloat(lng) || 0, description || null, photoPath, routageEchoue]);
      // Historique
      await c.query('INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action) VALUES ($1,$2,$3,$4)',
        [rows[0].id, 'recu', citoyenId, 'signalement_cree']);
      // Points
      try { const { awardPoints } = require('../../utils/points'); await awardPoints(citoyenId, 'signalement', 'signalement', rows[0].id); } catch(e) { console.error('[signaler] échec attribution points, citoyen=' + citoyenId + ':', e.message); }
      // Notification
      try { await c.query('INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1,$2,$3,$4,$5)',
        [citoyenId, 'signalement', 'Signalement enregistré', 'Votre signalement #' + reference + ' a été transmis.', '/mes-signalements']); } catch(e) { console.error('[signaler] échec notification citoyen, ref=' + reference + ':', e.message); }
      // Notification agents de réception si routage échoué
      if (routageEchoue) {
        try {
          const { rows: agents } = await c.query("SELECT id FROM utilisateur WHERE fonction = 'agent_traitant' AND capacites @> ARRAY['reception'] AND actif = TRUE");
          for (const a of agents) {
            await c.query('INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1,$2,$3,$4,$5)',
              [a.id, 'alerte', 'Signalement sans routage', 'Le signalement #' + reference + ' n\'a pas pu être routé automatiquement. Assignez-le manuellement.', '/bo-agent']);
          }
        } catch(e) { console.error('[signaler] échec notification agents routage échoué:', e.message); }
      }
      return rows[0];
    });

    // Email de confirmation (fire-and-forget, ne bloque jamais)
    try {
      const { rows: uRows } = await query('SELECT email, prenom FROM utilisateur WHERE id=$1', [citoyenId]);
      if (uRows[0]?.email) {
        const { sendSignalementEmail } = require('../../services/emailService');
        const catLabel = (await query('SELECT libelle FROM categorie_signal WHERE id=$1', [categorieId])).rows[0]?.libelle || famille;
        const commLabel = communeId ? (await query('SELECT nom FROM commune WHERE id=$1', [communeId])).rows[0]?.nom || '' : '';
        sendSignalementEmail(uRows[0].email, uRows[0].prenom || '', reference, catLabel, commLabel).catch(e => console.warn('[email] signalement confirm failed:', e.message));
      }
    } catch(e) { console.warn('[email] signalement confirm error:', e.message); }

    res.status(201).json({ signalement: result });
  }));

router.post('/signalements',
  authenticate,
  upload.single('photo'),
  validate(creerSchema),
  asyncH(async (req, res) => {
    const { categorieId, lat, lng, communeId, description, gravite } = req.body;
    const citoyenId = req.user.id;
    const photoPath = req.file ? req.file.path : null;

    // Quota KYC (5/mois N1, 5/jour N2) puis filet 15/jour
    if (req.user.fonction === 'citoyen' || req.user.role === 'citoyen') {
      const quotaBlock = await verifierQuotaKYC(citoyenId, res);
      if (quotaBlock) return;
      const { rows: countRows } = await query(
        "SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id = $1 AND cree_le >= CURRENT_DATE",
        [citoyenId]);
      if (countRows[0].n >= 15) {
        return res.status(429).json({ erreur: 'Limite quotidienne de signalements atteinte (15 par jour). Réessayez demain.' });
      }
    }

    // Vérifier la catégorie
    const { rows: catRows } = await query(
      'SELECT id, domaine, famille FROM categorie_signal WHERE id = $1', [categorieId]);
    if (!catRows.length) throw badRequest('Catégorie inconnue.');
    const cat = catRows[0];

    // Déterminer le domaine effectif pour la table signalement
    const domaine = cat.domaine; // 'proprete', 'eau', ou 'general'

    // Routage EPIC
    const { epicId, triHumain } = await routerEpic(categorieId, communeId);

    // Résoudre opérateur (pour le domaine proprete/eau existant)
    let operateurId = null;
    if (!epicId && !triHumain && communeId) {
      const svc = require('../proprete/signalementService');
      operateurId = await svc.resoudreOperateur(communeId, domaine === 'general' ? 'proprete' : domaine);
    }

    // Préfixe de référence
    const prefixMap = { proprete: 'PRO', eau: 'EAU', general: 'SIG' };
    const reference = makeReference(prefixMap[domaine] || 'SIG');

    // Routage institutionnel (couche données, ne remplace pas epic_id)
    let directionPiloteId = null, organisationExecutanteId = null, dairaId = null;
    try {
      const { rows: cr } = await query('SELECT direction_pilote_id, organisation_executante_id FROM categorie_routage WHERE categorie_id = $1', [categorieId]);
      if (cr.length) { directionPiloteId = cr[0].direction_pilote_id; organisationExecutanteId = cr[0].organisation_executante_id; }
      // Pour les catégories dynamiques, l'exécutant est résolu via l'epicId calculé
      if (!organisationExecutanteId && epicId) {
        const { rows: eom } = await query('SELECT organisation_id FROM epic_organisation_map WHERE epic_id = $1 LIMIT 1', [epicId]);
        if (eom.length) organisationExecutanteId = eom[0].organisation_id;
      }
      if (communeId) { const { rows: cm } = await query('SELECT daira_id FROM commune WHERE id = $1', [communeId]); if (cm.length) dairaId = cm[0].daira_id; }
    } catch(e) { console.warn('[routage-inst] fallback:', e.message); }

    const result = await withTransaction(async (c) => {
      const { rows } = await c.query(
        `INSERT INTO signalement
           (reference, domaine, categorie_id, citoyen_id, commune_id, operateur_id, epic_id, lat, lng, description, photo_path, etat, gravite,
            direction_pilote_id, organisation_executante_id, daira_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'recu',$12,$13,$14,$15)
         RETURNING *`,
        [reference, domaine, categorieId, citoyenId, communeId || null,
         operateurId, epicId, lat || 0, lng || 0, description || null, photoPath,
         gravite || 'degradation', directionPiloteId, organisationExecutanteId, dairaId]);
      const sig = rows[0];

      await c.query(
        'INSERT INTO signalement_historique(signalement_id, etat, par_utilisateur) VALUES ($1,$2,$3)',
        [sig.id, 'recu', citoyenId]);

      return { signalement: sig, epicId, triHumain };
    });

    // Points Citoyens (hors transaction — non bloquant, avec dégressivité)
    let pointsGagnes = 0;
    if (req.user.id) {
      const r1 = await awardPoints(req.user.id, 'creation', 'signalement', result.signalement.id);
      pointsGagnes += r1.delta;
      if (req.file) {
        const r2 = await awardPoints(req.user.id, 'photo', 'signalement', result.signalement.id);
        pointsGagnes += r2.delta;
      }
    }
    result.pointsGagnes = pointsGagnes;

    // Vérifier et attribuer les badges (async, non bloquant)
    try { const { checkAndAwardBadges } = require('../points'); checkAndAwardBadges(req.user.id); }
    catch(e) { console.warn('[badges]', e.message); }

    // Email de confirmation (fire-and-forget, ne bloque jamais)
    try {
      const { notify, emailCreation } = require('../../services/notifier');
      const { rows: uRows } = await query('SELECT email, telephone, notifications_sms FROM utilisateur WHERE id=$1', [req.user.id]);
      const { rows: catRows } = await query('SELECT libelle FROM categorie_signal WHERE id=$1', [categorieId]);
      const { rows: comRows } = await query('SELECT nom FROM commune WHERE id=$1', [communeId || 0]);
      const sig = result.signalement;
      const u = uRows[0] || {};
      notify({
        email: u.email,
        phone: u.notifications_sms ? u.telephone : null,  // SMS seulement si opt-in
        subject: `Signalement #${sig.reference} transmis — CiviSmart`,
        html: emailCreation({
          reference: sig.reference,
          categorie: catRows[0]?.libelle || '—',
          commune: comRows[0]?.nom || '—',
          date: new Date().toLocaleDateString('fr-DZ'),
          lat: lat, lng: lng
        }),
        smsBody: `CiviSmart: votre signalement #${sig.reference} a été enregistré. Vous serez notifié de son traitement.`
      });
    } catch(e) { console.warn('[notifier]', e.message); }

    res.status(201).json(result);
  }));

// ── GET /proches — signalements actifs à proximité d'un point ──
router.get('/proches', asyncH(async (req, res) => {
  const { lat, lng, famille } = req.query;
  if (!lat || !lng) throw badRequest('lat et lng requis');
  const rayon = 0.002; // ~200m
  let sql = `SELECT s.id, s.reference, s.lat, s.lng, s.description, s.nb_confirmations,
                    cs.libelle AS categorie, cs.famille, s.cree_le
               FROM signalement s
               JOIN categorie_signal cs ON cs.id = s.categorie_id
              WHERE s.etat NOT IN ('resolu','rejete')
                AND ABS(s.lat - $1) < $3 AND ABS(s.lng - $2) < $3`;
  const params = [parseFloat(lat), parseFloat(lng), rayon];
  if (famille) { sql += ` AND cs.famille = $4`; params.push(famille); }
  sql += ' ORDER BY s.cree_le DESC LIMIT 10';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// ── PATCH /:id/confirmer — +1 confirmation citoyen ──
router.patch('/:id/confirmer', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `UPDATE signalement SET nb_confirmations = nb_confirmations + 1
      WHERE id = $1 AND etat NOT IN ('resolu','rejete')
      RETURNING id, reference, nb_confirmations`,
    [req.params.id]);
  if (!rows.length) throw badRequest('Signalement introuvable ou déjà résolu');
  res.json(rows[0]);
}));

// POST /board — créer une intervention interne (agent traitant)
function optionalUpload(req, res, next) {
  if (req.is('multipart/form-data')) return upload.single('photo')(req, res, next);
  next();
}
router.post('/board',
  authenticate, requireStaff(),
  optionalUpload,
  asyncH(async (req, res) => {
    // Vérifier capacité reception ou qualification
    const userCaps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!userCaps.includes('reception') && !userCaps.includes('qualification') && !userCaps.includes('pilotage')) {
      return res.status(403).json({ erreur: 'Capacité insuffisante pour créer une intervention.' });
    }
    const { description, famille, communeId, lat, lng, criticite } = req.body;
    if (!description) return res.status(400).json({ erreur: 'Description obligatoire.' });

    // Résoudre la catégorie à partir de la famille
    let categorieId = null;
    if (famille) {
      const { rows: catRows } = await query(
        'SELECT id FROM categorie_signal WHERE famille = $1 LIMIT 1', [famille]);
      if (catRows.length) categorieId = catRows[0].id;
    }

    const reference = require('../../utils/http').makeReference('INT');
    const photoPath = req.file ? req.file.path : null;
    // Mapper la famille vers un domaine valide (enum: proprete, eau, general)
    const domaineMap = { proprete:'proprete', eau:'eau', assainissement:'assainissement', voirie:'voirie', eclairage:'eclairage', espaces_verts:'espaces_verts', securite:'general', autre:'general', animaux:'general', nuisances:'general', mobilier_urbain:'general', batiments:'general', environnement:'general', transport:'general', stationnement:'general', accessibilite:'general' };
    const domaine = domaineMap[famille] || 'general';

    // Si pas de catégorie trouvée, prendre la première catégorie disponible
    if (!categorieId) {
      const { rows: defCat } = await query('SELECT id FROM categorie_signal LIMIT 1');
      if (defCat.length) categorieId = defCat[0].id;
      else return res.status(400).json({ erreur: 'Aucune catégorie configurée.' });
    }

    const { rows } = await query(
      `INSERT INTO signalement
         (reference, domaine, categorie_id, citoyen_id, commune_id, lat, lng, description, photo_path, etat, gravite)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'recu', 'degradation')
       RETURNING *`,
      [reference, domaine, categorieId,
       null, communeId ? Number(communeId) : (req.user.commune_id || null),
       lat ? parseFloat(lat) : 0, lng ? parseFloat(lng) : 0,
       description, photoPath]
    );
    const sig = rows[0];

    // Historique
    const { rows: userInfo } = await query('SELECT prenom, nom FROM utilisateur WHERE id=$1', [req.user.id]);
    const auteurNom = userInfo.length ? (userInfo[0].prenom || '') + ' ' + (userInfo[0].nom || '') : '';
    await query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, 'recu', $2, 'intervention_cree', $3)`,
      [sig.id, req.user.id, 'Intervention créée par ' + auteurNom.trim()]
    );

    res.status(201).json(sig);
  }));

// GET /board — tous les signalements pour le Board Agent (tous domaines)
router.get('/board',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const { communeId, etat, categorie } = req.query;
    let sql = `SELECT s.id, s.reference, s.domaine, s.etat, cs.criticite, s.gravite,
                      s.description, s.photo_path, s.lat, s.lng, s.cree_le, s.resolu_le,
                      s.assigne_a, s.transmis_a, s.motif_rejet, s.nb_confirmations,
                      s.delai_prevu, s.equipe_interne, s.responsable_intervention,
                      s.compte_rendu_description, s.compte_rendu_resultat, s.compte_rendu_date_fin, s.compte_rendu_observation,
                      cs.libelle AS categorie_nom, cs.libelle_ar AS categorie_nom_ar, cs.famille AS categorie_famille, s.sous_categorie_a_affiner,
                      c.nom AS commune_nom, c.nom_ar AS commune_nom_ar, s.commune_id,
                      u.prenom AS citoyen_prenom, u.nom AS citoyen_nom, u.telephone AS citoyen_tel,
                      dp.nom AS direction_pilote_nom, dp.nom_ar AS direction_pilote_nom_ar,
                      oe.nom AS executant_nom, oe.nom_ar AS executant_nom_ar,
                      d.nom AS daira_nom, d.nom_ar AS daira_nom_ar
                 FROM signalement s
                 LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
                 LEFT JOIN commune c ON c.id = s.commune_id
                 LEFT JOIN utilisateur u ON u.id = s.citoyen_id
                 LEFT JOIN organisations dp ON dp.id = s.direction_pilote_id
                 LEFT JOIN organisations oe ON oe.id = s.organisation_executante_id
                 LEFT JOIN daira d ON d.id = s.daira_id
                WHERE 1=1`;
    const params = [];
    if (communeId) { params.push(Number(communeId)); sql += ` AND s.commune_id = $${params.length}`; }
    if (etat) { params.push(etat); sql += ` AND s.etat = $${params.length}`; }
    if (categorie) { params.push(categorie); sql += ` AND cs.famille = $${params.length}`; }
    if (req.query.organisation_id) { params.push(Number(req.query.organisation_id)); sql += ` AND s.assigne_a IN (SELECT id FROM utilisateur WHERE organisation_id = $${params.length})`; }
    // Superviseur communal : restreint à sa commune
    var isCommune = hasPerimetre(req.user, 'commune');
    if (isCommune && req.user.commune_id) {
      params.push(req.user.commune_id);
      sql += ` AND s.commune_id = $${params.length}`;
    }
    // Entité responsable : filtrage par organisation de rattachement
    // Direction → dossiers pilotés par cette direction + exécutés par les EPIC sous sa tutelle
    // EPIC → dossiers exécutés par cet EPIC
    // Service interne → résolution vers la direction parente (parent_id)
    if (req.user.fonction === 'entite_responsable' && req.user.organisation_id) {
      const orgId = Number(req.user.organisation_id);
      const { rows: orgInfo } = await query('SELECT type_organisation, parent_id FROM organisations WHERE id = $1', [orgId]);
      const orgType = orgInfo.length ? orgInfo[0].type_organisation : null;
      if (orgType === 'epic') {
        params.push(orgId);
        sql += ` AND s.organisation_executante_id = $${params.length}`;
      } else {
        let effectiveDir = orgId;
        if (orgType !== 'direction_wilaya' && orgInfo.length && orgInfo[0].parent_id) {
          effectiveDir = orgInfo[0].parent_id;
        }
        params.push(effectiveDir);
        sql += ` AND (s.direction_pilote_id = $${params.length} OR s.organisation_executante_id IN (SELECT id FROM organisations WHERE direction_tutelle_id = $${params.length}))`;
      }
    }
    sql += ` ORDER BY s.cree_le DESC LIMIT 500`;
    const { rows } = await query(sql, params);
    res.json(rows);
  }));

// GET /board/orphelins — signalements à router manuellement
router.get('/board/orphelins',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const { rows } = await query(
      `SELECT s.id, s.reference, s.domaine, s.etat, s.description, s.cree_le,
              cs.libelle AS categorie_nom, cs.libelle_ar AS categorie_nom_ar,
              c.nom AS commune_nom, c.nom_ar AS commune_nom_ar,
              u.prenom AS citoyen_prenom, u.nom AS citoyen_nom
         FROM signalement s
         LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
         LEFT JOIN commune c ON c.id = s.commune_id
         LEFT JOIN utilisateur u ON u.id = s.citoyen_id
        WHERE s.routage_echoue = TRUE
        ORDER BY s.cree_le DESC`);
    res.json(rows);
  }));

// PATCH /board/:id/assigner-epic — assignation manuelle d'un EPIC
router.patch('/board/:id/assigner-epic',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const { epic_id } = req.body;
    if (!epic_id) return res.status(400).json({ erreur: 'epic_id requis' });
    // Vérifier que l'EPIC existe et est actif
    const { rows: epic } = await query('SELECT id, sigle, nom FROM epic WHERE id = $1 AND actif = TRUE', [epic_id]);
    if (!epic.length) return res.status(400).json({ erreur: 'EPIC introuvable ou inactif.' });
    // Mettre à jour le signalement
    const { rows } = await query(
      'UPDATE signalement SET epic_id = $1, routage_echoue = FALSE WHERE id = $2 RETURNING id, reference',
      [epic_id, req.params.id]);
    if (!rows.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    // Historique
    await query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       SELECT id, etat, $1, 'routage_manuel', $2 FROM signalement WHERE id = $3`,
      [req.user.id, 'Assigné manuellement à ' + epic[0].sigle + ' (' + epic[0].nom + ')', req.params.id]);
    res.json({ ok: true, reference: rows[0].reference, epic: epic[0].sigle });
  }));

// GET /board/:id — un seul signalement par ID (pour drawer superviseur)
router.get('/board/:id',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const sql = `SELECT s.id, s.reference, s.domaine, s.etat, cs.criticite, s.gravite,
                        s.description, s.photo_path, s.lat, s.lng, s.cree_le, s.resolu_le,
                        s.assigne_a, s.transmis_a, s.motif_rejet, s.nb_confirmations,
                        s.delai_prevu, s.equipe_interne, s.responsable_intervention,
                        s.compte_rendu_description, s.compte_rendu_resultat, s.compte_rendu_date_fin, s.compte_rendu_observation,
                        cs.libelle AS categorie_nom, cs.libelle_ar AS categorie_nom_ar, cs.famille AS categorie_famille, s.sous_categorie_a_affiner,
                        c.nom AS commune_nom, c.nom_ar AS commune_nom_ar, s.commune_id,
                        u.prenom AS citoyen_prenom, u.nom AS citoyen_nom, u.telephone AS citoyen_tel,
                        o.nom AS organisation_nom
                   FROM signalement s
                   LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
                   LEFT JOIN commune c ON c.id = s.commune_id
                   LEFT JOIN utilisateur u ON u.id = s.citoyen_id
                   LEFT JOIN utilisateur a ON a.id = s.assigne_a
                   LEFT JOIN organisations o ON o.id = a.organisation_id
                  WHERE s.id = $1`;
    const { rows } = await query(sql, [req.params.id]);
    if (!rows.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    if (!(await checkCommuneAccess(req, req.params.id))) return res.status(403).json({ erreur: 'Hors périmètre.' });
    res.json(rows[0]);
  }));

// PATCH /board/:id/etat — workflow via le board (tous domaines)
router.patch('/board/:id/etat',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const workflow = require('../../services/workflow');
    const { etat, commentaire, motifRejet, transmisA, delaiPrevu } = req.body;
    if (!etat) return res.status(400).json({ erreur: 'etat requis' });
    if (!(await checkCommuneAccess(req, req.params.id))) return res.status(403).json({ erreur: 'Hors périmètre.' });
    try {
      const result = await workflow.transitionEtat(
        req.params.id, etat, req.user,
        { commentaire, motifRejet, transmisA, delaiPrevu }
      );
      res.json(result);
    } catch(e) {
      const msg = e.message || 'Erreur de transition';
      if (msg.includes('non autorisée') || msg.includes('introuvable') || msg.includes('réservé')) {
        return res.status(400).json({ erreur: msg });
      }
      throw e;
    }
  }));

// POST /board/:id/commentaire — message ou relance sur un dossier
router.post('/board/:id/commentaire',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const { commentaire, type } = req.body;
    if (!commentaire) return res.status(400).json({ erreur: 'Commentaire requis.' });
    if (!(await checkCommuneAccess(req, req.params.id))) return res.status(403).json({ erreur: 'Hors périmètre.' });
    const userCaps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!userCaps.includes('reception') && !userCaps.includes('qualification') && !userCaps.includes('pilotage')) {
      return res.status(403).json({ erreur: 'Capacité insuffisante.' });
    }
    // Vérifier que le signalement existe + récupérer infos pour notifications
    const { rows: sig } = await query(
      `SELECT s.etat, s.reference, s.organisation_executante_id, s.transmis_a, s.direction_pilote_id,
              cs.libelle AS categorie, c.nom AS commune_nom
       FROM signalement s
       LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
       LEFT JOIN commune c ON c.id = s.commune_id
       WHERE s.id=$1`, [req.params.id]);
    if (!sig.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    const dossier = sig[0];
    // Récupérer le nom de l'auteur
    const { rows: usr } = await query('SELECT prenom, nom FROM utilisateur WHERE id=$1', [req.user.id]);
    const auteur = usr.length ? (usr[0].prenom || '') + ' ' + (usr[0].nom || '') : '';
    const typeMap = {
      relance: { action: 'relance_service', label: 'Relance' },
      message: { action: 'message_service', label: 'Message' },
      communique: { action: 'communique_superviseur', label: 'Communiqué' },
      notification: { action: 'notification_superviseur', label: 'Notification' },
      urgence_wali: { action: 'urgence_wali', label: 'Urgence Wali' },
      note_commandement: { action: 'note_commandement', label: 'Note commandement' },
    };
    const tm = typeMap[type] || typeMap.message;
    const action = tm.action;
    const label = tm.label;

    // ── Anti-spam : même action, même utilisateur, même dossier, < 1h ──
    if (['relance', 'message', 'urgence_wali'].includes(type)) {
      const { rows: recent } = await query(
        `SELECT le FROM signalement_historique
         WHERE signalement_id=$1 AND par_utilisateur=$2 AND action=$3
           AND le > NOW() - INTERVAL '1 hour'
         ORDER BY le DESC LIMIT 1`,
        [req.params.id, req.user.id, action]);
      if (recent.length) {
        const agoMin = Math.round((Date.now() - new Date(recent[0].le).getTime()) / 60000);
        return res.json({ ok: true, action, commentaire, spam: true, agoMin });
      }
    }

    // ── Trace historique ──
    await query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, dossier.etat, req.user.id, action, label + ' de ' + auteur.trim() + ' : ' + commentaire]
    );

    // ── Notifications réelles ──
    const ref = dossier.reference || '';
    const ctx = [ref, dossier.categorie, dossier.commune_nom].filter(Boolean).join(' · ');

    if (type === 'relance' || type === 'message') {
      // Notifier les entite_responsable de l'organisation exécutante (ou transmis_a)
      const orgId = dossier.organisation_executante_id || (dossier.transmis_a ? Number(dossier.transmis_a) : null);
      if (orgId) {
        try {
          const { rows: destUsers } = await query(
            `SELECT id FROM utilisateur
             WHERE organisation_id = $1 AND actif = TRUE AND fonction = 'entite_responsable'`,
            [orgId]);
          const titreFr = type === 'relance'
            ? 'Relance de la Salle de Commandement — ' + ref
            : 'Message de la Salle de Commandement — ' + ref;
          const titreAr = type === 'relance'
            ? 'متابعة من قاعة القيادة — ' + ref
            : 'رسالة من قاعة القيادة — ' + ref;
          const msgFr = commentaire.length > 80 ? commentaire.substring(0, 80) + '…' : commentaire;
          for (const u of destUsers) {
            // Détecter la langue du destinataire (fallback fr)
            const { rows: prefRows } = await query('SELECT langue FROM utilisateur WHERE id=$1', [u.id]);
            const lang = (prefRows.length && prefRows[0].langue === 'ar') ? 'ar' : 'fr';
            const titre = lang === 'ar' ? titreAr : titreFr;
            await query(
              `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
               VALUES ($1, 'signalement', $2, $3, $4)`,
              [u.id, titre, msgFr, '/bo-agent#' + req.params.id]);
          }
        } catch (e) { console.warn('[notif] relance/message notification failed:', e.message); }
      }
    }

    if (type === 'urgence_wali') {
      // Marquer le dossier urgence_wali (champ distinct, ne touche PAS la gravité)
      await query('UPDATE signalement SET urgence_wali = TRUE, urgence_wali_le = NOW(), urgence_wali_par = $1 WHERE id = $2', [req.user.id, req.params.id]);
      // Notifier cabinet + superviseurs wilaya
      try {
        const { rows: destUsers } = await query(
          `SELECT id FROM utilisateur
           WHERE actif = TRUE AND (
             fonction = 'cabinet'
             OR (fonction = 'superviseur' AND niveau_perimetre = 'wilaya')
           ) AND id != $1`,
          [req.user.id]);
        const titreFr = '🚨 Urgence signalée — ' + ref;
        const titreAr = '🚨 حالة طوارئ — ' + ref;
        const msgFr = commentaire.length > 80 ? commentaire.substring(0, 80) + '…' : commentaire;
        for (const u of destUsers) {
          const { rows: prefRows } = await query('SELECT langue FROM utilisateur WHERE id=$1', [u.id]);
          const lang = (prefRows.length && prefRows[0].langue === 'ar') ? 'ar' : 'fr';
          const titre = lang === 'ar' ? titreAr : titreFr;
          await query(
            `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
             VALUES ($1, 'signalement', $2, $3, $4)`,
            [u.id, titre, msgFr, '/command-center#' + req.params.id]);
        }
      } catch (e) { console.warn('[notif] urgence_wali notification failed:', e.message); }
    }

    res.json({ ok: true, action, commentaire });
  }));

// PATCH /board/:id/planification — organisation interne EPIC
router.patch('/board/:id/planification',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    // Seul entite_responsable avec capacité traitement, qualification ou pilotage
    if (req.user.fonction !== 'entite_responsable') {
      return res.status(403).json({ erreur: 'Réservé à l\'entité responsable.' });
    }
    const userCaps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!userCaps.includes('traitement') && !userCaps.includes('qualification') && !userCaps.includes('pilotage')) {
      return res.status(403).json({ erreur: 'Capacité insuffisante (traitement, qualification ou pilotage requise).' });
    }

    const { rows: sig } = await query('SELECT id, etat FROM signalement WHERE id=$1', [req.params.id]);
    if (!sig.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    if (!['pris_en_charge', 'en_intervention'].includes(sig[0].etat)) {
      return res.status(400).json({ erreur: 'Planification possible uniquement sur un dossier pris en charge ou en intervention.' });
    }

    const { equipeInterne, responsableIntervention, delaiPrevu } = req.body;
    const updates = [];
    const params = [req.params.id];
    let pi = 2;
    const changes = [];

    if (equipeInterne !== undefined) {
      updates.push(`equipe_interne = $${pi}`);
      params.push(equipeInterne || null);
      pi++;
      changes.push('Équipe : ' + (equipeInterne || '—'));
    }
    if (responsableIntervention !== undefined) {
      updates.push(`responsable_intervention = $${pi}`);
      params.push(responsableIntervention || null);
      pi++;
      changes.push('Responsable : ' + (responsableIntervention || '—'));
    }
    if (delaiPrevu !== undefined) {
      updates.push(`delai_prevu = $${pi}`);
      params.push(delaiPrevu || null);
      pi++;
      changes.push('Date prévisionnelle : ' + (delaiPrevu ? new Date(delaiPrevu).toLocaleDateString('fr-FR') : '—'));
    }

    if (!updates.length) return res.status(400).json({ erreur: 'Aucune modification fournie.' });

    await query(`UPDATE signalement SET ${updates.join(', ')} WHERE id = $1`, params);

    // Historique
    await query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, $2, $3, 'planification_modifiee', $4)`,
      [req.params.id, sig[0].etat, req.user.id, changes.join(' | ')]
    );

    res.json({ ok: true, changes });
  }));

// POST /board/:id/compte-rendu — soumettre le compte-rendu d'intervention (EPIC)
router.post('/board/:id/compte-rendu',
  authenticate, requireStaff(),
  upload.array('photos', 10),
  asyncH(async (req, res) => {
    if (req.user.fonction !== 'entite_responsable') {
      return res.status(403).json({ erreur: 'Réservé à l\'entité responsable.' });
    }
    const userCaps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!userCaps.includes('traitement') && !userCaps.includes('qualification') && !userCaps.includes('pilotage')) {
      return res.status(403).json({ erreur: 'Capacité insuffisante.' });
    }

    const { description, resultat, observation, dateFin, categories } = req.body;
    if (!description || !description.trim()) return res.status(400).json({ erreur: 'La description du compte-rendu est obligatoire.' });
    const resultats = ['resolu_completement', 'resolu_partiellement', 'impossible_intervenir', 'intervention_reportee', 'autre'];
    if (!resultat || !resultats.includes(resultat)) return res.status(400).json({ erreur: 'Le résultat de l\'intervention est obligatoire.' });

    const { rows: sig } = await query('SELECT id, etat FROM signalement WHERE id=$1', [req.params.id]);
    if (!sig.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    if (sig[0].etat !== 'en_intervention' && sig[0].etat !== 'pris_en_charge') {
      return res.status(400).json({ erreur: 'Le dossier doit être en intervention ou pris en charge.' });
    }

    const dateFinVal = dateFin ? new Date(dateFin) : new Date();

    // Sauvegarder le compte-rendu
    await query(
      `UPDATE signalement SET compte_rendu_description=$2, compte_rendu_resultat=$3,
       compte_rendu_observation=$4, compte_rendu_date_fin=$5 WHERE id=$1`,
      [req.params.id, description.trim(), resultat, (observation || '').trim() || null, dateFinVal]
    );

    // Pièces jointes
    const catArray = categories ? (Array.isArray(categories) ? categories : [categories]) : [];
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        const cat = catArray[i] || 'autre';
        await query(
          `INSERT INTO piece_jointe (signalement_id, fichier_path, categorie, nom_original, cree_par)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.params.id, f.filename, cat, f.originalname, req.user.id]
        );
      }
    }

    // Transition → a_valider
    const workflow = require('../../services/workflow');
    const resultatLabels = {
      resolu_completement: 'Résolu complètement',
      resolu_partiellement: 'Résolu partiellement',
      impossible_intervenir: 'Impossible d\'intervenir',
      intervention_reportee: 'Intervention reportée',
      autre: 'Autre'
    };
    const commentaire = 'Compte-rendu : ' + description.trim() +
      ' | Résultat : ' + (resultatLabels[resultat] || resultat) +
      (observation && observation.trim() ? ' | Obs. : ' + observation.trim() : '') +
      (req.files && req.files.length ? ' | ' + req.files.length + ' pièce(s) jointe(s)' : '');

    const result = await workflow.transitionEtat(
      req.params.id, 'a_valider', req.user, { commentaire }
    );

    res.json({ ok: true, etat: 'a_valider', nbPieces: (req.files || []).length });
  }));

// POST /board/:id/valider — superviseur valide le compte-rendu → résolu
router.post('/board/:id/valider',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    // Seul superviseur avec capacité validation ou pilotage
    if (req.user.fonction !== 'superviseur') {
      return res.status(403).json({ erreur: 'Réservé au superviseur.' });
    }
    if (!(await checkCommuneAccess(req, req.params.id))) return res.status(403).json({ erreur: 'Hors périmètre.' });
    const userCaps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!userCaps.includes('validation') && !userCaps.includes('pilotage')) {
      return res.status(403).json({ erreur: 'Capacité insuffisante (validation ou pilotage requise).' });
    }

    const { rows: sig } = await query(
      'SELECT id, etat, assigne_a FROM signalement WHERE id=$1', [req.params.id]
    );
    if (!sig.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    if (sig[0].etat !== 'a_valider') {
      return res.status(400).json({ erreur: 'Ce dossier n\'est pas en attente de validation.' });
    }

    // Anti auto-validation : vérifier que le superviseur n'est pas l'auteur du compte-rendu
    const { rows: hist } = await query(
      `SELECT par_utilisateur FROM signalement_historique
       WHERE signalement_id=$1 AND action='en_intervention_vers_a_valider'
       ORDER BY le DESC LIMIT 1`,
      [req.params.id]
    );
    if (hist.length && hist[0].par_utilisateur === req.user.id) {
      return res.status(403).json({ erreur: 'Vous ne pouvez pas valider un compte-rendu que vous avez soumis.' });
    }

    const workflow = require('../../services/workflow');
    const { commentaire } = req.body;
    const result = await workflow.transitionEtat(
      req.params.id, 'resolu', req.user,
      { commentaire: 'Validation du compte-rendu' + (commentaire ? ' — ' + commentaire : '') }
    );

    // Historique spécifique validation
    await query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, 'resolu', $2, 'validation_effectuee', $3)`,
      [req.params.id, req.user.id, 'Compte-rendu validé par le superviseur' + (commentaire ? ' — ' + commentaire : '')]
    );

    res.json({ ok: true, etat: 'resolu' });
  }));

// POST /board/:id/reprise — superviseur demande une reprise → retour en_intervention
router.post('/board/:id/reprise',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    if (req.user.fonction !== 'superviseur') {
      return res.status(403).json({ erreur: 'Réservé au superviseur.' });
    }
    if (!(await checkCommuneAccess(req, req.params.id))) return res.status(403).json({ erreur: 'Hors périmètre.' });
    const userCaps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!userCaps.includes('validation') && !userCaps.includes('pilotage')) {
      return res.status(403).json({ erreur: 'Capacité insuffisante (validation ou pilotage requise).' });
    }

    const { motif } = req.body;
    if (!motif || !motif.trim()) {
      return res.status(400).json({ erreur: 'Le motif de la demande de reprise est obligatoire.' });
    }

    const { rows: sig } = await query(
      'SELECT id, etat, assigne_a FROM signalement WHERE id=$1', [req.params.id]
    );
    if (!sig.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    if (sig[0].etat !== 'a_valider') {
      return res.status(400).json({ erreur: 'Ce dossier n\'est pas en attente de validation.' });
    }

    const workflow = require('../../services/workflow');
    const result = await workflow.transitionEtat(
      req.params.id, 'en_intervention', req.user,
      { commentaire: 'Reprise demandée — ' + motif.trim() }
    );

    // Historique spécifique reprise
    await query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, 'en_intervention', $2, 'reprise_demandee', $3)`,
      [req.params.id, req.user.id, 'Reprise demandée par le superviseur — ' + motif.trim()]
    );

    // Notification à l'entité responsable (assigne_a)
    if (sig[0].assigne_a) {
      try {
        await query(
          `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
           VALUES ($1, 'signalement', $2, $3, $4)`,
          [sig[0].assigne_a, 'Reprise demandée',
           motif.trim(),
           '/bo-agent#' + req.params.id]
        );
      } catch(e) { /* notification non bloquante */ }
    }

    res.json({ ok: true, etat: 'en_intervention', motif: motif.trim() });
  }));

// POST /board/:id/mission-cap — intervention CAP (tous domaines)
router.post('/board/:id/mission-cap',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    if (!(await checkCommuneAccess(req, req.params.id))) return res.status(403).json({ erreur: 'Hors périmètre.' });
    const workflow = require('../../services/workflow');
    const { type, priorite, commentaire, secteur, affecte_a } = req.body;
    const mission = await workflow.creerMissionCap(
      req.params.id, req.user,
      { type, priorite, commentaire, secteur, affecte_a }
    );
    res.status(201).json(mission);
  }));

// GET /board/:id/historique — historique (tous domaines)
router.get('/board/:id/historique',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    if (!(await checkCommuneAccess(req, req.params.id))) return res.status(403).json({ erreur: 'Hors périmètre.' });
    const { rows } = await query(
      `SELECT h.*, u.prenom, u.nom, u.role
         FROM signalement_historique h
         LEFT JOIN utilisateur u ON u.id = h.par_utilisateur
        WHERE h.signalement_id = $1
        ORDER BY h.le ASC`,
      [req.params.id]);
    res.json(rows);
  }));

// GET /board/:id/missions-cap — rapports CAP liés au signalement
router.get('/board/:id/missions-cap',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const { rows } = await query(
      `SELECT m.id, m.type, m.etat, m.priorite, m.constat_visuel, m.constat_temoignages,
              m.decision, m.motif_decision, m.photo_path, m.cloture_lat, m.cloture_lng,
              m.cloture_le, m.cree_le, m.commentaire,
              ua.prenom AS agent_prenom, ua.nom AS agent_nom, ua.telephone AS agent_tel
         FROM mission_cap m
         LEFT JOIN utilisateur ua ON ua.id = m.affecte_a
        WHERE m.signalement_id = $1
        ORDER BY m.cree_le DESC`,
      [req.params.id]);
    res.json(rows);
  }));

// GET /board/:id/route — routage (tous domaines)
router.get('/board/:id/route',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const workflow = require('../../services/workflow');
    const service = await workflow.routerSignalement(req.params.id);
    res.json({ service });
  }));

// ═══ API PUBLIQUE ANONYMISÉE ═══
router.get('/public/carte', asyncH(async (req, res) => {
  const { rows } = await query(`
    SELECT cs.libelle AS categorie, c.nom AS commune, s.etat, s.cree_le, s.domaine,
           ROUND(CAST(s.lat AS numeric), 2) AS lat, ROUND(CAST(s.lng AS numeric), 2) AS lng
      FROM signalement s
      LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
      LEFT JOIN commune c ON c.id = s.commune_id
     WHERE s.lat IS NOT NULL AND CAST(s.lat AS float) > 0
       AND s.cree_le >= NOW() - INTERVAL '90 days'
     ORDER BY s.cree_le DESC LIMIT 200`);
  res.json(rows);
}));

// GET /mes-signalements — signalements du citoyen connecté
router.get('/mes-signalements', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.reference, s.domaine, s.etat, s.description, s.lat, s.lng, s.cree_le, s.nb_confirmations,
            s.motif_rejet,
            cs.libelle AS categorie, cs.libelle_ar AS categorie_ar, cs.famille,
            c.nom AS commune, c.nom_ar AS commune_ar
       FROM signalement s
       LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
       LEFT JOIN commune c ON c.id = s.commune_id
      WHERE s.citoyen_id = $1
      ORDER BY s.cree_le DESC LIMIT 100`,
    [req.user.id]);
  res.json(rows);
}));

router.get('/public/stats', asyncH(async (req, res) => {
  const [total, resolus, taux, nbCommunes] = await Promise.all([
    query('SELECT COUNT(*)::int AS n FROM signalement'),
    query("SELECT COUNT(*)::int AS n FROM signalement WHERE etat='resolu'"),
    query("SELECT CASE WHEN COUNT(*)>0 THEN ROUND(COUNT(*) FILTER (WHERE etat='resolu')::numeric / COUNT(*)::numeric * 100) ELSE 0 END::int AS n FROM signalement"),
    query('SELECT COUNT(DISTINCT commune_id)::int AS n FROM signalement WHERE commune_id IS NOT NULL'),
  ]);
  res.json({ total: total.rows[0].n, resolus: resolus.rows[0].n, taux: taux.rows[0].n, communes: nbCommunes.rows[0].n });
}));

router.get('/public/recents', asyncH(async (req, res) => {
  const { rows } = await query(`
    SELECT cs.libelle AS categorie, c.nom AS commune, s.etat, s.cree_le, s.domaine
      FROM signalement s
      LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
      LEFT JOIN commune c ON c.id = s.commune_id
     ORDER BY s.cree_le DESC LIMIT 12`);
  res.json(rows);
}));

module.exports = router;
