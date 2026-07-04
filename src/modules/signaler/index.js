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
const { authenticate, requireRole, requireFonction, hasFonction, hasPerimetre } = require('../../middleware/auth');
const { asyncH, makeReference, badRequest } = require('../../utils/http');
const config = require('../../config');

const router = express.Router();
const upload = multer({ dest: config.upload.dir, limits: { fileSize: config.upload.maxBytes } });

// Phase 3B — dual-mode : nouveau modèle avec fallback ancien
const STAFF_FONCTIONS = ['agent_traitant', 'cap', 'entite_responsable', 'superviseur'];
function requireStaff() {
  return (req, res, next) => {
    if (!req.user) return next(require('../../utils/http').unauthorized());
    if (req.user.fonction && STAFF_FONCTIONS.includes(req.user.fonction)) return next();
    return next(require('../../utils/http').forbidden());
  };
}

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

    // Limite : 4 signalements par jour par citoyen
    if (req.user.fonction === 'citoyen' || req.user.role === 'citoyen') {
      const { rows: countRows } = await query(
        "SELECT COUNT(*)::int AS n FROM signalement WHERE citoyen_id = $1 AND cree_le >= CURRENT_DATE",
        [citoyenId]);
      if (countRows[0].n >= 4) {
        return res.status(429).json({ erreur: 'Vous avez atteint la limite de 4 signalements par jour. Réessayez demain.' });
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
                      cs.libelle AS categorie_nom, cs.famille AS categorie_famille,
                      c.nom AS commune_nom, s.commune_id,
                      u.prenom AS citoyen_prenom, u.nom AS citoyen_nom, u.telephone AS citoyen_tel
                 FROM signalement s
                 LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
                 LEFT JOIN commune c ON c.id = s.commune_id
                 LEFT JOIN utilisateur u ON u.id = s.citoyen_id
                WHERE 1=1`;
    const params = [];
    if (communeId) { params.push(Number(communeId)); sql += ` AND s.commune_id = $${params.length}`; }
    if (etat) { params.push(etat); sql += ` AND s.etat = $${params.length}`; }
    if (categorie) { params.push(categorie); sql += ` AND cs.famille = $${params.length}`; }
    // Superviseur communal : restreint à sa commune
    var isCommune = hasPerimetre(req.user, 'commune');
    if (isCommune && req.user.commune_id) {
      params.push(req.user.commune_id);
      sql += ` AND s.commune_id = $${params.length}`;
    }
    // Entité responsable : ne voit que les dossiers de son domaine d'activité
    if (req.user.fonction === 'entite_responsable' && req.user.organisation_id) {
      sql += ` AND (s.assigne_a IN (SELECT id FROM utilisateur WHERE organisation_id = ${Number(req.user.organisation_id)})`;
      sql += ` OR s.domaine::text IN (SELECT UNNEST(domaines) FROM organisations WHERE id = ${Number(req.user.organisation_id)}))`;
    }
    sql += ` ORDER BY s.cree_le DESC LIMIT 500`;
    const { rows } = await query(sql, params);
    res.json(rows);
  }));

// PATCH /board/:id/etat — workflow via le board (tous domaines)
router.patch('/board/:id/etat',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
    const workflow = require('../../services/workflow');
    const { etat, commentaire, motifRejet, transmisA, delaiPrevu } = req.body;
    if (!etat) return res.status(400).json({ erreur: 'etat requis' });
    try {
      const result = await workflow.transitionEtat(
        req.params.id, etat, req.user,
        { commentaire, motifRejet, transmisA, delaiPrevu }
      );
      res.json(result);
    } catch(e) {
      const msg = e.message || 'Erreur de transition';
      if (msg.includes('non autorisée') || msg.includes('introuvable')) {
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
    const userCaps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (!userCaps.includes('reception') && !userCaps.includes('qualification') && !userCaps.includes('pilotage')) {
      return res.status(403).json({ erreur: 'Capacité insuffisante.' });
    }
    // Vérifier que le signalement existe
    const { rows: sig } = await query('SELECT etat FROM signalement WHERE id=$1', [req.params.id]);
    if (!sig.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
    // Récupérer le nom de l'auteur
    const { rows: usr } = await query('SELECT prenom, nom FROM utilisateur WHERE id=$1', [req.user.id]);
    const auteur = usr.length ? (usr[0].prenom || '') + ' ' + (usr[0].nom || '') : '';
    const typeMap = {
      relance: { action: 'relance_service', label: 'Relance' },
      message: { action: 'message_service', label: 'Message' },
      communique: { action: 'communique_superviseur', label: 'Communiqué' },
      notification: { action: 'notification_superviseur', label: 'Notification' },
      urgence_wali: { action: 'urgence_wali', label: 'Urgence Wali' },
    };
    const tm = typeMap[type] || typeMap.message;
    const action = tm.action;
    const label = tm.label;
    await query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, sig[0].etat, req.user.id, action, label + ' de ' + auteur.trim() + ' : ' + commentaire]
    );
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
           'Le superviseur demande une reprise : ' + motif.trim(),
           '/workspace']
        );
      } catch(e) { /* notification non bloquante */ }
    }

    res.json({ ok: true, etat: 'en_intervention', motif: motif.trim() });
  }));

// POST /board/:id/mission-cap — intervention CAP (tous domaines)
router.post('/board/:id/mission-cap',
  authenticate, requireStaff(),
  asyncH(async (req, res) => {
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
    const { rows } = await query(
      `SELECT h.*, u.prenom, u.nom, u.role
         FROM signalement_historique h
         LEFT JOIN utilisateur u ON u.id = h.par_utilisateur
        WHERE h.signalement_id = $1
        ORDER BY h.le ASC`,
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

module.exports = router;
