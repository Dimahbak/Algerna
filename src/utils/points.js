/**
 * Attribution centralisée des Points Citoyens.
 *
 * PRINCIPE : récompenser l'IMPACT, pas l'activité.
 * La validation après intervention (+20) rapporte plus que la création (+5).
 * La dégressivité plafonne les points de création pour décourager le spam :
 * - Les 5 premières créations du jour = plein tarif (+5)
 * - Au-delà = 0 point (plafond strict)
 */
const { query } = require('../db/pool');

/**
 * Attribue des points à un citoyen selon le barème en base.
 * @param {string} userId - UUID du citoyen
 * @param {string} code   - code barème (creation, photo, validation_resolution, etc.)
 * @param {string} [refType] - type de référence (signalement, rdv, etc.)
 * @param {string} [refId]   - id de la référence
 * @returns {Promise<{delta: number, awarded: boolean}>}
 */
async function awardPoints(userId, code, refType, refId) {
  // Lire le barème
  const { rows: bareme } = await query('SELECT delta, plafond_jour FROM bareme_points WHERE code = $1', [code]);
  if (!bareme.length) { console.warn('[points] barème inconnu:', code); return { delta: 0, awarded: false }; }

  let delta = bareme[0].delta;
  const plafond = bareme[0].plafond_jour;

  // Dégressivité : si plafond défini, vérifier le compteur quotidien
  if (plafond !== null && (code === 'creation' || code === 'photo')) {
    const { rows } = await query(
      'SELECT creations_today, creations_today_date FROM utilisateur WHERE id = $1', [userId]);
    const u = rows[0];
    const today = new Date().toISOString().slice(0, 10);

    let count = 0;
    if (u && u.creations_today_date === today) {
      count = u.creations_today || 0;
    } else {
      // Nouveau jour → reset
      await query('UPDATE utilisateur SET creations_today = 0, creations_today_date = $1 WHERE id = $2', [today, userId]);
    }

    if (count >= plafond) {
      // Plafond atteint → 0 points (anti-spam strict)
      return { delta: 0, awarded: false, reason: 'plafond_jour' };
    }

    // Incrémenter le compteur
    await query('UPDATE utilisateur SET creations_today = creations_today + 1 WHERE id = $1', [userId]);
  }

  // Attribuer les points
  await query(
    `INSERT INTO points_journal (citoyen_id, delta, motif, ref_type, ref_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, delta, bareme[0].description || code, refType || null, refId || null]);
  await query('UPDATE utilisateur SET points = points + $1 WHERE id = $2', [delta, userId]);

  // Mettre à jour le niveau après attribution
  try { await refreshNiveau(userId); } catch(e) { console.warn('[niveau]', e.message); }

  return { delta, awarded: true };
}

/**
 * Recalcule et met à jour le niveau d'un citoyen.
 * Basé sur Points Citoyens cumulés ET pertinence (% signalements résolus).
 * Un citoyen doit satisfaire les DEUX seuils pour accéder à un niveau.
 */
async function refreshNiveau(userId) {
  const { rows: niveaux } = await query('SELECT * FROM niveau ORDER BY seuil_points DESC');
  const { rows: uRows } = await query('SELECT points FROM utilisateur WHERE id = $1', [userId]);
  if (!uRows.length) return;

  const points = uRows[0].points || 0;

  // Calcul pertinence : signalements résolus / signalements créés
  const { rows: stats } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE etat = 'resolu')::int AS resolus
       FROM signalement WHERE citoyen_id = $1`, [userId]);
  const total = stats[0]?.total || 0;
  const pertinence = total > 0 ? Math.round((stats[0]?.resolus || 0) / total * 100) : 0;

  // Trouver le niveau le plus haut satisfait (les deux seuils)
  let niveauId = niveaux[niveaux.length - 1]?.id || 1; // fallback = Citoyen
  for (const n of niveaux) {
    if (points >= n.seuil_points && pertinence >= n.seuil_pertinence) {
      niveauId = n.id;
      break;
    }
  }

  await query('UPDATE utilisateur SET niveau_id = $1 WHERE id = $2', [niveauId, userId]);
}

module.exports = { awardPoints, refreshNiveau };
