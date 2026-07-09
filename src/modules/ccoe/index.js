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
           ORDER BY e.date_evenement DESC LIMIT 100`;
    params = [];
  } else {
    sql = `SELECT DISTINCT e.*, cm.nom AS commune_nom,
             (SELECT COUNT(*) FROM opord o WHERE o.evenement_id=e.id) AS nb_opords
           FROM evenement e
           LEFT JOIN commune cm ON cm.id = e.commune_id
           JOIN opord o ON o.evenement_id = e.id
           JOIN chantier ch ON ch.opord_id = o.id AND ch.organisation_id = $1
           ORDER BY e.date_evenement DESC LIMIT 100`;
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
  if (!b.titre || !b.type || !b.date_evenement) throw badRequest('titre, type, date_evenement requis');
  const { rows } = await query(
    `INSERT INTO evenement (titre, titre_ar, type, importance, date_evenement, heure,
       lieu, lieu_ar, commune_id, lat, lng, description, description_ar,
       responsable_cabinet, chef_projet, cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING *`,
    [b.titre, b.titre_ar || null, b.type, b.importance || 'normale',
     b.date_evenement, b.heure || null, b.lieu || null, b.lieu_ar || null,
     b.commune_id || null, b.lat || null, b.lng || null,
     b.description || null, b.description_ar || null,
     b.responsable_cabinet || req.user.id, b.chef_projet || null, req.user.id]);
  res.status(201).json(rows[0]);
}));

// PUT /ccoe/evenements/:id — modifier (cabinet only)
router.put('/evenements/:id', requireFonction('cabinet'), asyncH(async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `UPDATE evenement SET
       titre=COALESCE($2,titre), titre_ar=COALESCE($3,titre_ar),
       type=COALESCE($4,type), importance=COALESCE($5,importance),
       date_evenement=COALESCE($6,date_evenement), heure=COALESCE($7,heure),
       lieu=COALESCE($8,lieu), lieu_ar=COALESCE($9,lieu_ar),
       commune_id=COALESCE($10,commune_id), lat=COALESCE($11,lat), lng=COALESCE($12,lng),
       description=COALESCE($13,description), description_ar=COALESCE($14,description_ar),
       responsable_cabinet=COALESCE($15,responsable_cabinet),
       chef_projet=COALESCE($16,chef_projet),
       statut=COALESCE($17,statut), maj_le=NOW()
     WHERE id=$1 RETURNING *`,
    [req.params.id, b.titre, b.titre_ar, b.type, b.importance,
     b.date_evenement, b.heure, b.lieu, b.lieu_ar, b.commune_id,
     b.lat, b.lng, b.description, b.description_ar,
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
    `SELECT ga.axe, ga.titre, ga.titre_ar, ga.description, ga.description_ar, ga.ordre
     FROM gabarit_axe ga WHERE ga.gabarit_id = $1 ORDER BY ga.ordre`, [gabarit_id])).rows;
  if (!axes.length) throw badRequest('Gabarit sans axes');

  const created = await withTransaction(async (client) => {
    const results = [];
    for (const axe of axes) {
      // Lookup default organisation for this axe
      const orgRow = (await client.query(
        'SELECT organisation_id FROM ccoe_axe_organisation WHERE axe=$1', [axe.axe])).rows[0];

      const ch = (await client.query(
        `INSERT INTO chantier (opord_id, axe, organisation_id, titre, titre_ar,
           description, description_ar, date_limite)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.params.opordId, axe.axe, orgRow?.organisation_id || null,
         axe.titre, axe.titre_ar, axe.description, axe.description_ar,
         date_limite || null])).rows[0];

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
    SELECT e.id, e.titre, e.date_evenement, e.importance, e.statut
    FROM evenement e WHERE e.date_evenement >= CURRENT_DATE
    ORDER BY e.date_evenement LIMIT 5`)).rows;

  res.json({ stats, parAxe, prochains });
}));

// ═══════════════════════════════════════════════════════
// CARTE — chantiers géolocalisés
// ═══════════════════════════════════════════════════════

router.get('/carte', requireCCOE, asyncH(async (req, res) => {
  const orgFilter = isCabinet(req.user) ? '' : ' AND ch.organisation_id = ' + parseInt(req.user.organisation_id);
  const { rows } = await query(`
    SELECT ch.id, ch.titre, ch.axe, ch.statut, ch.lat, ch.lng,
      org.nom AS organisation_nom, ch.date_limite
    FROM chantier ch
    LEFT JOIN organisations org ON org.id = ch.organisation_id
    WHERE ch.lat IS NOT NULL AND ch.lng IS NOT NULL` + orgFilter);
  res.json(rows);
}));

module.exports = router;
