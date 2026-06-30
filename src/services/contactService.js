/**
 * Service de données partagé — Contacts utiles.
 */
const { query } = require('../db/pool');

async function lister({ categorie } = {}) {
  let sql = 'SELECT * FROM contact_utile WHERE actif = TRUE';
  const p = [];
  if (categorie) { p.push(categorie); sql += ` AND categorie = $${p.length}`; }
  sql += ' ORDER BY ordre, nom';
  return (await query(sql, p)).rows;
}

module.exports = { lister };
