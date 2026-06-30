/**
 * Service de données partagé — Équipements publics.
 */
const { query } = require('../db/pool');

async function lister({ type, commune_id, commune, q, lat, lng, latitude, longitude, rayon } = {}) {
  let sql = `SELECT e.*, c.nom AS commune_nom FROM equipement_public e
             LEFT JOIN commune c ON c.id = e.commune_id WHERE e.statut != 'hors_service'`;
  const p = [];
  if (type) { p.push(type); sql += ` AND e.type = $${p.length}`; }
  if (commune_id) { p.push(commune_id); sql += ` AND e.commune_id = $${p.length}`; }
  if (commune) { p.push('%' + commune + '%'); sql += ` AND c.nom ILIKE $${p.length}`; }
  if (q) { p.push('%' + q + '%'); sql += ` AND (e.nom ILIKE $${p.length} OR e.type ILIKE $${p.length} OR e.adresse ILIKE $${p.length})`; }
  const pLat = lat || latitude;
  const pLng = lng || longitude;
  if (pLat && pLng) {
    const r = parseFloat(rayon) || 0.02;
    p.push(parseFloat(pLat), parseFloat(pLng), r);
    sql += ` AND ABS(e.lat - $${p.length - 2}) < $${p.length} AND ABS(e.lng - $${p.length - 1}) < $${p.length}`;
  }
  sql += ' ORDER BY e.type, e.nom LIMIT 500';
  return (await query(sql, p)).rows;
}

async function types() {
  return (await query('SELECT DISTINCT type FROM equipement_public ORDER BY type')).rows.map(r => r.type);
}

module.exports = { lister, types };
