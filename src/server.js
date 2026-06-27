const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`ALGERNA — API démarrée sur le port ${config.port} (${config.env})`);
});

// Arrêt propre
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
