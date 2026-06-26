/**
 * Migrateur minimal : applique les fichiers db/migrations/*.sql dans l'ordre,
 * en gardant trace dans une table _migrations. Idempotent.
 *
 *   node db/migrate.js up      # applique les migrations en attente
 *   node db/migrate.js status  # liste l'état
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/pool');

const DIR = path.join(__dirname, 'migrations');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      nom TEXT PRIMARY KEY,
      applique_le TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
}

async function applied() {
  const { rows } = await pool.query('SELECT nom FROM _migrations');
  return new Set(rows.map(r => r.nom));
}

async function up() {
  await ensureTable();
  const done = await applied();
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    if (done.has(f)) { console.log(`= déjà appliqué : ${f}`); continue; }
    const sql = fs.readFileSync(path.join(DIR, f), 'utf8');
    console.log(`→ application : ${f}`);
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations(nom) VALUES ($1)', [f]);
      await pool.query('COMMIT');
      console.log(`✓ ${f}`);
    } catch (e) {
      await pool.query('ROLLBACK');
      console.error(`✗ échec ${f} :`, e.message);
      process.exit(1);
    }
  }
  console.log('Migrations terminées.');
}

async function status() {
  await ensureTable();
  const done = await applied();
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.sql')).sort();
  files.forEach(f => console.log(`${done.has(f) ? '✓' : '·'} ${f}`));
}

const cmd = process.argv[2] || 'up';
(cmd === 'status' ? status() : up()).then(() => pool.end());
