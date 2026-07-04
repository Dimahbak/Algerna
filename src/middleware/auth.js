const jwt = require('jsonwebtoken');
const config = require('../config');
const { unauthorized, forbidden } = require('../utils/http');

/** Vérifie le Bearer token et attache req.user = { id, role, commune_id, operateur_id }. */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(unauthorized('Token manquant'));
  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    next(unauthorized('Token invalide ou expiré'));
  }
}

/** Restreint l'accès à certains rôles. Ex : requireRole('agent','admin_wilaya'). */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      commune_id: user.commune_id,
      operateur_id: user.operateur_id,
      // Phase 1 — nouveau modèle (coexiste avec role)
      fonction: user.fonction || null,
      niveau_perimetre: user.niveau_perimetre || null,
      perimetre_id: user.perimetre_id || null,
      organisation_id: user.organisation_id || null,
      capacites: user.capacites || []
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// ── Constantes RBAC centralisées (anciennes — compatibilité) ──
const ROLES = {
  CITOYENS:        ['citoyen'],
  AGENTS:          ['agent', 'operateur'],
  CAPS:            ['agent'],  // CAP uses agent role for now
  SUPERVISORS:     ['admin_apc', 'admin_wilaya'],
  ADMINS:          ['admin_wilaya'],
  BACKOFFICE:      ['agent', 'operateur', 'admin_apc', 'admin_wilaya'],
  ALL_STAFF:       ['agent', 'operateur', 'admin_apc', 'admin_wilaya'],
};

// ── Helpers Phase 1 — nouveau modèle Fonction × Périmètre × Capacités ──
// NOTE : Les organisations créées en Phase 0 bis sont des données de démonstration.
// Elles ne constituent pas un référentiel imposé par ALGERNA.
// Chaque Wilaya doit pouvoir les remplacer lors de l'initialisation.

/** Vérifie si l'utilisateur a la fonction indiquée. */
function hasFonction(user, fonction) {
  return user && user.fonction === fonction;
}

/** Vérifie si l'utilisateur possède au moins une des capacités. */
function hasCapacite(user, ...capacites) {
  if (!user || !Array.isArray(user.capacites)) return false;
  return capacites.some(c => user.capacites.includes(c));
}

/** Vérifie si l'utilisateur a le niveau de périmètre et optionnellement l'id. */
function hasPerimetre(user, niveau, id) {
  if (!user) return false;
  if (user.niveau_perimetre !== niveau) return false;
  if (id !== undefined && user.perimetre_id !== String(id)) return false;
  return true;
}

/** Middleware : exige au moins une des capacités listées. */
function requireCapacite(...capacites) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!hasCapacite(req.user, ...capacites)) return next(forbidden());
    next();
  };
}

/** Middleware : exige une des fonctions listées. */
function requireFonction(...fonctions) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!fonctions.includes(req.user.fonction)) return next(forbidden());
    next();
  };
}

module.exports = {
  authenticate, requireRole, signToken, ROLES,
  // Phase 1 — nouveaux exports
  hasFonction, hasCapacite, hasPerimetre, requireCapacite, requireFonction
};
