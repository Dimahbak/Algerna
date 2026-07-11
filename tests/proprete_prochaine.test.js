/**
 * Tests for _propreteProchaineCollecte
 *
 * We replicate the function here (same logic as index.html) and test
 * with various time overrides. The i18n t() is stubbed to return keys.
 */

// Stub i18n
function t(key) { return key; }
function _apJour(i) { return 'ap.jour_' + i; }

// Exact copy of the function from index.html
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

// ── Test Data ──
// Didouche Mourad créneaux (7j/7 ménagers 18:00-20:00, tri mar+ven 07:00-09:00, encombrants sam 06:00-10:00)
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

// ── Tests ──

console.log('\n1. AVANT le créneau du jour (samedi 05:00, encombrants 06:00-10:00)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 5, mm: 0 });
  assert('retourne le créneau encombrants du samedi', r !== null && r.type_collecte === 'encombrants');
  assert('heure_debut = 06:00', r.heure_debut.startsWith('06:00'));
  assert('label = ce matin (06:00 < 12:00)', r.quand === 'ap.cit_ce_matin');
}

console.log('\n2. PENDANT le créneau (samedi 08:00, encombrants 06:00-10:00)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 8, mm: 0 });
  assert('retourne encombrants (en cours)', r !== null && r.type_collecte === 'encombrants');
  assert('label = en cours', r.quand === 'ap.cit_en_cours');
}

console.log('\n3. APRÈS le créneau du matin (samedi 10:30, encombrants 06:00-10:00 passé)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 10, mm: 30 });
  assert('bascule sur ménagers 18:00 du même jour', r !== null && r.type_collecte === 'menagers');
  assert('label = ce soir (18:00 >= 17:00)', r.quand === 'ap.cit_ce_soir');
  assert('heure_debut = 18:00', r.heure_debut.startsWith('18:00'));
}

console.log('\n4. APRÈS tous les créneaux du jour (samedi 21:00)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 21, mm: 0 });
  assert('bascule sur dimanche', r !== null && r.jour === 0);
  assert('type = ménagers (18:00 dim)', r.type_collecte === 'menagers');
  assert('label = demain soir (18:00 >= 17:00)', r.quand === 'ap.cit_demain_soir');
}

console.log('\n5. Jour SANS créneau — créneaux lun+mer seuls');
{
  const sparse = [
    { jour: 1, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
    { jour: 3, heure_debut: '08:00:00', heure_fin: '10:00:00', type_collecte: 'tri' },
  ];
  // Mardi 12:00 — pas de créneau mardi, saute à mercredi
  const r = _propreteProchaineCollecte(sparse, { day: 2, hh: 12, mm: 0 });
  assert('saute au mercredi', r !== null && r.jour === 3);
  assert('type = tri', r.type_collecte === 'tri');
  assert('label = demain matin (08:00 < 12:00)', r.quand === 'ap.cit_demain_matin');
}

console.log('\n6. Fin de semaine → début semaine suivante');
{
  const sparse = [
    { jour: 1, heure_debut: '18:00:00', heure_fin: '20:00:00', type_collecte: 'menagers' },
  ];
  // Samedi 22:00 — seul créneau est lundi
  const r = _propreteProchaineCollecte(sparse, { day: 6, hh: 22, mm: 0 });
  assert('bascule de samedi à lundi', r !== null && r.jour === 1);
  assert('label = nom du jour (d >= 2)', r.quand === 'ap.jour_1');
}

console.log('\n7. Créneau après-midi (14:00-16:00 un mercredi, consulté à 11:00)');
{
  const pm = [
    { jour: 3, heure_debut: '14:00:00', heure_fin: '16:00:00', type_collecte: 'tri' },
  ];
  const r = _propreteProchaineCollecte(pm, { day: 3, hh: 11, mm: 0 });
  assert('retourne le créneau après-midi', r !== null && r.type_collecte === 'tri');
  assert('label = cet après-midi', r.quand === 'ap.cit_cet_aprem');
}

console.log('\n8. Liste vide');
{
  const r = _propreteProchaineCollecte([], { day: 0, hh: 12, mm: 0 });
  assert('retourne null', r === null);
}

console.log('\n9. Exactement à l\'heure de fin (10:00 pile, créneau 06:00-10:00)');
{
  const r = _propreteProchaineCollecte(creneaux, { day: 6, hh: 10, mm: 0 });
  assert('créneau 06-10 est passé (fin <= now)', r !== null && r.type_collecte === 'menagers');
  assert('bascule sur le créneau suivant (18:00)', r.heure_debut.startsWith('18:00'));
}

// ── Summary ──
console.log('\n══════════════════════════════');
console.log(`Résultats : ${pass} passés, ${fail} échoués sur ${pass + fail}`);
if (fail > 0) process.exit(1);
console.log('══════════════════════════════\n');
