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

module.exports = router;
