#!/usr/bin/env node
/**
 * CC Real Notifications test — headless
 * 1. Rachid relance dossier Propreté → Nassim reçoit notification
 * 2. Double relance → anti-spam
 * 3. Urgence Wali → Yacine (cabinet) reçoit notification
 * 4. Badge URGENCE sur priorités CC
 * 5. Nassim: cloche + clic notification → dossier
 */
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const { query } = require('../src/db/pool');
const BASE = process.env.BASE_URL || 'https://civismart.pylcom.app';
const DOCS = path.join(__dirname, '..', 'docs');

function apiPost(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: 'localhost', port: 3055, path, method: 'POST', headers
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => {
      try { resolve(JSON.parse(d)); } catch(e) { reject(new Error('Parse: ' + d.substring(0, 100))); }
    }); });
    req.on('error', reject); req.write(data); req.end();
  });
}

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
function domClick(p, s) { return p.evaluate(sel => { var el = document.querySelector(sel); if (el) el.click(); return !!el; }, s); }

const NASSIM_ID = '55c0591b-aeda-4d21-8c82-aa0a48b63643';
const YACINE_ID = 'ca437243-26cf-4d01-887c-f5d0d79b8bf3';
const DOSSIER_ID = 'febfefa7-498d-4ac9-8d06-4cb8f9188c08'; // PRO-K0K3S31B org=5 Propreté

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] });
  const results = [];
  function log(label, ok, detail) {
    results.push({ label, status: ok ? 'OUI' : 'NON', detail });
    console.log((ok ? '✅' : '❌') + ' ' + label + ' — ' + detail);
  }

  try {
    // ── SETUP: clear notifs + old historique spam entries ──
    await query('DELETE FROM notification WHERE utilisateur_id IN ($1, $2)', [NASSIM_ID, YACINE_ID]);
    await query("DELETE FROM signalement_historique WHERE action IN ('relance_service','urgence_wali') AND signalement_id=$1 AND par_utilisateur IN (SELECT id FROM utilisateur WHERE telephone='0550000003')", [DOSSIER_ID]);
    // Reset gravite to non-urgence
    await query("UPDATE signalement SET gravite='degradation' WHERE id=$1", [DOSSIER_ID]);

    // ── 1. Rachid: get token via API ──
    const { token: rachidToken } = await apiPost('/auth/login', { telephone: '0550000003', motDePasse: 'admin@@1234' });

    // ── 2. RELANCE via API ──
    const relRes = await apiPost('/api/signaler/board/' + DOSSIER_ID + '/commentaire',
      { commentaire: 'Relance commandement — vérification notification', type: 'relance' }, rachidToken);
    log('Relance envoyée', relRes.ok && !relRes.spam, 'spam=' + !!relRes.spam);

    // Check Nassim notification
    const { rows: nassimNotifs } = await query('SELECT titre, lien FROM notification WHERE utilisateur_id=$1', [NASSIM_ID]);
    log('Nassim notification créée', nassimNotifs.length > 0, nassimNotifs.length + ' notif(s)' + (nassimNotifs[0] ? ': ' + nassimNotifs[0].titre : ''));
    const hasRelance = nassimNotifs.some(n => n.titre.includes('Relance') && n.titre.includes('PRO-K0K3S31B'));
    log('Libellé Relance correct', hasRelance, nassimNotifs[0] ? nassimNotifs[0].titre : '—');

    // ── 3. DOUBLE RELANCE (anti-spam) ──
    const spamRes = await apiPost('/api/signaler/board/' + DOSSIER_ID + '/commentaire',
      { commentaire: 'Double relance test', type: 'relance' }, rachidToken);
    log('Double relance → anti-spam', spamRes.spam === true, 'spam=' + spamRes.spam + ' agoMin=' + spamRes.agoMin);

    // Check no new notification
    const { rows: nassimNotifs2 } = await query('SELECT COUNT(*)::int AS n FROM notification WHERE utilisateur_id=$1', [NASSIM_ID]);
    log('Pas de nouvelle notification spam', nassimNotifs2[0].n === nassimNotifs.length, 'count=' + nassimNotifs2[0].n + ' (attendu=' + nassimNotifs.length + ')');

    // ── 4. URGENCE WALI via API ──
    const urgRes = await apiPost('/api/signaler/board/' + DOSSIER_ID + '/commentaire',
      { commentaire: 'Situation critique — test urgence wali', type: 'urgence_wali' }, rachidToken);
    log('Urgence Wali envoyée', urgRes.ok && !urgRes.spam, 'ok=' + urgRes.ok);

    // Check Yacine notification
    const { rows: yacineNotifs } = await query('SELECT titre, lien FROM notification WHERE utilisateur_id=$1', [YACINE_ID]);
    log('Yacine notification créée', yacineNotifs.length > 0, yacineNotifs.length + ' notif(s)' + (yacineNotifs[0] ? ': ' + yacineNotifs[0].titre : ''));
    const hasUrgence = yacineNotifs.some(n => n.titre.includes('Urgence'));
    log('Libellé Urgence correct', hasUrgence, yacineNotifs[0] ? yacineNotifs[0].titre : '—');

    // Check gravite updated to danger_immediat
    const { rows: grav } = await query('SELECT gravite FROM signalement WHERE id=$1', [DOSSIER_ID]);
    log('Dossier marqué danger_immediat', grav[0] && grav[0].gravite === 'danger_immediat', 'gravite=' + (grav[0] ? grav[0].gravite : '?'));

    // ── 5. HEADLESS: Nassim → cloche + badge ──
    const nassimPage = await login(browser, '0550000007', 'admin@@1234');
    // Force badge reload and wait
    await nassimPage.evaluate(() => { if (typeof loadNotifBadge === 'function') loadNotifBadge(); });
    await new Promise(r => setTimeout(r, 2000));
    const nassimBadge = await nassimPage.evaluate(() => {
      var b = document.getElementById('notif-badge');
      return b ? { visible: b.style.display !== 'none', count: b.textContent.trim() } : null;
    });
    log('Nassim cloche badge visible', nassimBadge && nassimBadge.visible && parseInt(nassimBadge.count) > 0,
      nassimBadge ? 'count=' + nassimBadge.count : 'absent');

    // Screenshot Nassim sidebar with badge
    await nassimPage.screenshot({ path: path.join(DOCS, 'cc_notif_nassim_badge.png'), fullPage: false });

    // Navigate to notifications
    await nassimPage.evaluate(() => showView('notifications'));
    await new Promise(r => setTimeout(r, 1500));
    await nassimPage.screenshot({ path: path.join(DOCS, 'cc_notif_nassim_liste.png'), fullPage: false });
    log('Capture Nassim notifications', true, 'cc_notif_nassim_liste.png');

    // Click notification → opens dossier
    const notifClicked = await nassimPage.evaluate(() => {
      var el = document.querySelector('[onclick*="notifClick"]');
      if (el) { el.click(); return el.textContent.substring(0, 60); }
      return null;
    });
    if (notifClicked) {
      await new Promise(r => setTimeout(r, 2500));
      const drawerOpen = await nassimPage.evaluate(() => {
        var d = document.getElementById('bo-drawer');
        return d && !d.classList.contains('hidden') && d.offsetHeight > 0;
      });
      log('Clic notification Nassim → dossier', drawerOpen, drawerOpen ? 'drawer ouvert' : 'pas ouvert');
      if (drawerOpen) {
        await nassimPage.screenshot({ path: path.join(DOCS, 'cc_notif_nassim_dossier.png'), fullPage: false });
      }
    }
    await nassimPage.close();

    // ── 6. Yacine → cloche urgence (verify via API since UI may differ for cabinet) ──
    const { rows: yacineCount } = await query('SELECT COUNT(*)::int AS n FROM notification WHERE utilisateur_id=$1 AND lu=FALSE', [YACINE_ID]);
    log('Yacine notifications non-lues', yacineCount[0].n > 0, 'count=' + yacineCount[0].n);

    const yacinePage = await login(browser, '0550000006', 'admin@@1234');
    await yacinePage.evaluate(() => { if (typeof loadNotifBadge === 'function') loadNotifBadge(); });
    await new Promise(r => setTimeout(r, 2000));
    const yacineBadge = await yacinePage.evaluate(async () => {
      // Force fetch badge via API
      try {
        var t = localStorage.getItem('civismart_token');
        var r = await fetch('/api/notifications/count', { headers: { Authorization: 'Bearer ' + t } });
        var d = await r.json();
        return { api_unread: d.unread };
      } catch(e) { return { error: e.message }; }
    });
    log('Yacine badge API', yacineBadge && yacineBadge.api_unread > 0,
      yacineBadge ? 'api_unread=' + yacineBadge.api_unread : 'erreur');
    await yacinePage.screenshot({ path: path.join(DOCS, 'cc_notif_yacine_urgence.png'), fullPage: false });
    log('Capture Yacine', true, 'cc_notif_yacine_urgence.png');
    await yacinePage.close();

    // ── 7. HEADLESS: Rachid CC → badge URGENCE sur priorités ──
    const rachidPage = await login(browser, '0550000003', 'admin@@1234');
    await domClick(rachidPage, '[data-view="command-center"]');
    await new Promise(r => setTimeout(r, 5000)); // Wait for CC overview to load
    await rachidPage.setViewport({ width: 1440, height: 900 });

    const urgBadge = await rachidPage.evaluate(() => {
      var rows = document.querySelectorAll('.cc-priority-row');
      var found = false;
      rows.forEach(r => { if (r.innerHTML.includes('URGENCE')) found = true; });
      return found;
    });
    log('Badge URGENCE sur priorités CC', urgBadge, urgBadge ? 'visible' : 'absent');
    await rachidPage.screenshot({ path: path.join(DOCS, 'cc_notif_urgence_badge_cc.png'), fullPage: false });
    log('Capture badge urgence CC', true, 'cc_notif_urgence_badge_cc.png');

    // ── 8. AR captures ──
    await rachidPage.evaluate(() => setLang('ar'));
    await new Promise(r => setTimeout(r, 1500));
    await rachidPage.screenshot({ path: path.join(DOCS, 'cc_notif_ar.png'), fullPage: false });
    log('Capture AR', true, 'cc_notif_ar.png');
    await rachidPage.evaluate(() => setLang('fr'));

    // ── 9. Board total via API (not page context) ──
    const { rows: boardCount } = await query("SELECT COUNT(*)::int AS n FROM signalement WHERE etat NOT IN ('clos','rejete')");
    const totalActive = boardCount[0].n;
    const { rows: boardAll } = await query("SELECT COUNT(*)::int AS n FROM signalement");
    log('Total signalements', boardAll[0].n === 122, 'total=' + boardAll[0].n + ' actifs=' + totalActive);
    await rachidPage.close();

  } catch (e) {
    console.error('TEST ERROR:', e.message);
    log('Erreur test', false, e.message);
  } finally {
    await browser.close();
    // Cleanup: reset gravite
    try { await query("UPDATE signalement SET gravite='degradation' WHERE id=$1", [DOSSIER_ID]); } catch(e) {}
    process.exit(results.some(r => r.status === 'NON') ? 1 : 0);
  }

  console.log('\n═══ RÉSUMÉ ═══');
  results.forEach(r => console.log(r.status + ' | ' + r.label + ' | ' + r.detail));
  var fails = results.filter(r => r.status === 'NON');
  console.log('\n' + (results.length - fails.length) + '/' + results.length + ' OK');
  if (fails.length) { console.log('ÉCHECS:'); fails.forEach(f => console.log('  ❌ ' + f.label + ': ' + f.detail)); }
}
run();
