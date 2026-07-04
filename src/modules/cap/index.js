/**
 * Module CAP — Corps des Agents de Proximité.
 *
 * Gère les agents CAP (profil étendu), leur spécialisation (modifiable),
 * leurs interventions terrain, et les alertes superviseur.
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole, hasFonction, hasPerimetre } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, makeReference, unauthorized, forbidden } = require('../../utils/http');

const router = express.Router();

// Phase 4C — middlewares sans fallback
const STAFF_FONCTIONS = ['agent_traitant', 'cap', 'entite_responsable', 'superviseur'];
function requireStaff() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (STAFF_FONCTIONS.includes(req.user.fonction)) return next();
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

// ── AGENTS CAP ──────────────────────────────────

function requireAgentOrSuperviseur() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (['agent_traitant', 'cap', 'superviseur'].includes(req.user.fonction)) return next();
    return next(forbidden());
  };
}
router.get('/agents',
  authenticate,
  requireAgentOrSuperviseur(),
  asyncH(async (req, res) => {
    const { rows } = await query(
      `SELECT ca.*, u.nom, u.prenom, u.telephone, u.email,
              c.nom AS commune_nom
         FROM cap_agent ca
         JOIN utilisateur u ON u.id = ca.utilisateur_id
         LEFT JOIN commune c ON c.id = ca.commune_id
        ORDER BY ca.cree_le DESC`);
    res.json(rows);
  }));

// GET /agents/:id
router.get('/agents/:id',
  authenticate,
  requireAgentOrSuperviseur(),
  asyncH(async (req, res) => {
    const { rows } = await query(
      `SELECT ca.*, u.nom, u.prenom, u.telephone, u.email,
              c.nom AS commune_nom
         FROM cap_agent ca
         JOIN utilisateur u ON u.id = ca.utilisateur_id
         LEFT JOIN commune c ON c.id = ca.commune_id
        WHERE ca.id = $1`, [req.params.id]);
    if (!rows.length) throw notFound('Agent CAP introuvable');
    res.json(rows[0]);
  }));

// POST /agents — créer un agent CAP (superviseurs uniquement)
router.post('/agents',
  authenticate,
  requireSuperviseur(),
  asyncH(async (req, res) => {
    const { utilisateur_id, specialisation, commune_id, secteur } = req.body;
    if (!utilisateur_id) throw badRequest('utilisateur_id requis');
    const { rows } = await query(
      `INSERT INTO cap_agent (utilisateur_id, specialisation, commune_id, secteur)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [utilisateur_id, specialisation || 'general', commune_id || null, secteur || null]);
    res.status(201).json(rows[0]);
  }));

// PATCH /agents/:id — modifier spécialisation, commune, secteur, actif (superviseurs)
router.patch('/agents/:id',
  authenticate,
  requireSuperviseur(),
  asyncH(async (req, res) => {
    const { specialisation, commune_id, secteur, actif, parking_zone_id } = req.body;
    const sets = [];
    const vals = [];
    let i = 1;
    if (specialisation !== undefined) { sets.push(`specialisation = $${i++}`); vals.push(specialisation); }
    if (commune_id !== undefined)     { sets.push(`commune_id = $${i++}`);     vals.push(commune_id); }
    if (secteur !== undefined)        { sets.push(`secteur = $${i++}`);        vals.push(secteur); }
    if (actif !== undefined)          { sets.push(`actif = $${i++}`);          vals.push(actif); }
    if (parking_zone_id !== undefined){ sets.push(`parking_zone_id = $${i++}`); vals.push(parking_zone_id); }
    if (!sets.length) throw badRequest('Rien à modifier');
    vals.push(req.params.id);
    const { rows } = await query(
      `UPDATE cap_agent SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    if (!rows.length) throw notFound('Agent CAP introuvable');
    res.json(rows[0]);
  }));

// ── INTERVENTIONS ───────────────────────────────

// GET /interventions — liste (filtrable par agent, commune, état)
router.get('/interventions',
  authenticate,
  requireStaff(),
  asyncH(async (req, res) => {
    const where = [];
    const vals = [];
    let i = 1;
    if (req.query.agent_id)   { where.push(`ci.agent_id = $${i++}`);   vals.push(req.query.agent_id); }
    if (req.query.commune_id) { where.push(`ci.commune_id = $${i++}`); vals.push(req.query.commune_id); }
    if (req.query.etat)       { where.push(`ci.etat = $${i++}`);       vals.push(req.query.etat); }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const { rows } = await query(
      `SELECT ci.*, ca.specialisation, u.nom AS agent_nom, u.prenom AS agent_prenom,
              c.nom AS commune_nom
         FROM cap_intervention ci
         JOIN cap_agent ca ON ca.id = ci.agent_id
         JOIN utilisateur u ON u.id = ca.utilisateur_id
         LEFT JOIN commune c ON c.id = ci.commune_id
        ${clause}
        ORDER BY ci.cree_le DESC LIMIT 200`, vals);
    res.json(rows);
  }));

// POST /interventions — saisir une intervention
router.post('/interventions',
  authenticate,
  requireStaff(),
  asyncH(async (req, res) => {
    const { agent_id, type, priorite, description, lat, lng, commune_id,
            citoyen_id, signalement_id, alerte_superviseur, motif_alerte, notes } = req.body;
    if (!agent_id || !type || !description) throw badRequest('agent_id, type et description requis');
    const ref = makeReference('CAP');
    const { rows } = await query(
      `INSERT INTO cap_intervention
        (reference, agent_id, type, priorite, description, lat, lng, commune_id,
         citoyen_id, signalement_id, alerte_superviseur, motif_alerte, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [ref, agent_id, type, priorite || 'normale', description,
       lat || null, lng || null, commune_id || null,
       citoyen_id || null, signalement_id || null,
       alerte_superviseur || false, motif_alerte || null, notes || null]);
    res.status(201).json(rows[0]);
  }));

// GET /interventions/alertes — superviseur
router.get('/interventions/alertes',
  authenticate,
  requireSuperviseur(),
  asyncH(async (req, res) => {
    const { rows } = await query(
      `SELECT ci.*, u.nom AS agent_nom, u.prenom AS agent_prenom,
              c.nom AS commune_nom
         FROM cap_intervention ci
         JOIN cap_agent ca ON ca.id = ci.agent_id
         JOIN utilisateur u ON u.id = ca.utilisateur_id
         LEFT JOIN commune c ON c.id = ci.commune_id
        WHERE ci.alerte_superviseur = TRUE
        ORDER BY ci.cree_le DESC LIMIT 50`);
    res.json(rows);
  }));

// PATCH /interventions/:id — terminer, annuler, mettre à jour
router.patch('/interventions/:id',
  authenticate,
  requireStaff(),
  asyncH(async (req, res) => {
    const { etat, notes, alerte_superviseur, motif_alerte } = req.body;
    const sets = [];
    const vals = [];
    let i = 1;
    if (etat !== undefined) {
      sets.push(`etat = $${i++}`); vals.push(etat);
      if (etat === 'termine') { sets.push(`termine_le = NOW()`); }
    }
    if (notes !== undefined)               { sets.push(`notes = $${i++}`);               vals.push(notes); }
    if (alerte_superviseur !== undefined)   { sets.push(`alerte_superviseur = $${i++}`);  vals.push(alerte_superviseur); }
    if (motif_alerte !== undefined)         { sets.push(`motif_alerte = $${i++}`);        vals.push(motif_alerte); }
    if (!sets.length) throw badRequest('Rien à modifier');
    vals.push(req.params.id);
    const { rows } = await query(
      `UPDATE cap_intervention SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    if (!rows.length) throw notFound('Intervention introuvable');
    res.json(rows[0]);
  }));

// Statistiques CAP pour le dashboard
async function statsCAP() {
  const { rows } = await query(
    `SELECT COUNT(*) FILTER (WHERE etat = 'en_cours')::int AS en_cours,
            COUNT(*) FILTER (WHERE etat = 'termine')::int AS terminees,
            COUNT(*) FILTER (WHERE alerte_superviseur = TRUE AND etat = 'en_cours')::int AS alertes_actives,
            COUNT(*)::int AS total
       FROM cap_intervention`);
  return rows[0];
}

// ══════════════════════════════════════════════════
// ── MISSIONS CAP — Sprint 3 ──
// ══════════════════════════════════════════════════

const multer = require('multer');
const config = require('../../config');
const upload = multer({ dest: config.upload.dir, limits: { fileSize: config.upload.maxBytes } });

const MISSION_TRANSITIONS = {
  cree: ['accepte'],
  accepte: ['en_cours'],
  en_cours: ['termine', 'bloque'],
  bloque: ['en_cours', 'termine'],
};

// GET /missions — missions du CAP connecté (ou toutes pour admin)
router.get('/missions', authenticate, asyncH(async (req, res) => {
  const isAdmin = hasFonction(req.user, 'superviseur') || hasFonction(req.user, 'agent_traitant');
  let sql = `SELECT m.*, m.constat_visuel, m.constat_temoignages, m.decision, m.motif_decision,
                    s.reference AS sig_reference, s.description AS sig_description,
                    s.lat AS sig_lat, s.lng AS sig_lng, s.photo_path AS sig_photo,
                    s.etat AS sig_etat,
                    cs.libelle AS sig_categorie, c.nom AS commune_nom,
                    u.prenom AS createur_prenom, u.nom AS createur_nom
               FROM mission_cap m
               LEFT JOIN signalement s ON s.id = m.signalement_id
               LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
               LEFT JOIN commune c ON c.id = s.commune_id
               LEFT JOIN utilisateur u ON u.id = m.cree_par
              WHERE 1=1`;
  const params = [];
  if (!isAdmin) {
    params.push(req.user.id);
    sql += ` AND m.affecte_a = $${params.length}`;
  }
  if (req.query.etat) { params.push(req.query.etat); sql += ` AND m.etat = $${params.length}`; }
  sql += ' ORDER BY CASE m.priorite WHEN \'urgente\' THEN 0 WHEN \'haute\' THEN 1 ELSE 2 END, m.cree_le DESC LIMIT 100';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// GET /missions/:id — détail mission
router.get('/missions/:id', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT m.*, s.reference AS sig_reference, s.description AS sig_description,
            s.lat AS sig_lat, s.lng AS sig_lng, s.photo_path AS sig_photo,
            cs.libelle AS sig_categorie, c.nom AS commune_nom,
            u.prenom AS createur_prenom, u.nom AS createur_nom
       FROM mission_cap m
       LEFT JOIN signalement s ON s.id = m.signalement_id
       LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
       LEFT JOIN commune c ON c.id = s.commune_id
       LEFT JOIN utilisateur u ON u.id = m.cree_par
      WHERE m.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Mission introuvable');
  res.json(rows[0]);
}));

// PATCH /missions/:id/etat — changer état mission + saisie terrain + rapport
router.patch('/missions/:id/etat', authenticate, upload.single('photo'), asyncH(async (req, res) => {
  const { etat, commentaire, motif_blocage, lat, lng,
          constat_visuel, constat_temoignages, decision, motif_decision } = req.body;
  if (!etat) throw badRequest('etat requis');

  const { rows: cur } = await query('SELECT etat, signalement_id, cree_par FROM mission_cap WHERE id = $1', [req.params.id]);
  if (!cur.length) throw notFound('Mission introuvable');

  const allowed = MISSION_TRANSITIONS[cur[0].etat] || [];
  if (!allowed.includes(etat)) throw badRequest(`Transition ${cur[0].etat} → ${etat} non autorisée`);

  // Validation décision à la clôture
  if (etat === 'termine' && !decision) throw badRequest('Une décision est requise pour terminer la mission (valider, amender, rejeter).');
  if (etat === 'termine' && decision === 'rejeter' && !motif_decision) throw badRequest('Un motif est obligatoire pour rejeter le signalement.');

  // Update mission
  const updates = ['etat = $2', 'maj_le = NOW()'];
  const params = [req.params.id, etat];
  let pi = 3;

  if (commentaire) { updates.push(`commentaire_cap = $${pi}`); params.push(commentaire); pi++; }
  if (constat_visuel) { updates.push(`constat_visuel = $${pi}`); params.push(constat_visuel); pi++; }
  if (constat_temoignages) { updates.push(`constat_temoignages = $${pi}`); params.push(constat_temoignages); pi++; }
  if (etat === 'bloque' && motif_blocage) { updates.push(`motif_blocage = $${pi}`); params.push(motif_blocage); pi++; }
  if (etat === 'termine') {
    updates.push('cloture_le = NOW()');
    if (decision) { updates.push(`decision = $${pi}`); params.push(decision); pi++; }
    if (motif_decision) { updates.push(`motif_decision = $${pi}`); params.push(motif_decision); pi++; }
    if (lat) { updates.push(`cloture_lat = $${pi}`); params.push(parseFloat(lat)); pi++; }
    if (lng) { updates.push(`cloture_lng = $${pi}`); params.push(parseFloat(lng)); pi++; }
    if (req.file) { updates.push(`photo_path = $${pi}`); params.push(req.file.path); pi++; }
  }

  const { rows } = await query(`UPDATE mission_cap SET ${updates.join(', ')} WHERE id = $1 RETURNING *`, params);

  // Historique enrichi
  var histComment = commentaire || '';
  if (etat === 'termine' && decision) histComment = 'Décision: ' + decision + (motif_decision ? ' — ' + motif_decision : '') + (constat_visuel ? ' | Constat: ' + constat_visuel : '') + (histComment ? ' | ' + histComment : '');
  await query(
    'INSERT INTO mission_cap_historique (mission_id, etat, par_utilisateur, commentaire) VALUES ($1, $2, $3, $4)',
    [req.params.id, etat, req.user.id, histComment || null]
  );

  // Notifier l'agent créateur à chaque étape clé
  if (etat === 'accepte' && cur[0].cree_par) {
    try {
      await query('INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1, $2, $3, $4, $5)',
        [cur[0].cree_par, 'cap', 'Mission acceptée par l\'agent CAP',
         'Votre demande de vérification terrain a été acceptée.', '/bo-agent']);
    } catch(e) {}
  }
  if (etat === 'en_cours' && cur[0].cree_par) {
    try {
      await query('INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1, $2, $3, $4, $5)',
        [cur[0].cree_par, 'cap', 'Agent CAP en déplacement',
         'L\'agent se rend sur le site pour la vérification terrain.', '/bo-agent']);
    } catch(e) {}
  }
  if (etat === 'bloque' && cur[0].cree_par) {
    try {
      await query('INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1, $2, $3, $4, $5)',
        [cur[0].cree_par, 'cap', 'Mission bloquée',
         'La mission terrain est bloquée — motif : ' + (motif_blocage || 'non précisé'), '/bo-agent']);
    } catch(e) {}
  }
  // Si terminée, notifier l'agent créateur + le citoyen
  if (etat === 'termine') {
    try {
      // Notifier l'agent créateur
      if (cur[0].cree_par) {
        const decisionLabel = {valider:'confirmé',amender:'partiellement confirmé',rejeter:'non fondé'}[decision] || decision;
        await query(
          'INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1, $2, $3, $4, $5)',
          [cur[0].cree_par, 'cap', 'Rapport terrain reçu',
           'Mission terminée — Signalement ' + decisionLabel + '. ' + (constat_visuel || '').substring(0, 100),
           '/bo-agent']
        );
      }
      // Notifier le citoyen
      if (cur[0].signalement_id) {
        const { rows: sig } = await query('SELECT reference, citoyen_id FROM signalement WHERE id = $1', [cur[0].signalement_id]);
        if (sig[0]?.citoyen_id) {
          await query(
            'INSERT INTO notification (utilisateur_id, type, titre, message, lien) VALUES ($1, $2, $3, $4, $5)',
            [sig[0].citoyen_id, 'cap', 'Vérification terrain effectuée',
             'La vérification de votre signalement #' + sig[0].reference + ' a été réalisée.',
             '/mes-signalements']
          );
        }
      }
    } catch (e) { console.warn('[cap notif]', e.message); }
  }

  res.json(rows[0]);
}));

// GET /missions/:id/historique — timeline mission
router.get('/missions/:id/historique', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT h.*, u.prenom, u.nom FROM mission_cap_historique h
     LEFT JOIN utilisateur u ON u.id = h.par_utilisateur
     WHERE h.mission_id = $1 ORDER BY h.le ASC`, [req.params.id]);
  res.json(rows);
}));

// POST /assistance — action d'assistance citoyenne
router.post('/assistance', authenticate, asyncH(async (req, res) => {
  const { type, commentaire, lat, lng } = req.body;
  if (!type) throw badRequest('type requis');
  const { rows } = await query(
    'INSERT INTO cap_assistance (cap_id, type, commentaire, lat, lng) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.user.id, type, commentaire || null, lat || null, lng || null]
  );
  res.status(201).json(rows[0]);
}));

module.exports = router;
module.exports.statsCAP = statsCAP;
