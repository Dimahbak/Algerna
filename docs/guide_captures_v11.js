/**
 * Captures V1.1 — corrige les 6 points du guide
 * - Géolocalisation simulée (Alger centre)
 * - Attente chargement polices complet
 * - Bonnes assignations EPIC
 * - Données démo nettoyées
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3055';
const OUT = path.join(__dirname, 'guide_captures');

async function freshLogin(browser, tel, w, h) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: w, height: h });

  // Simulate geolocation (Alger centre — Place des Martyrs)
  await page.setGeolocation({ latitude: 36.7753, longitude: 3.0588 });
  const cdp = await page.createCDPSession();
  await cdp.send('Browser.grantPermissions', {
    permissions: ['geolocation'],
    origin: BASE,
  });

  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.waitForSelector('#login-tel', { visible: true, timeout: 15000 });
  await page.evaluate(() => {
    document.getElementById('login-tel').value = '';
    document.getElementById('login-mdp').value = '';
  });
  await page.type('#login-tel', tel, { delay: 20 });
  await page.type('#login-mdp', 'admin1234', { delay: 20 });
  await page.click('#login-btn');
  await page.waitForFunction(() => {
    const a = document.getElementById('app');
    return a && getComputedStyle(a).display !== 'none';
  }, { timeout: 15000 });
  // Wait for fonts, icons and async content to fully render
  await new Promise(r => setTimeout(r, 4000));
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  return { page, ctx, cdp };
}

async function nav(page, view) {
  await page.evaluate((v) => { if (typeof showView === 'function') showView(v); }, view);
  await new Promise(r => setTimeout(r, 3000));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log('  ' + name);
}

(async () => {
  console.log('=== Guide V1.1 captures ===');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  // ── Citoyen mobile (Amina) — signaler with geoloc, home, accueil ──
  console.log('\n--- Citoyen (Amina) mobile ---');
  {
    const { page, ctx } = await freshLogin(browser, '0550000001', 390, 844);
    // Accueil
    await shot(page, 'citoyen_accueil.png');
    // Home
    await nav(page, 'home');
    await shot(page, 'citoyen_home.png');
    await page.evaluate(() => window.scrollTo(0, 600));
    await new Promise(r => setTimeout(r, 500));
    await shot(page, 'citoyen_home_scroll.png');
    // Signaler — with geolocation active
    await nav(page, 'signaler');
    await new Promise(r => setTimeout(r, 2000)); // Wait for map/geoloc
    await shot(page, 'citoyen_signaler.png');
    // Mes signalements
    await nav(page, 'mes-signalements');
    await shot(page, 'citoyen_mes-signalements.png');
    // Communiques
    await nav(page, 'communiques');
    await shot(page, 'citoyen_communiques.png');
    // Carte
    await nav(page, 'carte');
    await new Promise(r => setTimeout(r, 2000));
    await shot(page, 'citoyen_carte.png');
    // Infos
    await nav(page, 'infos');
    await shot(page, 'citoyen_infos.png');
    // Participe
    await nav(page, 'participe');
    await shot(page, 'citoyen_participe.png');
    // Sentinelle
    await nav(page, 'sentinelle');
    await shot(page, 'citoyen_sentinelle.png');
    // Profil
    await nav(page, 'profil');
    await shot(page, 'citoyen_profil.png');
    await ctx.close();
  }

  await new Promise(r => setTimeout(r, 3000));

  // ── EPIC Propreté = Nassim ──
  console.log('\n--- EPIC Propreté (Nassim) ---');
  {
    const { page, ctx } = await freshLogin(browser, '0550000005', 1440, 900);
    await shot(page, 'epic_proprete_bo-agent.png');
    await ctx.close();
  }

  await new Promise(r => setTimeout(r, 3000));

  // ── EPIC Eau = Farid ──
  console.log('\n--- EPIC Eau (Farid) ---');
  {
    const { page, ctx } = await freshLogin(browser, '0550000010', 1440, 900);
    await shot(page, 'epic_eau_bo-agent.png');
    await ctx.close();
  }

  await new Promise(r => setTimeout(r, 3000));

  // ── EPIC Voirie = Nadia ──
  console.log('\n--- EPIC Voirie (Nadia) ---');
  {
    const { page, ctx } = await freshLogin(browser, '0550000006', 1440, 900);
    await shot(page, 'epic_voirie_bo-agent.png');
    await ctx.close();
  }

  await new Promise(r => setTimeout(r, 3000));

  // ── Patrimoine = Samira (données nettoyées) ──
  console.log('\n--- Patrimoine (Samira) ---');
  {
    const { page, ctx } = await freshLogin(browser, '0550000009', 1440, 900);
    await shot(page, 'epic_patrimoine_patrimoine.png');
    await ctx.close();
  }

  await new Promise(r => setTimeout(r, 3000));

  // ── Login screens ──
  console.log('\n--- Login ---');
  {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));
    await shot(page, 'login_desktop.png');
    await ctx.close();
  }
  {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));
    await shot(page, 'login_mobile.png');
    await ctx.close();
  }

  await browser.close();
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log('\n=== Done: ' + files.length + ' captures total ===');
})();
