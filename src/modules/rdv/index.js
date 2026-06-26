/**
 * CiviAdmin — rendez-vous & file d'attente virtuelle.
 * Tri Famille A (redirigé) / Famille B (présence requise).
 */
const express = require('express');
const { z } = require('zod');
const { query, withTransaction } = require('../../db/pool');
const { validate } = require('../../middleware/validation');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');

const router = express.Router();

// GET /api/rdv/services
router.get('/services', asyncH(async (req, res) => {
  const { rows } = await query('SELECT id,nom,famille,duree_min FROM service ORDER BY nom');
  res.json(rows);
}));

// GET /api/rdv/creneaux?communeId=&serviceId=
router.get('/creneaux', asyncH(async (req, res) => {
  const { communeId, serviceId } = req.query;
  if (!communeId || !serviceId) throw badRequest('communeId et serviceId requis.');
  const svc = await query('SELECT famille FROM service WHERE id=$1', [serviceId]);
  if (!svc.rowCount) throw notFound('Service inconnu.');
  if (svc.rows[0].famille === 'A') {
    return res.json({ familleA: true, message: 'Démarche déjà dématérialisée — voir le portail national.', creneaux: [] });
  }
  const { rows } = await query(
    `SELECT c.id, c.debut, c.capacite,
            c.capacite - COUNT(r.id) FILTER (WHERE r.statut IN ('reserve','present')) AS restants
       FROM creneau c
       LEFT JOIN rdv r ON r.creneau_id=c.id
      WHERE c.commune_id=$1 AND c.service_id=$2 AND c.debut > now()
      GROUP BY c.id
      HAVING c.capacite - COUNT(r.id) FILTER (WHERE r.statut IN ('reserve','present')) > 0
      ORDER BY c.debut`,
    [communeId, serviceId]);
  res.json({ familleA: false, creneaux: rows });
}));

const reserverSchema = z.object({ creneauId: z.number().int() });

// POST /api/rdv — réserver un créneau
router.post('/', authenticate, validate(reserverSchema), asyncH(async (req, res) => {
  const { creneauId } = req.body;
  const result = await withTransaction(async (c) => {
    const cr = await c.query('SELECT * FROM creneau WHERE id=$1 FOR UPDATE', [creneauId]);
    if (!cr.rowCount) throw notFound('Créneau introuvable.');
    const pris = await c.query(
      `SELECT COUNT(*) AS n FROM rdv WHERE creneau_id=$1 AND statut IN ('reserve','present')`,
      [creneauId]);
    if (Number(pris.rows[0].n) >= cr.rows[0].capacite) throw badRequest('Créneau complet.');
    const numero = Number(pris.rows[0].n) + 1;
    const { rows } = await c.query(
      `INSERT INTO rdv(creneau_id,citoyen_id,numero_ticket,statut) VALUES ($1,$2,$3,'reserve') RETURNING *`,
      [creneauId, req.user.id, numero]);
    return rows[0];
  });
  res.status(201).json(result);
}));

// GET /api/rdv/mes
router.get('/mes', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT r.*, c.debut, s.nom AS service, cm.nom AS commune
       FROM rdv r
       JOIN creneau c ON c.id=r.creneau_id
       JOIN service s ON s.id=c.service_id
       JOIN commune cm ON cm.id=c.commune_id
      WHERE r.citoyen_id=$1 ORDER BY c.debut DESC`,
    [req.user.id]);
  res.json(rows);
}));

const statutSchema = z.object({ statut: z.enum(['present','absent','annule','traite']) });

// PATCH /api/rdv/:id/statut
router.patch('/:id/statut',
  authenticate, requireRole('agent','admin_apc','admin_wilaya'),
  validate(statutSchema),
  asyncH(async (req, res) => {
    const { rows } = await query(
      'UPDATE rdv SET statut=$1, maj_le=now() WHERE id=$2 RETURNING *',
      [req.body.statut, req.params.id]);
    if (!rows.length) throw notFound('RDV introuvable.');
    res.json(rows[0]);
  }));

// ═══════════════════════════════════════════════════
// GESTION ADMIN DES CRÉNEAUX
// ═══════════════════════════════════════════════════

const creneauSchema = z.object({
  communeId:   z.number().int(),
  serviceId:   z.number().int(),
  debut:       z.string().min(10),
  capacite:    z.number().int().min(1).max(200).default(10),
  repetitions: z.number().int().min(1).max(60).default(1),
});

// GET /api/rdv/admin/creneaux
router.get('/admin/creneaux',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  asyncH(async (req, res) => {
    const { communeId, serviceId } = req.query;
    let sql = `SELECT c.id, c.debut, c.capacite, c.commune_id, c.service_id,
                      cm.nom AS commune, s.nom AS service, s.duree_min,
                      COUNT(r.id) FILTER (WHERE r.statut IN ('reserve','present')) AS reserves
               FROM creneau c
               JOIN commune cm ON cm.id=c.commune_id
               JOIN service s ON s.id=c.service_id
               LEFT JOIN rdv r ON r.creneau_id=c.id
               WHERE c.debut > now()`;
    const params = [];
    if (communeId) { params.push(communeId); sql += ` AND c.commune_id=$${params.length}`; }
    if (serviceId) { params.push(serviceId); sql += ` AND c.service_id=$${params.length}`; }
    sql += ' GROUP BY c.id, cm.nom, s.nom, s.duree_min ORDER BY c.debut LIMIT 200';
    const { rows } = await query(sql, params);
    res.json(rows);
  }));

// POST /api/rdv/admin/creneaux — créer 1 à N créneaux consécutifs
router.post('/admin/creneaux',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  validate(creneauSchema),
  asyncH(async (req, res) => {
    const { communeId, serviceId, debut, capacite, repetitions } = req.body;
    const [cm, sv] = await Promise.all([
      query('SELECT id FROM commune WHERE id=$1', [communeId]),
      query('SELECT id,famille,duree_min FROM service WHERE id=$1', [serviceId]),
    ]);
    if (!cm.rowCount) throw badRequest('Commune introuvable.');
    if (!sv.rowCount) throw badRequest('Service introuvable.');
    if (sv.rows[0].famille === 'A') throw badRequest('Service dématérialisé (Famille A) — pas de créneau requis.');
    const duree = sv.rows[0].duree_min || 30;
    const debutDate = new Date(debut);
    const created = [];
    for (let i = 0; i < repetitions; i++) {
      const d = new Date(debutDate.getTime() + i * duree * 60000);
      const { rows } = await query(
        'INSERT INTO creneau(commune_id,service_id,debut,capacite) VALUES($1,$2,$3,$4) RETURNING *',
        [communeId, serviceId, d.toISOString(), capacite]);
      created.push(rows[0]);
    }
    res.status(201).json({ created: created.length, creneaux: created });
  }));

// DELETE /api/rdv/admin/creneaux/:id
router.delete('/admin/creneaux/:id',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  asyncH(async (req, res) => {
    const rdvs = await query(
      `SELECT COUNT(*) AS n FROM rdv WHERE creneau_id=$1 AND statut IN ('reserve','present')`,
      [req.params.id]);
    if (Number(rdvs.rows[0].n) > 0)
      throw badRequest(`Impossible : ${rdvs.rows[0].n} RDV réservé(s) sur ce créneau.`);
    const { rows } = await query('DELETE FROM creneau WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows.length) throw notFound('Créneau introuvable.');
    res.json({ deleted: rows[0].id });
  }));

module.exports = router;
