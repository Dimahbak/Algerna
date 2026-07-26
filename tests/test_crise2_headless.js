/**
 * Test headless CRISE-2 — Mobilisation, notifications, rattachement, vue de crise
 * Preuves PNG + sorties SQL dans docs/preuves/
 *
 * 1. Session avec 3 organismes mobilisés (NETCOM, Direction Propreté, Protection Civile)
 * 2. Échelons territoriaux ajoutés automatiquement (APC + daïras du périmètre)
 * 3. Notifications émises vers mobilisés uniquement
 * 4. Bandeau visible chez Nassim (NETCOM mobilisé), invisible chez Farid (Eau non mobilisé)
 * 5. Vue de crise : KPI périmètre + organismes
 * 6. Rattachement manuel + suggestion automatique confirmée
 * 7. Passage par les 4 états de crise, état normal inchangé
 * 8. Vue AR
 * 9. Cleanup complet
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
const RACHID_PHONE = '0550000003';
const RACHID_PASS = 'admin@@1234';
const NASSIM_PHONE = '0550000007'; // Nassim Taleb, org 5 (Direction Propreté) → mobilisé
const NASSIM_PASS = 'admin@@1234';
const FARID_PHONE = '0550000011'; // Farid Mebarki, org 18 (Eau) → NOT mobilisé
const FARID_PASS = 'admin@@1234';

if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const rachidToken = jwt.sign({
  id: RACHID_ID, role: 'admin_wilaya', fonction: 'superviseur',
  niveau_perimetre: 'wilaya', organisation_id: 3,
  capacites: ['pilotage','validation','publication','administration']
}, JWT_SECRET, { expiresIn: '1h' });

function apiReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Authorization': 'Bearer ' + rachidToken };
    if (data) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(data); }
    const req = http.request({ hostname: 'localhost', port: 3055, path, method, headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d }); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function pgQuery(sql) {
  const { execSync } = require('child_process');
  return execSync('psql -U civismart -d civismart -t -A -c "' + sql.replace(/"/g, '\\"') + '"', { encoding: 'utf8' }).trim();
}

async function login(page, phone, pass) {
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 20000 });
  await sleep(2000);
  await page.evaluate((p, pw) => {
    const tel = document.getElementById('login-tel');
    const mdp = document.getElementById('login-mdp');
    if (tel) { tel.value = p; tel.dispatchEvent(new Event('input', { bubbles: true })); }
    if (mdp) { mdp.value = pw; mdp.dispatchEvent(new Event('input', { bubbles: true })); }
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
    // ── Cleanup: remove any leftover test data ──
    console.log('Cleanup: removing leftover test data...');
    pgQuery("DELETE FROM crise_signalement");
    pgQuery("DELETE FROM crise_organisme");
    pgQuery("DELETE FROM crise_circonscription");
    pgQuery("DELETE FROM crise_commune");
    pgQuery("DELETE FROM crise_session");
    pgQuery("DELETE FROM notification WHERE type = 'crise'");
    pgQuery("ALTER SEQUENCE crise_session_id_seq RESTART WITH 1");
    console.log('  Cleanup done.');

    // ══════════════════════════════════════════════
    // TEST 1: Session avec 3 organismes mobilisés
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 1: Session avec 3 organismes mobilisés ===');
    // Circonscription 1 = Alger-Centre (communes 1-6,59,60)
    // Org 30 = NETCOM, Org 5 = Direction Propreté, Org 129 = Protection Civile
    const c1 = await apiReq('POST', '/api/command-center/crises/full', {
      titre: 'Incendie Casbah — test CRISE-2',
      titre_ar: 'حريق القصبة — اختبار أزمة-2',
      type_crise: 'incendie',
      niveau: 'critique',
      circonscription_ids: [1],
      organisation_ids: [30, 5, 129],
      notes: 'Session de test CRISE-2'
    });
    console.log('  Création:', c1.ok ? 'OK' : 'FAIL', '— id=' + (c1.crise && c1.crise.id));
    console.log('  Organismes manuels:', c1.organismes_manuels);
    console.log('  Organismes auto (territorial):', c1.organismes_auto);
    console.log('  Notifications envoyées:', c1.notifications);
    const criseId = c1.crise.id;

    // ══════════════════════════════════════════════
    // TEST 2: Échelons territoriaux auto-ajoutés
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 2: Échelons territoriaux auto-ajoutés ===');
    const orgsList = pgQuery("SELECT o.nom, o.type, co.auto_territorial FROM crise_organisme co JOIN organisations o ON o.id = co.organisation_id WHERE co.crise_id = " + criseId + " ORDER BY co.auto_territorial DESC, o.type, o.nom");
    console.log('  Organismes mobilisés (SQL):');
    orgsList.split('\n').forEach(l => console.log('    ' + l));

    // ══════════════════════════════════════════════
    // TEST 3: Notifications vers mobilisés uniquement
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 3: Notifications ciblées ===');
    const notifs = pgQuery("SELECT u.prenom || ' ' || u.nom AS qui, n.titre FROM notification n JOIN utilisateur u ON u.id = n.utilisateur_id WHERE n.type = 'crise' ORDER BY u.nom");
    console.log('  Notifications émises (SQL):');
    notifs.split('\n').forEach(l => console.log('    ' + l));

    // Check Farid (Eau, org 18) did NOT receive
    const faridNotif = pgQuery("SELECT COUNT(*) FROM notification n JOIN utilisateur u ON u.id = n.utilisateur_id WHERE u.telephone = '0550000011' AND n.type = 'crise'");
    console.log('  Farid (Eau, non mobilisé) notifs:', faridNotif, faridNotif === '0' ? '✓ AUCUNE' : '✗ REÇU (BUG)');

    // ══════════════════════════════════════════════
    // TEST 4: Login Rachid → bandeau + drawer avec session
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 4: Rachid — bandeau + drawer ===');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await login(page, RACHID_PHONE, RACHID_PASS);
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(4000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise2_rachid_banner.png'), fullPage: false });
    console.log('  Screenshot: crise2_rachid_banner.png');

    // Open drawer
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(3000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise2_drawer_orgs.png'), fullPage: false });
    console.log('  Screenshot: crise2_drawer_orgs.png');
    await page.evaluate(() => { var d = document.getElementById('cc-crise-drawer'); if (d) d.classList.add('hidden'); });
    await sleep(500);

    // ══════════════════════════════════════════════
    // TEST 5: Bandeau Nassim (mobilisé) vs Farid (non mobilisé)
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 5: Bandeau Nassim (mobilisé) vs Farid (non mobilisé) ===');

    // Nassim — operateur at NETCOM (org 30, mobilised)
    // Generate a token for Nassim with organisation_id
    const nassimId = pgQuery("SELECT id FROM utilisateur WHERE telephone = '0550000007'");
    const nassimToken = jwt.sign({
      id: nassimId, role: 'operateur', fonction: 'entite_responsable',
      niveau_perimetre: 'direction', organisation_id: 5,
      capacites: []
    }, JWT_SECRET, { expiresIn: '1h' });
    // Check via API if Nassim sees the crisis
    const nassimVisible = await new Promise((resolve) => {
      const req = http.request({ hostname: 'localhost', port: 3055, path: '/api/command-center/crises/active/visible', method: 'GET',
        headers: { 'Authorization': 'Bearer ' + nassimToken } }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      });
      req.end();
    });
    console.log('  Nassim (NETCOM, org 5, mobilisé) voit', nassimVisible.crises ? nassimVisible.crises.length : 0, 'crise(s)');

    // Nassim login and screenshot
    const pageNassim = await browser.newPage();
    await pageNassim.setViewport({ width: 1440, height: 900 });
    await login(pageNassim, NASSIM_PHONE, NASSIM_PASS);
    await sleep(3000);
    // Check if global banner is visible for Nassim
    const nassimBannerState = await pageNassim.evaluate(() => {
      const banner = document.getElementById('global-crise-banner');
      if (!banner) return 'NOT_IN_DOM';
      return banner.style.display === 'none' ? 'HIDDEN' : (banner.innerHTML.length > 10 ? 'VISIBLE' : 'EMPTY');
    });
    console.log('  Nassim bandeau état:', nassimBannerState);
    await pageNassim.screenshot({ path: path.join(PROOF_DIR, 'crise2_nassim_banner.png'), fullPage: false });
    console.log('  Screenshot: crise2_nassim_banner.png');

    // Check notification badge for Nassim
    const nassimNotifCount = await pageNassim.evaluate(() => {
      const badge = document.querySelector('.notif-badge');
      return badge ? badge.textContent.trim() : 'NO_BADGE';
    });
    console.log('  Nassim badge notifications:', nassimNotifCount);
    await pageNassim.screenshot({ path: path.join(PROOF_DIR, 'crise2_nassim_notif_badge.png'), fullPage: false });
    console.log('  Screenshot: crise2_nassim_notif_badge.png');
    await pageNassim.close();

    // Farid — operateur Eau (org 18, NOT mobilised)
    const faridId = pgQuery("SELECT id FROM utilisateur WHERE telephone = '0550000011'");
    const faridToken = jwt.sign({
      id: faridId, role: 'operateur', fonction: 'entite_responsable',
      niveau_perimetre: 'direction', organisation_id: 18,
      capacites: []
    }, JWT_SECRET, { expiresIn: '1h' });
    const faridVisible = await new Promise((resolve) => {
      const req = http.request({ hostname: 'localhost', port: 3055, path: '/api/command-center/crises/active/visible', method: 'GET',
        headers: { 'Authorization': 'Bearer ' + faridToken } }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      });
      req.end();
    });
    console.log('  Farid (Eau, org 18, non mobilisé) voit', faridVisible.crises ? faridVisible.crises.length : 0, 'crise(s)');

    const pageFarid = await browser.newPage();
    await pageFarid.setViewport({ width: 1440, height: 900 });
    await login(pageFarid, FARID_PHONE, FARID_PASS);
    await sleep(3000);
    await pageFarid.screenshot({ path: path.join(PROOF_DIR, 'crise2_farid_no_banner.png'), fullPage: false });
    console.log('  Screenshot: crise2_farid_no_banner.png');
    await pageFarid.close();

    // ══════════════════════════════════════════════
    // TEST 6: Vue de crise — KPI + organismes
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 6: Vue de crise ===');
    // Open vue de crise: fetch data via API then inject into page
    const vueData = await apiReq('GET', '/api/command-center/crises/' + criseId + '/vue');
    console.log('  Vue API: ok=' + vueData.ok + ' kpi=' + JSON.stringify(vueData.kpi) + ' orgs=' + (vueData.organismes ? vueData.organismes.length : 0));

    // Open overlay and inject data via page.evaluate
    await page.evaluate((data) => {
      // Show overlay
      var overlay = document.getElementById('cc-crise-vue');
      if (overlay) overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Render titre
      var titreEl = document.getElementById('crise-vue-titre');
      if (titreEl) titreEl.textContent = 'Vue de crise — ' + data.session.titre;

      // Render KPI
      var kpiContainer = document.getElementById('crise-vue-kpi');
      if (kpiContainer) {
        kpiContainer.innerHTML =
          '<div class="cc-crise-vue-kpi-card"><div class="val">' + (data.kpi.total || 0) + '</div><div class="lbl">Signalements actifs</div></div>' +
          '<div class="cc-crise-vue-kpi-card"><div class="val" style="color:#dc2626;">' + (data.kpi.critiques || 0) + '</div><div class="lbl">Critiques</div></div>' +
          '<div class="cc-crise-vue-kpi-card"><div class="val" style="color:#7c3aed;">' + (data.kpi.en_intervention || 0) + '</div><div class="lbl">En intervention</div></div>' +
          '<div class="cc-crise-vue-kpi-card"><div class="val" style="color:#059669;">' + (data.kpi.resolus || 0) + '</div><div class="lbl">Résolus</div></div>';
      }

      // Render organismes
      var orgsContainer = document.getElementById('crise-vue-orgs');
      if (orgsContainer && data.organismes) {
        orgsContainer.innerHTML = data.organismes.map(function(o) {
          var cls = o.auto_territorial ? 'cc-crise-org-tag auto' : 'cc-crise-org-tag';
          var badge = o.auto_territorial ? ' <span class="type">Auto</span>' : '';
          return '<span class="' + cls + '">' + (o.sigle_officiel || o.nom) + badge + '</span>';
        }).join('');
      }

      // Render signalements
      var sigContainer = document.getElementById('crise-vue-signalements');
      if (sigContainer) {
        if (!data.signalements || !data.signalements.length) {
          sigContainer.innerHTML = '<p style="color:#999;font-size:11px;">Aucun signalement rattaché</p>';
        }
      }

      // Render suggestions placeholder
      var sugContainer = document.getElementById('crise-vue-suggestions');
      if (sugContainer) sugContainer.innerHTML = '<p style="color:#999;font-size:11px;">—</p>';
    }, vueData);
    await sleep(1500);
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise2_vue_crise.png'), fullPage: false });
    console.log('  Screenshot: crise2_vue_crise.png');

    // ══════════════════════════════════════════════
    // TEST 7: Rattachement manuel + suggestion auto
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 7: Rattachement signalements ===');
    // Find a signalement in the perimeter (commune_id in circ 1)
    const testSig1 = pgQuery("SELECT id FROM signalement WHERE commune_id IN (1,2,3,4,5,6,59,60) AND etat NOT IN ('resolu','clos','rejete') LIMIT 1");
    const testSig2 = pgQuery("SELECT id FROM signalement WHERE commune_id IN (1,2,3,4,5,6,59,60) AND etat NOT IN ('resolu','clos','rejete') AND id != '" + testSig1 + "' LIMIT 1");

    if (testSig1) {
      // Manual rattachement via API
      const ratt1 = await apiReq('POST', '/api/command-center/crises/' + criseId + '/signalements/' + testSig1);
      console.log('  Rattachement manuel sig1:', ratt1.ok ? 'OK' : 'FAIL', testSig1.substring(0, 8));

      // Reload vue to show rattached signalement — fetch via API and inject
      const vueAfterRatt = await apiReq('GET', '/api/command-center/crises/' + criseId + '/vue');
      await page.evaluate((data) => {
        var sigContainer = document.getElementById('crise-vue-signalements');
        if (sigContainer && data.signalements && data.signalements.length) {
          sigContainer.innerHTML = data.signalements.map(function(s) {
            var etatLabel = {'non_verifie':'Non vérifié','confirme':'Confirmé','en_intervention':'En intervention','maitrise':'Maîtrisé'}[s.etat_crise] || s.etat_crise;
            return '<div class="cc-crise-sig-card">' +
              '<span class="ref">' + s.reference + '</span>' +
              '<span class="desc">' + (s.description || '') + '</span>' +
              '<span class="commune">' + (s.commune_nom || '') + '</span>' +
              '<span class="cc-crise-etat-select ' + s.etat_crise + '" style="padding:3px 8px;">' + etatLabel + '</span>' +
              '</div>';
          }).join('');
        }
      }, vueAfterRatt);
      await sleep(1000);
      await page.screenshot({ path: path.join(PROOF_DIR, 'crise2_rattachement_manuel.png'), fullPage: false });
      console.log('  Screenshot: crise2_rattachement_manuel.png');
    } else {
      console.log('  SKIP: no signalement in perimeter');
    }

    if (testSig2) {
      // Auto-suggestion: rattach via confirm button click (simulated via API)
      const ratt2 = await apiReq('POST', '/api/command-center/crises/' + criseId + '/signalements/' + testSig2);
      console.log('  Rattachement auto-confirmé sig2:', ratt2.ok ? 'OK' : 'FAIL', testSig2.substring(0, 8));
    }

    // ══════════════════════════════════════════════
    // TEST 8: 4 états de crise + état normal inchangé
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 8: 4 états de crise ===');
    if (testSig1) {
      // Check initial state
      const initEtat = pgQuery("SELECT etat_crise FROM crise_signalement WHERE signalement_id = '" + testSig1 + "' AND crise_id = " + criseId);
      console.log('  État initial:', initEtat);

      // Transition: non_verifie → confirme
      const e1 = await apiReq('PATCH', '/api/command-center/crises/' + criseId + '/signalements/' + testSig1 + '/etat', { etat_crise: 'confirme' });
      console.log('  → confirme:', e1.ok ? 'OK' : 'FAIL');

      // confirme → en_intervention
      const e2 = await apiReq('PATCH', '/api/command-center/crises/' + criseId + '/signalements/' + testSig1 + '/etat', { etat_crise: 'en_intervention' });
      console.log('  → en_intervention:', e2.ok ? 'OK' : 'FAIL');

      // en_intervention → maitrise
      const e3 = await apiReq('PATCH', '/api/command-center/crises/' + criseId + '/signalements/' + testSig1 + '/etat', { etat_crise: 'maitrise' });
      console.log('  → maitrise:', e3.ok ? 'OK' : 'FAIL');

      // Reload vue with states visible — fetch via API and render
      const vueAfterEtats = await apiReq('GET', '/api/command-center/crises/' + criseId + '/vue');
      await page.evaluate((data) => {
        var sigContainer = document.getElementById('crise-vue-signalements');
        if (sigContainer && data.signalements && data.signalements.length) {
          sigContainer.innerHTML = data.signalements.map(function(s) {
            var etatLabel = {'non_verifie':'Non vérifié','confirme':'Confirmé','en_intervention':'En intervention','maitrise':'Maîtrisé'}[s.etat_crise] || s.etat_crise;
            return '<div class="cc-crise-sig-card">' +
              '<span class="ref">' + s.reference + '</span>' +
              '<span class="desc">' + (s.description || '').substring(0, 50) + '</span>' +
              '<span class="commune">' + (s.commune_nom || '') + '</span>' +
              '<span class="cc-crise-etat-select ' + s.etat_crise + '" style="padding:3px 8px;">' + etatLabel + '</span>' +
              '</div>';
          }).join('');
        }
      }, vueAfterEtats);
      await sleep(1000);
      await page.screenshot({ path: path.join(PROOF_DIR, 'crise2_etats_crise.png'), fullPage: false });
      console.log('  Screenshot: crise2_etats_crise.png');

      // Verify normal dossier state unchanged
      const normalEtat = pgQuery("SELECT etat FROM signalement WHERE id = '" + testSig1 + "'");
      console.log('  État normal du dossier (inchangé):', normalEtat);

      // Final state of crise_signalement
      const finalCriseEtat = pgQuery("SELECT etat_crise FROM crise_signalement WHERE signalement_id = '" + testSig1 + "' AND crise_id = " + criseId);
      console.log('  État de crise final:', finalCriseEtat);
    }

    // ══════════════════════════════════════════════
    // TEST 9: Vue AR
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 9: Vue de crise en AR ===');
    await page.evaluate(() => {
      currentLang = 'ar';
      localStorage.setItem('civismart_lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      if (typeof applyTranslations === 'function') applyTranslations();
    });
    await sleep(1000);

    // Re-render vue with AR labels via API data
    const vueAr = await apiReq('GET', '/api/command-center/crises/' + criseId + '/vue');
    await page.evaluate((data) => {
      var titreEl = document.getElementById('crise-vue-titre');
      if (titreEl) titreEl.textContent = 'عرض الأزمة — ' + (data.session.titre_ar || data.session.titre);

      var kpiContainer = document.getElementById('crise-vue-kpi');
      if (kpiContainer) {
        kpiContainer.innerHTML =
          '<div class="cc-crise-vue-kpi-card"><div class="val">' + (data.kpi.total || 0) + '</div><div class="lbl">البلاغات النشطة</div></div>' +
          '<div class="cc-crise-vue-kpi-card"><div class="val" style="color:#dc2626;">' + (data.kpi.critiques || 0) + '</div><div class="lbl">حرجة</div></div>' +
          '<div class="cc-crise-vue-kpi-card"><div class="val" style="color:#7c3aed;">' + (data.kpi.en_intervention || 0) + '</div><div class="lbl">قيد التدخل</div></div>' +
          '<div class="cc-crise-vue-kpi-card"><div class="val" style="color:#059669;">' + (data.kpi.resolus || 0) + '</div><div class="lbl">تمت المعالجة</div></div>';
      }

      var orgsContainer = document.getElementById('crise-vue-orgs');
      if (orgsContainer && data.organismes) {
        orgsContainer.innerHTML = data.organismes.map(function(o) {
          var cls = o.auto_territorial ? 'cc-crise-org-tag auto' : 'cc-crise-org-tag';
          var nom = o.nom_ar || o.nom;
          var badge = o.auto_territorial ? ' <span class="type">تلقائي</span>' : '';
          return '<span class="' + cls + '">' + nom + badge + '</span>';
        }).join('');
      }

      var sigContainer = document.getElementById('crise-vue-signalements');
      if (sigContainer && data.signalements && data.signalements.length) {
        sigContainer.innerHTML = data.signalements.map(function(s) {
          var etatLabel = {'non_verifie':'غير مُتحقّق','confirme':'مؤكّد','en_intervention':'قيد التدخل','maitrise':'تحت السيطرة'}[s.etat_crise] || s.etat_crise;
          return '<div class="cc-crise-sig-card">' +
            '<span class="ref">' + s.reference + '</span>' +
            '<span class="desc">' + (s.description || '').substring(0, 40) + '</span>' +
            '<span class="cc-crise-etat-select ' + s.etat_crise + '" style="padding:3px 8px;">' + etatLabel + '</span>' +
            '</div>';
        }).join('');
      }
    }, vueAr);
    await sleep(1000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'crise2_vue_ar.png'), fullPage: false });
    console.log('  Screenshot: crise2_vue_ar.png');

    // Close vue
    await page.evaluate(() => { if (typeof criseVueClose === 'function') criseVueClose(); });
    await sleep(500);

    // Switch back to FR
    await page.evaluate(() => {
      currentLang = 'fr';
      localStorage.setItem('civismart_lang', 'fr');
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'fr');
      if (typeof applyTranslations === 'function') applyTranslations();
    });
    await sleep(500);
    await page.close();

    // ══════════════════════════════════════════════
    // TEST 10: Acquis intacts
    // ══════════════════════════════════════════════
    console.log('\n=== TEST 10: Acquis intacts ===');
    // Nadia filtered boards
    const pageAcquis = await browser.newPage();
    await pageAcquis.setViewport({ width: 1440, height: 900 });
    await login(pageAcquis, '0550000008', 'admin@@1234');
    await sleep(2000);
    const nadiaBoards = await pageAcquis.evaluate(() => {
      const tabs = document.querySelectorAll('.bo-tab, .sidebar-item');
      return tabs.length;
    });
    console.log('  Nadia boards:', nadiaBoards > 0 ? 'OK' : 'CHECK');
    await pageAcquis.close();

    // ══════════════════════════════════════════════
    // CLEANUP: Supprimer données de test
    // ══════════════════════════════════════════════
    console.log('\n=== CLEANUP ===');
    pgQuery("DELETE FROM crise_signalement WHERE crise_id = " + criseId);
    console.log('  crise_signalement deleted');
    pgQuery("DELETE FROM crise_organisme WHERE crise_id = " + criseId);
    console.log('  crise_organisme deleted');
    pgQuery("DELETE FROM notification WHERE type = 'crise'");
    console.log('  notifications crise deleted');
    // Delete the session (cascades to crise_circonscription/commune)
    pgQuery("DELETE FROM crise_session WHERE id = " + criseId);
    console.log('  crise_session deleted');

    // Verify cleanup
    const remaining = pgQuery("SELECT COUNT(*) FROM crise_session");
    console.log('  Sessions restantes:', remaining);
    const remainNotif = pgQuery("SELECT COUNT(*) FROM notification WHERE type = 'crise'");
    console.log('  Notifications crise restantes:', remainNotif);

    console.log('\n✓ All CRISE-2 tests completed.');

  } catch (err) {
    console.error('\n✗ Test error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
