/**
 * Module CCOE — Centre de Coordination Opérationnelle des Événements
 *
 * Hiérarchie : Événement → OPORD → Chantier(s) → Checklist + Validation
 * Cloisonnement : chaque organisation ne voit que ses chantiers (sauf cabinet = vue globale).
 * Workflow chantier : non_commence → en_preparation → en_cours → termine → valide
 *                     (bloque possible à tout moment)
 */
const express = require('express');
const multer = require('multer');
const { query, withTransaction } = require('../../db/pool');
const { authenticate, requireFonction, requireCapacite, hasCapacite } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, forbidden, makeReference } = require('../../utils/http');
const config = require('../../config');

const router = express.Router();
const upload = multer({ dest: config.upload.dir, limits: { fileSize: config.upload.maxBytes } });

// All routes require auth
router.use(authenticate);

// ── Helpers ──

/** Cabinet has global visibility; others see only their organisation's chantiers */
function isCabinet(user) {
  return user.fonction === 'cabinet' || hasCapacite(user, 'ccoe');
}

/** Middleware: cabinet (ccoe/pilotage/validation) OR entite_responsable with an org */
function requireCCOE(req, res, next) {
  if (!req.user) return next(require('../../utils/http').unauthorized());
  if (hasCapacite(req.user, 'ccoe', 'pilotage', 'validation')) return next();
  if (req.user.fonction === 'entite_responsable' && req.user.organisation_id) return next();
  // superviseur can read events (lecture seule)
  if (req.user.fonction === 'superviseur') return next();
  return next(require('../../utils/http').forbidden());
}

// ═══════════════════════════════════════════════════════
// ÉVÉNEMENTS
// ═══════════════════════════════════════════════════════

// GET /ccoe/evenements — liste (cabinet = tous, sinon ceux où l'org a des chantiers)
router.get('/evenements', requireCCOE, asyncH(async (req, res) => {
  let sql, params;
  if (isCabinet(req.user)) {
    sql = `SELECT e.*, cm.nom AS commune_nom,
             (SELECT COUNT(*) FROM opord o WHERE o.evenement_id=e.id) AS nb_opords
           FROM evenement e
           LEFT JOIN commune cm ON cm.id = e.commune_id
           ORDER BY e.date_debut DESC LIMIT 100`;
    params = [];
  } else {
    sql = `SELECT DISTINCT e.*, cm.nom AS commune_nom,
             (SELECT COUNT(*) FROM opord o WHERE o.evenement_id=e.id) AS nb_opords
           FROM evenement e
           LEFT JOIN commune cm ON cm.id = e.commune_id
           JOIN opord o ON o.evenement_id = e.id
           JOIN chantier ch ON ch.opord_id = o.id AND ch.organisation_id = $1
           ORDER BY e.date_debut DESC LIMIT 100`;
    params = [req.user.organisation_id];
  }
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// GET /ccoe/evenements/:id — détail
router.get('/evenements/:id', requireCCOE, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT e.*, cm.nom AS commune_nom,
       u1.prenom AS cree_par_prenom, u2.prenom AS responsable_prenom, u3.prenom AS chef_prenom
     FROM evenement e
     LEFT JOIN commune cm ON cm.id = e.commune_id
     LEFT JOIN utilisateur u1 ON u1.id = e.cree_par
     LEFT JOIN utilisateur u2 ON u2.id = e.responsable_cabinet
     LEFT JOIN utilisateur u3 ON u3.id = e.chef_projet
     WHERE e.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Événement introuvable');
  res.json(rows[0]);
}));

// POST /ccoe/evenements — créer (cabinet only)
router.post('/evenements', requireFonction('cabinet'), asyncH(async (req, res) => {
  const b = req.body;
  if (!b.titre || !b.type || !b.date_debut) throw badRequest('titre, type, date_debut requis');
  if (b.type === 'autre' && !b.type_label) throw badRequest('Intitulé du type requis pour « Autre »');
  if (b.date_fin && b.date_fin < b.date_debut) throw badRequest('date_fin doit être ≥ date_debut');
  if (b.heure_debut && b.heure_fin && b.heure_fin <= b.heure_debut) throw badRequest('heure_fin doit être > heure_debut');
  const { rows } = await query(
    `INSERT INTO evenement (titre, titre_ar, type, type_label, importance,
       date_debut, date_fin, heure_debut, heure_fin,
       lieu, lieu_ar, commune_id, lat, lng, description, description_ar,
       itineraire_geojson, zones_geojson, itineraire_description, itineraire_description_ar,
       responsable_cabinet, chef_projet, cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
     RETURNING *`,
    [b.titre, b.titre_ar || null, b.type, b.type_label || null, b.importance || 'normale',
     b.date_debut, b.date_fin || null, b.heure_debut || null, b.heure_fin || null,
     b.lieu || null, b.lieu_ar || null,
     b.commune_id || null, b.lat || null, b.lng || null,
     b.description || null, b.description_ar || null,
     b.itineraire_geojson ? JSON.stringify(b.itineraire_geojson) : null,
     b.zones_geojson ? JSON.stringify(b.zones_geojson) : null,
     b.itineraire_description || null, b.itineraire_description_ar || null,
     b.responsable_cabinet || req.user.id, b.chef_projet || null, req.user.id]);
  res.status(201).json(rows[0]);
}));

// PUT /ccoe/evenements/:id — modifier (cabinet only)
router.put('/evenements/:id', requireFonction('cabinet'), asyncH(async (req, res) => {
  const b = req.body;
  if (b.type === 'autre' && b.type_label === '') throw badRequest('Intitulé du type requis pour « Autre »');
  if (b.date_fin && b.date_debut && b.date_fin < b.date_debut) throw badRequest('date_fin doit être ≥ date_debut');
  if (b.heure_debut && b.heure_fin && b.heure_fin <= b.heure_debut) throw badRequest('heure_fin doit être > heure_debut');
  const { rows } = await query(
    `UPDATE evenement SET
       titre=COALESCE($2,titre), titre_ar=COALESCE($3,titre_ar),
       type=COALESCE($4,type), type_label=COALESCE($5,type_label),
       importance=COALESCE($6,importance),
       date_debut=COALESCE($7,date_debut), date_fin=$8,
       heure_debut=$9, heure_fin=$10,
       lieu=COALESCE($11,lieu), lieu_ar=COALESCE($12,lieu_ar),
       commune_id=COALESCE($13,commune_id), lat=COALESCE($14,lat), lng=COALESCE($15,lng),
       description=COALESCE($16,description), description_ar=COALESCE($17,description_ar),
       itineraire_geojson=COALESCE($18,itineraire_geojson),
       zones_geojson=COALESCE($19,zones_geojson),
       itineraire_description=COALESCE($20,itineraire_description),
       itineraire_description_ar=COALESCE($21,itineraire_description_ar),
       responsable_cabinet=COALESCE($22,responsable_cabinet),
       chef_projet=COALESCE($23,chef_projet),
       statut=COALESCE($24,statut), maj_le=NOW()
     WHERE id=$1 RETURNING *`,
    [req.params.id, b.titre, b.titre_ar, b.type, b.type_label,
     b.importance, b.date_debut, b.date_fin || null, b.heure_debut || null, b.heure_fin || null,
     b.lieu, b.lieu_ar,
     b.commune_id, b.lat, b.lng, b.description, b.description_ar,
     b.itineraire_geojson ? JSON.stringify(b.itineraire_geojson) : undefined,
     b.zones_geojson ? JSON.stringify(b.zones_geojson) : undefined,
     b.itineraire_description, b.itineraire_description_ar,
     b.responsable_cabinet, b.chef_projet, b.statut]);
  if (!rows.length) throw notFound();
  res.json(rows[0]);
}));

// ═══════════════════════════════════════════════════════
// OPORD (Ordre d'Opération)
// ═══════════════════════════════════════════════════════

// GET /ccoe/evenements/:evtId/opord
router.get('/evenements/:evtId/opord', requireCCOE, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT o.*, u.prenom AS cree_par_prenom,
       (SELECT COUNT(*) FROM chantier c WHERE c.opord_id=o.id) AS nb_chantiers
     FROM opord o LEFT JOIN utilisateur u ON u.id = o.cree_par
     WHERE o.evenement_id = $1 ORDER BY o.cree_le DESC`, [req.params.evtId]);
  res.json(rows);
}));

// POST /ccoe/evenements/:evtId/opord — créer OPORD (cabinet)
router.post('/evenements/:evtId/opord', requireFonction('cabinet'), asyncH(async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `INSERT INTO opord (evenement_id, objectif, objectif_ar, intention_commandement,
       intention_commandement_ar, organisation, organisation_ar, cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.params.evtId, b.objectif || null, b.objectif_ar || null,
     b.intention_commandement || null, b.intention_commandement_ar || null,
     b.organisation || null, b.organisation_ar || null, req.user.id]);
  res.status(201).json(rows[0]);
}));

// PUT /ccoe/evenements/:evtId/opord/:id — modifier OPORD
router.put('/evenements/:evtId/opord/:id', requireFonction('cabinet'), asyncH(async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `UPDATE opord SET objectif=COALESCE($2,objectif), objectif_ar=COALESCE($3,objectif_ar),
       intention_commandement=COALESCE($4,intention_commandement),
       intention_commandement_ar=COALESCE($5,intention_commandement_ar),
       organisation=COALESCE($6,organisation), organisation_ar=COALESCE($7,organisation_ar),
       statut=COALESCE($8,statut), maj_le=NOW()
     WHERE id=$1 AND evenement_id=$9 RETURNING *`,
    [req.params.id, b.objectif, b.objectif_ar, b.intention_commandement,
     b.intention_commandement_ar, b.organisation, b.organisation_ar,
     b.statut, req.params.evtId]);
  if (!rows.length) throw notFound();
  res.json(rows[0]);
}));

// POST /ccoe/opord/:opordId/generer — générer chantiers depuis gabarit
router.post('/opord/:opordId/generer', requireFonction('cabinet'), asyncH(async (req, res) => {
  const { gabarit_id, date_limite } = req.body;
  if (!gabarit_id) throw badRequest('gabarit_id requis');

  const axes = (await query(
    `SELECT ga.axe, ga.titre, ga.titre_ar, ga.ordre
     FROM gabarit_axe ga WHERE ga.gabarit_id = $1 ORDER BY ga.ordre`, [gabarit_id])).rows;
  if (!axes.length) throw badRequest('Gabarit sans axes');

  const created = await withTransaction(async (client) => {
    const results = [];
    for (const axe of axes) {
      // Lookup default organisation for this axe
      const orgRow = (await client.query(
        'SELECT organisation_id FROM ccoe_axe_organisation WHERE axe=$1', [axe.axe])).rows[0];

      const ch = (await client.query(
        `INSERT INTO chantier (opord_id, axe, organisation_id, titre, titre_ar, date_limite)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [req.params.opordId, axe.axe, orgRow?.organisation_id || null,
         axe.titre, axe.titre_ar, date_limite || null])).rows[0];

      // Copy checklist items from gabarit
      const items = (await client.query(
        `SELECT libelle, libelle_ar, ordre FROM gabarit_checklist
         WHERE axe_id = (SELECT id FROM gabarit_axe WHERE gabarit_id=$1 AND axe=$2)
         ORDER BY ordre`, [gabarit_id, axe.axe])).rows;

      for (const item of items) {
        await client.query(
          `INSERT INTO chantier_checklist (chantier_id, libelle, libelle_ar, ordre)
           VALUES ($1,$2,$3,$4)`, [ch.id, item.libelle, item.libelle_ar, item.ordre]);
      }
      results.push({ ...ch, nb_checklist: items.length });
    }
    return results;
  });

  res.status(201).json(created);
}));

// ═══════════════════════════════════════════════════════
// CHANTIERS
// ═══════════════════════════════════════════════════════

// GET /ccoe/chantiers?opord_id=X — liste chantiers (cloisonnée par org sauf cabinet)
router.get('/chantiers', requireCCOE, asyncH(async (req, res) => {
  const { opord_id } = req.query;
  let sql = `SELECT ch.*, org.nom AS organisation_nom, org.nom_ar AS organisation_nom_ar,
       u.prenom AS responsable_prenom,
       (SELECT COUNT(*) FROM chantier_checklist cl WHERE cl.chantier_id=ch.id) AS nb_checklist,
       (SELECT COUNT(*) FROM chantier_checklist cl WHERE cl.chantier_id=ch.id AND cl.coche=TRUE) AS nb_fait
     FROM chantier ch
     LEFT JOIN organisations org ON org.id = ch.organisation_id
     LEFT JOIN utilisateur u ON u.id = ch.responsable_id
     WHERE 1=1`;
  const params = [];

  if (opord_id) { params.push(opord_id); sql += ` AND ch.opord_id = $${params.length}`; }

  // Cloisonnement: non-cabinet ne voit que ses chantiers
  if (!isCabinet(req.user)) {
    params.push(req.user.organisation_id);
    sql += ` AND ch.organisation_id = $${params.length}`;
  }

  sql += ' ORDER BY ch.axe, ch.cree_le';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// GET /ccoe/chantiers/:id — détail chantier avec checklist
router.get('/chantiers/:id', requireCCOE, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT ch.*, org.nom AS organisation_nom, org.nom_ar AS organisation_nom_ar,
       u1.prenom AS responsable_prenom, u2.prenom AS adjoint_prenom
     FROM chantier ch
     LEFT JOIN organisations org ON org.id = ch.organisation_id
     LEFT JOIN utilisateur u1 ON u1.id = ch.responsable_id
     LEFT JOIN utilisateur u2 ON u2.id = ch.adjoint_id
     WHERE ch.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Chantier introuvable');

  const ch = rows[0];
  // Cloisonnement
  if (!isCabinet(req.user) && ch.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé à votre organisation');
  }

  // Auto-vu: first opening by org member after transmission
  if (ch.transmis_le && !ch.vu_le && !isCabinet(req.user) && ch.organisation_id === req.user.organisation_id) {
    await query('UPDATE chantier SET vu_le=NOW(), vu_par=$2 WHERE id=$1', [ch.id, req.user.id]);
    ch.vu_le = new Date().toISOString();
    ch.vu_par = req.user.id;
    try {
      await query(`INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
        VALUES ($1, $2, $3, 'systeme')`, [ch.id, req.user.id, 'Consulté par ' + (req.user.prenom || 'service')]);
    } catch(e) {}
  }

  // Checklist
  ch.checklist = (await query(
    `SELECT cl.*, u.prenom AS agent_prenom FROM chantier_checklist cl
     LEFT JOIN utilisateur u ON u.id = cl.agent_id
     WHERE cl.chantier_id = $1 ORDER BY cl.ordre`, [ch.id])).rows;

  // Validations
  ch.validations = (await query(
    `SELECT v.*, u.prenom AS auteur_prenom FROM chantier_validation v
     LEFT JOIN utilisateur u ON u.id = v.auteur_id
     WHERE v.chantier_id = $1 ORDER BY v.le DESC`, [ch.id])).rows;

  // Commentaires
  ch.commentaires = (await query(
    `SELECT c.*, u.prenom AS auteur_prenom FROM chantier_commentaire c
     LEFT JOIN utilisateur u ON u.id = c.auteur_id
     WHERE c.chantier_id = $1 ORDER BY c.le DESC`, [ch.id])).rows;

  res.json(ch);
}));

// PUT /ccoe/chantiers/:id/statut — transition de statut
router.put('/chantiers/:id/statut', requireCCOE, asyncH(async (req, res) => {
  const { statut } = req.body;
  if (!statut) throw badRequest('statut requis');

  const VALID_TRANSITIONS = {
    'non_commence':   ['en_preparation', 'bloque'],
    'en_preparation': ['en_cours', 'bloque'],
    'en_cours':       ['termine', 'bloque'],
    'bloque':         ['en_preparation', 'en_cours'],
    'termine':        ['valide', 'en_cours'],  // valide = par cabinet seulement
  };

  const ch = (await query('SELECT * FROM chantier WHERE id=$1', [req.params.id])).rows[0];
  if (!ch) throw notFound();

  // Cloisonnement
  if (!isCabinet(req.user) && ch.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé à votre organisation');
  }

  // 'valide' requires cabinet or validation capacite
  if (statut === 'valide' && !isCabinet(req.user)) {
    throw forbidden('Seul le cabinet peut valider');
  }

  const allowed = VALID_TRANSITIONS[ch.statut];
  if (!allowed || !allowed.includes(statut)) {
    throw badRequest(`Transition ${ch.statut} → ${statut} non autorisée`);
  }

  const { rows } = await query(
    `UPDATE chantier SET statut=$2, maj_le=NOW() WHERE id=$1 RETURNING *`,
    [req.params.id, statut]);

  // Auto-create validation record for 'valide'
  if (statut === 'valide') {
    await query(
      `INSERT INTO chantier_validation (chantier_id, niveau, auteur_id, decision, motif)
       VALUES ($1, 'cabinet', $2, 'valide', $3)`,
      [req.params.id, req.user.id, req.body.motif || null]);
  }

  res.json(rows[0]);
}));

// PUT /ccoe/chantiers/:id — modifier chantier
router.put('/chantiers/:id', requireCCOE, asyncH(async (req, res) => {
  const ch = (await query('SELECT * FROM chantier WHERE id=$1', [req.params.id])).rows[0];
  if (!ch) throw notFound();
  if (!isCabinet(req.user) && ch.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé à votre organisation');
  }

  const b = req.body;
  const { rows } = await query(
    `UPDATE chantier SET
       titre=COALESCE($2,titre), titre_ar=COALESCE($3,titre_ar),
       description=COALESCE($4,description), description_ar=COALESCE($5,description_ar),
       responsable_id=COALESCE($6,responsable_id), adjoint_id=COALESCE($7,adjoint_id),
       date_limite=COALESCE($8,date_limite), lat=COALESCE($9,lat), lng=COALESCE($10,lng),
       maj_le=NOW()
     WHERE id=$1 RETURNING *`,
    [req.params.id, b.titre, b.titre_ar, b.description, b.description_ar,
     b.responsable_id, b.adjoint_id, b.date_limite, b.lat, b.lng]);
  res.json(rows[0]);
}));

// ═══════════════════════════════════════════════════════
// CHECKLIST
// ═══════════════════════════════════════════════════════

// PUT /ccoe/checklist/:id/cocher — cocher/décocher un item
router.put('/checklist/:id/cocher', requireCCOE, asyncH(async (req, res) => {
  const item = (await query(
    `SELECT cl.*, ch.organisation_id FROM chantier_checklist cl
     JOIN chantier ch ON ch.id = cl.chantier_id
     WHERE cl.id=$1`, [req.params.id])).rows[0];
  if (!item) throw notFound();
  if (!isCabinet(req.user) && item.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé');
  }

  const coche = req.body.coche !== undefined ? req.body.coche : !item.coche;
  const { rows } = await query(
    `UPDATE chantier_checklist SET coche=$2, agent_id=$3, coche_le=CASE WHEN $2 THEN NOW() ELSE NULL END
     WHERE id=$1 RETURNING *`,
    [req.params.id, coche, req.user.id]);
  res.json(rows[0]);
}));

// POST /ccoe/checklist/:id/photo — upload photo preuve
router.post('/checklist/:id/photo', upload.single('photo'), requireCCOE, asyncH(async (req, res) => {
  if (!req.file) throw badRequest('Photo requise');
  const item = (await query(
    `SELECT cl.*, ch.organisation_id FROM chantier_checklist cl
     JOIN chantier ch ON ch.id = cl.chantier_id
     WHERE cl.id=$1`, [req.params.id])).rows[0];
  if (!item) throw notFound();
  if (!isCabinet(req.user) && item.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé');
  }

  const { rows } = await query(
    `UPDATE chantier_checklist SET photo_path=$2, agent_id=$3, coche=TRUE, coche_le=NOW()
     WHERE id=$1 RETURNING *`,
    [req.params.id, '/uploads/' + req.file.filename, req.user.id]);
  res.json(rows[0]);
}));

// ═══════════════════════════════════════════════════════
// COMMENTAIRES
// ═══════════════════════════════════════════════════════

router.post('/chantiers/:id/commentaires', upload.single('photo'), requireCCOE, asyncH(async (req, res) => {
  const ch = (await query('SELECT organisation_id FROM chantier WHERE id=$1', [req.params.id])).rows[0];
  if (!ch) throw notFound();
  if (!isCabinet(req.user) && ch.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé');
  }

  const { rows } = await query(
    `INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, photo_path)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.params.id, req.user.id, req.body.message,
     req.file ? '/uploads/' + req.file.filename : null]);
  res.status(201).json(rows[0]);
}));

// ═══════════════════════════════════════════════════════
// DEMANDE DE VALIDATION (entité responsable → Cabinet)
// ═══════════════════════════════════════════════════════

router.post('/chantiers/:id/demander-validation', requireCCOE, asyncH(async (req, res) => {
  const ch = (await query('SELECT * FROM chantier WHERE id=$1', [req.params.id])).rows[0];
  if (!ch) throw notFound();
  if (!isCabinet(req.user) && ch.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé à votre organisation');
  }
  // Must be termine or en_cours to request validation
  if (!['termine', 'en_cours'].includes(ch.statut)) {
    throw badRequest('Le chantier doit être terminé ou en cours pour demander validation');
  }
  // Set to termine if not already
  if (ch.statut !== 'termine') {
    await query(`UPDATE chantier SET statut='termine', maj_le=NOW() WHERE id=$1`, [req.params.id]);
  }
  // Create a validation request record (decision = 'demande')
  const { rows } = await query(
    `INSERT INTO chantier_commentaire (chantier_id, auteur_id, message)
     VALUES ($1, $2, $3) RETURNING *`,
    [req.params.id, req.user.id, '📋 Demande de validation Cabinet' + (req.body.message ? ' — ' + req.body.message : '')]);
  res.status(201).json(rows[0]);
}));

// ═══════════════════════════════════════════════════════
// VALIDATIONS (Cabinet only)
// ═══════════════════════════════════════════════════════

router.post('/chantiers/:id/valider', requireCapacite('validation', 'ccoe'), asyncH(async (req, res) => {
  const { decision, motif, niveau } = req.body;
  if (!decision) throw badRequest('decision requis (valide/refuse/reserve)');

  const ch = (await query('SELECT * FROM chantier WHERE id=$1', [req.params.id])).rows[0];
  if (!ch) throw notFound();

  const { rows } = await query(
    `INSERT INTO chantier_validation (chantier_id, niveau, auteur_id, decision, motif)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.params.id, niveau || 'cabinet', req.user.id, decision, motif || null]);

  // Auto-update statut if approved
  if (decision === 'valide') {
    await query(`UPDATE chantier SET statut='valide', maj_le=NOW() WHERE id=$1`, [req.params.id]);
  }

  res.status(201).json(rows[0]);
}));

// ═══════════════════════════════════════════════════════
// GABARITS (lecture seule)
// ═══════════════════════════════════════════════════════

router.get('/gabarits', requireCCOE, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT g.*, (SELECT COUNT(*) FROM gabarit_axe ga WHERE ga.gabarit_id=g.id) AS nb_axes
     FROM gabarit_evenement g WHERE g.actif=TRUE ORDER BY g.nom`);
  res.json(rows);
}));

router.get('/gabarits/:id', requireCCOE, asyncH(async (req, res) => {
  const g = (await query('SELECT * FROM gabarit_evenement WHERE id=$1', [req.params.id])).rows[0];
  if (!g) throw notFound();

  g.axes = (await query(
    `SELECT ga.*, (SELECT json_agg(gc ORDER BY gc.ordre) FROM gabarit_checklist gc WHERE gc.axe_id=ga.id) AS checklists
     FROM gabarit_axe ga WHERE ga.gabarit_id=$1 ORDER BY ga.ordre`, [req.params.id])).rows;

  res.json(g);
}));

// ═══════════════════════════════════════════════════════
// TABLEAU DE BORD CCOE (stats)
// ═══════════════════════════════════════════════════════

router.get('/dashboard', requireCCOE, asyncH(async (req, res) => {
  const orgFilter = isCabinet(req.user) ? '' : ' AND ch.organisation_id = ' + parseInt(req.user.organisation_id);

  const stats = (await query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE ch.statut='non_commence') AS non_commence,
      COUNT(*) FILTER (WHERE ch.statut='en_preparation') AS en_preparation,
      COUNT(*) FILTER (WHERE ch.statut='en_cours') AS en_cours,
      COUNT(*) FILTER (WHERE ch.statut='termine') AS termine,
      COUNT(*) FILTER (WHERE ch.statut='valide') AS valide,
      COUNT(*) FILTER (WHERE ch.statut='bloque') AS bloque,
      COUNT(*) FILTER (WHERE ch.date_limite < NOW() AND ch.statut NOT IN ('termine','valide')) AS en_retard
    FROM chantier ch` + orgFilter)).rows[0];

  const parAxe = (await query(`
    SELECT ch.axe, COUNT(*) AS total,
      COUNT(*) FILTER (WHERE ch.statut IN ('termine','valide')) AS fait
    FROM chantier ch WHERE 1=1` + orgFilter + ` GROUP BY ch.axe ORDER BY ch.axe`)).rows;

  const prochains = (await query(`
    SELECT e.id, e.titre, e.date_debut, e.importance, e.statut
    FROM evenement e WHERE e.date_debut >= CURRENT_DATE
    ORDER BY e.date_debut LIMIT 5`)).rows;

  res.json({ stats, parAxe, prochains });
}));

// ═══════════════════════════════════════════════════════
// CARTE — chantiers géolocalisés
// ═══════════════════════════════════════════════════════

router.get('/carte', requireCCOE, asyncH(async (req, res) => {
  const orgFilter = isCabinet(req.user) ? '' : ' AND ch.organisation_id = ' + parseInt(req.user.organisation_id);
  const chantiers = (await query(`
    SELECT ch.id, ch.titre, ch.axe, ch.statut, ch.lat, ch.lng,
      org.nom AS organisation_nom, ch.date_limite
    FROM chantier ch
    LEFT JOIN organisations org ON org.id = ch.organisation_id
    WHERE ch.lat IS NOT NULL AND ch.lng IS NOT NULL` + orgFilter)).rows;
  // Include event geo data (itineraires + zones)
  const evenements = (await query(`
    SELECT id, titre, itineraire_geojson, zones_geojson
    FROM evenement WHERE itineraire_geojson IS NOT NULL OR zones_geojson IS NOT NULL
    ORDER BY date_debut DESC LIMIT 10`)).rows;
  res.json({ chantiers, evenements });
}));

// ═══════════════════════════════════════════════════════
// GÉNÉRATION CHANTIERS PAR AXES SÉLECTIONNÉS (type "autre")
// ═══════════════════════════════════════════════════════

router.post('/opord/:opordId/generer-axes', requireFonction('cabinet'), asyncH(async (req, res) => {
  const { axes, date_limite } = req.body;
  if (!axes || !Array.isArray(axes) || !axes.length) throw badRequest('Au moins un axe requis');

  const created = await withTransaction(async (client) => {
    const results = [];
    for (const axe of axes) {
      const orgRow = (await client.query(
        'SELECT organisation_id FROM ccoe_axe_organisation WHERE axe=$1', [axe])).rows[0];
      // Get checklist from the default gabarit (first active)
      const gabarit = (await client.query(
        'SELECT id FROM gabarit_evenement WHERE actif=TRUE ORDER BY id LIMIT 1')).rows[0];
      const gabaritAxe = gabarit ? (await client.query(
        'SELECT id, titre, titre_ar FROM gabarit_axe WHERE gabarit_id=$1 AND axe=$2',
        [gabarit.id, axe])).rows[0] : null;

      const titre = gabaritAxe?.titre || axe.replace(/_/g, ' ');
      const titre_ar = gabaritAxe?.titre_ar || null;

      const ch = (await client.query(
        `INSERT INTO chantier (opord_id, axe, organisation_id, titre, titre_ar, date_limite)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [req.params.opordId, axe, orgRow?.organisation_id || null,
         titre, titre_ar, date_limite || null])).rows[0];

      // Copy checklist items if gabarit has this axe
      if (gabaritAxe) {
        const items = (await client.query(
          'SELECT libelle, libelle_ar, ordre FROM gabarit_checklist WHERE axe_id=$1 ORDER BY ordre',
          [gabaritAxe.id])).rows;
        for (const item of items) {
          await client.query(
            'INSERT INTO chantier_checklist (chantier_id, libelle, libelle_ar, ordre) VALUES ($1,$2,$3,$4)',
            [ch.id, item.libelle, item.libelle_ar, item.ordre]);
        }
        results.push({ ...ch, nb_checklist: items.length });
      } else {
        results.push({ ...ch, nb_checklist: 0 });
      }
    }
    return results;
  });
  res.status(201).json(created);
}));

// ═══════════════════════════════════════════════════════
// CONTACT RESPONSABLE — fiche par chantier
// ═══════════════════════════════════════════════════════

router.get('/chantiers/:id/contact', requireCCOE, asyncH(async (req, res) => {
  const ch = (await query('SELECT organisation_id, axe, responsable_id FROM chantier WHERE id=$1',
    [req.params.id])).rows[0];
  if (!ch) throw notFound();
  if (!isCabinet(req.user) && ch.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé');
  }
  // 1. Try annuaire CCOE by axe+org
  let contact = (await query(
    `SELECT * FROM ccoe_contact WHERE axe=$1 AND organisation_id=$2 AND actif=TRUE LIMIT 1`,
    [ch.axe, ch.organisation_id])).rows[0];
  // 2. Fallback: responsable user
  if (!contact && ch.responsable_id) {
    const u = (await query(
      `SELECT prenom, nom, telephone, email, organisation_id FROM utilisateur WHERE id=$1`,
      [ch.responsable_id])).rows[0];
    if (u) contact = { nom: u.nom || u.prenom, prenom: u.prenom, telephone: u.telephone, email: u.email, organisation_id: u.organisation_id };
  }
  // 3. Fallback: annuaire by axe only
  if (!contact) {
    contact = (await query('SELECT * FROM ccoe_contact WHERE axe=$1 AND actif=TRUE LIMIT 1', [ch.axe])).rows[0];
  }
  res.json(contact || { erreur: 'Aucun contact trouvé' });
}));

// ═══════════════════════════════════════════════════════
// MESSAGERIE CHANTIER (commentaire typé + email)
// ═══════════════════════════════════════════════════════

router.post('/chantiers/:id/message', requireCCOE, asyncH(async (req, res) => {
  const { type_message, message } = req.body;
  if (!message) throw badRequest('message requis');
  const TYPES = ['demande_precision', 'relance', 'point_situation', 'demande_rapport'];
  if (type_message && !TYPES.includes(type_message)) throw badRequest('type_message invalide');

  const ch = (await query('SELECT organisation_id, axe, titre FROM chantier WHERE id=$1',
    [req.params.id])).rows[0];
  if (!ch) throw notFound();
  if (!isCabinet(req.user) && ch.organisation_id !== req.user.organisation_id) {
    throw forbidden('Accès réservé');
  }

  // Save as typed comment
  const { rows } = await query(
    `INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.params.id, req.user.id, message, type_message || null]);

  // Fire-and-forget email to responsable
  try {
    const contact = (await query(
      `SELECT email FROM ccoe_contact WHERE axe=$1 AND organisation_id=$2 AND actif=TRUE LIMIT 1`,
      [ch.axe, ch.organisation_id])).rows[0];
    if (contact?.email) {
      const { notify } = require('../../services/notifier');
      const typeLabel = { demande_precision: 'Demande de précision', relance: 'Relance', point_situation: 'Point de situation', demande_rapport: 'Demande de rapport' };
      notify({
        email: contact.email,
        subject: `[CCOE] ${typeLabel[type_message] || 'Message'} — ${ch.titre}`,
        html: `<p><strong>${typeLabel[type_message] || 'Message'}</strong> sur le chantier <em>${ch.titre}</em></p><p>${message}</p>`
      });
      console.log('[CCOE] Email tenté vers', contact.email);
    }
  } catch (e) {
    console.log('[CCOE] Email non envoyé (non bloquant):', e.message);
  }

  res.status(201).json(rows[0]);
}));

// ═══════════════════════════════════════════════════════
// ANNUAIRE CCOE — CRUD (cabinet only)
// ═══════════════════════════════════════════════════════

router.get('/annuaire', requireCCOE, asyncH(async (req, res) => {
  if (!isCabinet(req.user)) throw forbidden('Réservé au Cabinet');
  const { rows } = await query(
    `SELECT c.*, o.nom AS organisation_nom FROM ccoe_contact c
     LEFT JOIN organisations o ON o.id = c.organisation_id
     WHERE c.actif = TRUE ORDER BY c.axe, c.nom`);
  res.json(rows);
}));

router.get('/annuaire/:id', requireCCOE, asyncH(async (req, res) => {
  if (!isCabinet(req.user)) throw forbidden('Réservé au Cabinet');
  const { rows } = await query('SELECT * FROM ccoe_contact WHERE id=$1', [req.params.id]);
  if (!rows.length) throw notFound();
  res.json(rows[0]);
}));

router.post('/annuaire', requireFonction('cabinet'), asyncH(async (req, res) => {
  const b = req.body;
  if (!b.nom) throw badRequest('nom requis');
  const { rows } = await query(
    `INSERT INTO ccoe_contact (nom, prenom, telephone, email, organisation_id, axe, fonction_label, fonction_label_ar)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [b.nom, b.prenom || null, b.telephone || null, b.email || null,
     b.organisation_id || null, b.axe || null, b.fonction_label || null, b.fonction_label_ar || null]);
  res.status(201).json(rows[0]);
}));

router.put('/annuaire/:id', requireFonction('cabinet'), asyncH(async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `UPDATE ccoe_contact SET nom=COALESCE($2,nom), prenom=COALESCE($3,prenom),
       telephone=COALESCE($4,telephone), email=COALESCE($5,email),
       organisation_id=COALESCE($6,organisation_id), axe=COALESCE($7,axe),
       fonction_label=COALESCE($8,fonction_label), fonction_label_ar=COALESCE($9,fonction_label_ar),
       maj_le=NOW()
     WHERE id=$1 RETURNING *`,
    [req.params.id, b.nom, b.prenom, b.telephone, b.email,
     b.organisation_id, b.axe, b.fonction_label, b.fonction_label_ar]);
  if (!rows.length) throw notFound();
  res.json(rows[0]);
}));

router.delete('/annuaire/:id', requireFonction('cabinet'), asyncH(async (req, res) => {
  await query('UPDATE ccoe_contact SET actif=FALSE, maj_le=NOW() WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

// ═══════════════════════════════════════════════════════
// PARCOURS GUIDÉ : événement → OPORD + chantiers en un geste
// ═══════════════════════════════════════════════════════

router.post('/evenements/:evtId/generer-complet', requireFonction('cabinet'), asyncH(async (req, res) => {
  const { intention, axes, date_limite, gabarit_id } = req.body;
  const evtId = req.params.evtId;

  // Get event
  const evt = (await query('SELECT * FROM evenement WHERE id=$1', [evtId])).rows[0];
  if (!evt) throw notFound('Événement introuvable');

  // Create OPORD
  const opord = (await query(
    `INSERT INTO opord (evenement_id, objectif, intention_commandement, cree_par, statut)
     VALUES ($1,$2,$3,$4,'actif') RETURNING *`,
    [evtId, evt.titre, intention || null, req.user.id])).rows[0];

  // Generate chantiers
  let chantiers;
  if (axes && axes.length) {
    // Custom axes (type "autre")
    chantiers = await withTransaction(async (client) => {
      const results = [];
      for (const axe of axes) {
        const orgRow = (await client.query(
          'SELECT organisation_id FROM ccoe_axe_organisation WHERE axe=$1', [axe])).rows[0];
        const gabarit = (await client.query(
          'SELECT id FROM gabarit_evenement WHERE actif=TRUE ORDER BY id LIMIT 1')).rows[0];
        const ga = gabarit ? (await client.query(
          'SELECT id, titre, titre_ar FROM gabarit_axe WHERE gabarit_id=$1 AND axe=$2',
          [gabarit.id, axe])).rows[0] : null;
        const ch = (await client.query(
          `INSERT INTO chantier (opord_id, axe, organisation_id, titre, titre_ar, date_limite)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [opord.id, axe, orgRow?.organisation_id || null,
           ga?.titre || axe.replace(/_/g, ' '), ga?.titre_ar || null,
           date_limite || evt.date_debut])).rows[0];
        if (ga) {
          const items = (await client.query(
            'SELECT libelle, libelle_ar, ordre FROM gabarit_checklist WHERE axe_id=$1 ORDER BY ordre',
            [ga.id])).rows;
          for (const item of items) {
            await client.query(
              'INSERT INTO chantier_checklist (chantier_id, libelle, libelle_ar, ordre) VALUES ($1,$2,$3,$4)',
              [ch.id, item.libelle, item.libelle_ar, item.ordre]);
          }
        }
        results.push(ch);
      }
      return results;
    });
  } else {
    // Full gabarit
    const gId = gabarit_id || (await query('SELECT id FROM gabarit_evenement WHERE actif=TRUE LIMIT 1')).rows[0]?.id;
    if (!gId) throw badRequest('Aucun gabarit disponible');
    const gaAxes = (await query(
      'SELECT axe, titre, titre_ar, ordre FROM gabarit_axe WHERE gabarit_id=$1 ORDER BY ordre', [gId])).rows;
    chantiers = await withTransaction(async (client) => {
      const results = [];
      for (const axe of gaAxes) {
        const orgRow = (await client.query(
          'SELECT organisation_id FROM ccoe_axe_organisation WHERE axe=$1', [axe.axe])).rows[0];
        const ch = (await client.query(
          `INSERT INTO chantier (opord_id, axe, organisation_id, titre, titre_ar, date_limite)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [opord.id, axe.axe, orgRow?.organisation_id || null,
           axe.titre, axe.titre_ar, date_limite || evt.date_debut])).rows[0];
        const items = (await client.query(
          'SELECT libelle, libelle_ar, ordre FROM gabarit_checklist WHERE axe_id=(SELECT id FROM gabarit_axe WHERE gabarit_id=$1 AND axe=$2) ORDER BY ordre',
          [gId, axe.axe])).rows;
        for (const item of items) {
          await client.query(
            'INSERT INTO chantier_checklist (chantier_id, libelle, libelle_ar, ordre) VALUES ($1,$2,$3,$4)',
            [ch.id, item.libelle, item.libelle_ar, item.ordre]);
        }
        results.push(ch);
      }
      return results;
    });
  }

  res.status(201).json({ opord, chantiers });
}));

// ═══════════════════════════════════════════════════════
// TRANSMISSION AUX SERVICES (notifications multi-canal)
// ═══════════════════════════════════════════════════════

// Helper: notify one chantier
async function transmettreChantier(chantierId, userId, userName) {
  const ch = (await query(
    `SELECT ch.*, o.nom AS org_nom, e.titre AS evt_titre, e.date_debut
     FROM chantier ch
     LEFT JOIN organisations o ON o.id = ch.organisation_id
     LEFT JOIN opord op ON op.id = ch.opord_id
     LEFT JOIN evenement e ON e.id = op.evenement_id
     WHERE ch.id = $1`, [chantierId])).rows[0];
  if (!ch) return null;

  // Mark as transmitted
  await query('UPDATE chantier SET transmis_le=NOW(), transmis_par=$2 WHERE id=$1', [chantierId, userId]);

  // Trace in fil
  await query(
    `INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
     VALUES ($1, $2, $3, 'transmission')`,
    [chantierId, userId, 'Ordre transmis par ' + (userName || 'Cabinet')]);

  // In-app notifications to all users of the org
  if (ch.organisation_id) {
    const users = (await query(
      'SELECT id FROM utilisateur WHERE organisation_id=$1 AND actif=TRUE', [ch.organisation_id])).rows;
    const dateStr = ch.date_debut ? new Date(ch.date_debut).toLocaleDateString('fr-FR') : '';
    for (const u of users) {
      try {
        await query(
          'INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1,$2,$3,$4,$5)',
          [u.id, 'ccoe',
           'Nouvel ordre CCOE : ' + (ch.axe || ''),
           (ch.evt_titre || ch.titre) + ' — échéance ' + dateStr,
           '/mes-chantiers-ccoe#' + chantierId]);
      } catch(e) { /* non-bloquant */ }
    }
  }

  // Email to contact from annuaire
  try {
    const contact = (await query(
      'SELECT email FROM ccoe_contact WHERE axe=$1 AND organisation_id=$2 AND actif=TRUE LIMIT 1',
      [ch.axe, ch.organisation_id])).rows[0];
    if (contact?.email) {
      const { notify } = require('../../services/notifier');
      notify({
        email: contact.email,
        subject: '[CCOE] Ordre de mission — ' + (ch.axe || '') + ' — ' + (ch.evt_titre || ch.titre),
        html: '<h3>Ordre de mission CCOE</h3>' +
          '<p><strong>Événement :</strong> ' + (ch.evt_titre || '') + '</p>' +
          '<p><strong>Axe :</strong> ' + (ch.axe || '') + '</p>' +
          '<p><strong>Chantier :</strong> ' + (ch.titre || '') + '</p>' +
          '<p><strong>Échéance :</strong> ' + (ch.date_limite ? new Date(ch.date_limite).toLocaleDateString('fr-FR') : 'non définie') + '</p>' +
          '<p style="margin-top:16px;padding:10px;background:#FEF3C7;border-radius:6px;"><strong>Merci d\'accuser réception dans l\'application.</strong></p>'
      });
      console.log('[CCOE] Email ordre transmis →', contact.email);
      // Trace email status in fil
      try { await query(`INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
        VALUES ($1, $2, $3, 'systeme')`, [chantierId, userId, 'Email envoyé au responsable (' + contact.email + ')']); } catch(e2) {}
    } else {
      try { await query(`INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
        VALUES ($1, $2, $3, 'systeme')`, [chantierId, userId, 'Pas de contact email — canal in-app seul']); } catch(e2) {}
    }
  } catch(e) {
    console.log('[CCOE] Email non envoyé (non bloquant):', e.message);
    try { await query(`INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
      VALUES ($1, $2, $3, 'systeme')`, [chantierId, userId, 'Échec d\'envoi email — canal in-app seul']); } catch(e2) {}
  }

  return ch;
}

// POST /ccoe/evenements/:evtId/transmettre — transmettre les chantiers sélectionnés (ou tous si pas de sélection)
router.post('/evenements/:evtId/transmettre', requireFonction('cabinet'), asyncH(async (req, res) => {
  const { chantier_ids } = req.body || {};
  let sql = `SELECT ch.id FROM chantier ch
     JOIN opord o ON o.id = ch.opord_id
     WHERE o.evenement_id = $1 AND ch.transmis_le IS NULL`;
  const params = [req.params.evtId];
  if (chantier_ids && Array.isArray(chantier_ids) && chantier_ids.length) {
    params.push(chantier_ids);
    sql += ` AND ch.id = ANY($2::int[])`;
  }
  const chantiers = (await query(sql, params)).rows;

  const transmitted = [];
  for (const ch of chantiers) {
    const result = await transmettreChantier(ch.id, req.user.id, req.user.prenom || 'Cabinet');
    if (result) transmitted.push(result);
  }

  // Update OPORD statut to 'diffuse'
  await query(
    `UPDATE opord SET statut='diffuse', maj_le=NOW()
     WHERE evenement_id=$1 AND statut != 'diffuse'`, [req.params.evtId]);

  res.json({ transmis: transmitted.length });
}));

// POST /ccoe/chantiers/:id/transmettre — transmettre un seul chantier
router.post('/chantiers/:id/transmettre', requireFonction('cabinet'), asyncH(async (req, res) => {
  const result = await transmettreChantier(req.params.id, req.user.id, req.user.prenom || 'Cabinet');
  if (!result) throw notFound();
  res.json({ ok: true });
}));

// POST /ccoe/evenements/:evtId/relancer — relancer les chantiers non commencés ou en retard
router.post('/evenements/:evtId/relancer', requireFonction('cabinet'), asyncH(async (req, res) => {
  const chantiers = (await query(
    `SELECT ch.id, ch.axe, ch.titre, ch.statut, ch.date_limite, ch.organisation_id
     FROM chantier ch
     JOIN opord o ON o.id = ch.opord_id
     WHERE o.evenement_id = $1
       AND (ch.statut = 'non_commence'
            OR (ch.transmis_le IS NOT NULL AND ch.accuse_le IS NULL)
            OR (ch.date_limite < NOW() AND ch.statut NOT IN ('termine','valide')))`,
    [req.params.evtId])).rows;

  let relanced = 0;
  for (const ch of chantiers) {
    // Trace relance in fil
    await query(
      `INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
       VALUES ($1, $2, $3, 'relance')`,
      [ch.id, req.user.id, 'Relance Cabinet — chantier ' + (ch.statut === 'non_commence' ? 'non démarré' : 'en retard')]);

    // Re-notify org users
    if (ch.organisation_id) {
      const users = (await query(
        'SELECT id FROM utilisateur WHERE organisation_id=$1 AND actif=TRUE', [ch.organisation_id])).rows;
      for (const u of users) {
        try {
          await query(
            'INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1,$2,$3,$4,$5)',
            [u.id, 'ccoe', 'Relance CCOE : ' + (ch.axe || ''), ch.titre + ' — ' + ch.statut,
             '/mes-chantiers-ccoe#' + ch.id]);
        } catch(e) {}
      }
    }

    // Email relance
    try {
      const contact = (await query(
        'SELECT email FROM ccoe_contact WHERE axe=$1 AND organisation_id=$2 AND actif=TRUE LIMIT 1',
        [ch.axe, ch.organisation_id])).rows[0];
      if (contact?.email) {
        const { notify } = require('../../services/notifier');
        notify({
          email: contact.email,
          subject: '[CCOE] RELANCE — ' + ch.titre,
          html: '<p><strong>Relance</strong> — le chantier <em>' + ch.titre + '</em> est ' +
            (ch.statut === 'non_commence' ? 'non démarré' : 'en retard') + '.</p>'
        });
        console.log('[CCOE] Email relance →', contact.email);
      }
    } catch(e) {}

    relanced++;
  }
  res.json({ relances: relanced });
}));

// GET /ccoe/evenements/:evtId/recap-transmission — récapitulatif avant transmission
router.get('/evenements/:evtId/recap-transmission', requireFonction('cabinet'), asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT ch.id, ch.titre, ch.axe, ch.statut, ch.transmis_le, ch.organisation_id,
       org.nom AS organisation_nom
     FROM chantier ch
     LEFT JOIN organisations org ON org.id = ch.organisation_id
     JOIN opord o ON o.id = ch.opord_id
     WHERE o.evenement_id = $1
     ORDER BY ch.axe`, [req.params.evtId]);
  res.json(rows);
}));

// ═══════════════════════════════════════════════════════
// ACCUSÉ DE RÉCEPTION (service → Cabinet)
// ═══════════════════════════════════════════════════════

router.post('/chantiers/:id/accuser', requireCCOE, asyncH(async (req, res) => {
  const ch = (await query('SELECT * FROM chantier WHERE id=$1', [req.params.id])).rows[0];
  if (!ch) throw notFound();

  // Only org members can accuse — Cabinet cannot
  if (isCabinet(req.user)) throw forbidden('Le Cabinet ne peut pas accuser réception à la place du service');
  if (ch.organisation_id !== req.user.organisation_id) throw forbidden('Accès réservé à votre organisation');
  if (!ch.transmis_le) throw badRequest('Chantier non encore transmis');
  if (ch.accuse_le) throw badRequest('Réception déjà accusée');

  await query('UPDATE chantier SET accuse_le=NOW(), accuse_par=$2 WHERE id=$1', [req.params.id, req.user.id]);

  // Trace in fil
  await query(
    `INSERT INTO chantier_commentaire (chantier_id, auteur_id, message, type_message)
     VALUES ($1, $2, $3, 'accuse')`,
    [req.params.id, req.user.id, 'Réception accusée par ' + (req.user.prenom || 'service')]);

  // Notify Cabinet users
  const cabinetUsers = (await query(
    "SELECT id FROM utilisateur WHERE fonction='cabinet' AND actif=TRUE")).rows;
  for (const u of cabinetUsers) {
    try {
      await query(
        'INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1,$2,$3,$4,$5)',
        [u.id, 'ccoe', 'Accusé de réception — ' + (ch.axe || ''),
         (req.user.prenom || 'Service') + ' a accusé réception de ' + ch.titre,
         '/ccoe#' + req.params.id]);
    } catch(e) {}
  }

  res.json({ ok: true, accuse_le: new Date().toISOString() });
}));

// GET /ccoe/evenements/:evtId/suivi-transmission — tableau complet pour le Cabinet
router.get('/evenements/:evtId/suivi-transmission', requireFonction('cabinet'), asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT ch.id, ch.titre, ch.axe, ch.statut, ch.date_limite,
       ch.transmis_le, ch.transmis_par, ch.vu_le, ch.vu_par, ch.accuse_le, ch.accuse_par,
       ch.organisation_id, org.nom AS organisation_nom,
       u1.prenom AS transmis_par_prenom,
       u2.prenom AS vu_par_prenom,
       u3.prenom AS accuse_par_prenom
     FROM chantier ch
     LEFT JOIN organisations org ON org.id = ch.organisation_id
     LEFT JOIN utilisateur u1 ON u1.id = ch.transmis_par
     LEFT JOIN utilisateur u2 ON u2.id = ch.vu_par
     LEFT JOIN utilisateur u3 ON u3.id = ch.accuse_par
     JOIN opord o ON o.id = ch.opord_id
     WHERE o.evenement_id = $1
     ORDER BY ch.axe`, [req.params.evtId]);
  res.json(rows);
}));

module.exports = router;
