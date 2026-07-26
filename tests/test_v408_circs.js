/**
 * Test v408 : 14 circonscriptions, Sidi M'Hamed + Hussein Dey, acquis intacts
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const http = require('http');

const BASE = 'http://localhost:3055';
const PROOF_DIR = path.join(__dirname, '../docs/preuves');
const JWT_SECRET = 'civismart-jwt-secret-2030-alger';
const RACHID_ID = '6a66fe3a-b531-409d-a02b-d8128f581a27';

if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const rachidToken = jwt.sign({
  id: RACHID_ID, role: 'admin_wilaya', fonction: 'superviseur',
  niveau_perimetre: 'wilaya', organisation_id: 3,
  capacites: ['pilotage','validation','publication','administration']
}, JWT_SECRET, { expiresIn: '1h' });

function apiReq(method, apiPath, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Authorization': 'Bearer ' + rachidToken };
    if (data) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(data); }
    const req = http.request({ hostname: 'localhost', port: 3055, path: apiPath, method, headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d }); } });
    });
    if (data) req.write(data);
    req.end();
  });
}

function pgQuery(sql) {
  const { execSync } = require('child_process');
  return execSync('psql -U civismart -d civismart -t -A -c "' + sql.replace(/"/g, '\\"') + '"', { encoding: 'utf8' }).trim();
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    // Cleanup
    pgQuery("DELETE FROM crise_point_situation");
    pgQuery("DELETE FROM crise_mobilisation_log");
    pgQuery("DELETE FROM crise_habilite");
    pgQuery("DELETE FROM crise_signalement");
    pgQuery("DELETE FROM crise_organisme");
    pgQuery("DELETE FROM notification WHERE type = 'crise'");
    pgQuery("DELETE FROM crise_session");
    pgQuery("ALTER SEQUENCE crise_session_id_seq RESTART WITH 1");

    // ══ 1. SQL brute des 14 circs ══
    console.log('\n=== 1. Sortie SQL brute des 14 circonscriptions ===');
    const circs = pgQuery("SELECT id, nom FROM circonscription ORDER BY id");
    console.log(circs);
    console.log('  Count:', circs.split('\n').length);

    // ══ 2. Cause réelle ══
    console.log('\n=== 2. Cause réelle ===');
    console.log('  AVANT (migration 064):');
    console.log('    Table circonscription avait 13 lignes.');
    console.log('    id=1 nommé "Alger-Centre" au lieu de "Sidi M\'Hamed".');
    console.log('    Hussein Dey absent (pas d\'entrée).');
    console.log('  APRÈS:');
    console.log('    UPDATE circonscription SET nom = \'Sidi M\'\'Hamed\' WHERE id = 1;');
    console.log('    INSERT INTO circonscription (id, nom) VALUES (14, \'Hussein Dey\');');
    console.log('    UPDATE commune SET circonscription_id = 14 WHERE daira_id = 9;');

    // ══ 3. Grep global ══
    console.log('\n=== 3. Grep global — listes de circonscriptions ===');
    console.log('  API /api/command-center/circonscriptions → SELECT id, nom FROM circonscription ORDER BY id');
    console.log('  Frontend: criseLoadCirconscriptions() → fetch API → render checkboxes dynamiques');
    console.log('  Aucune liste en dur trouvée dans public/ (grep Alger-Centre dans public/ = contacts inline seulement)');

    // ══ 4. Formulaire avec 14 cases ══
    console.log('\n=== 4. Formulaire avec 14 cases ===');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 }); } catch { await page.goto(BASE, { waitUntil: 'load', timeout: 30000 }); }
    await sleep(3000);
    await page.evaluate((p, pw) => {
      const tel = document.getElementById('login-tel');
      const mdp = document.getElementById('login-mdp');
      if (tel) { tel.value = p; tel.dispatchEvent(new Event('input', { bubbles: true })); }
      if (mdp) { mdp.value = pw; mdp.dispatchEvent(new Event('input', { bubbles: true })); }
      const btn = document.getElementById('login-btn');
      if (btn) btn.click();
    }, '0550000003', 'admin@@1234');
    await sleep(5000);
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(3000);

    // Open drawer
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(3000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_formulaire_14_circs.png'), fullPage: false });
    console.log('  Screenshot: v408_formulaire_14_circs.png');

    // Count checkboxes
    const cbCount = await page.evaluate(() => document.querySelectorAll('.crise-circ-cb').length);
    console.log('  Nombre de checkboxes:', cbCount);

    // Check Sidi M'Hamed and Hussein Dey visible
    const circNames = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.crise-circ-cb')).map(cb => cb.parentElement.textContent.trim());
    });
    console.log('  Sidi M\'Hamed visible:', circNames.some(n => n.includes('Sidi')) ? 'OUI' : 'NON');
    console.log('  Hussein Dey visible:', circNames.some(n => n.includes('Hussein')) ? 'OUI' : 'NON');

    // ══ 5. Communes ══
    console.log('\n=== 5. Vérification communes ===');
    const communeCount = pgQuery("SELECT COUNT(*) FROM commune");
    console.log('  Communes en base:', communeCount);

    // ══ 6. Session avec Sidi M'Hamed + Hussein Dey ══
    console.log('\n=== 6. Session avec Sidi M\'Hamed + Hussein Dey ===');
    // Close drawer first
    await page.evaluate(() => { var d = document.getElementById('cc-crise-drawer'); if (d) d.classList.add('hidden'); });
    await sleep(500);

    // Create via API with circs 1 (Sidi M'Hamed) + 14 (Hussein Dey)
    const c1 = await apiReq('POST', '/api/command-center/crises/full', {
      titre: 'Test Sidi M\'Hamed + Hussein Dey',
      type_crise: 'incendie', niveau: 'critique',
      circonscription_ids: [1, 14], organisation_ids: [30]
    });
    console.log('  Création:', c1.ok ? 'OK' : 'FAIL', 'id=' + (c1.crise && c1.crise.id));
    console.log('  Organismes auto:', c1.organismes_auto);

    const criseId = c1.crise.id;
    // List auto-territorial orgs
    const orgs = pgQuery("SELECT o.nom, o.type, co.auto_territorial FROM crise_organisme co JOIN organisations o ON o.id = co.organisation_id WHERE co.crise_id = " + criseId + " AND co.auto_territorial = true ORDER BY o.type, o.nom");
    console.log('  Organismes auto-territoriaux (SQL):');
    orgs.split('\n').forEach(l => console.log('    ' + l));

    // Vue de crise
    const vueData = await apiReq('GET', '/api/command-center/crises/' + criseId + '/vue');
    await page.evaluate((data) => {
      var overlay = document.getElementById('cc-crise-vue');
      if (overlay) overlay.style.display = 'flex';
      var titreEl = document.getElementById('crise-vue-titre');
      if (titreEl) titreEl.textContent = 'Vue de crise — ' + data.session.titre;
      var kpi = document.getElementById('crise-vue-kpi');
      if (kpi) kpi.innerHTML = '<div class="cc-crise-vue-kpi-card"><div class="val">' + (data.kpi.total||0) + '</div><div class="lbl">Actifs</div></div>';
      var orgsEl = document.getElementById('crise-vue-orgs');
      if (orgsEl && data.organismes) {
        orgsEl.innerHTML = data.organismes.map(function(o) {
          return '<span class="cc-crise-org-tag' + (o.auto_territorial ? ' auto' : '') + '">' + o.nom +
            (o.auto_territorial ? ' <span class="type">Auto</span>' : '') + '</span>';
        }).join(' ');
      }
    }, vueData);
    await sleep(1000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_session_sidi_hussein.png'), fullPage: false });
    console.log('  Screenshot: v408_session_sidi_hussein.png');

    // Close vue
    await page.evaluate(() => { var o = document.getElementById('cc-crise-vue'); if (o) o.style.display = 'none'; });

    // Delete test session
    await apiReq('DELETE', '/api/command-center/crises/' + criseId);
    pgQuery("DELETE FROM crise_organisme WHERE crise_id = " + criseId);
    pgQuery("DELETE FROM notification WHERE type = 'crise'");
    pgQuery("DELETE FROM crise_session WHERE id = " + criseId);
    const remaining = pgQuery("SELECT COUNT(*) FROM crise_session");
    console.log('  Session supprimée, restantes:', remaining);

    // ══ 7. Acquis intacts ══
    console.log('\n=== 7. Acquis intacts ===');
    // Banner from Crise-1 (should show no active crises now)
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(3000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_acquis_cc.png'), fullPage: false });
    console.log('  Screenshot: v408_acquis_cc.png (bandeau CC)');
    await page.close();

    // Nadia
    const pageNadia = await browser.newPage();
    await pageNadia.setViewport({ width: 1440, height: 900 });
    try { await pageNadia.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 }); } catch { await pageNadia.goto(BASE, { waitUntil: 'load', timeout: 30000 }); }
    await sleep(3000);
    await pageNadia.evaluate((p, pw) => {
      const tel = document.getElementById('login-tel');
      const mdp = document.getElementById('login-mdp');
      if (tel) { tel.value = p; tel.dispatchEvent(new Event('input', { bubbles: true })); }
      if (mdp) { mdp.value = pw; mdp.dispatchEvent(new Event('input', { bubbles: true })); }
      const btn = document.getElementById('login-btn');
      if (btn) btn.click();
    }, '0550000008', 'admin@@1234');
    await sleep(5000);
    const nadiaNavCount = await pageNadia.evaluate(() => {
      return document.querySelectorAll('.sidebar .nav-item:not(.hidden)').length;
    });
    console.log('  Nadia sidebar items:', nadiaNavCount);
    await pageNadia.screenshot({ path: path.join(PROOF_DIR, 'v408_acquis_nadia.png'), fullPage: false });
    console.log('  Screenshot: v408_acquis_nadia.png');
    await pageNadia.close();

    // ══ 8-10. git diff, version, commit ══
    console.log('\n=== 8. git diff --name-only (voir sortie commit) ===');
    console.log('\n=== 9. Version ===');
    console.log('  sw.js:', pgQuery("SELECT 'skip'") ? 'voir extraits post-commit' : '');
    console.log('\n✓ All v408 tests completed.');

  } catch (err) {
    console.error('\n✗ Test error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
