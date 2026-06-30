/**
 * Engagement de Service (SLA) — Service centralisé.
 * Tous les calculs de délai passent par ce module.
 */

// Durée cible par défaut (heures) — peut être surchargé par configEngine
let DEFAULT_TARGET_H = 48;

// Charger depuis la config DB au premier appel
let _configLoaded = false;
async function ensureConfig() {
  if (_configLoaded) return;
  try {
    const ce = require('./configEngine');
    DEFAULT_TARGET_H = await ce.getInt('sla.delai_defaut_h', 48);
    _configLoaded = true;
  } catch (e) { /* configEngine pas encore dispo, utiliser défaut */ }
}

// Seuils
const WARN_RATIO = 0.75; // 75% = échéance proche

/**
 * Calcule le statut SLA d'un signalement.
 * @param {string|Date} cree_le - date de création
 * @param {number} [targetH] - délai cible en heures
 * @returns {{ status: string, elapsed: number, remaining: number, label: string, pct: number }}
 */
function compute(cree_le, targetH) {
  const target = targetH || DEFAULT_TARGET_H;
  if (!cree_le) return { status: 'conforme', elapsed: 0, remaining: target, label: 'Conforme', pct: 0 };

  const elapsed = (Date.now() - new Date(cree_le).getTime()) / 3600000;
  const remaining = target - elapsed;
  const pct = Math.min(Math.round((elapsed / target) * 100), 999);

  let status, label;
  if (remaining <= 0) {
    status = 'hors_delai';
    label = `Hors délai (${Math.round(-remaining)}h)`;
  } else if (elapsed / target >= WARN_RATIO) {
    status = 'echeance_proche';
    label = `${Math.round(remaining)}h restantes`;
  } else {
    status = 'conforme';
    label = 'Conforme';
  }

  return { status, elapsed: Math.round(elapsed), remaining: Math.round(remaining), label, pct };
}

/**
 * Calcule le pourcentage de conformité sur un ensemble de signalements résolus.
 * @param {Array} signalements - [{ cree_le, resolu_le }]
 * @param {number} [targetH]
 * @returns {number} pourcentage 0-100
 */
function conformitePct(signalements, targetH) {
  const target = targetH || DEFAULT_TARGET_H;
  if (!signalements || !signalements.length) return 100;
  const conformes = signalements.filter(s => {
    if (!s.resolu_le || !s.cree_le) return false;
    const h = (new Date(s.resolu_le) - new Date(s.cree_le)) / 3600000;
    return h <= target;
  });
  return Math.round((conformes.length / signalements.length) * 100);
}

/**
 * SQL helpers pour les requêtes de supervision.
 */
function sqlHorsDelai(alias = 's', targetH) {
  const h = targetH || DEFAULT_TARGET_H;
  return `${alias}.etat = 'recu' AND ${alias}.cree_le < NOW() - INTERVAL '${h} hours'`;
}

function sqlConforme(alias = 's', targetH) {
  const h = targetH || DEFAULT_TARGET_H;
  return `${alias}.etat = 'resolu' AND EXTRACT(EPOCH FROM (${alias}.resolu_le - ${alias}.cree_le)) / 3600 <= ${h}`;
}

module.exports = {
  DEFAULT_TARGET_H,
  WARN_RATIO,
  compute,
  conformitePct,
  sqlHorsDelai,
  sqlConforme,
};
