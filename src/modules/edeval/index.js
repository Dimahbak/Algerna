/**
 * Module Espaces Verts — Gestion des parcs + IQEP.
 *
 * IQEP = Indice Qualité des Espaces Publics (0–100 par parc).
 *
 * ═══ FORMULE IQEP (centralisée ici — un seul endroit à recalibrer) ═══
 *
 *   note_auto = max(0, 100
 *     − 8 × signalements_ouverts_haute
 *     − 5 × signalements_ouverts_moyenne
 *     − 2 × signalements_ouverts_basse
 *     + 3 × signalements_resolus_recents (< 30 jours)
 *   )  borné [0, 100]
 *
 *   note_finale = note_manuelle si saisie, sinon note_auto
 *
 *   Moyenne IQEP → alimente la dimension "Vivre-ensemble" de l'ICUA (20%).
 *
 * Les sous-critères manuels (sc_espaces_verts, sc_equipements, sc_proprete,
 * sc_eclairage, sc_securite, sc_satisfaction) sont stockés à titre indicatif
 * et pour la traçabilité ; quand une note_manuelle est saisie, elle prend le
 * dessus sur la note_auto.
 * ═════════════════════════════════════════════════════════════════════════
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');

const router = express.Router();

// ── Pénalités par criticité (ajustables) ──
const PEN = { haute: 8, moyenne: 5, basse: 2 };
const BONUS_RESOLU = 3;        // par signalement résolu < 30 jours
const JOURS_BONUS  = 30;       // fenêtre bonus résolution

// ════════════════════════════════════════════════
// CALCUL IQEP AUTO pour un parc donné
// ════════════════════════════════════════════════
async function calculerIqepAuto(parcId) {
  // Signalements espaces_verts rattachés à ce parc, ouverts
  const { rows: ouverts } = await query(
    `SELECT cat.criticite, COUNT(*)::int AS n
       FROM signalement s
       JOIN categorie_signal cat ON cat.id = s.categorie_id
      WHERE s.parc_id = $1 AND s.etat NOT IN ('resolu','rejete')
      GROUP BY cat.criticite`,
    [parcId]);

  // Signalements résolus récemment (bonus)
  const { rows: resolus } = await query(
    `SELECT COUNT(*)::int AS n FROM signalement
      WHERE parc_id = $1 AND etat = 'resolu'
        AND resolu_le >= NOW() - INTERVAL '${JOURS_BONUS} days'`,
    [parcId]);

  let penalite = 0;
  for (const r of ouverts) {
    penalite += (PEN[r.criticite] || PEN.basse) * r.n;
  }
  const bonus = (resolus[0]?.n || 0) * BONUS_RESOLU;
  return Math.max(0, Math.min(100, 100 - penalite + bonus));
}

// Recalcule et persiste la note auto
async function refreshIqep(parcId) {
  const note = await calculerIqepAuto(parcId);
  await query(
    `INSERT INTO iqep (parc_id, note_auto, maj_le)
     VALUES ($1, $2, NOW())
     ON CONFLICT (parc_id)
     DO UPDATE SET note_auto = $2, maj_le = NOW()`,
    [parcId, note]);
  return note;
}

// Moyenne IQEP globale (pour l'ICUA)
async function moyenneIqep() {
  // Recalcule tous les parcs actifs
  const { rows: parcs } = await query('SELECT id FROM parc WHERE actif = TRUE');
  if (!parcs.length) return null;
  let total = 0;
  for (const p of parcs) {
    await refreshIqep(p.id);
  }
  const { rows } = await query(
    `SELECT AVG(COALESCE(i.note_manuelle, i.note_auto))::int AS moy
       FROM iqep i JOIN parc p ON p.id = i.parc_id WHERE p.actif = TRUE`);
  return rows[0]?.moy ?? null;
}

// ── ROUTES ──────────────────────────────────────

// GET /parcs — liste publique
router.get('/parcs', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT p.*, c.nom AS commune_nom,
            COALESCE(i.note_manuelle, i.note_auto) AS iqep
       FROM parc p
       LEFT JOIN commune c ON c.id = p.commune_id
       LEFT JOIN iqep i ON i.parc_id = p.id
      WHERE p.actif = TRUE ORDER BY p.nom`);
  res.json(rows);
}));

// GET /parcs/:id
router.get('/parcs/:id', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT p.*, c.nom AS commune_nom,
            COALESCE(i.note_manuelle, i.note_auto) AS iqep,
            i.note_auto, i.note_manuelle,
            i.sc_espaces_verts, i.sc_equipements, i.sc_proprete,
            i.sc_eclairage, i.sc_securite, i.sc_satisfaction,
            i.maj_le, i.maj_par
       FROM parc p
       LEFT JOIN commune c ON c.id = p.commune_id
       LEFT JOIN iqep i ON i.parc_id = p.id
      WHERE p.id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ erreur: 'Parc introuvable' });
  res.json(rows[0]);
}));

// GET /iqep — liste parcs + note finale
router.get('/iqep', asyncH(async (req, res) => {
  // Recalcule les notes auto
  const { rows: parcs } = await query('SELECT id FROM parc WHERE actif = TRUE');
  for (const p of parcs) await refreshIqep(p.id);

  const { rows } = await query(
    `SELECT p.id, p.nom, c.nom AS commune_nom, p.lat, p.lng,
            i.note_auto, i.note_manuelle,
            COALESCE(i.note_manuelle, i.note_auto) AS note_finale,
            i.maj_le
       FROM parc p
       LEFT JOIN commune c ON c.id = p.commune_id
       LEFT JOIN iqep i ON i.parc_id = p.id
      WHERE p.actif = TRUE ORDER BY p.nom`);
  res.json(rows);
}));

// GET /iqep/moyenne — pour l'ICUA (AVANT :parcId pour éviter capture)
router.get('/iqep/moyenne',
  authenticate,
  requireRole('admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const moy = await moyenneIqep();
    res.json({ moyenne_iqep: moy });
  }));

// GET /iqep/:parcId — détail + sous-critères
router.get('/iqep/:parcId', asyncH(async (req, res) => {
  const parcId = Number(req.params.parcId);
  await refreshIqep(parcId);
  const { rows } = await query(
    `SELECT p.id, p.nom, c.nom AS commune_nom,
            i.*,
            COALESCE(i.note_manuelle, i.note_auto) AS note_finale
       FROM parc p
       LEFT JOIN commune c ON c.id = p.commune_id
       LEFT JOIN iqep i ON i.parc_id = p.id
      WHERE p.id = $1`, [parcId]);
  if (!rows.length) return res.status(404).json({ erreur: 'Parc introuvable' });
  res.json(rows[0]);
}));

// PATCH /iqep/:parcId — ajustement manuel (agent/admin)
router.patch('/iqep/:parcId',
  authenticate,
  requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'),
  asyncH(async (req, res) => {
    const parcId = Number(req.params.parcId);
    const { note_manuelle, sc_espaces_verts, sc_equipements, sc_proprete,
            sc_eclairage, sc_securite, sc_satisfaction } = req.body;

    // Vérifier que le parc existe
    const { rowCount } = await query('SELECT 1 FROM parc WHERE id = $1', [parcId]);
    if (!rowCount) throw notFound('Parc introuvable');

    // Valider les notes (0-100 ou null)
    const vals = { note_manuelle, sc_espaces_verts, sc_equipements, sc_proprete,
                   sc_eclairage, sc_securite, sc_satisfaction };
    for (const [k, v] of Object.entries(vals)) {
      if (v !== null && v !== undefined && (v < 0 || v > 100)) {
        throw badRequest(`${k} doit être entre 0 et 100`);
      }
    }

    await query(
      `INSERT INTO iqep (parc_id, note_auto, note_manuelle,
                          sc_espaces_verts, sc_equipements, sc_proprete,
                          sc_eclairage, sc_securite, sc_satisfaction,
                          maj_le, maj_par)
       VALUES ($1, (SELECT COALESCE(note_auto,100) FROM iqep WHERE parc_id=$1),
               $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
       ON CONFLICT (parc_id)
       DO UPDATE SET
         note_manuelle    = COALESCE($2, iqep.note_manuelle),
         sc_espaces_verts = COALESCE($3, iqep.sc_espaces_verts),
         sc_equipements   = COALESCE($4, iqep.sc_equipements),
         sc_proprete      = COALESCE($5, iqep.sc_proprete),
         sc_eclairage     = COALESCE($6, iqep.sc_eclairage),
         sc_securite      = COALESCE($7, iqep.sc_securite),
         sc_satisfaction  = COALESCE($8, iqep.sc_satisfaction),
         maj_le = NOW(),
         maj_par = $9`,
      [parcId, note_manuelle ?? null, sc_espaces_verts ?? null,
       sc_equipements ?? null, sc_proprete ?? null,
       sc_eclairage ?? null, sc_securite ?? null,
       sc_satisfaction ?? null, req.user.id]);

    // Renvoyer le détail mis à jour
    await refreshIqep(parcId);
    const { rows } = await query(
      `SELECT i.*, COALESCE(i.note_manuelle, i.note_auto) AS note_finale
         FROM iqep i WHERE i.parc_id = $1`, [parcId]);
    res.json(rows[0]);
  }));

module.exports = router;
module.exports.moyenneIqep = moyenneIqep;
