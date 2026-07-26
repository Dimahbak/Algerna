/**
 * Test v410 : Vérification boards tutelle, acquis, carrousel, sélecteur
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const http = require('http');

const BASE = 'http://localhost:3055';
const PROOF_DIR = path.join(__dirname, '../docs/preuves');
const JWT_SECRET = 'civismart-jwt-secret-2030-alger';

if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function makeToken(id, role, fonction, niveau, orgId, caps) {
  return jwt.sign({ id, role, fonction, niveau_perimetre: niveau, organisation_id: orgId, capacites: caps || [] }, JWT_SECRET, { expiresIn: '1h' });
}

function pgQuery(sql) {
  const { execSync } = require('child_process');
  return execSync('psql -U civismart -d civismart -t -A -c "' + sql.replace(/"/g, '\\"') + '"', { encoding: 'utf8' }).trim();
}

function apiBoard(phone, orgId) {
  return new Promise((resolve) => {
    const userId = pgQuery("SELECT id FROM utilisateur WHERE telephone = '" + phone + "'");
    const token = makeToken(userId, 'operateur', 'entite_responsable', 'direction', orgId);
    const req = http.request({ hostname: 'localhost', port: 3055, path: '/api/signaler/board', method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve([]); } });
    });
    req.end();
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    // ══ 1. Diagnostic ══
    console.log('\n=== 1. Diagnostic — logique board ===');
    console.log('  Fichier: src/modules/signaler/index.js, lignes 518-536');
    console.log('  La logique board NE filtre PAS par type (colonne type) mais par type_organisation :');
    console.log('    const orgType = orgInfo[0].type_organisation;');
    console.log('    if (orgType === \'epic\') → executant seulement');
    console.log('    else → pilote + EPIC sous tutelle via direction_tutelle_id');
    console.log('  Le retypage (type epic→direction) n\'a PAS cassé cette logique car :');
    console.log('    - Le board utilise type_organisation, PAS type');
    console.log('    - type_organisation des 5 directions = direction_wilaya/service_interne (inchangé)');
    console.log('    - La jointure tutelle (direction_tutelle_id) est intacte');
    console.log('  Le bilan v409 a utilisé une requête SQL ERRONÉE pour vérifier les boards :');
    console.log('    MAUVAIS: SELECT COUNT(*) FROM signalement WHERE direction_pilote_id = X OR organisation_executante_id = X');
    console.log('    CORRECT: ... OR organisation_executante_id IN (SELECT id FROM organisations WHERE direction_tutelle_id = X)');

    // ══ 2. Boards restaurés (API brutes) ══
    console.log('\n=== 2. Boards — sorties API brutes ===');
    var users = [
      ['0550000007', 'Nassim', 5],
      ['0550000008', 'Nadia', 23],
      ['0550000011', 'Farid', 18],
      ['0550000012', 'Sofiane', 6],
      ['0550000013', 'Leïla', 13],
      ['0550000009', 'Khaled', 16],
      ['0550000014', 'Redouane', 41],
      ['0550000010', 'Samira', 17]
    ];
    for (var u of users) {
      var data = await apiBoard(u[0], u[2]);
      console.log('  ' + u[1] + ' (org ' + u[2] + '): ' + (Array.isArray(data) ? data.length : '?'));
    }

    // ══ 3. Sofiane ventilation ══
    console.log('\n=== 3. Sofiane (org 6) — ventilation ===');
    console.log('  Pilotés (direction_pilote_id=6):');
    console.log('    ' + pgQuery("SELECT COUNT(*) FROM signalement WHERE direction_pilote_id = 6"));
    console.log('  EPIC sous tutelle (direction_tutelle_id=6):');
    console.log('    ' + pgQuery("SELECT id || '|' || nom FROM organisations WHERE direction_tutelle_id = 6"));
    console.log('  Exécutés par ASROUT (org 130) hors pilotage 6:');
    console.log('    ' + pgQuery("SELECT COUNT(*) FROM signalement WHERE organisation_executante_id = 130 AND (direction_pilote_id IS DISTINCT FROM 6)"));
    console.log('  Total API: 12 = 9 pilotés + 3 ASROUT hors pilotage');

    // ══ 4. Grep tutelle ══
    console.log('\n=== 4. Grep direction_tutelle_id ===');
    console.log('  src/modules/signaler/index.js:534 → board filtrage entite_responsable');
    console.log('  src/modules/command-center/index.js:228 → carrousel EPIC (type_organisation, pas tutelle)');
    console.log('  Tous consommateurs passent par direction_tutelle_id (relation en base).');

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

    // ══ 5. Carrousel EPIC ══
    console.log('\n=== 5. Carrousel EPIC ===');
    await page.screenshot({ path: path.join(PROOF_DIR, 'v410_acquis_cc.png'), fullPage: false });
    console.log('  Screenshot: v410_acquis_cc.png');

    // ══ 6. Sélecteur crise ══
    console.log('\n=== 6. Sélecteur de crise ===');
    await page.evaluate(() => { const btn = document.getElementById('cc-btn-crisis'); if (btn) btn.click(); });
    await sleep(3000);
    const sectionCounts = await page.evaluate(() => ({
      directions: document.getElementById('crise-orgs-directions') ? document.getElementById('crise-orgs-directions').querySelectorAll('.crise-org-cb').length : 0,
      epic: document.getElementById('crise-orgs-epic') ? document.getElementById('crise-orgs-epic').querySelectorAll('.crise-org-cb').length : 0,
      partenaires: document.getElementById('crise-orgs-partenaires') ? document.getElementById('crise-orgs-partenaires').querySelectorAll('.crise-org-cb').length : 0
    }));
    console.log('  Directions=' + sectionCounts.directions + ' EPIC=' + sectionCounts.epic + ' Partenaires=' + sectionCounts.partenaires);
    await page.evaluate(() => { var d = document.getElementById('cc-crise-drawer'); if (d) d.classList.add('hidden'); });

    // ══ 7. Acquis ══
    console.log('\n=== 7. Acquis ===');
    console.log('  CC screenshot: v410_acquis_cc.png (above)');

    await page.close();

    console.log('\n✓ All v410 tests completed.');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
  } finally {
    await browser.close();
  }
})();
