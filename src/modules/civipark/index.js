/**
 * Module CiviPark — Stationnement intelligent.
 *
 * PRINCIPE : cadre souple, la Wilaya décide du dispositif d'encaissement.
 * Tout encaissement est TRACÉ (preuve numérique + référence justificatif papier).
 * Aucune restriction sur QUI encaisse — c'est paramétrable.
 *
 * ═══ MODÈLE D'ENCAISSEMENT TRACÉ ═══
 *
 *   Chaque paiement parking génère un enregistrement avec :
 *   - type_encaisseur : kiosque | buraliste | agent_tpe | mobile | autre
 *   - justificatif_type : ticket | bon | facture | recu_mobile
 *   - justificatif_numero : numéro séquentiel unique (compteur par zone)
 *   - horodatage, montant, durée, plaque
 *
 *   → Encaissement traçable = anti-hogra. Plus d'extorsion invisible.
 *   → Le type_encaisseur est un enum ouvert/ajustable (ALTER TYPE).
 *
 * Apport ICUA : le taux de zones actives avec encaissements tracés
 * alimente la dimension Fluidité (15%) en complément du taux RDV.
 * ═══════════════════════════════════════════════════════════════
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');

const router = express.Router();

// ── ZONES ───────────────────────────────────────

// GET /zones — liste publique
router.get('/zones', asyncH(async (req, res) => {
  const where = [];
  const vals = [];
  let i = 1;
  if (req.query.commune_id) { where.push(`pz.commune_id = $${i++}`); vals.push(req.query.commune_id); }
  if (req.query.type)       { where.push(`pz.type = $${i++}`);       vals.push(req.query.type); }
  const clause = where.length ? 'AND ' + where.join(' AND ') : '';
  const { rows } = await query(
    `SELECT pz.*, c.nom AS commune_nom
       FROM parking_zone pz
       LEFT JOIN commune c ON c.id = pz.commune_id
      WHERE pz.actif = TRUE ${clause}
      ORDER BY pz.nom`, vals);
  res.json(rows);
}));

// GET /zones/:id
router.get('/zones/:id', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT pz.*, c.nom AS commune_nom
       FROM parking_zone pz
       LEFT JOIN commune c ON c.id = pz.commune_id
      WHERE pz.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Zone introuvable');
  res.json(rows[0]);
}));

// POST /zones — créer une zone (admin)
router.post('/zones',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const { nom, commune_id, type, lat, lng, places_total, tarif_horaire,
            places_resident, places_pmr, places_livraison, places_transit } = req.body;
    if (!nom) throw badRequest('nom requis');
    const { rows } = await query(
      `INSERT INTO parking_zone
        (nom, commune_id, type, lat, lng, places_total, tarif_horaire,
         places_resident, places_pmr, places_livraison, places_transit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [nom, commune_id || null, type || 'blanche', lat || null, lng || null,
       places_total || null, tarif_horaire || null,
       places_resident || null, places_pmr || null,
       places_livraison || null, places_transit || null]);
    res.status(201).json(rows[0]);
  }));

// PATCH /zones/:id — modifier une zone
router.patch('/zones/:id',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const fields = ['nom', 'commune_id', 'type', 'lat', 'lng', 'places_total',
                    'tarif_horaire', 'places_resident', 'places_pmr',
                    'places_livraison', 'places_transit', 'actif'];
    const sets = [];
    const vals = [];
    let i = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) { sets.push(`${f} = $${i++}`); vals.push(req.body[f]); }
    }
    if (!sets.length) throw badRequest('Rien à modifier');
    vals.push(req.params.id);
    const { rows } = await query(
      `UPDATE parking_zone SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    if (!rows.length) throw notFound('Zone introuvable');
    res.json(rows[0]);
  }));

// ── CARTES RÉSIDENT ─────────────────────────────

// GET /cartes — mes cartes (citoyen) ou toutes (admin)
router.get('/cartes',
  authenticate,
  asyncH(async (req, res) => {
    const isAdmin = ['admin_apc', 'admin_wilaya'].includes(req.user.role);
    let sql, vals;
    if (isAdmin) {
      sql = `SELECT cr.*, u.nom, u.prenom, u.telephone, c.nom AS commune_nom
               FROM carte_resident cr
               JOIN utilisateur u ON u.id = cr.citoyen_id
               LEFT JOIN commune c ON c.id = cr.commune_id
              ORDER BY cr.cree_le DESC LIMIT 200`;
      vals = [];
    } else {
      sql = `SELECT cr.*, c.nom AS commune_nom
               FROM carte_resident cr
               LEFT JOIN commune c ON c.id = cr.commune_id
              WHERE cr.citoyen_id = $1
              ORDER BY cr.cree_le DESC`;
      vals = [req.user.id];
    }
    const { rows } = await query(sql, vals);
    res.json(rows);
  }));

// POST /cartes — créer une carte résident (admin)
router.post('/cartes',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const { citoyen_id, commune_id, plaque, justif_residence, valide_jusqu_a } = req.body;
    if (!citoyen_id || !commune_id || !valide_jusqu_a) throw badRequest('citoyen_id, commune_id et valide_jusqu_a requis');
    const { rows } = await query(
      `INSERT INTO carte_resident (citoyen_id, commune_id, plaque, justif_residence, valide_jusqu_a)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [citoyen_id, commune_id, plaque || null, justif_residence || false, valide_jusqu_a]);
    res.status(201).json(rows[0]);
  }));

// PATCH /cartes/:id — modifier statut
router.patch('/cartes/:id',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const { statut, plaque, valide_jusqu_a } = req.body;
    const sets = [];
    const vals = [];
    let i = 1;
    if (statut !== undefined)         { sets.push(`statut = $${i++}`);         vals.push(statut); }
    if (plaque !== undefined)         { sets.push(`plaque = $${i++}`);         vals.push(plaque); }
    if (valide_jusqu_a !== undefined) { sets.push(`valide_jusqu_a = $${i++}`); vals.push(valide_jusqu_a); }
    if (!sets.length) throw badRequest('Rien à modifier');
    vals.push(req.params.id);
    const { rows } = await query(
      `UPDATE carte_resident SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    if (!rows.length) throw notFound('Carte introuvable');
    res.json(rows[0]);
  }));

// ── ENCAISSEMENTS ───────────────────────────────

// GET /encaissements — registre (admin), filtrable par zone/plaque/date/ticket
router.get('/encaissements',
  authenticate,
  requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const where = [];
    const vals = [];
    let i = 1;
    if (req.query.zone_id) { where.push(`pe.parking_zone_id = $${i++}`); vals.push(req.query.zone_id); }
    if (req.query.plaque)  { where.push(`pe.plaque ILIKE $${i++}`);      vals.push('%' + req.query.plaque + '%'); }
    if (req.query.ticket)  { where.push(`pe.justificatif_numero = $${i++}`); vals.push(req.query.ticket); }
    if (req.query.date_debut) { where.push(`pe.date_heure >= $${i++}`); vals.push(req.query.date_debut); }
    if (req.query.date_fin)   { where.push(`pe.date_heure <= $${i++}`); vals.push(req.query.date_fin); }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const { rows } = await query(
      `SELECT pe.*, pz.nom AS zone_nom, pz.type AS zone_type, c.nom AS commune_nom
         FROM parking_encaissement pe
         JOIN parking_zone pz ON pz.id = pe.parking_zone_id
         LEFT JOIN commune c ON c.id = pz.commune_id
        ${clause}
        ORDER BY pe.date_heure DESC LIMIT 200`, vals);
    res.json(rows);
  }));

// POST /encaissements — enregistrer un encaissement tracé
router.post('/encaissements',
  authenticate,
  requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const { parking_zone_id, montant, duree_minutes, type_encaisseur,
            encaisseur_ref, justificatif_type, plaque, citoyen_id } = req.body;
    if (!parking_zone_id || montant === undefined) throw badRequest('parking_zone_id et montant requis');

    // Numéro séquentiel de ticket (compteur global)
    const { rows: seqRows } = await query("SELECT nextval('parking_ticket_seq')::int AS seq");
    const seq = seqRows[0].seq;
    const justifNum = `TK-${String(seq).padStart(6, '0')}`;

    const { rows } = await query(
      `INSERT INTO parking_encaissement
        (parking_zone_id, montant, duree_minutes, type_encaisseur,
         encaisseur_ref, justificatif_type, justificatif_numero,
         numero_sequence, plaque, citoyen_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [parking_zone_id, montant, duree_minutes || null,
       type_encaisseur || 'autre', encaisseur_ref || null,
       justificatif_type || 'ticket', justifNum, seq,
       plaque || null, citoyen_id || null]);
    res.status(201).json(rows[0]);
  }));

// GET /encaissements/stats — statistiques pour dashboard
router.get('/encaissements/stats',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total_encaissements,
              COALESCE(SUM(montant), 0)::numeric AS total_montant,
              COUNT(DISTINCT parking_zone_id)::int AS zones_actives,
              COUNT(DISTINCT type_encaisseur)::int AS dispositifs_utilises
         FROM parking_encaissement
        WHERE date_heure >= NOW() - INTERVAL '30 days'`);
    res.json(rows[0]);
  }));

// ── EXTENSIONS (consultation) ───────────────────

router.get('/extensions',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const { rows } = await query(
      `SELECT pe.*, pz.nom AS zone_nom
         FROM parking_extension pe
         JOIN parking_zone pz ON pz.id = pe.parking_zone_id
        ORDER BY pe.cree_le DESC`);
    res.json(rows);
  }));

// ── APPORT ICUA (Fluidité/Mobilité) ────────────

// Score mobilité : taux de zones bleues avec encaissements récents (30j)
async function scoreMobilite() {
  const { rows } = await query(
    `SELECT
       COUNT(DISTINCT pz.id)::int AS zones_bleues,
       COUNT(DISTINCT pe.parking_zone_id)::int AS zones_avec_encaissement
     FROM parking_zone pz
     LEFT JOIN parking_encaissement pe
       ON pe.parking_zone_id = pz.id
       AND pe.date_heure >= NOW() - INTERVAL '30 days'
     WHERE pz.type = 'bleue' AND pz.actif = TRUE`);
  const { zones_bleues, zones_avec_encaissement } = rows[0];
  if (zones_bleues === 0) return null;
  return Math.round((zones_avec_encaissement / zones_bleues) * 100);
}

module.exports = router;
module.exports.scoreMobilite = scoreMobilite;
