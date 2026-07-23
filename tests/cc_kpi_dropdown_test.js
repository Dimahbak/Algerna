#!/usr/bin/env node
/**
 * CC KPI Compact + Dropdown test
 * Tests: compact KPIs visible with map below without scroll,
 *        KPI click opens dropdown, second click closes,
 *        map filters on click, sidebar clean (no white residue)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const BASE = process.env.BASE_URL || 'https://civismart.pylcom.app';
const DOCS = path.join(__dirname, '..', 'docs');

async function login(browser, tel, mdp) {
  const page = await browser.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 20000 });
  await page.waitForSelector('#login-tel', { timeout: 8000 });
  await page.type('#login-tel', tel);
  await page.type('#login-mdp', mdp);
  await page.evaluate(() => document.getElementById('login-btn').click());
  await page.waitForSelector('.sidebar', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  return page;
}

function domClick(page, sel) {
  return page.evaluate(s => { var el = document.querySelector(s); if (el) el.click(); return !!el; }, sel);
}

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] });
  const results = [];
  function log(label, ok, detail) {
    results.push({ label, status: ok ? 'OUI' : 'NON', detail });
    console.log((ok ? '✅' : '❌') + ' ' + label + ' — ' + detail);
  }

  try {
    // ── Login Rachid ──
    const page = await login(browser, '0550000003', 'admin@@1234');

    // ── SIDEBAR ──
    const sidebar = await page.$('.sidebar');
    if (sidebar) {
      await sidebar.screenshot({ path: path.join(DOCS, 'cc_sidebar_rachid.png') });
      log('Sidebar Rachid', true, 'cc_sidebar_rachid.png');
    }
    const dividerGone = !(await page.$('#admin-divider'));
    log('admin-divider supprimé', dividerGone, dividerGone ? 'Absent du DOM' : 'ENCORE PRESENT');
    const logoLink = !!(await page.$('#sidebar-logo-block a'));
    log('Logo cliquable', logoLink, logoLink ? 'Lien trouvé' : 'Pas de lien');

    // ── Navigate CC ──
    await domClick(page, '[data-view="command-center"]');
    await new Promise(r => setTimeout(r, 3000));

    // ── A. COMPACT KPIs — 1366x768 ──
    await page.setViewport({ width: 1366, height: 768 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(DOCS, 'cc_palier4_1366x768.png'), fullPage: false });
    log('Capture 1366x768', true, 'cc_palier4_1366x768.png');

    const mapVis1366 = await page.evaluate(() => {
      var m = document.getElementById('cc-map');
      return m ? m.getBoundingClientRect().top < window.innerHeight : false;
    });
    log('Carte visible 1366x768', mapVis1366, mapVis1366 ? 'Top carte dans viewport' : 'Carte hors viewport');

    await page.setViewport({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(DOCS, 'cc_palier4_1440x900.png'), fullPage: false });
    log('Capture 1440x900', true, 'cc_palier4_1440x900.png');

    const mapVis1440 = await page.evaluate(() => {
      var m = document.getElementById('cc-map');
      return m ? m.getBoundingClientRect().top < window.innerHeight : false;
    });
    log('Carte visible 1440x900', mapVis1440, mapVis1440 ? 'Top carte dans viewport' : 'Carte hors viewport');

    // KPI compact metrics
    const kpi = await page.evaluate(() => {
      var g = document.getElementById('cc-kpis');
      var c = document.querySelectorAll('.cc-kpi-card');
      return { h: g ? Math.round(g.getBoundingClientRect().height) : 0, n: c.length, all: Array.from(c).every(x => x.classList.contains('cc-clickable')) };
    });
    log('KPI grid compact', kpi.h < 100, 'Hauteur=' + kpi.h + 'px');
    log('6 KPI cards', kpi.n === 6, kpi.n + ' cards');
    log('Tous cliquables', kpi.all, kpi.all ? '6/6' : 'NON');

    // ── B. CLICK SLA → dropdown ──
    await domClick(page, '.cc-kpi-card[data-kpi="sla"]');
    await new Promise(r => setTimeout(r, 800));
    const slaOpen = await page.evaluate(() => {
      var dd = document.getElementById('cc-kpi-dropdown');
      return dd && dd.classList.contains('cc-dd-open');
    });
    log('Clic SLA → dropdown', slaOpen, slaOpen ? 'ouvert' : 'fermé');

    const slaRows = await page.evaluate(() => document.querySelectorAll('#cc-kpi-dropdown .cc-kpi-dd-row').length);
    log('SLA lignes', slaRows > 0, slaRows + ' dossier(s)');
    await page.screenshot({ path: path.join(DOCS, 'cc_kpi_sla_dropdown.png'), fullPage: false });
    log('Capture SLA dropdown', true, 'cc_kpi_sla_dropdown.png');

    // Click dossier → drawer
    const ref = await page.evaluate(() => {
      var row = document.querySelector('#cc-kpi-dropdown .cc-kpi-dd-row');
      if (row) { row.click(); return (row.querySelector('.cc-kpi-dd-ref') || {}).textContent || 'ref'; }
      return null;
    });
    if (ref) {
      await new Promise(r => setTimeout(r, 2000));
      const drawer = await page.evaluate(() => {
        var d = document.getElementById('bo-drawer');
        return d && !d.classList.contains('hidden') && d.offsetHeight > 0;
      });
      log('Clic dossier → drawer', drawer, drawer ? ref + ' ouvert' : 'drawer invisible');
      await page.evaluate(() => {
        var d = document.getElementById('bo-drawer');
        if (d) d.classList.add('hidden');
      });
      await new Promise(r => setTimeout(r, 300));
    }

    // Second click SLA → close
    await domClick(page, '.cc-kpi-card[data-kpi="sla"]');
    await new Promise(r => setTimeout(r, 500));
    const slaClosed = await page.evaluate(() => {
      var dd = document.getElementById('cc-kpi-dropdown');
      return !dd || !dd.classList.contains('cc-dd-open');
    });
    log('Second clic SLA → replié', slaClosed, slaClosed ? 'fermé' : 'encore ouvert');

    // ── C. CLICK Score → composantes ──
    await domClick(page, '.cc-kpi-card[data-kpi="score"]');
    await new Promise(r => setTimeout(r, 800));
    const scoreTbl = await page.evaluate(() => {
      var t = document.querySelector('#cc-kpi-dropdown .cc-score-table');
      return t ? t.querySelectorAll('tr').length : 0;
    });
    log('Clic Score → composantes', scoreTbl >= 6, scoreTbl + ' lignes');
    await page.screenshot({ path: path.join(DOCS, 'cc_kpi_score_detail.png'), fullPage: false });
    log('Capture Score détail', true, 'cc_kpi_score_detail.png');

    // Close via ✕
    await domClick(page, '.cc-kpi-dd-close');
    await new Promise(r => setTimeout(r, 500));
    const closedX = await page.evaluate(() => {
      var dd = document.getElementById('cc-kpi-dropdown');
      return !dd || !dd.classList.contains('cc-dd-open');
    });
    log('✕ → replié', closedX, closedX ? 'fermé' : 'encore ouvert');

    // ── D. CLICK Organismes → liste ──
    await domClick(page, '.cc-kpi-card[data-kpi="orgs"]');
    await new Promise(r => setTimeout(r, 800));
    const orgRows = await page.evaluate(() => document.querySelectorAll('#cc-kpi-dropdown .cc-kpi-dd-row').length);
    log('Clic Organismes → liste', orgRows > 0, orgRows + ' entrée(s)');
    await page.screenshot({ path: path.join(DOCS, 'cc_kpi_orgs_dropdown.png'), fullPage: false });
    await domClick(page, '.cc-kpi-card[data-kpi="orgs"]');
    await new Promise(r => setTimeout(r, 300));

    // ── E. Map restored ──
    const mapFilt = await page.evaluate(() => {
      var b = document.querySelector('.cc-filter-btn.active');
      return b ? b.dataset.filter : null;
    });
    log('Carte restaurée', mapFilt === 'all', 'filtre=' + mapFilt);

    // ── F. AR mode ──
    await page.evaluate(() => setLang('ar'));
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(DOCS, 'cc_palier4_ar.png'), fullPage: false });
    log('Capture AR', true, 'cc_palier4_ar.png');

    await domClick(page, '.cc-kpi-card[data-kpi="score"]');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(DOCS, 'cc_kpi_score_ar.png'), fullPage: false });
    log('Capture Score AR', true, 'cc_kpi_score_ar.png');
    await domClick(page, '.cc-kpi-dd-close');

    await page.evaluate(() => setLang('fr'));
    await new Promise(r => setTimeout(r, 500));
    await page.close();

    // ── G. Sidebar 4 profiles ──
    for (const prof of [
      { tel: '0550000006', mdp: 'admin@@1234', name: 'Youcef' },
      { tel: '0550000005', mdp: 'admin@@1234', name: 'Nassim' },
      { tel: '0550000001', mdp: 'admin1234',   name: 'Amina' }
    ]) {
      const pg = await login(browser, prof.tel, prof.mdp);
      const sb = await pg.$('.sidebar');
      if (sb) {
        await sb.screenshot({ path: path.join(DOCS, 'cc_sidebar_' + prof.name.toLowerCase() + '.png') });
        log('Sidebar ' + prof.name, true, 'cc_sidebar_' + prof.name.toLowerCase() + '.png');
      }
      const div = await pg.$('#admin-divider');
      log('admin-divider absent ' + prof.name, !div, div ? 'PRESENT' : 'Absent');
      await pg.close();
    }

    // ── H. Board counts ──
    const pg5 = await login(browser, '0550000003', 'admin@@1234');
    const total = await pg5.evaluate(async () => {
      var t = localStorage.getItem('civismart_token');
      var r = await fetch('/api/signaler/board', { headers: { Authorization: 'Bearer ' + t } });
      var d = await r.json();
      return Array.isArray(d) ? d.length : -1;
    });
    log('Total signalements', total === 122, 'total=' + total + ' (attendu=122)');
    await pg5.close();

  } catch (e) {
    console.error('TEST ERROR:', e.message);
    log('Erreur test', false, e.message);
  } finally {
    await browser.close();
  }

  console.log('\n═══ RÉSUMÉ ═══');
  results.forEach(r => console.log(r.status + ' | ' + r.label + ' | ' + r.detail));
  var fails = results.filter(r => r.status === 'NON');
  console.log('\n' + (results.length - fails.length) + '/' + results.length + ' OK');
  if (fails.length) { console.log('ÉCHECS:'); fails.forEach(f => console.log('  ❌ ' + f.label + ': ' + f.detail)); }
  process.exit(fails.length ? 1 : 0);
}
run();
