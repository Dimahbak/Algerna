/**
 * PatriLocal — Gestion du Patrimoine Immobilier Communal.
 * Accessible aux agents et admins uniquement.
 */
const express = require('express');
const { z } = require('zod');
const { query, withTransaction } = require('../../db/pool');
const { validate } = require('../../middleware/validation');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, makeReference } = require('../../utils/http');

const router = express.Router();
const AGENTS = ['admin_apc', 'admin_wilaya'];
const ADMINS = ['admin_apc', 'admin_wilaya'];

// ─── GET /api/patrimoine/dashboard ───────────────────────
router.get('/dashboard', authenticate, requireRole(...AGENTS), asyncH(async (req, res) => {
  const [totaux, parStatut, loyersRes, alertesRes] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM bien_immobilier'),
    query('SELECT statut, COUNT(*) AS n FROM bien_immobilier GROUP BY statut'),
    query(`SELECT COALESCE(SUM(loyer_mensuel),0) AS total
           FROM contrat_occupation WHERE actif=TRUE AND type_contrat='location'`),
    query(`SELECT COUNT(*) AS n FROM contrat_occupation
           WHERE actif=TRUE AND date_fin IS NOT NULL AND date_fin <= now() + interval '30 days'
           AND date_fin >= now()`),
  ]);

  const statutMap = {};
  parStatut.rows.forEach(r => { statutMap[r.statut] = Number(r.n); });
  const total = Number(totaux.rows[0].total);
  const occupes = (statutMap.loue || 0) + (statutMap.affecte || 0) + (statutMap.occupe_sans_titre || 0);

  res.json({
    total,
    libres: statutMap.libre || 0,
    occupes,
    taux_occupation: total > 0 ? Math.round((occupes / total) * 100) : 0,
    loyers_mois: Number(loyersRes.rows[0].total),
    contrats_expirant: Number(alertesRes.rows[0].n),
    par_statut: statutMap,
  });
}));

// ─── GET /api/patrimoine/biens ────────────────────────────
router.get('/biens', authenticate, requireRole(...AGENTS), asyncH(async (req, res) => {
  const { statut, communeId, type } = req.query;
  let sql = `SELECT b.*, cm.nom AS commune_nom,
               (SELECT row_to_json(c) FROM contrat_occupation c
                WHERE c.bien_id=b.id AND c.actif=TRUE LIMIT 1) AS contrat_actif
             FROM bien_immobilier b
             LEFT JOIN commune cm ON cm.id=b.commune_id
             WHERE 1=1`;
  const params = [];
  if (statut) { params.push(statut); sql += ` AND b.statut=$${params.length}`; }
  if (communeId) { params.push(communeId); sql += ` AND b.commune_id=$${params.length}`; }
  if (type) { params.push(type); sql += ` AND b.type=$${params.length}`; }
  sql += ' ORDER BY b.reference LIMIT 500';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// ─── GET /api/patrimoine/biens/:id ───────────────────────
router.get('/biens/:id', authenticate, requireRole(...AGENTS), asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT b.*, cm.nom AS commune_nom FROM bien_immobilier b
     LEFT JOIN commune cm ON cm.id=b.commune_id WHERE b.id=$1`,
    [req.params.id]);
  if (!rows.length) throw notFound('Bien introuvable.');
  const contrats = await query(
    'SELECT * FROM contrat_occupation WHERE bien_id=$1 ORDER BY date_debut DESC',
    [req.params.id]);
  const historique = await query(
    'SELECT * FROM bien_historique WHERE bien_id=$1 ORDER BY cree_le DESC LIMIT 20',
    [req.params.id]);
  res.json({ ...rows[0], contrats: contrats.rows, historique: historique.rows });
}));

const toNum = z.union([z.number(), z.string().transform(v => v === '' ? null : Number(v))]).optional().nullable();
const bienSchema = z.object({
  type:         z.enum(['local_commercial','logement','bureau','equipement','terrain','immeuble']),
  adresse:      z.string().min(5),
  commune_id:   toNum,
  surface_m2:   toNum,
  lat:          toNum,
  lng:          toNum,
  etat_physique:z.enum(['bon','degrade','en_travaux','inutilisable']).default('bon'),
  proprietaire: z.string().default("Wilaya d'Alger"),
  valeur_venale:toNum,
  notes:        z.string().optional().nullable(),
});

// ─── POST /api/patrimoine/biens ───────────────────────────
router.post('/biens', authenticate, requireRole(...ADMINS), validate(bienSchema), asyncH(async (req, res) => {
  const ref = makeReference('PAT');
  const b = req.body;
  const { rows } = await query(
    `INSERT INTO bien_immobilier
       (reference,type,adresse,commune_id,surface_m2,lat,lng,etat_physique,proprietaire,valeur_venale,notes)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [ref, b.type, b.adresse, b.commune_id||null, b.surface_m2||null,
     b.lat||null, b.lng||null, b.etat_physique, b.proprietaire, b.valeur_venale||null, b.notes||null]);
  res.status(201).json(rows[0]);
}));

// ─── PATCH /api/patrimoine/biens/:id/statut ───────────────
router.patch('/biens/:id/statut', authenticate, requireRole(...ADMINS),
  validate(z.object({ statut: z.enum(['libre','loue','affecte','occupe_sans_titre','en_travaux','contentieux']), motif: z.string().optional() })),
  asyncH(async (req, res) => {
    const result = await withTransaction(async (c) => {
      const b = await c.query('SELECT * FROM bien_immobilier WHERE id=$1 FOR UPDATE', [req.params.id]);
      if (!b.rowCount) throw notFound('Bien introuvable.');
      const ancien = b.rows[0].statut;
      const { rows } = await c.query(
        'UPDATE bien_immobilier SET statut=$1, maj_le=now() WHERE id=$2 RETURNING *',
        [req.body.statut, req.params.id]);
      await c.query(
        'INSERT INTO bien_historique(bien_id,ancien_statut,nouveau_statut,motif,agent_id) VALUES($1,$2,$3,$4,$5)',
        [req.params.id, ancien, req.body.statut, req.body.motif||null, req.user.id]);
      return rows[0];
    });
    res.json(result);
  }));

const contratSchema = z.object({
  occupant_nom:   z.string().min(2),
  occupant_tel:   z.string().optional().nullable(),
  occupant_nin:   z.string().optional().nullable(),
  type_contrat:   z.enum(['location','affectation','mise_a_disposition']),
  date_debut:     z.string().min(10),
  date_fin:       z.string().min(10).optional().nullable(),
  loyer_mensuel:  z.number().int().min(0).default(0),
  caution:        z.number().int().min(0).default(0),
  notes:          z.string().optional().nullable(),
});

// ─── POST /api/patrimoine/biens/:id/contrats ──────────────
router.post('/biens/:id/contrats', authenticate, requireRole(...ADMINS),
  validate(contratSchema), asyncH(async (req, res) => {
    const b = await query('SELECT * FROM bien_immobilier WHERE id=$1', [req.params.id]);
    if (!b.rowCount) throw notFound('Bien introuvable.');
    const result = await withTransaction(async (c) => {
      await c.query('UPDATE contrat_occupation SET actif=FALSE WHERE bien_id=$1', [req.params.id]);
      const { rows } = await c.query(
        `INSERT INTO contrat_occupation
           (bien_id,occupant_nom,occupant_tel,occupant_nin,type_contrat,date_debut,date_fin,loyer_mensuel,caution,notes)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [req.params.id, req.body.occupant_nom, req.body.occupant_tel||null,
         req.body.occupant_nin||null, req.body.type_contrat, req.body.date_debut,
         req.body.date_fin||null, req.body.loyer_mensuel, req.body.caution, req.body.notes||null]);
      const newStatut = req.body.type_contrat === 'location' ? 'loue' : 'affecte';
      await c.query(
        'UPDATE bien_immobilier SET statut=$1, maj_le=now() WHERE id=$2',
        [newStatut, req.params.id]);
      await c.query(
        'INSERT INTO bien_historique(bien_id,ancien_statut,nouveau_statut,motif,agent_id) VALUES($1,$2,$3,$4,$5)',
        [req.params.id, b.rows[0].statut, newStatut, `Contrat ${req.body.type_contrat} créé`, req.user.id]);
      return rows[0];
    });
    res.status(201).json(result);
  }));

// ─── GET /api/patrimoine/contrats ─────────────────────────
router.get('/contrats', authenticate, requireRole(...AGENTS), asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, b.reference, b.adresse, b.type AS bien_type, cm.nom AS commune_nom
     FROM contrat_occupation c
     JOIN bien_immobilier b ON b.id=c.bien_id
     LEFT JOIN commune cm ON cm.id=b.commune_id
     WHERE c.actif=TRUE ORDER BY c.date_debut DESC LIMIT 200`);
  res.json(rows);
}));

// ─── GET /api/patrimoine/contrats/expirant ────────────────
router.get('/contrats/expirant', authenticate, requireRole(...AGENTS), asyncH(async (req, res) => {
  const jours = parseInt(req.query.jours || '30', 10);
  const { rows } = await query(
    `SELECT c.*, b.reference, b.adresse, cm.nom AS commune_nom,
            (c.date_fin - CURRENT_DATE) AS jours_restants
     FROM contrat_occupation c
     JOIN bien_immobilier b ON b.id=c.bien_id
     LEFT JOIN commune cm ON cm.id=b.commune_id
     WHERE c.actif=TRUE AND c.date_fin IS NOT NULL
       AND c.date_fin >= CURRENT_DATE AND c.date_fin <= CURRENT_DATE + ($1 || ' days')::interval
     ORDER BY c.date_fin`,
    [jours]);
  res.json(rows);
}));

// ─── POST /api/patrimoine/contrats/:id/paiements ──────────
router.post('/contrats/:id/paiements', authenticate, requireRole(...AGENTS),
  validate(z.object({
    mois:               z.string().min(7),
    montant:            z.number().int().positive(),
    paye_le:            z.string().min(10).optional().nullable(),
    mode_paiement:      z.string().optional().nullable(),
    reference_virement: z.string().optional().nullable(),
  })),
  asyncH(async (req, res) => {
    const c = await query('SELECT * FROM contrat_occupation WHERE id=$1 AND actif=TRUE', [req.params.id]);
    if (!c.rowCount) throw notFound('Contrat introuvable ou inactif.');
    const { rows } = await query(
      `INSERT INTO loyer_paiement(contrat_id,mois,montant,paye_le,mode_paiement,reference_virement)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, req.body.mois+'-01', req.body.montant,
       req.body.paye_le||null, req.body.mode_paiement||null, req.body.reference_virement||null]);
    await query(
      'UPDATE contrat_occupation SET statut_paiement=$1 WHERE id=$2',
      ['a_jour', req.params.id]);
    res.status(201).json(rows[0]);
  }));

module.exports = router;
