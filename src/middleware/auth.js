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
    { id: user.id, role: user.role, commune_id: user.commune_id, operateur_id: user.operateur_id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// ── Constantes RBAC centralisées ──
const ROLES = {
  CITOYENS:        ['citoyen'],
  AGENTS:          ['agent', 'operateur'],
  CAPS:            ['agent'],  // CAP uses agent role for now
  SUPERVISORS:     ['admin_apc', 'admin_wilaya'],
  ADMINS:          ['admin_wilaya'],
  BACKOFFICE:      ['agent', 'operateur', 'admin_apc', 'admin_wilaya'],
  ALL_STAFF:       ['agent', 'operateur', 'admin_apc', 'admin_wilaya'],
};

module.exports = { authenticate, requireRole, signToken, ROLES };
