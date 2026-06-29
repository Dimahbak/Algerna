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

// GET /api/dashboard/quartier?communeId= — tableau de bord citoyen (public)
router.get('/quartier', asyncH(async (req, res) => {
  const { communeId } = req.query;
  if (!communeId) return res.json({});

  const [ouverts, resolus, delai, iqep] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement WHERE commune_id = $1 AND etat NOT IN ('resolu','rejete')`, [communeId]),
    query(`SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE etat = 'resolu' AND resolu_le >= NOW() - INTERVAL '30 days')::int AS ce_mois
             FROM signalement WHERE commune_id = $1 AND etat = 'resolu'`, [communeId]),
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolu_le - cree_le)) / 3600))::int AS heures
             FROM signalement WHERE commune_id = $1 AND etat = 'resolu' AND resolu_le IS NOT NULL`, [communeId]),
    query(`SELECT AVG(COALESCE(i.note_manuelle, i.note_auto))::int AS moy
             FROM iqep i JOIN parc p ON p.id = i.parc_id
            WHERE p.commune_id = $1 AND p.actif = TRUE`, [communeId]),
  ]);

  const totalSig = (ouverts.rows[0]?.n || 0) + (resolus.rows[0]?.total || 0);
  const pctResolus = totalSig > 0 ? Math.round((resolus.rows[0]?.total || 0) / totalSig * 100) : null;

  res.json({
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
            WHERE actif=TRUE AND (date_fin IS NULL OR date_fin > NOW())
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

module.exports = router;
