/**
 * Recette visuelle automatisée — 10 profils × 2 devices × FR + AR
 * Captures PNG + contrôles (console errors, API errors, overflow, z-index, i18n brutes)
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3055';
const OUT_DIR = path.join(__dirname, '20260709_1418');
const PROFILES = [
  { name: 'Amina',  tel: '0550000001', pwd: 'admin1234', views: ['home','signaler','mes-signalements','communiques','carte','profil'] },
  { name: 'Youcef', tel: '0550000002', pwd: 'admin1234', views: ['bo-agent','profil'] },
  { name: 'Rachid', tel: '0550000003', pwd: 'admin1234', views: ['bo-executive','rapports','annuaire','admin-communiques','profil'] },
  { name: 'Mourad', tel: '0550000004', pwd: 'admin1234', views: ['bo-executive','rapports','admin-communiques','profil'] },
  { name: 'Karim',  tel: '0550000007', pwd: 'admin1234', views: ['bo-cap','profil'] },
  { name: 'Nassim', tel: '0550000005', pwd: 'admin1234', views: ['bo-agent','profil'] },
  { name: 'Nadia',  tel: '0550000006', pwd: 'admin1234', views: ['bo-agent','profil'] },
  { name: 'Farid',  tel: '0550000010', pwd: 'admin1234', views: ['bo-agent','profil'] },
  { name: 'Khaled', tel: '0550000008', pwd: 'admin1234', views: ['civipark','profil'] },
  { name: 'Samira', tel: '0550000009', pwd: 'admin1234', views: ['patrimoine','profil'] },
];
const DEVICES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
];
// AR test on main screens only
const AR_VIEWS = { 'Amina': ['home','signaler'], 'Rachid': ['bo-executive'], 'Mourad': ['bo-executive'], 'Youcef': ['bo-agent'] };

const anomalies = [];

async function login(page, tel, pwd) {
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));
  // Fill login form
  await page.waitForSelector('#login-tel', { visible: true, timeout: 10000 });
  await page.evaluate(() => {
    document.getElementById('login-tel').value = '';
    document.getElementById('login-mdp').value = '';
  });
  await page.type('#login-tel', tel, { delay: 30 });
  await page.type('#login-mdp', pwd, { delay: 30 });
  await new Promise(r => setTimeout(r, 300));
  await page.click('#login-btn');
  await page.waitForFunction(() => {
    const app = document.getElementById('app');
    return app && getComputedStyle(app).display !== 'none';
  }, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
}

async function switchLang(page, lang) {
  await page.evaluate((l) => {
    if (typeof setLanguage === 'function') setLanguage(l);
  }, lang);
  await new Promise(r => setTimeout(r, 800));
}

async function navigateTo(page, viewName) {
  await page.evaluate((v) => {
    if (typeof showView === 'function') showView(v);
  }, viewName);
  await new Promise(r => setTimeout(r, 3000)); // let data load + avoid 429
}

async function collectIssues(page, profile, view, device, lang) {
  const issues = [];

  // 1. Console errors
  // (collected via page event listener below)

  // 2. Overflow check
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  if (overflow) issues.push({ type: 'GÊNANT', desc: 'Débordement horizontal détecté' });

  // 3. Raw i18n keys visible
  const rawKeys = await page.evaluate(() => {
    const text = document.body.innerText;
    const matches = text.match(/\b(sup|bo|home|sidebar|auth|cap|nav|menu|mod|edeval|signaler|communiques|rdv|participe|legal|wilaya|param|footer|comm)\.\w+/g);
    return matches ? [...new Set(matches)].slice(0, 5) : [];
  });
  if (rawKeys.length) issues.push({ type: 'GÊNANT', desc: 'Clés i18n brutes: ' + rawKeys.join(', ') });

  // 4. Check for elements with z-index issues (dropdown under map)
  const zIssue = await page.evaluate(() => {
    const dd = document.getElementById('user-dropdown');
    if (!dd) return false;
    const ddZ = parseInt(getComputedStyle(dd).zIndex) || 0;
    // Check if any map canvas/container has higher z-index
    const maps = document.querySelectorAll('.leaflet-pane');
    for (const m of maps) {
      const mZ = parseInt(getComputedStyle(m).zIndex) || 0;
      if (mZ >= ddZ) return true;
    }
    return false;
  });
  if (zIssue) issues.push({ type: 'BLOQUANT', desc: 'Menu avatar sous la carte (z-index)' });

  // 5. Check navbar z-index
  const navbarZ = await page.evaluate(() => {
    const nav = document.querySelector('.navbar');
    return nav ? parseInt(getComputedStyle(nav).zIndex) || 0 : 0;
  });
  if (navbarZ < 1000) issues.push({ type: 'BLOQUANT', desc: 'Navbar z-index trop bas: ' + navbarZ });

  return issues;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const results = [];
  let totalCaptures = 0;

  for (const profile of PROFILES) {
    for (const device of DEVICES) {
      // Fresh incognito context per profile+device (isolated localStorage/cookies)
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: device.width, height: device.height });

      // Collect console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text().substring(0, 120));
      });

      // Collect failed API calls
      const apiErrors = [];
      page.on('response', resp => {
        const url = resp.url();
        const status = resp.status();
        if (url.includes('/api/') && status >= 400 && status !== 401) {
          apiErrors.push(`${status} ${url.split('/api/')[1] || url}`);
        }
      });

      try {
        await login(page, profile.tel, profile.pwd);

        // FR views
        for (const view of profile.views) {
          consoleErrors.length = 0;
          apiErrors.length = 0;
          await navigateTo(page, view);

          const fname = `${profile.name}_${view}_${device.name}_fr.png`;
          await page.screenshot({ path: path.join(OUT_DIR, fname), fullPage: true });
          totalCaptures++;

          const issues = await collectIssues(page, profile.name, view, device.name, 'fr');
          if (consoleErrors.length) issues.push({ type: 'GÊNANT', desc: 'Console errors: ' + consoleErrors.slice(0,3).join(' | ') });
          if (apiErrors.length) issues.push({ type: 'GÊNANT', desc: 'API errors: ' + apiErrors.slice(0,3).join(' | ') });

          results.push({
            profil: profile.name, ecran: view, device: device.name, lang: 'fr',
            anomalies: issues.length ? issues : [{ type: 'OK', desc: '—' }]
          });
        }

        // AR views (main screens only)
        const arViews = AR_VIEWS[profile.name];
        if (arViews) {
          await switchLang(page, 'ar');
          for (const view of arViews) {
            consoleErrors.length = 0;
            apiErrors.length = 0;
            await navigateTo(page, view);

            const fname = `${profile.name}_${view}_${device.name}_ar.png`;
            await page.screenshot({ path: path.join(OUT_DIR, fname), fullPage: true });
            totalCaptures++;

            const issues = await collectIssues(page, profile.name, view, device.name, 'ar');
            if (consoleErrors.length) issues.push({ type: 'GÊNANT', desc: 'Console errors: ' + consoleErrors.slice(0,3).join(' | ') });

            results.push({
              profil: profile.name, ecran: view, device: device.name, lang: 'ar',
              anomalies: issues.length ? issues : [{ type: 'OK', desc: '—' }]
            });
          }
          await switchLang(page, 'fr'); // reset
        }

      } catch (e) {
        results.push({
          profil: profile.name, ecran: 'LOGIN', device: device.name, lang: 'fr',
          anomalies: [{ type: 'BLOQUANT', desc: 'Échec login/navigation: ' + e.message.substring(0, 100) }]
        });
      }

      await page.close();
      await context.close();
    }
  }

  // Write results
  const reportPath = path.join(OUT_DIR, 'RAPPORT_RECETTE.txt');
  let report = '═══ RECETTE VISUELLE AUTOMATISÉE — ' + new Date().toISOString() + ' ═══\n';
  report += 'Captures: ' + totalCaptures + '\n\n';

  // Summary
  const bloquants = results.filter(r => r.anomalies.some(a => a.type === 'BLOQUANT'));
  const genants = results.filter(r => r.anomalies.some(a => a.type === 'GÊNANT'));
  const cosmetiques = results.filter(r => r.anomalies.some(a => a.type === 'COSMÉTIQUE'));
  report += `BLOQUANTS: ${bloquants.length} | GÊNANTS: ${genants.length} | COSMÉTIQUES: ${cosmetiques.length}\n\n`;

  report += 'PROFIL'.padEnd(10) + 'ÉCRAN'.padEnd(22) + 'DEVICE'.padEnd(9) + 'LANG'.padEnd(5) + 'STATUT'.padEnd(12) + 'ANOMALIE\n';
  report += '─'.repeat(120) + '\n';
  for (const r of results) {
    for (const a of r.anomalies) {
      report += r.profil.padEnd(10) + r.ecran.padEnd(22) + r.device.padEnd(9) + r.lang.padEnd(5) + a.type.padEnd(12) + a.desc + '\n';
    }
  }

  fs.writeFileSync(reportPath, report);
  console.log(report);

  await browser.close();
  process.exit(0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
