const { test } = require('node:test');
const assert = require('node:assert');
const { calculerScore, detecterPointsNoirs, calculerIcua } = require('../src/modules/proprete/scoring');

test('score = 100 quand aucun signalement ouvert', () => {
  assert.strictEqual(calculerScore([]), 100);
});

test('score pénalisé selon la criticité', () => {
  // 3 signalements haute criticité => pénalité 9 => 100 - 36 = 64
  const s = [{ criticite: 'haute' }, { criticite: 'haute' }, { criticite: 'haute' }];
  assert.strictEqual(calculerScore(s), 64);
});

test('score plancher à 0', () => {
  const s = Array.from({ length: 30 }, () => ({ criticite: 'haute' }));
  assert.strictEqual(calculerScore(s), 0);
});

test('point noir détecté à partir de 3 signalements convergents', () => {
  const s = [
    { lat: 36.7530, lng: 3.0590 },
    { lat: 36.7531, lng: 3.0591 },
    { lat: 36.7530, lng: 3.0590 },
    { lat: 36.8000, lng: 3.1000 }, // isolé
  ];
  const noirs = detecterPointsNoirs(s);
  assert.strictEqual(noirs.length, 1);
  assert.strictEqual(noirs[0].nombre, 3);
});

test('ICUA pondéré correctement', () => {
  // toutes dimensions à 100 => ICUA 100
  assert.strictEqual(calculerIcua({ proprete:100, reactivite:100, vivre_ensemble:100, fluidite:100, engagement:100 }), 100);
  // exemple mixte
  const r = calculerIcua({ proprete:80, reactivite:60, vivre_ensemble:70, fluidite:90, engagement:50 });
  // 0.3*80+0.25*60+0.2*70+0.15*90+0.1*50 = 24+15+14+13.5+5 = 71.5 -> 72
  assert.strictEqual(r, 72);
});
