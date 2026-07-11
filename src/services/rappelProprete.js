/**
 * Rappels propreté — envoie des notifications in-app
 * avant chaque créneau de dépôt (1h avant l'ouverture).
 * Exécuté toutes les 15 minutes.
 */
const { query } = require('../db/pool');

const TYPES_FR = { menagers: 'ordures ménagères', tri: 'tri sélectif', encombrants: 'encombrants' };
const TYPES_AR = { menagers: 'نفايات منزلية', tri: 'فرز انتقائي', encombrants: 'نفايات ضخمة' };

async function envoyerRappels() {
  try {
    // Find créneaux starting in the next 45-75 min window
    // jour: 0=dim..6=sam (JS getDay())
    const now = new Date();
    const jourActuel = now.getDay();
    const hh = now.getHours();
    const mm = now.getMinutes();
    // Window: créneaux starting between now+45min and now+75min
    const minStart = (hh * 60 + mm) + 45;
    const minEnd = (hh * 60 + mm) + 75;
    const startTime = String(Math.floor(minStart / 60)).padStart(2, '0') + ':' + String(minStart % 60).padStart(2, '0');
    const endTime = String(Math.floor(minEnd / 60)).padStart(2, '0') + ':' + String(minEnd % 60).padStart(2, '0');

    // Skip if window wraps past midnight (edge case)
    if (minStart >= 1440) return;

    const { rows: creneaux } = await query(
      `SELECT cd.*, q.nom AS quartier_nom, q.nom_ar AS quartier_nom_ar
       FROM creneau_depot cd
       JOIN quartier q ON q.id = cd.quartier_id
       WHERE cd.jour = $1 AND cd.heure_debut >= $2::time AND cd.heure_debut < $3::time
         AND q.statut = 'actif'`,
      [jourActuel, startTime, endTime]);

    if (!creneaux.length) return;

    for (const c of creneaux) {
      const hDebut = c.heure_debut.substring(0, 5);
      const hFin = c.heure_fin.substring(0, 5);
      const typeFr = TYPES_FR[c.type_collecte] || c.type_collecte;
      const typeAr = TYPES_AR[c.type_collecte] || c.type_collecte;

      const debutH = parseInt(hDebut.split(':')[0], 10);
      const momentFr = debutH >= 17 ? 'ce soir' : debutH >= 12 ? 'cet après-midi' : 'ce matin';
      const momentAr = debutH >= 17 ? 'هذا المساء' : debutH >= 12 ? 'بعد الظهر' : 'هذا الصباح';

      const titreFr = 'Rappel collecte — ' + c.quartier_nom;
      const titreAr = 'تذكير جمع — ' + (c.quartier_nom_ar || c.quartier_nom);
      const msgFr = `Dépôt des ${typeFr} de ${hDebut} à ${hFin} ${momentFr} dans votre quartier.`;
      const msgAr = `إيداع ${typeAr} من ${hDebut} إلى ${hFin} ${momentAr} في حيكم.`;

      // Find users with this quartier + rappel mode compatible
      // 'tous' = all types, 'utiles' = categories with rappel_defaut=true only, 'aucun' = none
      // Reads rappel_defaut from categorie_dechet table (driven by data, not hardcoded)
      const { rows: catRows } = await query(
        `SELECT rappel_defaut FROM categorie_dechet WHERE nom_fr = $1`, [c.type_collecte]);
      const rappelDefaut = catRows.length ? catRows[0].rappel_defaut : false;
      const modeFilter = rappelDefaut
        ? "AND u.rappel_proprete IN ('tous', 'utiles')"       // rappel_defaut=true: 'tous' + 'utiles'
        : "AND u.rappel_proprete = 'tous'";                    // rappel_defaut=false: only 'tous'
      const { rows: users } = await query(
        `SELECT u.id, COALESCE(u.langue, 'fr') AS langue FROM utilisateur u
         WHERE u.quartier_id = $1 AND u.actif = TRUE ${modeFilter}
           AND NOT EXISTS (
             SELECT 1 FROM notification n
             WHERE n.utilisateur_id = u.id AND n.type = 'rappel_proprete'
               AND n.cree_le::date = CURRENT_DATE
               AND n.message LIKE $2
           )`,
        [c.quartier_id, '%' + hDebut + '%' + c.type_collecte + '%']);

      if (users.length) {
        console.log(`[RappelProprete] ${c.type_collecte} ${hDebut}-${hFin} ${c.quartier_nom}: ${users.length} notif(s)`);
      }
      for (const user of users) {
        const titre = user.langue === 'ar' ? titreAr : titreFr;
        const msg = user.langue === 'ar' ? msgAr : msgFr;
        await query(
          `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
           VALUES ($1, 'rappel_proprete', $2, $3, '/proprete')`,
          [user.id, titre, msg]);
      }
    }
  } catch (e) {
    console.error('[RappelProprete] Erreur:', e.message);
  }
}

// Run every 15 minutes
let _interval;
function start() {
  envoyerRappels(); // first run immediately
  _interval = setInterval(envoyerRappels, 15 * 60 * 1000);
}

function stop() { if (_interval) clearInterval(_interval); }

module.exports = { start, stop, envoyerRappels };
