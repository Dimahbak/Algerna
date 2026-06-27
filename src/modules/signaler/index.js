/**
 * Module SIGNALER — Double chemin de signalement unifié.
 *
 * Porte 1 (guidé)  : familles → sous-cas → formulaire
 * Porte 2 (direct)  : choix EPIC → formulaire
 *
 * Le routage catégorie → EPIC est invisible pour le citoyen.
 * Mapping :
 *   eau            → SEAAL (epic 17)
 *   espaces_verts  → EDEVAL (epic 3)
 *   eclairage      → ERMA (epic 8)
 *   voirie         → EGCTU (epic 30)
 *   proprete       → NETCOM (epic 1) si commune.zone='centre',
 *                    EXTRANET (epic 2) si commune.zone='peripherie'
 *   stationnement  → EPIC Parkings (epic 31)
 *   autre          → file de TRI HUMAIN (epic_id = NULL)
 *
 * Le champ commune.zone contrôle le routage déchets/propreté.
 * Par défaut toutes les communes sont en 'centre' (→ NETCOM).
 * Pour ajuster :
 *   UPDATE commune SET zone='peripherie' WHERE nom IN ('Baraki','Birtouta',...);
 */
const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { query, withTransaction } = require('../../db/pool');
const { validate } = require('../../middleware/validation');
const { authenticate } = require('../../middleware/auth');
const { asyncH, makeReference, badRequest } = require('../../utils/http');
const config = require('../../config');

const router = express.Router();
const upload = multer({ dest: config.upload.dir, limits: { fileSize: config.upload.maxBytes } });

// ── EPIC IDs (doit correspondre à la table epic) ──
const EPIC_SEAAL    = 17;
const EPIC_EDEVAL   = 3;
const EPIC_ERMA     = 8;
const EPIC_EGCTU    = 30;
const EPIC_NETCOM   = 1;
const EPIC_EXTRANET = 2;
const EPIC_PARKINGS = 31;
// CET = 32, utilisé par les catégories directement (epic_id sur categorie_signal)

// Mapping famille → EPIC (sauf propreté qui dépend de la zone commune)
const FAMILLE_EPIC = {
  eau:            EPIC_SEAAL,
  espaces_verts:  EPIC_EDEVAL,
  eclairage:      EPIC_ERMA,
  voirie:         EPIC_EGCTU,
  stationnement:  EPIC_PARKINGS,
  // proprete: dynamique (centre→NETCOM, periph→EXTRANET)
  // autre: null (tri humain)
};

const { awardPoints } = require('../../utils/points');

// ── GET /familles — catégories groupées par famille pour le chemin guidé ──
router.get('/familles', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT cs.id, cs.domaine, cs.libelle, cs.criticite, cs.epic_id, cs.famille,
            e.sigle AS epic_sigle
       FROM categorie_signal cs
       LEFT JOIN epic e ON e.id = cs.epic_id AND e.actif = TRUE
      WHERE cs.famille IS NOT NULL
      ORDER BY cs.famille, cs.id`
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
        AND sigle IN ('NETCOM','EXTRANET','EDEVAL','ERMA','EGCTU','EPIC-PARKINGS','CET')
      ORDER BY sigle`
  );
  res.json(rows);
}));

// ── Moteur de routage catégorie → EPIC ──
async function routerEpic(categorieId, communeId) {
  // 1. Si la catégorie a un epic_id direct, on l'utilise
  const { rows: catRows } = await query(
    'SELECT epic_id, famille FROM categorie_signal WHERE id = $1', [categorieId]);
  if (!catRows.length) return { epicId: null, triHumain: false };

  const cat = catRows[0];

  // Si la catégorie a déjà un epic_id assigné (ex: EDEVAL, ERMA, EGCTU, CET, Parkings)
  if (cat.epic_id) return { epicId: cat.epic_id, triHumain: false };

  // 2. Famille "autre" → tri humain
  if (cat.famille === 'autre') return { epicId: null, triHumain: true };

  // 3. Famille propreté sans epic_id → routage par zone commune
  if (cat.famille === 'proprete') {
    if (!communeId) {
      // Pas de commune → fallback NETCOM + log
      console.warn(`[ROUTAGE] Commune absente pour catégorie ${categorieId} — fallback NETCOM`);
      return { epicId: EPIC_NETCOM, triHumain: false };
    }
    const { rows: comRows } = await query(
      'SELECT zone FROM commune WHERE id = $1', [communeId]);
    const zone = comRows.length ? comRows[0].zone : 'centre';
    if (!zone || zone === 'centre') return { epicId: EPIC_NETCOM, triHumain: false };
    return { epicId: EPIC_EXTRANET, triHumain: false };
  }

  // 4. Famille eau sans epic_id → SEAAL
  if (cat.famille === 'eau') return { epicId: EPIC_SEAAL, triHumain: false };

  // 5. Lookup par famille dans le mapping statique
  const epicId = FAMILLE_EPIC[cat.famille] || null;
  return { epicId, triHumain: !epicId };
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

router.post('/signalements',
  authenticate,
  upload.single('photo'),
  validate(creerSchema),
  asyncH(async (req, res) => {
    const { categorieId, lat, lng, communeId, description, gravite } = req.body;
    const citoyenId = req.user.id;
    const photoPath = req.file ? req.file.path : null;

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

    const result = await withTransaction(async (c) => {
      const { rows } = await c.query(
        `INSERT INTO signalement
           (reference, domaine, categorie_id, citoyen_id, commune_id, operateur_id, epic_id, lat, lng, description, photo_path, etat, gravite)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'recu',$12)
         RETURNING *`,
        [reference, domaine, categorieId, citoyenId, communeId || null,
         operateurId, epicId, lat || 0, lng || 0, description || null, photoPath,
         gravite || 'degradation']);
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
      const { rows: uRows } = await query('SELECT email, telephone FROM utilisateur WHERE id=$1', [req.user.id]);
      const { rows: catRows } = await query('SELECT libelle FROM categorie_signal WHERE id=$1', [categorieId]);
      const { rows: comRows } = await query('SELECT nom FROM commune WHERE id=$1', [communeId || 0]);
      const sig = result.signalement;
      notify({
        email: uRows[0]?.email,
        phone: uRows[0]?.telephone,
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
  const rayon = 0.001; // ~100m
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

module.exports = router;
