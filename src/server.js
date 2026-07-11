const http = require('http');
const app = require('./app');
const config = require('./config');

// OLS proxy gateway: rewrite URL BEFORE Express sees it.
// OLS caches GET responses and ignores query params.
// Gateway uses POST to bypass OLS cache:
//   POST /api/health  body: { _proxy: 'equipements', type: 'parking' }
// Also supports GET ?_proxy= for localhost/dev.
const server = http.createServer((req, res) => {
  if (req.url && req.url.includes('_proxy=')) {
    const u = new URL(req.url, 'http://localhost');
    const proxy = u.searchParams.get('_proxy');
    if (proxy) {
      u.searchParams.delete('_proxy');
      u.searchParams.delete('_t');
      const qs = u.searchParams.toString();
      req.url = '/api/' + proxy + (qs ? '?' + qs : '');
      req.method = 'GET'; // Always treat as GET internally
    }
  }
  app(req, res);
});

server.listen(config.port, () => {
  console.log(`ALGERNA — API démarrée sur le port ${config.port} (${config.env})`);
  // Rappels propreté (notifications in-app, toutes les 15 min)
  require('./services/rappelProprete').start();
});

// Arrêt propre
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
