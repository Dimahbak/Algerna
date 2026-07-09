const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole, hasFonction, hasCapacite, hasPerimetre } = require('../../middleware/auth');

// Phase 4C — sans fallback
function requireSuperviseur() {
  return (req, res, next) => {
    if (!req.user) return next(require('../../utils/http').unauthorized());
    if (req.user.fonction === 'superviseur') return next();
    return next(require('../../utils/http').forbidden());
  };
}
function requireAgentOrSuperviseur() {
  return (req, res, next) => {
    if (!req.user) return next(require('../../utils/http').unauthorized());
    if (req.user.fonction === 'agent_traitant' || req.user.fonction === 'superviseur') return next();
    return next(require('../../utils/http').forbidden());
  };
}
const { asyncH, badRequest, notFound } = require('../../utils/http');

const router = express.Router();

// GET /contacts — liste publique
router.get('/contacts', asyncH(async (req, res) => {
  const { categorie } = req.query;
  let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE';
  const params = [];
  if (categorie) { params.push(categorie); sql += ` AND categorie = $${params.length}`; }
  sql += ' ORDER BY ordre, nom';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// POST /contacts — admin
router.post('/contacts', authenticate, requireSuperviseur(), asyncH(async (req, res) => {
  const { nom, categorie, telephone, email, adresse, commune_id, horaires, lat, lng, niveau } = req.body;
  if (!nom || !categorie) throw badRequest('nom et categorie requis');
  const { rows } = await query(
    `INSERT INTO contact_utile (nom, categorie, telephone, email, adresse, commune_id, horaires, lat, lng, niveau)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [nom, categorie, telephone||null, email||null, adresse||null, commune_id||null, horaires||null, lat||null, lng||null, niveau||'info']);
  res.status(201).json(rows[0]);
}));

// PATCH /contacts/:id — admin
router.patch('/contacts/:id', authenticate, requireSuperviseur(), asyncH(async (req, res) => {
  const fields = ['nom','categorie','telephone','email','adresse','commune_id','horaires','lat','lng','niveau','actif','ordre'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE contact_utile SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Contact introuvable');
  res.json(rows[0]);
}));

// DELETE /contacts/:id — admin
router.delete('/contacts/:id', authenticate, requireSuperviseur(), asyncH(async (req, res) => {
  const { rows } = await query('DELETE FROM contact_utile WHERE id=$1 RETURNING id', [req.params.id]);
  if (!rows.length) throw notFound('Contact introuvable');
  res.json({ deleted: rows[0].id });
}));

// POST /api/infos/contact — formulaire de contact citoyen (auth optionnelle)
router.post('/contact', function(req, res, next) {
  // Auth optionnelle : tente d'extraire l'utilisateur sans bloquer
  try { authenticate(req, res, function(err) { next(); }); } catch(e) { next(); }
}, asyncH(async (req, res) => {
  const { nom, contact, sujet, message } = req.body;
  if (!sujet || !message) throw badRequest('Sujet et message requis.');
  const userId = req.user ? req.user.id : null;
  const { rows } = await query(
    'INSERT INTO message_contact (utilisateur_id, nom, contact, sujet, message) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [userId, nom || null, contact || null, sujet, message]);
  res.status(201).json({ ok: true, id: rows[0].id, message: 'Votre message a été envoyé.' });
}));

module.exports = router;

// ═══ COMMUNIQUÉS OFFICIELS ═══

// GET /communiques — actifs, non expirés (public) ou tous (admin)
router.get('/communiques', asyncH(async (req, res) => {
  const { admin, statut, commune_id: qCommune, priorite: qPriorite } = req.query;

  // Mode admin : authentifié + rôle admin
  if (admin === 'true') {
    // vérifier auth manuellement
    return authenticate(req, res, () => {
      requireSuperviseur()(req, res, async () => {
        try {
          let sql = `SELECT c.*, cm.nom AS commune_nom
                       FROM communique c
                       LEFT JOIN commune cm ON cm.id = c.commune_id WHERE 1=1`;
          const params = [];
          if (statut) { params.push(statut); sql += ` AND c.statut = $${params.length}`; }
          if (qPriorite) { params.push(qPriorite); sql += ` AND c.priorite = $${params.length}`; }
          if (qCommune) { params.push(qCommune); sql += ` AND c.commune_id = $${params.length}`; }
          // Superviseur communal : restreindre à sa commune ou wilaya-wide
          var isCommune = hasPerimetre(req.user, 'commune');
          if (isCommune && req.user.commune_id) {
            params.push(req.user.commune_id);
            sql += ` AND (c.commune_id = $${params.length} OR c.commune_id IS NULL)`;
          }
          sql += ` ORDER BY c.cree_le DESC`;
          const { rows } = await query(sql, params);
          res.json(rows);
        } catch (e) { res.status(500).json({ error: e.message }); }
      });
    });
  }

  // Mode public
  const { rows } = await query(
    `SELECT c.*, cm.nom AS commune_nom
       FROM communique c
       LEFT JOIN commune cm ON cm.id = c.commune_id
      WHERE c.actif = TRUE AND c.statut = 'publie'
        AND (c.date_fin IS NULL OR c.date_fin > NOW())
        AND c.date_debut <= NOW()
      ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC
      LIMIT 20`);
  res.json(rows);
}));

// POST /communiques — admin
router.post('/communiques', authenticate, requireAgentOrSuperviseur(), asyncH(async (req, res) => {
  const { titre, message, detail, categorie, niveau, commune_id, zone, date_debut, date_fin, canal, statut, priorite,
          titre_ar, message_ar, detail_ar, service } = req.body;
  if (!titre || !message) throw badRequest('titre et message requis');
  // Superviseur communal : forcer commune_id à sa propre commune + statut brouillon
  const isCommune = hasPerimetre(req.user, 'commune') && req.user.commune_id;
  const effectiveCommuneId = isCommune ? req.user.commune_id : (commune_id || null);
  // Commune : forcer brouillon (pas de publication directe)
  const effectiveStatut = isCommune ? 'brouillon' : (statut || 'brouillon');
  const { rows } = await query(
    `INSERT INTO communique (titre, message, detail, categorie, niveau, commune_id, zone, date_debut, date_fin, canal, cree_par, statut, priorite)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [titre, message, detail||null, categorie||'info', niveau||'info', effectiveCommuneId, zone||null,
     date_debut||new Date().toISOString(), date_fin||null, canal||'bandeau', req.user.id,
     effectiveStatut, priorite||'normale']);
  // Audit
  try {
    await query(`INSERT INTO communique_audit (communique_id, action, par_utilisateur, details)
      VALUES ($1, 'create', $2, $3)`, [rows[0].id, req.user.id, JSON.stringify({ titre, statut: statut||'publie', priorite: priorite||'normale' })]);
  } catch(e) { console.warn('[audit communique create]', e.message); }
  // Notification pour communiqué urgent
  if (niveau === 'urgent' || priorite === 'urgente') {
    try {
      await query(`INSERT INTO notification (utilisateur_id, type, titre, message, lien)
        SELECT id, 'communique', $1, $2, '/communiques'
        FROM utilisateur WHERE actif = TRUE AND role = 'citoyen'
        LIMIT 1000`, [titre, message]);
    } catch(e) { console.warn('[notif communique]', e.message); }
  }
  res.status(201).json(rows[0]);
}));

// PATCH /communiques/:id — admin
router.patch('/communiques/:id', authenticate, requireSuperviseur(), asyncH(async (req, res) => {
  // Superviseur communal : ne peut modifier que ses propres communiqués
  if (hasPerimetre(req.user, 'commune')) {
    const { rows: own } = await query('SELECT cree_par FROM communique WHERE id=$1', [req.params.id]);
    if (own.length && own[0].cree_par !== req.user.id) throw badRequest('Vous ne pouvez modifier que vos propres communiqués.');
  }
  const fields = ['titre','message','detail','categorie','niveau','commune_id','zone','date_debut','date_fin','actif','canal','statut','priorite'];
  const sets = []; const vals = []; let i = 1;
  // Superviseur communal : interdire de changer statut vers publie ou actif
  if (hasPerimetre(req.user, 'commune')) {
    if (req.body.statut && ['publie','valide','archive'].includes(req.body.statut)) {
      throw badRequest('Vous ne pouvez pas publier directement. Soumettez à la Wilaya.');
    }
    if (req.body.actif === true) {
      throw badRequest('Seule la Wilaya peut activer un communiqué.');
    }
  }
  for (const f of fields) { if (req.body[f] !== undefined) { sets.push(`${f}=$${i++}`); vals.push(req.body[f]); } }
  if (!sets.length) throw badRequest('Rien à modifier');
  // Superviseur communal : interdire de changer commune_id
  if (hasPerimetre(req.user, 'commune') && req.body.commune_id !== undefined && Number(req.body.commune_id) !== req.user.commune_id) {
    throw badRequest('Vous ne pouvez pas changer la portée du communiqué.');
  }
  sets.push(`maj_le=now()`);
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE communique SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (!rows.length) throw notFound('Communiqué introuvable');
  // Audit
  try {
    await query(`INSERT INTO communique_audit (communique_id, action, par_utilisateur, details)
      VALUES ($1, 'update', $2, $3)`, [rows[0].id, req.user.id, JSON.stringify(req.body)]);
  } catch(e) { console.warn('[audit communique update]', e.message); }
  res.json(rows[0]);
}));

// DELETE /communiques/:id — admin
router.delete('/communiques/:id', authenticate, requireSuperviseur(), asyncH(async (req, res) => {
  // Superviseur communal : ne peut supprimer que ses propres communiqués
  if (hasPerimetre(req.user, 'commune')) {
    const { rows: own } = await query('SELECT cree_par FROM communique WHERE id=$1', [req.params.id]);
    if (own.length && own[0].cree_par !== req.user.id) throw badRequest('Vous ne pouvez supprimer que vos propres communiqués.');
  }
  // Audit avant suppression (cascade supprimera l'audit aussi, donc on log d'abord)
  try {
    await query(`INSERT INTO communique_audit (communique_id, action, par_utilisateur, details)
      VALUES ($1, 'delete', $2, $3)`, [req.params.id, req.user.id, JSON.stringify({ id: req.params.id })]);
  } catch(e) { console.warn('[audit communique delete]', e.message); }
  const { rows } = await query('DELETE FROM communique WHERE id=$1 RETURNING id', [req.params.id]);
  if (!rows.length) throw notFound('Communiqué introuvable');
  res.json({ deleted: rows[0].id });
}));

// ═══ WORKFLOW COMMUNIQUÉS — Sprint 5 ═══
const comm = require('../../services/communication');

// PATCH /communiques/:id/workflow — transition de statut
router.patch('/communiques/:id/workflow', authenticate, requireAgentOrSuperviseur(), asyncH(async (req, res) => {
  const { statut, commentaire } = req.body;
  if (!statut) throw badRequest('statut requis');
  // Agent traitant : ne peut qu'envoyer en révision (pas publier)
  var isAgentOnly = hasFonction(req.user, 'agent_traitant');
  if (isAgentOnly && !['en_revision'].includes(statut)) {
    throw badRequest('Les agents ne peuvent qu\'envoyer en révision.');
  }
  var isCommune = hasPerimetre(req.user, 'commune');
  // Superviseur communal : ne peut QUE soumettre à la Wilaya (pas publier, valider, rejeter)
  if (isCommune) {
    if (['publie', 'valide', 'rejete', 'archive'].includes(statut)) {
      return res.status(403).json({ erreur: 'La publication est réservée à l\'autorité de Wilaya.' });
    }
    // Commune peut : soumis_wilaya (soumettre) ou brouillon (modifier son propre)
    if (!['soumis_wilaya', 'brouillon'].includes(statut)) {
      throw badRequest('Action non autorisée pour votre niveau.');
    }
  }
  // Publication/validation/rejet : réservés Wilaya ou capacité publication
  var canPublish = hasCapacite(req.user, 'publication') || (hasCapacite(req.user, 'validation') && hasPerimetre(req.user, 'wilaya'));
  if (['publie', 'rejete'].includes(statut) && !canPublish) {
    return res.status(403).json({ erreur: 'La publication est réservée à l\'autorité compétente.' });
  }
  // Rejet : motif obligatoire
  if (statut === 'rejete' && !commentaire) {
    throw badRequest('Le motif de rejet est obligatoire.');
  }
  const result = await comm.transitionStatut(req.params.id, statut, req.user, { commentaire });
  res.json(result);
}));

// GET /communiques/:id/historique — timeline workflow
router.get('/communiques/:id/historique', authenticate, requireAgentOrSuperviseur(), asyncH(async (req, res) => {
  const hist = await comm.getWorkflowHistorique(req.params.id);
  res.json(hist);
}));

// GET /communiques/categories — catalogue paramétrable
router.get('/categories', asyncH(async (req, res) => {
  const cats = await comm.getCategories();
  res.json(cats);
}));

// GET /communiques/kpis — indicateurs communication
router.get('/communiques/kpis', authenticate, requireSuperviseur(), asyncH(async (req, res) => {
  const kpis = await comm.getKpisCommunication();
  res.json(kpis);
}));
