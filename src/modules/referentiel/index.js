// Référentiel territorial (lecture publique).
const express = require('express');
const { query } = require('../../db/pool');
const { asyncH } = require('../../utils/http');

const router = express.Router();

router.get('/circonscriptions', asyncH(async (req, res) => {
  const { rows } = await query('SELECT id,nom FROM circonscription ORDER BY id');
  res.json(rows);
}));

router.get('/communes', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT c.id,c.nom,c.circonscription_id,c.centre_lat,c.centre_lng, ci.nom AS circonscription
       FROM commune c JOIN circonscription ci ON ci.id=c.circonscription_id
      ORDER BY c.nom`);
  res.json(rows);
}));

router.get('/operateurs', asyncH(async (req, res) => {
  const { rows } = await query('SELECT id,nom,domaine FROM operateur ORDER BY domaine,nom');
  res.json(rows);
}));


router.get('/epics', asyncH(async (req, res) => {
  const { categorie, type } = req.query;
  let sql = 'SELECT id,sigle,nom,categorie,type,description FROM epic WHERE actif=TRUE';
  const params = [];
  if (categorie) { params.push(categorie); sql += ` AND categorie=$${params.length}`; }
  if (type)      { params.push(type);      sql += ` AND type=$${params.length}`; }
  sql += ' ORDER BY categorie,sigle';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

router.get('/epics/:sigle', asyncH(async (req, res) => {
  const sigle = req.params.sigle.toUpperCase();

  // ── Gateway: OLS bridge via special sigle prefixes ──
  if (sigle.startsWith('_')) {
    const equipSvc = require('../../services/equipementService');
    const contactSvc = require('../../services/contactService');
    const commSvc = require('../../services/communiqueDataService');
    if (sigle === '_EQ' || sigle.startsWith('_EQ_')) return res.json(await equipSvc.lister(req.query));
    if (sigle === '_EQT') return res.json(await equipSvc.types());
    if (sigle === '_CT') return res.json(await contactSvc.lister(req.query));
    if (sigle === '_CM') return res.json(await commSvc.listerActifs());
    return res.status(400).json({ erreur: 'Gateway inconnu: ' + sigle });
  }

  const { rows } = await query(
    'SELECT * FROM epic WHERE sigle=$1', [sigle]);
  if (!rows.length) return res.status(404).json({erreur:'EPIC introuvable.'});
  res.json(rows[0]);
}));

// Debug: log ALL requests to referentiel
router.use((req, res, next) => {
  console.log('[REF]', req.method, req.url, req.baseUrl, req.path, req.originalUrl);
  next();
});

// ── Data bridges (OLS doesn't proxy /api/equipements, /api/infos) ──
router.get('/equipements', asyncH(async (req, res) => {
  const { type, commune_id, q } = req.query;
  let sql = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`;
  const p = [];
  if (type) { p.push(type); sql += ` AND e.type = $${p.length}`; }
  if (commune_id) { p.push(commune_id); sql += ` AND e.commune_id = $${p.length}`; }
  if (q) { p.push('%' + q + '%'); sql += ` AND (e.nom ILIKE $${p.length} OR e.type ILIKE $${p.length} OR e.adresse ILIKE $${p.length})`; }
  sql += ' ORDER BY e.type, e.nom LIMIT 500';
  res.json((await query(sql, p)).rows);
}));

router.get('/equip-types', asyncH(async (req, res) => {
  res.json((await query('SELECT DISTINCT type FROM equipement_public ORDER BY type')).rows.map(r => r.type));
}));

router.get('/contacts', asyncH(async (req, res) => {
  const { categorie } = req.query;
  let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE'; const p = [];
  if (categorie) { p.push(categorie); sql += ` AND categorie = $${p.length}`; }
  res.json((await query(sql + ' ORDER BY ordre, nom', p)).rows);
}));

router.get('/communiques', asyncH(async (req, res) => {
  res.json((await query(
    `SELECT c.*, cm.nom AS commune_nom FROM communique c LEFT JOIN commune cm ON cm.id = c.commune_id
     WHERE c.actif = TRUE AND (c.date_fin IS NULL OR c.date_fin > NOW()) AND c.date_debut <= NOW()
     ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC LIMIT 20`
  )).rows);
}));

module.exports = router;
