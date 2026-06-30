/**
 * Service de données partagé — Communiqués.
 */
const { query } = require('../db/pool');

async function listerActifs() {
  return (await query(
    `SELECT c.*, cm.nom AS commune_nom FROM communique c
     LEFT JOIN commune cm ON cm.id = c.commune_id
     WHERE c.actif = TRUE AND c.statut = 'publie'
       AND (c.date_fin IS NULL OR c.date_fin > NOW()) AND c.date_debut <= NOW()
     ORDER BY CASE c.niveau WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END, c.cree_le DESC
     LIMIT 20`
  )).rows;
}

module.exports = { listerActifs };
