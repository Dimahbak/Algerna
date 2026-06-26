/**
 * Logique métier pure (sans I/O) — testable unitairement.
 * Les fonctions du service appellent ces calculs ; on les isole ici
 * pour pouvoir les vérifier sans base de données.
 */
const POIDS_CRITICITE = { haute: 3, moyenne: 2, basse: 1 };
const SEUIL_POINT_NOIR = 3;
const RAYON_DEG = 0.0005;

// Score d'une commune à partir de ses signalements ouverts
function calculerScore(signauxOuverts) {
  if (!signauxOuverts.length) return 100;
  const penalite = signauxOuverts.reduce(
    (s, sig) => s + (POIDS_CRITICITE[sig.criticite] || 1), 0);
  return Math.max(0, 100 - penalite * 4);
}

// Détection de points noirs par clustering de proximité
function detecterPointsNoirs(signaux) {
  const clusters = [];
  for (const s of signaux) {
    const c = clusters.find(cl => Math.hypot(cl.lat - s.lat, cl.lng - s.lng) <= RAYON_DEG);
    if (c) c.items.push(s);
    else clusters.push({ lat: s.lat, lng: s.lng, items: [s] });
  }
  return clusters
    .filter(c => c.items.length >= SEUIL_POINT_NOIR)
    .map(c => ({ lat: c.lat, lng: c.lng, nombre: c.items.length }));
}

// ICUA pondéré
function calculerIcua({ proprete, reactivite, vivre_ensemble, fluidite, engagement }) {
  return Math.round(
    0.30 * proprete + 0.25 * reactivite + 0.20 * vivre_ensemble +
    0.15 * fluidite + 0.10 * engagement);
}

module.exports = { calculerScore, detecterPointsNoirs, calculerIcua, POIDS_CRITICITE, SEUIL_POINT_NOIR };
