/**
 * Configuration Engine — Paramètres système centralisés.
 * Les moteurs (Workflow, SLA, Communication, Supervision) lisent ici.
 */
const { query } = require('../db/pool');

// Cache en mémoire (rechargé toutes les 5 min)
let _cache = {};
let _cacheTime = 0;
const CACHE_TTL = 300000; // 5 min

async function loadAll() {
  if (Date.now() - _cacheTime < CACHE_TTL && Object.keys(_cache).length) return _cache;
  const { rows } = await query('SELECT cle, valeur FROM config_systeme');
  _cache = {};
  rows.forEach(r => { _cache[r.cle] = r.valeur; });
  _cacheTime = Date.now();
  return _cache;
}

async function get(cle, defaut) {
  const all = await loadAll();
  return all[cle] !== undefined ? all[cle] : defaut;
}

async function getInt(cle, defaut) {
  const v = await get(cle);
  return v !== undefined ? parseInt(v, 10) : defaut;
}

async function getBool(cle, defaut) {
  const v = await get(cle);
  if (v === undefined) return defaut;
  return v === 'true' || v === '1';
}

async function set(cle, valeur, userId) {
  await query(
    `INSERT INTO config_systeme (cle, valeur, modifie_par, modifie_le)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (cle) DO UPDATE SET valeur = $2, modifie_par = $3, modifie_le = NOW()`,
    [cle, String(valeur), userId || null]
  );
  _cache[cle] = String(valeur);
  _cacheTime = Date.now();
}

async function getAll() {
  const { rows } = await query('SELECT * FROM config_systeme ORDER BY module, cle');
  return rows;
}

// Engagement de service par catégorie/famille
async function getEngagement(categorieId, famille) {
  let sql = 'SELECT * FROM engagement_service WHERE actif = TRUE';
  const p = [];
  if (categorieId) { p.push(categorieId); sql += ` AND categorie_id = $${p.length}`; }
  else if (famille) { p.push(famille); sql += ` AND famille = $${p.length}`; }
  sql += ' LIMIT 1';
  const { rows } = await query(sql, p);
  if (rows.length) return rows[0];
  // Défaut système
  const delai = await getInt('sla.delai_defaut_h', 48);
  return { delai_cible_h: delai, seuil_vigilance_pct: 75, seuil_depassement_pct: 100 };
}

function invalidateCache() { _cacheTime = 0; }

module.exports = { get, getInt, getBool, set, getAll, getEngagement, loadAll, invalidateCache };
