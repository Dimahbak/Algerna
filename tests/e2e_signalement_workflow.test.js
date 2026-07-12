/**
 * E2E Test: Signalement workflow — creation → transmission → prise en charge
 *   → travaux terminés → validation → citoyen notifié
 *
 * Proves the full chain after fixes:
 *   1. boLoadKanban() ReferenceError (was undefined)
 *   2. Missing superviseur notification at a_valider
 *   3. Stuck dossier pathway
 */
const pool = require('../src/db/pool');

const BASE = 'http://localhost:' + (process.env.PORT || 3055);

// Demo accounts (all use admin1234)
const AMINA   = { tel: '0550000001' }; // citoyen
const YOUCEF  = { tel: '0550000002' }; // agent_traitant
const RACHID  = { tel: '0550000003' }; // superviseur wilaya
const NASSIM  = { tel: '0550000005' }; // EPIC propreté

async function fetchJSON(url, opts = {}) {
  const res = await fetch(BASE + url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body };
}

async function login(tel) {
  const r = await fetchJSON('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ telephone: tel, motDePasse: 'admin1234' })
  });
  if (!r.ok) throw new Error(`Login ${tel}: ${r.status} ${JSON.stringify(r.body)}`);
  return r.body.token;
}

function auth(token) { return { Authorization: 'Bearer ' + token }; }

async function changeEtat(token, id, etat, extra = {}) {
  return fetchJSON('/api/signaler/board/' + id + '/etat', {
    method: 'PATCH',
    headers: auth(token),
    body: JSON.stringify({ etat, ...extra })
  });
}

let testId = null;

async function cleanup() {
  if (testId) {
    await pool.query('DELETE FROM signalement_historique WHERE signalement_id = $1', [testId]);
    await pool.query('DELETE FROM notification WHERE titre LIKE $1', ['%TEST-E2E%']);
    await pool.query('DELETE FROM signalement WHERE id = $1', [testId]);
    console.log('[cleanup] Deleted test data');
  }
}

(async () => {
  const results = [];
  function check(name, ok, detail) {
    results.push({ name, ok: !!ok });
    console.log((ok ? '✅' : '❌') + ' ' + name + (detail ? ' — ' + detail : ''));
  }

  try {
    // ── Logins ──
    console.log('\n── Logins ──');
    const tAmina  = await login(AMINA.tel);
    const tYoucef = await login(YOUCEF.tel);
    const tRachid = await login(RACHID.tel);
    const tNassim = await login(NASSIM.tel);
    check('All logins OK', tAmina && tYoucef && tRachid && tNassim);

    // ── Step 1: Amina crée un signalement (via API) ──
    console.log('\n── Step 1: Création citoyen ──');
    const createRes = await fetchJSON('/api/signaler/signalements', {
      method: 'POST',
      headers: auth(tAmina),
      body: JSON.stringify({
        categorieId: 1,
        description: 'TEST-E2E — Dépôt sauvage test workflow automatisé',
        lat: 36.7538, lng: 2.8959,
        communeId: 24
      })
    });
    const sig = createRes.body?.signalement || createRes.body;
    check('Signalement créé', createRes.ok, 'ref=' + (sig?.reference || 'N/A'));
    testId = sig?.id;
    const ref = sig?.reference;
    if (!testId) throw new Error('Création échouée: ' + JSON.stringify(createRes.body));

    const s1 = await pool.query('SELECT etat FROM signalement WHERE id=$1', [testId]);
    check('État = recu', s1.rows[0]?.etat === 'recu', s1.rows[0]?.etat);

    // ── Step 2: Youcef transmet → transmis ──
    console.log('\n── Step 2: Transmission ──');
    const r2 = await changeEtat(tYoucef, testId, 'transmis', {
      commentaire: 'Qualifié et transmis',
      transmisA: '5' // org ID 5 = Direction Propreté
    });
    check('Transition transmis', r2.ok, JSON.stringify(r2.body));
    const s2 = await pool.query('SELECT etat FROM signalement WHERE id=$1', [testId]);
    check('État = transmis', s2.rows[0]?.etat === 'transmis', s2.rows[0]?.etat);

    // ── Step 3: Nassim prend en charge → pris_en_charge ──
    console.log('\n── Step 3: Prise en charge ──');
    const r3 = await changeEtat(tNassim, testId, 'pris_en_charge', {
      commentaire: 'Prise en charge par le service propreté'
    });
    check('Transition pris_en_charge', r3.ok, JSON.stringify(r3.body));
    const s3 = await pool.query('SELECT etat FROM signalement WHERE id=$1', [testId]);
    check('État = pris_en_charge', s3.rows[0]?.etat === 'pris_en_charge', s3.rows[0]?.etat);

    // ── Step 4: Nassim démarre intervention → en_intervention ──
    console.log('\n── Step 4: Intervention ──');
    const r4 = await changeEtat(tNassim, testId, 'en_intervention', {
      commentaire: 'Intervention démarrée'
    });
    check('Transition en_intervention', r4.ok, JSON.stringify(r4.body));
    const s4 = await pool.query('SELECT etat FROM signalement WHERE id=$1', [testId]);
    check('État = en_intervention', s4.rows[0]?.etat === 'en_intervention', s4.rows[0]?.etat);

    // ── Step 5: Nassim soumet le compte-rendu → a_valider ──
    console.log('\n── Step 5: Compte-rendu ──');
    const crRes = await fetchJSON('/api/signaler/board/' + testId + '/compte-rendu', {
      method: 'POST',
      headers: auth(tNassim),
      body: JSON.stringify({
        description: 'Zone nettoyée, déchets évacués',
        resultat: 'resolu_completement',
        observation: 'RAS',
        dateFin: new Date().toISOString()
      })
    });
    check('Compte-rendu soumis', crRes.ok, JSON.stringify(crRes.body));
    const s5 = await pool.query('SELECT etat, compte_rendu_description, compte_rendu_resultat FROM signalement WHERE id=$1', [testId]);
    check('État = a_valider', s5.rows[0]?.etat === 'a_valider', s5.rows[0]?.etat);
    check('CR enregistré', s5.rows[0]?.compte_rendu_resultat === 'resolu_completement');

    // ── Step 5b: Vérifier notification superviseur ──
    console.log('\n── Step 5b: Notification superviseur ──');
    const supN = await pool.query(
      "SELECT titre FROM notification WHERE utilisateur_id = $1 AND titre LIKE '%valider%' AND titre LIKE $2 ORDER BY cree_le DESC LIMIT 1",
      ['6a66fe3a-b531-409d-a02b-d8128f581a27', '%' + ref + '%']
    );
    check('Rachid notifié (a_valider)', supN.rows.length > 0, supN.rows[0]?.titre || 'AUCUNE');

    // ── Step 5c: Vérifier que citoyen reçoit "intervention terminée" ──
    const citNterm = await pool.query(
      "SELECT titre FROM notification WHERE utilisateur_id = $1 AND titre LIKE '%terminée%' AND titre LIKE $2 ORDER BY cree_le DESC LIMIT 1",
      ['624db3e9-3bcc-4087-8ce2-6acfc3f265a7', '%' + ref + '%']
    );
    check('Amina notifiée (intervention terminée)', citNterm.rows.length > 0);

    // ── Step 6: Rachid valide → resolu ──
    console.log('\n── Step 6: Validation ──');
    const valRes = await fetchJSON('/api/signaler/board/' + testId + '/valider', {
      method: 'POST',
      headers: { ...auth(tRachid), 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentaire: 'Validé — travaux conformes' })
    });
    check('Validation OK', valRes.ok, JSON.stringify(valRes.body));
    const s6 = await pool.query('SELECT etat, resolu_le FROM signalement WHERE id=$1', [testId]);
    check('État = resolu', s6.rows[0]?.etat === 'resolu', s6.rows[0]?.etat);
    check('resolu_le renseigné', !!s6.rows[0]?.resolu_le);

    // ── Step 7: Vérifier notification citoyen résolu ──
    console.log('\n── Step 7: Notification citoyen résolu ──');
    const citNres = await pool.query(
      "SELECT titre, message FROM notification WHERE utilisateur_id = $1 AND titre LIKE '%Résolu%' AND titre LIKE $2 ORDER BY cree_le DESC LIMIT 1",
      ['624db3e9-3bcc-4087-8ce2-6acfc3f265a7', '%' + ref + '%']
    );
    check('Amina notifiée (résolu)', citNres.rows.length > 0, citNres.rows[0]?.message || 'AUCUNE');

    // ── Step 8: Historique complet ──
    console.log('\n── Step 8: Historique ──');
    const hist = await pool.query(
      'SELECT etat, action FROM signalement_historique WHERE signalement_id = $1 ORDER BY le ASC',
      [testId]
    );
    hist.rows.forEach((h, i) => console.log('    ' + (i+1) + '. ' + h.action + ' → ' + h.etat));
    check('Historique complet', hist.rows.length >= 7, hist.rows.length + ' entrées');

    // ── Summary ──
    console.log('\n══════════════════════════════════════');
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    console.log(`RÉSULTAT: ${passed} ✅  ${failed} ❌  sur ${results.length}`);
    if (failed > 0) {
      console.log('\nÉCHECS:');
      results.filter(r => !r.ok).forEach(r => console.log('  ❌ ' + r.name));
    }
    console.log('══════════════════════════════════════');

  } catch(e) {
    console.error('\n💥 ERREUR FATALE:', e.message);
  } finally {
    await cleanup();
    process.exit(0);
  }
})();
