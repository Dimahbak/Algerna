/**
 * Tableau de bord Wilaya + calcul de l'ICUA.
 * ICUA = 0.30·Propreté + 0.25·Réactivité + 0.20·Vivre-ensemble
 *      + 0.15·Fluidité + 0.10·Engagement   (chaque sous-indice sur 100)
 */
const express = require('express');
const { query } = require('../../db/pool');
const svc = require('../proprete/signalementService');
const { moyenneIqep } = require('../edeval');
const { scoreMobilite } = require('../civipark');
const { scoreSatisfactionRDV } = require('../rdv');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH } = require('../../utils/http');

const router = express.Router();

const POIDS = { proprete: 0.30, reactivite: 0.25, vivre: 0.20, fluidite: 0.15, engagement: 0.10 };

// Sous-indice Propreté : moyenne des scores propreté par commune
async function sousIndiceProprete() {
  const scores = await svc.scoresParCommune('proprete');
  if (!scores.length) return 100;
  return Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length);
}

// Sous-indice Réactivité : part des signalements (tous domaines) résolus dans les délais.
// Proxy simple : 100 si délai moyen <= 48h, dégressif au-delà.
async function sousIndiceReactivite() {
  const delaiProp = await svc.delaiMoyenHeures('proprete');
  const delaiEau = await svc.delaiMoyenHeures('eau');
  const delais = [delaiProp, delaiEau].filter(d => d !== null);
  if (!delais.length) return 100;
  const moyenne = delais.reduce((a, b) => a + b, 0) / delais.length;
  return Math.max(0, Math.min(100, Math.round(100 - Math.max(0, moyenne - 48) * 0.5)));
}

// Sous-indice Fluidité administrative : taux de présence aux RDV
async function sousIndiceFluidite() {
  const { rows } = await query(
    `SELECT COUNT(*) FILTER (WHERE statut IN ('present','traite')) AS presents,
            COUNT(*) FILTER (WHERE statut IN ('present','traite','absent')) AS total
       FROM rdv`);
  const { presents, total } = rows[0];
  if (Number(total) === 0) return 100;
  return Math.round((Number(presents) / Number(total)) * 100);
}

// Sous-indice Engagement : citoyens actifs (ayant des points) / inscrits
async function sousIndiceEngagement() {
  const { rows } = await query(
    `SELECT COUNT(*) FILTER (WHERE points > 0) AS actifs, COUNT(*) AS total
       FROM utilisateur WHERE role='citoyen'`);
  const { actifs, total } = rows[0];
  if (Number(total) === 0) return 0;
  return Math.round((Number(actifs) / Number(total)) * 100);
}

// GET /api/dashboard/icua — calcul ICUA global
router.get('/icua',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  asyncH(async (req, res) => {
    const proprete = await sousIndiceProprete();
    const reactivite = await sousIndiceReactivite();
    // Vivre-ensemble : alimenté par la moyenne IQEP (qualité des parcs).
    // Fallback 70 si aucun parc n'est encore évalué.
    const iqepMoy = await moyenneIqep();
    const vivre = iqepMoy !== null ? iqepMoy : 70;
    // Fluidité : composite RDV présence + satisfaction post-RDV + mobilité CiviPark
    const fluiditeRdv = await sousIndiceFluidite();
    const satisfRdv = await scoreSatisfactionRDV();
    const mobilitePark = await scoreMobilite();
    // Composite : présence RDV (base) + satisfaction si disponible + mobilité si dispo
    let fluidite = fluiditeRdv;
    const composants = [{ w: 0.5, v: fluiditeRdv }];
    if (satisfRdv !== null) composants.push({ w: 0.3, v: satisfRdv });
    if (mobilitePark !== null) composants.push({ w: 0.2, v: mobilitePark });
    const totalW = composants.reduce((s, c) => s + c.w, 0);
    fluidite = Math.round(composants.reduce((s, c) => s + (c.w / totalW) * c.v, 0));
    const engagement = await sousIndiceEngagement();

    const icua = Math.round(
      POIDS.proprete * proprete + POIDS.reactivite * reactivite +
      POIDS.vivre * vivre + POIDS.fluidite * fluidite + POIDS.engagement * engagement);

    res.json({
      icua,
      dimensions: { proprete, reactivite, vivre_ensemble: vivre, fluidite, engagement },
      ponderation: POIDS,
      lecture: icua >= 75 ? 'ville civique' : icua >= 50 ? 'à surveiller' : 'prioritaire',
    });
  }));

// GET /api/dashboard/synthese — vue agrégée multi-domaines
router.get('/synthese',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  asyncH(async (req, res) => {
    const [propScores, eauScores, propNoirs, eauNoirs] = await Promise.all([
      svc.scoresParCommune('proprete'),
      svc.scoresParCommune('eau'),
      svc.pointsNoirs('proprete'),
      svc.pointsNoirs('eau'),
    ]);
    res.json({
      proprete: { scores: propScores, pointsNoirs: propNoirs },
      eau: { scores: eauScores, pointsNoirs: eauNoirs },
    });
  }));

// GET /api/dashboard/quartier — multiplex endpoint
// OLS only proxies this exact path. Use ?module= to access other data.
// ?module=equipements&type=parking → equipements list
// ?module=contacts&categorie=urgences → contacts list
// ?module=communiques → active communiqués
// ?module=equip_types → distinct equipment types
// (no module) → original quartier dashboard
router.get('/quartier', asyncH(async (req, res) => {
  const mod = req.query.module;

  if (mod === 'equipements') {
    const { type, commune_id, commune: qCommune, q, lat, lng, latitude, longitude, rayon } = req.query;
    let sql = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e
               LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`;
    const p = [];
    if (type) { p.push(type); sql += ` AND e.type = $${p.length}`; }
    if (commune_id) { p.push(commune_id); sql += ` AND e.commune_id = $${p.length}`; }
    if (qCommune) { p.push('%' + qCommune + '%'); sql += ` AND c.nom ILIKE $${p.length}`; }
    if (q) { p.push('%' + q + '%'); sql += ` AND (e.nom ILIKE $${p.length} OR e.type ILIKE $${p.length} OR e.adresse ILIKE $${p.length})`; }
    const pLat = lat || latitude; const pLng = lng || longitude;
    if (pLat && pLng) { const r = parseFloat(rayon) || 0.02; p.push(parseFloat(pLat), parseFloat(pLng), r); sql += ` AND ABS(e.lat - $${p.length-2}) < $${p.length} AND ABS(e.lng - $${p.length-1}) < $${p.length}`; }
    sql += ' ORDER BY e.type, e.nom LIMIT 500';
    return res.json((await query(sql, p)).rows);
  }

  if (mod === 'equip_types') {
    return res.json((await query('SELECT DISTINCT type FROM equipement_public ORDER BY type')).rows.map(r => r.type));
  }

  if (mod === 'contacts') {
    const { categorie } = req.query;
    let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE'; const p = [];
    if (categorie) { p.push(categorie); sql += ` AND categorie = $${p.length}`; }
    return res.json((await query(sql + ' ORDER BY ordre, nom', p)).rows);
  }

  if (mod === 'communiques') {
    return res.json((await query(
      `SELECT c.*, cm.nom AS commune_nom FROM communique c
       LEFT JOIN commune cm ON cm.id = c.commune_id
       WHERE c.actif = TRUE AND c.statut = 'publie' AND (c.date_fin IS NULL OR c.date_fin > NOW()) AND c.date_debut <= NOW()
       ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC
       LIMIT 20`)).rows);
  }

  // Original quartier dashboard
  // Supports: ?communeId= (commune scope), ?houma_lat=&houma_lng= (rayon 2km),
  //           ?quartier_id= (perimetre if exists, else rayon 2km with houma_lat/lng)
  const { communeId, houma_lat, houma_lng, quartier_id } = req.query;
  const hLat = houma_lat ? parseFloat(houma_lat) : null;
  const hLng = houma_lng ? parseFloat(houma_lng) : null;

  // Determine geographic filter
  let geoFilter = '';
  let geoParams = [];
  let scope = 'commune'; // default

  if (hLat && hLng) {
    // Rayon 2 km ≈ 0.018° latitude (~2 km), used as bounding box
    const RAYON_HOUMA = 0.018;
    geoFilter = `ABS(s.lat - $1) < $2 AND ABS(s.lng - $3) < $2`;
    geoParams = [hLat, RAYON_HOUMA, hLng];
    scope = 'houma';
  } else if (communeId) {
    geoFilter = `s.commune_id = $1`;
    geoParams = [communeId];
    scope = 'commune';
  } else {
    return res.json({});
  }

  const [ouverts, resolus, delai, iqep] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement s WHERE ${geoFilter} AND s.etat NOT IN ('resolu','rejete')`, geoParams),
    query(`SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE s.etat = 'resolu' AND s.resolu_le >= NOW() - INTERVAL '30 days')::int AS ce_mois
             FROM signalement s WHERE ${geoFilter} AND s.etat = 'resolu'`, geoParams),
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le - s.cree_le)) / 3600))::int AS heures
             FROM signalement s WHERE ${geoFilter} AND s.etat = 'resolu' AND s.resolu_le IS NOT NULL`, geoParams),
    scope === 'commune'
      ? query(`SELECT AVG(COALESCE(i.note_manuelle, i.note_auto))::int AS moy
               FROM iqep i JOIN parc p ON p.id = i.parc_id
               WHERE p.commune_id = $1 AND p.actif = TRUE`, [communeId])
      : Promise.resolve({ rows: [{ moy: null }] }),
  ]);

  const totalSig = (ouverts.rows[0]?.n || 0) + (resolus.rows[0]?.total || 0);
  const pctResolus = totalSig > 0 ? Math.round((resolus.rows[0]?.total || 0) / totalSig * 100) : null;

  res.json({
    scope,
    ouverts: ouverts.rows[0]?.n || 0,
    resolus_ce_mois: resolus.rows[0]?.ce_mois || 0,
    pct_resolus: pctResolus,
    delai_moyen_heures: delai.rows[0]?.heures || null,
    iqep_moyen: iqep.rows[0]?.moy || null,
  });
}));

// GET /api/dashboard/citoyen — tableau de bord personnel
router.get('/citoyen', authenticate, asyncH(async (req, res) => {
  const uid = req.user.id;
  const cid = req.user.commune_id;
  const [sigs, rdvs, notifs, pts, iqepR, communiques, activite] = await Promise.all([
    query(`SELECT COUNT(*) FILTER (WHERE etat NOT IN ('resolu','rejete'))::int AS ouverts,
                  COUNT(*) FILTER (WHERE etat = 'resolu')::int AS resolus
             FROM signalement WHERE citoyen_id = $1`, [uid]),
    query(`SELECT r.id, c.debut, s.nom AS service, r.statut
             FROM rdv r JOIN creneau c ON c.id=r.creneau_id JOIN service s ON s.id=c.service_id
            WHERE r.citoyen_id=$1 AND c.debut > NOW() AND r.statut='reserve'
            ORDER BY c.debut LIMIT 1`, [uid]),
    query('SELECT COUNT(*)::int AS n FROM notification WHERE utilisateur_id=$1 AND lu=FALSE', [uid]),
    query('SELECT points FROM utilisateur WHERE id=$1', [uid]),
    cid ? query(`SELECT AVG(COALESCE(i.note_manuelle,i.note_auto))::int AS moy
                   FROM iqep i JOIN parc p ON p.id=i.parc_id WHERE p.commune_id=$1 AND p.actif=TRUE`, [cid])
        : { rows: [{ moy: null }] },
    query(`SELECT titre, message, niveau FROM communique
            WHERE actif=TRUE AND statut='publie' AND date_debut <= NOW() AND (date_fin IS NULL OR date_fin > NOW())
            ORDER BY cree_le DESC LIMIT 3`),
    query(`SELECT motif, delta, le FROM points_journal WHERE citoyen_id=$1 ORDER BY le DESC LIMIT 5`, [uid]),
  ]);
  res.json({
    signalements: sigs.rows[0],
    prochain_rdv: rdvs.rows[0] || null,
    notifications_non_lues: notifs.rows[0].n,
    points: pts.rows[0]?.points || 0,
    iqep: iqepR.rows[0]?.moy || null,
    communiques: communiques.rows,
    activite_recente: activite.rows,
  });
}));

// ── Proxy bridges via /api/dashboard/* (OLS proxies this path) ──
const { asyncH: bAsyncH } = require('../../utils/http');

router.get('/equipements', bAsyncH(async (req, res) => {
  const { type, commune_id, commune, lat, lng, rayon, q, latitude, longitude } = req.query;
  let sql = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e
             LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`;
  const p = [];
  if (type) { p.push(type); sql += ` AND e.type = $${p.length}`; }
  if (commune_id) { p.push(commune_id); sql += ` AND e.commune_id = $${p.length}`; }
  if (commune) { p.push('%' + commune + '%'); sql += ` AND c.nom ILIKE $${p.length}`; }
  if (q) { p.push('%' + q + '%'); sql += ` AND (e.nom ILIKE $${p.length} OR e.type ILIKE $${p.length} OR e.adresse ILIKE $${p.length})`; }
  const pLat = lat || latitude; const pLng = lng || longitude;
  if (pLat && pLng) { const r = parseFloat(rayon) || 0.02; p.push(parseFloat(pLat), parseFloat(pLng), r); sql += ` AND ABS(e.lat - $${p.length-2}) < $${p.length} AND ABS(e.lng - $${p.length-1}) < $${p.length}`; }
  sql += ' ORDER BY e.type, e.nom LIMIT 500';
  const { rows } = await query(sql, p);
  res.json(rows);
}));

router.get('/equipements/types', bAsyncH(async (req, res) => {
  const { rows } = await query('SELECT DISTINCT type FROM equipement_public ORDER BY type');
  res.json(rows.map(r => r.type));
}));

router.get('/contacts', bAsyncH(async (req, res) => {
  const { categorie } = req.query;
  let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE';
  const p = [];
  if (categorie) { p.push(categorie); sql += ` AND categorie = $${p.length}`; }
  sql += ' ORDER BY ordre, nom';
  const { rows } = await query(sql, p);
  res.json(rows);
}));

router.get('/communiques', bAsyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, cm.nom AS commune_nom FROM communique c
     LEFT JOIN commune cm ON cm.id = c.commune_id
     WHERE c.actif = TRUE AND c.statut = 'publie' AND (c.date_fin IS NULL OR c.date_fin > NOW()) AND c.date_debut <= NOW()
     ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC
     LIMIT 20`);
  res.json(rows);
}));

module.exports = router;
