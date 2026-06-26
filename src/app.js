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

// Santé
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'civismart', env: config.env }));

// Modules
app.use('/api/auth',        require('./modules/auth'));
app.use('/api/referentiel', require('./modules/referentiel'));
app.use('/api/rdv',         require('./modules/rdv'));
app.use('/api/proprete',    require('./modules/proprete'));
app.use('/api/eau',         require('./modules/eau'));
app.use('/api/points',      require('./modules/points'));
app.use('/api/dashboard',   require('./modules/dashboard'));
app.use('/api/patrimoine', require('./modules/patrimoine'));
app.use('/api/signaler',   require('./modules/signaler'));

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
