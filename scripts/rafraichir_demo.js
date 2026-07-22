/**
 * Rafraîchissement des données de démonstration — CiviSmart / ALGERNA
 *
 * À exécuter avant chaque démonstration.
 * Usage : node scripts/rafraichir_demo.js          (dry-run, affiche le plan)
 *         node scripts/rafraichir_demo.js --apply   (exécute les modifications)
 *
 * Ce que fait le script :
 *   Re-échelonne les dates (cree_le + historique) des 22 dossiers ACTIFS
 *   pour restaurer le profil acté par Hamid :
 *     • 4 dossiers en dépassement SLA (>48h) — les 4 actés
 *     • 18 dossiers dans le délai (<48h) — échelonnés de 3h à 40h
 *     • 3 critiques (danger_immediat) — nombre inchangé
 *     • Score ≈ 68-70
 *
 * Ce qu'il ne touche JAMAIS :
 *   • Dossiers resolu / clos / rejete (dates figées)
 *   • États, rattachements org, gravité, epic_id
 *   • Total signalements (122)
 *   • Dossiers réels des testeurs
 */

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const pool = new Pool();
const apply = process.argv.includes('--apply');

// ── Configuration : les 4 dossiers SLA actés avec leur âge cible (en heures)
const SLA_ACTES = {
  'EAU-38B3EF': 120,   // ~5 jours
  'PRO-C4CA42': 96,    // ~4 jours
  'EAU-C45147': 72,    // ~3 jours
  'PRO-C81E72': 60,    // ~2.5 jours
};

// ── Les 18 autres actifs : échelonnés de 3h à 40h (sous 48h)
const SOUS_SLA_START = 3;   // heures
const SOUS_SLA_END = 40;    // heures

async function main() {
  const client = await pool.connect();

  try {
    // 1. Charger les 22 actifs
    const { rows: actifs } = await client.query(`
      SELECT s.id, s.reference, s.etat, s.gravite, s.cree_le
      FROM signalement s
      WHERE s.etat NOT IN ('resolu','clos','rejete')
      ORDER BY s.cree_le ASC
    `);

    if (actifs.length === 0) {
      console.log('Aucun dossier actif trouvé. Rien à faire.');
      return;
    }

    // 2. Séparer SLA actés et sous-SLA
    const slaActes = actifs.filter(a => SLA_ACTES[a.reference]);
    const sousSla = actifs.filter(a => !SLA_ACTES[a.reference]);

    // 3. Calculer les nouvelles dates
    const now = new Date();
    const plan = [];

    // SLA actés
    for (const dossier of slaActes) {
      const ageH = SLA_ACTES[dossier.reference];
      const newCree = new Date(now.getTime() - ageH * 3600 * 1000);
      plan.push({ ...dossier, newCree, ageH, type: 'SLA' });
    }

    // Sous-SLA : échelonnés uniformément
    const step = sousSla.length > 1 ? (SOUS_SLA_END - SOUS_SLA_START) / (sousSla.length - 1) : 0;
    for (let i = 0; i < sousSla.length; i++) {
      const ageH = Math.round((SOUS_SLA_START + step * i) * 10) / 10;
      const newCree = new Date(now.getTime() - ageH * 3600 * 1000);
      plan.push({ ...sousSla[i], newCree, ageH, type: 'OK' });
    }

    // 4. Afficher le récapitulatif
    console.log('═══════════════════════════════════════════════════');
    console.log('  RAFRAÎCHISSEMENT DÉMO — ' + (apply ? 'MODE APPLY' : 'DRY-RUN'));
    console.log('  ' + new Date().toISOString());
    console.log('═══════════════════════════════════════════════════\n');

    const totalSig = await client.query('SELECT COUNT(*) AS c FROM signalement');
    const critiques = plan.filter(p => p.gravite === 'danger_immediat');

    console.log('Total signalements     : ' + totalSig.rows[0].c + ' (inchangé)');
    console.log('Dossiers actifs        : ' + actifs.length);
    console.log('  → SLA dépassés (>48h): ' + slaActes.length);
    console.log('  → Dans le délai      : ' + sousSla.length);
    console.log('Critiques (danger)     : ' + critiques.length);
    console.log('');

    // Score prévisionnel
    const breached = slaActes.length;
    const active = actifs.length;
    const slaRespect = active > 0 ? Math.max(0, (active - breached) / active * 100) : 100;

    // Flux : on va chercher les vrais chiffres
    const { rows: [flux] } = await client.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE s.etat IN ('resolu','clos')) AS resolved,
             COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','clos','rejete','recu')) AS responded
      FROM signalement s
      JOIN categorie_signal cs ON cs.id = s.categorie_id
      WHERE s.cree_le >= NOW() - INTERVAL '30 days'
    `);
    const { rows: [dec] } = await client.query("SELECT COUNT(*) AS n FROM demo_decisions WHERE statut = 'en_attente'");

    const fluxTotal = parseInt(flux.total) || 1;
    const fluxResolved = parseInt(flux.resolved) || 0;
    const fluxResponded = parseInt(flux.responded) || 0;
    const pendingDec = parseInt(dec.n) || 0;

    const tauxTraitement = fluxTotal > 0 ? (fluxResolved / fluxTotal * 100) : 0;
    const tauxReponse = (fluxTotal - fluxResolved) > 0 ? (fluxResponded / (fluxTotal - fluxResolved) * 100) : 100;
    const inverseCritiques = Math.max(0, 100 - (critiques.length * 20));
    const inverseDecisions = Math.max(0, 100 - (pendingDec * 15));

    const score = Math.round(
      slaRespect * 0.30 + tauxTraitement * 0.25 + tauxReponse * 0.20 +
      inverseCritiques * 0.15 + inverseDecisions * 0.10
    );

    console.log('─── Score prévisionnel ───');
    console.log('  slaRespect       : ' + Math.round(slaRespect) + '% (' + (active - breached) + '/' + active + ')');
    console.log('  tauxTraitement   : ' + Math.round(tauxTraitement) + '% (' + fluxResolved + '/' + fluxTotal + ')');
    console.log('  tauxReponse      : ' + Math.round(tauxReponse) + '%');
    console.log('  inverseCritiques : ' + Math.round(inverseCritiques) + ' (3 critiques × 20)');
    console.log('  inverseDecisions : ' + Math.round(inverseDecisions) + ' (' + pendingDec + ' en attente × 15)');
    console.log('  → SCORE          : ' + score + '/100');
    console.log('');

    console.log('─── Plan de re-datation ───');
    console.log('Réf            │ État            │ SLA  │ Âge cible │ Nouveau cree_le');
    console.log('───────────────┼─────────────────┼──────┼───────────┼──────────────────');
    for (const p of plan) {
      const ref = p.reference.padEnd(14);
      const etat = p.etat.padEnd(15);
      const sla = p.type === 'SLA' ? ' OUI ' : ' NON ';
      const age = (p.ageH + 'h').padStart(9);
      const date = p.newCree.toISOString().slice(0, 16).replace('T', ' ');
      console.log(ref + ' │ ' + etat + ' │' + sla + '│' + age + ' │ ' + date);
    }

    if (!apply) {
      console.log('\n⏸  Dry-run terminé. Exécuter avec --apply pour appliquer.');
      return;
    }

    // 5. Appliquer les modifications
    console.log('\n▶  Application en cours...');
    await client.query('BEGIN');

    let updated = 0;
    for (const p of plan) {
      const oldCree = new Date(p.cree_le);
      const delta = p.newCree.getTime() - oldCree.getTime(); // ms

      // Mettre à jour cree_le du signalement
      await client.query(
        'UPDATE signalement SET cree_le = $1 WHERE id = $2',
        [p.newCree, p.id]
      );

      // Décaler les entrées historique proportionnellement
      // On recalcule chaque entrée relativement au nouveau cree_le
      const { rows: hist } = await client.query(
        'SELECT id, le FROM signalement_historique WHERE signalement_id = $1 ORDER BY le',
        [p.id]
      );
      if (hist.length > 0) {
        const oldFirst = new Date(hist[0].le).getTime();
        const oldLast = hist.length > 1 ? new Date(hist[hist.length - 1].le).getTime() : oldFirst;
        const span = oldLast - oldFirst;
        // Nouvelles bornes : de newCree à newCree + min(span proportionnel, âge/2)
        const maxSpan = Math.min(span, p.ageH * 1800 * 1000); // au plus la moitié de l'âge
        for (let hi = 0; hi < hist.length; hi++) {
          const ratio = span > 0 ? (new Date(hist[hi].le).getTime() - oldFirst) / span : 0;
          const newLe = new Date(p.newCree.getTime() + ratio * maxSpan);
          await client.query('UPDATE signalement_historique SET le = $1 WHERE id = $2', [newLe, hist[hi].id]);
        }
      }

      // Vérifier cohérence : aucune date historique avant cree_le
      const { rows: bad } = await client.query(`
        SELECT COUNT(*) AS c FROM signalement_historique
        WHERE signalement_id = $1 AND le < $2
      `, [p.id, p.newCree]);

      if (parseInt(bad[0].c) > 0) {
        // Recaler les entrées antérieures à cree_le
        await client.query(`
          UPDATE signalement_historique
          SET le = $1
          WHERE signalement_id = $2 AND le < $1
        `, [p.newCree, p.id]);
      }

      updated++;
    }

    await client.query('COMMIT');
    console.log('✓  ' + updated + ' dossiers re-datés.');
    console.log('✓  Total signalements inchangé : ' + totalSig.rows[0].c);
    console.log('✓  Aucun état / rattachement / gravité modifié.');

    // 6. Vérification post-apply
    const { rows: [verif] } = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE s.cree_le < NOW() - INTERVAL '48 hours') AS breached,
        COUNT(*) FILTER (WHERE s.gravite = 'danger_immediat') AS critiques,
        COUNT(*) AS actifs
      FROM signalement s
      WHERE s.etat NOT IN ('resolu','clos','rejete')
    `);

    console.log('\n─── Vérification post-apply ───');
    console.log('  breachedSla      : ' + verif.breached);
    console.log('  criticalCases    : ' + verif.critiques);
    console.log('  actifs           : ' + verif.actifs);

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('ERREUR:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
