/**
 * Communication Engine — Workflow des communiqués institutionnels.
 * Toutes les transitions passent par ce service.
 */
const { query, withTransaction } = require('../db/pool');

const STATUT_TRANSITIONS = {
  brouillon:      ['en_revision', 'soumis_wilaya'],
  en_revision:    ['valide', 'brouillon'],   // brouillon = correction demandée
  soumis_wilaya:  ['publie', 'rejete'],      // Wilaya valide ou rejette
  valide:         ['publie', 'programme'],
  programme:      ['publie'],
  publie:         ['archive'],
  rejete:         ['brouillon'],             // Auteur peut resoumettre
  archive:        [],
};

async function transitionStatut(communiqueId, nouveauStatut, user, opts = {}) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      'SELECT id, statut, titre, commune_id FROM communique WHERE id = $1 FOR UPDATE',
      [communiqueId]);
    if (!rows.length) throw new Error('Communiqué introuvable');
    const comm = rows[0];
    const ancienStatut = comm.statut;

    const allowed = STATUT_TRANSITIONS[ancienStatut] || [];
    if (!allowed.includes(nouveauStatut)) {
      throw new Error(`Transition ${ancienStatut} → ${nouveauStatut} non autorisée`);
    }

    // Build update
    const updates = ['statut = $2', 'maj_le = NOW()'];
    const params = [communiqueId, nouveauStatut];
    let pi = 3;

    if (nouveauStatut === 'valide') {
      updates.push(`validateur_id = $${pi}`, `valide_le = NOW()`);
      params.push(user.id); pi++;
    }
    if (nouveauStatut === 'publie') {
      updates.push('actif = TRUE', 'date_publication = NOW()');
      if (!comm.date_debut) updates.push('date_debut = NOW()');
      // Si publication depuis soumis_wilaya, enregistrer le validateur
      if (ancienStatut === 'soumis_wilaya') {
        updates.push(`validateur_id = $${pi}`, `valide_le = NOW()`);
        params.push(user.id); pi++;
      }
    }
    if (nouveauStatut === 'archive') {
      updates.push('actif = FALSE', 'archive_le = NOW()');
    }
    if (nouveauStatut === 'rejete') {
      if (!opts.commentaire) throw new Error('Le motif de rejet est obligatoire.');
      updates.push(`commentaire_revision = $${pi}`);
      params.push(opts.commentaire); pi++;
    }
    if (nouveauStatut === 'brouillon' && opts.commentaire) {
      updates.push(`commentaire_revision = $${pi}`);
      params.push(opts.commentaire); pi++;
    }

    await client.query(`UPDATE communique SET ${updates.join(', ')} WHERE id = $1`, params);

    // Historique workflow
    await client.query(
      `INSERT INTO communique_workflow (communique_id, ancien_statut, nouveau_statut, action, par_utilisateur, commentaire)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [communiqueId, ancienStatut, nouveauStatut,
       `${ancienStatut}_vers_${nouveauStatut}`, user.id, opts.commentaire || null]);

    // Audit
    try {
      await client.query(
        `INSERT INTO audit_log (user_id, action, ancien_etat, nouveau_etat, commentaire, module, created_at)
         VALUES ($1, $2, $3, $4, $5, 'communique', NOW())`,
        [user.id, `communique_${nouveauStatut}`, ancienStatut, nouveauStatut, opts.commentaire || null]);
    } catch (e) { console.error('[communication] échec journal communiqué:', e.message); }

    // Notifications citoyennes à la publication
    if (nouveauStatut === 'publie') {
      try {
        let notifSql = `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
          SELECT id, 'communique', $1, $2, '/communiques'
          FROM utilisateur WHERE actif = TRUE AND role = 'citoyen'`;
        const notifParams = [comm.titre, opts.message || comm.titre];
        if (comm.commune_id) {
          notifSql += ` AND commune_id = $3`;
          notifParams.push(comm.commune_id);
        }
        notifSql += ' LIMIT 5000';
        await client.query(notifSql, notifParams);
      } catch (e) { console.error('[communication] échec notification citoyens:', e.message); }
    }

    return { id: communiqueId, ancienStatut, nouveauStatut };
  });
}

async function getCategories() {
  const { rows } = await query('SELECT * FROM communique_categorie WHERE actif = TRUE ORDER BY ordre');
  return rows;
}

async function getWorkflowHistorique(communiqueId) {
  const { rows } = await query(
    `SELECT cw.*, u.prenom, u.nom, u.role
       FROM communique_workflow cw
       LEFT JOIN utilisateur u ON u.id = cw.par_utilisateur
      WHERE cw.communique_id = $1
      ORDER BY cw.le ASC`, [communiqueId]);
  return rows;
}

async function getKpisCommunication() {
  const [brouillons, revision, soumis, publies, programmes, rejetes] = await Promise.all([
    query("SELECT COUNT(*)::int AS n FROM communique WHERE statut = 'brouillon'"),
    query("SELECT COUNT(*)::int AS n FROM communique WHERE statut = 'en_revision'"),
    query("SELECT COUNT(*)::int AS n FROM communique WHERE statut = 'soumis_wilaya'"),
    query("SELECT COUNT(*)::int AS n FROM communique WHERE statut = 'publie' AND date_publication >= CURRENT_DATE"),
    query("SELECT COUNT(*)::int AS n FROM communique WHERE statut = 'programme'"),
    query("SELECT COUNT(*)::int AS n FROM communique WHERE statut = 'rejete'"),
  ]);
  return {
    brouillons: brouillons.rows[0].n,
    en_revision: revision.rows[0].n,
    soumis_wilaya: soumis.rows[0].n,
    publies_aujourdhui: publies.rows[0].n,
    programmes: programmes.rows[0].n,
    rejetes: rejetes.rows[0].n,
  };
}

module.exports = { transitionStatut, getCategories, getWorkflowHistorique, getKpisCommunication };
