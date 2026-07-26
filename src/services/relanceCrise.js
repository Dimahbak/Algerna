/**
 * Service de relance automatique — accusés d'engagement crise
 * Vérifie toutes les 2 minutes les organismes mobilisés qui n'ont pas répondu.
 * 1re échéance dépassée → relance (notification)
 * 2e échéance dépassée → alerte rouge chez CC
 * Délais lus en base (crise_param), jamais en dur.
 */
const { query } = require('../db/pool');

async function getDelai(niveau) {
  const cle = 'delai_engagement_' + niveau;
  const { rows } = await query('SELECT valeur FROM crise_param WHERE cle = $1', [cle]);
  return rows[0] ? Number(rows[0].valeur) : null;
}

async function checkRelances() {
  try {
    // Trouver les sessions actives
    const { rows: sessions } = await query("SELECT id, niveau, titre FROM crise_session WHERE statut = 'active'");
    if (!sessions.length) return;

    for (const session of sessions) {
      const delaiMin = await getDelai(session.niveau);
      if (!delaiMin) continue;

      // Organismes encore en 'sollicite' (pas engagé)
      const { rows: enAttente } = await query(`
        SELECT co.organisation_id, co.nb_relances, co.derniere_relance_le, co.ajoute_le,
               o.nom AS org_nom
        FROM crise_organisme co
        JOIN organisations o ON o.id = co.organisation_id
        WHERE co.crise_id = $1 AND co.etat_mobilisation = 'sollicite'
      `, [session.id]);

      const now = Date.now();

      for (const org of enAttente) {
        const solliciteLe = new Date(org.ajoute_le).getTime();
        const echeanceMs = delaiMin * 60 * 1000;
        const elapsed = now - solliciteLe;

        if (org.nb_relances === 0 && elapsed >= echeanceMs) {
          // 1re relance
          console.log(`[RelanceCrise] 1re relance: ${org.org_nom} (crise ${session.id})`);
          // Envoyer notification de relance
          const { rows: users } = await query(
            'SELECT id FROM utilisateur WHERE organisation_id = $1 AND actif = TRUE',
            [org.organisation_id]
          );
          for (const u of users) {
            await query(
              `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
               VALUES ($1, 'crise', $2, $3, '/command-center')`,
              [u.id, 'RELANCE — Accusé d\'engagement attendu',
               'Crise : ' + session.titre + ' — Merci de confirmer votre engagement']
            ).catch(() => {});
          }
          await query(
            `UPDATE crise_organisme SET nb_relances = 1, derniere_relance_le = NOW()
             WHERE crise_id = $1 AND organisation_id = $2`,
            [session.id, org.organisation_id]
          );
        } else if (org.nb_relances === 1 && elapsed >= echeanceMs * 2) {
          // 2e échéance → alerte rouge
          console.log(`[RelanceCrise] ALERTE ROUGE: ${org.org_nom} (crise ${session.id})`);
          await query(
            `UPDATE crise_organisme SET nb_relances = 2, derniere_relance_le = NOW(), alerte_rouge = TRUE
             WHERE crise_id = $1 AND organisation_id = $2`,
            [session.id, org.organisation_id]
          );
          // Notifier les CC
          const { rows: ccUsers } = await query(
            "SELECT id FROM utilisateur WHERE role = 'admin_wilaya' AND actif = TRUE"
          );
          for (const u of ccUsers) {
            await query(
              `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
               VALUES ($1, 'crise', $2, $3, '/command-center')`,
              [u.id, 'ALERTE ROUGE — Non-réponse ' + org.org_nom,
               'Crise : ' + session.titre + ' — 2e échéance dépassée, aucun engagement']
            ).catch(() => {});
          }
        }
      }
    }
  } catch (e) {
    console.error('[RelanceCrise] Erreur:', e.message);
  }
}

module.exports = {
  start() {
    // Vérifier toutes les 2 minutes
    setInterval(checkRelances, 2 * 60 * 1000);
    // Premier check après 30 secondes
    setTimeout(checkRelances, 30 * 1000);
  }
};
