const { HttpError, badRequest } = require('../utils/http');

/** Valide req.body contre un schéma Zod ; remplace req.body par la version typée. */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(badRequest('Données invalides', result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}

/** Middleware d'erreur global — à monter en dernier. */
function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erreur: err.message, details: err.details });
  }
  console.error('Erreur non gérée :', err);
  res.status(500).json({ erreur: 'Erreur interne du serveur' });
}

module.exports = { validate, errorHandler };
