const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { errorHandler } = require('./middleware/validation');

const app = express();
app.set('trust proxy', 1);
app.set('etag', false);  // Disable ETag — OLS uses it for caching
app.use(compression());

// No-cache headers for ALL API responses (prevents OLS/CDN proxy caching)
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/health')) {
    res.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');
    res.set('Surrogate-Control', 'no-store');
    res.set('Vary', '*');
  }
  next();
});

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
// index.html : no-cache pour que les mises à jour soient immédiates
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // sw.js : no-cache pour que le service worker se mette à jour
  if (req.path === '/sw.js') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '30d',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('i18n.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CyberPanel/OLS proxy context strips the /api prefix before
// forwarding to Express. Routes are dual-mounted below (/api/* + /*)
// so they work in both local dev and production behind OLS.

// Santé
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'civismart', env: config.env, ts: Date.now() }));
app.get('/health', (req, res) => res.json({ ok: true, service: 'civismart', env: config.env }));

// ── OLS Gateway (PATCH) ──
app.patch('/api/auth/preferences', (req, res, next) => {
  if (req.body && req.body._proxy) {
    const proxy = req.body._proxy;
    const p = { ...req.body }; delete p._proxy;
    const gwQ = require('./db/pool').query;
    const handlers = {
      'equipements': async () => { let s = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`; const a = []; if (p.type) { a.push(p.type); s += ` AND e.type = $${a.length}`; } if (p.q) { a.push('%'+p.q+'%'); s += ` AND (e.nom ILIKE $${a.length} OR e.type ILIKE $${a.length})`; } s += ' ORDER BY e.type, e.nom LIMIT 500'; return (await gwQ(s, a)).rows; },
      'equip_types': async () => (await gwQ('SELECT DISTINCT type FROM equipement_public ORDER BY type')).rows.map(r => r.type),
      'contacts': async () => { let s = 'SELECT * FROM contact_utile WHERE actif = TRUE'; const a = []; if (p.categorie) { a.push(p.categorie); s += ` AND categorie = $${a.length}`; } return (await gwQ(s + ' ORDER BY ordre, nom', a)).rows; },
      'communiques': async () => (await gwQ(`SELECT c.*, cm.nom AS commune_nom FROM communique c LEFT JOIN commune cm ON cm.id = c.commune_id WHERE c.actif = TRUE AND (c.date_fin IS NULL OR c.date_fin > NOW()) AND c.date_debut <= NOW() ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC LIMIT 20`)).rows,
    };
    const fn = handlers[proxy];
    if (!fn) return res.status(400).json({ erreur: 'Unknown: ' + proxy });
    return fn().then(d => res.json(d)).catch(e => res.status(500).json({ erreur: e.message }));
  }
  next();
});

// ── OLS Proxy Gateway (POST) ──
// Modules added after OLS startup get 404. This gateway provides access.
// POST /api/gw { _proxy: 'equipements', type: 'parking' }
const gwQuery = require('./db/pool').query;
app.post('/api/gw', express.json(), async (req, res) => {
  try {
    const proxy = req.body?._proxy;
    if (!proxy) return res.status(400).json({ erreur: '_proxy requis' });
    const p = { ...req.body }; delete p._proxy;
    const h = {
      'equipements': async () => {
        let sql = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`;
        const a = [];
        if (p.type) { a.push(p.type); sql += ` AND e.type = $${a.length}`; }
        if (p.q) { a.push('%'+p.q+'%'); sql += ` AND (e.nom ILIKE $${a.length} OR e.type ILIKE $${a.length})`; }
        sql += ' ORDER BY e.type, e.nom LIMIT 500';
        return (await gwQuery(sql, a)).rows;
      },
      'equipements/types': async () => (await gwQuery('SELECT DISTINCT type FROM equipement_public ORDER BY type')).rows.map(r=>r.type),
      'infos/contacts': async () => {
        let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE'; const a = [];
        if (p.categorie) { a.push(p.categorie); sql += ` AND categorie = $${a.length}`; }
        return (await gwQuery(sql + ' ORDER BY ordre, nom', a)).rows;
      },
      'infos/communiques': async () => (await gwQuery(`SELECT c.*, cm.nom AS commune_nom FROM communique c LEFT JOIN commune cm ON cm.id = c.commune_id WHERE c.actif = TRUE AND (c.date_fin IS NULL OR c.date_fin > NOW()) AND c.date_debut <= NOW() ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC LIMIT 20`)).rows,
    };
    const fn = h[proxy];
    if (!fn) return res.status(400).json({ erreur: 'Module inconnu' });
    res.json(await fn());
  } catch(e) { res.status(500).json({ erreur: e.message }); }
});
app.post('/gw', app._router.stack[app._router.stack.length - 1].handle); // mirror without /api

// POST gateway — OLS caches GET but not POST
// Frontend sends POST /api/health with body { _proxy: 'equipements', type: 'parking' }
app.post('/api/health', express.json(), (req, res, next) => {
  const proxy = req.body && req.body._proxy;
  if (!proxy) return res.json({ ok: true });
  const params = { ...req.body };
  delete params._proxy;
  const qs = new URLSearchParams(params).toString();
  req.url = '/api/' + proxy + (qs ? '?' + qs : '');
  req.originalUrl = req.url;
  req.method = 'GET';
  req.query = params;
  app(req, res);
});

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
  participation: require('./modules/participation'),
  equipements: require('./modules/equipements'),
  legal:       require('./modules/legal'),
  notifications: require('./modules/notifications'),
  saksini:       require('./modules/saksini'),
  supervision:   require('./modules/supervision'),
  rapports:      require('./modules/rapports'),
  admin:         require('./modules/admin'),
  icua:          require('./modules/icua'),
  intelligence:  require('./modules/intelligence'),
  ccoe:          require('./modules/ccoe'),
};
for (const [name, handler] of Object.entries(moduleMap)) {
  app.use(`/api/${name}`, handler);  // Normal path (localhost)
  app.use(`/${name}`, handler);      // Stripped path (OLS proxy)
}

// Config publique (client IDs, feature flags)
app.get('/api/config/public', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});
app.get('/config/public', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});

// SPA fallback — toutes les autres routes non-API renvoient index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 API
app.use((req, res) => res.status(404).json({ erreur: 'Route inconnue' }));

// Erreurs
app.use(errorHandler);

module.exports = app;
