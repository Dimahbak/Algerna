/**
 * Tests for _propreteProchaineCollecte + rappel mode filtering
 */

// Stub i18n
function t(key) { return key; }
function _apJour(i) { return 'ap.jour_' + i; }

// ── Function under test (same as index.html) ──
function _propreteProchaineCollecte(creneaux, nowOverride) {
  if (!creneaux.length) return null;
  var now = nowOverride || {};
  var jourActuel = now.day !== undefined ? now.day : new Date().getDay();
  var hh = now.hh !== undefined ? now.hh : new Date().getHours();
  var mm = now.mm !== undefined ? now.mm : new Date().getMinutes();
  var nowMinutes = hh * 60 + mm;

  for (var d = 0; d < 7; d++) {
    var jourIdx = (jourActuel + d) % 7;
    var jourC = creneaux.filter(function(c){ return c.jour === jourIdx; });
    jourC.sort(function(a,b){ return a.heure_debut < b.heure_debut ? -1 : 1; });
    for (var i = 0; i < jourC.length; i++) {
      var c = jourC[i];
      var finParts = c.heure_fin.split(':');
      var finMin = parseInt(finParts[0]) * 60 + parseInt(finParts[1]);
      if (d === 0 && finMin <= nowMinutes) continue;

      var debutParts = c.heure_debut.split(':');
      var debutMin = parseInt(debutParts[0]) * 60 + parseInt(debutParts[1]);

      var quand;
      if (d === 0) {
        if (debutMin <= nowMinutes && finMin > nowMinutes) {
          quand = t('ap.cit_en_cours');
        } else if (debutMin >= 17 * 60) {
          quand = t('ap.cit_ce_soir');
        } else if (debutMin >= 12 * 60) {
          quand = t('ap.cit_cet_aprem');
        } else {
          quand = t('ap.cit_ce_matin');
        }
      } else if (d === 1) {
        if (debutMin >= 17 * 60) quand = t('ap.cit_demain_soir');
        else if (debutMin < 12 * 60) quand = t('ap.cit_demain_matin');
        else quand = t('ap.cit_demain');
      } else {
        quand = _apJour(jourIdx);
      }

      return { type_collecte: c.type_collecte, heure_debut: c.heure_debut, heure_fin: c.heure_fin, jour: c.jour, quand: quand };
    }
  }
  return null;
}

// ── Rappel mode filtering logic (mirrors cron SQL) ──
function shouldNotify(type_collecte, rappelMode) {
  if (rappelMode === 'aucun') return false;
  if (rappelMode === 'tous') return true;
  // 'utiles': only non-daily types (tri + encombrants)
  return type_collecte !== 'menagers';
}

// ── Test Data ──
const creneaux = [
  { jour: 0, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
  { jour: 1, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
  { jour: 2, heure_debut: '07:00:00', heure_fin: '09:00:00', type_collecte: 'tri' },
  { jour: 2, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
  { jour: 3, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
  { jour: 4, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
  { jour: 5, heure_debut: '07:00:00', heure_fin: '09:00:00', type_collecte: 'tri' },
  { jour: 5, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
  { jour: 6, heure_debut: '06:00:00', heure_fin: '10:00:00', type_collecte: 'encombrants' },
  { jour: 6, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
];

let pass = 0, fail = 0;
function assert(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ FAIL: ' + name); }
}

// ═══ PART A: PROCHAINE COLLECTE ═══

console.log('\n═══ A. CALCUL PROCHAINE COLLECTE ═══');

console.log('\n1. AVANT le créneau du jour (sam 05:00, encombrants 06-10)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 5, mm: 0 });
  assert('retourne encombrants', r && r.type_collecte === 'encombrants');
  assert('label = ce matin', r.quand === 'ap.cit_ce_matin');
}

console.log('\n2. PENDANT le créneau (sam 08:00, encombrants 06-10)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 8, mm: 0 });
  assert('retourne encombrants en cours', r && r.type_collecte === 'encombrants');
  assert('label = en cours', r.quand === 'ap.cit_en_cours');
}

console.log('\n3. APRÈS créneau matin (sam 10:30) → bascule sur soir');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 10, mm: 30 });
  assert('bascule sur ménagers 18h', r && r.type_collecte === 'menagers' && r.heure_debut.startsWith('18'));
  assert('label = ce soir', r.quand === 'ap.cit_ce_soir');
}

console.log('\n4. APRÈS tous créneaux du jour (sam 21:00) → demain');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 21, mm: 0 });
  assert('bascule sur dimanche', r && r.jour === 0);
  assert('label = demain soir', r.quand === 'ap.cit_demain_soir');
}

console.log('\n5. Jour SANS créneau → saute au prochain');
{
  const sparse = [
    { jour: 1, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
    { jour: 3, heure_debut: '08:00:00', heure_fin: '10:00:00', type_collecte: 'tri' },
  ];
  const r = _propreteProchaineCollecte(sparse, { day: 2, hh: 12, mm: 0 });
  assert('saute mardi → mercredi', r && r.jour === 3);
  assert('label = demain matin', r.quand === 'ap.cit_demain_matin');
}

console.log('\n6. Fin de semaine → début semaine suivante');
{
  const sparse = [{ jour: 1, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' }];
  const r = _propreteProchaineCollecte(sparse, { day: 6, hh: 22, mm: 0 });
  assert('sam → lundi', r && r.jour === 1);
  assert('label = nom du jour (d >= 2)', r.quand === 'ap.jour_1');
}

console.log('\n7. Heure de fin pile (10:00, créneau 06-10)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 10, mm: 0 });
  assert('10:00 pile → créneau passé, bascule 18h', r && r.heure_debut.startsWith('18'));
}

console.log('\n8. Liste vide');
{
  assert('retourne null', _propreteProchaineCollecte([], { day: 0, hh: 12, mm: 0 }) === null);
}

// ═══ PART B: RAPPEL MODE FILTERING ═══

console.log('\n═══ B. FILTRAGE RAPPELS PAR MODE ═══');

console.log('\n9. Mode "tous" — reçoit tout');
{
  assert('menagers → oui', shouldNotify('menagers', 'tous'));
  assert('tri → oui', shouldNotify('tri', 'tous'));
  assert('encombrants → oui', shouldNotify('encombrants', 'tous'));
}

console.log('\n10. Mode "utiles" — pas de ménagers');
{
  assert('menagers → NON', !shouldNotify('menagers', 'utiles'));
  assert('tri → oui', shouldNotify('tri', 'utiles'));
  assert('encombrants → oui', shouldNotify('encombrants', 'utiles'));
}

console.log('\n11. Mode "aucun" — rien');
{
  assert('menagers → NON', !shouldNotify('menagers', 'aucun'));
  assert('tri → NON', !shouldNotify('tri', 'aucun'));
  assert('encombrants → NON', !shouldNotify('encombrants', 'aucun'));
}

// ═══ Summary ═══
console.log('\n══════════════════════════════');
console.log(`Résultats : ${pass} passés, ${fail} échoués sur ${pass + fail}`);
if (fail > 0) process.exit(1);
console.log('══════════════════════════════\n');
