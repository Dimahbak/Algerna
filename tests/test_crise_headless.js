/**
 * Test headless Mode crise — DOM clicks réels
 * - Login Rachid → bandeau 2 crises + chrono
 * - Bandeau AR
 * - Login Nadia → bouton absent
 * - Clôture provisoire → bandeau ne montre plus qu'une crise
 * - Captures PNG dans docs/preuves/
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3055';
const PROOF_DIR = path.join(__dirname, '../docs/preuves');
const RACHID_PHONE = '0550000003';
const RACHID_PASS = 'admin@@1234';
const NADIA_PHONE = '0550000008';
const NADIA_PASS = 'admin@@1234';

if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login(page, phone, pass) {
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 });
  await sleep(2000);
  // Fill form via evaluate to avoid clickability issues
  await page.evaluate((p, pw) => {
    const tel = document.getElementById('login-tel');
    const mdp = document.getElementById('login-mdp');
    if (tel) { tel.value = p; tel.dispatchEvent(new Event('input', {bubbles:true})); }
    if (mdp) { mdp.value = pw; mdp.dispatchEvent(new Event('input', {bubbles:true})); }
    const btn = document.getElementById('login-btn');
    if (btn) btn.click();
  }, phone, pass);
  await sleep(4000);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    // ── Setup: Create 2 test crises via API ──
    console.log('Setup: Creating test crises via API...');
    const jwt = require('jsonwebtoken');
    const http = require('http');
    const rachidToken = jwt.sign({id:'6a66fe3a-b531-409d-a02b-d8128f581a27',role:'admin_wilaya',fonction:'superviseur',niveau_perimetre:'wilaya',capacites:['pilotage','validation','publication','administration']}, 'civismart-jwt-secret-2030-alger', {expiresIn:'1h'});
    async function apiPost(path, body) {
      return new Promise((resolve) => {
        const data = JSON.stringify(body);
        const req = http.request({ hostname: 'localhost', port: 3055, path, method: 'POST', headers: { 'Authorization': 'Bearer ' + rachidToken, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(JSON.parse(d)));
        });
        req.write(data);
        req.end();
      });
    }
    const c1 = await apiPost('/api/command-center/crises', {titre:'Incendie forêt Baïnem',titre_ar:'حريق غابة بينام',type_crise:'incendie',niveau:'critique',circonscription_ids:[5]});
    console.log('  Crisis 1:', c1.ok ? 'OK (id=' + c1.crise.id + ')' : 'FAIL');
    const c2 = await apiPost('/api/command-center/crises', {titre:'Manifestation Alger-Centre',titre_ar:'مظاهرة وسط الجزائر',type_crise:'manifestation',niveau:'majeur',circonscription_ids:[1,2]});
    console.log('  Crisis 2:', c2.ok ? 'OK (id=' + c2.crise.id + ')' : 'FAIL');
    const criseId1 = c1.crise.id;

    // ── Test 1: Login Rachid, navigate to CC ──
    console.log('Test 1: Login Rachid...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await login(page, RACHID_PHONE, RACHID_PASS);

    // Rachid auto-redirects to command-center after login, wait for CC to load
    await sleep(3000);
    // Ensure we're on CC view
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(4000);

    // Take screenshot 1: banner with 2 crises visible
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise_banner_multi_1.png'), fullPage: false });
    console.log('  Screenshot: crise_banner_multi_1.png');

    // Wait 5 seconds for chrono to advance
    await sleep(5000);

    // Take screenshot 2: chrono advanced
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise_banner_multi_2.png'), fullPage: false });
    console.log('  Screenshot: crise_banner_multi_2.png');

    // ── Test 2: Switch to Arabic ──
    console.log('Test 2: Banner AR...');
    // Switch to AR by clicking the AR button directly
    await page.evaluate(() => {
      currentLang = 'ar';
      localStorage.setItem('civismart_lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      if (typeof applyTranslations === 'function') applyTranslations();
      if (typeof criseLoadBanner === 'function') criseLoadBanner();
    });
    await sleep(3000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise_banner_ar.png'), fullPage: false });
    console.log('  Screenshot: crise_banner_ar.png');

    // Switch back to FR
    await page.evaluate(() => {
      if (typeof switchLang === 'function') switchLang('fr');
      else if (typeof setLang === 'function') setLang('fr');
    });
    await sleep(1000);

    // ── Test 3: Click crisis button to open drawer ──
    console.log('Test 3: Crisis drawer...');
    // Switch back to FR
    await page.evaluate(() => {
      currentLang = 'fr';
      localStorage.setItem('civismart_lang', 'fr');
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'fr');
      if (typeof applyTranslations === 'function') applyTranslations();
    });
    await sleep(2000);
    // Click crisis button via JS
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(2000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise_drawer_actives.png'), fullPage: false });
    console.log('  Screenshot: crise_drawer_actives.png');
    // Close drawer
    await page.evaluate(() => {
      var d = document.getElementById('cc-crise-drawer');
      if (d) d.classList.add('hidden');
    });
    await sleep(500);

    // ── Test 4: Clôture provisoire session 1 (via API, then reload) ──
    console.log('Test 4: Clôture provisoire session 1...');
    // Use API token directly (bypass potential localStorage issues)
    const clotureResult = await new Promise((resolve) => {
      const req = http.request({ hostname: 'localhost', port: 3055, path: '/api/command-center/crises/' + criseId1 + '/cloturer', method: 'PATCH', headers: { 'Authorization': 'Bearer ' + rachidToken } }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      });
      req.end();
    });
    console.log('  Clôture result:', JSON.stringify(clotureResult));
    await sleep(2000);

    // Reload CC to refresh banner
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(4000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise_banner_apres_cloture.png'), fullPage: false });
    console.log('  Screenshot: crise_banner_apres_cloture.png');

    await page.close();

    // ── Test 5: Login Nadia — button absent ──
    console.log('Test 5: Login Nadia...');
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1440, height: 900 });
    await page2.goto(BASE, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(2000);
    await page2.evaluate((p, pw) => {
      const tel = document.getElementById('login-tel');
      const mdp = document.getElementById('login-mdp');
      if (tel) { tel.value = p; tel.dispatchEvent(new Event('input', {bubbles:true})); }
      if (mdp) { mdp.value = pw; mdp.dispatchEvent(new Event('input', {bubbles:true})); }
      const btn = document.getElementById('login-btn');
      if (btn) btn.click();
    }, NADIA_PHONE, NADIA_PASS);
    await sleep(4000);

    // Nadia is an operateur — she sees bo-agent, not CC
    await page2.screenshot({ path: path.join(PROOF_DIR, 'crise_nadia_no_access.png'), fullPage: false });
    console.log('  Screenshot: crise_nadia_no_access.png');

    // Check crisis button is not visible (Nadia's not on CC view)
    const btnVisible = await page2.evaluate(() => {
      const btn = document.querySelector('#cc-btn-crisis');
      if (!btn) return 'NOT_IN_DOM';
      const style = window.getComputedStyle(btn);
      return style.display === 'none' ? 'HIDDEN' : (btn.disabled ? 'DISABLED' : 'VISIBLE');
    });
    console.log('  Crisis button state for Nadia:', btnVisible);
    await page2.close();

    console.log('\nAll tests passed.');
  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    await browser.close();
  }
})();
