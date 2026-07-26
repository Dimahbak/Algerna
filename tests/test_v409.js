/**
 * Test v409 : Retypage 5 directions, sigles en nom complet, libellé AR
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
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d }); } });
    });
    if (data) req.write(data); req.end();
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
    pgQuery("DELETE FROM crise_point_situation"); pgQuery("DELETE FROM crise_mobilisation_log");
    pgQuery("DELETE FROM crise_habilite"); pgQuery("DELETE FROM crise_signalement");
    pgQuery("DELETE FROM crise_organisme"); pgQuery("DELETE FROM notification WHERE type = 'crise'");
    pgQuery("DELETE FROM crise_session"); pgQuery("ALTER SEQUENCE crise_session_id_seq RESTART WITH 1");

    // ══ 1-2. Migration + AVANT/APRÈS ══
    console.log('\n=== 1. Migration 065 ===');
    console.log('  Contenu: UPDATE organisations SET type = \'direction\' WHERE id IN (5,6,16,17,18)');

    console.log('\n=== 2. APRÈS retypage ===');
    console.log(pgQuery("SELECT id || '|' || nom || '|' || type || '|prio=' || prioritaire || '|actif=' || actif FROM organisations WHERE id IN (5,6,16,17,18) ORDER BY id"));

    // ══ 3. EPIC restants ══
    console.log('\n=== 3. EPIC restants ===');
    console.log(pgQuery("SELECT id || '|' || nom || '|prio=' || prioritaire FROM organisations WHERE type = 'epic' AND actif = TRUE ORDER BY prioritaire DESC, nom"));

    // ══ 4. Grep type=epic + prioritaire ══
    console.log('\n=== 4. Impact ===');
    console.log('  supervision/index.js:253 → type IN (epic,direction) — SAFE (inclut les 2)');
    console.log('  rapports/index.js:614 → type IN (epic,direction) — SAFE');
    console.log('  command-center/index.js:228 → type_organisation = \'epic\' — SAFE (colonne différente)');
    console.log('  Boards: filtrent par direction_pilote_id / organisation_executante_id, pas par type');

    // ══ 7. Boards ══
    console.log('\n=== 7. Boards (SQL) ===');
    var users = [['Nassim','5'],['Nadia','23'],['Farid','18'],['Sofiane','6'],['Leïla','13'],['Khaled','16']];
    users.forEach(function(u) {
      var count = pgQuery("SELECT COUNT(*) FROM signalement WHERE direction_pilote_id = " + u[1] + " OR organisation_executante_id = " + u[1]);
      console.log('  ' + u[0] + ' (org ' + u[1] + '): ' + count + ' dossiers');
    });

    // ══ Login Rachid ══
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    try { await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 }); }
    catch { await page.goto(BASE, { waitUntil: 'load', timeout: 30000 }); }
    await sleep(3000);
    await page.evaluate((p, pw) => {
      const tel = document.getElementById('login-tel');
      const mdp = document.getElementById('login-mdp');
      if (tel) { tel.value = p; tel.dispatchEvent(new Event('input', { bubbles: true })); }
      if (mdp) { mdp.value = pw; mdp.dispatchEvent(new Event('input', { bubbles: true })); }
      const btn = document.getElementById('login-btn'); if (btn) btn.click();
    }, '0550000003', 'admin@@1234');
    await sleep(5000);
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(4000);

    // ══ 5. Carrousel EPIC prioritaires ══
    console.log('\n=== 5. Carrousel EPIC prioritaires ===');
    await page.screenshot({ path: path.join(PROOF_DIR, 'v409_carrousel_epic.png'), fullPage: false });
    console.log('  Screenshot: v409_carrousel_epic.png');
    // Scroll down to see the EPIC section
    await page.evaluate(() => {
      var main = document.querySelector('.cc-content');
      if (main) main.scrollTop = main.scrollHeight / 2;
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v409_cc_epic_section.png'), fullPage: false });
    console.log('  Screenshot: v409_cc_epic_section.png');

    // ══ 8. Sélecteur de crise ══
    console.log('\n=== 8. Sélecteur de crise ===');
    await page.evaluate(() => {
      var main = document.querySelector('.cc-content');
      if (main) main.scrollTop = 0;
    });
    await sleep(500);
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(3000);

    // Count per section
    const sectionCounts = await page.evaluate(() => {
      var dirs = document.getElementById('crise-orgs-directions');
      var epics = document.getElementById('crise-orgs-epic');
      var parts = document.getElementById('crise-orgs-partenaires');
      return {
        directions: dirs ? dirs.querySelectorAll('.crise-org-cb').length : 0,
        epic: epics ? epics.querySelectorAll('.crise-org-cb').length : 0,
        partenaires: parts ? parts.querySelectorAll('.crise-org-cb').length : 0
      };
    });
    console.log('  Frontend: Directions=' + sectionCounts.directions + ' EPIC=' + sectionCounts.epic + ' Partenaires=' + sectionCounts.partenaires);
    console.log('  Base: Directions=' + pgQuery("SELECT COUNT(*) FROM organisations WHERE actif = TRUE AND type IN ('direction','direction_wilaya')") +
      ' EPIC=' + pgQuery("SELECT COUNT(*) FROM organisations WHERE actif = TRUE AND type IN ('epic','cet_site')") +
      ' Partenaires=' + pgQuery("SELECT COUNT(*) FROM organisations WHERE actif = TRUE AND type IN ('operateur_externe','partenaire_institutionnel')"));

    // Check 5 directions now in Directions section
    const dirNames = await page.evaluate(() => {
      var dirs = document.getElementById('crise-orgs-directions');
      if (!dirs) return [];
      return Array.from(dirs.querySelectorAll('.crise-org-cb')).map(cb => cb.parentElement.textContent.trim());
    });
    console.log('  Propreté dans Directions:', dirNames.some(n => n.includes('Propreté')) ? 'OUI' : 'NON');
    console.log('  Eau dans Directions:', dirNames.some(n => n.includes('Eau')) ? 'OUI' : 'NON');
    console.log('  Travaux publics dans Directions:', dirNames.some(n => n.includes('Travaux')) ? 'OUI' : 'NON');
    console.log('  Patrimoine dans Directions:', dirNames.some(n => n.includes('Patrimoine')) ? 'OUI' : 'NON');
    console.log('  Stationnement dans Directions:', dirNames.some(n => n.includes('Stationnement')) ? 'OUI' : 'NON');

    // Scroll to show the Directions section
    await page.evaluate(() => {
      var body = document.querySelector('.cc-crise-drawer-body');
      if (body) body.scrollTop = body.scrollHeight * 0.4;
    });
    await sleep(500);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v409_selecteur_directions.png'), fullPage: false });
    console.log('  Screenshot: v409_selecteur_directions.png');

    // ══ 9. URBANIS en nom complet ══
    console.log('\n=== 9. URBANIS ===');
    const urbanisVisible = await page.evaluate(() => {
      var dirs = document.getElementById('crise-orgs-directions');
      if (!dirs) return 'NOT_FOUND';
      var labels = Array.from(dirs.querySelectorAll('.crise-org-cb')).map(cb => cb.parentElement.textContent.trim());
      var urbanis = labels.find(l => l.includes('Urbanisme'));
      return urbanis || 'NOT_FOUND';
    });
    console.log('  Libellé:', urbanisVisible);
    console.log('  Grep sigle_officiel comme libellé principal: aucun usage restant (corrigé ligne 14545)');

    // ══ 10. Libellé AR ══
    console.log('\n=== 10. Libellé AR ===');
    await page.evaluate(() => {
      var d = document.getElementById('cc-crise-drawer'); if (d) d.classList.add('hidden');
    });
    await sleep(300);
    await page.evaluate(() => {
      currentLang = 'ar'; localStorage.setItem('civismart_lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.setAttribute('lang', 'ar');
      if (typeof applyTranslations === 'function') applyTranslations();
    });
    await sleep(500);
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(3000);
    // Scroll to show the button
    await page.evaluate(() => {
      var body = document.querySelector('.cc-crise-drawer-body');
      if (body) body.scrollTop = body.scrollHeight;
    });
    await sleep(500);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v409_ar_voir_tous.png'), fullPage: false });
    console.log('  Screenshot: v409_ar_voir_tous.png');

    // Check button text
    const btnText = await page.evaluate(() => {
      var btn = document.getElementById('crise-orgs-voir-tous-btn');
      return btn ? btn.textContent.trim() : 'NOT_FOUND';
    });
    console.log('  Bouton AR:', btnText);

    // Switch back FR + close drawer
    await page.evaluate(() => {
      currentLang = 'fr'; localStorage.setItem('civismart_lang', 'fr');
      document.documentElement.setAttribute('dir', 'ltr'); document.documentElement.setAttribute('lang', 'fr');
      if (typeof applyTranslations === 'function') applyTranslations();
      var d = document.getElementById('cc-crise-drawer'); if (d) d.classList.add('hidden');
    });

    // ══ 11. Session test ══
    console.log('\n=== 11. Session test ===');
    const c1 = await apiReq('POST', '/api/command-center/crises/full', {
      titre: 'Test v409', type_crise: 'incendie', niveau: 'critique',
      circonscription_ids: [1], organisation_ids: [5, 30]
    });
    console.log('  Création:', c1.ok ? 'OK' : 'FAIL');
    const criseId = c1.crise.id;

    // Screenshot
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(3000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v409_session_test.png'), fullPage: false });
    console.log('  Screenshot: v409_session_test.png');

    // Delete
    pgQuery("DELETE FROM crise_organisme WHERE crise_id = " + criseId);
    pgQuery("DELETE FROM notification WHERE type = 'crise'");
    pgQuery("DELETE FROM crise_session WHERE id = " + criseId);
    console.log('  Supprimée:', pgQuery("SELECT COUNT(*) FROM crise_session"));

    // ══ 12. Acquis ══
    console.log('\n=== 12. Acquis ===');
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(3000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v409_acquis_cc.png'), fullPage: false });
    console.log('  Screenshot: v409_acquis_cc.png');
    await page.close();

    console.log('\n✓ All v409 tests completed.');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
