const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { errorHandler } = require('./middleware/validation');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  // Permettre l'envoi du Referer vers les serveurs de tuiles OSM
  // (OSM bloque les requêtes sans Referer valide — HTTP 418/403)
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Fichiers statiques (front-end)
app.use(express.static(path.join(__dirname, '../public')));

// CyberPanel/OLS proxy context strips the /api prefix before
// forwarding to Express. Routes are dual-mounted below (/api/* + /*)
// so they work in both local dev and production behind OLS.

// Santé
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'civismart', env: config.env }));
app.get('/health', (req, res) => res.json({ ok: true, service: 'civismart', env: config.env }));

// Modules — montés sur /api/* ET /* (OLS proxy strip le préfixe /api)
const moduleMap = {
  auth:        require('./modules/auth'),
  referentiel: require('./modules/referentiel'),
  rdv:         require('./modules/rdv'),
  proprete:    require('./modules/proprete'),
  eau:         require('./modules/eau'),
  points:      require('./modules/points'),
  dashboard:   require('./modules/dashboard'),
  patrimoine:  require('./modules/patrimoine'),
  signaler:    require('./modules/signaler'),
  edeval:      require('./modules/edeval'),
  cap:         require('./modules/cap'),
  civipark:    require('./modules/civipark'),
  infos:       require('./modules/infos'),
};
for (const [name, handler] of Object.entries(moduleMap)) {
  app.use(`/api/${name}`, handler);  // Normal path (localhost)
  app.use(`/${name}`, handler);      // Stripped path (OLS proxy)
}

// SPA fallback — toutes les routes non-API renvoient index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 API
app.use((req, res) => res.status(404).json({ erreur: 'Route inconnue' }));

// Erreurs
app.use(errorHandler);

module.exports = app;
