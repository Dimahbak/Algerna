/**
 * Workflow engine — moteur centralisé de gestion des signalements.
 * Toutes les transitions de statut passent par ce service.
 */
const { query, withTransaction } = require('../db/pool');

const VALID_TRANSITIONS = {
  recu:             ['transmis', 'en_intervention', 'resolu', 'rejete'],
  transmis:         ['en_intervention', 'resolu', 'rejete'],
  en_intervention:  ['resolu', 'rejete', 'transmis'],
  resolu:           [],
  rejete:           [],
};

/**
 * Transition de statut d'un signalement.
 * @param {string} signalementId
 * @param {string} nouveauEtat
 * @param {object} user - { id, role }
 * @param {object} opts - { commentaire, motifRejet, transmisA }
 */
async function transitionEtat(signalementId, nouveauEtat, user, opts = {}) {
  return withTransaction(async (client) => {
    // 1. Verrouiller et lire le signalement
    const { rows } = await client.query(
      'SELECT id, etat, citoyen_id, reference, domaine FROM signalement WHERE id = $1 FOR UPDATE',
      [signalementId]
    );
    if (!rows.length) throw new Error('Signalement introuvable');
    const sig = rows[0];
    const ancienEtat = sig.etat;

    // 2. Vérifier la transition
    const allowed = VALID_TRANSITIONS[ancienEtat] || [];
    if (!allowed.includes(nouveauEtat)) {
      throw new Error(`Transition ${ancienEtat} → ${nouveauEtat} non autorisée`);
    }

    // 3. Mettre à jour le signalement
    const updates = ['etat = $2'];
    const params = [signalementId, nouveauEtat];
    let pi = 3;

    if (nouveauEtat === 'resolu') {
      updates.push('resolu_le = NOW()');
    }
    if (nouveauEtat === 'rejete' && opts.motifRejet) {
      updates.push(`motif_rejet = $${pi}`);
      params.push(opts.motifRejet);
      pi++;
    }
    if (opts.transmisA) {
      updates.push(`transmis_a = $${pi}`);
      params.push(opts.transmisA);
      pi++;
    }
    if (user.id) {
      updates.push(`assigne_a = $${pi}`);
      params.push(user.id);
      pi++;
    }

    await client.query(
      `UPDATE signalement SET ${updates.join(', ')} WHERE id = $1`,
      params
    );

    // 4. Historique
    await client.query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, ancien_etat, action, commentaire)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [signalementId, nouveauEtat, user.id, ancienEtat,
       `${ancienEtat}_vers_${nouveauEtat}`, opts.commentaire || null]
    );

    // 5. Audit log
    try {
      await client.query(
        `INSERT INTO audit_log (user_id, action, ancien_etat, nouveau_etat, commentaire, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [user.id, `signalement_${nouveauEtat}`, ancienEtat, nouveauEtat, opts.commentaire || null]
      );
    } catch (e) { /* audit non bloquant */ }

    // 6. Notification citoyen
    if (sig.citoyen_id) {
      const messages = {
        transmis:         { titre: 'Signalement pris en charge', message: `Votre signalement #${sig.reference} a été transmis au service compétent.` },
        en_intervention:  { titre: 'Intervention en cours', message: `Une intervention est en cours pour votre signalement #${sig.reference}.` },
        resolu:           { titre: 'Signalement résolu', message: `Votre signalement #${sig.reference} a été résolu. Merci pour votre contribution !` },
        rejete:           { titre: 'Signalement non recevable', message: `Votre signalement #${sig.reference} n'a pas été retenu. Motif : ${opts.motifRejet || 'non précisé'}.` },
      };
      const notif = messages[nouveauEtat];
      if (notif) {
        try {
          await client.query(
            `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
             VALUES ($1, 'signalement', $2, $3, $4)`,
            [sig.citoyen_id, notif.titre, notif.message, '/mes-signalements']
          );
        } catch (e) { /* notification non bloquante */ }
      }
    }

    // 7. Points citoyen si résolu
    if (nouveauEtat === 'resolu' && sig.citoyen_id) {
      try {
        const { awardPoints } = require('../utils/points');
        await awardPoints(sig.citoyen_id, 'resolution', 'signalement', signalementId);
      } catch (e) { /* points non bloquants */ }
    }

    return { id: signalementId, ancienEtat, nouveauEtat, reference: sig.reference };
  });
}

/**
 * Créer une mission CAP liée à un signalement.
 */
async function creerMissionCap(signalementId, user, opts = {}) {
  return withTransaction(async (client) => {
    const { rows: sigRows } = await client.query(
      'SELECT id, lat, lng, commune_id, citoyen_id, reference FROM signalement WHERE id = $1',
      [signalementId]
    );
    if (!sigRows.length) throw new Error('Signalement introuvable');
    const sig = sigRows[0];

    // Créer la mission
    const { rows } = await client.query(
      `INSERT INTO mission_cap (signalement_id, type, priorite, commentaire, secteur, lat, lng, cree_par, etat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'cree') RETURNING *`,
      [signalementId, opts.type || 'constat', opts.priorite || 'normale',
       opts.commentaire || null, opts.secteur || null,
       sig.lat, sig.lng, user.id]
    );

    // Historique — use current signal etat (cap isn't in enum)
    const { rows: curSig } = await client.query('SELECT etat FROM signalement WHERE id=$1', [signalementId]);
    const curEtat = curSig[0]?.etat || 'recu';
    await client.query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, $2, $3, 'mission_cap_cree', $4)`,
      [signalementId, curEtat, user.id, opts.commentaire || 'Mission CAP créée']
    );

    // Notification citoyen
    if (sig.citoyen_id) {
      try {
        await client.query(
          `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
           VALUES ($1, 'signalement', $2, $3, $4)`,
          [sig.citoyen_id, 'Mission terrain créée',
           `Une mission de terrain a été créée pour votre signalement #${sig.reference}.`,
           '/mes-signalements']
        );
      } catch (e) {}
    }

    return rows[0];
  });
}

/**
 * Routage automatique : détermine le service compétent.
 */
async function routerSignalement(signalementId) {
  const { rows } = await query(
    `SELECT s.id, s.commune_id, s.domaine, cs.famille, cs.epic_id,
            c.zone
       FROM signalement s
       JOIN categorie_signal cs ON cs.id = s.categorie_id
       LEFT JOIN commune c ON c.id = s.commune_id
      WHERE s.id = $1`, [signalementId]);
  if (!rows.length) return null;
  const sig = rows[0];

  // Déterminer le service
  let service = null;
  if (sig.epic_id) {
    const { rows: epic } = await query('SELECT sigle, nom FROM epic WHERE id = $1', [sig.epic_id]);
    if (epic.length) service = epic[0].sigle + ' — ' + epic[0].nom;
  }
  if (!service && sig.famille) {
    const familleMap = {
      proprete: sig.zone === 'peripherie' ? 'EXTRANET' : 'NETCOM',
      eau: 'SEAAL',
      eclairage: 'ERMA',
      voirie: 'EGCTU',
      espaces_verts: 'EDEVAL',
      stationnement: 'EPIC Parkings',
    };
    service = familleMap[sig.famille] || 'Tri humain';
  }
  return service || 'Tri humain';
}

module.exports = { transitionEtat, creerMissionCap, routerSignalement };
