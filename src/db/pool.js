const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(
  config.db.connectionString
    ? { connectionString: config.db.connectionString }
    : {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
      }
);

pool.on('error', (err) => {
  console.error('Erreur inattendue sur le pool PostgreSQL', err);
});

/**
 * Exécute une requête paramétrée.
 * Utilise TOUJOURS des paramètres ($1, $2…) — jamais de concaténation SQL.
 */
async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Exécute une fonction dans une transaction.
 * Rollback automatique si une exception est levée.
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
