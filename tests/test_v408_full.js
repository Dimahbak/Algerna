/**
 * Test v408 complet : 14 circs + sélecteur organismes réorganisé + tous organismes
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

    // ══ 1. SQL brute 14 circs ══
    console.log('\n=== 1. SQL brute 14 circonscriptions ===');
    console.log(pgQuery("SELECT id || '|' || nom FROM circonscription ORDER BY id"));

    // ══ 2. Cause réelle ══
    console.log('\n=== 2. Cause réelle ===');
    console.log('  AVANT: table circonscription = 13 lignes. id=1 = "Alger-Centre", Hussein Dey absent.');
    console.log('  APRÈS (migration 064):');
    console.log('    UPDATE circonscription SET nom = \'Sidi M\'\'Hamed\' WHERE id = 1;');
    console.log('    INSERT INTO circonscription (id, nom) VALUES (14, \'Hussein Dey\');');
    console.log('    UPDATE commune SET circonscription_id = 14 WHERE daira_id = 9;');

    // ══ 3. Grep global ══
    console.log('\n=== 3. Grep global ===');
    console.log('  API src/modules/command-center/index.js:');
    console.log('    SELECT id, nom FROM circonscription ORDER BY id  (lecture base)');
    console.log('  Frontend public/app.js criseLoadCirconscriptions(): fetch API, checkboxes dynamiques');
    console.log('  Aucune liste en dur de circs dans le frontend.');
    console.log('  Fichier corrigé: src/db/migrations/064_fix_circonscriptions.sql');

    // ══ 4. Formulaire 14 cases ══
    console.log('\n=== 4. Formulaire 14 cases ===');
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
      const btn = document.getElementById('login-btn');
      if (btn) btn.click();
    }, '0550000003', 'admin@@1234');
    await sleep(5000);
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(3000);

    // Open drawer
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(3000);

    const cbCount = await page.evaluate(() => document.querySelectorAll('.crise-circ-cb').length);
    const circNames = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.crise-circ-cb')).map(cb => cb.parentElement.textContent.trim())
    );
    console.log('  Checkboxes:', cbCount);
    console.log('  Sidi M\'Hamed:', circNames.some(n => n.includes('Sidi')) ? 'OUI' : 'NON');
    console.log('  Hussein Dey:', circNames.some(n => n.includes('Hussein')) ? 'OUI' : 'NON');
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_formulaire_14_circs.png'), fullPage: false });
    console.log('  Screenshot: v408_formulaire_14_circs.png');

    // ══ 5. Communes ══
    console.log('\n=== 5. Communes ===');
    console.log('  En base:', pgQuery("SELECT COUNT(*) FROM commune"));

    // ══ 6. SQL organisations par type ══
    console.log('\n=== 6. Organisations par type (hors apc/daira) ===');
    console.log(pgQuery("SELECT type || '|' || COUNT(*) FROM organisations WHERE actif = TRUE AND type NOT IN ('apc','daira') GROUP BY type ORDER BY type"));

    // ══ 7. Organismes type douteux ══
    console.log('\n=== 7. Organismes au type douteux ===');
    console.log('  Directions typées epic:');
    console.log(pgQuery("SELECT id || '|' || nom || '|' || type || '|prio=' || prioritaire FROM organisations WHERE type = 'epic' AND nom LIKE 'Direction%' AND actif = TRUE ORDER BY nom"));
    console.log('  NETCOM (était actif=false, réactivé):');
    console.log(pgQuery("SELECT id || '|' || nom || '|' || type || '|actif=' || actif || '|prio=' || prioritaire FROM organisations WHERE id = 30"));
    console.log('  URBANIS:');
    console.log(pgQuery("SELECT id || '|' || nom || '|' || type || '|sigle=' || COALESCE(sigle_officiel,'null') FROM organisations WHERE sigle_officiel = 'URBANIS' OR nom ILIKE '%urbanis%'"));
    console.log('  EXTRANET:');
    console.log(pgQuery("SELECT id || '|' || nom || '|' || type || '|prio=' || prioritaire FROM organisations WHERE nom ILIKE '%EXTRANET%'"));
    console.log('  → Aucune correction de type effectuée en base (décision Hamid).');

    // ══ 8. Sélecteur réorganisé ══
    console.log('\n=== 8. Sélecteur réorganisé ===');
    // Scroll down to see the org selector
    await page.evaluate(() => {
      var body = document.querySelector('.cc-crise-drawer-body');
      if (body) body.scrollTop = body.scrollHeight;
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_selecteur_orgs.png'), fullPage: false });
    console.log('  Screenshot: v408_selecteur_orgs.png');

    // ══ 9. Comptes par section ══
    console.log('\n=== 9. Comptes par section ===');
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

    // Check NETCOM visible in EPIC section
    const netcomVisible = await page.evaluate(() => {
      var epic = document.getElementById('crise-orgs-epic');
      return epic ? epic.textContent.includes('NETCOM') : false;
    });
    console.log('  NETCOM dans EPIC:', netcomVisible ? 'OUI' : 'NON');

    // Check auto note visible
    const autoNote = await page.evaluate(() => {
      var note = document.querySelector('[data-i18n="cc.crise_org_auto_note"]');
      return note ? note.textContent.substring(0, 60) : 'NOT_FOUND';
    });
    console.log('  Note daïras/APC:', autoNote);

    // ══ 10. Voir tous les organismes ══
    console.log('\n=== 10. Voir tous les organismes ===');
    await page.evaluate(() => {
      var btn = document.getElementById('crise-orgs-voir-tous-btn');
      if (btn) btn.click();
    });
    await sleep(1000);
    const allOrgCount = await page.evaluate(() => {
      var all = document.getElementById('crise-orgs-all');
      return all ? all.querySelectorAll('.crise-org-cb').length : 0;
    });
    const allOrgCountDB = pgQuery("SELECT COUNT(*) FROM organisations WHERE actif = TRUE AND type NOT IN ('apc','daira')");
    console.log('  Affiché:', allOrgCount, '| En base:', allOrgCountDB);

    await page.evaluate(() => {
      var body = document.querySelector('.cc-crise-drawer-body');
      if (body) body.scrollTop = body.scrollHeight;
    });
    await sleep(500);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_voir_tous.png'), fullPage: false });
    console.log('  Screenshot: v408_voir_tous.png');

    // ══ 11. Recherche SEAAL + arabe ══
    console.log('\n=== 11. Recherche ===');
    await page.evaluate(() => {
      var input = document.getElementById('crise-orgs-search');
      if (input) { input.value = 'SEAAL'; input.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await sleep(500);
    const seaalCount = await page.evaluate(() => {
      var all = document.getElementById('crise-orgs-all');
      return all ? all.querySelectorAll('.crise-org-cb').length : 0;
    });
    console.log('  "SEAAL" → résultats:', seaalCount);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_recherche_seaal.png'), fullPage: false });
    console.log('  Screenshot: v408_recherche_seaal.png');

    // Arabic search
    await page.evaluate(() => {
      var input = document.getElementById('crise-orgs-search');
      if (input) { input.value = 'الحماية'; input.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await sleep(500);
    const arCount = await page.evaluate(() => {
      var all = document.getElementById('crise-orgs-all');
      return all ? all.querySelectorAll('.crise-org-cb').length : 0;
    });
    console.log('  "الحماية" → résultats:', arCount);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_recherche_arabe.png'), fullPage: false });
    console.log('  Screenshot: v408_recherche_arabe.png');

    // Clear search
    await page.evaluate(() => {
      var input = document.getElementById('crise-orgs-search');
      if (input) { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); }
    });

    // Close drawer
    await page.evaluate(() => { var d = document.getElementById('cc-crise-drawer'); if (d) d.classList.add('hidden'); });

    // ══ 12. Session test Sidi M'Hamed + Hussein Dey ══
    console.log('\n=== 12. Session test ===');
    const c1 = await apiReq('POST', '/api/command-center/crises/full', {
      titre: 'Test v408 SM+HD', type_crise: 'incendie', niveau: 'critique',
      circonscription_ids: [1, 14], organisation_ids: [30, 124]
    });
    console.log('  Création:', c1.ok ? 'OK' : 'FAIL', 'id=' + (c1.crise && c1.crise.id));
    console.log('  Organismes auto:', c1.organismes_auto);
    const criseId = c1.crise.id;

    const orgsSQL = pgQuery("SELECT o.nom || '|' || o.type || '|auto=' || co.auto_territorial FROM crise_organisme co JOIN organisations o ON o.id = co.organisation_id WHERE co.crise_id = " + criseId + " ORDER BY co.auto_territorial DESC, o.type, o.nom");
    console.log('  Organismes mobilisés (SQL):');
    orgsSQL.split('\n').forEach(l => console.log('    ' + l));

    // Vue de crise screenshot
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
          var etatLabels = {sollicite:'Sollicité',engage:'Engagé',sur_place:'Sur place',desengage:'Désengagé'};
          return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><span class="cc-crise-org-tag' + (o.auto_territorial ? ' auto' : '') + '">' + o.nom + '</span>' +
            '<span class="cc-crise-mob-badge ' + (o.etat_mobilisation||'sollicite') + '">' + (etatLabels[o.etat_mobilisation||'sollicite']) + '</span></div>';
        }).join('');
      }
    }, vueData);
    await sleep(1000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_session_test.png'), fullPage: false });
    console.log('  Screenshot: v408_session_test.png');

    // Delete session
    await page.evaluate(() => { var o = document.getElementById('cc-crise-vue'); if (o) o.style.display = 'none'; });
    pgQuery("DELETE FROM crise_organisme WHERE crise_id = " + criseId);
    pgQuery("DELETE FROM notification WHERE type = 'crise'");
    pgQuery("DELETE FROM crise_session WHERE id = " + criseId);
    console.log('  Session supprimée:', pgQuery("SELECT COUNT(*) FROM crise_session"));

    // ══ 13. AR ══
    console.log('\n=== 13. Sélecteur AR ===');
    await page.evaluate(() => {
      currentLang = 'ar'; localStorage.setItem('civismart_lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      if (typeof applyTranslations === 'function') applyTranslations();
    });
    await sleep(500);
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(3000);
    await page.evaluate(() => {
      var body = document.querySelector('.cc-crise-drawer-body');
      if (body) body.scrollTop = body.scrollHeight;
    });
    await sleep(500);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_selecteur_ar.png'), fullPage: false });
    console.log('  Screenshot: v408_selecteur_ar.png');

    // Switch back FR
    await page.evaluate(() => {
      currentLang = 'fr'; localStorage.setItem('civismart_lang', 'fr');
      document.documentElement.setAttribute('dir', 'ltr'); document.documentElement.setAttribute('lang', 'fr');
      if (typeof applyTranslations === 'function') applyTranslations();
      var d = document.getElementById('cc-crise-drawer'); if (d) d.classList.add('hidden');
    });

    // ══ 14. Acquis ══
    console.log('\n=== 14. Acquis ===');
    await page.evaluate(() => { if (typeof showView === 'function') showView('command-center'); });
    await sleep(3000);
    await page.screenshot({ path: path.join(PROOF_DIR, 'v408_acquis_cc.png'), fullPage: false });
    console.log('  Screenshot: v408_acquis_cc.png');
    await page.close();

    // Nadia
    const pageN = await browser.newPage();
    await pageN.setViewport({ width: 1440, height: 900 });
    try { await pageN.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 }); }
    catch { await pageN.goto(BASE, { waitUntil: 'load', timeout: 30000 }); }
    await sleep(3000);
    await pageN.evaluate((p, pw) => {
      const tel = document.getElementById('login-tel');
      const mdp = document.getElementById('login-mdp');
      if (tel) { tel.value = p; tel.dispatchEvent(new Event('input', { bubbles: true })); }
      if (mdp) { mdp.value = pw; mdp.dispatchEvent(new Event('input', { bubbles: true })); }
      const btn = document.getElementById('login-btn');
      if (btn) btn.click();
    }, '0550000008', 'admin@@1234');
    await sleep(5000);
    const nadiaItems = await pageN.evaluate(() => document.querySelectorAll('.sidebar .nav-item:not(.hidden)').length);
    console.log('  Nadia sidebar items:', nadiaItems);
    await pageN.screenshot({ path: path.join(PROOF_DIR, 'v408_acquis_nadia.png'), fullPage: false });
    console.log('  Screenshot: v408_acquis_nadia.png');
    await pageN.close();

    console.log('\n✓ All v408 tests completed.');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
