/**
 * Capture d'écrans pour le Guide d'utilisation ALGERNA
 * Génère des screenshots réels via Puppeteer pour chaque rôle/vue
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3055';
const OUT = path.join(__dirname, 'guide_captures');

// All roles and their key views
const CAPTURES = [
  // (A) Commun — login, navigation
  { name: 'login_desktop', tel: null, views: ['__login__'], w: 1440, h: 900 },
  { name: 'login_mobile', tel: null, views: ['__login__'], w: 390, h: 844 },

  // (B1) Citoyen — Amina — mobile
  { name: 'citoyen', tel: '0550000001', views: ['home', 'signaler', 'mes-signalements', 'communiques', 'carte', 'infos', 'participe', 'sentinelle', 'profil'], w: 390, h: 844 },

  // (B2) Agent de réception — Youcef — desktop
  { name: 'agent', tel: '0550000002', views: ['bo-agent'], w: 1440, h: 900 },

  // (B3) Superviseur Wilaya — Rachid — desktop
  { name: 'sup_wilaya', tel: '0550000003', views: ['bo-executive', 'rapports', 'annuaire', 'admin-communiques'], w: 1440, h: 900 },

  // (B4) Superviseur Commune — Mourad — desktop
  { name: 'sup_commune', tel: '0550000004', views: ['bo-executive', 'rapports', 'admin-communiques'], w: 1440, h: 900 },

  // (B5) Agent CAP — Karim — desktop
  { name: 'cap', tel: '0550000007', views: ['bo-cap'], w: 1440, h: 900 },

  // (B6) EPIC Eau — Nassim — desktop
  { name: 'epic_eau', tel: '0550000005', views: ['bo-agent'], w: 1440, h: 900 },

  // (B7) EPIC Propreté — Nadia — desktop
  { name: 'epic_proprete', tel: '0550000006', views: ['bo-agent'], w: 1440, h: 900 },

  // (B8) EPIC Parkings — Khaled — desktop
  { name: 'epic_parkings', tel: '0550000008', views: ['civipark'], w: 1440, h: 900 },

  // (B9) EPIC Patrimoine — Samira — desktop
  { name: 'epic_patrimoine', tel: '0550000009', views: ['patrimoine'], w: 1440, h: 900 },

  // (B10) EPIC Voirie — Farid — desktop
  { name: 'epic_voirie', tel: '0550000010', views: ['bo-agent'], w: 1440, h: 900 },

  // (B11) Cabinet CCOE — Yacine — desktop
  { name: 'cabinet', tel: '0550000011', views: ['ccoe'], w: 1440, h: 900 },
];

async function login(page, tel) {
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.waitForSelector('#login-tel', { visible: true, timeout: 15000 });
  await page.evaluate(() => {
    document.getElementById('login-tel').value = '';
    document.getElementById('login-mdp').value = '';
  });
  await page.type('#login-tel', tel, { delay: 20 });
  await page.type('#login-mdp', 'admin1234', { delay: 20 });
  await new Promise(r => setTimeout(r, 200));
  await page.click('#login-btn');
  await page.waitForFunction(() => {
    const app = document.getElementById('app');
    return app && getComputedStyle(app).display !== 'none';
  }, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));
}

(async () => {
  console.log('=== Guide captures ===');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  for (const cap of CAPTURES) {
    console.log(`\n--- ${cap.name} (${cap.w}x${cap.h}) ---`);
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: cap.w, height: cap.h });

    try {
      if (!cap.tel) {
        // Login screen only
        await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUT, `${cap.name}.png`), fullPage: false });
        console.log(`  ${cap.name}.png`);
      } else {
        await login(page, cap.tel);

        // Capture hamburger open for mobile citoyen
        if (cap.w < 768 && cap.name === 'citoyen') {
          await page.screenshot({ path: path.join(OUT, `${cap.name}_accueil.png`), fullPage: false });
          console.log(`  ${cap.name}_accueil.png`);
        }

        for (const view of cap.views) {
          await page.evaluate((v) => {
            if (typeof showView === 'function') showView(v);
          }, view);
          await new Promise(r => setTimeout(r, 2500));

          // Scroll to top
          await page.evaluate(() => window.scrollTo(0, 0));
          await new Promise(r => setTimeout(r, 500));

          const fname = `${cap.name}_${view.replace(/[^a-z0-9-]/g, '_')}.png`;
          await page.screenshot({ path: path.join(OUT, fname), fullPage: false });
          console.log(`  ${fname}`);

          // For long pages, capture scrolled section too
          if (['bo-executive', 'home', 'bo-cap', 'ccoe'].includes(view)) {
            await page.evaluate(() => window.scrollTo(0, 800));
            await new Promise(r => setTimeout(r, 500));
            const fname2 = `${cap.name}_${view.replace(/[^a-z0-9-]/g, '_')}_scroll.png`;
            await page.screenshot({ path: path.join(OUT, fname2), fullPage: false });
            console.log(`  ${fname2}`);
          }
        }
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
    }

    await ctx.close();
    // Pause between profiles to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log(`\n=== Done: ${files.length} captures in ${OUT} ===`);
})();
