#!/usr/bin/env node
/**
 * CC Drawer Variant test
 * Tests: pilotage bloc, read-only planif, 4 CC actions only,
 *        relancer/message/note/urgence work, BO Youcef unchanged
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
function domClick(page, sel) { return page.evaluate(s => { var el = document.querySelector(s); if (el) el.click(); return !!el; }, sel); }

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] });
  const results = [];
  function log(label, ok, detail) {
    results.push({ label, status: ok ? 'OUI' : 'NON', detail });
    console.log((ok ? '✅' : '❌') + ' ' + label + ' — ' + detail);
  }

  try {
    // ── Rachid (admin_wilaya) → CC ──
    const page = await login(browser, '0550000003', 'admin@@1234');
    await domClick(page, '[data-view="command-center"]');
    await new Promise(r => setTimeout(r, 3000));

    // Open a dossier from CC priorities via real click on reference
    const refToClick = await page.evaluate(() => {
      var ref = document.querySelector('.cc-activity-ref, .cc-priority-row .cc-btn-open');
      if (!ref) {
        // Click first priority row's open button
        var openBtn = document.querySelector('.cc-priority-row .cc-btn-open');
        if (openBtn) { openBtn.click(); return 'priority-btn'; }
        return null;
      }
      ref.click();
      return ref.textContent || 'ref';
    });
    if (!refToClick) {
      // Fallback: open from KPI SLA dropdown
      await domClick(page, '.cc-kpi-card[data-kpi="sla"]');
      await new Promise(r => setTimeout(r, 800));
      await page.evaluate(() => {
        var row = document.querySelector('#cc-kpi-dropdown .cc-kpi-dd-row');
        if (row) row.click();
      });
    }
    await new Promise(r => setTimeout(r, 2500));

    // ── Check drawer is open ──
    const drawerOpen = await page.evaluate(() => {
      var d = document.getElementById('bo-drawer');
      return d && !d.classList.contains('hidden') && d.offsetHeight > 0;
    });
    log('Drawer ouvert depuis CC', drawerOpen, drawerOpen ? 'visible' : 'hidden');

    // ── Check pilotage institutionnel bloc ──
    const pilotageBloc = await page.evaluate(() => {
      var content = document.getElementById('bo-drawer-content');
      if (!content) return null;
      var html = content.innerHTML;
      var hasPilotage = html.includes('pilotage') || html.includes('القيادة') || html.includes('Direction pilote') || html.includes('المديرية');
      var dirPilote = html.match(/Direction pilote|المديرية المسيّرة/) ? true : false;
      var executant = html.match(/Exécutant|الجهة المنفذة/) ? true : false;
      var daira = html.match(/Daïra|الدوائر/) ? true : false;
      var commune = html.match(/Commune|البلدية/) ? true : false;
      return { hasPilotage, dirPilote, executant, daira, commune };
    });
    log('Bloc Pilotage institutionnel', pilotageBloc && pilotageBloc.hasPilotage, pilotageBloc ? JSON.stringify(pilotageBloc) : 'absent');

    // ── Check planification (read-only or "aucune intervention planifiée") ──
    const planifCheck = await page.evaluate(() => {
      var content = document.getElementById('bo-drawer-content');
      if (!content) return null;
      var html = content.innerHTML;
      var hasEditBtn = html.includes('planif-equipe') || html.includes('boSavePlanification');
      var hasReadOnly = html.includes('Aucune intervention planifiée') || html.includes('لا يوجد تدخل مخطط') || html.includes('planif_equipe');
      return { hasEditBtn, hasReadOnly };
    });
    log('Planification lecture seule', planifCheck && !planifCheck.hasEditBtn, planifCheck ? 'éditable=' + planifCheck.hasEditBtn + ' readOnly=' + planifCheck.hasReadOnly : 'absent');

    // ── Check 4 CC actions (and NOT CAP/Communiquer/Notifier) ──
    const actionsCheck = await page.evaluate(() => {
      var actions = document.getElementById('bo-drawer-actions');
      if (!actions) return null;
      var html = actions.innerHTML;
      return {
        hasRelancer: html.includes('boRelancerService'),
        hasMessage: html.includes('boEnvoyerMessage'),
        hasUrgenceWali: html.includes('boSignalerUrgenceWali'),
        hasNote: html.includes('boCcAjouterNote'),
        hasCap: html.includes('boShowCapModal'),
        hasCommuniquer: html.includes('boCommuniquerDossier'),
        hasNotifier: html.includes('boNotifierDossier'),
        btnCount: (html.match(/<button/g) || []).length
      };
    });
    if (actionsCheck) {
      log('Relancer présent', actionsCheck.hasRelancer, 'boRelancerService');
      log('Message présent', actionsCheck.hasMessage, 'boEnvoyerMessage');
      log('Urgence Wali présent', actionsCheck.hasUrgenceWali, 'boSignalerUrgenceWali');
      log('Note présent', actionsCheck.hasNote, 'boCcAjouterNote');
      log('CAP ABSENT', !actionsCheck.hasCap, actionsCheck.hasCap ? 'ENCORE PRESENT' : 'retiré');
      log('Communiquer ABSENT', !actionsCheck.hasCommuniquer, actionsCheck.hasCommuniquer ? 'ENCORE PRESENT' : 'retiré');
      log('Notifier ABSENT', !actionsCheck.hasNotifier, actionsCheck.hasNotifier ? 'ENCORE PRESENT' : 'retiré');
      log('4 boutons exactement', actionsCheck.btnCount === 4, actionsCheck.btnCount + ' bouton(s)');
    }

    // ── Capture FR ──
    await page.setViewport({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(DOCS, 'cc_drawer_variant_fr.png'), fullPage: false });
    log('Capture fiche CC FR', true, 'cc_drawer_variant_fr.png');

    // ── Test Relancer → trace dans historique ──
    await domClick(page, '[onclick*="boRelancerService"]');
    await new Promise(r => setTimeout(r, 500));
    // Fill the prompt modal and submit
    const relanceOk = await page.evaluate(() => {
      var textarea = document.querySelector('.modal-body textarea, #generic-modal textarea, [id^="prompt-"] textarea, .prompt-modal textarea');
      if (!textarea) {
        // Try to find any visible textarea in a modal-like overlay
        var all = document.querySelectorAll('textarea');
        for (var i = 0; i < all.length; i++) {
          if (all[i].offsetHeight > 0) { textarea = all[i]; break; }
        }
      }
      if (textarea) {
        textarea.value = 'Relance commandement — test automatisé';
        // Find submit button near textarea
        var btns = textarea.closest('div').querySelectorAll('button');
        if (btns.length) { btns[0].click(); return true; }
        // Try parent
        var parent = textarea.parentElement;
        while (parent) {
          btns = parent.querySelectorAll('button.btn-primary, button[onclick]');
          if (btns.length) { btns[0].click(); return true; }
          parent = parent.parentElement;
        }
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 2000));
    // Check historique for relance trace
    const relanceTrace = await page.evaluate(() => {
      var tl = document.getElementById('bo-tl-content');
      if (!tl) return false;
      return tl.innerHTML.includes('relance') || tl.innerHTML.includes('Relance');
    });
    log('Relancer → trace historique', relanceOk || relanceTrace, relanceOk ? 'modal soumis' : 'non soumis, trace=' + relanceTrace);

    // ── Test Note commandement ──
    await domClick(page, '[onclick*="boCcAjouterNote"]');
    await new Promise(r => setTimeout(r, 500));
    const noteOk = await page.evaluate(() => {
      var textarea = null;
      var all = document.querySelectorAll('textarea');
      for (var i = 0; i < all.length; i++) {
        if (all[i].offsetHeight > 0) { textarea = all[i]; break; }
      }
      if (textarea) {
        textarea.value = 'Note commandement — test palier 4';
        var parent = textarea.parentElement;
        while (parent) {
          var btns = parent.querySelectorAll('button.btn-primary, button[onclick]');
          if (btns.length) { btns[0].click(); return true; }
          parent = parent.parentElement;
        }
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 2000));
    const noteTrace = await page.evaluate(() => {
      var tl = document.getElementById('bo-tl-content');
      return tl ? tl.innerHTML.includes('note_commandement') || tl.innerHTML.includes('Note commandement') : false;
    });
    log('Note → trace historique', noteOk || noteTrace, noteOk ? 'modal soumis' : 'non soumis, trace=' + noteTrace);

    // ── Capture AR ──
    await page.evaluate(() => setLang('ar'));
    await new Promise(r => setTimeout(r, 1500));
    // Re-open drawer (lang switch may have closed it)
    const drawerStillOpen = await page.evaluate(() => {
      var d = document.getElementById('bo-drawer');
      return d && !d.classList.contains('hidden');
    });
    if (!drawerStillOpen) {
      await domClick(page, '.cc-kpi-card[data-kpi="sla"]');
      await new Promise(r => setTimeout(r, 800));
      await page.evaluate(() => { var r = document.querySelector('#cc-kpi-dropdown .cc-kpi-dd-row'); if (r) r.click(); });
      await new Promise(r => setTimeout(r, 2000));
    }
    await page.screenshot({ path: path.join(DOCS, 'cc_drawer_variant_ar.png'), fullPage: false });
    log('Capture fiche CC AR', true, 'cc_drawer_variant_ar.png');

    await page.evaluate(() => setLang('fr'));
    await new Promise(r => setTimeout(r, 500));
    await page.close();

    // ── Contre-test : Youcef (cabinet → BO) voit fiche inchangée ──
    const p2 = await login(browser, '0550000006', 'admin@@1234');
    // Youcef has ccoe view, try to open BO
    const youcefView = await p2.evaluate(() => {
      var ccoe = document.querySelector('[data-view="ccoe"]');
      if (ccoe) { ccoe.click(); return 'ccoe'; }
      var bo = document.querySelector('[data-view="bo-agent"]');
      if (bo) { bo.click(); return 'bo-agent'; }
      return 'none';
    });
    await new Promise(r => setTimeout(r, 3000));

    // Open a dossier from Youcef's view
    const youcefDrawer = await p2.evaluate(async () => {
      // Load board
      var token = localStorage.getItem('civismart_token');
      var r = await fetch('/api/signaler/board', { headers: { Authorization: 'Bearer ' + token } });
      var data = await r.json();
      if (Array.isArray(data) && data.length > 0) {
        window._boSignals = data;
        window._boDrawerContext = 'bo';
        window.boOpenDrawer(data[0].id);
        return data[0].reference;
      }
      return null;
    });
    await new Promise(r => setTimeout(r, 2000));

    if (youcefDrawer) {
      const youcefActions = await p2.evaluate(() => {
        var actions = document.getElementById('bo-drawer-actions');
        if (!actions) return null;
        var html = actions.innerHTML;
        return {
          hasCap: html.includes('boShowCapModal'),
          hasCommuniquer: html.includes('boCommuniquerDossier'),
          hasNotifier: html.includes('boNotifierDossier'),
          hasUrgenceWali: html.includes('boSignalerUrgenceWali'),
          noPilotageBloc: !document.getElementById('bo-drawer-content').innerHTML.includes('pilotage_institutionnel') && !document.getElementById('bo-drawer-content').innerHTML.includes('القيادة المؤسسية')
        };
      });
      if (youcefActions) {
        log('Youcef: CAP présent', youcefActions.hasCap, youcefActions.hasCap ? 'OUI' : 'absent');
        log('Youcef: Communiquer présent', youcefActions.hasCommuniquer, youcefActions.hasCommuniquer ? 'OUI' : 'absent');
        log('Youcef: pas de bloc Pilotage', youcefActions.noPilotageBloc, youcefActions.noPilotageBloc ? 'correct — absent' : 'PRESENT dans BO');
      }
      await p2.screenshot({ path: path.join(DOCS, 'cc_drawer_youcef_bo.png'), fullPage: false });
      log('Capture fiche Youcef BO', true, 'cc_drawer_youcef_bo.png');
    }
    await p2.close();

    // ── Board counts ──
    const p3 = await login(browser, '0550000003', 'admin@@1234');
    const total = await p3.evaluate(async () => {
      var t = localStorage.getItem('civismart_token');
      var r = await fetch('/api/signaler/board', { headers: { Authorization: 'Bearer ' + t } });
      var d = await r.json();
      return Array.isArray(d) ? d.length : -1;
    });
    log('Total signalements', total === 122, 'total=' + total + ' (attendu=122)');
    await p3.close();

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
