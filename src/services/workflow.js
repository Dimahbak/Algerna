/**
 * Workflow engine — moteur centralisé de gestion des signalements.
 * Toutes les transitions de statut passent par ce service.
 */
const { query, withTransaction } = require('../db/pool');

const VALID_TRANSITIONS = {
  recu:              ['transmis', 'en_intervention', 'pris_en_charge', 'resolu', 'rejete'],
  transmis:          ['pris_en_charge', 'en_intervention', 'resolu', 'rejete', 'recu'],
  pris_en_charge:    ['en_intervention', 'resolu', 'rejete', 'transmis'],
  en_intervention:   ['a_valider', 'resolu', 'rejete', 'transmis'],
  a_valider:         ['resolu', 'rejete', 'en_intervention'],
  resolu:            [],
  rejete:            [],
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
      `SELECT s.id, s.etat, s.citoyen_id, s.reference, s.domaine,
              cs.libelle AS categorie, c.nom AS commune_nom
         FROM signalement s
         LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
         LEFT JOIN commune c ON c.id = s.commune_id
        WHERE s.id = $1 FOR UPDATE OF s`,
      [signalementId]
    );
    if (!rows.length) throw new Error('Signalement introuvable');
    const sig = rows[0];
    const ancienEtat = sig.etat;

    // 2. Vérifier la transition (transmis→transmis autorisé si transmisA fourni = affectation service)
    const allowed = VALID_TRANSITIONS[ancienEtat] || [];
    const sameStateAssignment = ancienEtat === nouveauEtat && ancienEtat === 'transmis' && opts.transmisA;
    if (!sameStateAssignment && !allowed.includes(nouveauEtat)) {
      throw new Error(`Transition ${ancienEtat} → ${nouveauEtat} non autorisée`);
    }
    // Rejet/classement sans suite : réservé aux superviseurs
    if (nouveauEtat === 'rejete' && user.fonction === 'entite_responsable') {
      throw new Error('Le classement sans suite est réservé aux superviseurs.');
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
    if (opts.delaiPrevu) {
      updates.push(`delai_prevu = $${pi}`);
      params.push(opts.delaiPrevu);
      pi++;
    }
    // Assignation : si transmission à une org, assigner au premier membre actif de cette org
    if (opts.transmisA && nouveauEtat === 'transmis') {
      const { rows: orgMembers } = await client.query(
        'SELECT id FROM utilisateur WHERE organisation_id = $1 AND actif = TRUE LIMIT 1',
        [Number(opts.transmisA)]
      );
      if (orgMembers.length) {
        updates.push(`assigne_a = $${pi}`);
        params.push(orgMembers[0].id);
        pi++;
      }
    } else if (user.id) {
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
      const ctx = [sig.reference, sig.categorie, sig.commune_nom].filter(Boolean).join(' · ');
      const messages = {
        transmis:         { titre: 'Pris en charge — ' + ctx, message: `Votre signalement #${sig.reference} a été transmis au service compétent.` },
        en_intervention:  { titre: 'Intervention en cours — ' + ctx, message: `Intervention en cours · ${sig.categorie || ''} · ${sig.commune_nom || ''}` },
        a_valider:        { titre: 'Intervention terminée — ' + ctx, message: `L'intervention pour #${sig.reference} est terminée, en attente de validation.` },
        resolu:           { titre: 'Résolu — ' + ctx, message: `Votre signalement #${sig.reference} a été résolu. Merci !` },
        rejete:           { titre: 'Non recevable — ' + ctx, message: `#${sig.reference} non retenu. Motif : ${opts.motifRejet || 'non précisé'}.` },
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

    // 7. Notification EPIC — quand un dossier est transmis à une organisation
    if (nouveauEtat === 'transmis' && opts.transmisA) {
      try {
        const orgId = Number(opts.transmisA);
        const { rows: epicUsers } = await client.query(
          `SELECT id FROM utilisateur
           WHERE organisation_id = $1 AND actif = TRUE AND fonction = 'entite_responsable'`,
          [orgId]);
        if (epicUsers.length) {
          const ref = sig.reference || '';
          const cat = sig.categorie || '';
          const com = sig.commune_nom || '';
          const ctx = [ref, cat, com].filter(Boolean).join(' · ');
          const titre = 'Nouveau dossier transmis — ' + ctx;
          const message = `Le dossier #${ref} (${cat}) a été transmis à votre service. Commune : ${com || 'non précisée'}.`;
          for (const u of epicUsers) {
            await client.query(
              `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
               VALUES ($1, 'signalement', $2, $3, '/bo-agent')`,
              [u.id, titre, message]);
          }
        }
      } catch (e) { /* notification EPIC non bloquante */ }
    }

    // 8. Points citoyen si résolu
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

    // Vérifier que le créateur a la capacité reception ou qualification
    const userCaps = Array.isArray(user.capacites) ? user.capacites : [];
    if (!userCaps.includes('reception') && !userCaps.includes('qualification') && !userCaps.includes('pilotage')) {
      throw new Error('Capacité insuffisante pour créer une intervention CAP.');
    }

    // Si affecte_a est fourni, vérifier que la cible est fonction=cap
    let affecteA = opts.affecte_a || null;
    if (affecteA) {
      const { rows: capCheck } = await client.query(
        'SELECT id, fonction FROM utilisateur WHERE id = $1 AND actif = true', [affecteA]
      );
      if (!capCheck.length) throw new Error('Utilisateur cible introuvable.');
      if (capCheck[0].fonction !== 'cap') throw new Error('L\'affectation doit cibler un Agent de Proximité (fonction=cap).');
    }

    // Créer la mission (statut initial : cree = nouveau)
    const { rows } = await client.query(
      `INSERT INTO mission_cap (signalement_id, type, priorite, commentaire, secteur, lat, lng, cree_par, affecte_a, etat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'cree') RETURNING *`,
      [signalementId, opts.type || 'constat', opts.priorite || 'normale',
       opts.commentaire || null, opts.secteur || null,
       sig.lat, sig.lng, user.id, affecteA]
    );

    // Historique signalement
    const { rows: curSig } = await client.query('SELECT etat FROM signalement WHERE id=$1', [signalementId]);
    const curEtat = curSig[0]?.etat || 'recu';
    await client.query(
      `INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
       VALUES ($1, $2, $3, 'mission_cap_cree', $4)`,
      [signalementId, curEtat, user.id, opts.commentaire || 'Intervention CAP créée']
    );

    // Historique mission CAP
    await client.query(
      `INSERT INTO mission_cap_historique (mission_id, etat, par_utilisateur, commentaire)
       VALUES ($1, 'cree', $2, $3)`,
      [rows[0].id, user.id, 'Intervention créée' + (affecteA ? ' et affectée' : '')]
    );

    // Notification citoyen
    if (sig.citoyen_id) {
      try {
        await client.query(
          `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
           VALUES ($1, 'signalement', $2, $3, $4)`,
          [sig.citoyen_id, 'Intervention terrain — ' + [sig.reference, sig.categorie, sig.commune_nom].filter(Boolean).join(' · '),
           `Intervention créée · #${sig.reference} · ${sig.categorie || ''} · ${sig.commune_nom || ''}`,
           '/mes-signalements']
        );
      } catch (e) {}
    }

    // Notification CAP assigné
    if (affecteA) {
      try {
        await client.query(
          `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
           VALUES ($1, 'cap', $2, $3, $4)`,
          [affecteA, 'Mission terrain — ' + [sig.reference, sig.categorie, sig.commune_nom].filter(Boolean).join(' · '),
           (opts.type || 'constat') + ' · ' + (sig.reference || '') + ' · ' + (sig.commune_nom || ''),
           '/bo-cap#' + signalementId]
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
      proprete: sig.zone === 'peripherie' ? 'Direction Propreté (Périphérie)' : 'Direction Propreté (Centre)',
      eau: 'Direction Eau et Assainissement',
      eclairage: 'Direction Éclairage Public',
      voirie: 'Direction Voirie et Trottoirs',
      espaces_verts: 'Direction Espaces Verts',
      stationnement: 'Direction Stationnement',
    };
    service = familleMap[sig.famille] || 'Tri humain';
  }
  return service || 'Tri humain';
}

module.exports = { transitionEtat, creerMissionCap, routerSignalement };
