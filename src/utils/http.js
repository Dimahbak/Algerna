/** Erreur applicative avec code HTTP. */
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest   = (m, d) => new HttpError(400, m, d);
const unauthorized = (m='Non authentifié') => new HttpError(401, m);
const forbidden    = (m='Accès refusé') => new HttpError(403, m);
const notFound     = (m='Introuvable') => new HttpError(404, m);

/** Enveloppe un handler async pour router les erreurs vers le middleware d'erreur. */
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Référence lisible : PREFIX-XXXXXX (base36). */
function makeReference(prefix) {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  const t = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${t}${rnd}`;
}

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, asyncH, makeReference };
