/**
 * Module CAP — Corps des Agents de Proximité.
 *
 * Gère les agents CAP (profil étendu), leur spécialisation (modifiable),
 * leurs interventions terrain, et les alertes superviseur.
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, makeReference } = require('../../utils/http');

const router = express.Router();

// ── AGENTS CAP ──────────────────────────────────

// GET /agents — liste agents CAP (admin)
router.get('/agents',
  authenticate,
  requireRole('agent', 'admin_apc', 'admin_wilaya'),
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
  requireRole('agent', 'admin_apc', 'admin_wilaya'),
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

// POST /agents — créer un agent CAP
router.post('/agents',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const { utilisateur_id, specialisation, commune_id, secteur } = req.body;
    if (!utilisateur_id) throw badRequest('utilisateur_id requis');
    const { rows } = await query(
      `INSERT INTO cap_agent (utilisateur_id, specialisation, commune_id, secteur)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [utilisateur_id, specialisation || 'general', commune_id || null, secteur || null]);
    res.status(201).json(rows[0]);
  }));

// PATCH /agents/:id — modifier spécialisation, commune, secteur, actif
router.patch('/agents/:id',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
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
  requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'),
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
  requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'),
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

// GET /interventions/alertes — superviseur (AVANT :id pour éviter capture)
router.get('/interventions/alertes',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
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
  requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'),
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

module.exports = router;
module.exports.statsCAP = statsCAP;
