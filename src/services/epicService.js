/**
 * Service EPIC — Fonction atomique de création d'un EPIC
 * dans les deux tables (epic + organisations) avec correspondance.
 */
const { withTransaction } = require('../db/pool');

/**
 * Crée un EPIC de façon atomique dans les deux tables.
 *
 * @param {Object} params
 * @param {string} params.sigle       — Sigle unique (ex. DIR-ABA)
 * @param {string} params.nom         — Nom complet FR
 * @param {string} [params.nom_ar]    — Nom complet AR (optionnel)
 * @param {string} [params.categorie] — epic_categorie enum (optionnel, null si EPIC sans signalement)
 * @param {string} [params.type]      — epic_type enum : 'local' (défaut) ou 'national'
 * @param {string} [params.description] — Description libre
 * @param {number} [params.parent_id] — organisations.parent_id (défaut : 1 = Wilaya d'Alger)
 *
 * @returns {Object} { epic, organisation, map }
 */
async function creerEpic({ sigle, nom, nom_ar, categorie, type, description, parent_id, actif }) {
  if (!sigle || !nom) throw new Error('sigle et nom sont requis');

  return withTransaction(async (client) => {
    // 1. Créer l'entrée dans la table epic (métier)
    const isActif = actif !== undefined ? actif : true;
    const epicRes = await client.query(
      `INSERT INTO epic (sigle, nom, categorie, type, description, actif)
       VALUES ($1, $2, $3, COALESCE($4, 'local')::epic_type, $5, $6)
       RETURNING *`,
      [sigle, nom, categorie || null, type || null, description || null, isActif]
    );
    const epic = epicRes.rows[0];

    // 2. Créer l'entrée dans la table organisations (hiérarchie, même statut actif)
    const orgRes = await client.query(
      `INSERT INTO organisations (nom, nom_ar, type, parent_id, actif)
       VALUES ($1, $2, 'epic', COALESCE($3, 1), $4)
       RETURNING *`,
      [nom, nom_ar || null, parent_id || null, isActif]
    );
    const organisation = orgRes.rows[0];

    // 3. Enregistrer la correspondance
    await client.query(
      `INSERT INTO epic_organisation_map (epic_id, organisation_id)
       VALUES ($1, $2)`,
      [epic.id, organisation.id]
    );

    return {
      epic,
      organisation,
      map: { epic_id: epic.id, organisation_id: organisation.id }
    };
  });
}

module.exports = { creerEpic };
