// ─── CONSTANTS ───────────────────────────────────────────
const TOKEN_KEY = 'civismart_token';
const USER_KEY  = 'civismart_user';
// Phase 4B — anciennes constantes retirées, remplacées par hasFonction/hasCapacite/hasNiveau
// ADMIN_ROLES et SUPER_ADMIN_ROLES ne sont plus utilisées.

// ─── STATE ───────────────────────────────────────────────
let currentUser = null;
let communes = [];
let rdvServices = [];
let selectedCreneauId = null;
let photoFiles = { cs: null, ws: null };

// ─── HELPERS ─────────────────────────────────────────────
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  currentUser = user;
}

function authHeaders() {
  return { 'Authorization': 'Bearer ' + getToken() };
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  if (token && !options.headers) options.headers = {};
  if (token && options.headers) options.headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(path, options);
  if (res.status === 401) {
    handleLogout();
    throw new Error(t('auth.session_expiree'));
  }
  return res;
}

/**
 * Fetch JSON défensif : parse via text() pour attraper les réponses
 * non-JSON (ex: ancien SW servant du HTML). Log console détaillé.
 * @param {string} url
 * @param {object} [opts] fetch options
 * @param {boolean} [auth] true = passe par apiFetch (ajoute Bearer)
 * @returns {Promise<any>} parsed JSON
 */
async function safeFetchJSON(url, opts, auth) {
  const res = auth ? await apiFetch(url, opts || {}) : await fetch(url, opts);
  if (!res.ok) {
    console.error('[safeFetchJSON]', url, 'HTTP', res.status, res.statusText);
    throw new Error('HTTP ' + res.status);
  }
  const raw = await res.text();
  try { return JSON.parse(raw); }
  catch (e) {
    console.error('[safeFetchJSON]', url, 'JSON parse fail, raw:', raw.substring(0, 300));
    throw new Error('Réponse invalide');
  }
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateTime(d) {
  if (!d) return '—';
  var locale = (typeof currentLang !== 'undefined' && currentLang === 'ar') ? 'ar-DZ' : 'fr-DZ';
  return new Date(d).toLocaleString(locale, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>${escHtml(msg)}</span>`;
  el.classList.remove('hidden');
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/></svg><span>${msg}</span>`;
  el.classList.remove('hidden');
}

function setLoading(btnId, textId, spinnerId, loading) {
  const btn = document.getElementById(btnId);
  const txt = document.getElementById(textId);
  const spin = document.getElementById(spinnerId);
  if (btn) btn.disabled = loading;
  if (txt) txt.classList.toggle('hidden', loading);
  if (spin) spin.classList.toggle('hidden', !loading);
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
// AR-aware field selectors (fallback to FR if AR empty)
function arF(ar, fr) { return (currentLang === 'ar' && ar) ? ar : (fr || ''); }
// etatLabel defined below (line ~7394)

// ── Dictionnaire centralisé des acronymes ──
var ACRONYMES_FR = {
  ICUA:  'Indice Citoyen Urbain ALGERNA — Score global (0-100) mesurant la qualité des services publics. Plus le score est élevé, meilleur est le service rendu aux citoyens.',
  IQEP:  'Indice de Qualité de l\'Espace Public — Note (0-100) évaluant l\'état des parcs, trottoirs et éclairage. Un score haut signifie des espaces bien entretenus.',
  CAP:   'Corps des Agents de Proximité — Agents de terrain qui constatent les problèmes sur place et accompagnent les citoyens.',
  EPIC:  'Établissement Public à caractère Industriel et Commercial — Organisme public (eau, propreté, éclairage, voirie) chargé d\'un service de la ville.',
  APC:   'Assemblée Populaire Communale — La mairie, l\'administration locale de votre commune.',
  SLA:   'Engagement de délai de traitement — Durée maximale (48h par défaut) pour résoudre un signalement. Un SLA dépassé signifie un retard.',
  SdC:   'Salle de Commandement — Écran de pilotage central pour superviser l\'ensemble de l\'activité du territoire.',
  CET:   'Centre d\'Enfouissement Technique',
  PMR:   'Personne à Mobilité Réduite',
  AADL:  'Agence nationale de l\'Amélioration et du Développement du Logement',
  CNI:   'Carte Nationale d\'Identité',
  DPO:   'Délégué à la Protection des Données',
  RGPD:  'Règlement Général sur la Protection des Données',
  KPI:   'Indicateur clé de performance — Chiffre mesurant l\'efficacité d\'un service (ex. nombre de dossiers traités, délai moyen).',
  RBAC:  'Contrôle d\'accès basé sur les rôles',
};
var ACRONYMES_AR = {
  ICUA:  'مؤشر المواطن الحضري — درجة شاملة (0-100) تقيس جودة الخدمات العمومية. كلما ارتفعت الدرجة، كانت الخدمة أفضل.',
  IQEP:  'مؤشر جودة الفضاء العام — تقييم (0-100) لحالة الحدائق والأرصفة والإنارة.',
  CAP:   'فرق الأعوان الميدانيين — أعوان ميدانيون يعاينون المشاكل ويرافقون المواطنين.',
  EPIC:  'مؤسسة عمومية ذات طابع صناعي وتجاري — هيئة عمومية (مياه، نظافة، إنارة) مكلفة بخدمة حضرية.',
  APC:   'المجلس الشعبي البلدي — إدارة بلديتك المحلية.',
  SLA:   'التزام بمهلة المعالجة — المدة القصوى (48 ساعة افتراضيا) لحل بلاغ. تجاوز المهلة يعني تأخرا.',
  SdC:   'قاعة القيادة — شاشة القيادة المركزية لمتابعة نشاط الإقليم.',
  KPI:   'مؤشر أداء رئيسي — رقم يقيس فعالية خدمة (عدد الملفات المعالجة، متوسط المدة...).',
};
var ACRONYMES = ACRONYMES_FR;
function acro(code) {
  var dict = (currentLang === 'ar' && ACRONYMES_AR[code]) ? ACRONYMES_AR : ACRONYMES_FR;
  var def = dict[code] || ACRONYMES_FR[code] || code;
  return '<span class="acro" tabindex="0" data-def="' + escHtml(def) + '">' + escHtml(code) + '<sup style="font-size:9px;color:var(--muted);margin-left:1px;cursor:help;">?</sup></span>';
}

// ── Phase 2 — Helpers nouveau modèle (avec fallback sur role) ──
function hasFonction(fn) {
  if (!currentUser) return false;
  return currentUser.fonction === fn;
}
function hasCapacite(cap) {
  if (!currentUser) return false;
  return Array.isArray(currentUser.capacites) && currentUser.capacites.includes(cap);
}
function hasNiveau(niv) {
  if (!currentUser) return false;
  return currentUser.niveau_perimetre === niv;
}

// ── Phase 4B — Helpers simplifiés (wrappers purs du nouveau modèle) ──
// Les fallbacks sur role sont toujours dans hasFonction/hasCapacite/hasNiveau (retirés en 4C)
function isAdmin() {
  return hasCapacite('pilotage');
}
function isSuperAdmin() {
  return hasCapacite('validation') && hasNiveau('wilaya');
}
function isAgent() {
  return currentUser && !hasFonction('citoyen');
}
function canManagePatrimoine() {
  return hasCapacite('pilotage');
}
function canCreateCapIntervention() {
  return hasCapacite('pilotage');
}
function canManageCapAgents() {
  return isSuperAdmin();
}
function canPublishCommunique() {
  return hasCapacite('publication') || isSuperAdmin();
}
function canDeleteCommunique() {
  return hasCapacite('publication') || isSuperAdmin();
}

function scoreColor(score) {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#f97316';
  return '#EF4444';
}

function progressBarHTML(label, score) {
  const color = scoreColor(score);
  return `
    <div class="progress-bar-wrapper">
      <div class="progress-bar-header">
        <span style="font-weight:500;color:var(--gray-700)">${escHtml(label)}</span>
        <span style="font-weight:700;color:${color}">${score}/100</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width:${score}%;background:${color}"></div>
      </div>
    </div>`;
}


// ─── GOOGLE OAUTH ─────────────────────────────────────────
let _googleClientId = null;
let _googleReady = false;

// Appelé par le script GSI dès qu'il est chargé
window.onGoogleLibraryLoad = function() {
  _googleReady = true;
  if (_googleClientId) _setupGoogle();
};

async function initGoogleAuth() {
  try {
    const res = await fetch('/api/config/public');
    if (!res.ok) return;
    const cfg = await res.json();
    _googleClientId = cfg.googleClientId;
    if (!_googleClientId) return;
    if (_googleReady) _setupGoogle();
    // Sinon onGoogleLibraryLoad s'en chargera quand GSI sera prêt
  } catch(e) { console.warn('[GoogleAuth] init failed:', e.message); }
}

function _setupGoogle() {
  google.accounts.id.initialize({
    client_id: _googleClientId,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

function googleSignIn() {
  if (!_googleClientId || !_googleReady) {
    showToast(t('toast.chargement_en_cours'), 'info');
    // Retry init au cas où
    initGoogleAuth();
    return;
  }
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Fallback popup OAuth
      const params = new URLSearchParams({
        client_id: _googleClientId,
        redirect_uri: window.location.origin,
        response_type: 'id_token',
        scope: 'openid email profile',
        nonce: Math.random().toString(36).substring(2),
      });
      const popup = window.open('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString(), 'google_auth', 'width=500,height=600,left=200,top=100');
      if (!popup) showToast(t('toast.autoriser_popups'), 'error');
    }
  });
}

async function handleGoogleCredential(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur || data.message || 'Erreur connexion Google');
    saveAuth(data.token, data.utilisateur);
    initApp();
  } catch(e) {
    showError('auth-error', e.message);
  }
}

// ─── AUTH TABS ────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  hideError('auth-error');
  // Mobile: réduire le padding-top et activer le scroll pour le formulaire d'inscription
  const wrapper = document.querySelector('.auth-wrapper');
  if (wrapper) {
    wrapper.classList.toggle('register-active', tab === 'register');
    wrapper.scrollTop = 0;
  }
}

// ─── PASSWORD EYE TOGGLE ─────────────────────────────────
function togglePwdEye(btn) {
  var input = btn.parentElement.querySelector('input[type="password"], input[type="text"]');
  if (!input) return;
  var show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.querySelector('.eye-off').style.display = show ? 'none' : '';
  btn.querySelector('.eye-on').style.display = show ? '' : 'none';
}

// ─── FORGOT PASSWORD ─────────────────────────────────────
function showForgotPassword() {
  var isAr = currentLang === 'ar';
  var html = '<div style="padding:4px;">' +
    '<p style="font-size:13px;color:var(--muted);margin-bottom:12px;">' + (isAr ? 'أدخل رقم هاتفك أو بريدك الإلكتروني' : 'Entrez votre numéro de téléphone ou e-mail') + '</p>' +
    '<input type="text" id="forgot-id" placeholder="' + (isAr ? '0770000000 أو email@exemple.com' : '0770000000 ou email@exemple.com') + '" style="width:100%;padding:10px 14px;border:1px solid var(--line);border-radius:10px;font-size:14px;margin-bottom:12px;">' +
    '<button class="btn btn-primary" style="width:100%;" onclick="submitForgot()">' + (isAr ? 'إرسال' : 'Envoyer') + '</button>' +
    '<div id="forgot-msg" style="margin-top:10px;font-size:12px;color:var(--muted);text-align:center;"></div></div>';
  showModal(isAr ? 'استعادة كلمة المرور' : 'Mot de passe oublié', html);
}
async function submitForgot() {
  var id = (document.getElementById('forgot-id')?.value||'').trim();
  var msgEl = document.getElementById('forgot-msg');
  if (!id) return;
  try {
    var res = await fetch('/api/auth/forgot', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({identifiant:id}) });
    var data = await res.json();
    if (msgEl) msgEl.textContent = data.message || (currentLang==='ar' ? 'إذا كان الحساب موجودًا، تم إرسال رابط.' : 'Si ce compte existe, un lien a été envoyé.');
  } catch(e) { if (msgEl) msgEl.textContent = 'Erreur réseau.'; }
}

// ─── RESET PASSWORD (from ?reset=TOKEN in URL) ───────────
function checkResetToken() {
  var token = new URLSearchParams(window.location.search).get('reset');
  if (!token) return false;
  var isAr = currentLang === 'ar';
  var authPage = document.getElementById('auth-page');
  if (authPage) authPage.style.display = 'flex';
  var card = document.querySelector('.auth-card');
  if (card) card.innerHTML = '<div style="padding:24px;"><h2 style="color:#0B2B4D;margin:0 0 12px;">' + (isAr?'كلمة مرور جديدة':'Nouveau mot de passe') + '</h2>' +
    '<div class="form-group" style="margin-bottom:12px;position:relative;"><input type="password" id="reset-pwd" placeholder="' + (isAr?'6 أحرف كحد أدنى':'Min 6 caractères') + '" required minlength="6" style="width:100%;padding:10px 44px 10px 14px;border:1px solid var(--line);border-radius:10px;font-size:14px;">' +
    '<button type="button" class="pwd-eye" onclick="togglePwdEye(this)" tabindex="-1"><svg class="eye-off" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg><svg class="eye-on" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div>' +
    '<button class="btn btn-primary" style="width:100%;" onclick="submitReset(\'' + token + '\')">' + (isAr?'تأكيد':'Confirmer') + '</button>' +
    '<div id="reset-msg" style="margin-top:10px;font-size:12px;text-align:center;"></div></div>';
  return true;
}
async function submitReset(token) {
  var pwd = document.getElementById('reset-pwd')?.value;
  var msgEl = document.getElementById('reset-msg');
  if (!pwd || pwd.length < 6) { if(msgEl) msgEl.textContent = '6 caractères minimum.'; return; }
  try {
    var res = await fetch('/api/auth/reset', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token:token,motDePasse:pwd}) });
    var data = await res.json();
    if (data.ok) { if(msgEl){msgEl.style.color='#16a34a';msgEl.textContent=currentLang==='ar'?'تم تغيير كلمة المرور.':'Mot de passe modifié. Redirection...';} setTimeout(function(){window.location.href='/';},2000); }
    else { if(msgEl){msgEl.style.color='#EF4444';msgEl.textContent=data.erreur||'Erreur';} }
  } catch(e) { if(msgEl){msgEl.style.color='#EF4444';msgEl.textContent='Erreur réseau.';} }
}

// ─── LOGIN ────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  hideError('auth-error');
  const telephone = document.getElementById('login-tel').value.trim();
  const motDePasse = document.getElementById('login-mdp').value;
  setLoading('login-btn', 'login-btn-text', 'login-btn-spinner', true);
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telephone, motDePasse })
    });
    const data = await res.json();
    if (res.status === 403 && data.confirmation_requise) {
      _pendingConfirmTel = data.telephone || telephone;
      showConfirmCodeScreen();
      return;
    }
    if (!res.ok) throw new Error(data.erreur || data.message || data.error || t('auth.identifiants_incorrects'));
    saveAuth(data.token, data.utilisateur);
    initApp();
  } catch (err) {
    showError('auth-error', err.message);
  } finally {
    setLoading('login-btn', 'login-btn-text', 'login-btn-spinner', false);
  }
}

// ─── REGISTER ─────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  hideError('auth-error');

  // Validation front
  if (!document.getElementById('reg-cgu').checked) {
    showError('auth-error', t('auth.cgu_requis'));
    return;
  }
  const email = document.getElementById('reg-email').value.trim();
  if (!email) {
    showError('auth-error', t('auth.email_requis'));
    return;
  }

  const body = {
    telephone: document.getElementById('reg-tel').value.trim(),
    motDePasse: document.getElementById('reg-mdp').value,
    nom: document.getElementById('reg-nom').value.trim(),
    prenom: document.getElementById('reg-prenom').value.trim(),
    email: email,
    communeId: document.getElementById('reg-commune').value ? Number(document.getElementById('reg-commune').value) : undefined
  };
  setLoading('reg-btn', 'reg-btn-text', 'reg-btn-spinner', true);
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur || data.message || data.error || t('auth.erreur_inscription'));

    if (data.confirmation_requise) {
      // Afficher l'écran de confirmation
      _pendingConfirmTel = data.telephone || body.telephone;
      showConfirmCodeScreen();
    } else {
      saveAuth(data.token, data.utilisateur);
      initApp();
    }
  } catch (err) {
    showError('auth-error', err.message);
  } finally {
    setLoading('reg-btn', 'reg-btn-text', 'reg-btn-spinner', false);
  }
}

var _pendingConfirmTel = null;

function showConfirmCodeScreen() {
  // Remplacer le formulaire par l'écran de saisie du code
  var authBody = document.querySelector('.auth-body') || document.querySelector('.auth-forms');
  if (!authBody) return;
  authBody.innerHTML =
    '<div style="text-align:center;padding:24px 16px;">' +
      '<div style="font-size:48px;margin-bottom:12px;">📧</div>' +
      '<h2 style="color:var(--navy);margin:0 0 8px;font-size:20px;">Confirmez votre compte</h2>' +
      '<p style="font-size:14px;color:var(--muted);margin-bottom:20px;line-height:1.5;">Un code à 6 chiffres a été envoyé à votre adresse email. Entrez-le ci-dessous pour activer votre compte.</p>' +
      '<input type="text" id="confirm-code" maxlength="6" placeholder="000000" style="text-align:center;font-size:28px;font-weight:800;letter-spacing:6px;padding:14px 20px;border:2px solid var(--line);border-radius:14px;width:200px;margin:0 auto 16px;display:block;" autocomplete="one-time-code" inputmode="numeric">' +
      '<div id="confirm-error" style="color:#EF4444;font-size:13px;margin-bottom:12px;display:none;"></div>' +
      '<button onclick="submitConfirmCode()" style="background:#7C3AED;color:white;border:none;border-radius:14px;padding:14px 32px;font-size:16px;font-weight:700;cursor:pointer;width:100%;max-width:280px;">Activer mon compte</button>' +
      '<div id="confirm-resend-msg" style="display:none;color:#16a34a;font-size:13px;margin-top:12px;"></div>' +
      '<p style="font-size:12px;color:var(--muted);margin-top:16px;">Le code est valable 30 minutes. Vérifiez aussi vos spams.<br><a href="#" onclick="resendCode();return false;" style="color:#7C3AED;font-weight:600;text-decoration:none;">Renvoyer le code</a></p>' +
    '</div>';
}

async function resendCode() {
  if (!_pendingConfirmTel) return;
  try {
    var res = await fetch('/api/auth/resend-code', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telephone: _pendingConfirmTel })
    });
    var data = await res.json();
    var msgEl = document.getElementById('confirm-resend-msg');
    if (res.ok) {
      if (msgEl) { msgEl.textContent = 'Un nouveau code a été envoyé à votre email.'; msgEl.style.display = ''; msgEl.style.color = '#16a34a'; }
    } else {
      if (msgEl) { msgEl.textContent = data.erreur || 'Erreur'; msgEl.style.display = ''; msgEl.style.color = '#EF4444'; }
    }
  } catch(e) {
    var msgEl = document.getElementById('confirm-resend-msg');
    if (msgEl) { msgEl.textContent = e.message; msgEl.style.display = ''; msgEl.style.color = '#EF4444'; }
  }
}

async function submitConfirmCode() {
  var code = document.getElementById('confirm-code').value.trim();
  var errEl = document.getElementById('confirm-error');
  if (!code || code.length !== 6) {
    errEl.textContent = 'Entrez le code à 6 chiffres.';
    errEl.style.display = '';
    return;
  }
  errEl.style.display = 'none';
  try {
    var res = await fetch('/api/auth/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telephone: _pendingConfirmTel, code: code })
    });
    var data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.erreur || data.message || 'Code incorrect.';
      errEl.style.display = '';
      return;
    }
    saveAuth(data.token, data.utilisateur);
    initApp();
  } catch(e) {
    errEl.textContent = e.message;
    errEl.style.display = '';
  }
}

// ─── LOGOUT ───────────────────────────────────────────────
function handleLogout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  currentUser = null;
  communes = [];
  rdvServices = [];
  selectedCreneauId = null;
  _equipLoaded = false;
  _equipAllData = [];
  sigFamillesData = null;
  _bandeauData = [];
  if (_bandeauTimer) { clearInterval(_bandeauTimer); _bandeauTimer = null; }
  // Reset UI state
  document.getElementById('auth-page').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  // Clear nav
  var navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) navAvatar.textContent = '?';
  var navUsername = document.getElementById('nav-username');
  if (navUsername) navUsername.textContent = '';
  var welcomeName = document.getElementById('welcome-name');
  if (welcomeName) welcomeName.textContent = '';
  // Hide admin elements
  ['nav-dashboard','nav-patrimoine','nav-cap','nav-civipark','nav-operateur',
   'home-admin-card','home-patrimoine-card','home-cap-card','home-civipark-card',
   'admin-nav-label'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  // Hide bandeau
  var bandeau = document.getElementById('bandeau-communiques');
  if (bandeau) bandeau.classList.add('hidden');
  // Clear active views to prevent flash of previous profile on next login
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
}

// ─── INIT APP ─────────────────────────────────────────────
// Injecter croix de fermeture sur tous les modals qui n'en ont pas
(function() {
  document.querySelectorAll('.bo-modal').forEach(function(modal) {
    var content = modal.querySelector('.bo-modal-content');
    if (!content) return;
    if (content.querySelector('[aria-label="Fermer"]')) return; // déjà une croix
    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Fermer');
    closeBtn.style.cssText = 'position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;color:var(--muted);cursor:pointer;line-height:1;padding:4px;z-index:1;';
    closeBtn.textContent = '✕';
    closeBtn.onclick = function() { modal.classList.add('hidden'); };
    content.style.position = 'relative';
    content.insertBefore(closeBtn, content.firstChild);
    // Ajouter du padding-right au premier h4 pour ne pas chevaucher
    var h4 = content.querySelector('h4');
    if (h4) h4.style.paddingRight = '30px';
  });
})();

async function initApp() {
  document.getElementById('auth-page').style.display = 'none';
  var authLang = document.querySelector('.auth-lang');
  if (authLang) authLang.style.display = 'none';
  // #app visibility deferred until showView() — prevents flash of previous profile

  // Refresh user data from server to avoid stale cache
  try {
    var freshUser = await safeFetchJSON('/api/auth/me', {}, true);
    if (freshUser && freshUser.id) {
      currentUser = freshUser;
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    }
  } catch(e) { console.warn('[initApp] refresh user failed', e.message); }

  // Populate nav
  const u = currentUser;
  const role = u ? u.role : 'citoyen';
  const initials = ((u.prenom || '')[0] || '') + ((u.nom || '')[0] || '');
  document.getElementById('nav-avatar').textContent = initials.toUpperCase() || '?';
  const navUsername = document.getElementById('nav-username');
  navUsername.textContent = (u.prenom || u.nom || t('nav.utilisateur'));
  navUsername.removeAttribute('data-i18n');

  // ── Sidebar par fonction (avec fallback sur rôle) ──
  var allNavItems = document.querySelectorAll('.sidebar .nav-item, .sidebar .nav-label, .sidebar .nav-divider');
  // Transverses (profil, notifications, aide, déconnexion) vivent UNIQUEMENT dans le menu avatar
  var menusByFonction = {
    citoyen:              ['home','civiadmin','signaler','infos','communiques','carte','mobilite','participe','mes-signalements','sentinelle'],
    agent_traitant:       ['bo-agent'],
    cap:                  ['bo-cap'],
    entite_responsable:   hasCapacite('civipark') ? ['civipark','mes-chantiers-ccoe'] : hasCapacite('patrimoine') ? ['patrimoine','mes-chantiers-ccoe'] : hasCapacite('collecte_dechets') ? ['bo-agent','collecte-dechets','mes-chantiers-ccoe'] : ['bo-agent','mes-chantiers-ccoe'],
    superviseur:          hasNiveau('wilaya') ? ['command-center','rapports','annuaire','admin-communiques','quartiers','edeval','bo-admin'] : ['bo-executive','rapports','annuaire','admin-communiques','quartiers','edeval'],
    cabinet:              ['ccoe','command-center'],
  };
  // Fallback : ancienne table par rôle pour les tokens sans fonction
  var menusByRole = {
    citoyen: ['home','civiadmin','signaler','infos','communiques','carte','mobilite','participe','mes-signalements','sentinelle'],
    agent: ['bo-agent'],
    operateur: ['bo-agent'],
    admin_apc: ['bo-executive','rapports','admin-communiques','quartiers','edeval'],
    admin_wilaya: ['command-center','rapports','admin-communiques','quartiers','edeval','bo-admin'],
  };
  var fonction = u ? u.fonction : null;
  var allowedViews = (fonction && menusByFonction[fonction]) ? menusByFonction[fonction] : (menusByRole[role] || menusByRole.citoyen);
  allNavItems.forEach(function(item) {
    var view = item.dataset ? item.dataset.view : null;
    if (!view) {
      if (item.classList.contains('nav-label') || item.classList.contains('nav-divider')) { item.style.display = ''; }
      return;
    }
    if (allowedViews.includes(view)) { item.classList.remove('hidden'); item.style.display = ''; }
    else { item.classList.add('hidden'); item.style.display = 'none'; }
  });
  if (role === 'citoyen') {
    var adminLabel = document.getElementById('admin-nav-label');
    if (adminLabel) adminLabel.style.display = 'none';
  } else {
    // Masquer les éléments citoyen de la sidebar
    ['sidebar-slogan','sidebar-citoyen-label','sidebar-citoyen-divider','sidebar-citoyen-services'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.style.display = 'none';
    });
    var adminLabel = document.getElementById('admin-nav-label');
    if (adminLabel) { adminLabel.classList.remove('hidden'); adminLabel.style.display = ''; }
    var sysDivider = document.getElementById('admin-sys-divider');
    var sysLabel = document.getElementById('admin-sys-label');
    if (role === 'admin_wilaya') {
      if (sysDivider) { sysDivider.classList.remove('hidden'); sysDivider.style.display = ''; }
      if (sysLabel) { sysLabel.classList.remove('hidden'); sysLabel.style.display = ''; }
    } else {
      if (sysDivider) sysDivider.style.display = 'none';
      if (sysLabel) sysLabel.style.display = 'none';
    }
  }
  // Bloc transversal supprimé de la sidebar — tout vit dans le menu avatar
  var transDiv = document.getElementById('sidebar-transversal-divider');
  var transLabel = document.getElementById('sidebar-transversal-label');
  var navDeconnexion = document.getElementById('nav-deconnexion');
  if (transDiv) transDiv.style.display = 'none';
  if (transLabel) transLabel.style.display = 'none';
  if (navDeconnexion) navDeconnexion.style.display = 'none';
  var bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) { bottomNav.style.display = role === 'citoyen' ? '' : 'none'; }
  // CC bottom nav: handled by showView based on current view + role + screen width
  var hamburgerBtn = document.querySelector('.hamburger-btn');
  if (hamburgerBtn) { hamburgerBtn.style.display = role === 'citoyen' ? 'none' : ''; }
  var appFooter = document.getElementById('app-footer');
  if (appFooter) { appFooter.style.display = role === 'citoyen' ? '' : 'none'; }
  // Menu dropdown — masquer les entrées citoyennes pour les profils professionnels
  var menuEspCit = document.getElementById('menu-espace-citoyen');
  if (menuEspCit) menuEspCit.style.display = role === 'citoyen' ? '' : 'none';

  var welcomeEl = document.getElementById('welcome-name');
  if (welcomeEl && role === 'citoyen') {
    welcomeEl.textContent = t('home.bienvenue', null, { name: u.prenom || u.nom || t('home.citoyen') });
  }

  await loadCommunes();
  if (role === 'citoyen') await loadRdvServices();

  // Mettre à jour le label SdC dans la sidebar dès le login (avant applyTranslations)
  var sdcLabel = document.getElementById('sidebar-sdc-label');
  if (sdcLabel && u && (role !== 'citoyen')) {
    var isComm = hasNiveau('commune');
    var isAr = currentLang === 'ar';
    if (isComm && u.commune_id && communes.length) {
      var mc = communes.find(function(x){return x.id === u.commune_id;});
      var cNom = mc ? mc.nom : '';
      var cNomAr = mc ? (mc.nom_ar || mc.nom) : '';
      sdcLabel.textContent = isAr ? 'قاعة القيادة — بلدية ' + cNomAr : 'Salle de Commandement — APC de ' + cNom;
    } else {
      sdcLabel.textContent = isAr ? 'قاعة القيادة — الولاية' : 'Salle de Commandement — Wilaya';
    }
  }

  if (role === 'admin_apc' || role === 'admin_wilaya') {
    var csExport = document.getElementById('cs-export-csv-btn');
    var wsExport = document.getElementById('ws-export-csv-btn');
    if (csExport) csExport.style.display = '';
    if (wsExport) wsExport.style.display = '';
  }

  var startView = getDefaultView();

  showView(startView);
  document.getElementById('app').style.display = 'flex';
  if (role === 'citoyen') loadHomePoints();
  applyTranslations();
  loadCommuniques();
  loadNotifBadge();
  var fab = document.getElementById('saksini-fab');
  if (fab) fab.style.display = (role === 'citoyen') ? 'flex' : 'none';
}

// ─── COMMUNES ─────────────────────────────────────────────
async function loadCommunes() {
  try {
    communes = await safeFetchJSON('/api/referentiel/communes');
    populateCommuneSelects();
  } catch (e) { console.warn('communes load error', e); }
}

function populateCommuneSelects() {
  const selects = ['reg-commune', 'cs-commune', 'ws-commune', 'rdv-commune', 'cap-commune', 'cap-int-commune'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">' + t('global.selectionner_commune') + '</option>';
    communes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nom + (c.circonscription ? ` (${c.circonscription})` : '');
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  });
}

// ─── RDV SERVICES ─────────────────────────────────────────
async function loadRdvServices() {
  try {
    rdvServices = await safeFetchJSON('/api/rdv/services');
    const sel = document.getElementById('rdv-service');
    if (!sel) return;
    sel.innerHTML = '<option value="">' + t('rdv.sel_service') + '</option>';
    // Grouper par catégorie
    const cats = {};
    rdvServices.forEach(s => {
      const cat = s.categorie || 'autre';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(s);
    });
    const catLabels = { urbanisme: t('rdv.cat_urbanisme'), logement: t('rdv.cat_logement'), certificats: t('rdv.cat_certificats'), biometrique: t('rdv.cat_biometrique'), etat_civil: t('rdv.cat_etat_civil'), identite: t('rdv.cat_identite'), autre: t('rdv.cat_autre') };
    for (const [cat, svcs] of Object.entries(cats)) {
      const grp = document.createElement('optgroup');
      grp.label = (catLabels[cat] || cat) + (svcs[0]?.famille === 'A' ? ' [A — en ligne]' : ' [B — présentiel]');
      svcs.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.nom;
        opt.dataset.famille = s.famille || '';
        grp.appendChild(opt);
      });
      sel.appendChild(grp);
    }
    // Listener pour afficher détail démarche
    sel.addEventListener('change', showDemarcheDetail);
  } catch (e) { console.warn('rdv services load error', e); }
}

function showDemarcheDetail() {
  const sel = document.getElementById('rdv-service');
  const svc = rdvServices.find(s => s.id === Number(sel.value));
  const panel = document.getElementById('rdv-demarche-detail');
  if (!svc || !sel.value) { panel.classList.add('hidden'); return; }
  if (svc.famille === 'A') { panel.classList.add('hidden'); return; }

  const pieces = svc.pieces_requises || [];
  const questions = svc.assistant_questions || [];
  const hasAssistant = questions.length > 0;

  let html = `<div style="margin-bottom:12px;">
    <h4 style="color:var(--navy);margin:0 0 4px;">${escHtml(svc.nom)}</h4>
    ${svc.description ? `<p style="font-size:12px;color:var(--muted);margin:0 0 8px;">${escHtml(svc.description)}</p>` : ''}
  </div>`;

  // Délai + frais
  html += `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
    ${svc.delai_reel ? `<div style="padding:6px 10px;background:#fef3c7;border-radius:8px;font-size:12px;"><strong>${t('rdv.delai')} :</strong> ${escHtml(svc.delai_reel)}</div>` : ''}
    ${svc.frais ? `<div style="padding:6px 10px;background:#F5F3FF;border-radius:8px;font-size:12px;"><strong>${t('rdv.frais')} :</strong> ${escHtml(svc.frais)}</div>` : ''}
  </div>`;

  // Mini-assistant (qualification)
  if (hasAssistant) {
    html += `<div style="margin-bottom:12px;padding:10px;background:#eff6ff;border-radius:8px;">
      <h5 style="margin:0 0 8px;font-size:13px;color:#2563eb;">${t('rdv.assistant_titre')}</h5>
      <div id="rdv-assistant-flow"></div>
    </div>`;
  }

  // Checklist pièces requises
  if (pieces.length) {
    html += `<div style="margin-bottom:12px;">
      <h5 style="margin:0 0 6px;font-size:13px;">${t('rdv.pieces_titre')}</h5>
      <div id="rdv-checklist">
        ${pieces.map((p, i) => `
          <label style="display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:6px;background:white;border:1px solid var(--line);border-radius:10px;cursor:pointer;transition:background 0.15s;">
            <input type="checkbox" class="rdv-piece-check" data-idx="${i}" style="width:18px;height:18px;accent-color:var(--green);flex-shrink:0;">
            <span style="font-size:13px;color:var(--navy);line-height:1.5;flex:1;">${escHtml(p)}</span>
          </label>`).join('')}
      </div>
      <div id="rdv-checklist-status" style="font-size:11px;margin-top:4px;color:var(--muted);"></div>
    </div>`;
  }

  // Formulaires
  if (svc.formulaires && svc.formulaires.length) {
    html += `<div style="margin-bottom:8px;">
      <h5 style="margin:0 0 4px;font-size:13px;">${t('rdv.formulaires_titre')}</h5>
      ${svc.formulaires.map(f => `<div style="font-size:12px;color:var(--muted);">📄 ${escHtml(f)}</div>`).join('')}
    </div>`;
  }

  panel.classList.remove('hidden');
  document.getElementById('rdv-demarche-content').innerHTML = html;

  // Init assistant
  if (hasAssistant) initAssistant(questions);

  // Init checklist listeners
  document.querySelectorAll('.rdv-piece-check').forEach(cb => {
    cb.addEventListener('change', updateChecklistStatus);
  });
  updateChecklistStatus();
}

function updateChecklistStatus() {
  const checks = document.querySelectorAll('.rdv-piece-check');
  if (!checks.length) return;
  const total = checks.length;
  const done = [...checks].filter(c => c.checked).length;
  const el = document.getElementById('rdv-checklist-status');
  if (el) {
    if (done === total) el.innerHTML = `<span style="color:var(--green);font-weight:600;">${t('rdv.checklist_complet')}</span>`;
    else el.textContent = `${done}/${total} ${t('rdv.checklist_progression')}`;
  }
}

function initAssistant(questions) {
  const flow = document.getElementById('rdv-assistant-flow');
  if (!flow) return;
  let step = 0;
  function renderStep() {
    if (step >= questions.length) {
      flow.innerHTML = `<div style="color:var(--green);font-weight:600;font-size:13px;">${t('rdv.assistant_ok')}</div>`;
      return;
    }
    const q = questions[step];
    flow.innerHTML = `
      <div style="font-size:13px;margin-bottom:6px;font-weight:500;">${escHtml(q.q)}</div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-sm btn-primary" onclick="rdvAssistantAnswer(true)">${t('global.oui')}</button>
        <button class="btn btn-sm btn-outline" onclick="rdvAssistantAnswer(false)">${t('global.non')}</button>
      </div>`;
  }
  window._rdvAssistantQuestions = questions;
  window._rdvAssistantStep = step;
  window.rdvAssistantAnswer = function(isOui) {
    const q = window._rdvAssistantQuestions[window._rdvAssistantStep];
    if (isOui) {
      if (q.oui === 'next') { window._rdvAssistantStep++; renderStep(); }
      else { flow.innerHTML = `<div style="color:var(--gold);font-size:12px;">${escHtml(q.oui)}</div>`; }
    } else {
      if (q.non === 'next') { window._rdvAssistantStep++; renderStep(); }
      else { flow.innerHTML = `<div style="color:var(--red);font-size:12px;">${escHtml(q.non)}</div>`; }
    }
  };
  renderStep();
}

// ─── VIEW SWITCHING ───────────────────────────────────────
// Mapping sous-vue → univers pour highlight sidebar/bottom nav
const UNIVERS_MAP = {
  civiadmin: 'demarches',
  signaler: 'signale', civisignal: 'signale', watersignal: 'signale',
  carte: 'quartier', parkzones: 'quartier', equipements: 'quartier', proprete: 'quartier',
  participe: 'participe',
  'mes-signalements': 'suivi',
  sentinelle: 'profil'
};

function getDefaultView() {
  if (!currentUser) return 'home';
  // Nouveau modèle : par fonction + niveau
  var fn = currentUser.fonction;
  if (fn === 'agent_traitant') return 'bo-agent';
  if (fn === 'cap') return 'bo-cap';
  if (fn === 'entite_responsable') return hasCapacite('civipark') ? 'civipark' : hasCapacite('patrimoine') ? 'patrimoine' : 'bo-agent';
  if (fn === 'superviseur') return hasNiveau('wilaya') ? 'command-center' : 'bo-executive';
  if (fn === 'cabinet') return 'ccoe';
  if (fn === 'citoyen') return 'home';
  // Fallback sur role
  var r = currentUser.role;
  if (r === 'agent') return 'bo-agent';
  if (r === 'operateur') return hasCapacite('civipark') ? 'civipark' : hasCapacite('patrimoine') ? 'patrimoine' : 'bo-agent';
  if (r === 'admin_apc') return 'bo-executive';
  if (r === 'admin_wilaya') return 'command-center';
  return 'home';
}

function toggleMobileSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  var isOpen = sidebar.classList.contains('mobile-open');
  sidebar.classList.toggle('mobile-open', !isOpen);
  if (overlay) overlay.classList.toggle('active', !isOpen);
}

function showView(name) {
  // Close mobile sidebar on navigation
  var sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');
  var overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.classList.remove('active');
  // ── Route guards par rôle ──
  var role = currentUser ? currentUser.role : 'citoyen';
  var isCitoyen = role === 'citoyen';
  var isInternal = ['agent','operateur','admin_apc','admin_wilaya'].includes(role);

  // Vues autorisées par rôle (doit correspondre à menusByRole dans initApp)
  // Vues autorisées par fonction (avec fallback sur rôle)
  var viewsByFonction = {
    citoyen:              ['home','civiadmin','signaler','civisignal','watersignal','infos','communiques','carte','proprete','parkzones','equipements','mobilite','participe','mes-signalements','perdu-trouve','sentinelle','profil','parametres','notifications','securite','espace-citoyen','aide','a-propos','wilaya','legal','cap'],
    agent_traitant:       ['bo-agent','perdu-trouve','profil','parametres','a-propos','aide','notifications'],
    cap:                  ['bo-cap','signaler','profil','parametres','a-propos','aide','notifications'],
    entite_responsable:   hasCapacite('civipark') ? ['civipark','mes-chantiers-ccoe','profil','parametres','a-propos','aide','notifications'] : hasCapacite('patrimoine') ? ['patrimoine','mes-chantiers-ccoe','profil','parametres','a-propos','aide','notifications'] : hasCapacite('collecte_dechets') ? ['bo-agent','collecte-dechets','mes-chantiers-ccoe','profil','parametres','a-propos','aide','notifications'] : ['bo-agent','mes-chantiers-ccoe','profil','parametres','a-propos','aide','notifications'],
    superviseur:          hasNiveau('wilaya') ? ['bo-executive','command-center','rapports','annuaire','admin-communiques','quartiers','edeval','bo-admin','profil','parametres','a-propos','aide','notifications'] : ['bo-executive','rapports','annuaire','admin-communiques','quartiers','edeval','profil','parametres','a-propos','aide','notifications'],
    cabinet:              ['ccoe','command-center','profil','parametres','a-propos','aide','notifications'],
  };
  var viewsByRole = {
    citoyen: ['home','civiadmin','signaler','civisignal','watersignal','infos','communiques','carte','proprete','parkzones','equipements','mobilite','participe','mes-signalements','perdu-trouve','sentinelle','profil','parametres','notifications','securite','espace-citoyen','aide','a-propos','wilaya','legal','cap'],
    agent: ['bo-agent','perdu-trouve','profil','parametres','a-propos','aide','notifications'],
    operateur: hasCapacite('civipark') ? ['civipark','profil','parametres','a-propos','aide','notifications'] : hasCapacite('patrimoine') ? ['patrimoine','profil','parametres','a-propos','aide','notifications'] : ['bo-agent','profil','parametres','a-propos','aide','notifications'],
    admin_apc: ['bo-executive','admin-communiques','quartiers','edeval','profil','parametres','a-propos','aide','notifications'],
    admin_wilaya: ['bo-executive','command-center','admin-communiques','quartiers','edeval','bo-admin','profil','parametres','a-propos','aide','notifications'],
  };
  var userFonction = currentUser ? currentUser.fonction : null;
  var allowed = (userFonction && viewsByFonction[userFonction]) ? viewsByFonction[userFonction] : (viewsByRole[role] || viewsByRole.citoyen);

  // Redirection si vue non autorisée
  if (!allowed.includes(name)) {
    if (isInternal && ['home','civiadmin','signaler','carte','mes-signalements','sentinelle','communiques'].includes(name)) {
      name = getDefaultView();
    } else {
      showToast(t('global.acces_refuse') || 'Cette fonctionnalité n\'est pas disponible pour votre profil.', 'error');
      name = getDefaultView();
    }
  }

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');

  // Sidebar active — match by data-view OR by data-univers
  const univers = UNIVERS_MAP[name];
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active',
      item.dataset.view === name || (univers && item.dataset.univers === univers));
  });
  // Bottom nav active — same logic
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.toggle('active',
      item.dataset.view === name || (univers && item.dataset.univers === univers));
  });

  // CC bottom nav: show/hide based on view + role + width
  ccUpdateMobileNav(name);

  // Load data for specific views
  if (name === 'signaler') initSignaler();
  if (name === 'civisignal') initCivisignal();
  if (name === 'watersignal') initWatersignal();
  if (name === 'civiadmin') { initCiviadmin(); initRdvAdminPanel(); }
  if (name === 'sentinelle') initSentinelle();
  if (name === 'dashboard') initDashboard();
  if (name === 'mes-signalements') initMesSignalements();
  if (name === 'carte') initCarte();
  if (name === 'edeval') initEdeval();
  if (name === 'parkzones') initParkzones();
  if (name === 'equipements') loadEquipements();
  if (name === 'infos') loadInfos();
  if (name === 'perdu-trouve') { document.getElementById('pt-form').style.display=''; document.getElementById('pt-success').style.display='none'; hideError('pt-error'); }
  if (name === 'communiques') initCommuniquesView();
  if (name === 'participe') loadParticipations();
  if (name === 'notifications') { initNotifFilters(); loadNotifications(); }
  if (name === 'cap') initCap();
  if (name === 'quartiers') initQuartiers();
  if (name === 'proprete') initProprete();
  if (name === 'civipark') initCivipark();
  if (name === 'patrimoine') initPatrimoine();
  if (name === 'operateur') initOperateur();
  if (name === 'profil') initProfil();
  if (name === 'a-propos') initApropos();
  if (name === 'aide') initAide();
  if (name === 'parametres') initParametres();
  if (name === 'espace-citoyen') initEspaceCitoyen();
  if (name === 'wilaya') initWilaya();
  if (name === 'bo-agent') initBoAgent();
  if (name === 'bo-cap') initBoCap();
  if (name === 'bo-responsable') initSupervision();
  if (name === 'bo-executive') initBoExecutive();
  if (name === 'rapports') initRapports();
  if (name === 'annuaire') annuaireInit();
  if (name === 'cockpit') cockpitLoad();
  if (name === 'command-center') ccLoad();
  if (name === 'bo-admin') initBoAdmin();
  if (name === 'ccoe') initCCOE();
  if (name === 'mes-chantiers-ccoe') initMesChantiersCCOE();
  if (name === 'securite') { /* static view, nothing to init */ }
  if (name === 'admin-communiques') loadAdminCommuniques();
  if (name === 'collecte-dechets') initCollecteDechets();

  window.scrollTo(0, 0);
  applyTranslations();
}

// ─── USER DROPDOWN ───────────────────────────────────────────
function toggleUserDropdown() {
  var dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('hidden');
}
// Fermer si clic en dehors
document.addEventListener('click', function(e) {
  var dd = document.getElementById('user-dropdown');
  var badge = e.target.closest('.user-badge');
  if (dd && !badge) dd.classList.add('hidden');
});

// ─── HOME DASHBOARD ──────────────────────────────────────────
async function loadHomePoints() {
  // Date du jour
  const dateEl = document.getElementById('home-date');
  if (dateEl) dateEl.textContent = '📅 ' + new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : 'fr-DZ', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  // Météo statique Alger (pas de données temps réel)
  const meteoEl = document.getElementById('home-meteo');
  if (meteoEl) {
    const month = new Date().getMonth();
    const temps = [14,15,17,19,22,26,30,31,28,23,18,15];
    const labels = ['Frais','Frais','Doux','Doux','Agréable','Ensoleillé','Chaud','Chaud','Agréable','Doux','Frais','Frais'];
    const labelsAr = ['بارد','بارد','معتدل','معتدل','لطيف','مشمس','حار','حار','لطيف','معتدل','بارد','بارد'];
    const t = temps[month]; const l = currentLang === 'ar' ? labelsAr[month] : labels[month];
    meteoEl.textContent = '☀️ ' + t + '°C · ' + l + ' · Alger';
  }
  // Duplicate to mobile elements
  var dateMob = document.getElementById('home-date-mobile');
  var meteoMob = document.getElementById('home-meteo-mobile');
  if (dateMob && dateEl) dateMob.textContent = dateEl.textContent;
  if (meteoMob && meteoEl) meteoMob.textContent = meteoEl.textContent;

  // Carte mobilité : alt i18n + fallback si image externe échoue
  var mobImg = document.getElementById('home-mobilite-img');
  if (mobImg) {
    mobImg.alt = t('home.mobilite_alt');
    mobImg.onerror = function() { this.style.display = 'none'; var fb = document.getElementById('home-mobilite-fallback'); if (fb) fb.style.display = ''; };
  }

  try {
    var data;
    try { data = await safeFetchJSON('/api/dashboard/citoyen', {}, true); }
    catch(e) {
      // Fallback: charger les points depuis /api/points/moi
      try {
        var ptsData = await safeFetchJSON('/api/points/moi', {}, true);
        data = { points: ptsData.points || 0, signalements: {ouverts:0,resolus:0}, notifications_non_lues: 0, iqep: null, communiques: [], activite_recente: ptsData.journal || [] };
      } catch(e2) { data = { points: 0, signalements: {ouverts:0,resolus:0}, notifications_non_lues: 0, iqep: null, communiques: [], activite_recente: [] }; }
    }

    // Points
    var pts = data.points || 0;
    document.getElementById('home-points').textContent = pts + ' ' + t('sent.points_accumules');
    var ptsMob = document.getElementById('home-points-mobile');
    if (ptsMob) ptsMob.textContent = pts + ' pts';
    var ptsBottom = document.getElementById('home-points-bottom');
    if (ptsBottom) ptsBottom.textContent = pts + ' pts';

    // Cartes dashboard
    const dash = document.getElementById('home-dashboard');
    if (dash) {
      const cards = [
        { v: data.signalements?.ouverts || 0, l: t('home.sig_ouverts'), c: '#ef4444', click: "showView('mes-signalements')" },
        { v: data.signalements?.resolus || 0, l: t('home.sig_resolus'), c: '#16a34a', click: "showView('mes-signalements')" },
        { v: data.notifications_non_lues || 0, l: t('notif.titre'), c: '#2563eb', click: "showView('notifications')" },
      ];
      if (data.prochain_rdv) {
        const dt = new Date(data.prochain_rdv.debut);
        cards.push({ v: dt.toLocaleDateString('fr-DZ',{day:'numeric',month:'short'}), l: data.prochain_rdv.service, c: '#f59e0b', click: "showView('civiadmin')" });
      }
      dash.innerHTML = cards.map(function(c) {
        return '<div onclick="' + c.click + '" style="flex:1;min-width:90px;padding:10px 12px;background:rgba(255,255,255,0.88);border-left:2px solid ' + c.c + ';border-radius:12px;cursor:pointer;transition:all .15s ease;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background=\'rgba(255,255,255,0.98)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.88)\'">' +
          '<div style="font-size:18px;font-weight:800;color:' + c.c + ';line-height:1;">' + c.v + '</div>' +
          '<div style="font-size:10px;color:var(--muted);line-height:1.2;">' + c.l + '</div></div>';
      }).join('');
    }

    // Communiqués récents
    const comEl = document.getElementById('home-communiques');
    if (comEl && data.communiques && data.communiques.length) {
      comEl.innerHTML = '<h3 style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:6px;">' + t('communiques.titre') + '</h3>' +
        data.communiques.map(function(c) {
          var icon = c.niveau === 'urgent' ? '🔴' : c.niveau === 'important' ? '🔵' : '📢';
          return '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--gray-100);">' + icon + ' <strong>' + escHtml(c.titre) + '</strong> — ' + escHtml(c.message) + '</div>';
        }).join('');
    }

    // Activité récente
    var actEl = document.getElementById('home-activite');
    if (actEl && data.activite_recente && data.activite_recente.length) {
      actEl.innerHTML = '<h3 style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:6px;">' + t('home.activite') + '</h3>' +
        data.activite_recente.map(function(a) {
          return '<div style="font-size:12px;padding:4px 0;color:var(--muted);">' +
            (a.delta > 0 ? '✅ +' + a.delta : '⬇️ ' + a.delta) + ' — ' + escHtml(a.motif) + ' · ' + fmtDate(a.le) + '</div>';
        }).join('');
    }
  } catch (e) { console.warn('dashboard load error', e); }

  // S'assurer que le bandeau et le badge notif sont chargés
  loadCommuniques();
  loadNotifBadge();
}

// ─── PROPRETE CATEGORIES ──────────────────────────────────
async function loadPropreteCategories() {
  try {
    const res = await fetch('/api/proprete/categories');
    const cats = await res.json();
    const sel = document.getElementById('cs-categorie');
    sel.innerHTML = '<option value="">' + t('cs.sel_categorie') + '</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.libelle || c.nom;
      sel.appendChild(opt);
    });
  } catch (e) {
    document.getElementById('cs-categorie').innerHTML = '<option value="">' + t('cs.erreur_cat') + '</option>';
  }
}

async function loadEauCategories() {
  try {
    const res = await fetch('/api/eau/categories');
    const cats = await res.json();
    const sel = document.getElementById('ws-categorie');
    sel.innerHTML = '<option value="">' + t('cs.sel_categorie') + '</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.libelle || c.nom;
      sel.appendChild(opt);
    });
  } catch (e) {
    document.getElementById('ws-categorie').innerHTML = '<option value="">' + t('cs.erreur_cat') + '</option>';
  }
}

// ─── CIVISIGNAL INIT ──────────────────────────────────────
async function initCivisignal() {
  await loadPropreteCategories();
  populateCommuneSelects();
  initMiniMap('cs');

  // Photo file label
  document.getElementById('cs-photo').addEventListener('change', function() {
    const nameEl = document.getElementById('cs-photo-name');
    if (this.files && this.files[0]) {
      photoFiles.cs = this.files[0];
      nameEl.textContent = '📎 ' + this.files[0].name;
      nameEl.classList.remove('hidden');
    }
  });

  if (isAgent()) {
    document.getElementById('cs-signals-admin').classList.remove('hidden');
    populateAgentFilters();
    await loadAgentSignals('proprete');
  }
}

// ─── WATERSIGNAL INIT ─────────────────────────────────────
async function initWatersignal() {
  await loadEauCategories();
  populateCommuneSelects();
  initMiniMap('ws');

  document.getElementById('ws-photo').addEventListener('change', function() {
    const nameEl = document.getElementById('ws-photo-name');
    if (this.files && this.files[0]) {
      photoFiles.ws = this.files[0];
      nameEl.textContent = '📎 ' + this.files[0].name;
      nameEl.classList.remove('hidden');
    }
  });

  if (isAgent()) {
    document.getElementById('ws-signals-admin').classList.remove('hidden');
    populateAgentFilters();
    await loadAgentSignals('eau');
  }
}

// ─── SIGNALEMENT SUBMIT ───────────────────────────────────
async function handleSignalement(e, domain) {
  e.preventDefault();
  const prefix = domain === 'proprete' ? 'cs' : 'ws';
  const errId  = domain === 'proprete' ? 'civisignal-error' : 'watersignal-error';
  const sucId  = domain === 'proprete' ? 'civisignal-success' : 'watersignal-success';

  hideError(errId);
  document.getElementById(sucId).classList.add('hidden');

  const categorieId  = document.getElementById(`${prefix}-categorie`).value;
  const communeId    = document.getElementById(`${prefix}-commune`).value;
  const description  = document.getElementById(`${prefix}-description`).value.trim();
  const lat          = document.getElementById(`${prefix}-lat`).value;
  const lng          = document.getElementById(`${prefix}-lng`).value;
  const photoInput   = document.getElementById(`${prefix}-photo`);

  if (!categorieId) { showError(errId, t('cs.sel_categorie_requis')); return; }

  setLoading(`${prefix}-submit-btn`, `${prefix}-submit-text`, `${prefix}-submit-spinner`, true);

  try {
    const fd = new FormData();
    fd.append('categorieId', categorieId);
    if (communeId) fd.append('communeId', communeId);
    if (description) fd.append('description', description);
    if (lat) fd.append('lat', lat);
    if (lng) fd.append('lng', lng);
    if (photoInput.files && photoInput.files[0]) fd.append('photo', photoInput.files[0]);

    const res = await apiFetch(`/api/${domain}/signalements`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: fd
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || t('sig.erreur_envoi'));

    showSuccess(sucId, `${t('sig.envoi_succes')} #${(data.signalement && data.signalement.reference) || data.reference || data.id || 'N/A'}`);
    // Save to localStorage for citizen "Mes Signalements"
    try {
      const commune = communes.find(c => String(c.id) === String(communeId));
      const categorieSel = document.getElementById(`${prefix}-categorie`);
      const categorieNom = categorieSel ? categorieSel.options[categorieSel.selectedIndex].text : '';
      const mesSignals = JSON.parse(localStorage.getItem('civismart_mes_signalements') || '[]');
      mesSignals.unshift({
        id: data.id || Date.now(),
        reference: data.reference || ('#' + (data.id || Date.now())),
        domaine: domain,
        categorie: categorieNom,
        commune: commune ? commune.nom : (communeId || ''),
        description: description,
        etat: data.etat || 'recu',
        cree_le: new Date().toISOString(),
        lat: lat || null,
        lng: lng || null
      });
      localStorage.setItem('civismart_mes_signalements', JSON.stringify(mesSignals));
    } catch(_) { console.warn('[signaler] échec sauvegarde locale signalement:', _.message); }
    document.getElementById(`${prefix === 'cs' ? 'civisignal' : 'watersignal'}-form`).reset();
    document.getElementById(`${prefix}-lat`).value = '';
    document.getElementById(`${prefix}-lng`).value = '';
    document.getElementById(`${prefix}-coords`).classList.add('hidden');
    document.getElementById(`${prefix}-photo-name`).classList.add('hidden');
    photoFiles[prefix] = null;

    if (isAdmin()) await loadAdminSignals(domain);
  } catch (err) {
    showError(errId, err.message);
  } finally {
    setLoading(`${prefix}-submit-btn`, `${prefix}-submit-text`, `${prefix}-submit-spinner`, false);
  }
}

// ─── ADMIN SIGNALS ────────────────────────────────────────
async function loadAdminSignals(domain) {
  // Recharge la liste agent après soumission d'un signalement
  await loadAgentSignals(domain);
}

// ─── CIVIADMIN INIT ───────────────────────────────────────
function initCiviadmin() {
  populateCommuneSelects();
  resetRDV();
  loadMesRDV();
}

async function loadCreneaux() {
  const communeId = document.getElementById('rdv-commune').value;
  const serviceId = document.getElementById('rdv-service').value;
  hideError('rdv-error');

  if (!communeId) { showError('rdv-error', t('rdv.sel_commune_requis')); return; }
  if (!serviceId) { showError('rdv-error', t('rdv.sel_service_requis')); return; }

  // Check famille
  const serviceOpt = document.querySelector(`#rdv-service option[value="${serviceId}"]`);
  const famille = serviceOpt ? serviceOpt.dataset.famille : '';
  if (famille === 'A') {
    document.getElementById('rdv-famille-a').classList.remove('hidden');
    document.getElementById('rdv-famille-a-msg').textContent = t('rdv.portail_msg');
    document.getElementById('rdv-step-2').classList.add('hidden');
    return;
  }

  document.getElementById('rdv-famille-a').classList.add('hidden');

  // Rediriger vers le wizard guichet pour les services famille B (créneaux dynamiques)
  _rdvWizServiceId = Number(serviceId);
  var svc = rdvServices ? rdvServices.find(function(s) { return s.id === _rdvWizServiceId; }) : null;
  document.getElementById('rdv-steps').classList.add('hidden');
  document.getElementById('rdv-step-1').classList.add('hidden');
  document.getElementById('rdv-demarche-detail').classList.add('hidden');
  document.getElementById('rdv-wizard').classList.remove('hidden');
  document.getElementById('rdv-wiz-step1').classList.remove('hidden');
  document.getElementById('rdv-wiz-step2').classList.add('hidden');
  document.getElementById('rdv-wiz-step3').classList.add('hidden');
  document.getElementById('rdv-wiz-service-label').textContent = (svc ? svc.nom : '');
  rdvLoadGuichets(_rdvWizServiceId);
  // Scroll le wizard dans la vue pour que l'utilisateur voie la transition
  document.getElementById('rdv-wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  return;

  /* ── ancien flux statique (conservé mais inatteignable) ── */
  document.getElementById('rdv-step-2').classList.remove('hidden');
  document.getElementById('rdv-creneaux-loading').classList.remove('hidden');
  document.getElementById('rdv-creneaux-grid').classList.add('hidden');
  document.getElementById('rdv-confirm-btn').classList.add('hidden');
  selectedCreneauId = null;

  setStep(2);

  try {
    const data = await safeFetchJSON(`/api/rdv/creneaux?communeId=${communeId}&serviceId=${serviceId}`);

    if (data.familleA) {
      document.getElementById('rdv-step-2').classList.add('hidden');
      document.getElementById('rdv-famille-a').classList.remove('hidden');
      document.getElementById('rdv-famille-a-msg').textContent = data.message || t('rdv.portail_msg');
      setStep(1);
      return;
    }

    document.getElementById('rdv-creneaux-loading').classList.add('hidden');
    const creneaux = data.creneaux || [];
    window._rdvCreneaux = creneaux;

    if (!creneaux.length) {
      document.getElementById('rdv-day-picker').classList.remove('hidden');
      document.getElementById('rdv-days').innerHTML = '<p style="color:var(--gray-400);padding:8px;">' + t('rdv.aucun_creneau') + '</p>';
      return;
    }

    // Grouper par jour
    const byDay = {};
    creneaux.forEach(cr => {
      const dt = new Date(cr.debut);
      const key = dt.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(cr);
    });
    const days = Object.keys(byDay).sort();

    // Afficher le picker jours
    const daysEl = document.getElementById('rdv-days');
    daysEl.innerHTML = days.map(day => {
      const dt = new Date(day + 'T12:00:00');
      const name = dt.toLocaleDateString('fr-DZ', { weekday: 'short' });
      const num = dt.getDate();
      const month = dt.toLocaleDateString('fr-DZ', { month: 'short' });
      const totalSlots = byDay[day].reduce((s, c) => s + Number(c.restants), 0);
      return `<div class="day-chip" onclick="rdvSelectDay('${day}')" data-day="${day}">
        <div class="day-name">${name}</div>
        <div class="day-num">${num}</div>
        <div class="day-month">${month}</div>
        <div class="day-slots">${totalSlots} ${t('rdv_admin.dispo')}</div>
      </div>`;
    }).join('');
    document.getElementById('rdv-day-picker').classList.remove('hidden');
    document.getElementById('rdv-time-picker').classList.add('hidden');

    // Auto-sélectionner le premier jour
    rdvSelectDay(days[0]);
  } catch (e) {
    document.getElementById('rdv-creneaux-loading').classList.add('hidden');
    showError('rdv-error', e.message);
    setStep(1);
  }
}

function rdvSelectDay(day) {
  // Highlight le jour sélectionné
  document.querySelectorAll('.day-chip').forEach(c => c.classList.toggle('selected', c.dataset.day === day));

  // Filtrer les créneaux de ce jour
  const creneaux = (window._rdvCreneaux || []).filter(cr => cr.debut.startsWith(day));
  const grid = document.getElementById('rdv-creneaux-grid');
  const dt = new Date(day + 'T12:00:00');
  document.getElementById('rdv-time-label').textContent = t('rdv.horaires_du') + ' ' + dt.toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' });

  grid.innerHTML = creneaux.map(cr => {
    const t2 = new Date(cr.debut);
    const timeStr = t2.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' });
    const restants = Number(cr.restants);
    const capacite = Number(cr.capacite);
    return `
    <div class="creneau-card" onclick="selectCreneau(${cr.id}, this)" data-id="${cr.id}">
      <div class="creneau-time" style="font-size:20px;font-weight:700;">${timeStr}</div>
      <div style="font-size:11px;color:${restants <= 2 ? 'var(--red)' : 'var(--green)'};">${restants}/${capacite} ${t('rdv_admin.dispo')}</div>
    </div>`;
  }).join('');

  document.getElementById('rdv-time-picker').classList.remove('hidden');
  document.getElementById('rdv-confirm-btn').classList.add('hidden');
  document.getElementById('rdv-priorite-group').classList.remove('hidden');
  selectedCreneauId = null;
}

function selectCreneau(id, el) {
  document.querySelectorAll('.creneau-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedCreneauId = Number(id);
  document.getElementById('rdv-confirm-btn').classList.remove('hidden');
}

async function confirmRDV() {
  if (!selectedCreneauId) { showError('rdv-error', t('rdv.sel_creneau_requis')); return; }
  const btn = document.getElementById('rdv-confirm-btn');
  btn.disabled = true;
  btn.textContent = t('rdv.confirmation_en_cours');
  const priorite = document.getElementById('rdv-priorite')?.value || null;
  try {
    const res = await apiFetch('/api/rdv', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ creneauId: selectedCreneauId, public_prioritaire: priorite || null })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || t('rdv.erreur_reservation'));

    setStep(3);
    document.getElementById('rdv-step-2').classList.add('hidden');
    document.getElementById('rdv-step-3').classList.remove('hidden');

    const rdv = data;
    let details = t('rdv.confirmation_desc');
    if (rdv.date || rdv.dateHeure) details += ` ${t('rdv.date')} ${fmtDateTime(rdv.date || rdv.dateHeure)}.`;
    if (rdv.service) details += ` ${t('rdv.service_label')} ${rdv.service}.`;
    document.getElementById('rdv-confirmed-details').textContent = details;
    const rdvEmailEl = document.getElementById('rdv-conf-email');
    if (rdvEmailEl && currentUser?.email) rdvEmailEl.textContent = t('signaler.conf_email') + ' ' + currentUser.email;

    await loadMesRDV();
  } catch (e) {
    showError('rdv-error', e.message);
    btn.disabled = false;
    btn.textContent = t('rdv.confirmer_creneau');
  }
}

function resetRDV() {
  setStep(1);
  document.getElementById('rdv-step-2').classList.add('hidden');
  document.getElementById('rdv-step-3').classList.add('hidden');
  document.getElementById('rdv-famille-a').classList.add('hidden');
  document.getElementById('rdv-demarche-detail').classList.add('hidden');
  document.getElementById('rdv-priorite-group').classList.add('hidden');
  document.getElementById('rdv-day-picker').classList.add('hidden');
  document.getElementById('rdv-time-picker').classList.add('hidden');
  document.getElementById('rdv-creneaux-grid').innerHTML = '';
  document.getElementById('rdv-confirm-btn').classList.add('hidden');
  selectedCreneauId = null;
  window._rdvCreneaux = null;
  hideError('rdv-error');
}

function setStep(n) {
  for (let i = 1; i <= 3; i++) {
    const s = document.getElementById(`step-${i}`);
    if (!s) continue;
    s.classList.toggle('active', i === n);
    s.classList.toggle('done', i < n);
  }
  for (let i = 1; i <= 2; i++) {
    const l = document.getElementById(`step-line-${i}`);
    if (l) l.classList.toggle('done', i < n);
  }
}

async function loadMesRDV() {
  const container = document.getElementById('mes-rdv-container');
  container.innerHTML = '<div class="loading-overlay"><div class="spinner spinner-dark"></div><span>' + t('rdv.chargement_rdv') + '</span></div>';
  try {
    const res = await apiFetch('/api/rdv/mes', { headers: authHeaders() });
    if (!res.ok) { container.innerHTML = '<p style="padding:16px;color:var(--gray-400)">' + t('rdv.impossible_charger') + '</p>'; return; }
    const rdvs = await res.json();
    const list = (Array.isArray(rdvs) ? rdvs : (rdvs.rdvs || rdvs.data || [])).filter(function(r) { return r.statut !== 'annule'; });
    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>' + t('rdv.aucun_rdv') + '</p></div>';
      return;
    }
    container.innerHTML = list.map(r => {
      const canEval = (r.statut === 'traite' || r.statut === 'present') && !r.evalue_le;
      const hasEval = !!r.evalue_le;
      const prioLabel = r.public_prioritaire ? t('rdv.priorite_' + r.public_prioritaire) : '';
      return `
      <div class="rdv-item" style="flex-wrap:wrap;">
        <div class="rdv-icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="rdv-info" style="flex:1;min-width:160px;">
          <strong>${escHtml(r.service || r.service_nom || t('rdv.step_service'))}</strong>
          <p>${fmtDateTime(r.debut || r.date || r.dateHeure || r.creneau_date)}</p>
          <p>${escHtml(r.commune || r.commune_nom || '')}${r.lieu ? ' — ' + r.lieu : ''}</p>
          ${prioLabel ? `<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#eff6ff;color:#2563eb;">${prioLabel}</span>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <span class="badge ${rdvStatusBadge(r.statut)}">${escHtml(r.statut || 'confirmé')}</span>
          ${r.qr_code && r.statut === 'reserve' ? `<button class="btn btn-sm btn-outline" onclick="showRdvQR('${r.qr_code}')" style="font-size:10px;">QR Code</button>` : ''}
          ${r.statut === 'reserve' && (r.nb_modifications || 0) < 2 ? `<button class="btn btn-sm btn-outline" onclick="modifierRDV('${r.id}', ${r.service_id || 0}, ${r.commune_id || 0})" style="font-size:10px;">Modifier</button>` : ''}
          ${r.statut === 'reserve' && (r.nb_modifications || 0) >= 2 ? `<span style="font-size:9px;color:var(--muted);">Max modifications atteint</span>` : ''}
          ${canEval ? `<button class="btn btn-sm btn-outline" onclick="showEvalRDV('${r.id}')" style="font-size:10px;">${t('rdv.evaluer')}</button>` : ''}
          ${hasEval ? `<span style="font-size:10px;color:var(--gold);">★ ${r.note_satisfaction}/5</span>` : ''}
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="padding:16px;color:var(--red)">${escHtml(e.message)}</p>`;
  }
}

function showRdvQR(qrCode) {
  var html = '<div style="text-align:center;padding:20px;">' +
    '<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(qrCode) + '" alt="QR" style="width:180px;height:180px;border-radius:10px;border:1px solid var(--line);">' +
    '<div style="font-size:18px;font-weight:800;color:var(--navy);margin-top:12px;letter-spacing:1px;">' + escHtml(qrCode) + '</div>' +
    '<div style="font-size:12px;color:var(--muted);margin-top:4px;">Présentez ce code au guichet</div>' +
    '</div>';
  showModal('QR Code — Rendez-vous', html);
}

function showModal(title, content) {
  var existing = document.getElementById('generic-modal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'generic-modal';
  modal.className = 'bo-modal';
  modal.innerHTML = '<div class="bo-modal-overlay" onclick="this.parentElement.remove()"></div>' +
    '<div class="bo-modal-content" style="max-width:400px;position:relative;">' +
    '<button onclick="document.getElementById(\'generic-modal\').remove()" style="position:absolute;top:10px;right:12px;background:none;border:none;font-size:20px;color:var(--muted);cursor:pointer;">✕</button>' +
    '<h4 style="margin:0 0 12px;color:var(--navy);padding-right:28px;">' + escHtml(title) + '</h4>' +
    content +
    '</div>';
  document.body.appendChild(modal);
}

// Modal prompt (remplace prompt natif)
var _gmCallback = null;
function showPromptModal(title, placeholder, callback, opts) {
  opts = opts || {};
  _gmCallback = callback;
  var inputHtml = opts.textarea
    ? '<textarea id="gm-input" rows="3" placeholder="' + escHtml(placeholder) + '" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:13px;margin-bottom:12px;">' + escHtml(opts.defaultVal || '') + '</textarea>'
    : '<input id="gm-input" type="text" value="' + escHtml(opts.defaultVal || '') + '" placeholder="' + escHtml(placeholder) + '" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:13px;margin-bottom:12px;">';
  showModal(title,
    (opts.desc ? '<p style="font-size:13px;color:var(--muted);margin-bottom:10px;">' + opts.desc + '</p>' : '') +
    inputHtml +
    '<div style="display:flex;gap:8px;">' +
      '<button class="btn btn-sm btn-primary" style="flex:1;" onclick="var v=document.getElementById(\'gm-input\').value;document.getElementById(\'generic-modal\').remove();if(_gmCallback)_gmCallback(v);">' + t('global.enregistrer') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="document.getElementById(\'generic-modal\').remove()">' + t('global.annuler') + '</button>' +
    '</div>'
  );
  setTimeout(function() { var el = document.getElementById('gm-input'); if (el) el.focus(); }, 200);
}

async function modifierRDV(rdvId, serviceId, communeId) {
  // Charger les guichets pour ce service
  try {
    var gRes = await apiFetch('/api/rdv/guichets?serviceId=' + serviceId, { headers: authHeaders() });
    if (!gRes.ok) { showToast(t('rdv.erreur_guichets'), 'error'); return; }
    var guichets = await gRes.json();
    if (!guichets.length) { showToast(t('rdv.aucun_guichet'), 'error'); return; }

    // Si un seul guichet, l'utiliser directement ; sinon prendre celui de la même commune
    var guichet = guichets.find(function(g) { return g.commune_id === communeId; }) || guichets[0];

    // Charger les créneaux
    var cRes = await apiFetch('/api/rdv/guichets/' + guichet.id + '/creneaux?serviceId=' + serviceId, { headers: authHeaders() });
    if (!cRes.ok) { showToast(t('rdv.erreur_creneaux'), 'error'); return; }
    var data = await cRes.json();
    var creneaux = data.creneaux || [];
    if (!creneaux.length) { showToast(t('rdv.aucun_creneau_14j'), 'error'); return; }

    // Grouper par jour
    var jours = {};
    creneaux.forEach(function(c) { if (!jours[c.date]) jours[c.date] = []; jours[c.date].push(c); });
    var jourKeys = Object.keys(jours);
    var jourNoms = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    var moisNoms = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];

    // Construire le modal
    var joursHtml = jourKeys.map(function(d) {
      var dt = new Date(d + 'T00:00:00');
      var dispos = jours[d].filter(function(c) { return c.disponible; }).length;
      return '<button onclick="modRdvSelectJour(\'' + d + '\')" id="mod-jour-' + d + '" class="mod-jour-btn" style="min-width:60px;padding:6px 8px;border:1px solid var(--line);border-radius:10px;background:white;cursor:pointer;text-align:center;flex-shrink:0;transition:all 0.15s;">' +
        '<div style="font-size:9px;color:var(--muted);">' + jourNoms[dt.getDay()] + '</div>' +
        '<div style="font-size:15px;font-weight:700;color:var(--navy);">' + dt.getDate() + '</div>' +
        '<div style="font-size:9px;color:var(--muted);">' + moisNoms[dt.getMonth()] + '</div>' +
        '<div style="font-size:8px;color:' + (dispos > 0 ? '#16a34a' : 'var(--red)') + ';font-weight:600;">' + dispos + ' dispo</div>' +
      '</button>';
    }).join('');

    var html = '<div style="margin-bottom:12px;">' +
      '<p style="font-size:13px;color:var(--navy);font-weight:600;margin-bottom:8px;">' + escHtml(guichet.nom) + '</p>' +
      '<div id="mod-jours" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;">' + joursHtml + '</div>' +
      '</div>' +
      '<div id="mod-heures" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;max-height:300px;overflow-y:auto;"></div>';

    // Stocker les données pour les callbacks
    window._modRdvId = rdvId;
    window._modGuichetId = guichet.id;
    window._modServiceId = serviceId;
    window._modCreneaux = creneaux;
    window._modJours = jours;

    showModal('Modifier le rendez-vous', html);

    // Sélectionner le premier jour dispo
    var firstDispo = jourKeys.find(function(d) { return jours[d].some(function(c) { return c.disponible; }); });
    if (firstDispo) modRdvSelectJour(firstDispo);
  } catch(e) { showToast(e.message, 'error'); }
}

function modRdvSelectJour(dateStr) {
  document.querySelectorAll('.mod-jour-btn').forEach(function(b) { b.style.borderColor = 'var(--line)'; b.style.background = 'white'; });
  var sel = document.getElementById('mod-jour-' + dateStr);
  if (sel) { sel.style.borderColor = 'var(--blue)'; sel.style.background = 'var(--blue-light)'; }

  var heures = window._modCreneaux.filter(function(c) { return c.date === dateStr; });
  var container = document.getElementById('mod-heures');
  container.innerHTML = heures.map(function(c) {
    var dispo = c.disponible;
    return '<button onclick="' + (dispo ? 'modRdvConfirmer(\'' + c.debut + '\')' : '') + '" style="padding:8px;border:1px solid ' + (dispo ? 'var(--line)' : '#fee2e2') + ';border-radius:10px;background:' + (dispo ? 'white' : '#fef2f2') + ';cursor:' + (dispo ? 'pointer' : 'not-allowed') + ';text-align:center;opacity:' + (dispo ? '1' : '0.5') + ';" ' + (dispo ? 'onmouseover="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-light)\'" onmouseout="this.style.borderColor=\'var(--line)\';this.style.background=\'white\'"' : '') + '>' +
      '<div style="font-size:14px;font-weight:700;color:' + (dispo ? 'var(--navy)' : 'var(--muted)') + ';">' + c.heure + '</div>' +
      '<div style="font-size:9px;color:' + (dispo ? '#16a34a' : 'var(--red)') + ';">' + (dispo ? c.restants + ' place(s)' : 'Complet') + '</div>' +
    '</button>';
  }).join('');
}

async function modRdvConfirmer(debut) {
  try {
    var res = await apiFetch('/api/rdv/' + window._modRdvId + '/modifier', {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ guichetId: window._modGuichetId, serviceId: window._modServiceId, debut: debut })
    });
    // Fermer le modal
    var modal = document.getElementById('generic-modal');
    if (modal) modal.remove();
    if (res.ok) {
      var data = await res.json();
      showToast(t('rdv.modifie_restantes') + data.modifications_restantes);
      loadMesRDV();
    } else {
      var err = await res.json();
      showToast(err.erreur || t('rdv.erreur_modification'), 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

async function annulerRDV(rdvId) {
  if (!confirm('Annuler ce rendez-vous ?')) return;
  try {
    var res = await apiFetch('/api/rdv/' + rdvId + '/annuler', {
      method: 'PATCH', headers: authHeaders()
    });
    if (res.ok) {
      showToast(t('rdv.annule'));
      showView('civiadmin');
    } else {
      var err = await res.json();
      showToast(err.erreur || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

function rdvStatusBadge(s) {
  if (!s || s === 'confirmé' || s === 'confirme') return 'badge-green';
  if (s === 'annulé' || s === 'annule') return 'badge-red';
  if (s === 'en attente') return 'badge-orange';
  return 'badge-gray';
}

// ─── ÉVALUATION POST-RDV ─────────────────────────────────
function showEvalRDV(rdvId) {
  const container = document.getElementById('mes-rdv-container');
  // Ajouter le formulaire d'évaluation en bas
  let evalForm = document.getElementById('eval-rdv-form');
  if (evalForm) evalForm.remove();
  container.insertAdjacentHTML('afterend', `
    <div id="eval-rdv-form" class="card" style="margin-top:12px;padding:16px;">
      <h4 style="margin:0 0 10px;color:var(--navy);">${t('rdv.eval_titre')}</h4>
      <div class="form-group" style="margin-bottom:8px;">
        <label style="font-size:13px;">${t('rdv.eval_note')} <span style="color:var(--gold);">★</span></label>
        <div style="display:flex;gap:6px;" id="eval-stars">
          ${[1,2,3,4,5].map(n => `<button type="button" class="btn btn-sm btn-outline eval-star" data-note="${n}" onclick="selectEvalStar(${n})" style="font-size:16px;">★</button>`).join('')}
        </div>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label style="font-size:13px;display:flex;align-items:center;gap:6px;">
          <input type="checkbox" id="eval-honore"> ${t('rdv.eval_honore')}
        </label>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label style="font-size:13px;display:flex;align-items:center;gap:6px;">
          <input type="checkbox" id="eval-delai"> ${t('rdv.eval_delai')}
        </label>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label style="font-size:13px;">${t('rdv.eval_commentaire')}</label>
        <textarea id="eval-commentaire" rows="2" style="font-size:13px;"></textarea>
      </div>
      <button class="btn btn-primary btn-sm" onclick="submitEvalRDV('${rdvId}')" style="width:100%;">${t('rdv.eval_envoyer')}</button>
    </div>
  `);
  window._evalNote = 0;
  document.getElementById('eval-rdv-form').scrollIntoView({ behavior: 'smooth' });
}

function selectEvalStar(n) {
  window._evalNote = n;
  document.querySelectorAll('.eval-star').forEach(btn => {
    btn.style.color = Number(btn.dataset.note) <= n ? '#eab308' : 'var(--muted)';
    btn.style.background = Number(btn.dataset.note) <= n ? '#fef3c7' : '';
  });
}

async function submitEvalRDV(rdvId) {
  if (!window._evalNote) { showToast(t('rdv.eval_note_requis'), 'error'); return; }
  try {
    const res = await apiFetch('/api/rdv/' + rdvId + '/evaluer', {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note_satisfaction: window._evalNote,
        rdv_honore: document.getElementById('eval-honore').checked,
        delai_respecte: document.getElementById('eval-delai').checked,
        commentaire_eval: document.getElementById('eval-commentaire').value || null,
      })
    });
    if (res.ok) {
      showToast(t('rdv.eval_succes'));
      const form = document.getElementById('eval-rdv-form');
      if (form) form.remove();
      loadMesRDV();
    } else {
      const data = await res.json();
      showToast(data.message || t('rdv.eval_erreur'), 'error');
    }
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

// ─── SENTINELLE ───────────────────────────────────────────
async function initSentinelle() {
  loadSentinellePoints();
  loadImpact();
  loadBadges();
  loadAvantages();
  loadLeaderboard();
  loadPreferences();
}

async function loadAvantages() {
  const el = document.getElementById('sentinelle-avantages');
  try {
    const list = await safeFetchJSON('/api/points/avantages', {}, true);
    if (!list.length) { el.innerHTML = ''; return; }
    el.innerHTML = list.map(a => `
      <div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--gray-100);align-items:center;${a.debloque ? '' : 'opacity:0.4;'}">
        <span style="font-size:22px;">${a.icone}</span>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:13px;color:var(--navy);">${escHtml(a.nom)}</div>
          <div style="font-size:11px;color:var(--muted);">${escHtml(a.description)}</div>
        </div>
        <span style="font-size:10px;padding:2px 6px;border-radius:8px;background:${a.debloque ? '#f0fdf4' : 'var(--gray-100)'};color:${a.debloque ? '#16a34a' : 'var(--muted)'};">
          ${a.debloque ? '✓' : escHtml(a.niveau_requis)}
        </span>
      </div>
    `).join('') + `
      <div style="margin-top:10px;padding:8px;background:#eff6ff;border-radius:8px;font-size:11px;color:#2563eb;text-align:center;">
        ${t('sent.avantages_bientot')}
      </div>`;
  } catch(e) { el.innerHTML = ''; }
}

async function loadImpact() {
  const el = document.getElementById('sentinelle-impact');
  try {
    const msgs = await safeFetchJSON('/api/points/impact', {}, true);
    if (!msgs.length) {
      el.innerHTML = `<div style="text-align:center;padding:16px;color:var(--muted);font-size:13px;">${t('sent.impact_vide')}</div>`;
      return;
    }
    el.innerHTML = msgs.map(m => `
      <div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--gray-100);align-items:start;">
        <span style="color:var(--green);font-size:16px;flex-shrink:0;">✅</span>
        <div style="flex:1;">
          <div style="font-size:13px;color:var(--navy);">${escHtml(m.message)}</div>
          <div style="font-size:11px;color:var(--muted);">${fmtDate(m.cree_le)}</div>
        </div>
      </div>
    `).join('');
  } catch(e) { el.innerHTML = ''; }
}

async function loadBadges() {
  const el = document.getElementById('sentinelle-badges');
  try {
    const data = await safeFetchJSON('/api/points/badges', {}, true);
    const earned = data.earned || [];
    const all = data.all || [];
    if (!all.length) { el.innerHTML = ''; return; }
    el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:10px;">
      ${all.map(b => {
        const got = earned.find(e => e.code === b.code);
        return `<div style="text-align:center;width:70px;opacity:${got ? 1 : 0.35};">
          <div style="font-size:28px;">${b.icone}</div>
          <div style="font-size:10px;font-weight:600;color:var(--navy);line-height:1.2;">${escHtml(b.nom)}</div>
          ${got ? `<div style="font-size:9px;color:var(--green);">${fmtDate(got.obtenu_le)}</div>` : `<div style="font-size:9px;color:var(--muted);">${b.condition_seuil}+</div>`}
        </div>`;
      }).join('')}
    </div>`;
  } catch(e) { el.innerHTML = ''; }
}

async function loadSentinellePoints() {
  const journalEl = document.getElementById('sentinelle-journal');
  try {
    const data = await safeFetchJSON('/api/points/profil', {}, true);
    document.getElementById('sentinelle-points').textContent = data.points ?? '0';

    // Afficher le niveau
    const niveauEl = document.getElementById('sentinelle-niveau');
    if (niveauEl && data.niveau) {
      const niveauColors = { citoyen:'#94a3b8', contributeur:'#3b82f6', sentinelle:'#f59e0b', ambassadeur:'#7C3AED', referent:'#7c3aed' };
      const color = niveauColors[data.niveau_code] || '#94a3b8';
      let html = `<span style="display:inline-block;padding:3px 12px;border-radius:12px;background:${color}22;color:${color};font-weight:700;font-size:13px;">${escHtml(data.niveau)}</span>`;
      if (data.prochain_niveau) {
        const pct = Math.min(100, Math.round((data.points / data.prochain_niveau.seuil) * 100));
        html += `<div style="margin-top:6px;font-size:11px;color:var(--muted);">
          ${t('sent.prochain_niveau')} : ${escHtml(data.prochain_niveau.nom)} (${data.prochain_niveau.seuil} pts)
          <div style="margin-top:3px;height:4px;background:var(--gray-200);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${color};border-radius:2px;"></div>
          </div>
        </div>`;
      }
      niveauEl.innerHTML = html;
    }

    // Stats personnelles (CV civique — strictement personnel, pas de comparaison)
    const statsEl = document.getElementById('sentinelle-stats');
    if (statsEl && data.stats) {
      const s = data.stats;
      const pct = s.total > 0 ? Math.round(s.resolus / s.total * 100) : 0;
      statsEl.innerHTML = [
        { v: s.total, l: t('sent.stat_signales'), c: '#0A3D62' },
        { v: s.resolus, l: t('sent.stat_resolus'), c: '#1FA463' },
        { v: pct + '%', l: t('sent.stat_pertinence'), c: '#2563eb' },
        { v: s.communes, l: t('sent.stat_communes'), c: '#E1A730' },
      ].map(i => `<div style="flex:1;min-width:70px;padding:8px;background:${i.c}10;border-radius:8px;text-align:center;">
        <div style="font-size:18px;font-weight:800;color:${i.c};">${i.v}</div>
        <div style="font-size:10px;color:var(--muted);">${i.l}</div>
      </div>`).join('');
    }

    const journal = data.journal || [];
    if (!journal.length) {
      journalEl.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>' + t('sent.aucun_point') + '</p></div>';
      return;
    }

    journalEl.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>${t('sent.col_motif')}</th><th>${t('sent.col_points')}</th><th>${t('sent.col_date')}</th></tr></thead>
          <tbody>
            ${journal.map(j => `
              <tr>
                <td>${escHtml(j.motif || '—')}</td>
                <td style="font-weight:700;color:${j.delta >= 0 ? 'var(--green)' : 'var(--red)'}">
                  ${j.delta >= 0 ? '+' : ''}${j.delta}
                </td>
                <td>${fmtDate(j.le || j.date || j.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    journalEl.innerHTML = `<p style="padding:16px;color:var(--red)">${escHtml(e.message)}</p>`;
  }
}

async function loadLeaderboard() {
  const el = document.getElementById('sentinelle-leaderboard');
  try {
    const list = await safeFetchJSON('/api/points/classement-quartiers');
    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><p>' + t('sent.classement_vide') + '</p></div>';
      return;
    }
    const userCommune = currentUser?.commune_id;
    el.innerHTML = list.slice(0, 20).map((item, idx) => {
      const rank = idx + 1;
      const isMyCommune = item.commune_id === userCommune;
      const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-n';
      return `
        <div class="leaderboard-item" style="${isMyCommune ? 'background:var(--navy-light);border-radius:8px;padding:6px 8px;' : ''}">
          <div class="rank-badge ${rankClass}">${rank}</div>
          <div style="flex:1;">
            <div style="font-weight:${rank <= 3 ? '700' : '500'}">${escHtml(item.commune)}${isMyCommune ? ' ★' : ''}</div>
            <div style="font-size:11px;color:var(--muted);">${item.citoyens_actifs} ${t('sent.classement_citoyens')} · ${item.resolus} ${t('sent.stat_resolus')}</div>
          </div>
          <div style="font-weight:700;color:var(--green)">${item.points_collectifs} pts</div>
        </div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = `<p style="padding:16px;color:var(--red)">${escHtml(e.message)}</p>`;
  }
}

// ─── DASHBOARD ────────────────────────────────────────────
async function initDashboard() {
  if (!isSuperAdmin()) {
    document.getElementById('icua-card').innerHTML = '<div class="empty-state"><p>' + t('global.acces_reserve') + '</p></div>';
    return;
  }
  loadIcua();
  loadSynthese();
}

async function loadIcua() {
  const card = document.getElementById('icua-card');
  const dimsContent = document.getElementById('icua-dims-content');
  try {
    const res = await apiFetch('/api/dashboard/icua', { headers: authHeaders() });
    if (!res.ok) { card.innerHTML = '<p style="padding:16px;color:var(--red)">' + t('dash.erreur_icua') + '</p>'; return; }
    const data = await res.json();
    const score = Math.round(data.icua ?? 0);
    const color = scoreColor(score);
    let label, sublabel;
    if (score >= 75) { label = t('dash.ville_civique'); sublabel = t('dash.ville_civique_desc'); }
    else if (score >= 50) { label = t('dash.a_surveiller'); sublabel = t('dash.a_surveiller_desc'); }
    else { label = t('dash.prioritaire'); sublabel = t('dash.prioritaire_desc'); }

    card.innerHTML = `
      <div class="icua-score" style="color:${color}">${score}</div>
      <div style="text-align:left;">
        <div class="icua-label" style="color:${color};margin-bottom:2px;">${label}</div>
        <div class="icua-sublabel" style="font-size:12px;">${sublabel}</div>
        ${data.lecture ? '<p style="margin-top:4px;font-size:11px;color:var(--gray-500);max-width:400px;">' + escHtml(data.lecture) + '</p>' : ''}
      </div>
    `;

    const dims = data.dimensions || {};
    const dimLabels = {
      proprete: t('dash.dim_proprete'),
      reactivite: t('dash.dim_reactivite'),
      vivre_ensemble: t('dash.dim_vivre_ensemble'),
      fluidite: t('dash.dim_fluidite'),
      engagement: t('dash.dim_engagement')
    };
    let dimsHtml = '';
    for (const [key, lbl] of Object.entries(dimLabels)) {
      const val = Math.round(dims[key] ?? 0);
      dimsHtml += progressBarHTML(lbl, val);
    }
    dimsContent.innerHTML = dimsHtml || '<p style="color:var(--gray-400)">' + t('dash.aucune_dimension') + '</p>';

    // Radar chart ICUA
    const radarData = {
      labels: [t('dash.dim_proprete'), t('dash.dim_reactivite'), t('dash.dim_vivre_ensemble'), t('dash.dim_fluidite'), t('dash.dim_engagement')],
      datasets: [{
        label: 'ICUA',
        data: [dims.proprete??0, dims.reactivite??0, dims.vivre_ensemble??0, dims.fluidite??0, dims.engagement??0],
        backgroundColor: 'rgba(10,61,98,0.15)',
        borderColor: '#0A3D62',
        borderWidth: 2,
        pointBackgroundColor: '#E1A730',
        pointRadius: 5,
      }]
    };
    const ctx = document.getElementById('icua-radar');
    if (ctx) {
      if (window._icuaChart) window._icuaChart.destroy();
      window._icuaChart = new Chart(ctx, {
        type: 'radar',
        data: radarData,
        options: {
          scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } },
          plugins: { legend: { display: false } }
        }
      });
    }
  } catch (e) {
    card.innerHTML = `<p style="padding:16px;color:var(--red)">${escHtml(e.message)}</p>`;
  }
}

async function loadSynthese() {
  const container = document.getElementById('synthese-content');
  try {
    const res = await apiFetch('/api/dashboard/synthese', { headers: authHeaders() });
    if (!res.ok) { container.innerHTML = '<p style="color:var(--red)">' + t('global.erreur_chargement') + '</p>'; return; }
    const data = await res.json();

    function syntheseCard(label, obj, color, icon) {
      if (!obj) return '';
      const scores = obj.scores || [];
      const noirs = obj.pointsNoirs || [];
      const totalOuverts = scores.reduce((s, c) => s + (c.ouverts || 0), 0);
      const totalResolus = scores.reduce((s, c) => s + (c.resolus || 0), 0);
      const scoreMoyen = scores.length ? Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length) : 100;
      const topNoirs = noirs.slice(0, 3).map(n => `<span style="display:inline-block;background:${color}1a;color:${color};border-radius:4px;padding:2px 7px;font-size:11px;margin:2px;">⚠ ${n.nombre} ${t('dash.signalements')}</span>`).join('');
      const scoresHtml = scores.slice(0, 8).map(c => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--gray-100);">
          <span style="font-size:12px;color:var(--gray-700);flex:1;">${c.commune || '—'}</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:70px;height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${c.score}%;background:${c.score>=80?'var(--green)'  :c.score>=50?'var(--gold)':'var(--red)'};border-radius:3px;"></div>
            </div>
            <span style="font-size:12px;font-weight:700;color:${color};width:36px;text-align:right;">${c.score}/100</span>
          </div>
        </div>
      `).join('');
      return `
        <div style="padding:16px 0;border-bottom:1px solid var(--gray-100);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <div style="width:36px;height:36px;border-radius:8px;background:${color}1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon}</div>
            <strong style="font-size:15px;color:${color}">${label}</strong>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
            <div style="background:var(--gray-50);border-radius:8px;padding:10px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:${color}">${scoreMoyen}</div>
              <div style="font-size:11px;color:var(--muted);">${t('dash.score_moyen')}</div>
            </div>
            <div style="background:var(--gray-50);border-radius:8px;padding:10px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:var(--orange)">${totalOuverts}</div>
              <div style="font-size:11px;color:var(--muted);">${t('dash.en_cours')}</div>
            </div>
            <div style="background:var(--gray-50);border-radius:8px;padding:10px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:var(--green)">${totalResolus}</div>
              <div style="font-size:11px;color:var(--muted);">${t('dash.resolus')}</div>
            </div>
          </div>
          ${scores.length ? `<div style="margin-bottom:8px;">${scoresHtml}</div>` : ''}
          ${noirs.length ? `<div style="margin-top:8px;"><span style="font-size:12px;font-weight:600;color:var(--red);">${t('dash.points_noirs')} (${noirs.length}) :</span> ${topNoirs}</div>` : `<div style="font-size:12px;color:var(--green);margin-top:6px;">${t('dash.aucun_point_noir')}</div>`}
        </div>`;
    }

    container.innerHTML = `
      ${syntheseCard(t('dash.proprete'), data.proprete, '#0A3D62',
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A3D62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>`)}
      ${syntheseCard(t('dash.eau'), data.eau, '#2563eb',
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`)}
    ` || '<p style="color:var(--gray-400)">Aucune donnée disponible.</p>';
  } catch (e) {
    container.innerHTML = `<p style="color:var(--red)">${escHtml(e.message)}</p>`;
  }
}


// ─── LOCAL STORAGE KEY ───────────────────────────────────
const MES_SIG_KEY = 'civismart_mes_signalements';

// ─── ÉTAT HELPERS ────────────────────────────────────────
function etatBadgeClass(etat) {
  const map = {
    recu: 'badge-etat-recu',
    transmis: 'badge-etat-transmis',
    en_intervention: 'badge-etat-en_intervention',
    resolu: 'badge-etat-resolu',
    clos: 'badge-etat-clos',
    rejete: 'badge-etat-rejete'
  };
  return 'badge ' + (map[etat] || 'badge-gray');
}

function etatLabel(etat) {
  const map = {
    recu: t('bo.col_recu'),
    transmis: t('bo.col_transmis'),
    pris_en_charge: t('bo.col_pris_en_charge'),
    en_intervention: t('bo.col_en_intervention'),
    a_valider: t('bo.col_a_valider'),
    resolu: 'Résolu',
    clos: t('bo.col_clos'),
    rejete: t('bo.col_rejete')
  };
  return map[etat] || etat || '—';
}

function criticiteClass(c) {
  if (!c) return 'badge-gray';
  if (c === 'haute' || c === 'high') return 'badge badge-criticite-haute';
  if (c === 'moyenne' || c === 'medium') return 'badge badge-criticite-moyenne';
  return 'badge badge-criticite-basse';
}

// ─── MES SIGNALEMENTS ────────────────────────────────────
async function initMesSignalements() {
  var container = document.getElementById('mes-signalements-container');
  container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('global.chargement') + '</div>';
  var isAr = currentLang === 'ar';
  var domIcons = {proprete:'🌿',eau:'💧',voirie:'🛣️',eclairage:'💡',general:'📋',espaces_verts:'🌳',assainissement:'🚰'};
  try {
    var signals = await safeFetchJSON('/api/signaler/mes-signalements', {headers: authHeaders()}, true);
    if (!signals.length) {
      container.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        '<p>' + t('mes_sig.aucun') + '</p><p style="margin-top:8px;font-size:13px;">' + t('mes_sig.aucun_desc') + '</p></div>';
      return;
    }
    container.innerHTML = signals.map(function(s) {
      var cat = arF(s.categorie_ar, s.categorie) || '—';
      var comm = arF(s.commune_ar, s.commune) || '—';
      return '<div class="mes-sig-card">' +
        '<div class="mes-sig-header"><div>' +
          '<span class="mes-sig-domaine">' + (domIcons[s.domaine]||'📋') + '</span>' +
          '<span class="mes-sig-cat">' + escHtml(cat) + '</span>' +
        '</div><span class="' + etatBadgeClass(s.etat) + '">' + etatLabel(s.etat) + '</span></div>' +
        '<div class="mes-sig-commune">' + escHtml(comm) + '</div>' +
        (s.description ? '<div class="mes-sig-desc">' + escHtml(s.description.substring(0,100)) + '</div>' : '') +
        (s.etat === 'rejete' && s.motif_rejet ? '<div style="margin-top:6px;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:12px;color:#991b1b;"><strong>' + (isAr ? 'السبب' : 'Motif') + ' :</strong> ' + escHtml(s.motif_rejet) + '</div>' : '') +
        '<div class="mes-sig-date">' + t('mes_sig.ref') + ' ' + escHtml(s.reference||'—') + ' — ' + fmtDateTime(s.cree_le) +
        (s.nb_confirmations > 0 ? ' · <span style="color:#7c3aed;font-weight:600;">+' + s.nb_confirmations + ' ' + (isAr?'تأكيد':'confirmation'+(s.nb_confirmations>1?'s':'')) + '</span>' : '') +
        '</div></div>';
    }).join('');
    // Ajouter les déclarations Perdu-Trouvé
    try {
      var ptDecls = await safeFetchJSON('/api/perdu-trouve/mes-declarations', {headers: authHeaders()}, true);
      if (ptDecls && ptDecls.length) {
        var statutPTColors = {recue:'#f59e0b',traitee:'#2563eb',cloturee:'#16a34a'};
        var statutPTLabels = {recue:t('pt.statut_recue'),traitee:t('pt.statut_traitee'),cloturee:t('pt.statut_cloturee')};
        var typeLabels = {perte:t('pt.perte'),trouve:t('pt.trouve')};
        container.innerHTML += '<div style="margin-top:20px;padding-top:14px;border-top:2px solid var(--line);">' +
          '<h4 style="color:var(--navy);margin:0 0 10px;font-size:14px;">📋 ' + t('pt.mes_declarations') + '</h4></div>';
        container.innerHTML += ptDecls.map(function(d) {
          var color = statutPTColors[d.statut] || '#666';
          return '<div class="mes-sig-card" style="border-left:3px solid ' + color + ';">' +
            '<div class="mes-sig-header"><div>' +
              '<span class="mes-sig-domaine">📋</span>' +
              '<span class="mes-sig-cat">' + (typeLabels[d.type]||d.type) + '</span>' +
            '</div><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + color + '20;color:' + color + ';font-weight:600;">' + (statutPTLabels[d.statut]||d.statut) + '</span></div>' +
            '<div class="mes-sig-desc">' + escHtml(d.description.substring(0,100)) + '</div>' +
            '<div class="mes-sig-date">' + t('pt.reference') + ' ' + escHtml(d.reference) + ' — ' + fmtDateTime(d.cree_le) + '</div></div>';
        }).join('');
      }
    } catch(e) { /* pas de PT, pas grave */ }
  } catch(e) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--red);">' + t('global.erreur_chargement') + '</div>';
  }
}

// ─── AGENT SIGNALS ───────────────────────────────────────
async function loadAgentSignals(domain) {
  const listId = domain === 'proprete' ? 'cs-agent-signals-list' : 'ws-agent-signals-list';
  const container = document.getElementById(listId);
  if (!container) return;

  const communeFilterEl = document.getElementById(domain === 'proprete' ? 'cs-filter-commune' : 'ws-filter-commune');
  const etatFilterEl = document.getElementById(domain === 'proprete' ? 'cs-filter-etat' : 'ws-filter-etat');
  const communeId = communeFilterEl ? communeFilterEl.value : '';
  const etat = etatFilterEl ? etatFilterEl.value : '';

  let url = `/api/${domain}/signalements`;
  const params = [];
  if (communeId) params.push('communeId=' + encodeURIComponent(communeId));
  if (etat) params.push('etat=' + encodeURIComponent(etat));
  if (params.length) url += '?' + params.join('&');

  container.innerHTML = '<div class="loading-overlay"><div class="spinner spinner-dark"></div><span>' + t('global.chargement') + '</span></div>';

  try {
    const res = await apiFetch(url, { headers: authHeaders() });
    if (!res.ok) {
      container.innerHTML = '<p style="padding:16px;color:var(--gray-400)">' + t('global.acces_reserve') + '</p>';
      return;
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.signalements || data.data || []);

    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/></svg><p>' + t('sig.aucun_trouve') + '</p></div>';
      return;
    }

    container.innerHTML = list.map(s => {
      const etatActuel = s.etat || s.statut || 'recu';
      const sigId = s.id;
      let actionBtns = '';
      if (etatActuel === 'recu') {
        actionBtns += `<button class="btn-action btn-action-blue" onclick="changeEtat('${domain}', ${sigId}, 'transmis')">${t('sig.transmettre')}</button>`;
      }
      if (etatActuel === 'transmis') {
        actionBtns += `<button class="btn-action btn-action-orange" onclick="changeEtat('${domain}', ${sigId}, 'en_intervention')">${t('sig.en_intervention')}</button>`;
      }
      if (etatActuel === 'en_intervention') {
        actionBtns += `<button class="btn-action btn-action-green" onclick="changeEtat('${domain}', ${sigId}, 'resolu')">${t('sig.resolu')}</button>`;
      }
      if (etatActuel !== 'rejete' && etatActuel !== 'resolu') {
        actionBtns += `<button class="btn-action btn-action-red" onclick="changeEtat('${domain}', ${sigId}, 'rejete')">${t('sig.rejeter')}</button>`;
      }

      return `
        <div class="agent-signal-card" id="signal-card-${domain}-${sigId}">
          <div class="agent-signal-card-header">
            <div>
              <div class="agent-signal-ref">#${escHtml(s.reference || String(sigId))}</div>
              <div class="agent-signal-cat">${escHtml(arF(s.categorie_nom_ar, s.categorie_nom) || s.categorie || '—')}</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-start;">
              ${s.criticite ? `<span class="${criticiteClass(s.criticite)}">${escHtml(s.criticite)}</span>` : ''}
              <span class="${etatBadgeClass(etatActuel)}">${etatLabel(etatActuel)}</span>
            </div>
          </div>
          <div class="agent-signal-desc">${escHtml(s.description || t('sig.sans_description'))}</div>
          <div class="agent-signal-meta">
            📍 ${escHtml(s.commune || s.commune_nom || '—')}
            ${s.lat && s.lng ? ` | ${parseFloat(s.lat).toFixed(4)}, ${parseFloat(s.lng).toFixed(4)}` : ''}
            | ${fmtDateTime(s.created_at || s.createdAt || s.cree_le)}
          </div>
          <div class="agent-actions">${actionBtns}<button class="btn-action" style="background:var(--gray-100);color:var(--navy);" onclick="showHistorique('${domain}',${sigId})">${t('sig.historique')}</button></div>
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="padding:16px;color:var(--red)">${escHtml(e.message)}</p>`;
  }
}

async function changeEtat(domain, sigId, newEtat) {
  try {
    const res = await apiFetch(`/api/${domain}/signalements/${sigId}/etat`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ etat: newEtat })
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.message || t('sig.erreur_etat'));
      return;
    }
    await loadAgentSignals(domain);
  } catch (e) {
    alert(t('global.erreur_avec_details', null, { details: e.message }));
  }
}

// ─── HISTORIQUE ──────────────────────────────────────
async function showHistorique(domain, sigId) {
  const overlay = document.createElement('div');
  overlay.id = 'histo-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';

  const box = document.createElement('div');
  box.style.cssText = 'background:white;border-radius:12px;padding:24px;max-width:480px;width:100%;max-height:80vh;overflow-y:auto;';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';

  const title = document.createElement('h3');
  title.style.cssText = 'margin:0;font-size:16px;color:var(--navy);';
  title.textContent = t('sig.historique_titre');

  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-500);';
  closeBtn.textContent = '×';
  closeBtn.onclick = function() { overlay.remove(); };

  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = document.createElement('div');
  content.id = 'histo-content';
  content.style.cssText = 'text-align:center;padding:20px;color:var(--muted);';
  content.textContent = t('global.chargement');

  box.appendChild(header);
  box.appendChild(content);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  try {
    const res = await apiFetch(`/api/${domain}/signalements/${sigId}/historique`, {headers: authHeaders()});
    const rows = res.ok ? await res.json() : [];
    if (!rows.length) {
      content.innerHTML = '<p>' + t('sig.aucun_historique') + '</p>';
      return;
    }
    content.innerHTML = rows.map(h => `
      <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-100);">
        <div style="width:10px;height:10px;border-radius:50%;background:var(--navy);margin-top:4px;flex-shrink:0;"></div>
        <div>
          <div style="font-weight:600;font-size:13px;color:var(--navy);">${escHtml(etatLabel(h.etat))}</div>
          <div style="font-size:12px;color:var(--muted);">${h.prenom ? escHtml(h.prenom+' '+h.nom) : t('sig.systeme', 'Système')} — ${fmtDateTime(h.le)}</div>
        </div>
      </div>
    `).join('');
  } catch(e) {
    content.innerHTML = '<p style="color:var(--red);">' + t('global.erreur_reseau') + '</p>';
  }
}

// ─── EXPORT CSV ───────────────────────────────────────────
async function exportCSV(domaine) {
  try {
    const res = await apiFetch(`/api/${domaine}/signalements/export-csv`, {headers: authHeaders()});
    if (!res.ok) { showToast(t('toast.erreur_export'), 'error'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `signalements-${domaine}.csv`; a.click();
    URL.revokeObjectURL(url);
  } catch(e) { showToast(t('toast.erreur_export'), 'error'); }
}

// ─── ESPACES VERTS ──────────────────────────────────────
function iqepColor(note) {
  if (note >= 75) return 'var(--green)';
  if (note >= 50) return 'var(--gold)';
  return 'var(--red)';
}
function iqepLabel(note) {
  if (note >= 75) return t('edeval.qualite_excellente');
  if (note >= 50) return t('edeval.qualite_bonne');
  if (note >= 25) return t('edeval.qualite_moyenne');
  return t('edeval.qualite_mauvaise');
}

async function initEdeval() {
  const el = document.getElementById('edeval-parcs-list');
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + t('edeval.chargement') + '</div>';
  document.getElementById('edeval-detail').classList.add('hidden');
  try {
    const parcs = await safeFetchJSON('/api/edeval/iqep', { headers: authHeaders() });
    if (!parcs.length) { el.innerHTML = '<div class="empty-state"><p>' + t('edeval.aucun_parc') + '</p></div>'; return; }
    el.innerHTML = parcs.map(p => {
      const note = p.note_finale ?? 100;
      const color = iqepColor(note);
      return `
        <div class="card" style="margin-bottom:10px;padding:14px;cursor:pointer;" onclick="showIqepDetail(${p.id})">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div style="flex:1;min-width:180px;">
              <div style="font-weight:700;font-size:14px;color:var(--navy);">${escHtml(p.nom)}</div>
              <div style="font-size:12px;color:var(--muted);">📍 ${escHtml(p.commune_nom || '—')}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="text-align:center;">
                <div style="font-size:24px;font-weight:800;color:${color};">${note}</div>
                <div style="font-size:10px;color:${color};font-weight:600;">${iqepLabel(note)}</div>
              </div>
              <div style="width:48px;height:48px;border-radius:50%;border:3px solid ${color};display:flex;align-items:center;justify-content:center;">
                <span style="font-size:11px;font-weight:700;color:${color};">${acro('IQEP')}</span>
              </div>
            </div>
          </div>
          ${p.note_manuelle !== null ? '<div style="font-size:11px;color:var(--gold);margin-top:4px;">⚙ ' + t('edeval.note_manuelle') + ' : ' + p.note_manuelle + '</div>' : ''}
        </div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_reseau') + '</p>';
  }
}

async function showIqepDetail(parcId) {
  const card = document.getElementById('edeval-detail-card');
  const wrap = document.getElementById('edeval-detail');
  wrap.classList.remove('hidden');
  card.innerHTML = '<div style="text-align:center;padding:20px;">' + t('global.chargement') + '</div>';
  try {
    const d = await safeFetchJSON('/api/edeval/iqep/' + parcId, { headers: authHeaders() });
    const note = d.note_finale ?? d.note_auto ?? 100;
    const color = iqepColor(note);
    const isAdmin = currentUser && currentUser.role === 'admin_wilaya';
    const scFields = ['sc_espaces_verts','sc_equipements','sc_proprete','sc_eclairage','sc_securite','sc_satisfaction'];

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <div>
          <h3 style="margin:0;color:var(--navy);">${escHtml(d.nom)}</h3>
          <p style="margin:2px 0;font-size:12px;color:var(--muted);">📍 ${escHtml(arF(d.commune_nom_ar, d.commune_nom) || '—')}</p>
        </div>
        <div style="text-align:center;">
          <div style="font-size:36px;font-weight:800;color:${color};">${note}<span style="font-size:14px;">/100</span></div>
          <div style="font-size:11px;font-weight:600;color:${color};">${iqepLabel(note)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <div style="padding:8px;background:var(--gray-50);border-radius:var(--radius-sm);font-size:13px;">
          <span style="color:var(--muted);">${t('edeval.note_auto')} :</span> <strong>${d.note_auto ?? '—'}</strong>
        </div>
        <div style="padding:8px;background:var(--gray-50);border-radius:var(--radius-sm);font-size:13px;">
          <span style="color:var(--muted);">${t('edeval.note_manuelle')} :</span> <strong>${d.note_manuelle ?? '—'}</strong>
        </div>
      </div>
      ${isAdmin ? `
        <h4 style="margin:12px 0 8px;font-size:13px;color:var(--navy);">${t('edeval.ajuster')}</h4>
        <form onsubmit="saveIqep(event, ${parcId})" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="form-group" style="margin:0;">
            <label style="font-size:11px;">${t('edeval.note_manuelle')}</label>
            <input type="number" id="iqep-note" min="0" max="100" value="${d.note_manuelle ?? ''}" placeholder="0–100" style="font-size:13px;padding:6px;">
          </div>
          ${scFields.map(sc => `
            <div class="form-group" style="margin:0;">
              <label style="font-size:11px;">${t('edeval.' + sc)}</label>
              <input type="number" name="${sc}" min="0" max="100" value="${d[sc] ?? ''}" placeholder="0–100" style="font-size:13px;padding:6px;">
            </div>`).join('')}
          <div style="grid-column:1/-1;margin-top:6px;">
            <button type="submit" class="btn btn-primary btn-sm" style="width:100%;">${t('edeval.enregistrer')}</button>
          </div>
        </form>
      ` : `
        <h4 style="margin:12px 0 8px;font-size:13px;color:var(--navy);">${t('edeval.sous_criteres')}</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          ${scFields.map(sc => `
            <div style="padding:6px 8px;background:var(--gray-50);border-radius:var(--radius-sm);font-size:12px;">
              ${t('edeval.' + sc)} : <strong>${d[sc] ?? '—'}</strong>
            </div>`).join('')}
        </div>
      `}
    `;
    wrap.scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    card.innerHTML = '<p style="color:var(--red);">' + t('global.erreur_reseau') + '</p>';
  }
}

async function saveIqep(e, parcId) {
  e.preventDefault();
  const form = e.target;
  const body = {};
  const noteVal = document.getElementById('iqep-note').value;
  if (noteVal !== '') body.note_manuelle = Number(noteVal);
  ['sc_espaces_verts','sc_equipements','sc_proprete','sc_eclairage','sc_securite','sc_satisfaction'].forEach(sc => {
    const inp = form.querySelector('[name="' + sc + '"]');
    if (inp && inp.value !== '') body[sc] = Number(inp.value);
  });
  try {
    const res = await apiFetch('/api/edeval/iqep/' + parcId, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      showToast(t('edeval.note_sauvee'));
      await initEdeval();
      showIqepDetail(parcId);
    } else {
      showToast(t('edeval.erreur_sauvegarde'), 'error');
    }
  } catch (e) {
    showToast(t('global.erreur_reseau'), 'error');
  }
}

// ─── CAP — AGENTS DE PROXIMITÉ ───────────────────────────────
let capAgents = [];

function capShowTab(tab) {
  ['agents','interventions','alertes'].forEach(t => {
    const panel = document.getElementById('cap-panel-' + t);
    const btn = document.getElementById('cap-tab-' + t);
    if (panel) panel.classList.toggle('hidden', t !== tab);
    if (btn) { btn.className = t === tab ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline'; }
  });
  document.getElementById('cap-form-agent').classList.add('hidden');
  document.getElementById('cap-form-intervention').classList.add('hidden');
  if (tab === 'agents') capLoadAgents();
  if (tab === 'interventions') capLoadInterventions();
  if (tab === 'alertes') capLoadAlertes();
}

async function initCap() {
  capShowTab('agents');
}

async function capLoadAgents() {
  const el = document.getElementById('cap-panel-agents');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('cap.chargement') + '</div>';
  try {
    const res = await apiFetch('/api/cap/agents', { headers: authHeaders() });
    if (!res.ok) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_chargement') + '</p>'; return; }
    capAgents = await res.json();
    if (!capAgents.length) {
      el.innerHTML = '<div class="empty-state"><p>' + t('cap.aucun_agent') + '</p></div>';
    } else {
      el.innerHTML = capAgents.map(a => {
        const specLabel = t('cap.spec_' + a.specialisation);
        return `<div class="card" style="margin-bottom:8px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
            <div>
              <div style="font-weight:700;color:var(--navy);">${escHtml((a.prenom||'')+' '+(a.nom||''))}</div>
              <div style="font-size:12px;color:var(--muted);">📍 ${escHtml(arF(a.commune_nom_ar, a.commune_nom)||'—')} · ${escHtml(a.secteur||'—')}</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${a.actif?'#f0fdf4':'#fee2e2'};color:${a.actif?'#16a34a':'#ef4444'};">${a.actif?'Actif':'Inactif'}</span>
              <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:#eff6ff;color:#2563eb;">${specLabel}</span>
              ${canManageCapAgents() ? `<button class="btn btn-sm btn-outline" onclick="capEditAgent(${a.id})" style="font-size:11px;padding:2px 8px;">✏</button>` : ''}
            </div>
          </div>
        </div>`;
      }).join('');
    }
    // Bouton créer (admin wilaya uniquement)
    if (canManageCapAgents()) {
      el.innerHTML += `<button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="document.getElementById('cap-form-agent').classList.toggle('hidden')" data-i18n="cap.nouvel_agent">+ Nouvel Agent de Proximité</button>`;
    }
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_reseau') + '</p>'; }
}

async function capCreateAgent(e) {
  e.preventDefault();
  try {
    const res = await apiFetch('/api/cap/agents', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utilisateur_id: document.getElementById('cap-user-id').value,
        specialisation: document.getElementById('cap-spec').value,
        commune_id: document.getElementById('cap-commune').value || null,
        secteur: document.getElementById('cap-secteur').value || null,
      })
    });
    if (res.ok) { showToast(t('cap.succes_agent')); capLoadAgents(); document.getElementById('cap-form-agent').classList.add('hidden'); }
    else showToast(t('cap.erreur'), 'error');
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

async function capEditAgent(id) {
  const agent = capAgents.find(a => a.id === id);
  if (!agent) return;
  const newSpec = prompt(t('cap.specialisation') + ' (general/stationnement/jeunesse/sport):', agent.specialisation);
  if (!newSpec || newSpec === agent.specialisation) return;
  try {
    const res = await apiFetch('/api/cap/agents/' + id, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialisation: newSpec })
    });
    if (res.ok) { showToast(t('cap.succes_modif')); capLoadAgents(); }
    else showToast(t('cap.erreur'), 'error');
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

async function capLoadInterventions() {
  const el = document.getElementById('cap-panel-interventions');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('cap.chargement') + '</div>';
  try {
    const res = await apiFetch('/api/cap/interventions', { headers: authHeaders() });
    if (!res.ok) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_chargement') + '</p>'; return; }
    const list = await res.json();
    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><p>' + t('cap.aucune_intervention') + '</p></div>';
    } else {
      el.innerHTML = list.map(i => {
        const prioColor = {basse:'#94a3b8',normale:'#3b82f6',haute:'#f59e0b',urgente:'#ef4444'}[i.priorite]||'#94a3b8';
        return `<div class="card" style="margin-bottom:8px;padding:12px;${i.alerte_superviseur?'border-left:3px solid #ef4444;':''}">
          <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:6px;">
            <div style="flex:1;min-width:200px;">
              <div style="font-size:11px;color:var(--muted);">${escHtml(i.reference)} · ${fmtDateTime(i.cree_le)}</div>
              <div style="font-weight:600;color:var(--navy);margin:2px 0;">${escHtml(i.description?.substring(0,120))}</div>
              <div style="font-size:12px;color:var(--muted);">${t('cap.agent')}: ${escHtml((i.agent_prenom||'')+' '+(i.agent_nom||''))} · ${escHtml(i.commune_nom||'—')}</div>
            </div>
            <div style="display:flex;gap:4px;align-items:center;">
              <span style="font-size:10px;padding:2px 6px;border-radius:10px;background:${prioColor}22;color:${prioColor};font-weight:600;">${t('cap.pri_'+i.priorite)}</span>
              <span style="font-size:10px;padding:2px 6px;border-radius:10px;background:${i.etat==='termine'?'#f0fdf4':'#fef3c7'};color:${i.etat==='termine'?'#16a34a':'#92400e'};">${t('cap.etat_'+i.etat)}</span>
              ${i.alerte_superviseur?'<span style="font-size:10px;padding:2px 6px;border-radius:10px;background:#fee2e2;color:#ef4444;">⚠</span>':''}
              ${i.etat==='en_cours' && canCreateCapIntervention() ? `<button class="btn btn-sm btn-outline" onclick="capTerminer(${i.id})" style="font-size:10px;padding:1px 6px;" data-i18n="cap.terminer">✓</button>` : ''}
            </div>
          </div>
        </div>`;
      }).join('');
    }
    // Bouton créer intervention (Centre Opérationnel + Pilotage)
    if (canCreateCapIntervention()) {
      el.innerHTML += `<button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="capShowInterventionForm()" data-i18n="cap.nouvelle_intervention">+ Nouvelle intervention CAP</button>`;
    }
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_reseau') + '</p>'; }
}

async function capShowInterventionForm() {
  document.getElementById('cap-form-intervention').classList.remove('hidden');
  // Charger agents dans le select
  const sel = document.getElementById('cap-int-agent');
  if (sel.options.length <= 1) {
    try {
      const res = await apiFetch('/api/cap/agents', { headers: authHeaders() });
      if (res.ok) {
        const agents = await res.json();
        sel.innerHTML = agents.map(a => `<option value="${a.id}">${escHtml((a.prenom||'')+' '+(a.nom||''))}</option>`).join('');
      }
    } catch(e) { console.warn('[cap] échec chargement agents:', e.message); }
  }
  // Toggle alerte motif
  document.getElementById('cap-int-alerte').addEventListener('change', function() {
    document.getElementById('cap-int-motif-wrap').classList.toggle('hidden', !this.checked);
  });
}

async function capCreateIntervention(e) {
  e.preventDefault();
  try {
    const res = await apiFetch('/api/cap/interventions', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: Number(document.getElementById('cap-int-agent').value),
        type: document.getElementById('cap-int-type').value,
        priorite: document.getElementById('cap-int-prio').value,
        description: document.getElementById('cap-int-desc').value,
        commune_id: document.getElementById('cap-int-commune').value || null,
        alerte_superviseur: document.getElementById('cap-int-alerte').checked,
        motif_alerte: document.getElementById('cap-int-motif').value || null,
      })
    });
    if (res.ok) {
      showToast(t('cap.succes_intervention'));
      document.getElementById('cap-form-intervention').classList.add('hidden');
      capLoadInterventions();
    } else showToast(t('cap.erreur'), 'error');
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

async function capTerminer(id) {
  try {
    const res = await apiFetch('/api/cap/interventions/' + id, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ etat: 'termine' })
    });
    if (res.ok) { showToast(t('cap.succes_modif')); capLoadInterventions(); }
    else showToast(t('cap.erreur'), 'error');
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

async function capLoadAlertes() {
  const el = document.getElementById('cap-panel-alertes');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('cap.chargement') + '</div>';
  try {
    const res = await apiFetch('/api/cap/interventions/alertes', { headers: authHeaders() });
    if (!res.ok) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_chargement') + '</p>'; return; }
    const list = await res.json();
    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><p>' + t('cap.aucune_intervention') + '</p></div>';
    } else {
      el.innerHTML = list.map(i => `
        <div class="card" style="margin-bottom:8px;padding:12px;border-left:3px solid #ef4444;">
          <div style="font-size:11px;color:var(--muted);">${escHtml(i.reference)} · ${fmtDateTime(i.cree_le)}</div>
          <div style="font-weight:600;color:#ef4444;margin:2px 0;">⚠ ${escHtml(i.motif_alerte||i.description?.substring(0,100))}</div>
          <div style="font-size:12px;color:var(--muted);">${t('cap.agent')}: ${escHtml((i.agent_prenom||'')+' '+(i.agent_nom||''))} · ${escHtml(i.commune_nom||'—')}</div>
        </div>`).join('');
    }
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_reseau') + '</p>'; }
}

// ─── CIVIPARK — STATIONNEMENT ────────────────────────────────
const ZONE_COLORS = { blanche:'#94a3b8', bleue:'#3b82f6', jaune:'#eab308', rouge:'#ef4444' };
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// PROPRETÉ CITOYEN — Mon Quartier (M2)
// ══════════════════════════════════════════════════════════

async function initProprete() {
  var el = document.getElementById('proprete-content');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + t('ap.chargement') + '</div>';
  try {
    var data = await safeFetchJSON('/api/quartiers/mon-quartier', {headers: authHeaders()});
    if (!data.quartier) {
      _propreteNoQuartier(el);
    } else {
      _propreteAfficher(el, data);
    }
  } catch(e) {
    el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('ap.toast_erreur') + '</p>';
  }
}

function _propreteNoQuartier(el) {
  el.innerHTML = '<div style="padding:4px 0;max-width:480px;margin:0 auto;text-align:center;">' +
    '<h3 style="margin:0 0 6px;font-size:16px;">' + t('ap.cit_titre') + '</h3>' +
    '<p style="color:var(--muted);font-size:13px;margin-bottom:20px;">' + t('ap.cit_sous_titre') + '</p>' +
    '<div class="card" style="padding:24px;text-align:center;">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
    '<p style="font-size:14px;color:var(--navy);margin-bottom:16px;">' + t('ap.cit_aucun_quartier') + '</p>' +
    '<button class="btn btn-primary" onclick="_propreteSelecteur()" style="width:100%;">' + t('ap.cit_choisir') + '</button>' +
    '</div></div>';
}

function _propreteSelecteur() {
  var el = document.getElementById('proprete-content');
  var isAr = _apIsAr();
  var html = '<div style="padding:4px 0;max-width:480px;margin:0 auto;">' +
    '<h3 style="margin:0 0 6px;font-size:16px;">' + t('ap.cit_choisir') + '</h3>' +
    '<div class="card" style="padding:16px;margin-top:12px;">' +
    '<div class="form-group"><label>' + t('ap.cit_commune') + '</label>' +
    '<select id="prop-commune" onchange="_propreteLoadQuartiers()" style="width:100%;padding:10px;border:1px solid var(--gray-300);border-radius:8px;">' +
    '<option value="">' + t('ap.cit_selectionnez_commune') + '</option>' +
    communes.map(function(c){ return '<option value="'+c.id+'">'+escHtml(isAr?(c.nom_ar||c.nom):c.nom)+'</option>'; }).join('') +
    '</select></div>' +
    '<div class="form-group"><label>' + t('ap.cit_quartier') + '</label>' +
    '<select id="prop-quartier" disabled style="width:100%;padding:10px;border:1px solid var(--gray-300);border-radius:8px;">' +
    '<option value="">' + t('ap.cit_selectionnez_quartier') + '</option></select></div>' +
    '<div style="display:flex;gap:8px;margin-top:12px;">' +
    '<button class="btn btn-primary" style="flex:1;" onclick="_propreteSaveQuartier()">' + t('ap.cit_valider') + '</button>' +
    '<button class="btn btn-outline" style="flex:1;" onclick="initProprete()">' + t('ap.cit_annuler') + '</button>' +
    '</div></div></div>';
  el.innerHTML = html;
}

async function _propreteLoadQuartiers() {
  var cid = document.getElementById('prop-commune').value;
  var sel = document.getElementById('prop-quartier');
  var isAr = _apIsAr();
  if (!cid) { sel.disabled = true; sel.innerHTML = '<option value="">' + t('ap.cit_selectionnez_quartier') + '</option>'; return; }
  var quartiers = await safeFetchJSON('/api/quartiers/public/communes/' + cid, {headers: authHeaders()});
  sel.disabled = false;
  sel.innerHTML = '<option value="">' + t('ap.cit_selectionnez_quartier') + '</option>' +
    quartiers.map(function(q){ return '<option value="'+q.id+'">'+escHtml(isAr?(q.nom_ar||q.nom):q.nom)+'</option>'; }).join('');
}

async function _propreteSaveQuartier() {
  var qid = document.getElementById('prop-quartier').value;
  if (!qid) return;
  await apiFetch('/api/quartiers/mon-quartier', { method:'PATCH', headers:{...authHeaders(),'Content-Type':'application/json'}, body:JSON.stringify({quartier_id:Number(qid)}) });
  showToast(t('ap.cit_quartier_enregistre'));
  initProprete();
}

function _propreteAfficher(el, data) {
  var q = data.quartier;
  var creneaux = q.creneaux || [];
  var isAr = _apIsAr();
  var qNom = isAr ? (q.nom_ar || q.nom) : q.nom;
  var cNom = isAr ? (q.commune_nom_ar || q.commune_nom) : q.commune_nom;

  var html = '<div style="padding:4px 0;max-width:480px;margin:0 auto;">';
  // Header quartier
  html += '<h3 style="margin:0 0 2px;font-size:16px;">' + t('ap.cit_titre') + '</h3>';
  html += '<p style="color:var(--muted);font-size:13px;margin:0 0 16px;">' + escHtml(qNom) + ' — ' + escHtml(cNom) + '</p>';

  // Prochaine collecte
  var prochaine = _propreteProchaineCollecte(creneaux);
  html += '<div class="card" style="padding:14px;margin-bottom:12px;border-left:4px solid ' + (prochaine ? '#16a34a' : '#94a3b8') + ';">';
  html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-bottom:4px;">' + t('ap.cit_prochaine') + '</div>';
  if (prochaine) {
    var timeStr = '<span dir="ltr" style="unicode-bidi:embed;">' + prochaine.heure_debut.substring(0,5) + ' – ' + prochaine.heure_fin.substring(0,5) + '</span>';
    html += '<div style="font-size:16px;font-weight:700;color:var(--navy);">' + prochaine.quand + ', ' + _apTypeName(prochaine.type_collecte) + '</div>';
    html += '<div style="font-size:13px;color:var(--muted);">' + timeStr + '</div>';
  } else {
    html += '<div style="font-size:14px;color:var(--muted);">' + t('ap.cit_aucune_collecte') + '</div>';
  }
  html += '</div>';

  // Planning semaine
  html += '<div class="card" style="padding:14px;margin-bottom:12px;">';
  html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">' + t('ap.cit_planning') + '</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
  var aujourdhui = new Date().getDay();
  for (var j = 0; j < 7; j++) {
    var jourIdx = (aujourdhui + j) % 7;
    var jourCreneaux = creneaux.filter(function(c){ return c.jour === jourIdx; });
    if (!jourCreneaux.length) continue;
    var isToday = j === 0;
    var bgStyle = isToday ? 'background:#f0fdf4;' : '';
    jourCreneaux.forEach(function(c, ci) {
      var typeColor = c.type_collecte==='menagers'?'#16a34a':c.type_collecte==='tri'?'#2563eb':'#f59e0b';
      var timeR = '<span dir="ltr" style="unicode-bidi:embed;">' + c.heure_debut.substring(0,5) + ' – ' + c.heure_fin.substring(0,5) + '</span>';
      html += '<tr style="'+bgStyle+'">';
      if (ci === 0) html += '<td style="padding:6px 8px;border-bottom:1px solid var(--line);font-weight:'+(isToday?'700':'500')+';" rowspan="'+jourCreneaux.length+'">' + _apJour(jourIdx) + (isToday?' •':'') + '</td>';
      html += '<td style="padding:6px 8px;border-bottom:1px solid var(--line);">' + timeR + '</td>';
      html += '<td style="padding:6px 8px;border-bottom:1px solid var(--line);"><span style="display:inline-block;padding:2px 8px;border-radius:10px;background:'+typeColor+'22;color:'+typeColor+';font-weight:600;font-size:11px;">' + _apTypeName(c.type_collecte) + '</span></td></tr>';
    });
  }
  html += '</table></div>';

  // Conseil
  html += '<div class="card" style="padding:14px;margin-bottom:12px;border-left:4px solid #2563eb;">';
  html += '<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#2563eb;margin-bottom:4px;">' + t('ap.cit_conseil_titre') + '</div>';
  html += '<p style="font-size:13px;margin:0;color:var(--navy);">' + t('ap.cit_conseil') + '</p>';
  html += '</div>';

  // Rappels — 3 positions
  var rappelMode = data.rappel || 'utiles';
  html += '<div class="card" style="padding:14px;margin-bottom:12px;">';
  html += '<div style="font-weight:600;font-size:13px;margin-bottom:8px;">' + t('ap.cit_rappels') + '</div>';
  html += '<div style="display:flex;border-radius:8px;overflow:hidden;border:1px solid var(--gray-300);margin-bottom:6px;" id="prop-rappel-seg">';
  ['tous','utiles','aucun'].forEach(function(m) {
    var sel = m === rappelMode;
    html += '<button onclick="_propreteSetRappel(\''+m+'\')" style="flex:1;padding:8px 4px;font-size:12px;font-weight:'+(sel?'700':'400')+';border:none;cursor:pointer;transition:.2s;' +
      'background:'+(sel?'var(--navy)':'white')+';color:'+(sel?'white':'var(--navy)')+';">' + t('ap.cit_rappels_'+m) + '</button>';
  });
  html += '</div>';
  html += '<div style="font-size:11px;color:var(--muted);" id="prop-rappel-desc">' + t('ap.cit_rappels_utiles_desc') + '</div>';
  html += '</div>';

  // Changer de quartier
  html += '<button class="btn btn-outline btn-sm" onclick="_propreteSelecteur()" style="width:100%;margin-bottom:16px;">' + t('ap.cit_changer') + '</button>';

  html += '</div>';
  el.innerHTML = html;
}

// Exported for testing: compute next collection from créneaux list.
// nowOverride: optional {day, hh, mm} to override current time for tests.
function _propreteProchaineCollecte(creneaux, nowOverride) {
  if (!creneaux.length) return null;
  var now = nowOverride || {};
  var jourActuel = now.day !== undefined ? now.day : new Date().getDay();
  var hh = now.hh !== undefined ? now.hh : new Date().getHours();
  var mm = now.mm !== undefined ? now.mm : new Date().getMinutes();
  var nowMinutes = hh * 60 + mm;

  for (var d = 0; d < 7; d++) {
    var jourIdx = (jourActuel + d) % 7;
    var jourC = creneaux.filter(function(c){ return c.jour === jourIdx; });
    // Sort by heure_debut within a day
    jourC.sort(function(a,b){ return a.heure_debut < b.heure_debut ? -1 : 1; });
    for (var i = 0; i < jourC.length; i++) {
      var c = jourC[i];
      var finParts = c.heure_fin.split(':');
      var finMin = parseInt(finParts[0]) * 60 + parseInt(finParts[1]);
      // Skip only if today AND the créneau end time is already past
      if (d === 0 && finMin <= nowMinutes) continue;

      var debutParts = c.heure_debut.split(':');
      var debutMin = parseInt(debutParts[0]) * 60 + parseInt(debutParts[1]);

      var quand;
      if (d === 0) {
        // Today: adapt label to time of day
        if (debutMin <= nowMinutes && finMin > nowMinutes) {
          quand = t('ap.cit_en_cours');
        } else if (debutMin >= 17 * 60) {
          quand = t('ap.cit_ce_soir');
        } else if (debutMin >= 12 * 60) {
          quand = t('ap.cit_cet_aprem');
        } else {
          quand = t('ap.cit_ce_matin');
        }
      } else if (d === 1) {
        if (debutMin >= 17 * 60) quand = t('ap.cit_demain_soir');
        else if (debutMin < 12 * 60) quand = t('ap.cit_demain_matin');
        else quand = t('ap.cit_demain');
      } else {
        quand = _apJour(jourIdx);
      }

      return { type_collecte: c.type_collecte, heure_debut: c.heure_debut, heure_fin: c.heure_fin, jour: c.jour, quand: quand };
    }
  }
  return null;
}

async function _propreteSetRappel(mode) {
  await apiFetch('/api/quartiers/rappel', { method:'PATCH', headers:{...authHeaders(),'Content-Type':'application/json'}, body:JSON.stringify({mode:mode}) });
  // Update segmented control visually
  var seg = document.getElementById('prop-rappel-seg');
  if (seg) {
    var btns = seg.querySelectorAll('button');
    ['tous','utiles','aucun'].forEach(function(m, i) {
      var sel = m === mode;
      btns[i].style.background = sel ? 'var(--navy)' : 'white';
      btns[i].style.color = sel ? 'white' : 'var(--navy)';
      btns[i].style.fontWeight = sel ? '700' : '400';
    });
  }
  var desc = document.getElementById('prop-rappel-desc');
  if (desc) desc.textContent = t('ap.cit_rappels_utiles_desc');
}

// ALGER PROPRE 2030 — QUARTIERS ET CRÉNEAUX
// ══════════════════════════════════════════════════════════
var _apQuartiers = [];

function _apIsAr() { return (typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('civismart_lang')||'fr')) === 'ar'; }
function _apJour(i) { return t('ap.jour_'+i); }
function _apJours() { return [0,1,2,3,4,5,6].map(function(i){return t('ap.jour_'+i);}); }
function _apTypeName(k) { return t('ap.type_'+k, k); }
function _apTypeKeys() { return ['menagers','tri','encombrants']; }
function _apLocalName(obj, field) { return _apIsAr() ? (obj[field+'_ar']||obj[field]) : obj[field]; }
function _apCommuneName(q) { return _apIsAr() ? (q.commune_nom_ar||q.commune_nom) : q.commune_nom; }

async function initQuartiers() {
  var isWilaya = currentUser && currentUser.role === 'admin_wilaya';
  var filtreEl = document.getElementById('ap-filtre-commune');
  if (filtreEl) {
    if (isWilaya) {
      filtreEl.innerHTML = '<select id="ap-commune-select" onchange="apLoadQuartiers()" style="padding:8px 12px;border:1px solid var(--gray-300);border-radius:8px;font-size:13px;">' +
        '<option value="">' + t('ap.toutes_communes') + '</option>' +
        communes.map(function(c){return '<option value="'+c.id+'">'+escHtml(_apIsAr()?(c.nom_ar||c.nom):c.nom)+'</option>';}).join('') + '</select>';
    } else { filtreEl.innerHTML = ''; }
  }
  var actEl = document.getElementById('ap-actions');
  if (actEl) {
    if (isWilaya) {
      actEl.innerHTML = '<button class="btn btn-primary btn-sm" onclick="apQuartierForm()">' + t('ap.nouveau_quartier') + '</button>';
    } else { actEl.innerHTML = ''; }
  }
  apLoadQuartiers();
  apInitNotesTabs();
}

async function apLoadQuartiers() {
  var el = document.getElementById('ap-liste');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('ap.chargement') + '</div>';
  document.getElementById('ap-detail').classList.add('hidden');
  el.classList.remove('hidden');
  document.getElementById('ap-actions').classList.remove('hidden');
  document.getElementById('ap-filtre-commune').classList.remove('hidden');
  document.getElementById('ap-header').classList.remove('hidden');
  var url = '/api/quartiers';
  var sel = document.getElementById('ap-commune-select');
  if (sel && sel.value) url += '?commune_id=' + sel.value;
  try {
    _apQuartiers = await safeFetchJSON(url, {headers:authHeaders()});
    if (!_apQuartiers.length) { el.innerHTML = '<div class="empty-state"><p>' + t('ap.aucun_quartier') + '</p></div>'; return; }
    var html = '';
    var curCommune = '';
    _apQuartiers.forEach(function(q) {
      if (q.commune_nom !== curCommune) {
        curCommune = q.commune_nom;
        html += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin:16px 0 6px;">' + escHtml(_apCommuneName(q)) + '</div>';
      }
      var statColor = q.statut==='actif'?'#16a34a':'#94a3b8';
      var statLabel = t(q.statut==='actif'?'ap.actif':'ap.inactif');
      var srcLabel = q.source==='demo'?' · <em>'+t('ap.demo')+'</em>':'';
      html += '<div class="card" style="margin-bottom:6px;padding:12px;border-left:4px solid '+statColor+';cursor:pointer;" onclick="apQuartierDetail('+q.id+')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
        '<div style="flex:1;min-width:180px;">' +
          '<div style="font-weight:700;color:var(--navy);">' + escHtml(_apLocalName(q,'nom')) + '</div>' +
          '<div style="font-size:12px;color:var(--muted);">' + escHtml(_apCommuneName(q)) + srcLabel + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;align-items:center;">' +
          '<span style="font-size:11px;padding:2px 8px;border-radius:12px;background:'+statColor+'22;color:'+statColor+';font-weight:600;">' + statLabel + '</span>' +
          '<span style="font-size:11px;color:var(--muted);">' + q.nb_creneaux + ' ' + t('ap.creneaux') + '</span>' +
        '</div></div></div>';
    });
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('ap.toast_erreur') + ': ' + escHtml(e.message) + '</p>'; }
}

function apShowDetail() {
  document.getElementById('ap-liste').classList.add('hidden');
  document.getElementById('ap-actions').classList.add('hidden');
  document.getElementById('ap-filtre-commune').classList.add('hidden');
  document.getElementById('ap-header').classList.add('hidden');
  document.getElementById('ap-detail').classList.remove('hidden');
}

async function apQuartierDetail(id) {
  var det = document.getElementById('ap-detail');
  apShowDetail();
  det.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('ap.chargement') + '</div>';
  det.scrollIntoView({behavior:'smooth',block:'start'});
  var isWilaya = currentUser && currentUser.role === 'admin_wilaya';
  var isAr = _apIsAr();
  var thAlign = isAr?'text-align:right;':'text-align:left;';
  try {
    var q = await safeFetchJSON('/api/quartiers/' + id, {headers:authHeaders()});
    var detStatLabel = t(q.statut==='actif'?'ap.actif':'ap.inactif');
    var detSrcLabel = q.source==='demo'?' · '+t('ap.demo'):'';
    var html = '<button class="btn-back" onclick="apBackToList()">' + t('ap.retour') + '</button>';
    html += '<div class="card" style="padding:16px;margin-top:8px;">';
    html += '<h3 style="margin:0 0 8px;">' + escHtml(_apLocalName(q,'nom')) + '</h3>';
    html += '<div style="font-size:13px;color:var(--muted);margin-bottom:12px;">' + escHtml(isAr?(q.commune_nom_ar||q.commune_nom):q.commune_nom) + ' · ' + detStatLabel + detSrcLabel + '</div>';
    html += '<h4 style="margin:12px 0 6px;">' + t('ap.creneaux_depot') + '</h4>';
    if (q.creneaux && q.creneaux.length) {
      html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
      html += '<tr><th style="background:var(--navy);color:white;padding:6px 10px;'+thAlign+'">' + t('ap.col_jour') + '</th><th style="background:var(--navy);color:white;padding:6px 10px;'+thAlign+'">' + t('ap.col_horaire') + '</th><th style="background:var(--navy);color:white;padding:6px 10px;'+thAlign+'">' + t('ap.col_type') + '</th></tr>';
      q.creneaux.forEach(function(c) {
        var typeColor = c.type_collecte==='menagers'?'#16a34a':c.type_collecte==='tri'?'#2563eb':'#f59e0b';
        var timeRange = '<span dir="ltr" style="unicode-bidi:embed;">' + c.heure_debut.substring(0,5) + ' – ' + c.heure_fin.substring(0,5) + '</span>';
        html += '<tr><td style="padding:6px 10px;border-bottom:1px solid var(--line);">' + _apJour(c.jour) + '</td>' +
          '<td style="padding:6px 10px;border-bottom:1px solid var(--line);">' + timeRange + '</td>' +
          '<td style="padding:6px 10px;border-bottom:1px solid var(--line);"><span style="display:inline-block;padding:2px 8px;border-radius:10px;background:'+typeColor+'22;color:'+typeColor+';font-weight:600;font-size:11px;">' + _apTypeName(c.type_collecte) + '</span></td></tr>';
      });
      html += '</table>';
    } else { html += '<p style="color:var(--muted);font-size:12px;">' + t('ap.aucun_creneau') + '</p>'; }
    if (isWilaya) {
      html += '<div style="display:flex;gap:6px;margin-top:14px;flex-wrap:wrap;">';
      html += '<button class="btn btn-sm btn-outline" onclick="apQuartierForm('+q.id+')">' + t('ap.btn_modifier') + '</button>';
      html += '<button class="btn btn-sm btn-outline" onclick="apCreneauxForm('+q.id+')">' + t('ap.btn_gerer_creneaux') + '</button>';
      if (q.statut === 'actif') html += '<button class="btn btn-sm" style="background:#f59e0b;color:white;" onclick="apToggleQuartier('+q.id+',\'inactif\')">' + t('ap.btn_desactiver') + '</button>';
      else html += '<button class="btn btn-sm" style="background:#16a34a;color:white;" onclick="apToggleQuartier('+q.id+',\'actif\')">' + t('ap.btn_reactiver') + '</button>';
      html += '</div>';
    }
    html += '</div>';
    det.innerHTML = html;
  } catch(e) { det.innerHTML = '<p style="color:var(--red);">' + escHtml(e.message) + '</p>'; }
}

function apBackToList() {
  document.getElementById('ap-detail').classList.add('hidden');
  document.getElementById('ap-liste').classList.remove('hidden');
  document.getElementById('ap-actions').classList.remove('hidden');
  document.getElementById('ap-filtre-commune').classList.remove('hidden');
  document.getElementById('ap-header').classList.remove('hidden');
}

function apQuartierForm(editId) {
  var det = document.getElementById('ap-detail');
  apShowDetail();
  var q = editId ? _apQuartiers.find(function(x){return x.id===editId;}) : {};
  det.innerHTML = '<button class="btn-back" onclick="apBackToList()">' + t('ap.retour') + '</button>' +
    '<div class="card" style="padding:16px;margin-top:8px;"><h4>' + t(editId?'ap.form_modifier':'ap.form_nouveau') + '</h4>' +
    '<form onsubmit="apSaveQuartier(event,' + (editId||'null') + ')">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group" style="margin:0;"><label>' + t('ap.form_nom') + '</label><input type="text" id="ap-q-nom" required value="' + escHtml((q&&q.nom)||'') + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + t('ap.form_nom_ar') + '</label><input type="text" id="ap-q-nom-ar" dir="rtl" value="' + escHtml((q&&q.nom_ar)||'') + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + t('ap.form_commune') + '</label><select id="ap-q-commune" required>' + communes.map(function(c){return '<option value="'+c.id+'"'+(q&&q.commune_id==c.id?' selected':'')+'>'+escHtml(_apIsAr()?(c.nom_ar||c.nom):c.nom)+'</option>';}).join('') + '</select></div>' +
    (editId?'<div class="form-group" style="margin:0;"><label>'+t('ap.form_statut')+'</label><select id="ap-q-statut"><option value="actif"'+(q&&q.statut==='actif'?' selected':'')+'>'+t('ap.form_actif')+'</option><option value="inactif"'+(q&&q.statut==='inactif'?' selected':'')+'>'+t('ap.form_inactif')+'</option></select></div>':'') +
    '</div><button type="submit" class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;">' + t('ap.form_enregistrer') + '</button></form></div>';
}

async function apSaveQuartier(e, editId) {
  e.preventDefault();
  var body = { nom: document.getElementById('ap-q-nom').value, nom_ar: document.getElementById('ap-q-nom-ar').value,
    commune_id: Number(document.getElementById('ap-q-commune').value) };
  var statEl = document.getElementById('ap-q-statut');
  if (statEl) body.statut = statEl.value;
  try {
    var url = editId ? '/api/quartiers/' + editId : '/api/quartiers';
    var res = await apiFetch(url, { method: editId ? 'PATCH' : 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { showToast(t('ap.toast_quartier_ok')); apBackToList(); apLoadQuartiers(); }
    else { var d = await res.json(); showToast(d.erreur || t('ap.toast_erreur'), 'error'); }
  } catch(e) { showToast(t('ap.toast_erreur_reseau'), 'error'); }
}

async function apToggleQuartier(id, newStatut) {
  try {
    var res = await apiFetch('/api/quartiers/' + id, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ statut: newStatut }) });
    if (res.ok) { showToast(t('ap.toast_statut_ok')); apQuartierDetail(id); apLoadQuartiers(); }
  } catch(e) { showToast(t('ap.toast_erreur'), 'error'); }
}

function apCreneauxForm(quartierIdParam) {
  var det = document.getElementById('ap-detail');
  apShowDetail();
  var jours = _apJours();
  var q = _apQuartiers.find(function(x){return x.id===quartierIdParam;});
  safeFetchJSON('/api/quartiers/' + quartierIdParam, {headers:authHeaders()}).then(function(data) {
    var creneaux = data.creneaux || [];
    var html = '<button class="btn-back" onclick="apQuartierDetail('+quartierIdParam+')">' + t('ap.retour') + '</button>';
    html += '<div class="card" style="padding:16px;margin-top:8px;"><h4>' + t('ap.creneaux_depot') + ' — ' + escHtml(_apLocalName(q||{},'nom')) + '</h4>';
    html += '<div id="ap-creneaux-rows">';
    creneaux.forEach(function(c, idx) { html += apCreneauRow(idx, c, jours); });
    html += '</div>';
    html += '<button type="button" class="btn btn-sm btn-outline" style="margin-top:6px;" onclick="apAddCreneauRow()">' + t('ap.btn_ajouter_creneau') + '</button>';
    html += '<button type="button" class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;" onclick="apSaveCreneaux('+quartierIdParam+')">' + t('ap.btn_enregistrer_creneaux') + '</button>';
    html += '</div>';
    det.innerHTML = html;
    det._apQid = quartierIdParam;
  });
}

var _apCreneauIdx = 0;
function apCreneauRow(idx, c, jours) {
  _apCreneauIdx = Math.max(_apCreneauIdx, idx + 1);
  var typeKeys = _apTypeKeys();
  return '<div class="ap-creneau-row" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:6px;margin-bottom:4px;align-items:end;">' +
    '<select class="ap-cr-jour" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' + jours.map(function(j,i){return '<option value="'+i+'"'+(c&&c.jour===i?' selected':'')+'>'+j+'</option>';}).join('') + '</select>' +
    '<input type="time" class="ap-cr-debut" value="' + ((c&&c.heure_debut)||'19:00').substring(0,5) + '" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' +
    '<input type="time" class="ap-cr-fin" value="' + ((c&&c.heure_fin)||'21:00').substring(0,5) + '" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' +
    '<select class="ap-cr-type" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' + typeKeys.map(function(k){return '<option value="'+k+'"'+(c&&c.type_collecte===k?' selected':'')+'>'+_apTypeName(k)+'</option>';}).join('') + '</select>' +
    '<button type="button" onclick="this.parentElement.remove()" style="background:#ef4444;color:white;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:12px;">✕</button></div>';
}

function apAddCreneauRow() {
  var jours = _apJours();
  var container = document.getElementById('ap-creneaux-rows');
  container.insertAdjacentHTML('beforeend', apCreneauRow(_apCreneauIdx++, null, jours));
}

async function apSaveCreneaux(qid) {
  var rows = document.querySelectorAll('.ap-creneau-row');
  var creneaux = [];
  rows.forEach(function(row) {
    creneaux.push({
      jour: Number(row.querySelector('.ap-cr-jour').value),
      heure_debut: row.querySelector('.ap-cr-debut').value + ':00',
      heure_fin: row.querySelector('.ap-cr-fin').value + ':00',
      type_collecte: row.querySelector('.ap-cr-type').value
    });
  });
  try {
    var res = await apiFetch('/api/quartiers/' + qid + '/creneaux', {
      method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ creneaux: creneaux })
    });
    if (res.ok) { showToast(t('ap.toast_creneaux_ok')); apQuartierDetail(qid); apLoadQuartiers(); }
    else { var d = await res.json(); showToast(d.erreur || t('ap.toast_erreur'), 'error'); }
  } catch(e) { showToast(t('ap.toast_erreur_reseau'), 'error'); }
}

// ── CiviPark ──
let cpZones = [];

var _cpZones = [], _cpTarif = 5000;

function cpShowTab(tab) {
  ['parkings','cartes','encaissements','clotures'].forEach(function(t) {
    var panel = document.getElementById('cp-panel-' + t);
    var btn = document.getElementById('cp-tab-' + t);
    if (panel) panel.classList.toggle('hidden', t !== tab);
    if (btn) btn.className = t === tab ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline';
  });
  document.getElementById('cp-detail').classList.add('hidden');
  if (tab === 'parkings') cpLoadParkings();
  if (tab === 'cartes') cpLoadCartes();
  if (tab === 'encaissements') cpLoadEncaissements();
  if (tab === 'clotures') cpLoadClotures();
}

async function initCivipark() {
  try { var r = await safeFetchJSON('/api/civipark/config/tarif'); _cpTarif = r.tarif || 5000; } catch(e) { console.warn('[civipark] échec chargement tarif:', e.message); }
  try { _cpZones = await safeFetchJSON('/api/civipark/zones'); } catch(e) { console.warn('[civipark] échec chargement zones:', e.message); }
  cpShowTab('parkings');
}

// ── PARKINGS ──
async function cpLoadParkings() {
  var el = document.getElementById('cp-panel-parkings');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Chargement...</div>';
  try {
    _cpZones = await safeFetchJSON('/api/civipark/zones');
    var isAdmin = currentUser && isGest();
    var html = '';
    if (isAdmin) html += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="cpParkingForm()">+ Nouveau parking</button>';
    if (!_cpZones.length) { el.innerHTML = html + '<div class="empty-state"><p>Aucun parking enregistré.</p></div>'; return; }
    html += _cpZones.map(function(z) {
      var statColor = z.statut==='actif'?'#16a34a':z.statut==='travaux'?'#f59e0b':'#ef4444';
      return '<div class="card" style="margin-bottom:8px;padding:12px;border-left:4px solid '+statColor+';cursor:pointer;" onclick="cpParkingDetail('+z.id+')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
        '<div style="flex:1;min-width:180px;">' +
          '<div style="font-weight:700;color:var(--navy);">' + escHtml(z.reference||'') + ' — ' + escHtml(z.nom) + '</div>' +
          '<div style="font-size:12px;color:var(--muted);">' + escHtml(z.commune_nom||'—') + (z.adresse?' · '+escHtml(z.adresse):'') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
          '<span style="font-size:11px;padding:2px 8px;border-radius:12px;background:'+statColor+'22;color:'+statColor+';font-weight:600;">' + (z.statut||'actif') + '</span>' +
          (z.places_total?'<span style="font-size:11px;color:var(--muted);">'+z.places_total+' places</span>':'') +
          (z.places_pmr?'<span style="font-size:10px;color:#7c3aed;">♿ '+z.places_pmr+'</span>':'') +
          (z.tarif_horaire?'<span style="font-size:11px;font-weight:600;color:var(--navy);">'+z.tarif_horaire+' DA/h</span>':'') +
        '</div></div></div>';
    }).join('');
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">Erreur de chargement</p>'; }
}

function isGest() { return currentUser && (['admin_apc','admin_wilaya'].includes(currentUser.role) || hasCapacite('civipark')); }

async function cpParkingDetail(id) {
  var det = document.getElementById('cp-detail');
  det.classList.remove('hidden');
  det.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement...</div>';
  try {
    var z = await safeFetchJSON('/api/civipark/zones/' + id, { headers: authHeaders() });
    var html = '<button class="btn-back" onclick="document.getElementById(\'cp-detail\').classList.add(\'hidden\')">← Retour à la liste</button>';
    html += '<div class="card" style="padding:16px;margin-top:8px;">';
    html += '<h3 style="margin:0 0 8px;">' + escHtml(z.reference||'') + ' — ' + escHtml(z.nom) + '</h3>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">';
    html += '<div><strong>Commune :</strong> ' + escHtml(z.commune_nom||'—') + '</div>';
    html += '<div><strong>Adresse :</strong> ' + escHtml(z.adresse||'—') + '</div>';
    html += '<div><strong>Capacité :</strong> ' + (z.places_total||0) + ' places (PMR: ' + (z.places_pmr||0) + ')</div>';
    html += '<div><strong>Tarif :</strong> ' + (z.tarif_horaire||0) + ' DA/h</div>';
    html += '<div><strong>Horaires :</strong> ' + escHtml(z.horaires||'—') + '</div>';
    html += '<div><strong>Statut :</strong> ' + (z.statut||'actif') + '</div>';
    html += '</div>';
    if (isGest()) {
      var isAr = (localStorage.getItem('algerna_lang')||'fr') === 'ar';
      html += '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">';
      html += '<button class="btn btn-sm btn-outline" onclick="cpParkingForm('+z.id+')">' + (isAr?'تعديل':'Modifier') + '</button>';
      if (z.statut === 'inactif') {
        html += '<button class="btn btn-sm" style="background:#16a34a;color:white;" onclick="cpToggleParking('+z.id+',\'actif\')">' + (isAr?'إعادة التفعيل':'Réactiver') + '</button>';
      } else {
        html += '<button class="btn btn-sm" style="background:#f59e0b;color:white;" onclick="cpToggleParking('+z.id+',\'inactif\')">' + (isAr?'إلغاء التفعيل':'Désactiver') + '</button>';
      }
      html += '</div>';
    }
    html += '</div>';
    // Journal d'audit
    if (z.journal && z.journal.length) {
      html += '<div class="card" style="padding:12px;margin-top:10px;"><h4 style="margin:0 0 8px;">Journal d\'audit</h4>';
      html += '<div style="max-height:200px;overflow-y:auto;">';
      z.journal.forEach(function(j) {
        html += '<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--line);">' +
          '<span style="color:var(--muted);">' + fmtDateTime(j.cree_le) + '</span> · ' +
          '<strong>' + escHtml((j.prenom||'')+' '+(j.nom_u||'')) + '</strong> · ' +
          escHtml(j.action) + (j.champ?' — '+escHtml(j.champ)+': '+escHtml(j.ancienne_valeur||'∅')+' → '+escHtml(j.nouvelle_valeur||'∅'):'') +
          '</div>';
      });
      html += '</div></div>';
    }
    det.innerHTML = html;
  } catch(e) { det.innerHTML = '<p style="color:var(--red);">Erreur</p>'; }
}

function cpParkingForm(editId) {
  var det = document.getElementById('cp-detail');
  det.classList.remove('hidden');
  var z = editId ? _cpZones.find(function(x){return x.id===editId;}) : {};
  var isAr = (localStorage.getItem('algerna_lang')||'fr') === 'ar';
  var labels = isAr ? {title_new:'موقف جديد',title_edit:'تعديل موقف',nom:'الاسم (فرنسي)',nom_ar:'الاسم (عربي)',commune:'البلدية',adresse:'العنوان',capacite:'السعة',pmr:'أماكن ذوي الاحتياجات',tarif:'التعريفة (دج/سا)',horaires:'المواقيت',statut:'الحالة',actif:'نشط',travaux:'أشغال',ferme:'مغلق',save:'حفظ'}
    : {title_new:'Nouveau parking',title_edit:'Modifier le parking',nom:'Nom (français)',nom_ar:'Nom (arabe)',commune:'Commune',adresse:'Adresse',capacite:'Nombre de places',pmr:'Places PMR',tarif:'Tarif (DA/h)',horaires:'Horaires',statut:'Statut',actif:'Actif',travaux:'Travaux',ferme:'Fermé',save:'Enregistrer'};
  det.innerHTML = '<div class="card" style="padding:16px;"><h4>' + (editId ? labels.title_edit : labels.title_new) + '</h4>' +
    '<form onsubmit="cpSaveParking(event,' + (editId||'null') + ')">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group" style="margin:0;"><label>' + labels.nom + '</label><input type="text" id="cp-pk-nom" required value="' + escHtml((z&&z.nom)||'') + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.nom_ar + '</label><input type="text" id="cp-pk-nom-ar" dir="rtl" value="' + escHtml((z&&z.nom_ar)||'') + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.commune + '</label><select id="cp-pk-commune" required>' + communes.map(function(c){return '<option value="'+c.id+'"'+(z&&z.commune_id==c.id?' selected':'')+'>'+escHtml(c.nom)+'</option>';}).join('') + '</select></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.adresse + '</label><input type="text" id="cp-pk-adresse" value="' + escHtml((z&&z.adresse)||'') + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.capacite + '</label><input type="number" id="cp-pk-places" min="0" value="' + ((z&&z.places_total)||0) + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.pmr + '</label><input type="number" id="cp-pk-pmr" min="0" value="' + ((z&&z.places_pmr)||0) + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.tarif + '</label><input type="number" id="cp-pk-tarif" min="0" value="' + ((z&&z.tarif_horaire)||0) + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.horaires + '</label><input type="text" id="cp-pk-horaires" value="' + escHtml((z&&z.horaires)||'') + '" placeholder="Ex: 7h-22h"></div>' +
    '<div class="form-group" style="margin:0;"><label>' + labels.statut + '</label><select id="cp-pk-statut"><option value="actif"'+(z&&z.statut==='actif'?' selected':'')+'>'+labels.actif+'</option><option value="travaux"'+(z&&z.statut==='travaux'?' selected':'')+'>'+labels.travaux+'</option><option value="ferme"'+(z&&z.statut==='ferme'?' selected':'')+'>'+labels.ferme+'</option></select></div>' +
    '</div><button type="submit" class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;">' + labels.save + '</button></form></div>';
}

async function cpSaveParking(e, editId) {
  e.preventDefault();
  var body = { nom: document.getElementById('cp-pk-nom').value, nom_ar: document.getElementById('cp-pk-nom-ar').value,
    commune_id: Number(document.getElementById('cp-pk-commune').value),
    adresse: document.getElementById('cp-pk-adresse').value, places_total: Number(document.getElementById('cp-pk-places').value),
    places_pmr: Number(document.getElementById('cp-pk-pmr').value), tarif_horaire: Number(document.getElementById('cp-pk-tarif').value),
    horaires: document.getElementById('cp-pk-horaires').value, statut: document.getElementById('cp-pk-statut').value };
  try {
    var url = editId ? '/api/civipark/zones/' + editId : '/api/civipark/zones';
    var res = await apiFetch(url, { method: editId ? 'PATCH' : 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { showToast(t('cp.parking_enregistre')); document.getElementById('cp-detail').classList.add('hidden'); cpLoadParkings(); }
    else { var d = await res.json(); showToast(d.erreur || t('global.erreur'), 'error'); }
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

async function cpToggleParking(id, newStatut) {
  var isAr = (localStorage.getItem('algerna_lang')||'fr') === 'ar';
  var msg = newStatut === 'inactif'
    ? (isAr ? 'تعطيل هذا الموقف؟ لا يمكن حذفه إذا كان له سجل تحصيلات.' : 'Désactiver ce parking ? Il ne peut pas être supprimé car il possède un historique d\'encaissements.')
    : (isAr ? 'إعادة تفعيل هذا الموقف؟' : 'Réactiver ce parking ?');
  if (!confirm(msg)) return;
  try {
    var res = await apiFetch('/api/civipark/zones/' + id, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ statut: newStatut }) });
    var d = await res.json();
    if (res.ok) { showToast(t('cp.statut_maj')); cpParkingDetail(id); cpLoadParkings(); }
    else showToast(d.erreur || t('global.erreur'), 'error');
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

// ── CARTES RÉSIDENT ──
async function cpLoadCartes() {
  var el = document.getElementById('cp-panel-cartes');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Chargement...</div>';
  try {
    var res = await apiFetch('/api/civipark/cartes', { headers: authHeaders() });
    var cartes = await res.json();
    var isAdmin = isGest();
    var html = '';
    if (isAdmin) html += '<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;">' +
      '<button class="btn btn-primary btn-sm" onclick="cpCarteForm()">+ Nouvelle carte</button>' +
      '<span style="font-size:12px;color:var(--muted);">Tarif carte résident : <strong>' + _cpTarif + ' DA</strong></span>' +
      (isAdmin ? ' <button class="btn btn-sm btn-outline" onclick="cpEditTarif()" style="font-size:11px;">Modifier tarif</button>' : '') +
      '</div>';
    if (!cartes.length) { el.innerHTML = html + '<div class="empty-state"><p>Aucune carte résident.</p></div>'; return; }
    var statutColors = {en_attente:'#f59e0b',validee_attente_paiement:'#3b82f6',active:'#16a34a',expiree:'#94a3b8',suspendue:'#ef4444',revoquee:'#991b1b'};
    var statutLabels = currentLang==='ar' ? {en_attente:'قيد الانتظار',validee_attente_paiement:'بانتظار الدفع',active:'نشطة',expiree:'منتهية',suspendue:'معلقة',revoquee:'ملغاة'} : {en_attente:'En attente',validee_attente_paiement:'Attente paiement',active:'Active',expiree:'Expirée',suspendue:'Suspendue',revoquee:'Révoquée'};
    html += cartes.map(function(c) {
      var sc = statutColors[c.statut]||'#94a3b8';
      return '<div class="card" style="margin-bottom:8px;padding:12px;cursor:pointer;" onclick="cpCarteDetail('+c.id+')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
        '<div>' +
          '<div style="font-weight:600;color:var(--navy);">' + escHtml(c.numero||'CR-?') + '</div>' +
          (c.nom?'<div style="font-size:12px;color:var(--muted);">'+escHtml((c.prenom||'')+' '+(c.nom||''))+'</div>':'') +
          '<div style="font-size:12px;color:var(--muted);">' + escHtml(c.commune_nom||'—') + (c.plaque?' · '+escHtml(c.plaque):'') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;align-items:center;">' +
          '<span style="font-size:11px;padding:2px 8px;border-radius:12px;background:'+sc+'22;color:'+sc+';font-weight:600;">' + (statutLabels[c.statut]||c.statut) + '</span>' +
          (c.statut==='validee_attente_paiement'?'<span style="font-size:11px;font-weight:600;color:#3b82f6;">'+_cpTarif+' DA</span>':'') +
          (c.recu_numero?'<span style="font-size:11px;color:var(--muted);">Reçu: '+escHtml(c.recu_numero)+'</span>':'') +
          (c.valide_jusqu_a?'<span style="font-size:11px;color:var(--muted);">→ '+fmtDate(c.valide_jusqu_a)+'</span>':'') +
        '</div></div></div>';
    }).join('');
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);">Erreur</p>'; }
}

async function cpCarteDetail(id) {
  var det = document.getElementById('cp-detail');
  det.classList.remove('hidden');
  det.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement...</div>';
  try {
    var c = await safeFetchJSON('/api/civipark/cartes/' + id, { headers: authHeaders() });
    var statutLabels = currentLang==='ar' ? {en_attente:'قيد الانتظار',validee_attente_paiement:'بانتظار الدفع',active:'نشطة',expiree:'منتهية',suspendue:'معلقة',revoquee:'ملغاة'} : {en_attente:'En attente',validee_attente_paiement:'Attente paiement',active:'Active',expiree:'Expirée',suspendue:'Suspendue',revoquee:'Révoquée'};
    var html = '<button class="btn-back" onclick="document.getElementById(\'cp-detail\').classList.add(\'hidden\')">← Retour</button>';
    html += '<div class="card" style="padding:16px;margin-top:8px;">';
    html += '<h3 style="margin:0 0 8px;">Carte ' + escHtml(c.numero||'') + '</h3>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">';
    html += '<div><strong>Titulaire :</strong> ' + escHtml((c.prenom||'')+' '+(c.nom||'')) + '</div>';
    html += '<div><strong>Téléphone :</strong> ' + escHtml(c.telephone||'—') + '</div>';
    html += '<div><strong>Commune :</strong> ' + escHtml(c.commune_nom||'—') + '</div>';
    html += '<div><strong>Plaque :</strong> ' + escHtml(c.plaque||'—') + '</div>';
    html += '<div><strong>Statut :</strong> ' + (statutLabels[c.statut]||c.statut) + '</div>';
    html += '<div><strong>Validité :</strong> ' + (c.valide_jusqu_a?fmtDate(c.valide_jusqu_a):'—') + '</div>';
    if (c.recu_numero) html += '<div><strong>Reçu :</strong> ' + escHtml(c.recu_numero) + ' (' + (c.recu_montant||'') + ' DA)</div>';
    html += '</div>';
    // Actions admin
    if (isGest()) {
      html += '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">';
      if (c.statut === 'en_attente') html += '<button class="btn btn-sm btn-primary" onclick="cpChangeCarteStatut('+c.id+',\'validee_attente_paiement\')">Valider → Attente paiement</button>';
      if (c.statut === 'validee_attente_paiement') html += '<button class="btn btn-sm btn-primary" onclick="cpEncaisserCarte('+c.id+')">Encaisser ('+_cpTarif+' DA)</button>';
      if (c.statut === 'active') html += '<button class="btn btn-sm btn-primary" onclick="cpEncaisserCarte('+c.id+')">Renouveler ('+_cpTarif+' DA)</button>';
      if (c.statut !== 'revoquee' && c.statut !== 'suspendue') html += '<button class="btn btn-sm" style="background:#ef4444;color:white;" onclick="cpSuspendCarte('+c.id+')">Suspendre</button>';
      html += '</div>';
    }
    html += '</div>';
    // Journal
    if (c.journal && c.journal.length) {
      html += '<div class="card" style="padding:12px;margin-top:10px;"><h4 style="margin:0 0 8px;">Journal d\'audit</h4>';
      html += '<div style="max-height:200px;overflow-y:auto;">';
      c.journal.forEach(function(j) {
        html += '<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--line);">' +
          '<span style="color:var(--muted);">' + fmtDateTime(j.cree_le) + '</span> · ' +
          '<strong>' + escHtml((j.prenom||'')+' '+(j.nom_u||'')) + '</strong> · ' + escHtml(j.action) +
          (j.champ?' — '+escHtml(j.champ)+': '+escHtml(j.ancienne_valeur||'∅')+' → '+escHtml(j.nouvelle_valeur||'∅'):'') + '</div>';
      });
      html += '</div></div>';
    }
    det.innerHTML = html;
  } catch(e) { det.innerHTML = '<p style="color:var(--red);">Erreur</p>'; }
}

async function cpChangeCarteStatut(id, statut) {
  try {
    var res = await apiFetch('/api/civipark/cartes/' + id, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: statut }) });
    if (res.ok) { showToast(t('cp.statut_maj')); cpCarteDetail(id); cpLoadCartes(); } else showToast(t('global.erreur'), 'error');
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

async function cpEncaisserCarte(carteId) {
  if (!_cpZones.length) { showToast(t('cp.aucun_parking'), 'error'); return; }
  var zoneId = _cpZones[0].id; // Default first parking
  try {
    var res = await apiFetch('/api/civipark/encaissements', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ parking_zone_id: zoneId, montant: _cpTarif, type_paiement: 'carte_resident', mode_paiement: 'especes', carte_resident_id: carteId }) });
    if (res.ok) { var d = await res.json(); showToast(t('cp.carte_activee') + ' — ' + d.justificatif_numero); cpCarteDetail(carteId); cpLoadCartes(); }
    else { var d2 = await res.json(); showToast(d2.erreur || t('global.erreur'), 'error'); }
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

async function cpSuspendCarte(id) {
  var motif = prompt('Motif de suspension :');
  if (!motif) return;
  try {
    var res = await apiFetch('/api/civipark/cartes/' + id, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'suspendue', motif_suspension: motif }) });
    if (res.ok) { showToast(t('cp.carte_suspendue')); cpCarteDetail(id); cpLoadCartes(); } else showToast(t('global.erreur'), 'error');
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

function cpCarteForm() {
  var det = document.getElementById('cp-detail');
  det.classList.remove('hidden');
  det.innerHTML = '<div class="card" style="padding:16px;"><h4>Nouvelle carte résident</h4>' +
    '<form onsubmit="cpCreateCarte(event)">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group" style="margin:0;"><label>Commune</label><select id="cp-cr-commune" required>' + communes.map(function(c){return '<option value="'+c.id+'">'+escHtml(c.nom)+'</option>';}).join('') + '</select></div>' +
    '<div class="form-group" style="margin:0;"><label>Plaque</label><input type="text" id="cp-cr-plaque" required placeholder="Ex: 16-12345-01"></div>' +
    '<div class="form-group" style="margin:0;"><label>Adresse</label><input type="text" id="cp-cr-adresse" placeholder="Adresse du résident"></div>' +
    '<div class="form-group" style="margin:0;"><label>Tél. citoyen</label><input type="tel" id="cp-cr-tel" placeholder="0550000000"></div>' +
    '</div><button type="submit" class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;">Créer la demande</button></form></div>';
}

async function cpCreateCarte(e) {
  e.preventDefault();
  var tel = document.getElementById('cp-cr-tel').value;
  // Find citoyen by tel
  var citoyenId = null;
  if (tel) { try { var r = await safeFetchJSON('/api/auth/users?telephone=' + encodeURIComponent(tel), { headers: authHeaders() }); if (r && r.length) citoyenId = r[0].id; } catch(e2) { console.warn('[civipark] échec recherche citoyen par tel:', e2.message); } }
  if (!citoyenId) { showToast(t('cp.citoyen_non_trouve'), 'error'); return; }
  try {
    var res = await apiFetch('/api/civipark/cartes', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ commune_id: Number(document.getElementById('cp-cr-commune').value), plaque: document.getElementById('cp-cr-plaque').value,
        adresse: document.getElementById('cp-cr-adresse').value, citoyen_id: citoyenId }) });
    if (res.ok) { showToast(t('cp.carte_creee')); document.getElementById('cp-detail').classList.add('hidden'); cpLoadCartes(); }
    else { var d = await res.json(); showToast(d.erreur || t('global.erreur'), 'error'); }
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

async function cpEditTarif() {
  var nv = prompt('Nouveau tarif carte résident (DA) :', _cpTarif);
  if (!nv || isNaN(nv)) return;
  try {
    var res = await apiFetch('/api/civipark/config/tarif', { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ tarif: Number(nv) }) });
    if (res.ok) { _cpTarif = Number(nv); showToast(t('cp.tarif_maj') + ' : ' + nv + ' DA'); cpLoadCartes(); } else showToast(t('global.erreur'), 'error');
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

// ── REGISTRE DES ENCAISSEMENTS ──
async function cpLoadEncaissements() {
  var el = document.getElementById('cp-panel-encaissements');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Chargement...</div>';
  try {
    var res = await apiFetch('/api/civipark/encaissements', { headers: authHeaders() });
    var data = await res.json();
    var lignes = data.lignes || data; var totaux = data.totaux || {};
    var isAdmin = isGest();
    var html = '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">';
    if (isAdmin) html += '<button class="btn btn-primary btn-sm" onclick="cpEncForm()">+ Encaisser</button>';
    html += '<button class="btn btn-sm btn-outline" onclick="cpGenPdfEnc()">PDF Encaissements</button>';
    html += '</div>';
    if (totaux.nb) html += '<div class="card" style="padding:10px;margin-bottom:10px;display:flex;gap:20px;font-size:13px;"><strong>Total :</strong> ' + totaux.nb + ' opérations · <strong>' + totaux.total + ' DA</strong></div>';
    if (!lignes.length) { el.innerHTML = html + '<div class="empty-state"><p>Aucun encaissement.</p></div>'; return; }
    html += '<div style="overflow-x:auto;"><table class="ops-table" style="width:100%;font-size:12px;border-collapse:collapse;">';
    html += '<thead><tr style="background:var(--navy);color:white;"><th style="padding:6px;">Date</th><th>Reçu</th><th>Parking</th><th>Type</th><th>Montant</th><th>Mode</th><th>Agent</th><th>Carte</th><th></th></tr></thead><tbody>';
    lignes.forEach(function(l) {
      var isAnn = l.montant < 0;
      var rowStyle = isAnn ? 'background:#fef2f2;color:#991b1b;' : '';
      html += '<tr style="border-bottom:1px solid var(--line);' + rowStyle + '">';
      html += '<td style="padding:5px;white-space:nowrap;">' + fmtDateTime(l.date_heure) + '</td>';
      html += '<td style="font-weight:600;">' + escHtml(l.justificatif_numero||'—') + '</td>';
      html += '<td>' + escHtml((l.zone_ref||'')+' '+(l.zone_nom||'')) + '</td>';
      html += '<td>' + escHtml(l.type_paiement||'—') + '</td>';
      html += '<td style="font-weight:700;">' + l.montant + ' DA</td>';
      html += '<td>' + escHtml(l.mode_paiement||'—') + '</td>';
      html += '<td style="font-size:11px;">' + escHtml((l.agent_prenom||'')+' '+(l.agent_nom||'')) + '</td>';
      html += '<td style="font-size:11px;">' + (l.carte_numero?escHtml(l.carte_numero):'—') + '</td>';
      html += '<td>';
      if (isAdmin && l.valide && !isAnn && !l.annulation_de) html += '<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:#ef4444;color:white;" onclick="cpAnnulerEnc('+l.id+')">Annuler</button>';
      if (isAnn) html += '<span style="font-size:10px;">Annulation de ' + escHtml(l.annule_recu||'') + (l.motif_annulation?' — '+escHtml(l.motif_annulation):'') + '</span>';
      html += '</td></tr>';
    });
    html += '</tbody></table></div>';
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);">Erreur</p>'; }
}

function cpEncForm() {
  var det = document.getElementById('cp-detail');
  det.classList.remove('hidden');
  det.innerHTML = '<div class="card" style="padding:16px;"><h4>Enregistrer un encaissement</h4>' +
    '<form onsubmit="cpCreateEnc(event)">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group" style="margin:0;"><label>Parking</label><select id="cp-enc-zone" required>' + _cpZones.map(function(z){return '<option value="'+z.id+'">'+escHtml(z.reference+' — '+z.nom)+'</option>';}).join('') + '</select></div>' +
    '<div class="form-group" style="margin:0;"><label>Type</label><select id="cp-enc-type"><option value="horaire">Horaire</option><option value="abonnement">Abonnement</option><option value="carte_resident">Carte résident</option></select></div>' +
    '<div class="form-group" style="margin:0;"><label>Montant (DA)</label><input type="number" id="cp-enc-montant" required min="0"></div>' +
    '<div class="form-group" style="margin:0;"><label>Mode</label><select id="cp-enc-mode"><option value="especes">Espèces</option><option value="carte">Carte</option><option value="mobile">Mobile</option></select></div>' +
    '<div class="form-group" style="margin:0;"><label>Plaque</label><input type="text" id="cp-enc-plaque"></div>' +
    '<div class="form-group" style="margin:0;"><label>Durée (min)</label><input type="number" id="cp-enc-duree" min="0"></div>' +
    '</div><button type="submit" class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;">Enregistrer</button></form></div>';
}

async function cpCreateEnc(e) {
  e.preventDefault();
  try {
    var res = await apiFetch('/api/civipark/encaissements', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ parking_zone_id: Number(document.getElementById('cp-enc-zone').value), montant: Number(document.getElementById('cp-enc-montant').value),
        type_paiement: document.getElementById('cp-enc-type').value, mode_paiement: document.getElementById('cp-enc-mode').value,
        plaque: document.getElementById('cp-enc-plaque').value || null, duree_minutes: Number(document.getElementById('cp-enc-duree').value) || null }) });
    if (res.ok) { var d = await res.json(); showToast(t('cp.recu_numero') + ' — ' + d.justificatif_numero); document.getElementById('cp-detail').classList.add('hidden'); cpLoadEncaissements(); }
    else showToast(t('global.erreur'), 'error');
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

async function cpAnnulerEnc(id) {
  var motif = prompt('Motif d\'annulation :');
  if (!motif) return;
  try {
    var res = await apiFetch('/api/civipark/encaissements/' + id + '/annuler', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ motif: motif }) });
    if (res.ok) { showToast(t('cp.annulation_enregistree')); cpLoadEncaissements(); }
    else { var d = await res.json(); showToast(d.erreur || t('global.erreur'), 'error'); }
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

async function cpGenPdfEnc() {
  try {
    var res = await apiFetch('/api/rapports/encaissements', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ periode: '30j', lang: currentLang }) });
    var d = await res.json();
    if (d.ok && d.url) { showToast(t('cp.pdf_genere')); window.open(d.url, '_blank'); } else showToast(d.erreur || t('global.erreur'), 'error');
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

// ── CLÔTURES ──
async function cpLoadClotures() {
  var el = document.getElementById('cp-panel-clotures');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Chargement...</div>';
  try {
    var clotures = await safeFetchJSON('/api/civipark/clotures', { headers: authHeaders() });
    var isAdmin = isGest();
    var html = '';
    if (isAdmin) html += '<button class="btn btn-primary btn-sm" style="margin-bottom:10px;" onclick="cpClotureForm()">+ Clôturer une journée</button>';
    if (!clotures.length) { el.innerHTML = html + '<div class="empty-state"><p>Aucune clôture.</p></div>'; return; }
    html += '<div style="overflow-x:auto;"><table class="ops-table" style="width:100%;font-size:12px;border-collapse:collapse;">';
    html += '<thead><tr style="background:var(--navy);color:white;"><th style="padding:6px;">Date</th><th>Parking</th><th>Système</th><th>Déclaré</th><th>Écart</th><th>Clôturé par</th><th>Validée</th><th></th></tr></thead><tbody>';
    clotures.forEach(function(cl) {
      var ecartStyle = cl.ecart != 0 ? 'color:#ef4444;font-weight:700;' : 'color:#16a34a;';
      html += '<tr style="border-bottom:1px solid var(--line);">';
      html += '<td style="padding:5px;">' + fmtDate(cl.date_cloture) + '</td>';
      html += '<td>' + escHtml((cl.zone_ref||'')+' '+(cl.zone_nom||'')) + '</td>';
      html += '<td style="font-weight:600;">' + cl.total_systeme + ' DA</td>';
      html += '<td>' + cl.total_declare + ' DA</td>';
      html += '<td style="' + ecartStyle + '">' + (cl.ecart>0?'+':'') + cl.ecart + ' DA</td>';
      html += '<td style="font-size:11px;">' + escHtml((cl.cloture_prenom||'')+' '+(cl.cloture_nom||'')) + '</td>';
      html += '<td>' + (cl.validee?'<span style="color:#16a34a;font-weight:600;">Validée</span>':'<span style="color:#f59e0b;">En attente</span>') + '</td>';
      html += '<td>';
      if (isAdmin && !cl.validee) html += '<button class="btn btn-sm btn-primary" style="font-size:10px;padding:2px 6px;" onclick="cpValiderCloture('+cl.id+')">Valider</button>';
      html += '</td></tr>';
    });
    html += '</tbody></table></div>';
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);">Erreur</p>'; }
}

function cpClotureForm() {
  var det = document.getElementById('cp-detail');
  det.classList.remove('hidden');
  det.innerHTML = '<div class="card" style="padding:16px;"><h4>Clôture quotidienne</h4>' +
    '<form onsubmit="cpCreateCloture(event)">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
    '<div class="form-group" style="margin:0;"><label>Parking</label><select id="cp-cl-zone" required>' + _cpZones.map(function(z){return '<option value="'+z.id+'">'+escHtml(z.reference+' — '+z.nom)+'</option>';}).join('') + '</select></div>' +
    '<div class="form-group" style="margin:0;"><label>Date</label><input type="date" id="cp-cl-date" required value="' + new Date().toISOString().split('T')[0] + '"></div>' +
    '<div class="form-group" style="margin:0;"><label>Total déclaré (DA)</label><input type="number" id="cp-cl-declare" required min="0"></div>' +
    '<div class="form-group" style="margin:0;"><label>Commentaire</label><input type="text" id="cp-cl-comment"></div>' +
    '</div><button type="submit" class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;">Clôturer</button></form></div>';
}

async function cpCreateCloture(e) {
  e.preventDefault();
  try {
    var res = await apiFetch('/api/civipark/clotures', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ parking_zone_id: Number(document.getElementById('cp-cl-zone').value), date_cloture: document.getElementById('cp-cl-date').value,
        total_declare: Number(document.getElementById('cp-cl-declare').value), commentaire: document.getElementById('cp-cl-comment').value || null }) });
    if (res.ok) { var d = await res.json(); showToast(t('cp.cloture_creee') + ' — ' + d.ecart + ' DA'); document.getElementById('cp-detail').classList.add('hidden'); cpLoadClotures(); }
    else { var d2 = await res.json(); showToast(d2.erreur || t('global.erreur'), 'error'); }
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

async function cpValiderCloture(id) {
  try {
    var res = await apiFetch('/api/civipark/clotures/' + id + '/valider', { method: 'PATCH', headers: authHeaders() });
    if (res.ok) { showToast(t('cp.cloture_validee')); cpLoadClotures(); }
    else { var d = await res.json(); showToast(d.erreur || t('global.erreur'), 'error'); }
  } catch(e) { showToast(t('cp.erreur_reseau'), 'error'); }
}

// ─── PARKZONES — CiviPark citoyen (lecture seule) ────────────
async function initParkzones() {
  const el = document.getElementById('parkzones-list');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('civipark.chargement') + '</div>';
  try {
    const res = await fetch('/api/civipark/zones');
    if (!res.ok) {
      console.error('[ParkZones] fetch failed:', res.status, res.statusText, res.url);
      el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_chargement') + ' <span style="font-size:11px;color:var(--muted);display:block;">HTTP ' + res.status + '</span></p>';
      return;
    }
    const raw = await res.text();
    let zones;
    try { zones = JSON.parse(raw); } catch (pe) {
      console.error('[ParkZones] JSON parse error:', pe, 'raw:', raw.substring(0, 200));
      el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_chargement') + '</p>';
      return;
    }
    if (!Array.isArray(zones) || !zones.length) {
      el.innerHTML = '<div class="empty-state"><p>' + t('civipark.aucune_zone') + '</p></div>';
      return;
    }
    const ZONE_COLORS = { blanche:'#94a3b8', bleue:'#3b82f6', jaune:'#eab308', rouge:'#ef4444' };
    el.innerHTML = zones.map(z => {
      const color = ZONE_COLORS[z.type] || '#94a3b8';
      return `<div class="card" style="margin-bottom:8px;padding:12px;border-left:4px solid ${color};">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
          <div style="flex:1;min-width:180px;">
            <div style="font-weight:700;color:var(--navy);">${escHtml(z.nom)}</div>
            <div style="font-size:12px;color:var(--muted);">${escHtml(z.commune_nom||'—')}</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${color}22;color:${color};font-weight:600;">${t('civipark.zone_'+z.type)}</span>
            ${z.places_total ? `<span style="font-size:11px;color:var(--muted);">${z.places_total} ${t('civipark.places')}</span>` : ''}
            ${z.tarif_horaire ? `<span style="font-size:11px;font-weight:600;color:var(--navy);">${z.tarif_horaire} ${t('civipark.da_h')}</span>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    console.error('[ParkZones] initParkzones error:', e);
    el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_reseau') + ' <span style="font-size:11px;color:var(--muted);display:block;">' + escHtml(e.message) + '</span></p>';
  }
}

// ─── JE PARTICIPE ────────────────────────────────────────────
async function loadParticipations() {
  var el = document.getElementById('participe-list');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('global.chargement') + '</div>';
  try {
    var data = await safeFetchJSON('/api/participation');
    if (!data.length) { el.innerHTML = '<p style="padding:16px;color:var(--muted);">' + t('participe.aucune') + '</p>'; return; }
    var typeIcons = {consultation:'💬',sondage:'📊',vote:'🗳️',idee:'💡',budget:'💰',nettoyage:'🧹',plantation:'🌱',don_sang:'🩸',reunion:'🤝',evenement:'🎉',enquete:'📝'};
    el.innerHTML = data.map(function(p) {
      var icon = typeIcons[p.type] || '📋';
      var fin = p.date_fin ? fmtDate(p.date_fin) : '—';
      return '<div class="card" style="margin-bottom:10px;padding:14px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;gap:10px;">' +
          '<div style="flex:1;">' +
            '<div style="font-weight:700;font-size:14px;color:var(--navy);">' + icon + ' ' + escHtml(p.titre) + '</div>' +
            (p.description ? '<p style="font-size:12px;color:var(--muted);margin:4px 0;">' + escHtml(p.description) + '</p>' : '') +
            '<div style="font-size:11px;color:var(--muted);">' + t('participe.jusqua') + ' ' + fin + ' · ' + p.nb_participants + ' ' + t('participe.participants') +
            (p.points_gagnes ? ' · +' + p.points_gagnes + ' pts' : '') + '</div>' +
          '</div>' +
          '<button class="btn btn-sm btn-primary" onclick="participer(' + p.id + ')">' + t('participe.btn') + '</button>' +
        '</div></div>';
    }).join('');
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_reseau') + '</p>'; }
}

async function participer(id) {
  try {
    var res = await apiFetch('/api/participation/' + id + '/participer', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: '{}'
    });
    var d = await res.json();
    if (d.deja) showToast(t('participe.deja'));
    else showToast(t('participe.succes'));
    loadParticipations();
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
function initNotifFilters() {
  var el = document.getElementById('notif-filters');
  if (!el) return;
  var isAr = currentLang === 'ar';
  var fn = currentUser ? currentUser.fonction : 'citoyen';
  var html = '<button class="btn btn-sm btn-outline" onclick="loadNotifications()">' + (isAr ? 'الكل' : 'Toutes') + '</button>';
  html += '<button class="btn btn-sm btn-outline" onclick="loadNotifications(\'signalement\')">' + (isAr ? 'الإشارات' : 'Signalements') + '</button>';
  if (fn === 'citoyen') {
    html += '<button class="btn btn-sm btn-outline" onclick="loadNotifications(\'rdv\')">' + (isAr ? 'المواعيد' : 'RDV') + '</button>';
  }
  if (fn === 'cap') {
    html += '<button class="btn btn-sm btn-outline" onclick="loadNotifications(\'cap\')">' + (isAr ? 'المهام' : 'Missions') + '</button>';
  }
  if (fn === 'cabinet' || fn === 'entite_responsable') {
    html += '<button class="btn btn-sm btn-outline" onclick="loadNotifications(\'ccoe\')">' + (isAr ? 'مركز التنسيق' : 'CCOE') + '</button>';
  }
  el.innerHTML = html;
}

async function loadNotifications(type) {
  const el = document.getElementById('notif-list');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('global.chargement') + '</div>';
  try {
    const url = type ? '/api/notifications?type=' + type : '/api/notifications';
    const notifs = await safeFetchJSON(url, {}, true);
    if (!notifs.length) { el.innerHTML = '<p style="padding:16px;color:var(--muted);">' + t('notif.aucune') + '</p>'; return; }
    var isAr = currentLang === 'ar';
    // Barre d'outils (un seul bouton de marquage)
    el.innerHTML = '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">' +
      '<button class="btn btn-sm btn-outline" onclick="markAllRead()" style="font-size:11px;">' + (isAr ? 'تعليم الكل كمقروء' : 'Tout marquer comme lu') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="deleteAllNotifs()" style="font-size:11px;color:var(--red);border-color:var(--red);">' + (isAr ? 'حذف الكل' : 'Tout effacer') + '</button>' +
    '</div>' +
    notifs.map(function(n) {
      return '<div class="card" style="margin-bottom:4px;padding:8px 12px;border-left:3px solid ' + (n.lu ? 'var(--gray-200)' : 'var(--green)') + ';opacity:' + (n.lu ? '0.7' : '1') + ';">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<div style="flex:1;cursor:pointer;display:flex;align-items:center;gap:8px;" onclick="notifClick(' + n.id + ',\'' + escHtml(n.lien || '') + '\',this.parentElement.parentElement)">' +
            '<div style="flex:1;"><span style="font-weight:' + (n.lu ? '400' : '600') + ';font-size:12px;color:var(--navy);">' + escHtml(n.titre) + '</span>' +
            (n.message ? '<span style="font-size:11px;color:var(--muted);margin-left:6px;">' + escHtml(n.message).substring(0,60) + '</span>' : '') +
            '</div><span style="font-size:10px;color:var(--muted);flex-shrink:0;">' + fmtDateTime(n.cree_le) + '</span>' +
          '</div>' +
          '<button onclick="deleteNotif(' + n.id + ')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:2px 4px;flex-shrink:0;">✕</button>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_reseau') + '</p>'; }
}

async function loadNotifBadge() {
  try {
    const d = await safeFetchJSON('/api/notifications/count', {}, true);
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (d.unread > 0) { badge.textContent = d.unread; badge.style.display = ''; }
      else { badge.style.display = 'none'; }
    }
  } catch(e) { console.warn('[notif] échec chargement badge:', e.message); }
}

function notifClick(id, lien, el) {
  markNotifRead(id, el);
  if (!lien) return;
  var parts = lien.split('#');
  var sigId = parts[1] || '';
  var viewPath = parts[0] || '';

  // CC notification → open dossier from command center
  if (viewPath === '/command-center' && sigId) {
    showView('command-center');
    setTimeout(function() {
      safeFetchJSON('/api/signaler/board', {}, true).then(function(data) {
        var items = Array.isArray(data) ? data : [];
        _boSignals = items;
        var s = items.find(function(x) { return String(x.id) === String(sigId); });
        if (s) boOpenSignalement(s.reference);
      });
    }, 1000);
    return;
  }

  // CCOE notification → open chantier directly
  if (viewPath === '/mes-chantiers-ccoe' && sigId) {
    showView('mes-chantiers-ccoe');
    setTimeout(function() { if (typeof mccShowDetail === 'function') mccShowDetail(parseInt(sigId)); }, 500);
    return;
  }
  if (viewPath === '/ccoe' && sigId) {
    showView('ccoe');
    setTimeout(function() { if (typeof ccoeShowChantierDetail === 'function') ccoeShowChantierDetail(parseInt(sigId)); }, 500);
    return;
  }

  // Superviseur : ouvrir le drawer superviseur directement
  if (sigId && hasFonction('superviseur')) {
    supOpenDrawer(sigId);
    return;
  }

  // Stocker l'ID cible dans sessionStorage AVANT navigation
  if (sigId) {
    sessionStorage.setItem('algerna_open_drawer', sigId);
  }

  // Naviguer vers la vue par défaut du profil connecté (pas le lien en dur)
  var targetView = getDefaultView();
  showView(targetView);

  // Si pas de sigId, au moins basculer sur le board
  if (!sigId && targetView === 'bo-agent' && typeof boShowBoard === 'function') {
    setTimeout(function() { boShowBoard(); }, 500);
  }
}

async function markNotifRead(id, el) {
  try {
    await apiFetch('/api/notifications/' + id + '/lu', { method: 'PATCH', headers: authHeaders() });
    if (el) { el.style.borderLeftColor = 'var(--gray-200)'; el.style.opacity = '0.7'; }
    loadNotifBadge();
  } catch(e) { console.warn('[notif] échec marquage lu:', e.message); }
}

async function markAllRead() {
  try {
    await apiFetch('/api/notifications/lire-tout', { method: 'PATCH', headers: authHeaders() });
    loadNotifications();
    loadNotifBadge();
  } catch(e) { console.warn('[notif] échec marquage tout lu:', e.message); }
}

async function deleteNotif(id) {
  try {
    await apiFetch('/api/notifications/' + id, { method: 'DELETE', headers: authHeaders() });
    loadNotifications();
    loadNotifBadge();
  } catch(e) { console.warn('[notif] échec suppression notification:', e.message); }
}

async function deleteAllNotifs() {
  if (!confirm('Effacer toutes les notifications ?')) return;
  try {
    await apiFetch('/api/notifications', { method: 'DELETE', headers: authHeaders() });
    loadNotifications();
    loadNotifBadge();
    showToast(t('toast.notifications_effacees'));
  } catch(e) { console.warn('[notif] échec suppression toutes notifications:', e.message); }
}

// ─── PAGES LÉGALES ──────────────────────────────────────────
const LEGAL_PAGES = {
  cgu: { titre: 'Conditions Générales d\'Utilisation', html:
    '<p style="color:var(--muted);margin-bottom:16px;">Dernière mise à jour : 1er juillet 2026</p>' +
    '<h3>Article 1 — Objet</h3><p>Les présentes Conditions Générales d\'Utilisation (CGU) régissent l\'accès et l\'utilisation de la plateforme ALGERNA, éditée par <strong>Capcowork SARL</strong> pour le compte de la Wilaya d\'Alger. En accédant à ALGERNA, vous acceptez sans réserve les présentes CGU.</p>' +
    '<h3>Article 2 — Éditeur</h3><p>Capcowork SARL — pour le compte de la Wilaya d\'Alger.<br>Contact : <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>' +
    '<h3>Article 3 — Accès à la plateforme</h3><p>ALGERNA est accessible gratuitement à tout citoyen résidant dans la Wilaya d\'Alger. L\'inscription est ouverte aux personnes âgées de <strong>16 ans</strong> ou plus. Un numéro de téléphone valide est requis pour la création de compte.</p>' +
    '<h3>Article 4 — Services proposés</h3><p>ALGERNA permet aux citoyens de : signaler des dysfonctionnements sur l\'espace public ; suivre le traitement de leurs signalements ; prendre rendez-vous pour des démarches administratives ; consulter les informations et communiqués de la Wilaya ; participer aux consultations citoyennes.</p>' +
    '<h3>Article 5 — Engagements de l\'utilisateur</h3><p>L\'utilisateur s\'engage à : fournir des informations exactes et vérifiables ; ne pas soumettre de signalements frauduleux ou abusifs ; respecter les autres utilisateurs et les agents publics ; ne pas tenter d\'accéder à des données qui ne lui appartiennent pas ; ne pas perturber le fonctionnement de la plateforme.</p>' +
    '<h3>Article 6 — Compte utilisateur</h3><p>Chaque utilisateur est responsable de la confidentialité de ses identifiants. Tout usage abusif du compte peut entraîner sa suspension temporaire ou définitive, sans préavis.</p>' +
    '<h3>Article 7 — Points et badges</h3><p>ALGERNA attribue des points et badges pour encourager la participation citoyenne. Ces éléments ne constituent pas un droit acquis et peuvent être modifiés ou retirés selon les règles en vigueur. Aucune contrepartie financière n\'est associée.</p>' +
    '<h3>Article 8 — Données personnelles</h3><p>Les données collectées sont traitées conformément à notre <a href="#" onclick="showLegalPage(\'confidentialite\');return false;" style="color:var(--blue);font-weight:600;">Politique de Confidentialité</a> et à la loi algérienne n° 18-07 relative à la protection des données à caractère personnel.</p>' +
    '<h3>Article 9 — Propriété intellectuelle</h3><p>L\'ensemble des contenus de la plateforme (textes, visuels, logos, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.</p>' +
    '<h3>Article 10 — Limitation de responsabilité</h3><p>ALGERNA s\'efforce d\'assurer la disponibilité de la plateforme, sans garantie de continuité. La Wilaya d\'Alger et Capcowork SARL ne sauraient être tenus responsables des interruptions, erreurs techniques ou des conséquences liées aux signalements soumis.</p>' +
    '<h3>Article 11 — Modification des CGU</h3><p>Les présentes CGU peuvent être modifiées à tout moment. L\'utilisateur sera informé de toute modification substantielle. L\'utilisation continue de la plateforme vaut acceptation des nouvelles conditions.</p>' +
    '<h3>Article 12 — Droit applicable</h3><p>Les présentes CGU sont soumises au droit algérien. Tout litige relève de la compétence des juridictions d\'Alger.</p>' +
    '<p style="margin-top:20px;color:var(--muted);">Contact : <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
  confidentialite: { titre: 'Politique de Confidentialité', html:
    '<p style="color:var(--muted);margin-bottom:16px;">Dernière mise à jour : 1er juillet 2026</p>' +
    '<h3>1. Responsable du traitement</h3><p>Le responsable du traitement des données est désigné par la <strong>Wilaya d\'Alger</strong>, dans le cadre de l\'exploitation de la plateforme ALGERNA. La réalisation technique est assurée par Capcowork SARL.</p>' +
    '<h3>2. Données collectées</h3><p>Nous collectons les données suivantes : nom, prénom, numéro de téléphone, commune de résidence, signalements soumis (texte, photos, localisation GPS), rendez-vous pris, évaluations de service, préférences de notification.</p>' +
    '<h3>3. Finalités</h3><p>Vos données sont utilisées pour : traiter vos signalements et demandes ; gérer vos rendez-vous ; vous envoyer des notifications sur le suivi de vos dossiers ; calculer les indicateurs de qualité de service (ICUA) de manière anonymisée ; améliorer les services publics de la Wilaya.</p>' +
    '<h3>4. Base légale</h3><p>Le traitement est fondé sur la mission de service public de la Wilaya d\'Alger et sur le consentement de l\'utilisateur lors de son inscription.</p>' +
    '<h3>5. Hébergement</h3><p>Vos données sont hébergées <strong>en Algérie</strong>, conformément aux exigences de la loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel. Aucun transfert de données hors du territoire national n\'est effectué.</p>' +
    '<h3>6. Durée de conservation</h3><p>Les données de compte sont conservées pendant toute la durée d\'utilisation du service, puis 12 mois après la suppression du compte. Les signalements sont conservés 5 ans à des fins statistiques et d\'amélioration du service.</p>' +
    '<h3>7. Vos droits</h3><p>Conformément à la loi 18-07, vous disposez des droits suivants : droit d\'accès à vos données ; droit de rectification ; droit de suppression ; droit d\'opposition au traitement ; droit à la portabilité (export de vos données).</p>' +
    '<h3>8. Exercice de vos droits</h3><p>Vous pouvez exercer vos droits directement depuis votre profil ALGERNA (export, suppression) ou en contactant : <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a>.</p>' +
    '<h3>9. Sécurité</h3><p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement des mots de passe, connexions sécurisées (HTTPS), contrôle d\'accès par rôle, journalisation des accès.</p>' +
    '<h3>10. Cookies</h3><p>ALGERNA utilise uniquement des cookies techniques. Pour en savoir plus, consultez notre <a href="#" onclick="showLegalPage(\'cookies\');return false;" style="color:var(--blue);font-weight:600;">Politique relative aux Cookies</a>.</p>' +
    '<p style="margin-top:20px;color:var(--muted);">Contact : <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
  cookies: { titre: 'Politique relative aux Cookies', html:
    '<p style="color:var(--muted);margin-bottom:16px;">Dernière mise à jour : 1er juillet 2026</p>' +
    '<h3>1. Qu\'est-ce qu\'un cookie ?</h3><p>Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur ALGERNA. Il permet de mémoriser vos préférences et d\'assurer le bon fonctionnement de la plateforme.</p>' +
    '<h3>2. Cookies utilisés par ALGERNA</h3><p>ALGERNA utilise exclusivement des <strong>cookies techniques strictement nécessaires</strong> :</p>' +
    '<ul style="margin:8px 0 12px 20px;line-height:1.8;"><li><strong>Jeton d\'authentification</strong> — maintient votre session active</li><li><strong>Préférence de langue</strong> — mémorise votre choix (français ou arabe)</li><li><strong>Service Worker</strong> — permet le fonctionnement hors ligne et le cache de l\'application</li><li><strong>Préférences d\'affichage</strong> — conserve vos paramètres d\'interface</li></ul>' +
    '<h3>3. Cookies tiers</h3><p>ALGERNA <strong>n\'utilise aucun cookie publicitaire, de traçage, ni de mesure d\'audience tiers</strong>. Aucune donnée n\'est partagée avec des régies publicitaires ou des réseaux sociaux.</p>' +
    '<h3>4. Durée de conservation</h3><p>Les cookies de session sont supprimés à la déconnexion. Les préférences de langue sont conservées jusqu\'à leur modification par l\'utilisateur.</p>' +
    '<h3>5. Gestion des cookies</h3><p>Vous pouvez configurer votre navigateur pour bloquer les cookies, mais cela empêchera le fonctionnement normal d\'ALGERNA (connexion, signalements, rendez-vous).</p>' +
    '<h3>6. Lien avec la Politique de Confidentialité</h3><p>Pour en savoir plus sur la gestion de vos données, consultez notre <a href="#" onclick="showLegalPage(\'confidentialite\');return false;" style="color:var(--blue);font-weight:600;">Politique de Confidentialité</a>.</p>' +
    '<p style="margin-top:20px;color:var(--muted);">Contact : <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
  mentions: { titre: 'Mentions légales', html:
    '<h3>Éditeur</h3><p><strong>Capcowork SARL</strong> — pour le compte de la Wilaya d\'Alger.</p>' +
    '<h3>Plateforme</h3><p>ALGERNA — Plateforme citoyenne de gouvernance urbaine.</p>' +
    '<h3>Hébergement</h3><p>Pylcom — hébergement en Algérie.</p>' +
    '<h3>Responsable</h3><p>Secrétariat Général de la Wilaya d\'Alger.</p>' +
    '<h3>Contact</h3><p><a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a> — Tél : 1548</p>' +
    '<p>Ce service est fourni à titre gratuit aux citoyens de la Wilaya d\'Alger.</p>'
  },
  mot_wali: { titre: 'Message du Wali', html:
    '<p style="font-size:15px;font-style:italic;line-height:1.8;color:var(--navy);">Chers citoyennes et citoyens d\'Alger,</p>' +
    '<p style="line-height:1.8;">Notre ambition est de rapprocher l\'administration du citoyen, de simplifier les démarches et de renforcer la qualité du service public à Alger.</p>' +
    '<p style="line-height:1.8;">ALGERNA est le fruit de cette vision : une plateforme citoyenne qui vous permet de signaler, suivre et participer à l\'amélioration de votre cadre de vie.</p>' +
    '<p style="line-height:1.8;">Chaque signalement que vous soumettez contribue à bâtir une ville plus réactive, plus propre et plus sûre.</p>' +
    '<p style="line-height:1.8;">Je compte sur votre engagement pour faire d\'Alger une métropole exemplaire au service de tous.</p>' +
    '<p style="margin-top:20px;font-weight:700;color:var(--navy);">Le Wali d\'Alger</p>'
  },
  accessibilite: { titre: 'Accessibilité', html:
    '<p style="color:var(--muted);margin-bottom:16px;">Dernière mise à jour : 1er juillet 2026</p>' +
    '<h3>Engagement</h3><p>La Wilaya d\'Alger s\'engage à rendre la plateforme ALGERNA accessible à tous, conformément aux standards du web.</p>' +
    '<h3>Mesures mises en œuvre</h3><ul style="margin:8px 0 12px 20px;line-height:1.8;"><li>Navigation au clavier possible sur l\'ensemble des écrans</li><li>Contrastes de couleurs conformes aux recommandations WCAG 2.1 niveau AA</li><li>Textes redimensionnables jusqu\'à 200 %</li><li>Formulaires avec labels explicites et messages d\'erreur clairs</li><li>Application progressive (PWA) compatible mobile et tablette</li><li>Support bilingue français / arabe avec direction RTL native</li></ul>' +
    '<h3>Signaler un problème</h3><p>Si vous rencontrez une difficulté d\'accessibilité, contactez-nous : <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
};

const LEGAL_PAGES_AR = {
  cgu: { titre: 'شروط الاستخدام العامة', html:
    '<p style="color:var(--muted);margin-bottom:16px;">آخر تحديث: 1 جويلية 2026</p>' +
    '<h3>المادة 1 — الموضوع</h3><p>تنظّم شروط الاستخدام العامة هذه الدخول إلى منصة ALGERNA واستخدامها، التي طوّرتها <strong>Capcowork SARL</strong> لحساب ولاية الجزائر. بدخولكم إلى ALGERNA، توافقون دون تحفظ على هذه الشروط.</p>' +
    '<h3>المادة 2 — الناشر</h3><p>Capcowork SARL — لحساب ولاية الجزائر.<br>الاتصال: <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>' +
    '<h3>المادة 3 — الدخول إلى المنصة</h3><p>ALGERNA متاحة مجاناً لكل مواطن مقيم في ولاية الجزائر. التسجيل مفتوح للأشخاص البالغين <strong>16 سنة</strong> فما فوق. يُشترط رقم هاتف صالح لإنشاء الحساب.</p>' +
    '<h3>المادة 4 — الخدمات المقدّمة</h3><p>تتيح ALGERNA للمواطنين: الإبلاغ عن اختلالات في الفضاء العام؛ متابعة معالجة بلاغاتهم؛ حجز مواعيد للإجراءات الإدارية؛ الاطلاع على معلومات وبلاغات الولاية؛ المشاركة في الاستشارات المواطنية.</p>' +
    '<h3>المادة 5 — التزامات المستخدم</h3><p>يلتزم المستخدم بـ: تقديم معلومات دقيقة وقابلة للتحقق؛ عدم تقديم بلاغات احتيالية أو تعسفية؛ احترام المستخدمين الآخرين والأعوان العموميين؛ عدم محاولة الوصول إلى بيانات لا تخصه؛ عدم تعطيل عمل المنصة.</p>' +
    '<h3>المادة 6 — حساب المستخدم</h3><p>كل مستخدم مسؤول عن سرية بيانات تعريفه. أي استخدام تعسفي للحساب قد يؤدي إلى تعليقه مؤقتاً أو نهائياً، دون إشعار مسبق.</p>' +
    '<h3>المادة 7 — النقاط والشارات</h3><p>تمنح ALGERNA نقاطاً وشارات لتشجيع المشاركة المواطنية. هذه العناصر لا تشكل حقاً مكتسباً ويمكن تعديلها أو سحبها وفق القواعد المعمول بها. لا تترتب عنها أي مقابل مالي.</p>' +
    '<h3>المادة 8 — البيانات الشخصية</h3><p>تُعالج البيانات المجمّعة وفق <a href="#" onclick="showLegalPage(\'confidentialite\');return false;" style="color:var(--blue);font-weight:600;">سياسة الخصوصية</a> الخاصة بنا ووفق القانون الجزائري رقم 18-07 المتعلق بحماية البيانات ذات الطابع الشخصي.</p>' +
    '<h3>المادة 9 — الملكية الفكرية</h3><p>جميع محتويات المنصة (نصوص، صور، شعارات، شفرة) محمية بحقوق الملكية الفكرية. يُمنع أي نسخ دون إذن.</p>' +
    '<h3>المادة 10 — تحديد المسؤولية</h3><p>تسعى ALGERNA لضمان توفّر المنصة، دون ضمان الاستمرارية. لا يمكن تحميل ولاية الجزائر وCapcowork SARL المسؤولية عن الانقطاعات أو الأخطاء التقنية أو العواقب المتعلقة بالبلاغات المقدّمة.</p>' +
    '<h3>المادة 11 — تعديل الشروط</h3><p>يمكن تعديل هذه الشروط في أي وقت. سيُبلغ المستخدم بأي تعديل جوهري. يُعدّ استمرار استخدام المنصة قبولاً بالشروط الجديدة.</p>' +
    '<h3>المادة 12 — القانون المطبّق</h3><p>تخضع هذه الشروط للقانون الجزائري. أي نزاع يعود لاختصاص محاكم الجزائر العاصمة.</p>' +
    '<p style="margin-top:20px;color:var(--muted);">الاتصال: <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
  confidentialite: { titre: 'سياسة الخصوصية', html:
    '<p style="color:var(--muted);margin-bottom:16px;">آخر تحديث: 1 جويلية 2026</p>' +
    '<h3>1. المسؤول عن المعالجة</h3><p>المسؤول عن معالجة البيانات معيّن من قبل <strong>ولاية الجزائر</strong>، في إطار تشغيل منصة ALGERNA. التنفيذ التقني تتولاه Capcowork SARL.</p>' +
    '<h3>2. البيانات المجمّعة</h3><p>نجمع البيانات التالية: اللقب، الاسم، رقم الهاتف، بلدية الإقامة، البلاغات المقدّمة (نص، صور، موقع GPS)، المواعيد المحجوزة، تقييمات الخدمة، تفضيلات الإشعارات.</p>' +
    '<h3>3. الأغراض</h3><p>تُستخدم بياناتكم من أجل: معالجة بلاغاتكم وطلباتكم؛ تسيير مواعيدكم؛ إرسال إشعارات حول متابعة ملفاتكم؛ حساب مؤشرات جودة الخدمة (ICUA) بشكل مجهول الهوية؛ تحسين الخدمات العمومية للولاية.</p>' +
    '<h3>4. الأساس القانوني</h3><p>تستند المعالجة إلى مهمة الخدمة العمومية لولاية الجزائر وإلى موافقة المستخدم عند تسجيله.</p>' +
    '<h3>5. الاستضافة</h3><p>تُستضاف بياناتكم <strong>في الجزائر</strong>، وفق متطلبات القانون رقم 18-07 المؤرخ في 10 جوان 2018 المتعلق بحماية الأشخاص الطبيعيين في معالجة البيانات ذات الطابع الشخصي. لا يتم أي نقل للبيانات خارج التراب الوطني.</p>' +
    '<h3>6. مدة الحفظ</h3><p>تُحفظ بيانات الحساب طوال مدة استخدام الخدمة، ثم 12 شهراً بعد حذف الحساب. تُحفظ البلاغات 5 سنوات لأغراض إحصائية وتحسين الخدمة.</p>' +
    '<h3>7. حقوقكم</h3><p>وفق القانون 18-07، تتمتعون بالحقوق التالية: حق الاطلاع على بياناتكم؛ حق التصحيح؛ حق الحذف؛ حق الاعتراض على المعالجة؛ حق النقل (تصدير بياناتكم).</p>' +
    '<h3>8. ممارسة حقوقكم</h3><p>يمكنكم ممارسة حقوقكم مباشرة من ملفكم الشخصي في ALGERNA (تصدير، حذف) أو بالاتصال على: <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a>.</p>' +
    '<h3>9. الأمان</h3><p>ننفّذ تدابير تقنية وتنظيمية لحماية بياناتكم: تشفير كلمات المرور، اتصالات مؤمّنة (HTTPS)، التحكم في الوصول حسب الدور، تسجيل عمليات الدخول.</p>' +
    '<h3>10. ملفات تعريف الارتباط</h3><p>تستخدم ALGERNA ملفات تعريف ارتباط تقنية فقط. لمعرفة المزيد، راجعوا <a href="#" onclick="showLegalPage(\'cookies\');return false;" style="color:var(--blue);font-weight:600;">سياسة ملفات تعريف الارتباط</a> الخاصة بنا.</p>' +
    '<p style="margin-top:20px;color:var(--muted);">الاتصال: <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
  cookies: { titre: 'سياسة ملفات تعريف الارتباط', html:
    '<p style="color:var(--muted);margin-bottom:16px;">آخر تحديث: 1 جويلية 2026</p>' +
    '<h3>1. ما هو ملف تعريف الارتباط؟</h3><p>ملف تعريف الارتباط (cookie) هو ملف نصي صغير يُخزّن على جهازكم عند زيارتكم لـ ALGERNA. يسمح بحفظ تفضيلاتكم وضمان حسن عمل المنصة.</p>' +
    '<h3>2. ملفات تعريف الارتباط المستخدمة</h3><p>تستخدم ALGERNA حصراً <strong>ملفات تعريف ارتباط تقنية ضرورية</strong>:</p>' +
    '<ul style="margin:8px 0 12px 20px;line-height:1.8;"><li><strong>رمز المصادقة</strong> — يحافظ على جلستكم نشطة</li><li><strong>تفضيل اللغة</strong> — يحفظ اختياركم (فرنسية أو عربية)</li><li><strong>Service Worker</strong> — يتيح العمل دون اتصال وتخزين التطبيق مؤقتاً</li><li><strong>تفضيلات العرض</strong> — يحفظ إعدادات واجهتكم</li></ul>' +
    '<h3>3. ملفات تعريف ارتباط الأطراف الثالثة</h3><p>ALGERNA <strong>لا تستخدم أي ملفات تعريف ارتباط إعلانية أو تتبعية أو لقياس الجمهور من أطراف ثالثة</strong>. لا تُشارك أي بيانات مع شبكات إعلانية أو مواقع تواصل اجتماعي.</p>' +
    '<h3>4. مدة الحفظ</h3><p>تُحذف ملفات تعريف ارتباط الجلسة عند تسجيل الخروج. تُحفظ تفضيلات اللغة حتى يعدّلها المستخدم.</p>' +
    '<h3>5. إدارة ملفات تعريف الارتباط</h3><p>يمكنكم ضبط متصفحكم لحظر ملفات تعريف الارتباط، لكن ذلك سيمنع العمل الطبيعي لـ ALGERNA (الاتصال، البلاغات، المواعيد).</p>' +
    '<h3>6. الرابط بسياسة الخصوصية</h3><p>لمعرفة المزيد حول إدارة بياناتكم، راجعوا <a href="#" onclick="showLegalPage(\'confidentialite\');return false;" style="color:var(--blue);font-weight:600;">سياسة الخصوصية</a> الخاصة بنا.</p>' +
    '<p style="margin-top:20px;color:var(--muted);">الاتصال: <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
  mentions: { titre: 'المعلومات القانونية', html:
    '<h3>الناشر</h3><p><strong>Capcowork SARL</strong> — لحساب ولاية الجزائر.</p>' +
    '<h3>المنصة</h3><p>ALGERNA — منصة مواطنية للحوكمة الحضرية.</p>' +
    '<h3>الاستضافة</h3><p>Pylcom — استضافة في الجزائر.</p>' +
    '<h3>المسؤول</h3><p>الأمانة العامة لولاية الجزائر.</p>' +
    '<h3>الاتصال</h3><p><a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a> — هاتف: 1548</p>' +
    '<p>هذه الخدمة مجانية لمواطني ولاية الجزائر.</p>'
  },
  mot_wali: { titre: 'كلمة الوالي', html:
    '<p style="font-size:15px;font-style:italic;line-height:1.8;color:var(--navy);">مواطناتي ومواطني الجزائر العاصمة الأعزاء،</p>' +
    '<p style="line-height:1.8;">طموحنا هو تقريب الإدارة من المواطن، وتبسيط الإجراءات، وتعزيز جودة الخدمة العمومية في الجزائر العاصمة.</p>' +
    '<p style="line-height:1.8;">ALGERNA هي ثمرة هذه الرؤية: منصة مواطنية تتيح لكم الإبلاغ والمتابعة والمشاركة في تحسين إطار حياتكم.</p>' +
    '<p style="line-height:1.8;">كل بلاغ تقدّمونه يساهم في بناء مدينة أكثر تجاوباً ونظافةً وأماناً.</p>' +
    '<p style="line-height:1.8;">أعوّل على التزامكم لجعل الجزائر العاصمة حاضرة نموذجية في خدمة الجميع.</p>' +
    '<p style="margin-top:20px;font-weight:700;color:var(--navy);">والي الجزائر العاصمة</p>'
  },
  accessibilite: { titre: 'إمكانية الوصول', html:
    '<p style="color:var(--muted);margin-bottom:16px;">آخر تحديث: 1 جويلية 2026</p>' +
    '<h3>الالتزام</h3><p>تلتزم ولاية الجزائر بجعل منصة ALGERNA متاحة للجميع، وفق معايير الويب.</p>' +
    '<h3>التدابير المتخذة</h3><ul style="margin:8px 0 12px 20px;line-height:1.8;"><li>إمكانية التصفح بلوحة المفاتيح عبر كافة الشاشات</li><li>تباين الألوان مطابق لتوصيات WCAG 2.1 مستوى AA</li><li>نصوص قابلة للتكبير حتى 200%</li><li>نماذج بعناوين واضحة ورسائل خطأ مفهومة</li><li>تطبيق تقدّمي (PWA) متوافق مع الهاتف والجهاز اللوحي</li><li>دعم ثنائي اللغة فرنسية / عربية مع اتجاه RTL أصلي</li></ul>' +
    '<h3>الإبلاغ عن مشكلة</h3><p>إذا واجهتم صعوبة في الوصول، راسلونا: <a href="mailto:contact@wilaya-alger.dz">contact@wilaya-alger.dz</a></p>'
  },
};

function showLegalPage(page) {
  const src = currentLang === 'ar' ? LEGAL_PAGES_AR : LEGAL_PAGES;
  const data = src[page] || LEGAL_PAGES[page];
  if (!data) return;
  document.getElementById('legal-page-title').textContent = data.titre;
  document.getElementById('legal-content').innerHTML = '<div style="font-size:14px;line-height:1.7;color:#333;">' + data.html + '</div>';
  showView('legal');
}

async function exportMyData() {
  try {
    const data = await safeFetchJSON('/api/legal/export', {}, true);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'algerna_mes_donnees.json'; a.click();
    URL.revokeObjectURL(url);
    showToast(t('legal.export_ok'));
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

async function requestDelete() {
  if (!confirm(t('legal.supprimer_confirm'))) return;
  try {
    const res = await apiFetch('/api/legal/delete-request', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: '{}'
    });
    const d = await res.json();
    showToast(d.message || t('legal.supprimer_ok'));
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

// ─── MON PROFIL ─────────────────────────────────────────────
async function initProfil() {
  try {
    var u = await safeFetchJSON('/api/auth/me', {}, true);
    // Populate read view
    // Labels par fonction (nouveau) avec fallback par role (ancien)
    var fonctionLabels = currentLang === 'ar'
      ? { citoyen:'مواطن', agent_traitant:'عون الاستقبال والتنسيق', cap:'عون القرب (CAP)', entite_responsable:'مسؤول مصلحة', superviseur:'مشرف' }
      : { citoyen:'Citoyen', agent_traitant:'Agent de réception et de coordination', cap:'Agent de Proximité (CAP)', entite_responsable:'Responsable de service', superviseur:'Superviseur' };
    var roleLabels = currentLang === 'ar'
      ? { citoyen:'مواطن', agent:'عون الاستقبال والتنسيق', admin_apc:'المركز العملياتي', admin_wilaya:'القيادة الاستراتيجية', operateur:'مسؤول مصلحة' }
      : { citoyen:'Citoyen', agent:'Agent de réception et de coordination', admin_apc:'Centre Opérationnel', admin_wilaya:'Pilotage stratégique', operateur:'Responsable de service' };
    var displayRole = (u.fonction && fonctionLabels[u.fonction]) ? fonctionLabels[u.fonction] : roleLabels[u.role] || u.role;
    if (u.fonction === 'superviseur' && u.organisation_nom) displayRole = u.organisation_nom;
    if (u.fonction === 'entite_responsable' && u.organisation_nom) displayRole = (currentLang==='ar'?'مسؤول — ':'Responsable — ') + u.organisation_nom;
    var communeNom = '';
    if (u.commune_id && communes.length) {
      var c = communes.find(function(x) { return x.id === u.commune_id; });
      communeNom = c ? c.nom : '';
    }
    var _pL = currentLang === 'ar'
      ? {prenom:'الاسم',nom:'اللقب',tel:'الهاتف',email:'البريد الإلكتروني',commune:'البلدية',quartier:'الحي',adresse:'العنوان',poste:'المنصب'}
      : {prenom:'Prénom',nom:'Nom',tel:'Téléphone',email:'Email',commune:'Commune',quartier:'Quartier',adresse:'Adresse',poste:'Poste'};
    document.getElementById('profil-infos-content').innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
      '<div><span style="color:var(--muted);">' + _pL.prenom + '</span><div style="font-weight:600;">' + escHtml(u.prenom || '—') + '</div></div>' +
      '<div><span style="color:var(--muted);">' + _pL.nom + '</span><div style="font-weight:600;">' + escHtml(u.nom || '—') + '</div></div>' +
      '<div><span style="color:var(--muted);">' + _pL.tel + '</span><div style="font-weight:600;">' + escHtml(u.telephone || '—') + '</div></div>' +
      '<div><span style="color:var(--muted);">' + _pL.email + '</span><div style="font-weight:600;">' + escHtml(u.email || '—') + '</div></div>' +
      '<div><span style="color:var(--muted);">' + _pL.commune + '</span><div style="font-weight:600;">' + escHtml(communeNom || '—') + '</div></div>' +
      '<div><span style="color:var(--muted);">' + _pL.quartier + '</span><div style="font-weight:600;">' + escHtml(u.quartier_nom ? (currentLang === 'ar' && u.quartier_nom_ar ? u.quartier_nom_ar : u.quartier_nom) : (u.quartier || '—')) + '</div></div>' +
      '<div><span style="color:var(--muted);">' + _pL.adresse + '</span><div style="font-weight:600;">' + escHtml(u.adresse || '—') + '</div></div>' +
      '<div><span style="color:var(--muted);">' + _pL.poste + '</span><div style="font-weight:600;">' + escHtml(displayRole) + '</div></div>' +
      '</div>';
    // Populate edit form
    document.getElementById('profil-prenom').value = u.prenom || '';
    document.getElementById('profil-nom').value = u.nom || '';
    document.getElementById('profil-tel').value = u.telephone || '';
    document.getElementById('profil-email').value = u.email || '';
    document.getElementById('profil-adresse').value = u.adresse || '';
    // Commune select
    var commSel = document.getElementById('profil-commune');
    commSel.innerHTML = '<option value="">' + (currentLang==='ar'?'-- اختيار --':'-- Sélectionner --') + '</option>';
    communes.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.nom;
      commSel.appendChild(opt);
    });
    if (u.commune_id) commSel.value = u.commune_id;
    // Quartier select (filtered by commune)
    var qSel = document.getElementById('profil-quartier-select');
    await profilLoadQuartiers(u.commune_id, u.quartier_id);
    commSel.onchange = function() { profilLoadQuartiers(commSel.value, null); };
    // KYC block (citoyens seulement)
    var kycBlock = document.getElementById('profil-kyc-block');
    if (kycBlock && (u.fonction === 'citoyen' || u.role === 'citoyen' || !u.fonction)) {
      kycBlock.style.display = '';
      var niveau = u.niveau_compte || 1;
      var niveauLabels = {1: t('kyc.niveau_1'), 2: t('kyc.niveau_2'), 3: t('kyc.niveau_3'), 4: t('kyc.niveau_4')};
      var badge = document.getElementById('profil-niveau-badge');
      badge.textContent = niveauLabels[niveau];
      badge.style.background = niveau >= 2 ? '#dcfce7' : '#f3f4f6';
      badge.style.color = niveau >= 2 ? '#16a34a' : 'var(--muted)';
      // Jauge de complétude
      var filled = 0; var total = 5;
      if (u.nom) filled++;
      if (u.email) filled++;
      if (u.commune_id) filled++;
      if (u.quartier_id || u.houma_lat) filled++;
      if (u.nin || u.nin_declare) filled++;
      var pct = Math.round(filled / total * 100);
      document.getElementById('profil-jauge-pct').textContent = pct + ' %';
      document.getElementById('profil-jauge-bar').style.width = pct + '%';
      // NIN block
      if (!u.nin && !u.nin_declare) {
        document.getElementById('profil-nin-block').style.display = '';
        document.getElementById('profil-nin-done').style.display = 'none';
      } else {
        document.getElementById('profil-nin-block').style.display = 'none';
        document.getElementById('profil-nin-done').style.display = '';
      }
      // Quota info
      try {
        var q = await safeFetchJSON('/api/auth/quota', {}, true);
        var qInfo = document.getElementById('profil-quota-info');
        var periodeLabel = q.periode === 'jour' ? t('quota.par_jour') : t('quota.par_mois');
        qInfo.textContent = q.restants + ' ' + t('quota.restants') + ' (' + q.limite + ' ' + periodeLabel + ')';
      } catch(e) { console.warn('[profil] échec chargement quota:', e.message); }
    } else if (kycBlock) { kycBlock.style.display = 'none'; }
    // Prefs
    var prefMap = {'profil-pref-push':'notifications_push','profil-pref-sms':'notifications_sms','profil-pref-email':'notifications_email'};
    for (var pid in prefMap) {
      var el = document.getElementById(pid);
      if (el) el.checked = !!u[prefMap[pid]];
    }
    // Bloc "Mon rôle" pour les profils professionnels
    var roleBlock = document.getElementById('profil-role-block');
    var roleContent = document.getElementById('profil-role-content');
    if (roleBlock && roleContent && u.fonction && u.fonction !== 'citoyen') {
      roleBlock.style.display = '';
      var fnL = currentLang === 'ar'
        ? {agent_traitant:'عون الاستقبال والتنسيق',cap:'عون القرب (CAP)',entite_responsable:'مسؤول مصلحة',superviseur:'مشرف'}
        : {agent_traitant:'Agent de réception et de coordination',cap:'Agent de Proximité (CAP)',entite_responsable:'Responsable de service',superviseur:'Superviseur'};
      var _rL = currentLang === 'ar'
        ? {fonction:'الوظيفة',org:'المؤسسة',perimetre:'النطاق',capacites:'الصلاحيات',jePeux:'يمكنني',horsPeri:'خارج نطاقي',quiTransmet:'من يحيل إليّ؟',aQuiRends:'لمن أقدم حسابي؟'}
        : {fonction:'Fonction',org:'Organisation',perimetre:'Périmètre',capacites:'Capacités',jePeux:'Je peux',horsPeri:'Hors périmètre',quiTransmet:'Qui me transmet ?',aQuiRends:'À qui je rends compte ?'};
      var rhtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin-bottom:14px;">';
      rhtml += '<div><span style="color:var(--muted);font-size:11px;">' + _rL.fonction + '</span><div style="font-weight:700;color:var(--navy);">' + escHtml(fnL[u.fonction] || u.fonction) + '</div></div>';
      rhtml += '<div><span style="color:var(--muted);font-size:11px;">' + _rL.org + '</span><div style="font-weight:600;color:var(--navy);">' + escHtml(u.organisation_nom || '—') + '</div></div>';
      rhtml += '<div><span style="color:var(--muted);font-size:11px;">' + _rL.perimetre + '</span><div style="font-weight:600;color:var(--navy);">' + escHtml(u.niveau_perimetre || '—') + '</div></div>';
      rhtml += '<div><span style="color:var(--muted);font-size:11px;">' + _rL.capacites + '</span><div style="font-weight:600;color:var(--navy);">' + escHtml((u.capacites || []).join(', ') || '—') + '</div></div>';
      rhtml += '</div>';
      var perms = currentLang === 'ar' ? {
        agent_traitant: {can:'التحقق من المقبولية · التصنيف · الإحالة · طلب تدخل CAP',cannot:'الحل · التدخل الميداني · النشر',from:'المواطنون (عبر التطبيق)',to:'المركز العملياتي'},
        cap: {can:'قبول التدخل · المعاينة · التصوير · التقرير',cannot:'التصنيف · الإحالة · الرفض · الإغلاق · النشر',from:'مركز الاستقبال — الولاية',to:'الولاية — مركز الاستقبال'},
        entite_responsable: {can:'تنظيم التدخلات · التكليف · المتابعة · التصريح بالإنجاز',cannot:'التصنيف · الرفض · طلب CAP · النشر · الإغلاق',from:'مركز الاستقبال — الولاية',to:'مركز الاستقبال — الولاية'},
        superviseur: {can:'متابعة الآجال · التنسيق · التذكير · طلب CAP · إعداد بلاغ',cannot:'معالجة ملف · الحل · التدخل',from:'المصالح (الردود)',to:'القيادة الاستراتيجية'}
      } : {
        agent_traitant: {can:'Vérifier la recevabilité · Qualifier · Transmettre · Demander une intervention CAP',cannot:'Résoudre · Intervenir sur le terrain · Publier',from:'Les citoyens (via l\'application)',to:'Centre Opérationnel'},
        cap: {can:'Accepter une intervention · Constater · Photographier · Rapporter',cannot:'Qualifier · Transmettre · Rejeter · Clôturer · Publier',from:'Centre de Réception — Wilaya',to:'Wilaya — Centre de Réception'},
        entite_responsable: {can:'Organiser les interventions · Affecter · Suivre · Déclarer terminé',cannot:'Qualifier · Rejeter · Demander CAP · Publier · Clôturer',from:'Centre de Réception — Wilaya',to:'Centre de Réception — Wilaya'},
        superviseur: {can:'Suivre les délais · Coordonner · Relancer · Solliciter CAP · Préparer communiqué',cannot:'Traiter un dossier · Résoudre · Intervenir',from:'Les services (retours)',to:'Pilotage stratégique'}
      };
      var p = perms[u.fonction];
      if (p) {
        rhtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">';
        rhtml += '<div style="background:var(--gray-50);border-radius:10px;padding:12px;"><div style="font-weight:700;font-size:12px;margin-bottom:6px;">' + _rL.jePeux + '</div><div style="font-size:12px;line-height:1.7;">' + p.can.split(' · ').map(function(c){return '✓ '+c;}).join('<br>') + '</div></div>';
        rhtml += '<div style="background:var(--gray-50);border-radius:10px;padding:12px;"><div style="font-weight:700;font-size:12px;margin-bottom:6px;">' + _rL.horsPeri + '</div><div style="font-size:12px;line-height:1.7;color:var(--muted);">' + p.cannot.split(' · ').map(function(c){return '✗ '+c;}).join('<br>') + '</div></div>';
        rhtml += '</div>';
        rhtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;">';
        rhtml += '<div><span style="color:var(--muted);font-size:11px;">' + _rL.quiTransmet + '</span><div style="font-weight:600;color:var(--navy);font-size:12px;">' + escHtml(p.from) + '</div></div>';
        rhtml += '<div><span style="color:var(--muted);font-size:11px;">' + _rL.aQuiRends + '</span><div style="font-weight:600;color:var(--navy);font-size:12px;">' + escHtml(p.to) + '</div></div>';
        rhtml += '</div>';
      }
      roleContent.innerHTML = rhtml;
    } else if (roleBlock) { roleBlock.style.display = 'none'; }
  } catch(e) {
    document.getElementById('profil-infos-content').innerHTML = '<p style="color:var(--red);">' + escHtml(e.message) + '</p>';
  }
}

async function saveProfileInfo(e) {
  e.preventDefault();
  hideError('profil-edit-error');
  try {
    var qSel = document.getElementById('profil-quartier-select');
    var qVal = qSel ? qSel.value : '';
    var body = {
      adresse: document.getElementById('profil-adresse').value.trim() || undefined,
      quartier_id: qVal ? parseInt(qVal) : null,
    };
    await apiFetch('/api/auth/preferences', {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    showSuccess('profil-edit-success', currentLang==='ar'?'تم تحديث الملف الشخصي.':'Profil mis à jour.');
    setTimeout(function() { initProfil(); }, 500);
  } catch(e) { showError('profil-edit-error', e.message); }
}

// Charger les quartiers pour le profil (filtrés par commune)
async function profilLoadQuartiers(communeId, selectedId) {
  var sel = document.getElementById('profil-quartier-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">' + t('profil.aucun_quartier') + '</option>';
  if (!communeId) return;
  try {
    var qs = await safeFetchJSON('/api/quartiers/public/communes/' + communeId, {}, true);
    qs.forEach(function(q) {
      var opt = document.createElement('option');
      opt.value = q.id;
      opt.textContent = currentLang === 'ar' && q.nom_ar ? q.nom_ar : q.nom;
      sel.appendChild(opt);
    });
    if (selectedId) sel.value = selectedId;
  } catch(e) { console.warn('[profil] échec chargement quartiers:', e.message); }
}

// Déclarer son NIN
async function declarerNIN() {
  var input = document.getElementById('profil-nin-input');
  var errDiv = document.getElementById('profil-nin-error');
  var nin = (input.value || '').trim();
  errDiv.style.display = 'none';
  if (!/^\d{18}$/.test(nin)) {
    errDiv.textContent = t('kyc.nin_format_erreur');
    errDiv.style.display = '';
    return;
  }
  try {
    var res = await apiFetch('/api/auth/nin', {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ nin: nin })
    });
    var data = await res.json();
    if (!res.ok) {
      errDiv.textContent = currentLang === 'ar' ? (data.erreur_ar || data.erreur) : data.erreur;
      errDiv.style.display = '';
      return;
    }
    showToast(t('kyc.nin_succes'));
    if (currentUser) { currentUser.nin = nin; currentUser.niveau_compte = 2; }
    initProfil();
  } catch(e) {
    errDiv.textContent = e.message;
    errDiv.style.display = '';
  }
}

async function changePassword(e) {
  e.preventDefault();
  hideError('securite-error');
  var oldPwd = document.getElementById('sec-old-pwd').value;
  var newPwd = document.getElementById('sec-new-pwd').value;
  var confirmPwd = document.getElementById('sec-confirm-pwd').value;
  if (newPwd !== confirmPwd) { showError('securite-error', currentLang==='ar'?'كلمتا المرور غير متطابقتين.':'Les mots de passe ne correspondent pas.'); return; }
  if (newPwd.length < 6) { showError('securite-error', currentLang==='ar'?'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.':'Le mot de passe doit contenir au moins 6 caractères.'); return; }
  try {
    var res = await apiFetch('/api/auth/password', {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ancienMotDePasse: oldPwd, nouveauMotDePasse: newPwd })
    });
    if (!res.ok) { var d = await res.json(); throw new Error(d.message || 'Erreur'); }
    showSuccess('securite-success', currentLang==='ar'?'تم تغيير كلمة المرور بنجاح.':'Mot de passe modifié avec succès.');
    document.getElementById('sec-old-pwd').value = '';
    document.getElementById('sec-new-pwd').value = '';
    document.getElementById('sec-confirm-pwd').value = '';
  } catch(e) { showError('securite-error', e.message); }
}

// ─── PARAMÈTRES ─────────────────────────────────────────────
async function initParametres() {
  try {
    var u = await safeFetchJSON('/api/auth/me', {}, true);
    var map = {'param-push':'notifications_push','param-sms':'notifications_sms','param-email':'notifications_email','param-geo':'consentement_geo','param-wilaya':'consentement_wilaya'};
    for (var id in map) { var el = document.getElementById(id); if (el) el.checked = !!u[map[id]]; }
  } catch(e) { console.warn('[profil] échec chargement paramètres:', e.message); }
}
async function changePasswordParam(e) {
  e.preventDefault();
  hideError('param-securite-error');
  var o = document.getElementById('param-old-pwd').value;
  var n = document.getElementById('param-new-pwd').value;
  var c = document.getElementById('param-confirm-pwd').value;
  if (n !== c) { showError('param-securite-error', currentLang==='ar'?'كلمتا المرور غير متطابقتين.':'Les mots de passe ne correspondent pas.'); return; }
  try {
    var res = await apiFetch('/api/auth/password', { method:'PATCH', headers:{...authHeaders(),'Content-Type':'application/json'}, body:JSON.stringify({ancienMotDePasse:o,nouveauMotDePasse:n}) });
    if (!res.ok) { var d = await res.json(); throw new Error(d.message || 'Erreur'); }
    showSuccess('param-securite-success', currentLang==='ar'?'تم تغيير كلمة المرور.':'Mot de passe modifié.');
    document.getElementById('param-old-pwd').value = '';
    document.getElementById('param-new-pwd').value = '';
    document.getElementById('param-confirm-pwd').value = '';
  } catch(e) { showError('param-securite-error', e.message); }
}

// ─── ESPACE CITOYEN ─────────────────────────────────────────
async function initEspaceCitoyen() {
  var el = document.getElementById('espace-citoyen-content');
  try {
    var data = await safeFetchJSON('/api/points/profil', {}, true);
    var pts = data.points || 0;
    var niveau = data.niveau || '—';
    var stats = data.stats || {};
    var journal = data.journal || [];
    el.innerHTML =
      '<div class="card" style="text-align:center;padding:32px;margin-bottom:16px;">' +
        '<div style="font-size:40px;font-weight:800;color:var(--color-turquoise);">' + pts + '</div>' +
        '<div style="font-size:14px;color:var(--muted);margin-bottom:8px;">points d\'impact</div>' +
        '<div style="display:inline-block;padding:4px 14px;border-radius:12px;background:var(--teal-light);color:var(--teal);font-weight:700;font-size:13px;">' + escHtml(niveau) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">' +
        '<div class="card" style="flex:1;min-width:100px;text-align:center;padding:16px;"><div style="font-size:22px;font-weight:800;color:var(--navy);">' + (stats.total||0) + '</div><div style="font-size:11px;color:var(--muted);">Signalements</div></div>' +
        '<div class="card" style="flex:1;min-width:100px;text-align:center;padding:16px;"><div style="font-size:22px;font-weight:800;color:var(--green);">' + (stats.resolus||0) + '</div><div style="font-size:11px;color:var(--muted);">Résolus</div></div>' +
        '<div class="card" style="flex:1;min-width:100px;text-align:center;padding:16px;"><div style="font-size:22px;font-weight:800;color:var(--blue);">' + (stats.communes||0) + '</div><div style="font-size:11px;color:var(--muted);">Communes</div></div>' +
      '</div>' +
      (journal.length ? '<div class="card" style="padding:16px;"><h4 style="color:var(--navy);margin:0 0 10px;">Historique récent</h4>' +
        journal.slice(0,10).map(function(j) {
          return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:13px;">' +
            '<span>' + escHtml(j.motif||'—') + '</span>' +
            '<span style="font-weight:700;color:' + (j.delta>=0?'var(--green)':'var(--red)') + ';">' + (j.delta>=0?'+':'') + j.delta + '</span></div>';
        }).join('') + '</div>' : '');
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + escHtml(e.message) + '</p>'; }
}

// ─── WILAYA ─────────────────────────────────────────────────
async function initWilaya() {
  var el = document.getElementById('wilaya-communiques');
  try {
    var data = await safeFetchJSON('/api/referentiel/epics/_CM');
    if (!data || !data.length) { el.innerHTML = '<div style="text-align:center;padding:12px;color:var(--muted);">Aucun communiqué.</div>'; return; }
    el.innerHTML = data.slice(0,5).map(function(c) {
      var icon = c.niveau==='urgent'?'🔴':c.niveau==='important'?'🔵':'📢';
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line);font-size:13px;">' + icon + ' <strong>' + escHtml(c.titre) + '</strong> — ' + escHtml(c.message) + '</div>';
    }).join('');
  } catch(e) { el.innerHTML = '<div style="text-align:center;padding:12px;color:var(--muted);">Communiqués indisponibles.</div>'; }
}

// ─── ADMINISTRATION CENTRALE ────────────────────────────────
var _adminCurrentTab = 'config';

function initBoAdmin() { adminTab('config'); }

// ─── CCOE — Centre de Coordination Opérationnelle ──────────────
var _ccoeMap = null;
var _ccoeCurrentEvt = null;

function ccoeFormatDateRange(evt) {
  if (!evt.date_debut) return '—';
  var d1 = new Date(evt.date_debut).toLocaleDateString('fr-FR');
  var result = '';
  if (evt.date_fin && evt.date_fin !== evt.date_debut && evt.date_fin.substring(0,10) !== evt.date_debut.substring(0,10)) {
    var d2 = new Date(evt.date_fin).toLocaleDateString('fr-FR');
    result = 'du ' + d1 + ' au ' + d2;
  } else {
    result = d1;
  }
  if (evt.heure_debut) {
    var h1 = (evt.heure_debut || '').substring(0,5);
    if (evt.heure_fin) {
      result += ' · ' + h1 + '-' + (evt.heure_fin || '').substring(0,5);
    } else {
      result += ' · ' + h1;
    }
  }
  return result;
}

function initCCOE() {
  var g = document.getElementById('ccoe-greeting');
  if (g && currentUser) g.textContent = 'CCOE — ' + (currentUser.prenom || 'Pilote');
  ccoeTab('evenements');
}

// ─── MES CHANTIERS CCOE (entité responsable) ──────────────
function initMesChantiersCCOE() {
  var g = document.getElementById('mcc-greeting');
  var s = document.getElementById('mcc-subtitle');
  if (g && currentUser) g.textContent = t('ccoe.mes_chantiers_titre') || 'Mes chantiers';
  if (s && currentUser) s.textContent = (currentUser.prenom || '') + ' — ' + (currentUser.organisation_nom || '');
  mccLoadChantiers();
}

function mccLoadChantiers() {
  var c = document.getElementById('mcc-content');
  c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  safeFetchJSON('/api/ccoe/chantiers', null, true).then(function(data) {
    if (!data || !data.length) {
      c.innerHTML = '<div class="card" style="padding:20px;text-align:center;color:var(--muted);">' + (t('ccoe.aucun_chantier') || 'Aucun chantier assigné à votre organisation.') + '</div>';
      return;
    }
    var statutColors = { non_commence:'#9CA3AF', en_preparation:'#3B82F6', en_cours:'#F59E0B', termine:'#10B981', valide:'#059669', bloque:'#DC2626' };
    var html = '<div style="font-weight:600;font-size:15px;margin-bottom:10px;">' + data.length + ' ' + (t('ccoe.chantiers_label') || 'chantier(s)') + '</div>';
    data.forEach(function(ch) {
      var pct = ch.nb_checklist > 0 ? Math.round((ch.nb_fait / ch.nb_checklist) * 100) : 0;
      var enRetard = ch.date_limite && new Date(ch.date_limite) < new Date() && !['termine','valide'].includes(ch.statut);
      var aAccuser = ch.transmis_le && !ch.accuse_le;
      html += '<div class="card" style="padding:14px;margin-bottom:8px;cursor:pointer;' + (aAccuser ? 'border-left:3px solid #F59E0B;' : enRetard ? 'border-left:3px solid #DC2626;' : '') + '" onclick="mccShowDetail(' + ch.id + ')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
        '<div style="min-width:0;flex:1;"><strong>' + escHtml(ch.titre) + '</strong>' +
        '<div style="font-size:12px;color:var(--muted);margin-top:2px;">' + escHtml(ch.axe) + (ch.date_limite ? ' · ' + new Date(ch.date_limite).toLocaleDateString('fr-FR') : '') + '</div></div>' +
        '<div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;color:#fff;background:' + (statutColors[ch.statut] || '#6B7280') + ';">' + escHtml(ch.statut) + '</span>' +
        (aAccuser ? '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#FEF3C7;color:#92400E;">' + (t('ccoe.a_accuser') || 'À accuser') + '</span>' : '') +
        (ch.transmis_le ? '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#D1FAE5;color:#059669;">✓</span>' : '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#FEF3C7;color:#92400E;">⏳</span>') +
        '<span style="font-size:12px;font-weight:600;color:' + (pct === 100 ? '#059669' : 'var(--muted)') + ';">' + pct + '%</span>' +
        (enRetard ? '<span style="font-size:10px;color:#DC2626;font-weight:600;">EN RETARD</span>' : '') +
        '</div></div>' +
        '<div style="margin-top:6px;background:#E5E7EB;border-radius:4px;height:4px;"><div style="width:' + pct + '%;height:100%;border-radius:4px;background:' + (statutColors[ch.statut] || '#6B7280') + ';"></div></div>' +
        '</div>';
    });
    c.innerHTML = html;
  }).catch(function(err) {
    c.innerHTML = '<div class="alert alert-error">' + escHtml(err.message || err) + '</div>';
  });
}

function mccShowDetail(chantierId) {
  var c = document.getElementById('mcc-content');
  c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  safeFetchJSON('/api/ccoe/chantiers/' + chantierId, null, true).then(function(ch) {
    var statutColors = { non_commence:'#9CA3AF', en_preparation:'#3B82F6', en_cours:'#F59E0B', termine:'#10B981', valide:'#059669', bloque:'#DC2626' };
    var isCab = currentUser && (currentUser.fonction === 'cabinet' || (currentUser.capacites && currentUser.capacites.includes('ccoe')));
    var html = '<div style="display:flex;gap:6px;margin-bottom:10px;"><button class="btn btn-sm btn-outline" onclick="mccLoadChantiers()">← ' + (t('ccoe.liste') || 'Liste') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="ccoeShowContact(' + ch.id + ')">📞 Contact</button></div>' +
      '<div class="card" style="padding:16px;margin-bottom:12px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
      '<h3 style="margin:0;min-width:0;">' + escHtml(ch.titre) + '</h3>' +
      '<span style="font-size:12px;padding:3px 10px;border-radius:10px;color:#fff;background:' + (statutColors[ch.statut] || '#6B7280') + ';">' + escHtml(ch.statut) + '</span></div>' +
      '<div style="font-size:13px;color:var(--muted);margin-top:4px;">' + (t('ccoe.axe') || 'Axe') + ': ' + escHtml(ch.axe) + ' · ' + escHtml(ch.organisation_nom || '') + '</div>' +
      (ch.description ? '<p style="font-size:13px;margin-top:8px;">' + escHtml(ch.description) + '</p>' : '') +
      '</div>';

    // Bandeau accusé de réception (service only, transmitted, not yet accused)
    if (ch.transmis_le && !ch.accuse_le && !isCab) {
      html += '<div style="padding:12px 16px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:6px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
        '<div style="font-size:13px;"><strong>' + (t('ccoe.ordre_recu') || 'Ordre de mission reçu le') + ' ' + new Date(ch.transmis_le).toLocaleDateString('fr-FR') + '</strong></div>' +
        '<button class="btn btn-sm btn-primary" onclick="mccAccuserReception(' + ch.id + ')">' + (t('ccoe.accuser_reception') || 'Accuser réception') + '</button></div>';
    } else if (ch.accuse_le) {
      html += '<div style="padding:8px 16px;background:#D1FAE5;border-left:4px solid #059669;border-radius:6px;margin-bottom:12px;font-size:13px;color:#059669;">' +
        '✓ ' + (t('ccoe.reception_accusee') || 'Réception accusée') + (ch.accuse_par ? ' par ' + escHtml(ch.accuse_par) : '') + ' — ' + new Date(ch.accuse_le).toLocaleString('fr-FR') + '</div>';
    }

    // Transition buttons (entite_responsable: no 'valide' button)
    var transitions = {
      non_commence: [{s:'en_preparation', l: t('ccoe.demarrer') || 'Démarrer prépa'},{s:'bloque', l: t('ccoe.bloquer') || 'Bloquer'}],
      en_preparation: [{s:'en_cours', l: t('ccoe.lancer') || 'Lancer'},{s:'bloque', l: t('ccoe.bloquer') || 'Bloquer'}],
      en_cours: [{s:'termine', l: t('ccoe.terminer') || 'Terminer'},{s:'bloque', l: t('ccoe.bloquer') || 'Bloquer'}],
      bloque: [{s:'en_preparation', l: t('ccoe.reprendre') || 'Reprendre'}],
      termine: []
    };
    if (isCab && ch.statut === 'termine') {
      transitions.termine = [{s:'valide', l:'✓ Valider (Cabinet)'}];
    }
    var actions = transitions[ch.statut] || [];
    if (actions.length || ch.statut === 'termine') {
      html += '<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">';
      actions.forEach(function(a) {
        var cls = a.s === 'bloque' ? 'btn-outline' : 'btn-primary';
        html += '<button class="btn btn-sm ' + cls + '" onclick="mccTransition(' + ch.id + ',\'' + a.s + '\')">' + a.l + '</button>';
      });
      // Demander validation (entite_responsable, chantier en_cours or termine)
      if (!isCab && ['en_cours','termine'].includes(ch.statut)) {
        html += '<button class="btn btn-sm btn-primary" style="background:#0B6078;" onclick="mccDemanderValidation(' + ch.id + ')">' + (t('ccoe.demander_validation') || '📋 Demander validation') + '</button>';
      }
      html += '</div>';
    }

    // Checklist — structure minimale : label flex horizontal par item
    html += '<h4 style="margin:0 0 8px;">' + t('ccoe.checklist') + ' (' + ch.checklist.length + ')</h4>';
    ch.checklist.forEach(function(item) {
      html += '<label style="display:flex;align-items:center;gap:12px;width:100%;padding:10px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;margin:0;">' +
        '<input type="checkbox" style="width:18px;height:18px;flex:0 0 18px;" ' + (item.coche ? 'checked' : '') + ' onchange="mccToggleChecklist(' + item.id + ',this.checked,' + ch.id + ')">' +
        '<span style="flex:1;font-size:14px;line-height:1.5;' + (item.coche ? 'text-decoration:line-through;color:var(--muted);' : '') + '">' + escHtml(item.libelle) + '</span>' +
        '</label>';
    });

    // Commentaires
    html += '<h4 style="margin:16px 0 8px;">' + (t('ccoe.commentaires') || 'Commentaires') + ' (' + ch.commentaires.length + ')</h4>';
    ch.commentaires.forEach(function(cm) {
      html += '<div style="padding:8px;background:#f9f9f9;border-radius:6px;margin-bottom:6px;">' +
        '<div style="font-size:12px;color:var(--muted);">' + escHtml(cm.auteur_prenom || '?') + ' · ' + new Date(cm.le).toLocaleString('fr-FR') + '</div>' +
        (cm.type_message ? '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#E0E7FF;color:#3B5BDB;margin-right:4px;">' + escHtml(cm.type_message.replace(/_/g,' ')) + '</span>' : '') +
        '<div style="font-size:13px;">' + escHtml(cm.message) + '</div>' +
        (cm.photo_path ? '<img src="' + escHtml(cm.photo_path) + '" style="max-width:120px;margin-top:4px;border-radius:4px;">' : '') +
        '</div>';
    });
    html += '<form onsubmit="mccAddComment(event,' + ch.id + ')" style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">' +
      '<input type="text" id="mcc-comment-msg" placeholder="' + (t('ccoe.ajouter_commentaire') || 'Ajouter un commentaire…') + '" style="flex:1;min-width:200px;" required>' +
      '<button type="submit" class="btn btn-sm btn-primary">' + (t('ccoe.envoyer') || 'Envoyer') + '</button></form>';

    // Validations
    if (ch.validations.length) {
      html += '<h4 style="margin:16px 0 8px;">Validations</h4>';
      ch.validations.forEach(function(v) {
        var vColor = v.decision === 'valide' ? '#059669' : v.decision === 'refuse' ? '#DC2626' : '#F59E0B';
        html += '<div style="padding:6px;font-size:13px;"><span style="color:' + vColor + ';font-weight:600;">' + escHtml(v.decision) + '</span> par ' + escHtml(v.auteur_prenom || '?') + ' · ' + new Date(v.le).toLocaleString('fr-FR') + (v.motif ? ' — ' + escHtml(v.motif) : '') + '</div>';
      });
    }

    c.innerHTML = html;
  }).catch(function(err) {
    c.innerHTML = '<div class="alert alert-error">' + escHtml(err.message || err) + '</div>';
  });
}

function mccTransition(id, statut) {
  apiFetch('/api/ccoe/chantiers/' + id + '/statut', {
    method: 'PUT', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ statut: statut })
  }).then(function() { showToast(t('ccoe.statut_maj') + ' → ' + statut, 'success'); mccShowDetail(id); })
    .catch(function(err) { showToast(err.message || err, 'error'); });
}

function mccToggleChecklist(itemId, checked, chantierId) {
  apiFetch('/api/ccoe/checklist/' + itemId + '/cocher', {
    method: 'PUT', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ coche: checked })
  }).then(function() { mccShowDetail(chantierId); })
    .catch(function(err) { showToast(err.message || err, 'error'); });
}

function mccAddComment(e, chantierId) {
  e.preventDefault();
  var msg = document.getElementById('mcc-comment-msg').value;
  apiFetch('/api/ccoe/chantiers/' + chantierId + '/commentaires', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ message: msg })
  }).then(function() { mccShowDetail(chantierId); })
    .catch(function(err) { showToast(err.message || err, 'error'); });
}

function mccAccuserReception(chantierId) {
  apiFetch('/api/ccoe/chantiers/' + chantierId + '/accuser', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}'
  }).then(function() { showToast(t('ccoe.reception_accusee') || 'Réception accusée', 'success'); mccShowDetail(chantierId); })
    .catch(function(err) { showToast(err.message || err, 'error'); });
}

function mccDemanderValidation(chantierId) {
  var msg = prompt(t('ccoe.motif_validation') || 'Message pour le Cabinet (optionnel) :');
  apiFetch('/api/ccoe/chantiers/' + chantierId + '/demander-validation', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ message: msg || '' })
  }).then(function() { showToast(t('ccoe.validation_demandee') || 'Demande de validation envoyée', 'success'); mccShowDetail(chantierId); })
    .catch(function(err) { showToast(err.message || err, 'error'); });
}

// ─── COLLECTE DES DÉCHETS (EPIC Propreté / admin_wilaya) ─────────────
var _cdTab = 'quartiers';

function initCollecteDechets() {
  _cdTab = 'quartiers';
  cdShowTab('quartiers');
  cdLoadNotesBadge();
}

function cdShowTab(tab) {
  _cdTab = tab;
  ['quartiers','categories','notes'].forEach(function(t) {
    var btn = document.getElementById('cd-tab-' + t);
    if (btn) { btn.className = 'btn btn-sm ' + (t === tab ? 'btn-primary' : 'btn-outline'); }
  });
  var el = document.getElementById('cd-content');
  if (tab === 'quartiers') cdLoadQuartiers(el);
  else if (tab === 'categories') cdLoadCategories(el);
  else if (tab === 'notes') cdLoadNotes(el);
}

// ── Quartiers & Créneaux ──
async function cdLoadQuartiers(el) {
  if (!el) el = document.getElementById('cd-content');
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('cd.chargement') + '</div>';
  try {
    var quartiers = await safeFetchJSON('/api/quartiers', { headers: authHeaders() });
    var html = '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">' +
      '<button class="btn btn-sm btn-primary" onclick="cdQuartierForm()">' + t('cd.nouveau_quartier') + '</button></div>';
    if (!quartiers.length) { html += '<div class="card" style="padding:16px;text-align:center;color:var(--muted);">' + t('cd.aucun_quartier') + '</div>'; }
    else {
      quartiers.forEach(function(q) {
        var isAr = currentLang === 'ar';
        var nom = isAr ? (q.nom_ar || q.nom) : q.nom;
        var cNom = isAr ? (q.commune_nom_ar || q.commune_nom) : q.commune_nom;
        html += '<div class="card" style="padding:12px;margin-bottom:6px;cursor:pointer;" onclick="cdQuartierDetail(' + q.id + ')">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
          '<div><strong>' + escHtml(nom) + '</strong><div style="font-size:12px;color:var(--muted);">' + escHtml(cNom || '') + ' · ' + (q.source || '') + '</div></div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
          '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + (q.statut === 'actif' ? '#D1FAE5' : '#FEE2E2') + ';color:' + (q.statut === 'actif' ? '#059669' : '#DC2626') + ';">' + t('cd.statut_' + q.statut) + '</span>' +
          '<span style="font-size:12px;color:var(--muted);">' + (q.nb_creneaux || 0) + ' ' + t('cd.creneaux') + '</span>' +
          '</div></div></div>';
      });
    }
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('cd.erreur') + '</p>'; }
}

async function cdQuartierDetail(id) {
  var el = document.getElementById('cd-content');
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('cd.chargement') + '</div>';
  try {
    var q = await safeFetchJSON('/api/quartiers/' + id, { headers: authHeaders() });
    var isAr = currentLang === 'ar';
    var nom = isAr ? (q.nom_ar || q.nom) : q.nom;
    var creneaux = q.creneaux || [];
    var html = '<button class="btn btn-sm btn-outline" onclick="cdLoadQuartiers()" style="margin-bottom:10px;">← ' + t('cd.retour_liste') + '</button>';
    html += '<div class="card" style="padding:16px;margin-bottom:12px;">';
    html += '<h3 style="margin:0 0 4px;">' + escHtml(nom) + '</h3>';
    html += '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;">' + escHtml(q.commune_nom || '') + ' · ' + (q.statut || '') + '</div>';
    html += '<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">' +
      '<button class="btn btn-sm btn-outline" onclick="cdQuartierForm(' + id + ')">' + t('cd.modifier') + '</button>' +
      '<button class="btn btn-sm btn-primary" onclick="cdCreneauxForm(' + id + ')">' + t('cd.gerer_creneaux') + '</button></div>';
    // Planning
    if (creneaux.length) {
      var jours = [t('ap.jour_0'),t('ap.jour_1'),t('ap.jour_2'),t('ap.jour_3'),t('ap.jour_4'),t('ap.jour_5'),t('ap.jour_6')];
      html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
      creneaux.forEach(function(c) {
        var typeColor = c.type_collecte==='menagers'?'#16a34a':c.type_collecte==='tri'?'#2563eb':'#f59e0b';
        html += '<tr><td style="padding:6px 8px;border-bottom:1px solid var(--line);font-weight:600;">' + jours[c.jour] + '</td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--line);"><span dir="ltr" style="unicode-bidi:embed;">' + c.heure_debut.substring(0,5) + ' – ' + c.heure_fin.substring(0,5) + '</span></td>' +
          '<td style="padding:6px 8px;border-bottom:1px solid var(--line);"><span style="padding:2px 8px;border-radius:10px;background:'+typeColor+'22;color:'+typeColor+';font-weight:600;font-size:11px;">' + t('ap.type_' + c.type_collecte) + '</span></td></tr>';
      });
      html += '</table>';
    } else { html += '<p style="color:var(--muted);font-size:13px;">' + t('cd.aucun_creneau') + '</p>'; }
    html += '</div>';
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('cd.erreur') + '</p>'; }
}

async function cdQuartierForm(editId) {
  var el = document.getElementById('cd-content');
  var isEdit = !!editId;
  var q = null;
  if (isEdit) { q = await safeFetchJSON('/api/quartiers/' + editId, { headers: authHeaders() }); }
  var isAr = currentLang === 'ar';
  var html = '<button class="btn btn-sm btn-outline" onclick="' + (isEdit ? 'cdQuartierDetail(' + editId + ')' : 'cdLoadQuartiers()') + '" style="margin-bottom:10px;">← ' + t('cd.retour_liste') + '</button>';
  html += '<div class="card" style="padding:16px;"><h3 style="margin:0 0 12px;">' + (isEdit ? t('cd.modifier_quartier') : t('cd.nouveau_quartier')) + '</h3>';
  html += '<form onsubmit="cdSaveQuartier(event,' + (editId || 'null') + ')">';
  html += '<div class="form-group"><label>' + t('cd.nom_fr') + '</label><input type="text" id="cd-q-nom" required value="' + escHtml(q ? q.nom : '') + '"></div>';
  html += '<div class="form-group"><label>' + t('cd.nom_ar') + '</label><input type="text" id="cd-q-nom-ar" value="' + escHtml(q ? (q.nom_ar || '') : '') + '"></div>';
  html += '<div class="form-group"><label>' + t('cd.commune') + '</label><select id="cd-q-commune" required>' +
    communes.map(function(c){ return '<option value="'+c.id+'"'+(q&&q.commune_id==c.id?' selected':'')+'>'+escHtml(isAr?(c.nom_ar||c.nom):c.nom)+'</option>'; }).join('') + '</select></div>';
  html += '<div class="form-group"><label>' + t('cd.source') + '</label><select id="cd-q-source"><option value="demo"' + (q && q.source === 'demo' ? ' selected' : '') + '>demo</option><option value="officiel"' + (q && q.source === 'officiel' ? ' selected' : '') + '>officiel</option></select></div>';
  if (isEdit) {
    html += '<div class="form-group"><label>' + t('cd.statut') + '</label><select id="cd-q-statut"><option value="actif"' + (q.statut === 'actif' ? ' selected' : '') + '>' + t('cd.statut_actif') + '</option><option value="inactif"' + (q.statut === 'inactif' ? ' selected' : '') + '>' + t('cd.statut_inactif') + '</option></select></div>';
  }
  html += '<button type="submit" class="btn btn-primary" style="width:100%;">' + t('cd.enregistrer') + '</button></form></div>';
  el.innerHTML = html;
}

async function cdSaveQuartier(e, editId) {
  e.preventDefault();
  var body = { nom: document.getElementById('cd-q-nom').value, nom_ar: document.getElementById('cd-q-nom-ar').value || null, commune_id: Number(document.getElementById('cd-q-commune').value), source: document.getElementById('cd-q-source').value };
  var statEl = document.getElementById('cd-q-statut');
  if (statEl) body.statut = statEl.value;
  var method = editId ? 'PATCH' : 'POST';
  var url = editId ? '/api/quartiers/' + editId : '/api/quartiers';
  await apiFetch(url, { method: method, headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  showToast(t('cd.quartier_ok'));
  if (editId) cdQuartierDetail(editId); else cdLoadQuartiers();
}

async function cdCreneauxForm(qid) {
  var el = document.getElementById('cd-content');
  var q = await safeFetchJSON('/api/quartiers/' + qid, { headers: authHeaders() });
  var creneaux = q.creneaux || [];
  var jours = [t('ap.jour_0'),t('ap.jour_1'),t('ap.jour_2'),t('ap.jour_3'),t('ap.jour_4'),t('ap.jour_5'),t('ap.jour_6')];
  var html = '<button class="btn btn-sm btn-outline" onclick="cdQuartierDetail(' + qid + ')" style="margin-bottom:10px;">← ' + t('cd.retour_liste') + '</button>';
  html += '<div class="card" style="padding:16px;"><h3 style="margin:0 0 12px;">' + t('cd.gerer_creneaux') + ' — ' + escHtml(q.nom) + '</h3>';
  html += '<div id="cd-cr-rows">';
  creneaux.forEach(function(c, idx) {
    html += cdCreneauRow(c, idx, jours);
  });
  html += '</div>';
  html += '<button type="button" class="btn btn-sm btn-outline" onclick="cdAddCreneauRow()" style="margin:8px 0;">+ ' + t('cd.ajouter_creneau') + '</button>';
  html += '<button class="btn btn-primary" onclick="cdSaveCreneaux(' + qid + ')" style="width:100%;margin-top:8px;">' + t('cd.enregistrer') + '</button></div>';
  el.innerHTML = html;
}

function cdCreneauRow(c, idx, jours) {
  if (!jours) jours = [t('ap.jour_0'),t('ap.jour_1'),t('ap.jour_2'),t('ap.jour_3'),t('ap.jour_4'),t('ap.jour_5'),t('ap.jour_6')];
  return '<div class="cd-cr-row" style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;align-items:center;">' +
    '<select class="cd-cr-jour" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' + jours.map(function(j, i) { return '<option value="'+i+'"'+(c && c.jour===i?' selected':'')+'>'+j+'</option>'; }).join('') + '</select>' +
    '<input type="time" class="cd-cr-debut" value="' + (c ? c.heure_debut.substring(0,5) : '08:00') + '" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' +
    '<input type="time" class="cd-cr-fin" value="' + (c ? c.heure_fin.substring(0,5) : '10:00') + '" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' +
    '<select class="cd-cr-type" style="padding:6px;border:1px solid var(--gray-300);border-radius:6px;font-size:12px;">' +
    '<option value="menagers"' + (c && c.type_collecte === 'menagers' ? ' selected' : '') + '>' + t('ap.type_menagers') + '</option>' +
    '<option value="tri"' + (c && c.type_collecte === 'tri' ? ' selected' : '') + '>' + t('ap.type_tri') + '</option>' +
    '<option value="encombrants"' + (c && c.type_collecte === 'encombrants' ? ' selected' : '') + '>' + t('ap.type_encombrants') + '</option>' +
    '</select>' +
    '<button type="button" onclick="this.parentElement.remove()" style="color:var(--red);border:none;background:none;cursor:pointer;font-size:16px;">✕</button></div>';
}

function cdAddCreneauRow() {
  var div = document.getElementById('cd-cr-rows');
  div.insertAdjacentHTML('beforeend', cdCreneauRow(null, div.children.length));
}

async function cdSaveCreneaux(qid) {
  var rows = document.querySelectorAll('.cd-cr-row');
  var creneaux = [];
  rows.forEach(function(row) {
    creneaux.push({
      jour: Number(row.querySelector('.cd-cr-jour').value),
      heure_debut: row.querySelector('.cd-cr-debut').value + ':00',
      heure_fin: row.querySelector('.cd-cr-fin').value + ':00',
      type_collecte: row.querySelector('.cd-cr-type').value
    });
  });
  await apiFetch('/api/quartiers/' + qid + '/creneaux', { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ creneaux: creneaux }) });
  showToast(t('cd.creneaux_ok'));
  cdQuartierDetail(qid);
}

// ── Catégories de déchets ──
async function cdLoadCategories(el) {
  if (!el) el = document.getElementById('cd-content');
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('cd.chargement') + '</div>';
  try {
    var cats = await safeFetchJSON('/api/quartiers/categories-dechets', { headers: authHeaders() });
    var html = '<button class="btn btn-sm btn-primary" onclick="cdCategorieForm()" style="margin-bottom:12px;">' + t('cd.nouvelle_categorie') + '</button>';
    cats.forEach(function(c) {
      html += '<div class="card" style="padding:12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
        '<div><strong>' + escHtml(c.nom_fr) + '</strong>' + (c.nom_ar ? ' <span style="color:var(--muted);">(' + escHtml(c.nom_ar) + ')</span>' : '') + '</div>' +
        '<div style="display:flex;gap:6px;align-items:center;">' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + (c.rappel_defaut ? '#DBEAFE' : '#F3F4F6') + ';color:' + (c.rappel_defaut ? '#2563eb' : 'var(--muted)') + ';">' + t(c.rappel_defaut ? 'cd.rappel_oui' : 'cd.rappel_non') + '</span>' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + (c.statut === 'actif' ? '#D1FAE5' : '#FEE2E2') + ';color:' + (c.statut === 'actif' ? '#059669' : '#DC2626') + ';">' + t('cd.statut_' + c.statut) + '</span>' +
        '<button class="btn btn-sm btn-outline" onclick="cdCategorieForm(' + c.id + ')" style="padding:2px 8px;font-size:11px;">' + t('cd.modifier') + '</button>' +
        '</div></div>';
    });
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('cd.erreur') + '</p>'; }
}

async function cdCategorieForm(editId) {
  var el = document.getElementById('cd-content');
  var c = null;
  if (editId) {
    var cats = await safeFetchJSON('/api/quartiers/categories-dechets', { headers: authHeaders() });
    c = cats.find(function(x) { return x.id === editId; });
  }
  var html = '<button class="btn btn-sm btn-outline" onclick="cdLoadCategories()" style="margin-bottom:10px;">← ' + t('cd.retour_liste') + '</button>';
  html += '<div class="card" style="padding:16px;"><h3 style="margin:0 0 12px;">' + (c ? t('cd.modifier_categorie') : t('cd.nouvelle_categorie')) + '</h3>';
  html += '<form onsubmit="cdSaveCategorie(event,' + (editId || 'null') + ')">';
  html += '<div class="form-group"><label>' + t('cd.nom_fr') + '</label><input type="text" id="cd-cat-nom-fr" required value="' + escHtml(c ? c.nom_fr : '') + '"></div>';
  html += '<div class="form-group"><label>' + t('cd.nom_ar') + '</label><input type="text" id="cd-cat-nom-ar" value="' + escHtml(c ? (c.nom_ar || '') : '') + '"></div>';
  html += '<div class="form-group"><label><input type="checkbox" id="cd-cat-rappel"' + (c && c.rappel_defaut ? ' checked' : '') + '> ' + t('cd.rappel_defaut') + '</label></div>';
  if (editId) {
    html += '<div class="form-group"><label>' + t('cd.statut') + '</label><select id="cd-cat-statut"><option value="actif"' + (c.statut === 'actif' ? ' selected' : '') + '>' + t('cd.statut_actif') + '</option><option value="inactif"' + (c.statut === 'inactif' ? ' selected' : '') + '>' + t('cd.statut_inactif') + '</option></select></div>';
  }
  html += '<button type="submit" class="btn btn-primary" style="width:100%;">' + t('cd.enregistrer') + '</button></form></div>';
  el.innerHTML = html;
}

async function cdSaveCategorie(e, editId) {
  e.preventDefault();
  var body = { nom_fr: document.getElementById('cd-cat-nom-fr').value, nom_ar: document.getElementById('cd-cat-nom-ar').value || null, rappel_defaut: document.getElementById('cd-cat-rappel').checked };
  var statEl = document.getElementById('cd-cat-statut');
  if (statEl) body.statut = statEl.value;
  var method = editId ? 'PATCH' : 'POST';
  var url = editId ? '/api/quartiers/categories-dechets/' + editId : '/api/quartiers/categories-dechets';
  await apiFetch(url, { method: method, headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  showToast(t('cd.categorie_ok'));
  cdLoadCategories();
}

// ── Notes ──
async function cdLoadNotes(el) {
  if (!el) el = document.getElementById('cd-content');
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('cd.chargement') + '</div>';
  try {
    var isWriter = currentUser && (currentUser.role === 'admin_wilaya' || (Array.isArray(currentUser.capacites) && currentUser.capacites.includes('collecte_dechets')));
    var notes = await safeFetchJSON('/api/notes-proprete', { headers: authHeaders() });
    var html = '';
    if (isWriter) {
      html += '<button class="btn btn-sm btn-primary" onclick="cdNoteForm()" style="margin-bottom:12px;">' + t('cd.nouvelle_note') + '</button>';
    }
    if (!notes.length) { html += '<div class="card" style="padding:16px;text-align:center;color:var(--muted);">' + t('cd.aucune_note') + '</div>'; }
    else {
      var niveauColors = { info: '#3B82F6', important: '#F59E0B', urgent: '#DC2626' };
      notes.forEach(function(n) {
        var col = niveauColors[n.niveau] || '#6B7280';
        html += '<div class="card" style="padding:12px;margin-bottom:6px;border-left:3px solid ' + col + ';' + (n.non_lu ? 'background:#FEFCE8;' : '') + 'cursor:pointer;" onclick="cdNoteDetail(' + n.id + ')">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">' +
          '<div><strong>' + escHtml(n.titre) + '</strong>' + (n.non_lu ? ' <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#FEF3C7;color:#92400E;">' + t('cd.non_lu') + '</span>' : '') + '</div>' +
          '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + col + '22;color:' + col + ';font-weight:600;">' + t('cd.niveau_' + n.niveau) + '</span></div>' +
          '<div style="font-size:12px;color:var(--muted);margin-top:2px;">' + escHtml(n.auteur_prenom || '') + ' ' + escHtml(n.auteur_nom || '') + ' · ' + new Date(n.cree_le).toLocaleDateString('fr-FR') + '</div>' +
          '</div>';
      });
    }
    el.innerHTML = html;
    cdLoadNotesBadge();
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('cd.erreur') + '</p>'; }
}

async function cdLoadNotesBadge() {
  try {
    var d = await safeFetchJSON('/api/notes-proprete/count', { headers: authHeaders() });
    var badge = document.getElementById('cd-notes-badge');
    if (!badge) return;
    if (d.unread > 0) { badge.textContent = d.unread; badge.style.display = ''; }
    else { badge.style.display = 'none'; }
  } catch(e) { /* ignore */ }
}

async function cdNoteDetail(id) {
  var el = document.getElementById('cd-content');
  // Mark as read
  await apiFetch('/api/notes-proprete/' + id + '/lu', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: '{}' });
  var notes = await safeFetchJSON('/api/notes-proprete', { headers: authHeaders() });
  var n = notes.find(function(x) { return x.id === id; });
  if (!n) { cdLoadNotes(el); return; }
  var niveauColors = { info: '#3B82F6', important: '#F59E0B', urgent: '#DC2626' };
  var col = niveauColors[n.niveau] || '#6B7280';
  var html = '<button class="btn btn-sm btn-outline" onclick="cdLoadNotes()" style="margin-bottom:10px;">← ' + t('cd.retour_liste') + '</button>';
  html += '<div class="card" style="padding:16px;border-left:4px solid ' + col + ';">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px;">';
  html += '<h3 style="margin:0;">' + escHtml(n.titre) + '</h3>';
  html += '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + col + '22;color:' + col + ';font-weight:600;">' + t('cd.niveau_' + n.niveau) + '</span></div>';
  html += '<div style="font-size:12px;color:var(--muted);margin-bottom:12px;">' + escHtml(n.auteur_prenom || '') + ' ' + escHtml(n.auteur_nom || '') + ' · ' + new Date(n.cree_le).toLocaleString('fr-FR') + '</div>';
  html += '<p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">' + escHtml(n.texte) + '</p>';
  if (n.auteur_id === (currentUser && currentUser.id)) {
    html += '<button class="btn btn-sm btn-outline" onclick="cdDeleteNote(' + n.id + ')" style="margin-top:12px;color:var(--red);">' + t('cd.supprimer') + '</button>';
  }
  html += '</div>';
  el.innerHTML = html;
  cdLoadNotesBadge();
}

async function cdNoteForm() {
  var el = document.getElementById('cd-content');
  var html = '<button class="btn btn-sm btn-outline" onclick="cdLoadNotes()" style="margin-bottom:10px;">← ' + t('cd.retour_liste') + '</button>';
  html += '<div class="card" style="padding:16px;"><h3 style="margin:0 0 12px;">' + t('cd.nouvelle_note') + '</h3>';
  html += '<form onsubmit="cdSaveNote(event)">';
  html += '<div class="form-group"><label>' + t('cd.note_titre') + '</label><input type="text" id="cd-n-titre" required></div>';
  html += '<div class="form-group"><label>' + t('cd.note_texte') + '</label><textarea id="cd-n-texte" rows="4" required style="width:100%;padding:8px;border:1px solid var(--gray-300);border-radius:8px;"></textarea></div>';
  html += '<div class="form-group"><label>' + t('cd.note_niveau') + '</label><select id="cd-n-niveau"><option value="info">' + t('cd.niveau_info') + '</option><option value="important">' + t('cd.niveau_important') + '</option><option value="urgent">' + t('cd.niveau_urgent') + '</option></select></div>';
  html += '<button type="submit" class="btn btn-primary" style="width:100%;">' + t('cd.enregistrer') + '</button></form></div>';
  el.innerHTML = html;
}

async function cdSaveNote(e) {
  e.preventDefault();
  var body = { titre: document.getElementById('cd-n-titre').value, texte: document.getElementById('cd-n-texte').value, niveau: document.getElementById('cd-n-niveau').value };
  await apiFetch('/api/notes-proprete', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  showToast(t('cd.note_ok'));
  cdLoadNotes();
}

async function cdDeleteNote(id) {
  await apiFetch('/api/notes-proprete/' + id, { method: 'DELETE', headers: authHeaders() });
  showToast(t('cd.note_supprimee'));
  cdLoadNotes();
}

// ── Notes tab in Rachid's quartiers view ──
function apInitNotesTabs() {
  var isWil = currentUser && currentUser.role === 'admin_wilaya';
  var isApc = currentUser && currentUser.role === 'admin_apc';
  if (!isWil && !isApc) return;
  var tabsEl = document.getElementById('ap-extra-tabs');
  if (tabsEl) return; // already init
  var header = document.getElementById('ap-header');
  if (!header) return;
  var html = '<div id="ap-extra-tabs" style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">';
  html += '<button class="btn btn-sm btn-primary" id="ap-tab-quartiers" onclick="apExtraTab(\'quartiers\')" data-i18n="cd.tab_quartiers">' + t('cd.tab_quartiers') + '</button>';
  if (isWil) html += '<button class="btn btn-sm btn-outline" id="ap-tab-categories" onclick="apExtraTab(\'categories\')" data-i18n="cd.tab_categories">' + t('cd.tab_categories') + '</button>';
  html += '<button class="btn btn-sm btn-outline" id="ap-tab-notes" onclick="apExtraTab(\'notes\')"><span data-i18n="cd.tab_notes">' + t('cd.tab_notes') + '</span> <span id="ap-notes-badge" style="display:none;background:#ef4444;color:#fff;font-size:10px;padding:1px 6px;border-radius:10px;margin-left:4px;"></span></button>';
  html += '</div><div id="ap-extra-content" class="hidden"></div>';
  header.insertAdjacentHTML('afterend', html);
  // Load notes badge
  safeFetchJSON('/api/notes-proprete/count', { headers: authHeaders() }).then(function(d) {
    var b = document.getElementById('ap-notes-badge');
    if (b && d.unread > 0) { b.textContent = d.unread; b.style.display = ''; }
  }).catch(function(e) { console.warn('[admin] échec chargement badge notes propreté:', e.message); });
}

function apExtraTab(tab) {
  ['quartiers','categories','notes'].forEach(function(t) {
    var btn = document.getElementById('ap-tab-' + t);
    if (btn) btn.className = 'btn btn-sm ' + (t === tab ? 'btn-primary' : 'btn-outline');
  });
  var extra = document.getElementById('ap-extra-content');
  var main = document.getElementById('ap-list') || document.querySelector('#view-quartiers > div:not(#ap-header):not(#ap-extra-tabs):not(#ap-extra-content)');
  if (tab === 'quartiers') {
    if (extra) extra.classList.add('hidden');
    document.querySelectorAll('#view-quartiers > *:not(#ap-header):not(#ap-extra-tabs):not(#ap-extra-content)').forEach(function(el) { el.style.display = ''; });
  } else {
    document.querySelectorAll('#view-quartiers > *:not(#ap-header):not(#ap-extra-tabs):not(#ap-extra-content)').forEach(function(el) { if (el.id !== 'ap-header') el.style.display = 'none'; });
    if (extra) { extra.classList.remove('hidden'); }
    if (tab === 'categories') cdLoadCategories(extra);
    else if (tab === 'notes') cdLoadNotes(extra);
  }
}

function ccoeTab(tab) {
  document.querySelectorAll('#ccoe-tabs .admin-tab-btn').forEach(function(b) {
    b.classList.toggle('active', (b.dataset.tab === 'ccoe-' + tab));
  });
  var c = document.getElementById('ccoe-content');
  if (tab === 'evenements') ccoeLoadEvenements(c);
  else if (tab === 'chantiers') ccoeLoadChantiers(c);
  else if (tab === 'carte') ccoeLoadCarte(c);
  else if (tab === 'dashboard') ccoeLoadDashboard(c);
  else if (tab === 'annuaire') ccoeLoadAnnuaire(c);
}

// ── Événements ──
function ccoeLoadEvenements(container) {
  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  safeFetchJSON('/api/ccoe/evenements', null, true).then(function(data) {
    if (!data || !data.length) {
      container.innerHTML = '<div class="card" style="padding:20px;text-align:center;">' +
        '<p style="color:var(--muted);margin-bottom:12px;">Aucun événement enregistré</p>' +
        '<button class="btn btn-primary" onclick="ccoeShowEvtForm()">+ Nouvel événement</button></div>';
      return;
    }
    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<span style="font-weight:600;font-size:15px;">' + data.length + ' événement(s)</span>' +
      '<button class="btn btn-sm btn-primary" onclick="ccoeShowEvtForm()">+ Nouvel événement</button></div>';
    data.forEach(function(e) {
      var badge = e.importance === 'critique' ? 'background:#DC2626;color:#fff;' :
                  e.importance === 'haute' ? 'background:#F59E0B;color:#000;' : 'background:#6B7280;color:#fff;';
      var dateStr = ccoeFormatDateRange(e);
      html += '<div class="card" style="padding:14px;margin-bottom:8px;cursor:pointer;" onclick="ccoeShowEvtDetail(' + e.id + ')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div><strong>' + escHtml(e.titre) + '</strong>' +
        '<div style="font-size:12px;color:var(--muted);margin-top:2px;">' + escHtml(e.type === 'autre' && e.type_label ? e.type_label : e.type) + ' · ' + dateStr + (e.commune_nom ? ' · ' + escHtml(e.commune_nom) : '') + '</div></div>' +
        '<div style="display:flex;gap:6px;align-items:center;">' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;' + badge + '">' + escHtml(e.importance) + '</span>' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#E5E7EB;">' + escHtml(e.statut) + '</span>' +
        '<span style="font-size:12px;color:var(--muted);">' + (e.nb_opords || 0) + ' OPORD</span>' +
        '</div></div></div>';
    });
    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="alert alert-error">Erreur: ' + escHtml(err.message || err) + '</div>';
  });
}

function ccoeShowEvtForm(evt) {
  var isEdit = evt && evt.id;
  var types = ['president','premier_ministre','ministre','ambassadeur','fete_nationale','sportif','culturel','inspection_wali','autre'];
  var typeOpts = types.map(function(t) { return '<option value="' + t + '"' + (isEdit && evt.type === t ? ' selected' : '') + '>' + (t === 'autre' ? 'Autre…' : t.replace(/_/g, ' ')) + '</option>'; }).join('');
  var allAxes = ['securite','protocole','voirie','proprete','eclairage','espaces_verts','mobilite','stationnement','sante','communication','logistique'];
  var showAutre = isEdit && evt.type === 'autre';
  var html = '<div class="card" style="padding:20px;">' +
    '<h4 style="margin:0 0 14px;color:var(--navy);">' + (isEdit ? 'Modifier' : 'Nouvel événement') + '</h4>' +
    '<form onsubmit="ccoeSaveEvt(event,' + (isEdit ? evt.id : 'null') + ')">' +
    '<div class="form-group"><label>Titre *</label><input type="text" id="ccoe-evt-titre" required value="' + (isEdit ? escHtml(evt.titre) : '') + '"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
    '<div class="form-group"><label>Type *</label><select id="ccoe-evt-type" required onchange="ccoeToggleAutre()">' + typeOpts + '</select></div>' +
    '<div class="form-group"><label>Importance</label><select id="ccoe-evt-importance"><option value="normale">Normale</option><option value="haute"' + (isEdit && evt.importance === 'haute' ? ' selected' : '') + '>Haute</option><option value="critique"' + (isEdit && evt.importance === 'critique' ? ' selected' : '') + '>Critique</option></select></div>' +
    '</div>' +
    '<div id="ccoe-autre-fields" style="' + (showAutre ? '' : 'display:none;') + '">' +
    '<div class="form-group"><label>Intitulé du type *</label><input type="text" id="ccoe-evt-type-label" placeholder="Ex : Séminaire international" value="' + (isEdit && evt.type_label ? escHtml(evt.type_label) : '') + '"></div>' +
    '<div class="form-group"><label>Axes d\'intervention (au moins un) *</label><div id="ccoe-axes-checkboxes" style="display:flex;flex-wrap:wrap;gap:8px;">' +
    allAxes.map(function(a) { return '<label style="font-size:13px;display:flex;align-items:center;gap:4px;"><input type="checkbox" name="ccoe-axe" value="' + a + '"> ' + a.replace(/_/g, ' ') + '</label>'; }).join('') +
    '</div></div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
    '<div class="form-group"><label>' + (t('ccoe.date_debut') || 'Date de début') + ' *</label><input type="date" id="ccoe-evt-date-debut" required value="' + (isEdit ? (evt.date_debut || '').substring(0,10) : '') + '"></div>' +
    '<div class="form-group"><label>' + (t('ccoe.date_fin') || 'Date de fin') + '</label><input type="date" id="ccoe-evt-date-fin" value="' + (isEdit && evt.date_fin ? evt.date_fin.substring(0,10) : '') + '"></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
    '<div class="form-group"><label>' + (t('ccoe.heure_debut') || 'Heure de début') + '</label><input type="time" id="ccoe-evt-heure-debut" value="' + (isEdit && evt.heure_debut ? evt.heure_debut.substring(0,5) : '') + '"></div>' +
    '<div class="form-group"><label>' + (t('ccoe.heure_fin') || 'Heure de fin') + '</label><input type="time" id="ccoe-evt-heure-fin" value="' + (isEdit && evt.heure_fin ? evt.heure_fin.substring(0,5) : '') + '"></div>' +
    '</div>' +
    '<div class="form-group"><label>Lieu</label><input type="text" id="ccoe-evt-lieu" value="' + (isEdit ? escHtml(evt.lieu || '') : '') + '"></div>' +
    '<div class="form-group"><label>Description itinéraire</label><textarea id="ccoe-evt-itin-desc" rows="2" placeholder="Étapes du parcours…">' + (isEdit ? escHtml(evt.itineraire_description || '') : '') + '</textarea></div>' +
    '<div class="form-group"><label>' + (t('ccoe.itineraire') || 'Itinéraire') + ' & Zones</label>' +
    '<div id="ccoe-draw-mobile-msg" style="display:none;font-size:12px;color:var(--muted);margin-bottom:6px;font-style:italic;">' + (t('ccoe.trace_desktop') || 'Tracé modifiable sur ordinateur') + '</div>' +
    '<div id="ccoe-draw-map" style="height:350px;border-radius:8px;overflow:hidden;border:1px solid #ddd;"></div>' +
    '<div id="ccoe-draw-toolbar" style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">' +
    '<button type="button" class="btn btn-sm btn-outline" onclick="ccoeDrawStart(\'polyline\')" id="ccoe-btn-polyline">✏ Itinéraire</button>' +
    '<button type="button" class="btn btn-sm btn-outline" onclick="ccoeDrawStart(\'polygon\')" id="ccoe-btn-polygon">▭ Zone</button>' +
    '<button type="button" class="btn btn-sm btn-outline" style="color:#DC2626;" onclick="ccoeDrawClear()">✕ Effacer tout</button>' +
    '</div></div>' +
    '<div class="form-group"><label>Description</label><textarea id="ccoe-evt-desc" rows="2">' + (isEdit ? escHtml(evt.description || '') : '') + '</textarea></div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
    '<button type="button" class="btn btn-outline" onclick="ccoeTab(\'evenements\')">Annuler</button>' +
    '<button type="submit" class="btn btn-primary">Enregistrer</button>' +
    '</div></form></div>';
  document.getElementById('ccoe-content').innerHTML = html;
  // Init draw map after DOM
  setTimeout(function() { ccoeInitDrawMap(isEdit ? evt : null); }, 200);
}

function ccoeToggleAutre() {
  var sel = document.getElementById('ccoe-evt-type');
  var fields = document.getElementById('ccoe-autre-fields');
  if (fields) fields.style.display = sel.value === 'autre' ? '' : 'none';
}

// ── Draw Map for itineraire + zones ──
var _ccoeDrawMap = null;
var _ccoeDrawnItems = null;
var _ccoeDrawHandler = null;

function ccoeInitDrawMap(evt) {
  var el = document.getElementById('ccoe-draw-map');
  if (!el) return;
  var isMobile = window.innerWidth < 500;
  var mobileMsg = document.getElementById('ccoe-draw-mobile-msg');
  var toolbar = document.getElementById('ccoe-draw-toolbar');
  if (isMobile) {
    if (mobileMsg) mobileMsg.style.display = '';
    if (toolbar) toolbar.style.display = 'none';
  }

  if (_ccoeDrawMap) { _ccoeDrawMap.remove(); _ccoeDrawMap = null; }
  _ccoeDrawMap = L.map(el).setView([36.753, 3.058], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OSM' }).addTo(_ccoeDrawMap);

  _ccoeDrawnItems = new L.FeatureGroup();
  _ccoeDrawMap.addLayer(_ccoeDrawnItems);

  // Load existing GeoJSON if editing
  if (evt) {
    if (evt.itineraire_geojson) {
      try {
        var itin = typeof evt.itineraire_geojson === 'string' ? JSON.parse(evt.itineraire_geojson) : evt.itineraire_geojson;
        L.geoJSON(itin, { style: { color: '#DC2626', weight: 4 } }).eachLayer(function(l) { _ccoeDrawnItems.addLayer(l); });
      } catch(e) { console.warn('[ccoe] échec parse itinéraire GeoJSON:', e.message); }
    }
    if (evt.zones_geojson) {
      try {
        var zones = typeof evt.zones_geojson === 'string' ? JSON.parse(evt.zones_geojson) : evt.zones_geojson;
        L.geoJSON(zones, { style: { color: '#3B82F6', weight: 2, fillOpacity: 0.15 } }).eachLayer(function(l) { _ccoeDrawnItems.addLayer(l); });
      } catch(e) { console.warn('[ccoe] échec parse zones GeoJSON:', e.message); }
    }
    if (_ccoeDrawnItems.getLayers().length) {
      _ccoeDrawMap.fitBounds(_ccoeDrawnItems.getBounds(), { padding: [20, 20] });
    }
  }

  // leaflet-draw integration (graceful if not loaded)
  if (typeof L.Draw !== 'undefined' && !isMobile) {
    var drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polyline: { shapeOptions: { color: '#DC2626', weight: 4 } },
        polygon: { shapeOptions: { color: '#3B82F6', weight: 2, fillOpacity: 0.15 } },
        rectangle: false, circle: false, circlemarker: false, marker: false
      },
      edit: { featureGroup: _ccoeDrawnItems }
    });
    _ccoeDrawMap.addControl(drawControl);
    _ccoeDrawMap.on(L.Draw.Event.CREATED, function(e) {
      _ccoeDrawnItems.addLayer(e.layer);
    });
    // Hide our custom toolbar — leaflet-draw provides its own
    if (toolbar) toolbar.style.display = 'none';
  } else if (!isMobile && window._leafletDrawFailed) {
    // CDN failed — show fallback message
    var notice = document.createElement('div');
    notice.style.cssText = 'font-size:12px;color:#F59E0B;margin-top:4px;';
    notice.textContent = 'Outil de tracé indisponible (bibliothèque non chargée). Utilisez les boutons ci-dessous.';
    el.parentNode.insertBefore(notice, el.nextSibling);
  }

  setTimeout(function() { if (_ccoeDrawMap) _ccoeDrawMap.invalidateSize(); }, 300);
}

function ccoeDrawStart(type) {
  if (!_ccoeDrawMap || !_ccoeDrawnItems) return;
  if (typeof L.Draw === 'undefined') {
    showToast(t('ccoe.trace_indisponible'), 'error');
    return;
  }
  if (_ccoeDrawHandler) { _ccoeDrawHandler.disable(); _ccoeDrawHandler = null; }
  var opts = type === 'polyline'
    ? { shapeOptions: { color: '#DC2626', weight: 4 } }
    : { shapeOptions: { color: '#3B82F6', weight: 2, fillOpacity: 0.15 } };
  _ccoeDrawHandler = type === 'polyline'
    ? new L.Draw.Polyline(_ccoeDrawMap, opts)
    : new L.Draw.Polygon(_ccoeDrawMap, opts);
  _ccoeDrawHandler.enable();
}

function ccoeDrawClear() {
  if (_ccoeDrawnItems) _ccoeDrawnItems.clearLayers();
}

function ccoeCollectGeoJSON() {
  var result = { itineraire: null, zones: null };
  if (!_ccoeDrawnItems) return result;
  var polylines = [], polygons = [];
  _ccoeDrawnItems.eachLayer(function(layer) {
    if (layer instanceof L.Polygon) {
      polygons.push(layer.toGeoJSON().geometry);
    } else if (layer instanceof L.Polyline) {
      polylines.push(layer.toGeoJSON().geometry);
    }
  });
  if (polylines.length === 1) result.itineraire = polylines[0];
  else if (polylines.length > 1) result.itineraire = { type: 'MultiLineString', coordinates: polylines.map(function(p) { return p.coordinates; }) };
  if (polygons.length === 1) result.zones = polygons[0];
  else if (polygons.length > 1) result.zones = { type: 'GeometryCollection', geometries: polygons };
  return result;
}

function ccoeSaveEvt(e, id) {
  e.preventDefault();
  var typeVal = document.getElementById('ccoe-evt-type').value;
  var geo = ccoeCollectGeoJSON();
  var body = {
    titre: document.getElementById('ccoe-evt-titre').value,
    type: typeVal,
    importance: document.getElementById('ccoe-evt-importance').value,
    date_debut: document.getElementById('ccoe-evt-date-debut').value,
    date_fin: document.getElementById('ccoe-evt-date-fin').value || null,
    heure_debut: document.getElementById('ccoe-evt-heure-debut').value || null,
    heure_fin: document.getElementById('ccoe-evt-heure-fin').value || null,
    lieu: document.getElementById('ccoe-evt-lieu').value || null,
    description: document.getElementById('ccoe-evt-desc').value || null,
    itineraire_description: document.getElementById('ccoe-evt-itin-desc').value || null,
    itineraire_geojson: geo.itineraire,
    zones_geojson: geo.zones
  };
  if (typeVal === 'autre') {
    var label = document.getElementById('ccoe-evt-type-label').value;
    if (!label) { showToast(t('ccoe.intitule_requis'), 'error'); return; }
    body.type_label = label;
    var checked = Array.from(document.querySelectorAll('input[name="ccoe-axe"]:checked')).map(function(c) { return c.value; });
    if (!checked.length) { showToast(t('ccoe.axe_requis'), 'error'); return; }
    body._axes = checked;
  }
  var method = id ? 'PUT' : 'POST';
  var url = id ? '/api/ccoe/evenements/' + id : '/api/ccoe/evenements';
  apiFetch(url, { method: method, body: JSON.stringify(body), headers: {'Content-Type':'application/json'} })
    .then(async function(res) {
      if (!res.ok) { var err = await res.json().catch(function() { return {}; }); throw new Error(err.erreur || err.error || 'Erreur serveur (' + res.status + ')'); }
      showToast(id ? t('ccoe.evt_modifie') : t('ccoe.evt_cree'), 'success'); ccoeTab('evenements');
    })
    .catch(function(err) { showToast(t('ccoe.evt_erreur') + ' ' + (err.message || err), 'error'); });
}

function ccoeShowEvtDetail(evtId) {
  var c = document.getElementById('ccoe-content');
  c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  Promise.all([
    safeFetchJSON('/api/ccoe/evenements/' + evtId, null, true),
    safeFetchJSON('/api/ccoe/evenements/' + evtId + '/opord', null, true),
    safeFetchJSON('/api/ccoe/evenements/' + evtId + '/suivi-transmission', null, true).catch(function() { return []; })
  ]).then(function(results) {
    var evt = results[0], opords = results[1], recapChantiers = results[2] || [];
    _ccoeCurrentEvt = evt;
    var dateStr = ccoeFormatDateRange(evt);
    var html = '<div style="margin-bottom:12px;">' +
      '<button class="btn btn-sm btn-outline" onclick="ccoeTab(\'evenements\')" style="margin-right:8px;">← Liste</button>' +
      '<button class="btn btn-sm btn-outline" onclick="ccoeShowEvtForm(_ccoeCurrentEvt)">Modifier</button></div>' +
      '<div class="card" style="padding:16px;margin-bottom:12px;">' +
      '<h3 style="margin:0 0 6px;">' + escHtml(evt.titre) + '</h3>' +
      '<div style="font-size:13px;color:var(--muted);margin-bottom:8px;">' + escHtml(evt.type === 'autre' && evt.type_label ? evt.type_label : evt.type) + ' · ' + dateStr + (evt.lieu ? ' · ' + escHtml(evt.lieu) : '') + '</div>' +
      (evt.description ? '<p style="font-size:13px;">' + escHtml(evt.description) + '</p>' : '') +
      (evt.itineraire_description ? '<p style="font-size:13px;color:#0B6078;"><strong>Itinéraire :</strong> ' + escHtml(evt.itineraire_description) + '</p>' : '') +
      '</div>';

    // OPORD section
    if (!opords.length) {
      // ── Parcours guidé : bouton principal pour générer en un geste ──
      html += '<div class="card" style="padding:20px;text-align:center;border:2px dashed #0B6078;margin-bottom:12px;">' +
        '<div style="font-size:40px;margin-bottom:8px;">📋</div>' +
        '<h4 style="margin:0 0 8px;color:#0B6078;">' + (t('ccoe.generer_ordre') || 'Générer l\'ordre d\'opération et les chantiers') + '</h4>' +
        '<p style="font-size:13px;color:var(--muted);margin-bottom:14px;">L\'OPORD sera créé et les chantiers générés automatiquement depuis le gabarit standard.</p>' +
        '<button class="btn btn-primary" onclick="ccoeGenererComplet(' + evtId + ')" style="font-size:15px;padding:10px 30px;">' + (t('ccoe.generer_ordre') || 'Générer l\'ordre et les chantiers') + '</button>' +
        '<div style="margin-top:10px;"><button class="btn btn-sm btn-outline" onclick="ccoeShowOpordForm(' + evtId + ')">ou créer manuellement</button></div></div>';
    } else {
      var nbTransmis = recapChantiers.filter(function(c) { return !!c.transmis_le; }).length;
      var nbTotal = recapChantiers.length;
      var transmisLabel = nbTotal > 0 ? (nbTransmis === nbTotal ? '✓ Transmis' : 'Transmis ' + nbTransmis + '/' + nbTotal) : '';
      var transmisColor = nbTransmis === nbTotal && nbTotal > 0 ? '#059669' : '#92400E';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
        '<h4 style="margin:0;">Ordres d\'opération (' + opords.length + ')</h4>' +
        (nbTotal > 0 ? '<span style="font-size:12px;padding:2px 10px;border-radius:10px;background:' + (nbTransmis === nbTotal ? '#D1FAE5' : '#FEF3C7') + ';color:' + transmisColor + ';font-weight:600;">' + transmisLabel + '</span>' : '') +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
        '<button class="btn btn-sm btn-primary" style="background:#059669;" onclick="ccoeTransmettre(' + evtId + ')">📡 ' + (t('ccoe.transmettre') || 'Transmettre aux services') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="ccoeRelancer(' + evtId + ')">🔄 ' + (t('ccoe.relancer') || 'Relancer') + '</button>' +
        '</div></div>';
      opords.forEach(function(o) {
        var statutBg = o.statut === 'diffuse' ? '#059669' : o.statut === 'actif' ? '#3B82F6' : '#9CA3AF';
        html += '<div class="card" style="padding:14px;margin-bottom:8px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
          '<div><strong>OPORD #' + o.id + '</strong> <span style="font-size:11px;padding:2px 8px;border-radius:10px;color:#fff;background:' + statutBg + ';">' + escHtml(o.statut) + '</span>' +
          '<div style="font-size:12px;color:var(--muted);margin-top:2px;">' + (o.objectif ? escHtml(o.objectif).substring(0, 100) : '') + '</div></div>' +
          '<div style="display:flex;gap:6px;">' +
          '<button class="btn btn-sm btn-outline" onclick="ccoeLoadOpordChantiers(' + o.id + ',' + evtId + ')">Chantiers (' + (o.nb_chantiers || 0) + ')</button>' +
          '</div></div></div>';
      });

      // Suivi de transmission tableau
      if (recapChantiers.length && recapChantiers.some(function(c) { return c.transmis_le; })) {
        var nbAccuse = recapChantiers.filter(function(c) { return !!c.accuse_le; }).length;
        html += '<div style="margin-top:16px;"><h4 style="margin:0 0 8px;">Suivi de transmission</h4>';
        html += '<div style="font-size:12px;margin-bottom:8px;"><span style="padding:2px 8px;border-radius:8px;background:#D1FAE5;color:#059669;margin-right:6px;">Accusés ' + nbAccuse + '/' + nbTotal + '</span></div>';
        html += '<div style="overflow-x:auto;"><table style="width:100%;font-size:12px;border-collapse:collapse;">' +
          '<tr style="background:#f0f4f8;"><th style="padding:6px;text-align:left;">Axe</th><th style="padding:6px;">Service</th><th style="padding:6px;">Transmis</th><th style="padding:6px;">Vu</th><th style="padding:6px;">Accusé</th><th style="padding:6px;">Statut</th></tr>';
        var now = Date.now();
        recapChantiers.forEach(function(c) {
          var delayMs = 24 * 60 * 60 * 1000;
          var ambre = c.transmis_le && !c.accuse_le;
          var rouge = ambre && (now - new Date(c.transmis_le).getTime() > delayMs);
          var rowBg = rouge ? 'background:#FEE2E2;' : ambre ? 'background:#FEF3C7;' : '';
          html += '<tr style="border-bottom:1px solid #eee;' + rowBg + '">' +
            '<td style="padding:6px;">' + escHtml((c.axe||'').replace(/_/g,' ')) + '</td>' +
            '<td style="padding:6px;font-size:11px;">' + escHtml(c.organisation_nom || '—') + '</td>' +
            '<td style="padding:6px;">' + (c.transmis_le ? new Date(c.transmis_le).toLocaleString('fr-FR') : '—') + '</td>' +
            '<td style="padding:6px;">' + (c.vu_le ? (c.vu_par_prenom || '') + ' ' + new Date(c.vu_le).toLocaleString('fr-FR') : '—') + '</td>' +
            '<td style="padding:6px;font-weight:' + (c.accuse_le ? '600' : 'normal') + ';">' + (c.accuse_le ? (c.accuse_par_prenom || '') + ' ' + new Date(c.accuse_le).toLocaleString('fr-FR') : '—') + '</td>' +
            '<td style="padding:6px;">' + escHtml(c.statut) + '</td></tr>';
        });
        html += '</table></div></div>';
      }
    }
    c.innerHTML = html;
  }).catch(function(err) {
    c.innerHTML = '<div class="alert alert-error">Erreur: ' + escHtml(err.message || err) + '</div>';
  });
}

function ccoeShowOpordForm(evtId) {
  var c = document.getElementById('ccoe-content');
  c.innerHTML = '<div class="card" style="padding:20px;">' +
    '<h4 style="margin:0 0 14px;color:var(--navy);">Nouvel OPORD — Événement #' + evtId + '</h4>' +
    '<form onsubmit="ccoeSaveOpord(event,' + evtId + ')">' +
    '<div class="form-group"><label>Objectif</label><textarea id="ccoe-opord-objectif" rows="2"></textarea></div>' +
    '<div class="form-group"><label>Intention du commandement</label><textarea id="ccoe-opord-intention" rows="2"></textarea></div>' +
    '<div class="form-group"><label>Organisation</label><textarea id="ccoe-opord-org" rows="2"></textarea></div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
    '<button type="button" class="btn btn-outline" onclick="ccoeShowEvtDetail(' + evtId + ')">Annuler</button>' +
    '<button type="submit" class="btn btn-primary">Créer OPORD</button></div></form></div>';
}

function ccoeSaveOpord(e, evtId) {
  e.preventDefault();
  apiFetch('/api/ccoe/evenements/' + evtId + '/opord', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      objectif: document.getElementById('ccoe-opord-objectif').value || null,
      intention_commandement: document.getElementById('ccoe-opord-intention').value || null,
      organisation: document.getElementById('ccoe-opord-org').value || null
    })
  }).then(function() { showToast(t('ccoe.opord_cree'), 'success'); ccoeShowEvtDetail(evtId); })
    .catch(function(err) { showToast('Erreur: ' + (err.message || err), 'error'); });
}

// ── Parcours guidé : génération complète en un geste ──
function ccoeGenererComplet(evtId) {
  var intention = prompt(t('ccoe.intention_prompt') || 'Intention du commandement (optionnel) :');
  safeFetchJSON('/api/ccoe/evenements/' + evtId + '/generer-complet', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ intention: intention || null })
  }, true).then(function(data) {
    showToast((data.chantiers?.length || 0) + ' ' + t('ccoe.chantiers_generes'), 'success');
    ccoeShowEvtDetail(evtId);
  }).catch(function(err) { showToast(err.message || err, 'error'); });
}

// ── Transmission aux services ──
function ccoeTransmettre(evtId) {
  safeFetchJSON('/api/ccoe/evenements/' + evtId + '/recap-transmission', null, true).then(function(chantiers) {
    if (!chantiers.length) { showToast(t('ccoe.aucun_chantier'), 'info'); return; }
    var nonTransmis = chantiers.filter(function(c) { return !c.transmis_le; });
    var dejaTransmis = chantiers.filter(function(c) { return !!c.transmis_le; });

    // Build modal
    var html = '<div id="ccoe-modal-transmit" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;" onclick="if(event.target===this)this.remove()">' +
      '<div class="card" style="padding:20px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;">' +
      '<h4 style="margin:0 0 14px;color:var(--navy);">📡 ' + (t('ccoe.transmettre') || 'Transmettre aux services') + '</h4>';

    // Non-transmitted: checkboxes
    if (nonTransmis.length) {
      html += '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
        '<button class="btn btn-sm btn-outline" onclick="ccoeTransmitCheckAll(true)">' + (t('ccoe.tout_cocher') || 'Tout cocher') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="ccoeTransmitCheckAll(false)">' + (t('ccoe.tout_decocher') || 'Tout décocher') + '</button></div>';
      nonTransmis.forEach(function(c) {
        html += '<label style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid #f0f0f0;cursor:pointer;">' +
          '<input type="checkbox" class="ccoe-transmit-cb" value="' + c.id + '" checked onchange="ccoeTransmitUpdateCount()">' +
          '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:600;font-size:13px;">' + escHtml(c.axe.replace(/_/g,' ')) + '</div>' +
          '<div style="font-size:12px;color:var(--muted);">→ ' + escHtml(c.organisation_nom || '—') +
          (c.date_limite ? ' · ' + new Date(c.date_limite).toLocaleDateString('fr-FR') : '') + '</div></div>' +
          '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#FEF3C7;color:#92400E;">⏳</span></label>';
      });
    }

    // Already transmitted: grayed out
    if (dejaTransmis.length) {
      html += '<div style="margin-top:12px;padding-top:8px;border-top:1px solid #ddd;">' +
        '<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">' + (t('ccoe.deja_transmis') || 'Déjà transmis') + '</div>';
      dejaTransmis.forEach(function(c) {
        html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;opacity:0.5;">' +
          '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:13px;">' + escHtml(c.axe.replace(/_/g,' ')) + ' → ' + escHtml(c.organisation_nom || '—') + '</div>' +
          '<div style="font-size:11px;color:var(--muted);">' + new Date(c.transmis_le).toLocaleString('fr-FR') + '</div></div>' +
          '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#D1FAE5;color:#059669;">✓</span></div>';
      });
      html += '</div>';
    }

    // Buttons
    html += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;">' +
      '<button class="btn btn-outline" onclick="document.getElementById(\'ccoe-modal-transmit\').remove()">' + (t('ccoe.annuler') || 'Annuler') + '</button>' +
      '<button class="btn btn-primary" id="ccoe-transmit-btn" style="background:#059669;" onclick="ccoeTransmitSelection(' + evtId + ')"' + (nonTransmis.length ? '' : ' disabled') + '>' +
      '📡 ' + (t('ccoe.transmettre_selection') || 'Transmettre la sélection') + ' (<span id="ccoe-transmit-count">' + nonTransmis.length + '</span>)</button></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
  }).catch(function(err) { showToast(err.message || err, 'error'); });
}

function ccoeTransmitCheckAll(checked) {
  document.querySelectorAll('.ccoe-transmit-cb').forEach(function(cb) { cb.checked = checked; });
  ccoeTransmitUpdateCount();
}

function ccoeTransmitUpdateCount() {
  var n = document.querySelectorAll('.ccoe-transmit-cb:checked').length;
  var el = document.getElementById('ccoe-transmit-count');
  if (el) el.textContent = n;
  var btn = document.getElementById('ccoe-transmit-btn');
  if (btn) btn.disabled = (n === 0);
}

function ccoeTransmitSelection(evtId) {
  var ids = Array.from(document.querySelectorAll('.ccoe-transmit-cb:checked')).map(function(cb) { return parseInt(cb.value); });
  if (!ids.length) return;
  var modal = document.getElementById('ccoe-modal-transmit');
  if (modal) modal.remove();
  safeFetchJSON('/api/ccoe/evenements/' + evtId + '/transmettre', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ chantier_ids: ids })
  }, true).then(function(data) {
    showToast(data.transmis + ' ' + t('ccoe.chantiers_transmis'), 'success');
    ccoeShowEvtDetail(evtId);
  }).catch(function(err) { showToast(err.message || err, 'error'); });
}

function ccoeRelancer(evtId) {
  // Modal confirmation instead of confirm()
  var html = '<div id="ccoe-modal-relance" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;" onclick="if(event.target===this)this.remove()">' +
    '<div class="card" style="padding:20px;max-width:400px;width:100%;text-align:center;">' +
    '<h4 style="margin:0 0 10px;">🔄 ' + (t('ccoe.relancer') || 'Relancer') + '</h4>' +
    '<p style="font-size:13px;color:var(--muted);margin-bottom:14px;">' + (t('ccoe.confirmer_relance') || 'Relancer les services sur les chantiers non commencés ou en retard ?') + '</p>' +
    '<div style="display:flex;gap:8px;justify-content:center;">' +
    '<button class="btn btn-outline" onclick="document.getElementById(\'ccoe-modal-relance\').remove()">' + (t('ccoe.annuler') || 'Annuler') + '</button>' +
    '<button class="btn btn-primary" onclick="ccoeDoRelancer(' + evtId + ')">Confirmer</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function ccoeDoRelancer(evtId) {
  var modal = document.getElementById('ccoe-modal-relance');
  if (modal) modal.remove();
  safeFetchJSON('/api/ccoe/evenements/' + evtId + '/relancer', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}'
  }, true).then(function(data) {
    showToast(data.relances + ' ' + t('ccoe.relances_envoyees'), 'success');
  }).catch(function(err) { showToast(err.message || err, 'error'); });
}

function ccoeTransmettreChantier(chantierId, evtId) {
  safeFetchJSON('/api/ccoe/chantiers/' + chantierId + '/transmettre', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}'
  }, true).then(function() {
    showToast(t('ccoe.chantier_transmis'), 'success');
    if (evtId) ccoeShowEvtDetail(evtId);
    else ccoeShowChantierDetail(chantierId);
  }).catch(function(err) { showToast(err.message || err, 'error'); });
}

function ccoeLoadOpordChantiers(opordId, evtId) {
  ccoeLoadChantiers(document.getElementById('ccoe-content'), opordId, evtId);
}

// ── Chantiers ──
function ccoeLoadChantiers(container, opordId, evtId) {
  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  var url = '/api/ccoe/chantiers' + (opordId ? '?opord_id=' + opordId : '');
  safeFetchJSON(url, null, true).then(function(data) {
    var html = '';
    if (evtId) {
      html += '<button class="btn btn-sm btn-outline" onclick="ccoeShowEvtDetail(' + evtId + ')" style="margin-bottom:10px;">← Retour OPORD</button>';
    }
    if (!data || !data.length) {
      html += '<div class="card" style="padding:20px;text-align:center;color:var(--muted);">Aucun chantier</div>';
      container.innerHTML = html;
      return;
    }
    html += '<div style="font-weight:600;font-size:15px;margin-bottom:10px;">' + data.length + ' chantier(s)</div>';
    var statutColors = { non_commence:'#9CA3AF', en_preparation:'#3B82F6', en_cours:'#F59E0B', termine:'#10B981', valide:'#059669', bloque:'#DC2626' };
    data.forEach(function(ch) {
      var pct = ch.nb_checklist > 0 ? Math.round((ch.nb_fait / ch.nb_checklist) * 100) : 0;
      var enRetard = ch.date_limite && new Date(ch.date_limite) < new Date() && !['termine','valide'].includes(ch.statut);
      html += '<div class="card" style="padding:14px;margin-bottom:8px;cursor:pointer;' + (enRetard ? 'border-left:3px solid #DC2626;' : '') + '" onclick="ccoeShowChantierDetail(' + ch.id + ')">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<div><strong>' + escHtml(ch.titre) + '</strong>' +
        '<div style="font-size:12px;color:var(--muted);margin-top:2px;">' + escHtml(ch.axe) + ' · ' + escHtml(ch.organisation_nom || '—') + (ch.responsable_prenom ? ' · ' + escHtml(ch.responsable_prenom) : '') + '</div></div>' +
        '<div style="display:flex;gap:6px;align-items:center;">' +
        '<span style="font-size:11px;padding:2px 8px;border-radius:10px;color:#fff;background:' + (statutColors[ch.statut] || '#6B7280') + ';">' + escHtml(ch.statut) + '</span>' +
        (ch.transmis_le ? '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#D1FAE5;color:#059669;">✓</span>' : '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#FEF3C7;color:#92400E;">⏳</span>') +
        '<span style="font-size:12px;font-weight:600;color:' + (pct === 100 ? '#059669' : 'var(--muted)') + ';">' + pct + '%</span>' +
        (enRetard ? '<span style="font-size:10px;color:#DC2626;font-weight:600;">EN RETARD</span>' : '') +
        '</div></div>' +
        '<div style="margin-top:6px;background:#E5E7EB;border-radius:4px;height:4px;"><div style="width:' + pct + '%;height:100%;border-radius:4px;background:' + (statutColors[ch.statut] || '#6B7280') + ';"></div></div>' +
        '</div>';
    });
    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="alert alert-error">Erreur: ' + escHtml(err.message || err) + '</div>';
  });
}

function ccoeShowChantierDetail(chantierId) {
  var c = document.getElementById('ccoe-content');
  c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  safeFetchJSON('/api/ccoe/chantiers/' + chantierId, null, true).then(function(ch) {
    var statutColors = { non_commence:'#9CA3AF', en_preparation:'#3B82F6', en_cours:'#F59E0B', termine:'#10B981', valide:'#059669', bloque:'#DC2626' };
    var html = '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;"><button class="btn btn-sm btn-outline" onclick="ccoeTab(\'chantiers\')">← Liste</button>' +
      '<button class="btn btn-sm btn-outline" onclick="ccoeShowContact(' + ch.id + ')">📞 Contact</button>' +
      (!ch.transmis_le ? '<button class="btn btn-sm btn-primary" style="background:#059669;" onclick="ccoeTransmettreChantier(' + ch.id + ')">📡 Transmettre</button>' : '<span style="font-size:11px;padding:3px 8px;border-radius:8px;background:#D1FAE5;color:#059669;">✓ Transmis</span>') +
      '</div>' +
      '<div class="card" style="padding:16px;margin-bottom:12px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
      '<h3 style="margin:0;">' + escHtml(ch.titre) + '</h3>' +
      '<span style="font-size:12px;padding:3px 10px;border-radius:10px;color:#fff;background:' + (statutColors[ch.statut] || '#6B7280') + ';">' + escHtml(ch.statut) + '</span></div>' +
      '<div style="font-size:13px;color:var(--muted);margin-top:4px;">Axe: ' + escHtml(ch.axe) + ' · Org: ' + escHtml(ch.organisation_nom || '—') + '</div>' +
      (ch.description ? '<p style="font-size:13px;margin-top:8px;">' + escHtml(ch.description) + '</p>' : '') +
      '</div>';

    // Transition buttons
    var transitions = {
      non_commence: [{s:'en_preparation', l:'Démarrer prépa'},{s:'bloque', l:'Bloquer'}],
      en_preparation: [{s:'en_cours', l:'Lancer'},{s:'bloque', l:'Bloquer'}],
      en_cours: [{s:'termine', l:'Terminer'},{s:'bloque', l:'Bloquer'}],
      bloque: [{s:'en_preparation', l:'Reprendre'}],
      termine: [{s:'valide', l:'✓ Valider (Cabinet)'}]
    };
    var actions = transitions[ch.statut] || [];
    if (actions.length) {
      html += '<div style="display:flex;gap:6px;margin-bottom:12px;">';
      actions.forEach(function(a) {
        var cls = a.s === 'bloque' ? 'btn-outline' : a.s === 'valide' ? 'btn-primary' : 'btn-primary';
        html += '<button class="btn btn-sm ' + cls + '" onclick="ccoeTransitionChantier(' + ch.id + ',\'' + a.s + '\')">' + a.l + '</button>';
      });
      html += '</div>';
    }

    // Checklist
    html += '<h4 style="margin:0 0 8px;">Checklist (' + ch.checklist.length + ')</h4>';
    ch.checklist.forEach(function(item) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;">' +
        '<input type="checkbox" ' + (item.coche ? 'checked' : '') + ' onchange="ccoeToggleChecklist(' + item.id + ',this.checked,' + ch.id + ')">' +
        '<span style="flex:1;font-size:13px;' + (item.coche ? 'text-decoration:line-through;color:var(--muted);' : '') + '">' + escHtml(item.libelle) + '</span>' +
        (item.agent_prenom ? '<span style="font-size:11px;color:var(--muted);">' + escHtml(item.agent_prenom) + '</span>' : '') +
        (item.photo_path ? '<img src="' + escHtml(item.photo_path) + '" style="width:24px;height:24px;border-radius:4px;object-fit:cover;">' : '') +
        '</div>';
    });

    // Commentaires
    html += '<h4 style="margin:16px 0 8px;">Commentaires (' + ch.commentaires.length + ')</h4>';
    ch.commentaires.forEach(function(cm) {
      html += '<div style="padding:8px;background:#f9f9f9;border-radius:6px;margin-bottom:6px;">' +
        '<div style="font-size:12px;color:var(--muted);">' + escHtml(cm.auteur_prenom || '?') + ' · ' + new Date(cm.le).toLocaleString('fr-FR') + '</div>' +
        (cm.type_message ? '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#E0E7FF;color:#3B5BDB;margin-right:4px;">' + escHtml(cm.type_message.replace(/_/g,' ')) + '</span>' : '') +
        '<div style="font-size:13px;">' + escHtml(cm.message) + '</div>' +
        (cm.photo_path ? '<img src="' + escHtml(cm.photo_path) + '" style="max-width:120px;margin-top:4px;border-radius:4px;">' : '') +
        '</div>';
    });
    html += '<form onsubmit="ccoeAddComment(event,' + ch.id + ')" style="display:flex;gap:6px;margin-top:8px;">' +
      '<input type="text" id="ccoe-comment-msg" placeholder="Ajouter un commentaire…" style="flex:1;" required>' +
      '<button type="submit" class="btn btn-sm btn-primary">Envoyer</button></form>';

    // Validations
    if (ch.validations.length) {
      html += '<h4 style="margin:16px 0 8px;">Validations</h4>';
      ch.validations.forEach(function(v) {
        var vColor = v.decision === 'valide' ? '#059669' : v.decision === 'refuse' ? '#DC2626' : '#F59E0B';
        html += '<div style="padding:6px;font-size:13px;"><span style="color:' + vColor + ';font-weight:600;">' + escHtml(v.decision) + '</span> par ' + escHtml(v.auteur_prenom || '?') + ' · ' + new Date(v.le).toLocaleString('fr-FR') + (v.motif ? ' — ' + escHtml(v.motif) : '') + '</div>';
      });
    }

    c.innerHTML = html;
  }).catch(function(err) {
    c.innerHTML = '<div class="alert alert-error">Erreur: ' + escHtml(err.message || err) + '</div>';
  });
}

function ccoeTransitionChantier(id, statut) {
  apiFetch('/api/ccoe/chantiers/' + id + '/statut', {
    method: 'PUT', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ statut: statut })
  }).then(function() { showToast(t('ccoe.statut_maj') + ' → ' + statut, 'success'); ccoeShowChantierDetail(id); })
    .catch(function(err) { showToast('Erreur: ' + (err.message || err), 'error'); });
}

function ccoeToggleChecklist(itemId, checked, chantierId) {
  apiFetch('/api/ccoe/checklist/' + itemId + '/cocher', {
    method: 'PUT', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ coche: checked })
  }).then(function() { ccoeShowChantierDetail(chantierId); })
    .catch(function(err) { showToast('Erreur: ' + (err.message || err), 'error'); });
}

function ccoeAddComment(e, chantierId) {
  e.preventDefault();
  var msg = document.getElementById('ccoe-comment-msg').value;
  apiFetch('/api/ccoe/chantiers/' + chantierId + '/commentaires', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ message: msg })
  }).then(function() { ccoeShowChantierDetail(chantierId); })
    .catch(function(err) { showToast('Erreur: ' + (err.message || err), 'error'); });
}

// ── Carte ──
function ccoeLoadCarte(container) {
  container.innerHTML = '<div id="ccoe-map-container" style="height:500px;border-radius:8px;overflow:hidden;"></div>';
  safeFetchJSON('/api/ccoe/carte', null, true).then(function(data) {
    var points = data.chantiers || data; // backward compat
    var evenements = data.evenements || [];
    if (_ccoeMap) { _ccoeMap.remove(); _ccoeMap = null; }
    _ccoeMap = L.map('ccoe-map-container').setView([36.753, 3.058], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OSM' }).addTo(_ccoeMap);
    var statutColors = { non_commence:'#9CA3AF', en_preparation:'#3B82F6', en_cours:'#F59E0B', termine:'#10B981', valide:'#059669', bloque:'#DC2626' };
    // Chantier markers
    points.forEach(function(p) {
      var color = statutColors[p.statut] || '#6B7280';
      L.circleMarker([p.lat, p.lng], { radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9 })
        .addTo(_ccoeMap)
        .bindPopup('<strong>' + escHtml(p.titre) + '</strong><br>' + escHtml(p.axe) + ' · ' + escHtml(p.statut) + '<br>' + escHtml(p.organisation_nom || ''));
    });
    // Event itineraires + zones
    evenements.forEach(function(evt) {
      if (evt.itineraire_geojson) {
        try { L.geoJSON(evt.itineraire_geojson, { style: { color: '#DC2626', weight: 4, opacity: 0.8 } }).addTo(_ccoeMap).bindPopup('Itinéraire — ' + escHtml(evt.titre)); } catch(e) { console.warn('[ccoe] échec affichage itinéraire carte:', e.message); }
      }
      if (evt.zones_geojson) {
        try { L.geoJSON(evt.zones_geojson, { style: { color: '#3B82F6', weight: 2, fillOpacity: 0.15 } }).addTo(_ccoeMap).bindPopup('Zone — ' + escHtml(evt.titre)); } catch(e) { console.warn('[ccoe] échec affichage zone carte:', e.message); }
      }
    });
    var allPts = points.filter(function(p) { return p.lat && p.lng; });
    if (allPts.length) {
      var bounds = L.latLngBounds(allPts.map(function(p) { return [p.lat, p.lng]; }));
      _ccoeMap.fitBounds(bounds, { padding: [30, 30] });
    }
    setTimeout(function() { _ccoeMap.invalidateSize(); }, 200);
  }).catch(function(err) {
    container.innerHTML = '<div class="alert alert-error">Erreur carte: ' + escHtml(err.message || err) + '</div>';
  });
}

// ── Dashboard ──
function ccoeLoadDashboard(container) {
  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  safeFetchJSON('/api/ccoe/dashboard', null, true).then(function(data) {
    var s = data.stats;
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;">';
    var cards = [
      { label: 'Total', val: s.total, color: '#063B5A' },
      { label: 'Non démarrés', val: s.non_commence, color: '#9CA3AF' },
      { label: 'En préparation', val: s.en_preparation, color: '#3B82F6' },
      { label: 'En cours', val: s.en_cours, color: '#F59E0B' },
      { label: 'Terminés', val: s.termine, color: '#10B981' },
      { label: 'Validés', val: s.valide, color: '#059669' },
      { label: 'Bloqués', val: s.bloque, color: '#DC2626' },
      { label: 'En retard', val: s.en_retard, color: '#DC2626' }
    ];
    cards.forEach(function(c) {
      html += '<div class="card" style="padding:12px;text-align:center;border-top:3px solid ' + c.color + ';">' +
        '<div style="font-size:24px;font-weight:700;color:' + c.color + ';">' + c.val + '</div>' +
        '<div style="font-size:12px;color:var(--muted);">' + c.label + '</div></div>';
    });
    html += '</div>';

    // Par axe
    if (data.parAxe.length) {
      html += '<h4 style="margin:0 0 8px;">Avancement par axe</h4>';
      data.parAxe.forEach(function(a) {
        var pct = a.total > 0 ? Math.round((a.fait / a.total) * 100) : 0;
        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
          '<span style="width:120px;font-size:13px;">' + escHtml(a.axe) + '</span>' +
          '<div style="flex:1;background:#E5E7EB;border-radius:4px;height:8px;"><div style="width:' + pct + '%;height:100%;border-radius:4px;background:#059669;"></div></div>' +
          '<span style="font-size:12px;font-weight:600;width:40px;text-align:right;">' + pct + '%</span></div>';
      });
    }

    // Prochains événements
    if (data.prochains.length) {
      html += '<h4 style="margin:16px 0 8px;">Prochains événements</h4>';
      data.prochains.forEach(function(e) {
        html += '<div style="padding:6px 0;font-size:13px;border-bottom:1px solid #f0f0f0;">' +
          '<strong>' + escHtml(e.titre) + '</strong> · ' + ccoeFormatDateRange(e) +
          ' <span style="font-size:11px;padding:1px 6px;border-radius:8px;background:#E5E7EB;">' + escHtml(e.importance) + '</span></div>';
      });
    }

    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="alert alert-error">Erreur: ' + escHtml(err.message || err) + '</div>';
  });
}

// ── Annuaire CCOE ──
function ccoeLoadAnnuaire(container) {
  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement…</div>';
  safeFetchJSON('/api/ccoe/annuaire', null, true).then(function(data) {
    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<span style="font-weight:600;font-size:15px;">' + (t('ccoe.annuaire_titre') || 'Annuaire CCOE') + ' (' + data.length + ')</span>' +
      '<button class="btn btn-sm btn-primary" onclick="ccoeAnnuaireForm()">+ Ajouter</button></div>';
    if (!data.length) {
      html += '<div class="card" style="padding:16px;text-align:center;color:var(--muted);">Aucun contact</div>';
    } else {
      html += '<div style="overflow-x:auto;"><table style="width:100%;font-size:13px;border-collapse:collapse;">' +
        '<tr style="background:#f0f4f8;"><th style="padding:8px;text-align:left;">Nom</th><th style="padding:8px;">Axe</th><th style="padding:8px;">Fonction</th><th style="padding:8px;">Tél</th><th style="padding:8px;">Email</th><th style="padding:8px;">Organisation</th><th style="padding:8px;">Actions</th></tr>';
      data.forEach(function(c) {
        html += '<tr style="border-bottom:1px solid #eee;">' +
          '<td style="padding:8px;">' + escHtml(c.prenom || '') + ' ' + escHtml(c.nom) + '</td>' +
          '<td style="padding:8px;text-align:center;">' + escHtml(c.axe || '—') + '</td>' +
          '<td style="padding:8px;">' + escHtml(c.fonction_label || '—') + '</td>' +
          '<td style="padding:8px;">' + escHtml(c.telephone || '—') + '</td>' +
          '<td style="padding:8px;font-size:11px;">' + escHtml(c.email || '—') + '</td>' +
          '<td style="padding:8px;font-size:11px;">' + escHtml(c.organisation_nom || '—') + '</td>' +
          '<td style="padding:8px;"><button class="btn btn-sm btn-outline" onclick="ccoeAnnuaireForm(' + c.id + ')">✏</button> ' +
          '<button class="btn btn-sm btn-outline" style="color:#DC2626;" onclick="ccoeAnnuaireDel(' + c.id + ')">✕</button></td></tr>';
      });
      html += '</table></div>';
    }
    container.innerHTML = html;
  }).catch(function(err) {
    container.innerHTML = '<div class="alert alert-error">' + escHtml(err.message || err) + '</div>';
  });
}

function ccoeAnnuaireForm(id) {
  var c = document.getElementById('ccoe-content');
  var allAxes = ['securite','protocole','voirie','proprete','eclairage','espaces_verts','mobilite','stationnement','sante','communication','logistique'];
  if (id) {
    safeFetchJSON('/api/ccoe/annuaire/' + id, null, true).then(function(ct) { renderAnnuaireForm(c, ct); });
  } else {
    renderAnnuaireForm(c, null);
  }
  function renderAnnuaireForm(c, ct) {
    var isE = ct && ct.id;
    var axeOpts = '<option value="">—</option>' + allAxes.map(function(a) { return '<option value="' + a + '"' + (isE && ct.axe === a ? ' selected' : '') + '>' + a.replace(/_/g,' ') + '</option>'; }).join('');
    c.innerHTML = '<div class="card" style="padding:20px;"><h4 style="margin:0 0 14px;">' + (isE ? 'Modifier contact' : 'Nouveau contact') + '</h4>' +
      '<form onsubmit="ccoeAnnuaireSave(event,' + (isE ? ct.id : 'null') + ')">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
      '<div class="form-group"><label>Nom *</label><input type="text" id="ann-nom" required value="' + (isE ? escHtml(ct.nom) : '') + '"></div>' +
      '<div class="form-group"><label>Prénom</label><input type="text" id="ann-prenom" value="' + (isE ? escHtml(ct.prenom||'') : '') + '"></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
      '<div class="form-group"><label>Téléphone</label><input type="text" id="ann-tel" value="' + (isE ? escHtml(ct.telephone||'') : '') + '"></div>' +
      '<div class="form-group"><label>Email</label><input type="email" id="ann-email" value="' + (isE ? escHtml(ct.email||'') : '') + '"></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
      '<div class="form-group"><label>Axe</label><select id="ann-axe">' + axeOpts + '</select></div>' +
      '<div class="form-group"><label>Fonction</label><input type="text" id="ann-fonction" value="' + (isE ? escHtml(ct.fonction_label||'') : '') + '"></div></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;"><button type="button" class="btn btn-outline" onclick="ccoeTab(\'annuaire\')">Annuler</button>' +
      '<button type="submit" class="btn btn-primary">Enregistrer</button></div></form></div>';
  }
}

function ccoeAnnuaireSave(e, id) {
  e.preventDefault();
  var body = { nom: document.getElementById('ann-nom').value, prenom: document.getElementById('ann-prenom').value || null,
    telephone: document.getElementById('ann-tel').value || null, email: document.getElementById('ann-email').value || null,
    axe: document.getElementById('ann-axe').value || null, fonction_label: document.getElementById('ann-fonction').value || null };
  var method = id ? 'PUT' : 'POST';
  var url = id ? '/api/ccoe/annuaire/' + id : '/api/ccoe/annuaire';
  apiFetch(url, { method: method, body: JSON.stringify(body), headers: {'Content-Type':'application/json'} })
    .then(function() { showToast(id ? t('ccoe.contact_modifie') : t('ccoe.contact_ajoute'), 'success'); ccoeTab('annuaire'); })
    .catch(function(err) { showToast(err.message || err, 'error'); });
}

function ccoeAnnuaireDel(id) {
  if (!confirm('Supprimer ce contact ?')) return;
  apiFetch('/api/ccoe/annuaire/' + id, { method: 'DELETE' })
    .then(function() { showToast(t('ccoe.contact_supprime'), 'success'); ccoeTab('annuaire'); })
    .catch(function(err) { showToast(err.message || err, 'error'); });
}

// ── Contact + Message par chantier ──
function ccoeShowContact(chantierId) {
  safeFetchJSON('/api/ccoe/chantiers/' + chantierId + '/contact', null, true).then(function(ct) {
    if (ct.erreur) { showToast(ct.erreur, 'error'); return; }
    var html = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this)this.remove()">' +
      '<div class="card" style="padding:20px;max-width:420px;width:90%;">' +
      '<h4 style="margin:0 0 12px;">Contact responsable</h4>' +
      '<div style="font-size:14px;margin-bottom:4px;"><strong>' + escHtml((ct.prenom||'') + ' ' + ct.nom) + '</strong></div>' +
      (ct.fonction_label ? '<div style="font-size:13px;color:var(--muted);margin-bottom:4px;">' + escHtml(ct.fonction_label) + '</div>' : '') +
      (ct.telephone ? '<div style="font-size:13px;">📞 ' + escHtml(ct.telephone) + '</div>' : '') +
      (ct.email ? '<div style="font-size:13px;">📧 ' + escHtml(ct.email) + '</div>' : '') +
      '<hr style="margin:12px 0;">' +
      '<h5 style="margin:0 0 8px;">Envoyer un message</h5>' +
      '<select id="ccoe-msg-type" style="width:100%;margin-bottom:8px;">' +
      '<option value="demande_precision">Demande de précision</option>' +
      '<option value="relance">Relance</option>' +
      '<option value="point_situation">Point de situation</option>' +
      '<option value="demande_rapport">Demande de rapport</option></select>' +
      '<textarea id="ccoe-msg-body" rows="3" style="width:100%;margin-bottom:8px;" placeholder="Votre message…"></textarea>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
      '<button class="btn btn-sm btn-outline" onclick="this.closest(\'div[style*=fixed]\').remove()">Fermer</button>' +
      '<button class="btn btn-sm btn-primary" onclick="ccoeSendMessage(' + chantierId + ')">Envoyer</button>' +
      '</div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }).catch(function(err) { showToast(err.message || err, 'error'); });
}

function ccoeSendMessage(chantierId) {
  var type_message = document.getElementById('ccoe-msg-type').value;
  var message = document.getElementById('ccoe-msg-body').value;
  if (!message) { showToast(t('ccoe.message_requis'), 'error'); return; }
  apiFetch('/api/ccoe/chantiers/' + chantierId + '/message', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ type_message: type_message, message: message })
  }).then(function() {
    showToast(t('ccoe.message_envoye'), 'success');
    var modal = document.querySelector('div[style*="fixed"][style*="z-index:9999"]');
    if (modal) modal.remove();
    // Refresh detail if visible
    if (document.getElementById('view-ccoe').classList.contains('active')) ccoeShowChantierDetail(chantierId);
    else if (document.getElementById('view-mes-chantiers-ccoe').classList.contains('active')) mccShowDetail(chantierId);
  }).catch(function(err) { showToast(err.message || err, 'error'); });
}

// ─── EXECUTIVE WORKBENCH ──────────────────────────────────────
var execMap = null;
var execMapMarkers = [];
// ═══ COCKPIT EXÉCUTIF (Vague 5A) ═══

async function cockpitLoad() {
  var periodeEl = document.getElementById('cockpit-periode');
  var fromEl = document.getElementById('cockpit-from');
  var toEl = document.getElementById('cockpit-to');
  var periode = periodeEl ? periodeEl.value : '30j';

  // Toggle date inputs pour période personnalisée
  if (fromEl) fromEl.classList.toggle('hidden', periode !== 'custom');
  if (toEl) toEl.classList.toggle('hidden', periode !== 'custom');
  if (periode === 'custom' && (!fromEl.value || !toEl.value)) return;

  // Masquer le sélecteur de commune dans la carte pour superviseur communal
  var carteComSel = document.getElementById('carte-op-commune');
  if (carteComSel) carteComSel.style.display = hasNiveau('commune') ? 'none' : '';

  // Construire l'URL
  var url = '/api/supervision/cockpit?periode=' + encodeURIComponent(periode);
  if (periode === 'custom') url += '&from=' + fromEl.value + '&to=' + toEl.value;
  url += cockpitGetFilterParams();

  try {
    var res = await apiFetch(url, { headers: authHeaders() });
    if (!res.ok) { var e = await res.json(); showToast(e.erreur || 'Erreur cockpit', 'error'); return; }
    var data = await res.json();
    cockpitRender(data);
    // Charger alertes, carte, performance organisations et CAP
    alertesLoad();
    carteOpLoad();
    orgPerfLoad();
    capPerfLoad();
  } catch(e) { showToast(e.message, 'error'); }
}

function cockpitRender(data) {
  var k = data.kpis;
  var periodeLabels = {today:"Aujourd'hui",'7j':'7 derniers jours','30j':'30 derniers jours',annee:'Depuis début d\'année',custom:'Personnalisée'};

  // Périmètre
  var perimEl = document.getElementById('cockpit-perimetre');
  if (perimEl) {
    if (hasNiveau('commune') && currentUser && currentUser.commune_id) {
      var cc = communes.find(function(x) { return x.id === currentUser.commune_id; });
      var ccName = cc ? cc.nom : '';
      perimEl.textContent = currentLang === 'ar'
        ? 'النطاق : بلدية ' + ccName
        : 'Périmètre : Commune de ' + ccName;
    } else {
      perimEl.textContent = data.perimetre === 'commune' ? t('sup.perimetre_commune') : t('sup.perimetre_wilaya');
    }
  }

  // ── KPI Cards ──
  var evolution = k.recus_precedent > 0 ? Math.round(((k.recus - k.recus_precedent) / k.recus_precedent) * 100) : 0;
  var evolSign = evolution > 0 ? '+' : '';
  var evolColor = evolution > 0 ? '#EF4444' : evolution < 0 ? '#16a34a' : 'var(--muted)';

  var kpisHtml =
    cockpitKpiCard(t('sup.dossiers_recus'), k.recus, '#2563eb', evolSign + evolution + '%', evolColor) +
    cockpitKpiCard(t('sup.en_cours'), k.en_cours, '#f97316', null, null) +
    cockpitKpiCard(t('sup.en_retard'), k.en_retard, k.en_retard > 0 ? '#EF4444' : '#16a34a', null, null) +
    cockpitKpiCard(t('sup.a_valider'), k.a_valider, '#eab308', null, null) +
    cockpitKpiCard(t('sup.temps_moyen'), k.temps_moyen_h ? k.temps_moyen_h + 'h' : '—', '#8b5cf6', null, null);

  document.getElementById('cockpit-kpis').innerHTML = kpisHtml;

  // Masquer 'Par commune' si superviseur communal (une seule commune)
  var repartEl = document.getElementById('cockpit-repartitions');
  if (repartEl) {
    var communeCard = repartEl.children[0];
    if (communeCard) communeCard.style.display = hasNiveau('commune') ? 'none' : '';
    repartEl.style.gridTemplateColumns = hasNiveau('commune') ? '1fr 1fr' : '1fr 1fr 1fr';
  }

  // ── Répartitions ──
  // Communes
  var cHtml = data.repartitions.communes.length
    ? data.repartitions.communes.map(function(c) {
        var isActive = _cockpitFilter.type === 'commune' && _cockpitFilter.id === c.id;
        return '<div data-filter-type="commune" data-filter-id="' + c.id + '" data-filter-label="' + escHtml(c.nom) + '" onclick="cockpitDrill(\'commune\',' + c.id + ',\'' + escHtml(c.nom) + '\')" style="display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--line);cursor:pointer;border-radius:6px;transition:background 0.15s;' + (isActive ? 'background:var(--blue-light);border-left:3px solid var(--blue);' : '') + '" onmouseover="if(!this.dataset.active)this.style.background=\'var(--gray-50)\'" onmouseout="if(!this.dataset.active)this.style.background=\'' + (isActive ? 'var(--blue-light)' : 'transparent') + '\'">' +
          '<span style="font-weight:600;color:var(--navy);">' + escHtml(c.nom) + '</span>' +
          '<span style="color:var(--muted);font-weight:700;">' + c.total + '</span></div>';
      }).join('')
    : '<div style="color:var(--muted);padding:12px;">Aucune donnée</div>';
  document.getElementById('cockpit-communes').innerHTML = cHtml;

  // Organisations
  var oHtml = data.repartitions.organisations.length
    ? data.repartitions.organisations.map(function(o) {
        var isActive = _cockpitFilter.type === 'organisation' && _cockpitFilter.id === o.id;
        return '<div data-filter-type="organisation" data-filter-id="' + o.id + '" data-filter-label="' + escHtml(o.nom) + '" onclick="cockpitDrill(\'organisation\',' + o.id + ',\'' + escHtml(o.nom) + '\')" style="display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--line);cursor:pointer;border-radius:6px;transition:background 0.15s;' + (isActive ? 'background:var(--blue-light);border-left:3px solid var(--blue);' : '') + '" onmouseover="if(!this.dataset.active)this.style.background=\'var(--gray-50)\'" onmouseout="if(!this.dataset.active)this.style.background=\'' + (isActive ? 'var(--blue-light)' : 'transparent') + '\'">' +
          '<span style="font-weight:600;color:var(--navy);">' + escHtml(o.nom) + '</span>' +
          '<span style="color:var(--muted);font-weight:700;">' + o.total + '</span></div>';
      }).join('')
    : '<div style="color:var(--muted);padding:12px;">Aucune donnée</div>';
  document.getElementById('cockpit-organisations').innerHTML = oHtml;

  // Domaines
  var domaineLabels = currentLang==='ar' ? {eau:'المياه',proprete:'النظافة',general:'عام',voirie:'الطرقات',eclairage:'الإنارة',espaces_verts:'مساحات خضراء',stationnement:'التوقف'} : {eau:'Eau',proprete:'Propreté',general:'Général',voirie:'Voirie',eclairage:'Éclairage',espaces_verts:'Espaces verts',stationnement:'Stationnement'};
  var dHtml = data.repartitions.domaines.length
    ? data.repartitions.domaines.map(function(d) {
        var label = domaineLabels[d.domaine] || d.domaine;
        var isActive = _cockpitFilter.type === 'domaine' && _cockpitFilter.label === d.domaine;
        return '<div data-filter-type="domaine" data-filter-id="null" data-filter-label="' + escHtml(d.domaine) + '" onclick="cockpitDrill(\'domaine\',null,\'' + escHtml(d.domaine) + '\')" style="display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--line);cursor:pointer;border-radius:6px;transition:background 0.15s;' + (isActive ? 'background:var(--blue-light);border-left:3px solid var(--blue);' : '') + '" onmouseover="if(!this.dataset.active)this.style.background=\'var(--gray-50)\'" onmouseout="if(!this.dataset.active)this.style.background=\'' + (isActive ? 'var(--blue-light)' : 'transparent') + '\'">' +
          '<span style="font-weight:600;color:var(--navy);">' + escHtml(label) + '</span>' +
          '<span style="color:var(--muted);font-weight:700;">' + d.total + '</span></div>';
      }).join('')
    : '<div style="color:var(--muted);padding:12px;">Aucune donnée</div>';
  document.getElementById('cockpit-domaines').innerHTML = dHtml;
}

function cockpitKpiCard(label, value, color, badge, badgeColor) {
  return '<div style="background:white;border:1px solid var(--line);border-radius:14px;padding:18px 16px;border-top:3px solid ' + color + ';">' +
    '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">' + label + '</div>' +
    '<div style="font-size:28px;font-weight:800;color:var(--navy);">' + value +
    (badge ? '<span style="font-size:12px;font-weight:600;color:' + badgeColor + ';margin-left:8px;">' + badge + '</span>' : '') +
    '</div></div>';
}

// ═══ FILTRAGE COCKPIT ═══
var _cockpitFilter = { type: null, id: null, label: null };

function cockpitDrill(type, id, label) {
  // Toggle : si même filtre, on le retire
  if (_cockpitFilter.type === type && _cockpitFilter.id === id && _cockpitFilter.label === label) {
    _cockpitFilter = { type: null, id: null, label: null };
    showToast(t('sup.filtre_retire'), 'info');
  } else {
    _cockpitFilter = { type: type, id: id, label: label };
    showToast(t('sup.filtre_applique') + ' : ' + label, 'info');
  }
  // Recharger le cockpit avec le filtre
  cockpitLoad();
}

function cockpitGetFilterParams() {
  var f = _cockpitFilter;
  if (!f.type) return '';
  if (f.type === 'commune') return '&commune_id=' + f.id;
  if (f.type === 'organisation') return '&organisation_id=' + f.id;
  if (f.type === 'domaine') return '&domaine=' + encodeURIComponent(f.label);
  return '';
}

// ═══ DRAWER SUPERVISEUR ═══
var _supCurrentId = null;

async function supOpenDrawer(id) {
  _supCurrentId = id;
  var content = document.getElementById('sup-drawer-content');
  var actions = document.getElementById('sup-drawer-actions');
  var titleEl = document.getElementById('sup-drawer-title');
  if (!content || !actions) return;

  content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + (currentLang === 'ar' ? 'جاري التحميل...' : 'Chargement...') + '</div>';
  actions.innerHTML = '';
  titleEl.textContent = currentLang === 'ar' ? 'ملف الإشارة' : 'Fiche dossier';
  document.getElementById('sup-drawer').classList.remove('hidden');

  // Charger le dossier depuis l'API
  try {
    var res = await apiFetch('/api/signaler/board/' + id, { headers: authHeaders() });
    if (!res.ok) { var e = await res.json(); showToast(e.erreur || 'Erreur', 'error'); supCloseDrawer(); return; }
    var s = await res.json();
    // Si l'API retourne un tableau, prendre le premier
    if (Array.isArray(s)) s = s.find(function(x) { return x.id === id; }) || s[0];
    if (!s) { showToast(t('sup.dossier_introuvable'), 'error'); supCloseDrawer(); return; }

    titleEl.textContent = s.reference || (currentLang === 'ar' ? 'ملف الإشارة' : 'Fiche signalement');
    var isAr = currentLang === 'ar';
    var ficheHtml = '';

    // ── BLOC 1 — Le signalement ──
    ficheHtml += '<div style="margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line);">';
    ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + (isAr ? 'الإشارة' : t('bo.drawer_signalement')) + '</div>';
    if (s.photo_path) ficheHtml += '<img src="/'+escHtml(s.photo_path)+'" style="width:100%;border-radius:12px;max-height:180px;object-fit:cover;margin-bottom:10px;" onerror="this.style.display=\'none\'">';
    var ficheCategorie = s.sous_categorie_a_affiner ? sigFamilleLabel(s.categorie_famille) : locCat(s);
    ficheHtml += '<div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:4px;">' + escHtml(ficheCategorie) + '</div>';
    if (s.description) ficheHtml += '<p style="font-size:13px;color:var(--gray-700);line-height:1.5;margin:6px 0;">' + escHtml(s.description) + '</p>';
    ficheHtml += '<div style="font-size:12px;color:var(--muted);margin-top:6px;">' + (isAr ? '📍 ' : '📍 ') + escHtml(locCommune(s));
    if (s.lat && s.lng) ficheHtml += ' · <a href="https://www.google.com/maps?q='+s.lat+','+s.lng+'" target="_blank" style="color:var(--teal);text-decoration:none;font-weight:600;">' + (isAr ? 'الخريطة' : t('bo.voir_carte')) + '</a>';
    ficheHtml += '</div>';
    ficheHtml += '<div style="font-size:12px;color:var(--muted);margin-top:2px;">📅 ' + fmtDateTime(s.cree_le) + '</div>';
    if (s.citoyen_prenom) ficheHtml += '<div style="font-size:12px;color:var(--muted);margin-top:2px;">👤 ' + escHtml(s.citoyen_prenom + ' ' + (s.citoyen_nom||'')) + (s.citoyen_tel ? ' · 📞 ' + escHtml(s.citoyen_tel) : '') + '</div>';
    ficheHtml += '</div>';

    // ── BLOC 2 — Analyse ──
    var etatLabels = {recu:t('bo.col_recu'),transmis:t('bo.col_transmis'),pris_en_charge:t('bo.col_pris_en_charge'),en_intervention:t('bo.col_en_intervention'),a_valider:t('bo.col_a_valider'),resolu:'Résolu',clos:t('bo.col_clos'),rejete:t('bo.col_rejete')};
    var criticiteLabels = isAr
      ? {haute:'استعجال عالي',moyenne:'استعجال متوسط',basse:'استعجال منخفض'}
      : {haute:'Urgence haute',moyenne:'Urgence moyenne',basse:'Urgence basse'};
    ficheHtml += '<div style="margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line);">';
    ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + (isAr ? 'التحليل' : t('bo.drawer_analyse')) + '</div>';
    ficheHtml += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">';
    ficheHtml += '<span class="kanban-card-badge" style="background:#fee2e2;color:#EF4444;">' + escHtml(etatLabels[s.etat] || s.etat) + '</span>';
    ficheHtml += '<span class="kanban-card-badge" style="background:#fef3c7;color:#F59E0B;">' + escHtml(criticiteLabels[s.criticite] || s.criticite) + '</span>';
    ficheHtml += '<span class="kanban-card-badge" style="background:var(--blue-light);color:var(--blue);">' + escHtml(locDomaine(s._domaine||s.domaine)) + '</span>';
    if (s.nb_confirmations > 0) ficheHtml += '<span class="kanban-card-badge" style="background:' + (s.nb_confirmations >= 3 ? '#dc2626' : '#7c3aed') + ';color:white;font-weight:700;">' + (isAr ? 'أكّده ' + s.nb_confirmations + ' مواطنين' : 'Confirmé par ' + s.nb_confirmations + ' citoyen' + (s.nb_confirmations > 1 ? 's' : '')) + '</span>';
    ficheHtml += '</div>';
    ficheHtml += '<div style="font-size:12px;color:var(--muted);">' + escHtml(s.reference||'—') + '</div>';
    if (s.organisation_nom) ficheHtml += '<div style="font-size:12px;color:var(--navy);margin-top:4px;">' + (isAr ? 'المنظمة : ' : 'Organisation : ') + '<strong>' + escHtml(s.organisation_nom) + '</strong></div>';
    ficheHtml += '</div>';

    // ── BLOC 2B — Planification (lecture seule) ──
    if (s.equipe_interne || s.responsable_intervention || s.delai_prevu) {
      var lEquipe = t('epic.planif_equipe');
      var lResp = t('epic.planif_resp');
      var lDate = t('epic.planif_date');
      ficheHtml += '<div style="margin-bottom:16px;background:#f8f9fb;border-radius:12px;padding:14px 16px;border:1px solid var(--line);">';
      ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + (isAr ? 'التخطيط' : t('bo.drawer_planif')) + '</div>';
      ficheHtml += '<div style="font-size:12px;color:var(--navy);line-height:1.8;">';
      if (s.equipe_interne) ficheHtml += '<div>' + lEquipe + ' : <strong>' + escHtml(s.equipe_interne) + '</strong></div>';
      if (s.responsable_intervention) ficheHtml += '<div>' + lResp + ' : <strong>' + escHtml(s.responsable_intervention) + '</strong></div>';
      if (s.delai_prevu) ficheHtml += '<div>' + lDate + ' : <strong>' + fmtDateTime(s.delai_prevu) + '</strong></div>';
      ficheHtml += '</div></div>';
    }

    // ── BLOC 2C — Compte-rendu ──
    if (s.compte_rendu_description) {
      var resLabels = isAr
        ? {resolu_completement:'تم الحل بالكامل',resolu_partiellement:'تم الحل جزئياً',impossible_intervenir:'تعذر التدخل',intervention_reportee:'تم تأجيل التدخل',autre:'أخرى'}
        : {resolu_completement:'Résolu complètement',resolu_partiellement:'Résolu partiellement',impossible_intervenir:'Impossible d\'intervenir',intervention_reportee:'Intervention reportée',autre:'Autre'};
      ficheHtml += '<div style="margin-bottom:16px;background:#F5F3FF;border-radius:12px;padding:14px 16px;border:1px solid #DDD6FE;">';
      ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + (isAr ? 'تقرير التدخل' : 'Compte-rendu d\'intervention') + '</div>';
      ficheHtml += '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>' + (isAr ? 'النتيجة :' : 'Résultat :') + '</strong> ' + escHtml(resLabels[s.compte_rendu_resultat]||s.compte_rendu_resultat||'—') + '</div>';
      ficheHtml += '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>' + (isAr ? 'الوصف :' : 'Description :') + '</strong> ' + escHtml(s.compte_rendu_description) + '</div>';
      if (s.compte_rendu_observation) ficheHtml += '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>' + (isAr ? 'ملاحظة :' : 'Observation :') + '</strong> ' + escHtml(s.compte_rendu_observation) + '</div>';
      if (s.compte_rendu_date_fin) ficheHtml += '<div style="font-size:12px;color:var(--muted);"><strong>' + (isAr ? 'تاريخ الانتهاء :' : 'Date de fin :') + '</strong> ' + new Date(s.compte_rendu_date_fin).toLocaleString(isAr ? 'ar-DZ' : 'fr-FR') + '</div>';
      ficheHtml += '</div>';
    }

    // ── Rapports CAP ──
    ficheHtml += '<div id="sup-drawer-cap-reports" style="margin-bottom:16px;"></div>';

    // ── Historique (repliable) ──
    ficheHtml += '<div style="margin-bottom:16px;">' +
      '<div onclick="var c=document.getElementById(\'sup-tl-content\');c.style.display=c.style.display===\'none\'?\'\':\'none\';" style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">' +
        '<span>' + (isAr ? 'السجل الزمني' : t('bo.drawer_historique')) + '</span><span style="font-size:14px;">▸</span>' +
      '</div>' +
      '<div id="sup-tl-content" style="display:none;font-size:12px;color:var(--muted);">' + (isAr ? 'جاري التحميل...' : 'Chargement...') + '</div>' +
    '</div>';

    content.innerHTML = ficheHtml;

    // ── Actions superviseur — Barre d'Action Exécutive ──
    var actHtml = '';
    if (s.etat === 'a_valider') {
      actHtml += '<div style="width:100%;display:flex;gap:6px;margin-bottom:8px;">' +
        '<button class="btn btn-sm btn-primary" onclick="supValiderCR()" style="flex:1;">✅ ' + t('sup.valider_cr') + '</button>' +
        '<button class="btn btn-sm" style="background:var(--red-light);color:var(--red);flex:1;" onclick="supDemanderReprise()">↩️ ' + t('sup.demander_reprise') + '</button>' +
      '</div>';
    }
    if (['pris_en_charge','en_intervention','a_valider','transmis','recu'].includes(s.etat)) {
      actHtml += '<div style="width:100%;margin-bottom:8px;">' +
        '<button class="btn btn-sm" style="background:#f1f5f9;color:#475569;width:100%;font-size:11px;" onclick="supClasserSansSuite()">📁 ' + (isAr ? 'حفظ بدون متابعة' : 'Classer sans suite') + '</button>' +
      '</div>';
    }
    actHtml += '<div style="width:100%;display:flex;gap:6px;flex-wrap:wrap;">' +
      '<button class="btn btn-sm btn-outline" onclick="supRelancer()" style="flex:1;font-size:11px;">📩 ' + (isAr ? 'إعادة' : 'Relancer') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="supNotifier()" style="flex:1;font-size:11px;">🔔 ' + (isAr ? 'إشعار' : 'Notifier') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="supDemanderExplication(\'' + id + '\')" style="flex:1;font-size:11px;">❓ ' + (isAr ? 'طلب توضيح' : 'Demander explication') + '</button>' +
      '<button class="btn btn-sm" style="background:#fef2f2;color:#EF4444;flex:1;font-size:11px;" onclick="supUrgenceWali()">🚨 ' + (isAr ? 'استعجال' : 'Urgence Wali') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="genererRapportDossier(\'' + id + '\')" style="flex:1;font-size:11px;">📄 ' + (isAr ? 'تقرير' : 'Rapport') + '</button>' +
    '</div>';
    actions.innerHTML = actHtml;

    // Load timeline
    try {
      var hRes = await apiFetch('/api/signaler/board/' + id + '/historique', { headers: authHeaders() });
      if (hRes.ok) {
        var hist = await hRes.json();
        var tlEl = document.getElementById('sup-tl-content');
        if (hist.length && tlEl) {
          tlEl.innerHTML = hist.map(function(h) {
            return '<div style="display:flex;gap:8px;padding:4px 0;border-left:2px solid var(--line);padding-left:10px;margin-left:4px;">' +
              '<div style="font-size:10px;color:var(--muted);min-width:60px;">' + fmtDateTime(h.le) + '</div>' +
              '<div style="font-size:11px;color:var(--navy);">' + escHtml(h.action || h.etat) +
              (h.prenom ? ' — ' + escHtml(h.prenom) : '') +
              (h.commentaire ? '<div style="font-size:10px;color:var(--muted);margin-top:2px;">' + escHtml(h.commentaire) + '</div>' : '') +
              '</div></div>';
          }).join('');
        } else if (tlEl) {
          tlEl.innerHTML = '<div style="color:var(--muted);font-size:11px;">' + (isAr ? 'لا يوجد سجل' : 'Aucun historique') + '</div>';
        }
      }
    } catch(e) { console.warn('[supervision] échec chargement historique drawer:', e.message); }

    // Load CAP reports
    try {
      var capRes = await apiFetch('/api/signaler/board/' + id + '/missions-cap', { headers: authHeaders() });
      if (capRes.ok) {
        var caps = await capRes.json();
        var capEl = document.getElementById('sup-drawer-cap-reports');
        if (caps.length && capEl) {
          var decLabels = isAr
            ? {valider:'✅ مؤكد',amender:'⚠️ مؤكد جزئياً',rejeter:'❌ غير مؤسس'}
            : {valider:'✅ Confirmé',amender:'⚠️ Partiellement confirmé',rejeter:'❌ Non fondé'};
          capEl.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">' + (isAr ? 'تقارير الميدان CAP' : 'Rapport(s) terrain CAP') + '</div>' +
            caps.map(function(m) {
              var agentName = (m.agent_prenom || '') + ' ' + (m.agent_nom || '');
              return '<div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:12px;padding:14px;margin-bottom:8px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                  '<div style="font-size:13px;font-weight:700;color:var(--navy);">👮 ' + escHtml(agentName.trim() || 'Agent CAP') + (m.affecte_a ? ' <span onclick="annuaireOpenFiche(\'' + m.affecte_a + '\')" style="cursor:pointer;font-size:11px;" title="' + (isAr?'فتح الملف':'Voir fiche') + '">📇</span>' : '') + '</div>' +
                  '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:' + (m.etat==='termine'?'#f0fdf4':'#fef3c7') + ';color:' + (m.etat==='termine'?'#16a34a':'#92400e') + ';">' + escHtml(m.etat) + '</span>' +
                '</div>' +
                (m.decision ? '<div style="font-size:13px;font-weight:600;margin-bottom:6px;">' + (decLabels[m.decision] || m.decision) + (m.motif_decision ? ' — ' + escHtml(m.motif_decision) : '') + '</div>' : '') +
                (m.constat_visuel ? '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>' + (isAr ? 'المعاينة :' : 'Constat :') + '</strong> ' + escHtml(m.constat_visuel) + '</div>' : '') +
                (m.photo_path ? '<div style="margin-bottom:6px;"><img src="/' + escHtml(m.photo_path) + '" style="max-width:100%;max-height:150px;border-radius:8px;border:1px solid var(--line);" onerror="this.style.display=\'none\'"></div>' : '') +
                '<div style="font-size:11px;color:var(--muted);margin-top:4px;">' + fmtDateTime(m.cloture_le || m.cree_le) + '</div>' +
              '</div>';
            }).join('');
        }
      }
    } catch(e) { console.warn('[supervision] échec chargement rapports CAP drawer:', e.message); }

  } catch(e) {
    content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red);">' + escHtml(e.message) + '</div>';
  }
}

function supCloseDrawer() { document.getElementById('sup-drawer').classList.add('hidden'); _supCurrentId = null; }

// Actions superviseur (délèguent aux fonctions existantes mais avec _supCurrentId)
function supValiderCR() {
  if (!_supCurrentId) return;
  showPromptModal(t('sup.valider_cr'), '', async function(commentaire) {
    try {
      var res = await apiFetch('/api/signaler/board/' + _supCurrentId + '/valider', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: (commentaire||'').trim() })
      });
      if (res.ok) {
        showToast(t('sup.cr_valide_resolu'));
        supCloseDrawer();
        cockpitLoad();
      } else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  });
}

function supDemanderReprise() {
  if (!_supCurrentId) return;
  showPromptModal(t('sup.demander_reprise'), '', async function(motif) {
    if (!motif || !motif.trim()) { showToast(t('sup.motif_obligatoire'), 'error'); return; }
    try {
      var res = await apiFetch('/api/signaler/board/' + _supCurrentId + '/reprise', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif: motif.trim() })
      });
      if (res.ok) {
        showToast(t('sup.reprise_demandee'));
        supCloseDrawer();
        cockpitLoad();
      } else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true, desc: currentLang === 'ar' ? 'أعمال غير مكتملة، نتيجة غير مرضية...' : 'Travaux incomplets, résultat insatisfaisant...' });
}

function supCommentaire(type, title, successMsg) {
  if (!_supCurrentId) return;
  showPromptModal(title, '', async function(msg) {
    if (!msg || !msg.trim()) return;
    try {
      var res = await apiFetch('/api/signaler/board/' + _supCurrentId + '/commentaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: msg.trim(), type: type })
      });
      if (res.ok) {
        showToast(successMsg);
        supOpenDrawer(_supCurrentId); // Refresh drawer
      } else {
        var err = await res.json();
        showToast(err.erreur || 'Erreur', 'error');
      }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true });
}

function supNotifier() {
  supCommentaire('notification',
    currentLang === 'ar' ? 'إرسال إشعار' : 'Notifier les parties prenantes',
    currentLang === 'ar' ? 'تم الإشعار' : 'Notification envoyée.');
}

function supRelancer() {
  supCommentaire('relance',
    currentLang === 'ar' ? 'إعادة تنبيه المصلحة' : 'Relancer le service',
    currentLang === 'ar' ? 'تمت الإعادة' : 'Relance envoyée.');
}

function supClasserSansSuite() {
  if (!_supCurrentId) return;
  var isAr = currentLang === 'ar';
  var title = isAr ? 'حفظ بدون متابعة — السبب مطلوب' : 'Classer sans suite — motif obligatoire';
  var placeholder = isAr ? 'غير مؤسس، مكرر، خارج الاختصاص...' : 'Non fondé, doublon, hors compétence...';
  showPromptModal(title, placeholder, async function(motif) {
    if (!motif || !motif.trim()) { showToast(t('sup.motif_obligatoire'), 'error'); return; }
    try {
      var res = await apiFetch('/api/signaler/board/' + _supCurrentId + '/etat', {
        method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ etat: 'rejete', motifRejet: motif.trim(), commentaire: motif.trim() })
      });
      if (res.ok) {
        showToast(t('sup.classe_sans_suite'));
        supCloseDrawer();
        cockpitLoad();
      } else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  });
}

function supUrgenceWali() {
  if (!_supCurrentId) return;
  showPromptModal(currentLang === 'ar' ? 'إشارة استعجال للوالي' : 'Signaler une urgence au Wali', '', async function(msg) {
    if (!msg || !msg.trim()) return;
    try {
      var res = await apiFetch('/api/signaler/board/' + _supCurrentId + '/commentaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: msg.trim(), type: 'urgence_wali' })
      });
      if (res.ok) {
        showToast(t('sup.urgence_wali'));
        supOpenDrawer(_supCurrentId);
      } else {
        var err = await res.json();
        showToast(err.erreur || 'Erreur', 'error');
      }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true, desc: currentLang === 'ar' ? 'صف طبيعة الاستعجال...' : 'Décrivez la nature de l\'urgence...' });
}

// ═══ DEMANDE D'EXPLICATION ═══

function supDemanderExplication(sigId) {
  var id = sigId || _supCurrentId;
  if (!id) return;
  var isAr = currentLang === 'ar';
  var title = isAr ? 'طلب توضيح' : 'Demander une explication';

  // Créer une modale custom avec message + sélecteur de délai
  var modalHtml = '<div style="margin-bottom:12px;font-size:12px;color:var(--muted);">' +
    (isAr ? 'أرسل طلب توضيح للمنظمة المسؤولة عن هذا الملف.' : 'Envoyez une demande d\'explication à l\'organisation responsable de ce dossier.') +
  '</div>' +
  '<textarea id="expl-message" rows="3" placeholder="' + (isAr ? 'اكتب رسالتك...' : 'Votre message...') + '" style="width:100%;padding:8px 12px;border:1px solid var(--line);border-radius:8px;font-size:13px;resize:vertical;margin-bottom:10px;"></textarea>' +
  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">' +
    '<label style="font-size:12px;color:var(--navy);font-weight:600;">' + (isAr ? 'المهلة :' : 'Délai :') + '</label>' +
    '<select id="expl-delai" style="padding:6px 10px;border:1px solid var(--line);border-radius:6px;font-size:12px;">' +
      '<option value="24">24h</option>' +
      '<option value="48" selected>48h</option>' +
      '<option value="72">72h</option>' +
    '</select>' +
  '</div>' +
  '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="btn btn-sm btn-outline" onclick="document.getElementById(\'expl-modal\').classList.add(\'hidden\')">' + (isAr ? 'إلغاء' : 'Annuler') + '</button>' +
    '<button class="btn btn-sm btn-primary" onclick="supEnvoyerExplication(\'' + id + '\')">' + (isAr ? 'إرسال' : 'Envoyer') + '</button>' +
  '</div>';

  // Utiliser une div modale simple
  var existing = document.getElementById('expl-modal');
  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'expl-modal';
    existing.className = 'bo-modal';
    existing.innerHTML = '<div class="bo-modal-overlay" onclick="this.parentElement.classList.add(\'hidden\')"></div>' +
      '<div class="bo-modal-content" style="max-width:420px;"><h4 id="expl-modal-title" style="margin:0 0 12px;font-size:15px;color:var(--navy);"></h4><div id="expl-modal-body"></div></div>';
    document.body.appendChild(existing);
  }
  document.getElementById('expl-modal-title').textContent = title;
  document.getElementById('expl-modal-body').innerHTML = modalHtml;
  existing.classList.remove('hidden');
}

async function supEnvoyerExplication(sigId) {
  var msg = document.getElementById('expl-message');
  var delai = document.getElementById('expl-delai');
  if (!msg || !msg.value.trim()) { showToast(t('sup.message_requis'), 'error'); return; }
  try {
    var res = await apiFetch('/api/supervision/demandes-explication', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ signalement_id: sigId, message: msg.value.trim(), delai_heures: Number(delai.value) })
    });
    if (res.ok) {
      showToast(t('sup.explication_envoyee'));
      document.getElementById('expl-modal').classList.add('hidden');
      if (_supCurrentId === sigId) supOpenDrawer(sigId); // refresh drawer
    } else {
      var err = await res.json();
      showToast(err.erreur || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

// ═══ PANNEAU DÉTAIL ORGANISATION ═══

async function orgPerfOpenDetail(orgId, orgName) {
  var titleEl = document.getElementById('orgperf-detail-title');
  var contentEl = document.getElementById('orgperf-detail-content');
  if (!titleEl || !contentEl) return;

  titleEl.textContent = orgName;
  contentEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + (currentLang === 'ar' ? 'جاري التحميل...' : 'Chargement...') + '</div>';
  document.getElementById('orgperf-detail-panel').classList.remove('hidden');

  var isAr = currentLang === 'ar';

  // Charger les KPIs de l'organisation depuis _orgPerfData
  var orgData = (_orgPerfData || []).find(function(o) { return o.organisation_id === orgId; });
  var html = '';

  if (orgData) {
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">';
    html += '<div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:10px;"><div style="font-size:20px;font-weight:800;color:var(--navy);">' + orgData.dossiers_recus + '</div><div style="font-size:10px;color:var(--muted);">' + (isAr ? 'مستلمة' : 'Reçus') + '</div></div>';
    html += '<div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:10px;"><div style="font-size:20px;font-weight:800;color:' + (orgData.taux_resolution >= 80 ? '#16a34a' : '#EF4444') + ';">' + orgData.taux_resolution + '%</div><div style="font-size:10px;color:var(--muted);">' + (isAr ? 'حل' : 'Résolution') + '</div></div>';
    html += '<div style="text-align:center;padding:12px;background:var(--gray-50);border-radius:10px;"><div style="font-size:20px;font-weight:800;color:' + (orgData.en_retard > 0 ? '#EF4444' : '#16a34a') + ';">' + orgData.en_retard + '</div><div style="font-size:10px;color:var(--muted);">' + (isAr ? 'متأخرة' : 'En retard') + '</div></div>';
    html += '</div>';
  }

  // Charger les dossiers de cette organisation (filtrés par org_id)
  html += '<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px;" id="orgperf-dossiers-titre">' + (isAr ? 'الملفات المفتوحة والمتأخرة' : 'Dossiers ouverts et en retard') + '</div>';

  try {
    var res = await apiFetch('/api/signaler/board?organisation_id=' + orgId, { headers: authHeaders() });
    if (res.ok) {
      var allDossiers = await res.json();
      var dossiers = (Array.isArray(allDossiers) ? allDossiers : []).filter(function(d) {
        return !['resolu','clos','rejete'].includes(d.etat);
      });
      var ouverts = dossiers.slice(0, 20);
      window._orgPerfDossiersCount = dossiers.length;
      if (ouverts.length) {
        html += '<div style="font-size:11px;color:var(--muted);margin-bottom:8px;">' + (isAr ? 'ملفات هذه المصلحة' : 'Dossiers de cette organisation') + '</div>';
        html += ouverts.map(function(d) {
          var now = Date.now();
          var horsDelai = d.etat === 'recu' && d.cree_le && (now - new Date(d.cree_le).getTime()) > 48*3600*1000;
          return '<div onclick="orgPerfCloseDetail();supOpenDrawer(\'' + d.id + '\')" style="padding:10px 12px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;cursor:pointer;transition:background 0.15s;' + (horsDelai ? 'border-left:3px solid #EF4444;' : '') + '" onmouseover="this.style.background=\'var(--gray-50)\'" onmouseout="this.style.background=\'white\'">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
              '<span style="font-weight:600;font-size:12px;color:var(--navy);">' + escHtml(d.reference || '—') + '</span>' +
              '<span style="font-size:10px;padding:2px 6px;border-radius:6px;background:#fee2e2;color:#EF4444;">' + escHtml(etatLabel(d.etat)) + '</span>' +
            '</div>' +
            '<div style="font-size:11px;color:var(--muted);margin-top:3px;">' + escHtml(arF(d.categorie_nom_ar, d.categorie_nom) || d.categorie || '—') + ' · ' + escHtml(arF(d.commune_nom_ar, d.commune_nom) || '—') + (horsDelai ? ' · <span style="color:#EF4444;font-weight:700;">' + (isAr ? 'خارج الآجال' : 'HORS DÉLAI') + '</span>' : '') + '</div>' +
          '</div>';
        }).join('');
      } else {
        html += '<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px;">' + (isAr ? 'لا توجد ملفات مفتوحة' : 'Aucun dossier ouvert') + '</div>';
      }
    }
  } catch(e) {
    html += '<div style="color:var(--red);padding:12px;">' + escHtml(e.message) + '</div>';
  }

  contentEl.innerHTML = html;
  // Update title with count after DOM is written
  var titreEl2 = document.getElementById('orgperf-dossiers-titre');
  if (titreEl2 && typeof _orgPerfDossiersCount !== 'undefined') titreEl2.textContent = titreEl2.textContent.replace(/\(\d+\)/, '') + ' (' + _orgPerfDossiersCount + ')';
}

function orgPerfCloseDetail() { document.getElementById('orgperf-detail-panel').classList.add('hidden'); }

function cockpitScrollToOrg(orgId, orgName) {
  // Scroll vers la section Performance des organisations et surbrillance
  var table = document.getElementById('orgperf-table');
  if (table) {
    table.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Surbrillance de la ligne correspondante
    setTimeout(function() {
      var rows = document.getElementById('orgperf-body');
      if (!rows) return;
      Array.from(rows.querySelectorAll('tr')).forEach(function(tr) {
        if (tr.textContent.includes(orgName)) {
          tr.style.background = '#dbeafe';
          tr.style.transition = 'background 0.3s';
          setTimeout(function() { tr.style.background = ''; }, 3000);
        }
      });
    }, 600);
  }
}

// ═══ CARTE OPÉRATIONNELLE (5B) ═══
var _cockpitMap = null;
var _cockpitMarkers = [];

async function carteOpLoad() {
  var typeEl = document.getElementById('carte-op-type');
  var communeEl = document.getElementById('carte-op-commune');
  var domaineEl = document.getElementById('carte-op-domaine');
  var etatEl = document.getElementById('carte-op-etat');
  var urgenceEl = document.getElementById('carte-op-urgence');
  var periodeEl = document.getElementById('cockpit-periode');

  var params = [];
  var periode = periodeEl ? periodeEl.value : '30j';
  params.push('periode=' + encodeURIComponent(periode));
  if (periode === 'custom') {
    var fromEl = document.getElementById('cockpit-from');
    var toEl = document.getElementById('cockpit-to');
    if (fromEl && fromEl.value) params.push('from=' + fromEl.value);
    if (toEl && toEl.value) params.push('to=' + toEl.value);
  }
  if (typeEl && typeEl.value) params.push('type=' + typeEl.value);
  if (communeEl && communeEl.value) params.push('commune=' + communeEl.value);
  if (domaineEl && domaineEl.value) params.push('domaine=' + domaineEl.value);
  if (etatEl && etatEl.value) params.push('etat=' + etatEl.value);
  if (urgenceEl && urgenceEl.value) params.push('urgence=' + urgenceEl.value);

  // Initialiser la carte si pas encore fait
  var mapEl = document.getElementById('cockpit-map');
  if (!_cockpitMap && mapEl) {
    _cockpitMap = L.map('cockpit-map').setView([36.7538, 3.0588], 11);
    createTileLayer(_cockpitMap);
    mapEl._leafletMap = _cockpitMap;
    setTimeout(function() { _cockpitMap.invalidateSize(); }, 400);
  } else if (_cockpitMap) {
    setTimeout(function() { _cockpitMap.invalidateSize(); }, 200);
  }

  // Charger le sélecteur communes si vide
  if (communeEl && communeEl.options.length <= 1 && communes.length) {
    communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; communeEl.appendChild(o); });
  }

  try {
    var res = await apiFetch('/api/supervision/carte?' + params.join('&'), { headers: authHeaders() });
    if (!res.ok) { var err = await res.json(); showToast(err.erreur || 'Erreur carte', 'error'); return; }
    var data = await res.json();
    carteOpRender(data);
  } catch(e) { showToast(e.message, 'error'); }
}

function carteOpRender(data) {
  if (!_cockpitMap) return;

  // Supprimer les anciens marqueurs
  _cockpitMarkers.forEach(function(m) { _cockpitMap.removeLayer(m); });
  _cockpitMarkers = [];

  var urgenceColors = { critique: '#dc2626', elevee: '#f97316', normale: '#2563eb', faible: '#9ca3af' };

  // Dossiers ouverts + interventions
  data.dossiers.forEach(function(d) {
    var lat = parseFloat(d.lat), lng = parseFloat(d.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    var color = d.type_point === 'intervention' ? '#f97316' : (urgenceColors[d.gravite] || '#9ca3af');
    var icon = createMarkerIcon(color, d.domaine);
    var popup =
      '<div style="font-size:12px;min-width:200px;">' +
      '<div style="font-weight:700;color:var(--navy);margin-bottom:4px;">' + escHtml(d.reference) + '</div>' +
      '<div><strong>État :</strong> ' + escHtml(etatLabel(d.etat)) + '</div>' +
      '<div><strong>Commune :</strong> ' + escHtml(arF(d.commune_nom_ar, d.commune_nom) || '—') + '</div>' +
      '<div><strong>Domaine :</strong> ' + escHtml(d.domaine || '—') + '</div>' +
      (d.organisation_nom ? '<div><strong>Organisation :</strong> ' + escHtml(d.organisation_nom) + '</div>' : '') +
      '<div><strong>Urgence :</strong> ' + escHtml(d.gravite || 'normale') + '</div>' +
      '<div><strong>Créé le :</strong> ' + fmtDateTime(d.cree_le) + '</div>' +
      (d.categorie ? '<div><strong>Catégorie :</strong> ' + escHtml(d.categorie) + '</div>' : '') +
      '<div style="margin-top:6px;"><a href="#" onclick="supOpenDrawer(\'' + d.id + '\');return false;" style="color:var(--blue);font-weight:600;">' + (currentLang === 'ar' ? 'فتح الملف' : 'Ouvrir le dossier') + '</a></div>' +
      '</div>';
    var marker = L.marker([lat, lng], { icon: icon }).addTo(_cockpitMap).bindPopup(popup);
    _cockpitMarkers.push(marker);
  });

  // Missions CAP
  data.missions.forEach(function(m) {
    var lat = parseFloat(m.lat), lng = parseFloat(m.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    var icon = L.divIcon({
      html: '<div style="width:16px;height:16px;background:#8b5cf6;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:8px;color:white;font-weight:bold;">C</div>',
      className: '', iconSize: [20, 20], iconAnchor: [10, 10]
    });
    var agent = m.agent_prenom ? escHtml(m.agent_prenom + ' ' + (m.agent_nom || '')) : 'Non affecté';
    var popup =
      '<div style="font-size:12px;min-width:200px;">' +
      '<div style="font-weight:700;color:#8b5cf6;margin-bottom:4px;">Mission CAP</div>' +
      '<div><strong>Dossier :</strong> ' + escHtml(m.reference) + '</div>' +
      '<div><strong>Type :</strong> ' + escHtml(m.type) + '</div>' +
      '<div><strong>État mission :</strong> ' + escHtml(m.mission_etat) + '</div>' +
      '<div><strong>Priorité :</strong> ' + escHtml(m.priorite) + '</div>' +
      '<div><strong>Agent :</strong> ' + agent + '</div>' +
      '<div><strong>Commune :</strong> ' + escHtml(arF(m.commune_nom_ar, m.commune_nom) || '—') + '</div>' +
      (m.signalement_id ? '<div style="margin-top:6px;"><a href="#" onclick="supOpenDrawer(\'' + m.signalement_id + '\');return false;" style="color:#8b5cf6;font-weight:600;">' + (currentLang === 'ar' ? 'فتح الملف' : 'Ouvrir le dossier') + '</a></div>' : '') +
      '</div>';
    var marker = L.marker([lat, lng], { icon: icon }).addTo(_cockpitMap).bindPopup(popup);
    _cockpitMarkers.push(marker);
  });

  // Points critiques
  data.critiques.forEach(function(c) {
    var icon = L.divIcon({
      html: '<div style="width:28px;height:28px;background:rgba(239,68,68,0.25);border:2px solid #EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#EF4444;font-weight:800;">' + c.nb + '</div>',
      className: '', iconSize: [32, 32], iconAnchor: [16, 16]
    });
    var popup =
      '<div style="font-size:12px;min-width:180px;">' +
      '<div style="font-weight:700;color:#EF4444;margin-bottom:4px;">Zone critique — ' + c.nb + ' dossiers</div>' +
      '<div><strong>Commune :</strong> ' + escHtml(c.commune_nom || '—') + '</div>' +
      '<div><strong>Domaines :</strong> ' + c.domaines.map(function(d){return escHtml(d);}).join(', ') + '</div>' +
      '<div style="margin-top:4px;font-size:11px;color:var(--muted);">Réf. : ' + c.refs.join(', ') + '</div>' +
      '</div>';
    var marker = L.marker([c.lat, c.lng], { icon: icon }).addTo(_cockpitMap).bindPopup(popup);
    _cockpitMarkers.push(marker);
  });

  // Ajuster le zoom
  if (_cockpitMarkers.length) {
    var group = L.featureGroup(_cockpitMarkers);
    _cockpitMap.fitBounds(group.getBounds().pad(0.1));
  }

  // Stats
  var statsEl = document.getElementById('cockpit-map-stats');
  if (statsEl) {
    statsEl.textContent = data.dossiers.length + ' dossier(s) · ' +
      data.missions.length + ' mission(s) CAP · ' +
      data.critiques.length + ' zone(s) critique(s) · ' +
      data.sans_gps.length + ' sans GPS';
  }

  // Dossiers sans GPS
  var sansGpsContainer = document.getElementById('cockpit-sans-gps');
  var sansGpsList = document.getElementById('cockpit-sans-gps-list');
  if (data.sans_gps.length && sansGpsContainer && sansGpsList) {
    sansGpsContainer.style.display = '';
    sansGpsList.innerHTML = data.sans_gps.map(function(d) {
      return '<div style="display:flex;justify-content:space-between;padding:6px 8px;border-bottom:1px solid var(--line);cursor:pointer;" onclick="supOpenDrawer(\'' + d.id + '\')">' +
        '<span><strong>' + escHtml(d.reference) + '</strong> — ' + escHtml(d.categorie || '—') + '</span>' +
        '<span style="color:var(--muted);">' + escHtml(arF(d.commune_nom_ar, d.commune_nom) || '—') + ' · ' + escHtml(etatLabel(d.etat)) + '</span></div>';
    }).join('');
  } else if (sansGpsContainer) {
    sansGpsContainer.style.display = 'none';
  }
}

// ═══ PERFORMANCE ORGANISATIONS (5C) ═══
var _orgPerfData = [];

async function orgPerfLoad() {
  var periodeEl = document.getElementById('cockpit-periode');
  var periode = periodeEl ? periodeEl.value : '30j';
  var inclure = document.getElementById('orgperf-inactives');
  var params = ['periode=' + encodeURIComponent(periode)];
  if (periode === 'custom') {
    var fromEl = document.getElementById('cockpit-from');
    var toEl = document.getElementById('cockpit-to');
    if (fromEl && fromEl.value) params.push('from=' + fromEl.value);
    if (toEl && toEl.value) params.push('to=' + toEl.value);
  }
  if (inclure && inclure.checked) params.push('inclure_inactives=true');

  try {
    var res = await apiFetch('/api/supervision/organisations-performance?' + params.join('&'), { headers: authHeaders() });
    if (!res.ok) { var e = await res.json(); showToast(e.erreur || 'Erreur', 'error'); return; }
    var data = await res.json();
    _orgPerfData = data.organisations || [];
    orgPerfRender();
  } catch(e) { showToast(e.message, 'error'); }
}

function orgPerfRender() {
  var sortEl = document.getElementById('orgperf-sort');
  var sortBy = sortEl ? sortEl.value : 'dossiers_recus';
  var sorted = _orgPerfData.slice().sort(function(a, b) {
    if (sortBy === 'taux_resolution') return b.taux_resolution - a.taux_resolution;
    if (sortBy === 'taux_reprise') return b.taux_reprise - a.taux_reprise;
    if (sortBy === 'temps_moyen_h') return (b.temps_moyen_h || 0) - (a.temps_moyen_h || 0);
    if (sortBy === 'en_retard') return b.en_retard - a.en_retard;
    return b.dossiers_recus - a.dossiers_recus;
  });

  var typeLabels = { epic: 'EPIC', service: 'Service', direction: 'Direction', cabinet: 'Cabinet', wilaya: 'Wilaya' };
  var tbody = document.getElementById('orgperf-body');
  if (!tbody) return;

  if (!sorted.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="padding:16px;text-align:center;color:var(--muted);">Aucune organisation avec activité sur cette période.</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(function(o) {
    var resColor = o.taux_resolution >= 80 ? '#16a34a' : o.taux_resolution >= 50 ? '#f97316' : '#EF4444';
    var retardColor = o.en_retard > 0 ? '#EF4444' : 'var(--muted)';
    var repriseColor = o.taux_reprise > 20 ? '#EF4444' : o.taux_reprise > 0 ? '#f97316' : 'var(--muted)';
    return '<tr style="border-bottom:1px solid var(--line);cursor:pointer;transition:background 0.15s;" onclick="orgPerfOpenDetail(' + o.organisation_id + ',\'' + escHtml(arF(o.nom_ar,o.nom)).replace(/'/g,'\\x27') + '\')" onmouseover="this.style.background=\'var(--gray-50)\'" onmouseout="this.style.background=\'transparent\'">' +
      '<td style="padding:8px 10px;font-weight:600;color:var(--navy);">' + escHtml(arF(o.nom_ar,o.nom)) + '</td>' +
      '<td style="padding:8px 10px;"><span style="font-size:10px;padding:2px 6px;border-radius:6px;background:var(--blue-light);color:var(--blue);font-weight:600;">' + escHtml(typeLabels[o.type] || o.type) + '</span></td>' +
      '<td style="padding:8px 10px;text-align:right;font-weight:700;">' + o.dossiers_recus + '</td>' +
      '<td style="padding:8px 10px;text-align:right;">' + (o.temps_moyen_h ? o.temps_moyen_h + 'h' : '—') + '</td>' +
      '<td style="padding:8px 10px;text-align:right;font-weight:600;color:' + resColor + ';">' + o.taux_resolution + '%</td>' +
      '<td style="padding:8px 10px;text-align:right;font-weight:600;color:' + retardColor + ';">' + o.en_retard + '</td>' +
      '<td style="padding:8px 10px;text-align:right;font-weight:600;color:' + repriseColor + ';">' + o.taux_reprise + '%' +
        (o.reprises_total > 0 ? '<span style="font-size:9px;color:var(--muted);font-weight:400;display:block;">' + o.reprises_total + ' reprise(s) · moy. ' + o.moyenne_reprises_par_dossier + '/dossier</span>' : '') +
      '</td>' +
      '</tr>';
  }).join('');
}

// ═══ PERFORMANCE CAP (5D) ═══

async function capPerfLoad() {
  var periodeEl = document.getElementById('cockpit-periode');
  var periode = periodeEl ? periodeEl.value : '30j';
  var params = ['periode=' + encodeURIComponent(periode)];
  if (periode === 'custom') {
    var fromEl = document.getElementById('cockpit-from');
    var toEl = document.getElementById('cockpit-to');
    if (fromEl && fromEl.value) params.push('from=' + fromEl.value);
    if (toEl && toEl.value) params.push('to=' + toEl.value);
  }
  try {
    var res = await apiFetch('/api/supervision/cap-performance?' + params.join('&'), { headers: authHeaders() });
    if (!res.ok) return;
    var data = await res.json();
    capPerfRender(data.agents);
  } catch(e) { console.warn('[supervision] échec chargement performance CAP:', e.message); }
}

function capPerfRender(agents) {
  var container = document.getElementById('capperf-cards');
  var emptyEl = document.getElementById('capperf-empty');
  if (!container) return;

  if (!agents || !agents.length) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  container.innerHTML = agents.map(function(a) {
    var name = (a.prenom || '') + ' ' + (a.nom || '');
    var tauxReal = a.missions_total > 0 ? Math.round((a.missions_realisees / a.missions_total) * 100) : 0;
    var tauxColor = tauxReal >= 80 ? '#16a34a' : tauxReal >= 50 ? '#f97316' : '#EF4444';

    var kpis = [
      { label: 'Réalisées', value: a.missions_realisees, color: '#16a34a' },
      { label: 'En cours', value: a.missions_en_cours, color: '#2563eb' },
      { label: 'Bloquées', value: a.missions_bloquees, color: '#EF4444' },
      { label: 'Temps moy.', value: a.temps_moyen_min ? a.temps_moyen_min + ' min' : '—', color: '#8b5cf6' },
    ];

    var types = [];
    if (a.constats) types.push('Constats : ' + a.constats);
    if (a.verifications) types.push('Vérifications : ' + a.verifications);
    if (a.rondes) types.push('Rondes : ' + a.rondes);
    if (a.signalements_proactifs) types.push('Signalements proactifs : ' + a.signalements_proactifs);
    if (a.assistance_pmr) types.push('Assistance PMR : ' + a.assistance_pmr);
    if (a.stationnement) types.push('Stationnement : ' + a.stationnement);

    return '<div style="background:var(--gray-50);border:1px solid var(--line);border-radius:12px;padding:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
        '<div><div style="font-size:14px;font-weight:700;color:var(--navy);">' + escHtml(name.trim() || 'Agent CAP') + '</div>' +
        '<div style="font-size:11px;color:var(--muted);">' + escHtml(a.commune_nom || '—') + '</div></div>' +
        '<div style="text-align:right;"><div style="font-size:22px;font-weight:800;color:' + tauxColor + ';">' + tauxReal + '%</div>' +
        '<div style="font-size:9px;color:var(--muted);text-transform:uppercase;">taux réalisation</div></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;">' +
        kpis.map(function(k) {
          return '<div style="text-align:center;"><div style="font-size:16px;font-weight:700;color:' + k.color + ';">' + k.value + '</div>' +
            '<div style="font-size:9px;color:var(--muted);">' + k.label + '</div></div>';
        }).join('') +
      '</div>' +
      (types.length ? '<div style="font-size:11px;color:var(--navy);border-top:1px solid var(--line);padding-top:8px;">' +
        types.map(function(t) { return '<span style="display:inline-block;background:white;padding:2px 6px;border-radius:4px;margin:2px;border:1px solid var(--line);">' + t + '</span>'; }).join('') +
      '</div>' : '<div style="font-size:11px;color:var(--muted);border-top:1px solid var(--line);padding-top:8px;">Aucune mission sur cette période</div>') +
    '</div>';
  }).join('');
}

// ═══ ALERTES STRATÉGIQUES (5E) ═══
var _alertesData = [];

async function alertesLoad() {
  var periodeEl = document.getElementById('cockpit-periode');
  var periode = periodeEl ? periodeEl.value : '30j';
  try {
    var res = await apiFetch('/api/supervision/alertes-strategiques?periode=' + encodeURIComponent(periode) + cockpitGetFilterParams(), { headers: authHeaders() });
    if (!res.ok) return;
    var data = await res.json();
    _alertesData = data.alertes || [];
    var section = document.getElementById('cockpit-alertes-section');
    var countEl = document.getElementById('cockpit-alertes-count');
    if (section) section.style.display = _alertesData.length ? '' : 'none';
    if (countEl) countEl.textContent = _alertesData.length + ' alerte(s)';
    alertesRender();
  } catch(e) { console.warn('[supervision] échec chargement alertes stratégiques:', e.message); }
}

function alertesRender() {
  var filterEl = document.getElementById('cockpit-alertes-filter');
  var typeFilter = filterEl ? filterEl.value : '';
  var list = typeFilter ? _alertesData.filter(function(a) { return a.type === typeFilter; }) : _alertesData;

  var container = document.getElementById('cockpit-alertes-list');
  if (!container) return;

  var graviteIcons = { critique: '🔴', elevee: '🟠', normale: '🟡' };
  var graviteLabels = { critique: t('sup.gravite_critique'), elevee: t('sup.gravite_elevee'), normale: t('sup.gravite_normale') };
  var graviteBg = { critique: '#fee2e2', elevee: '#fff7ed', normale: '#fefce8' };
  var graviteBorder = { critique: '#EF4444', elevee: '#f97316', normale: '#eab308' };
  var typeLabels = { sla: t('sup.alerte_sla'), critique: t('sup.alerte_critique'), chaud: t('sup.alerte_chaud'), saturee: t('sup.alerte_saturee') };
  var domaineLabels = {eau:'Eau',proprete:'Propreté',general:'Général',voirie:'Voirie',eclairage:'Éclairage'};

  if (!list.length) {
    container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:16px;">Aucune alerte active' + (typeFilter ? ' pour ce type' : '') + '.</div>';
    return;
  }

  container.innerHTML = list.map(function(a) {
    var bg = graviteBg[a.gravite] || '#fefce8';
    var border = graviteBorder[a.gravite] || '#eab308';
    var icon = graviteIcons[a.gravite] || '🟡';
    var gLabel = graviteLabels[a.gravite] || 'Normale';

    var details = '';
    var action = '';

    var isAr = currentLang === 'ar';
    var btnOuvrir = isAr ? 'فتح' : 'Ouvrir';
    var btnVoirOrg = isAr ? 'عرض المنظمة' : 'Voir l\'organisation';

    if (a.type === 'sla') {
      details = '<strong>' + (isAr ? 'مرجع ' : 'Réf. ') + escHtml(a.reference) + '</strong> — ' + escHtml(a.commune || '—') +
        '<br>' + (isAr ? 'تأخير : ' : 'Retard : ') + '<strong>' + a.retard_label + '</strong>' +
        (a.organisation ? ' · ' + escHtml(a.organisation) : '') +
        (a.domaine ? ' · ' + escHtml(domaineLabels[a.domaine] || a.domaine) : '');
      action = '<button class="btn btn-sm btn-outline" onclick="supOpenDrawer(\'' + a.signalement_id + '\')" style="font-size:10px;">' + btnOuvrir + '</button>';
    } else if (a.type === 'critique') {
      details = '<strong>' + (isAr ? 'مرجع ' : 'Réf. ') + escHtml(a.reference) + '</strong> — ' + escHtml(a.commune || '—') +
        '<br>' + (isAr ? 'منذ ' : 'Depuis ') + a.depuis_heures + (isAr ? ' ساعة' : 'h') + ' · ' + escHtml(domaineLabels[a.domaine] || a.domaine || '—') +
        (a.organisation ? ' · ' + escHtml(a.organisation) : '');
      action = '<button class="btn btn-sm btn-outline" onclick="supOpenDrawer(\'' + a.signalement_id + '\')" style="font-size:10px;">' + btnOuvrir + '</button>';
    } else if (a.type === 'chaud') {
      details = '<strong>' + a.nb + (isAr ? ' ملفات' : ' dossiers') + '</strong> — ' + escHtml(a.commune || '—') +
        '<br>' + (isAr ? 'المجالات : ' : 'Domaines : ') + a.domaines.map(function(d) { return escHtml(domaineLabels[d] || d); }).join(', ') +
        '<br><span style="font-size:10px;color:var(--muted);">' + (isAr ? 'مرجع : ' : 'Réf. : ') + a.refs.join(', ') + '</span>';
      action = '<button class="btn btn-sm btn-outline" onclick="document.getElementById(\'carte-op-type\').value=\'critiques\';carteOpLoad();" style="font-size:10px;">' + t('bo.voir_carte') + '</button>';
    } else if (a.type === 'saturee') {
      details = '<strong>' + escHtml(a.organisation) + '</strong> (' + escHtml(a.type_org || '') + ')' +
        '<br>' + a.ouverts + (isAr ? ' ملفات مفتوحة · ' : ' dossiers ouverts · ') + a.en_retard + (isAr ? ' متأخرة · ' : ' en retard · ') + a.taux_retard + '% ' + (isAr ? 'تأخير' : 'retard');
      action = '<button class="btn btn-sm btn-outline" onclick="cockpitScrollToOrg(' + a.organisation_id + ',\'' + escHtml(a.organisation) + '\')" style="font-size:10px;">' + btnVoirOrg + '</button>';
    }

    return '<div style="background:' + bg + ';border:1px solid ' + border + ';border-left:4px solid ' + border + ';border-radius:10px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;">' +
      '<div style="font-size:18px;line-height:1;">' + icon + '</div>' +
      '<div style="flex:1;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
          '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:' + border + ';">' + typeLabels[a.type] + ' · ' + gLabel + '</span>' +
          action +
        '</div>' +
        '<div style="font-size:12px;color:var(--navy);line-height:1.5;">' + details + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ═══ FIN COCKPIT ═══

var execMapLayers = { urgences: true, horsdelai: true, cap: false, tous: false };

// ═══ BUREAU DES RAPPORTS ═══

function initRapports() {
  var isAr = currentLang === 'ar';
  var isCommune = hasNiveau('commune');

  // Populate commune select
  var sel = document.getElementById('rap-commune');
  if (sel && sel.options.length <= 1 && communes.length) {
    if (isCommune) {
      var grp = document.getElementById('rap-commune-group');
      if (grp) grp.style.display = 'none';
      sel.value = (currentUser || {}).commune_id || '';
    } else {
      communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; sel.appendChild(o); });
    }
  }

  // Populate organisation select — all active organisations
  var orgSel = document.getElementById('rap-organisation');
  if (orgSel && orgSel.options.length <= 1) {
    safeFetchJSON('/api/supervision/organisations-performance?periode=annee&inclure_inactives=true', {}, true).then(function(data) {
      (data.organisations || data || []).forEach(function(o) {
        var opt = document.createElement('option');
        opt.value = o.organisation_id || o.id;
        opt.textContent = (currentLang==='ar' && o.nom_ar) ? o.nom_ar : o.nom;
        orgSel.appendChild(opt);
      });
    }).catch(function(e){ console.warn('[rapports] échec chargement organisations:', e.message); });
  }

  // Toggle custom dates
  var perSel = document.getElementById('rap-periode');
  if (perSel) perSel.onchange = function() {
    var cd = document.getElementById('rap-custom-dates');
    if (cd) cd.style.display = this.value === 'custom' ? 'flex' : 'none';
  };

  // Load mes rapports
  loadMesRapports();
}

async function loadMesRapports() {
  var el = document.getElementById('rap-mes-rapports');
  if (!el) return;
  try {
    var rapports = await safeFetchJSON('/api/rapports/mes-rapports', { headers: authHeaders() }, true);
    if (!rapports.length) { el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--muted);">Aucun rapport généré.</div>'; return; }
    var typeIcons = { territoire: '📊', dossier: '📋', encaissements: '💰', executif: '📑' };
    var typeLabels = { territoire: 'Territoire', dossier: 'Dossier', encaissements: 'Encaissements', executif: 'Rapport exécutif' };
    el.innerHTML = rapports.map(function(r) {
      var isAr = currentLang === 'ar';
      return '<div style="padding:10px 0;border-bottom:1px solid var(--line);">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">' +
          '<div style="min-width:0;">' +
            '<div style="font-weight:600;color:var(--navy);font-size:13px;">' + (typeIcons[r.type]||'📄') + ' ' + escHtml(r.titre||r.filename) + '</div>' +
            '<div style="font-size:11px;color:var(--muted);margin-top:2px;">' + (typeLabels[r.type]||r.type) + ' · ' + fmtDateTime(r.cree_le) + '</div>' +
          '</div>' +
          '<a href="' + escHtml(r.url) + '" target="_blank" download style="flex-shrink:0;font-size:11px;padding:4px 12px;background:#7C3AED;color:white;border-radius:8px;text-decoration:none;font-weight:600;white-space:nowrap;">' + (isAr?'تحميل':'Télécharger') + '</a>' +
        '</div></div>';
    }).join('');
  } catch(e) { el.innerHTML = '<div style="color:var(--red);">Erreur de chargement</div>'; }
}

async function genererRapport(opts) {
  opts = opts || {};
  var isAr = currentLang === 'ar';
  var statusEl = document.getElementById('rap-status');
  var btnEl = document.getElementById('rap-btn-generer');

  var body = {
    periode: opts.periode || (document.getElementById('rap-periode') || {}).value || '30j',
    commune_id: opts.commune_id || (document.getElementById('rap-commune') || {}).value || '',
    domaine: opts.domaine || (document.getElementById('rap-domaine') || {}).value || '',
    organisation_id: opts.organisation_id || (document.getElementById('rap-organisation') || {}).value || '',
    from: (document.getElementById('rap-from') || {}).value || '',
    to: (document.getElementById('rap-to') || {}).value || '',
    lang: currentLang
  };

  if (statusEl) statusEl.textContent = isAr ? 'جاري إنشاء التقرير...' : 'Génération en cours...';
  if (btnEl) btnEl.disabled = true;

  try {
    var res = await apiFetch('/api/rapports/generer', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    var data = await res.json();
    if (data.ok && data.url) {
      if (statusEl) statusEl.textContent = isAr ? 'تم إنشاء التقرير ✅' : 'Rapport généré ✅';
      var resultEl = document.getElementById('rap-result');
      if (resultEl) {
        resultEl.style.display = '';
        document.getElementById('rap-result-title').textContent = data.filename;
        document.getElementById('rap-result-date').textContent = new Date().toLocaleString(isAr ? 'ar-DZ' : 'fr-DZ');
        var link = document.getElementById('rap-download-link');
        if (link) { link.href = data.url; link.textContent = isAr ? 'تحميل' : 'Télécharger'; }
      }
      showToast(t('rapport.pret_telechargement'));
    } else {
      showToast(data.erreur || 'Erreur', 'error');
      if (statusEl) statusEl.textContent = '';
    }
  } catch(e) { showToast(e.message, 'error'); if (statusEl) statusEl.textContent = ''; }
  if (btnEl) btnEl.disabled = false;
}

async function genererRapportExecutif() {
  var isAr = currentLang === 'ar';
  var statusEl = document.getElementById('rap-status');
  var body = {
    periode: (document.getElementById('rap-periode') || {}).value || '30j',
    commune_id: (document.getElementById('rap-commune') || {}).value || '',
    from: (document.getElementById('rap-from') || {}).value || '',
    to: (document.getElementById('rap-to') || {}).value || '',
    lang: currentLang
  };
  if (statusEl) statusEl.textContent = isAr ? 'جاري إنشاء التقرير التنفيذي...' : 'Génération du rapport exécutif...';
  try {
    var res = await apiFetch('/api/rapports/executif', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    var data = await res.json();
    if (data.ok && data.url) {
      if (statusEl) statusEl.textContent = isAr ? 'تم إنشاء التقرير التنفيذي ✅' : 'Rapport exécutif généré ✅';
      var resultEl = document.getElementById('rap-result');
      if (resultEl) {
        resultEl.style.display = '';
        document.getElementById('rap-result-title').textContent = data.filename;
        document.getElementById('rap-result-date').textContent = new Date().toLocaleString(isAr ? 'ar-DZ' : 'fr-DZ');
        var link = document.getElementById('rap-download-link');
        if (link) { link.href = data.url; link.textContent = isAr ? 'تحميل' : 'Télécharger'; }
      }
      loadMesRapports();
      showToast(t('rapport.executif_pret'));
    } else { showToast(data.erreur || data.message || 'Erreur', 'error'); if (statusEl) statusEl.textContent = ''; }
  } catch(e) { showToast(e.message, 'error'); if (statusEl) statusEl.textContent = ''; }
}

async function genererRapportDossier(sigId) {
  var isAr = currentLang === 'ar';
  showToast(t('rapport.generation_dossier'), 'info');
  try {
    var res = await apiFetch('/api/rapports/dossier/' + sigId, {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: currentLang })
    });
    var data = await res.json();
    if (data.ok && data.url) {
      window.open(data.url, '_blank');
      showToast(t('rapport.dossier_pret'));
    } else { showToast(data.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

// ═══ ANNUAIRE ═══

function annuaireInit() {
  var isAr = currentLang === 'ar';
  var canEdit = hasFonction('superviseur');
  var sel = document.getElementById('annuaire-commune');
  if (sel && sel.options.length <= 1 && communes.length) {
    if (hasNiveau('commune')) { sel.style.display = 'none'; }
    else { communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; sel.appendChild(o); }); }
  }
  var search = document.getElementById('annuaire-search');
  if (search) search.placeholder = isAr ? 'بحث...' : 'Rechercher...';
  var addBtn = document.getElementById('annuaire-btn-add');
  if (addBtn) addBtn.style.display = canEdit ? '' : 'none';
  if (addBtn) addBtn.textContent = isAr ? '+ إضافة' : '+ Ajouter';
  var inLabel = document.getElementById('annuaire-inactifs-label');
  if (inLabel && canEdit) inLabel.style.display = 'flex';
  annuaireLoad();
}

async function annuaireLoad() {
  var isAr = currentLang === 'ar';
  var canEdit = hasFonction('superviseur');
  var isWilaya = hasNiveau('wilaya');
  var q = (document.getElementById('annuaire-search') || {}).value || '';
  var fn = (document.getElementById('annuaire-fn') || {}).value || '';
  var com = (document.getElementById('annuaire-commune') || {}).value || '';
  var inclInactifs = document.getElementById('annuaire-inactifs');
  var params = [];
  if (q) params.push('q=' + encodeURIComponent(q));
  if (fn) params.push('fonction=' + fn);
  if (com) params.push('commune_id=' + com);
  if (inclInactifs && inclInactifs.checked) params.push('inclure_inactifs=true');
  var qs = params.length ? '?' + params.join('&') : '';

  var list = document.getElementById('annuaire-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + (isAr ? 'جاري التحميل...' : 'Chargement...') + '</div>';

  try {
    var data = await safeFetchJSON('/api/supervision/annuaire' + qs, {}, true);
    if (!data.length) {
      list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);grid-column:1/-1;">' + (isAr ? 'لا توجد نتائج' : 'Aucun résultat.') + '</div>';
      return;
    }
    var fnLabels = isAr
      ? {agent_traitant:'معالج الإشارات',cap:'عون القرب',entite_responsable:'مسؤول المصلحة',superviseur:'المشرف'}
      : {agent_traitant:'Agent traitant',cap:'Agent CAP',entite_responsable:'Responsable EPIC',superviseur:'Superviseur'};

    list.innerHTML = data.map(function(u) {
      var name = ((u.prenom||'') + ' ' + (u.nom||'')).trim() || '—';
      var initials = (u.prenom||'X')[0] + (u.nom||'X')[0];
      var charge = u.dossiers_en_cours + u.missions_en_cours;
      var chargeLbl = charge > 0 ? (isAr ? charge + ' ملفات جارية' : charge + ' en cours') : (isAr ? 'متاح' : 'Disponible');
      var chargeColor = charge > 5 ? '#EF4444' : charge > 0 ? '#f97316' : '#16a34a';
      var isInactif = u.actif === false;
      var supHtml = '';
      if (u.superieur) {
        supHtml = '<div style="font-size:10px;color:var(--muted);margin-top:6px;border-top:1px solid var(--line);padding-top:6px;">' +
          (isAr ? 'المسؤول : ' : 'Supérieur : ') +
          '<a onclick="annuaireScrollTo(\'' + u.superieur.id + '\')" style="color:var(--teal);cursor:pointer;font-weight:600;">' + escHtml(u.superieur.nom) + '</a>' +
          ' <span style="font-size:9px;color:var(--muted);">(' + (fnLabels[u.superieur.fonction]||u.superieur.fonction) + ')</span></div>';
      }
      // Boutons admin
      var adminBtns = '';
      if (canEdit) {
        adminBtns = '<div style="display:flex;gap:4px;margin-top:8px;border-top:1px solid var(--line);padding-top:8px;">' +
          '<button class="btn btn-sm btn-outline" onclick="annuaireShowModal(\'' + u.id + '\')" style="font-size:10px;">✏️ ' + (isAr ? 'تعديل' : 'Modifier') + '</button>';
        if (isWilaya) {
          if (isInactif) {
            adminBtns += '<button class="btn btn-sm btn-outline" onclick="annuaireAction(\'' + u.id + '\',\'reactiver\')" style="font-size:10px;color:#16a34a;">🔄 ' + (isAr ? 'إعادة تفعيل' : 'Réactiver') + '</button>';
          } else {
            adminBtns += '<button class="btn btn-sm btn-outline" onclick="annuaireAction(\'' + u.id + '\',\'desactiver\')" style="font-size:10px;color:#f97316;">⏸ ' + (isAr ? 'تعطيل' : 'Désactiver') + '</button>';
          }
          adminBtns += '<button class="btn btn-sm btn-outline" onclick="annuaireAction(\'' + u.id + '\',\'supprimer\')" style="font-size:10px;color:#EF4444;">🗑 ' + (isAr ? 'حذف' : 'Supprimer') + '</button>';
        }
        adminBtns += '</div>';
      }

      return '<div id="annuaire-' + u.id + '" style="background:white;border:1px solid var(--line);border-radius:12px;padding:16px;transition:box-shadow 0.2s;' + (isInactif ? 'opacity:0.5;' : '') + '">' +
        (isInactif ? '<span style="float:right;font-size:9px;padding:2px 6px;border-radius:6px;background:#fee2e2;color:#EF4444;font-weight:600;">' + (isAr ? 'غير نشط' : 'Inactif') + '</span>' : '') +
        '<div style="display:flex;gap:12px;align-items:flex-start;">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:' + (isInactif ? '#9ca3af' : 'var(--navy)') + ';color:white;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0;">' + initials.toUpperCase() + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:14px;font-weight:700;color:var(--navy);">' + escHtml(name) + '</div>' +
            '<div style="font-size:11px;color:var(--teal);font-weight:600;">' + (fnLabels[u.fonction]||u.fonction) + '</div>' +
            (u.organisation_nom ? '<div style="font-size:11px;color:var(--muted);">' + escHtml(u.organisation_nom) + '</div>' : '') +
            (u.commune_nom ? '<div style="font-size:11px;color:var(--muted);">📍 ' + escHtml(u.commune_nom) + '</div>' : '') +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div style="font-size:11px;font-weight:700;color:' + chargeColor + ';">' + chargeLbl + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">' +
          (u.telephone ? '<a href="tel:' + u.telephone + '" style="font-size:11px;color:var(--blue);text-decoration:none;display:flex;align-items:center;gap:3px;">📞 ' + u.telephone + '</a>' : '') +
          (u.email ? '<a href="mailto:' + u.email + '" style="font-size:11px;color:var(--blue);text-decoration:none;display:flex;align-items:center;gap:3px;">✉️ ' + escHtml(u.email) + '</a>' : '') +
        '</div>' +
        supHtml +
        adminBtns +
      '</div>';
    }).join('');
  } catch(e) {
    list.innerHTML = '<div style="color:var(--red);padding:20px;">' + escHtml(e.message) + '</div>';
  }
}

function annuaireScrollTo(id) {
  var el = document.getElementById('annuaire-' + id);
  if (el) {
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.style.boxShadow = '0 0 0 3px var(--teal)';
    setTimeout(function() { el.style.boxShadow = ''; }, 2000);
  }
}

function annuaireShowModal(editId) {
  var isAr = currentLang === 'ar';
  var title = editId ? (isAr ? 'تعديل جهة الاتصال' : 'Modifier le contact') : (isAr ? 'إضافة جهة اتصال' : 'Ajouter un contact');
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
    '<input id="ann-prenom" placeholder="' + (isAr ? 'الاسم' : 'Prénom') + '" style="padding:8px;border:1px solid var(--line);border-radius:8px;font-size:12px;">' +
    '<input id="ann-nom" placeholder="' + (isAr ? 'اللقب' : 'Nom') + '" style="padding:8px;border:1px solid var(--line);border-radius:8px;font-size:12px;">' +
    '<select id="ann-fonction" style="padding:8px;border:1px solid var(--line);border-radius:8px;font-size:12px;">' +
      '<option value="agent_traitant">Agent traitant</option><option value="cap">Agent CAP</option>' +
      '<option value="entite_responsable">Responsable EPIC</option><option value="superviseur">Superviseur</option></select>' +
    '<select id="ann-commune" style="padding:8px;border:1px solid var(--line);border-radius:8px;font-size:12px;"><option value="">Commune</option></select>' +
    '<input id="ann-tel" placeholder="' + (isAr ? 'الهاتف' : 'Téléphone') + '" style="padding:8px;border:1px solid var(--line);border-radius:8px;font-size:12px;">' +
    '<input id="ann-email" placeholder="Email" style="padding:8px;border:1px solid var(--line);border-radius:8px;font-size:12px;">' +
    '<select id="ann-org" style="padding:8px;border:1px solid var(--line);border-radius:8px;font-size:12px;grid-column:span 2;"><option value="">Organisation</option></select>' +
  '</div>';
  if (!editId) {
    html += '<div style="margin-bottom:12px;display:flex;gap:12px;">' +
      '<label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="ann-mode" value="simple" checked> ' + (isAr ? 'جهة اتصال بسيطة' : 'Contact simple') + '</label>' +
      '<label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="ann-mode" value="compte"> ' + (isAr ? 'إنشاء حساب مستخدم' : 'Créer un compte') + '</label>' +
    '</div>';
  }
  html += '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
    '<button class="btn btn-sm btn-outline" onclick="document.getElementById(\'ann-modal\').classList.add(\'hidden\')">' + (isAr ? 'إلغاء' : 'Annuler') + '</button>' +
    '<button class="btn btn-sm btn-primary" onclick="annuaireSave(\'' + (editId||'') + '\')">' + (isAr ? 'حفظ' : 'Enregistrer') + '</button>' +
  '</div>';

  var modal = document.getElementById('ann-modal');
  if (!modal) {
    modal = document.createElement('div'); modal.id = 'ann-modal'; modal.className = 'bo-modal';
    modal.innerHTML = '<div class="bo-modal-overlay" onclick="this.parentElement.classList.add(\'hidden\')"></div><div class="bo-modal-content" style="max-width:480px;"><h4 id="ann-modal-title" style="margin:0 0 12px;"></h4><div id="ann-modal-body"></div></div>';
    document.body.appendChild(modal);
  }
  document.getElementById('ann-modal-title').textContent = title;
  document.getElementById('ann-modal-body').innerHTML = html;
  modal.classList.remove('hidden');

  // Populate selects
  var comSel = document.getElementById('ann-commune');
  communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; comSel.appendChild(o); });
  safeFetchJSON('/api/admin/organisations', {}, true).then(function(orgs) {
    var orgSel = document.getElementById('ann-org');
    (Array.isArray(orgs) ? orgs : []).forEach(function(o) { var opt = document.createElement('option'); opt.value = o.id; opt.textContent = o.nom; orgSel.appendChild(opt); });
  }).catch(function(e){ console.warn('[supervision] échec chargement organisations annuaire:', e.message); });

  // If editing, pre-fill
  if (editId) {
    safeFetchJSON('/api/supervision/annuaire?q=', {}, true).then(function(data) {
      var u = data.find(function(x) { return x.id === editId; });
      if (u) {
        document.getElementById('ann-prenom').value = u.prenom || '';
        document.getElementById('ann-nom').value = u.nom || '';
        document.getElementById('ann-fonction').value = u.fonction || '';
        document.getElementById('ann-commune').value = u.commune_id || '';
        document.getElementById('ann-tel').value = u.telephone || '';
        document.getElementById('ann-email').value = u.email || '';
        setTimeout(function() { document.getElementById('ann-org').value = u.organisation_id || ''; }, 500);
      }
    }).catch(function(e){ console.warn('[supervision] échec chargement fiche annuaire:', e.message); });
  }
}

async function annuaireSave(editId) {
  var isAr = currentLang === 'ar';
  var body = {
    prenom: document.getElementById('ann-prenom').value.trim(),
    nom: document.getElementById('ann-nom').value.trim(),
    fonction: document.getElementById('ann-fonction').value,
    commune_id: document.getElementById('ann-commune').value || null,
    telephone: document.getElementById('ann-tel').value.trim(),
    email: document.getElementById('ann-email').value.trim(),
    organisation_id: document.getElementById('ann-org').value || null,
  };
  if (!body.prenom || !body.nom) { showToast(t('admin.prenom_nom_requis'), 'error'); return; }

  try {
    var res;
    if (editId) {
      res = await apiFetch('/api/supervision/annuaire/' + editId, {
        method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } else {
      var mode = document.querySelector('input[name="ann-mode"]:checked');
      body.creer_compte = mode && mode.value === 'compte';
      res = await apiFetch('/api/supervision/annuaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    var data = await res.json();
    if (data.ok) {
      document.getElementById('ann-modal').classList.add('hidden');
      if (data.mot_de_passe_provisoire) {
        showToast((isAr ? 'كلمة المرور المؤقتة : ' : 'Mot de passe provisoire : ') + data.mot_de_passe_provisoire, 'info');
        alert((isAr ? 'كلمة المرور المؤقتة : ' : 'Mot de passe provisoire : ') + data.mot_de_passe_provisoire);
      } else {
        showToast(t('admin.enregistre'));
      }
      annuaireLoad();
    } else {
      showToast(data.erreur || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

async function annuaireAction(uid, action) {
  var isAr = currentLang === 'ar';
  var confirmMsg = {
    desactiver: isAr ? 'تعطيل هذا الحساب ؟' : 'Désactiver ce contact ?',
    supprimer: isAr ? 'حذف نهائياً ؟' : 'Supprimer définitivement ?',
    reactiver: isAr ? 'إعادة تفعيل ؟' : 'Réactiver ce contact ?'
  };
  if (!confirm(confirmMsg[action] || 'Confirmer ?')) return;
  try {
    var res = await apiFetch('/api/supervision/annuaire/' + uid + '?action=' + action, {
      method: 'DELETE', headers: authHeaders()
    });
    var data = await res.json();
    if (data.ok) {
      showToast(t('admin.fait'));
      annuaireLoad();
    } else {
      showToast(data.erreur || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

function annuaireOpenFiche(userId) {
  showView('annuaire');
  setTimeout(function() {
    var el = document.getElementById('annuaire-' + userId);
    if (el) { el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.boxShadow = '0 0 0 3px var(--teal)'; setTimeout(function(){el.style.boxShadow='';},2000); }
  }, 800);
}

function sdcToggle(id) {
  var el = document.getElementById(id);
  if (!el) return;
  var isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : '';
  var arrow = el.parentElement.querySelector('[style*="font-size:14px"]');
  if (arrow) arrow.textContent = isOpen ? '▸' : '▾';
}

window._sdcOrgPerfData = [];
function sdcOrgPerfRender() {
  var sortEl = document.getElementById('sdc-orgperf-sort');
  var sortBy = sortEl ? sortEl.value : 'dossiers_recus';
  var sorted = window._sdcOrgPerfData.slice().sort(function(a, b) {
    if (sortBy === 'taux_resolution') return b.taux_resolution - a.taux_resolution;
    if (sortBy === 'temps_moyen_h') return (b.temps_moyen_h||0) - (a.temps_moyen_h||0);
    if (sortBy === 'en_retard') return b.en_retard - a.en_retard;
    return b.dossiers_recus - a.dossiers_recus;
  });
  var isAr = currentLang === 'ar';
  var typeLabels = { epic: 'EPIC', service: 'Service', direction: 'Direction', cabinet: 'Cabinet', wilaya: 'Wilaya' };
  var tbody = document.getElementById('sdc-orgperf-tbody');
  if (!tbody) return;
  if (!sorted.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:16px;text-align:center;color:var(--muted);">' + (isAr ? 'لا توجد بيانات' : 'Aucune donnée') + '</td></tr>';
    return;
  }
  tbody.innerHTML = sorted.map(function(o) {
    var resColor = o.taux_resolution >= 80 ? '#16a34a' : o.taux_resolution >= 50 ? '#f97316' : '#EF4444';
    var retardColor = o.en_retard > 0 ? '#EF4444' : 'var(--muted)';
    return '<tr style="border-bottom:1px solid var(--line);cursor:pointer;transition:background 0.15s;" onclick="orgPerfOpenDetail(' + o.organisation_id + ',\'' + escHtml(arF(o.nom_ar,o.nom)).replace(/'/g,'\\x27') + '\')" onmouseover="this.style.background=\'var(--gray-50)\'" onmouseout="this.style.background=\'transparent\'">' +
      '<td style="padding:8px 10px;font-weight:600;color:var(--navy);">' + escHtml(arF(o.nom_ar,o.nom)) + '</td>' +
      '<td style="padding:8px 10px;"><span style="font-size:10px;padding:2px 6px;border-radius:6px;background:var(--blue-light);color:var(--blue);font-weight:600;">' + escHtml(typeLabels[o.type]||o.type) + '</span></td>' +
      '<td style="padding:8px 10px;text-align:right;font-weight:700;">' + o.dossiers_recus + '</td>' +
      '<td style="padding:8px 10px;text-align:right;">' + (o.temps_moyen_h ? o.temps_moyen_h + 'h' : '—') + '</td>' +
      '<td style="padding:8px 10px;text-align:right;font-weight:600;color:' + resColor + ';">' + o.taux_resolution + '%</td>' +
      '<td style="padding:8px 10px;text-align:right;font-weight:600;color:' + retardColor + ';">' + o.en_retard + '</td></tr>';
  }).join('');
}

async function initBoExecutive() {
  var u = currentUser || {};
  var isCommune = hasNiveau('commune');
  var isAr = currentLang === 'ar';
  var communeNom = '', communeLat = 36.7753, communeLng = 3.0588;

  var communeNomAr = '';
  if (isCommune && u.commune_id && communes.length) {
    var c = communes.find(function(x) { return x.id === u.commune_id; });
    if (c) {
      communeNom = c.nom;
      communeNomAr = c.nom_ar || c.nom;
      if (c.centre_lat) communeLat = c.centre_lat;
      if (c.centre_lng) communeLng = c.centre_lng;
    }
  }

  // Bandeau
  var nameEl = document.getElementById('exec-name');
  if (nameEl) {
    if (isCommune) {
      nameEl.textContent = isAr
        ? 'قاعة القيادة — بلدية ' + communeNomAr
        : 'Salle de Commandement — APC de ' + communeNom;
    } else {
      nameEl.textContent = isAr
        ? 'قاعة القيادة — الولاية' : 'Salle de Commandement — Wilaya';
    }
  }
  // Mettre à jour aussi le label sidebar
  var spanSdc = document.getElementById('sidebar-sdc-label');
  if (spanSdc) {
    if (isCommune) {
      spanSdc.textContent = isAr ? 'قاعة القيادة — بلدية ' + communeNomAr : 'Salle de Commandement — APC de ' + communeNom;
    } else {
      spanSdc.textContent = isAr ? 'قاعة القيادة — الولاية' : 'Salle de Commandement — Wilaya';
    }
  }
  var subtitleEl = document.getElementById('exec-subtitle');
  if (subtitleEl) subtitleEl.textContent = isAr
    ? 'رؤية موحدة للإقليم — مساعدة على اتخاذ القرار'
    : 'Vision consolidée du territoire — aide à la décision.';
  var dateEl = document.getElementById('exec-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString(isAr ? 'ar-DZ' : 'fr-DZ', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

  // Filtre commune
  var sel = document.getElementById('exec-filter-commune');
  if (sel) {
    if (isCommune) {
      sel.style.display = 'none';
      sel.value = u.commune_id || '';
    } else {
      sel.style.display = '';
      if (sel.options.length <= 1 && communes.length) {
        communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; o.style.color = '#333'; sel.appendChild(o); });
      }
    }
  }

  // Masquer communes-card pour commune
  var comCard = document.getElementById('exec-communes-card');
  if (comCard) comCard.style.display = isCommune ? 'none' : '';

  // Init carte
  var mapEl = document.getElementById('exec-map');
  var defaultCenter = isCommune ? [communeLat, communeLng] : [36.7538, 3.0588];
  var defaultZoom = isCommune ? 14 : 11;
  if (mapEl && !execMap) {
    execMap = L.map('exec-map').setView(defaultCenter, defaultZoom);
    createTileLayer(execMap);
  }
  if (execMap) {
    if (isCommune) execMap.setView(defaultCenter, defaultZoom);
    setTimeout(function() { execMap.invalidateSize(); }, 300);
    setTimeout(function() { execMap.invalidateSize(); }, 800);
  }

  await execLoad();
}

function execToggleLayer(layer) {
  var cb = document.getElementById('exec-layer-' + layer);
  execMapLayers[layer] = cb ? cb.checked : false;
  execRenderMapMarkers();
}

function execRenderMapMarkers() {
  if (!execMap) return;
  execMapMarkers.forEach(function(m) { execMap.removeLayer(m); });
  execMapMarkers = [];

  if (!window._execMapData) return;
  var data = window._execMapData;

  data.forEach(function(s) {
    if (!s.lat || !s.lng) return;
    var lat = parseFloat(s.lat), lng = parseFloat(s.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    var etat = s.etat || 'recu';
    var crit = s.criticite || 'moyenne';
    var isUrgent = crit === 'haute';
    var isHorsDelai = s._horsDelai;

    // Filtrage par couches
    var show = false;
    if (execMapLayers.tous) show = true;
    if (execMapLayers.urgences && isUrgent) show = true;
    if (execMapLayers.horsdelai && isHorsDelai) show = true;
    if (execMapLayers.cap && etat === 'cap') show = true;
    if (!show) return;

    var color = isHorsDelai ? '#EF4444' : isUrgent ? '#F59E0B' : etatMarkerColor(etat);
    var size = (isUrgent || isHorsDelai) ? 16 : 12;
    var icon = L.divIcon({
      html: '<div style="width:'+size+'px;height:'+size+'px;background:'+color+';border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>',
      className: '', iconSize: [size+4, size+4], iconAnchor: [(size+4)/2, (size+4)/2]
    });
    var m = L.marker([lat, lng], { icon: icon }).addTo(execMap);
    var etatL = currentLang==='ar' ? {recu:'مستلم',transmis:'محوّل',pris_en_charge:'تم التكفل',en_intervention:'قيد التدخل',a_valider:'في انتظار المصادقة',resolu:'محلول',rejete:'غير مقبول'} : {recu:'Reçu',transmis:'Transmis',pris_en_charge:'Pris en charge',en_intervention:'En intervention',a_valider:'À valider',resolu:'Résolu',rejete:'Rejeté'};
    m.bindPopup('<div style="font-family:Inter,sans-serif;font-size:12px;min-width:160px;">' +
      '<strong>' + escHtml(s.sous_categorie_a_affiner ? sigFamilleLabel(s.categorie_famille) : (arF(s.categorie_nom_ar, s.categorie_nom) || s.categorie || '—')) + '</strong><br>' +
      '<span style="color:var(--muted);">📍 ' + escHtml(arF(s.commune_nom_ar, s.commune_nom) || s.commune || '—') + '</span><br>' +
      '<span style="padding:2px 6px;border-radius:8px;font-size:10px;font-weight:600;background:' + color + '22;color:' + color + ';">' + (etatL[etat] || etat) + '</span>' +
      (isHorsDelai ? ' <span style="color:#EF4444;font-size:10px;font-weight:700;">' + (currentLang==='ar'?'خارج الآجال':'HORS DÉLAI') + '</span>' : '') +
      (isUrgent ? ' <span style="color:#F59E0B;font-size:10px;font-weight:700;">' + (currentLang==='ar'?'مستعجل':'URGENT') + '</span>' : '') +
      '<br><span style="font-size:10px;color:var(--muted);">' + fmtDate(s.cree_le || s.created_at) + '</span>' +
    '</div>');
    execMapMarkers.push(m);
  });
}

async function execLoad() {
  var communeId = (document.getElementById('exec-filter-commune') || {}).value || '';
  var qs = communeId ? '?communeId=' + communeId : '';
  var qsAmp = communeId ? '&communeId=' + communeId : '';
  var isAr = currentLang === 'ar';
  var lastEl = document.getElementById('exec-last-updated');
  if (lastEl) lastEl.textContent = (isAr ? 'آخر تحديث : ' : 'Mis à jour : ') + new Date().toLocaleTimeString(isAr ? 'ar-DZ' : 'fr-DZ', {hour:'2-digit',minute:'2-digit'});

  // ── Badge filtre périmètre ──
  var badgeEl = document.getElementById('exec-filter-badge');
  var badgeText = document.getElementById('exec-filter-badge-text');
  if (badgeEl && badgeText) {
    if (communeId && !hasNiveau('commune')) {
      var sel = document.getElementById('exec-filter-commune');
      var communeLabel = sel ? sel.options[sel.selectedIndex].text : '';
      badgeText.textContent = (isAr ? 'النطاق : ' : 'Périmètre : ') + communeLabel;
      badgeEl.style.display = '';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  // ── KPIs ──
  var ouv = 0, resolus = 0, eng = 0, acrit = 0;
  var _sdcLoadError = false;
  try {
    var kpis = await safeFetchJSON('/api/supervision/kpis' + qs, {}, true);
    ouv = kpis.ouverts || 0;
    resolus = kpis.resolus_aujourdhui || 0;
    eng = kpis.engagement_pct || 0;
    acrit = kpis.alertes_critiques || 0;
  } catch(e) { console.warn('[sdc] échec chargement KPIs:', e.message); _sdcLoadError = true; }

  // 4 compteurs
  var kpiEl = document.getElementById('exec-kpis');
  if (kpiEl) {
    var kpiCard = function(val, label, color) {
      return '<div style="background:white;border:1px solid var(--line);border-radius:12px;padding:14px 10px;text-align:center;border-top:3px solid ' + color + ';">' +
        '<div style="font-size:24px;font-weight:800;color:var(--navy);">' + val + '</div>' +
        '<div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;">' + label + '</div></div>';
    };
    kpiEl.innerHTML =
      kpiCard(ouv, isAr ? 'مفتوحة' : 'Ouverts', '#2563eb') +
      kpiCard(resolus, isAr ? 'محلولة اليوم' : 'Résolus', '#16a34a') +
      kpiCard(eng + '%', isAr ? 'التزام' : 'Engagement', eng >= 80 ? '#16a34a' : eng >= 50 ? '#f97316' : '#EF4444') +
      kpiCard(acrit, isAr ? 'تنبيهات' : 'Alertes', acrit > 0 ? '#EF4444' : '#16a34a');
  }

  // Indicateur d'erreur SdC
  if (_sdcLoadError && kpiEl) {
    kpiEl.innerHTML = '<div style="grid-column:1/-1;padding:16px;background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;text-align:center;font-size:13px;color:#991b1b;">' + t('global.erreur_chargement_donnees') + '</div>';
  }

  // ICUA gauge
  var icuaScore = 0;
  try { var icuaData = await safeFetchJSON('/api/dashboard/icua', {}, true); icuaScore = Math.round(icuaData.icua || 0); } catch(e) { console.warn('[sdc] échec chargement ICUA:', e.message); _sdcLoadError = true; }
  var icuaColor = icuaScore >= 75 ? '#16a34a' : icuaScore >= 50 ? '#f97316' : '#EF4444';
  var icuaLabel = icuaScore >= 75 ? (isAr ? 'مدينة مدنية' : 'Ville civique') : icuaScore >= 50 ? (isAr ? 'تحت المراقبة' : 'À surveiller') : (isAr ? 'أولوية' : 'Prioritaire');
  var arcEl = document.getElementById('exec-icua-arc');
  if (arcEl) { arcEl.setAttribute('stroke-dasharray', Math.round((icuaScore / 100) * 327) + ' 327'); arcEl.setAttribute('stroke', icuaColor); }
  var scoreEl = document.getElementById('exec-icua-score');
  if (scoreEl) { scoreEl.textContent = icuaScore; scoreEl.style.color = icuaColor; }
  var iLabelEl = document.getElementById('exec-icua-label');
  if (iLabelEl) { iLabelEl.textContent = icuaLabel; iLabelEl.style.color = icuaColor; }

  // ── Construire les situations prioritaires D'ABORD (avant le feu) ──
  var cards = [];

  // Alertes (hors délai, CAP bloqués) — avec filtre commune
  try {
    var alertes = await safeFetchJSON('/api/supervision/alertes' + qs, {}, true);
    if (alertes.hors_delai && alertes.hors_delai.length) {
      alertes.hors_delai.slice(0,3).forEach(function(a) {
        cards.push({ icon: '🔴', severity: 'critique',
          text: (isAr ? 'الملف #' : 'Dossier #') + escHtml(a.reference||'') + (isAr ? ' خارج الآجال — ' : ' hors délai — ') + escHtml(a.commune||'') + ' · ' + escHtml(a.categorie||''),
          id: a.id, bg: '#fee2e2', border: '#EF4444' });
      });
    }
    if (alertes.cap_bloque && alertes.cap_bloque.length) {
      alertes.cap_bloque.slice(0,2).forEach(function(a) {
        cards.push({ icon: '🟣', severity: 'critique',
          text: (isAr ? 'تدخل CAP محظور — #' : 'Intervention CAP bloquée — #') + escHtml(a.reference||'') + ' · ' + escHtml(a.motif_blocage||''),
          id: a.signalement_id || a.id, bg: '#F5F3FF', border: '#8b5cf6' });
      });
    }
  } catch(e) { console.warn('[sdc] échec chargement alertes:', e.message); }

  // Services défaillants — avec filtre commune
  var servicesData = [];
  try {
    servicesData = await safeFetchJSON('/api/supervision/services' + qs, {}, true);
    servicesData.filter(function(s) { return (s.engagement_pct||100) < 60; }).slice(0,2).forEach(function(s) {
      cards.push({ icon: '🟠', severity: 'warning',
        text: (isAr ? 'المصلحة ' : 'Service ') + '<strong>' + escHtml(s.service) + '</strong>' + (isAr ? ' — التزام ' : ' — engagement ') + (s.engagement_pct||0) + '%',
        id: null, bg: '#fff7ed', border: '#f97316' });
    });
    var sEl = document.getElementById('exec-services');
    if (sEl) {
      var sHtml = servicesData.filter(function(s){return (s.engagement_pct||100) < 80;}).map(function(s) {
        var slaClass = (s.engagement_pct||0) >= 50 ? 'ops-sla-warn' : 'ops-sla-breach';
        var _slaDef = (currentLang==='ar'&&ACRONYMES_AR.SLA)?ACRONYMES_AR.SLA:ACRONYMES_FR.SLA;
        return '<div style="padding:6px 0;border-bottom:1px solid var(--ops-border);display:flex;justify-content:space-between;align-items:center;"><div><span style="font-weight:600;font-size:12px;">' + escHtml(s.service||'') + '</span><span style="font-size:11px;color:var(--muted);margin-left:6px;">' + (s.signalements||0) + ' sig.</span></div><span class="ops-sla ' + slaClass + '" title="' + escHtml(_slaDef) + '">' + (s.engagement_pct||0) + '%</span></div>';
      }).join('');
      sEl.innerHTML = sHtml || '<div style="padding:12px;font-size:12px;color:var(--muted);">' + (isAr ? 'جميع المصالح منتظمة' : 'Tous les services sont conformes.') + '</div>';
    }
  } catch(e) { console.warn('[sdc] échec chargement services:', e.message); }

  // Demandes d'explication expirées — avec filtre commune
  try {
    var demandes = await safeFetchJSON('/api/supervision/demandes-explication?statut=en_retard' + qsAmp, {}, true);
    if (Array.isArray(demandes) && demandes.length) {
      demandes.slice(0,2).forEach(function(d) {
        cards.push({ icon: '⏰', severity: 'warning',
          text: (isAr ? 'طلب توضيح بدون رد — #' : 'Demande d\'explication sans réponse — #') + escHtml(d.reference||'') + ' · ' + escHtml(d.organisation_nom||''),
          id: d.signalement_id, bg: '#fef3c7', border: '#eab308' });
      });
    }
  } catch(e) { console.warn('[sdc] échec chargement demandes explication:', e.message); }

  cards = cards.filter(function(c) { return c.id; }).slice(0,5); // Anti-orphan: no card without valid dossier ID

  // ── FEU TRICOLORE — basé sur les cartes réelles ──
  var hasCritique = cards.some(function(c) { return c.severity === 'critique'; });
  var hasWarning = cards.some(function(c) { return c.severity === 'warning'; });
  var sitEl = document.getElementById('exec-situation-indicator');
  var feuEl = document.getElementById('exec-feu');
  var sitLabel = document.getElementById('exec-situation-label');
  var causesEl = document.getElementById('exec-situation-causes');

  if (sitEl) {
    if (hasCritique) {
      sitEl.style.background = '#fee2e2'; sitEl.style.color = '#991b1b'; sitEl.style.borderColor = '#fca5a5';
      if (feuEl) feuEl.textContent = '🔴';
      if (sitLabel) sitLabel.textContent = isAr ? 'وضع حرج' : 'Situation critique';
    } else if (hasWarning || cards.length > 0) {
      sitEl.style.background = '#fef3c7'; sitEl.style.color = '#92400e'; sitEl.style.borderColor = '#fde68a';
      if (feuEl) feuEl.textContent = '🟠';
      if (sitLabel) sitLabel.textContent = isAr ? 'وضع تحت المراقبة' : 'Sous vigilance';
    } else {
      sitEl.style.background = '#f0fdf4'; sitEl.style.color = '#166534'; sitEl.style.borderColor = '#bbf7d0';
      if (feuEl) feuEl.textContent = '🟢';
      if (sitLabel) sitLabel.textContent = isAr ? 'وضع مُتحكَّم فيه' : 'Situation maîtrisée';
    }
  }
  if (causesEl) {
    if (cards.length === 0) {
      causesEl.textContent = isAr ? 'سير عادي. لا توجد حالات ذات أولوية.' : 'Fonctionnement nominal. Aucune situation prioritaire.';
    } else {
      var desc = [];
      var nbCrit = cards.filter(function(c){return c.severity==='critique';}).length;
      var nbWarn = cards.filter(function(c){return c.severity==='warning';}).length;
      if (nbCrit) desc.push(nbCrit + (isAr ? ' حالة حرجة' : ' situation' + (nbCrit>1?'s':'') + ' critique' + (nbCrit>1?'s':'')));
      if (nbWarn) desc.push(nbWarn + (isAr ? ' تحت المراقبة' : ' sous vigilance'));
      causesEl.textContent = (isAr ? 'تحت المراقبة : ' : 'Sous vigilance : ') + desc.join(', ');
    }
  }

  // ── Afficher les cartes situations ──
  var sitList = document.getElementById('exec-situations-list');
  if (sitList) {
    if (cards.length) {
      sitList.innerHTML = cards.map(function(c) {
        var btns = '';
        if (c.id) btns += '<button class="btn btn-sm btn-outline" onclick="supOpenDrawer(\'' + c.id + '\')" style="font-size:10px;">' + (isAr ? 'فتح' : 'Ouvrir') + '</button>';
        if (c.id) btns += '<button class="btn btn-sm btn-outline" onclick="supCommentaire(\'relance\',\'' + (isAr ? 'إعادة تنبيه' : 'Relancer') + '\',\'' + (isAr ? 'تمت الإعادة' : 'Relance envoyée.') + '\')" style="font-size:10px;">' + (isAr ? 'إعادة' : 'Relancer') + '</button>';
        if (c.id) btns += '<button class="btn btn-sm btn-outline" onclick="supDemanderExplication(\'' + c.id + '\')" style="font-size:10px;">' + (isAr ? 'طلب توضيح' : 'Explication') + '</button>';
        return '<div style="background:' + c.bg + ';border:1px solid ' + c.border + ';border-left:4px solid ' + c.border + ';border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
          '<div style="display:flex;gap:8px;align-items:flex-start;flex:1;"><span style="font-size:18px;line-height:1;">' + c.icon + '</span><div style="font-size:12px;color:var(--navy);line-height:1.5;">' + c.text + '</div></div>' +
          (btns ? '<div style="display:flex;gap:4px;flex-shrink:0;">' + btns + '</div>' : '') + '</div>';
      }).join('');
    } else {
      sitList.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">' +
        (isAr ? 'لا توجد حالات ذات أولوية على هذا النطاق.' : (communeId ? 'Aucune situation prioritaire sur ce périmètre.' : 'Aucune situation prioritaire.')) + '</div>';
    }
  }

  // ── SECTION 1 : Répartitions (par commune / organisation / domaine) ──
  try {
    var cockpitData = await safeFetchJSON('/api/supervision/cockpit?periode=30j' + qsAmp, {}, true);
    var repCommunes = document.getElementById('sdc-rep-communes');
    var repOrgs = document.getElementById('sdc-rep-organisations');
    var repDomaines = document.getElementById('sdc-rep-domaines');
    var domaineLabels = currentLang==='ar' ? {eau:'المياه',proprete:'النظافة',general:'عام',voirie:'الطرقات',eclairage:'الإنارة',espaces_verts:'مساحات خضراء',stationnement:'التوقف'} : {eau:'Eau',proprete:'Propreté',general:'Général',voirie:'Voirie',eclairage:'Éclairage',espaces_verts:'Espaces verts',stationnement:'Stationnement'};

    // Masquer la colonne commune pour superviseur communal
    var repGrid = document.getElementById('sdc-repartitions-grid');
    if (repGrid && hasNiveau('commune')) {
      repGrid.style.gridTemplateColumns = '1fr 1fr';
      if (repGrid.children[0]) repGrid.children[0].style.display = 'none';
    }

    if (repCommunes) {
      repCommunes.innerHTML = (cockpitData.repartitions.communes||[]).map(function(c) {
        return '<div style="display:flex;justify-content:space-between;padding:6px 8px;border-bottom:1px solid var(--line);border-radius:4px;"><span style="font-weight:600;color:var(--navy);font-size:12px;">' + escHtml(arF(c.nom_ar,c.nom)) + '</span><span style="color:var(--muted);font-weight:700;font-size:12px;">' + c.total + '</span></div>';
      }).join('') || '<div style="color:var(--muted);font-size:11px;">—</div>';
    }
    if (repOrgs) {
      repOrgs.innerHTML = (cockpitData.repartitions.organisations||[]).map(function(o) {
        var oName = (isAr && o.nom_ar) ? o.nom_ar : o.nom;
        return '<div onclick="orgPerfOpenDetail(' + o.id + ',\'' + escHtml(oName).replace(/'/g,'\\x27') + '\')" style="display:flex;justify-content:space-between;padding:6px 8px;border-bottom:1px solid var(--line);cursor:pointer;border-radius:4px;transition:background 0.15s;" onmouseover="this.style.background=\'var(--gray-50)\'" onmouseout="this.style.background=\'transparent\'"><span style="font-weight:600;color:var(--navy);font-size:12px;">' + escHtml(oName) + '</span><span style="color:var(--muted);font-weight:700;font-size:12px;">' + o.total + '</span></div>';
      }).join('') || '<div style="color:var(--muted);font-size:11px;">—</div>';
    }
    if (repDomaines) {
      repDomaines.innerHTML = (cockpitData.repartitions.domaines||[]).map(function(d) {
        var label = domaineLabels[d.domaine] || d.domaine;
        return '<div style="display:flex;justify-content:space-between;padding:6px 8px;border-bottom:1px solid var(--line);"><span style="font-weight:600;color:var(--navy);font-size:12px;">' + escHtml(label) + '</span><span style="color:var(--muted);font-weight:700;font-size:12px;">' + d.total + '</span></div>';
      }).join('') || '<div style="color:var(--muted);font-size:11px;">—</div>';
    }
  } catch(e) { console.warn('[sdc] échec chargement répartitions:', e.message); }

  // ── SECTION 2 : Communes table ──
  try {
    var comData = await safeFetchJSON('/api/supervision/communes', {}, true);
    comData.sort(function(a,b) { return (a.engagement_pct||100)-(b.engagement_pct||100); });
    var cbEl = document.getElementById('exec-communes-body');
    if (cbEl) cbEl.innerHTML = comData.length ?
      comData.map(function(c) {
        var slaClass = (c.engagement_pct||0) >= 80 ? 'ops-sla-ok' : (c.engagement_pct||0) >= 50 ? 'ops-sla-warn' : 'ops-sla-breach';
        var _slaDef2 = (currentLang==='ar'&&ACRONYMES_AR.SLA)?ACRONYMES_AR.SLA:ACRONYMES_FR.SLA;
        return '<tr><td style="font-weight:600;">' + escHtml(c.commune||'') + '</td><td>' + (c.ouverts||0) + '</td><td>' + (c.delai_moyen||'—') + 'h</td><td><span class="ops-sla ' + slaClass + '" title="' + escHtml(_slaDef2) + '">' + (c.engagement_pct||0) + '%</span></td></tr>';
      }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--muted);">—</td></tr>';
  } catch(e) { console.warn('[sdc] échec chargement communes:', e.message); }

  // ── SECTION 3 : Performance des organisations ──
  try {
    var orgPerfRes = await safeFetchJSON('/api/supervision/organisations-performance?periode=30j' + qsAmp, {}, true);
    window._sdcOrgPerfData = orgPerfRes.organisations || [];
    sdcOrgPerfRender();
  } catch(e) { console.warn('[sdc] échec chargement performance organisations:', e.message); }

  // ── SECTION 4 : Performance CAP ──
  try {
    var capPerfRes = await safeFetchJSON('/api/supervision/cap-performance?periode=30j' + qsAmp, {}, true);
    var capCards = document.getElementById('sdc-capperf-cards');
    var agents = capPerfRes.agents || [];
    if (capCards) {
      if (agents.length) {
        capCards.innerHTML = agents.map(function(a) {
          var name = (a.prenom||'') + ' ' + (a.nom||'');
          var taux = a.missions_total > 0 ? Math.round((a.missions_realisees / a.missions_total) * 100) : 0;
          var tc = taux >= 80 ? '#16a34a' : taux >= 50 ? '#f97316' : '#EF4444';
          return '<div style="background:var(--gray-50);border:1px solid var(--line);border-radius:10px;padding:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
              '<div style="font-size:13px;font-weight:700;color:var(--navy);">' + escHtml(name.trim()||'Agent CAP') + '</div>' +
              '<div style="font-size:18px;font-weight:800;color:' + tc + ';">' + taux + '%</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:10px;text-align:center;">' +
              '<div><span style="font-weight:700;color:#16a34a;">' + (a.missions_realisees||0) + '</span><br>' + (isAr ? 'منجزة' : 'Réalisées') + '</div>' +
              '<div><span style="font-weight:700;color:#2563eb;">' + (a.missions_en_cours||0) + '</span><br>' + (isAr ? 'جارية' : 'En cours') + '</div>' +
              '<div><span style="font-weight:700;color:#EF4444;">' + (a.missions_bloquees||0) + '</span><br>' + (isAr ? 'محظورة' : 'Bloquées') + '</div>' +
              '<div><span style="font-weight:700;color:#8b5cf6;">' + (a.temps_moyen_min ? a.temps_moyen_min + 'min' : '—') + '</span><br>' + (isAr ? 'متوسط' : 'Moy.') + '</div>' +
            '</div></div>';
        }).join('');
      } else {
        capCards.innerHTML = '<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px;">' + (isAr ? 'لا يوجد نشاط CAP' : 'Aucun agent CAP actif.') + '</div>';
      }
    }
  } catch(e) { console.warn('[sdc] échec chargement performance CAP:', e.message); }

  // ── SECTION 4B : Les 3 EPIC en un coup d'œil ──
  try {
    var epicEl = document.getElementById('sdc-epic-cards');
    if (epicEl) {
      var ekpi = function(val, label, color) {
        return '<div style="text-align:center;"><div style="font-size:18px;font-weight:800;color:' + color + ';">' + val + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;">' + label + '</div></div>';
      };
      var epicCard = function(title, icon, kpis) {
        return '<div style="background:white;border:1px solid var(--line);border-radius:12px;padding:14px;border-top:3px solid #063B5A;">' +
          '<div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:10px;">' + icon + ' ' + title + '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(' + Math.min(kpis.length, 3) + ',1fr);gap:6px;">' + kpis.join('') + '</div></div>';
      };
      // Helper: build signalement EPIC card from cockpit repartitions
      var repOrgs = (cockpitData && cockpitData.repartitions && cockpitData.repartitions.organisations) || [];
      function sigEpicKpis(keyword) {
        var org = repOrgs.find(function(o) { return o.nom && o.nom.includes(keyword); });
        return org ? [
          ekpi(org.en_cours || 0, isAr ? 'جارية' : 'En cours', '#2563eb'),
          ekpi(org.resolus || 0, isAr ? 'محلولة' : 'Résolus', '#16a34a'),
          ekpi(org.en_retard || 0, isAr ? 'متأخرة' : 'En retard', (org.en_retard || 0) > 0 ? '#EF4444' : '#16a34a')
        ] : [ekpi(0, isAr ? 'جارية' : 'En cours', '#94a3b8'), ekpi(0, isAr ? 'محلولة' : 'Résolus', '#94a3b8'), ekpi(0, isAr ? 'متأخرة' : 'En retard', '#94a3b8')];
      }
      var eauKpis = sigEpicKpis('Eau');
      var propreteKpis = sigEpicKpis('Propreté');
      var voirieKpis = sigEpicKpis('Voirie');
      // Parkings
      var pkStats = await safeFetchJSON('/api/civipark/encaissements/stats', {}, true).catch(function(){ return {}; });
      var pkCartes = 0; try { var crs = await safeFetchJSON('/api/civipark/cartes', {headers: authHeaders()}, true); pkCartes = (crs||[]).filter(function(c){return c.statut==='active';}).length; } catch(e){ console.warn('[sdc] échec chargement cartes CiviPark:', e.message); }
      var pkClotures = 0; try { var cls = await safeFetchJSON('/api/civipark/clotures', {headers: authHeaders()}, true); var lastCl = (cls||[]).find(function(c){return c.ecart!=0;}); pkClotures = lastCl ? lastCl.ecart : 0; } catch(e){ console.warn('[sdc] échec chargement clôtures CiviPark:', e.message); }
      var pkKpis = [
        ekpi(pkStats.total_encaissements || 0, isAr ? 'تحصيلات' : 'Encaissements', '#2563eb'),
        ekpi(pkCartes, isAr ? 'بطاقات' : 'Cartes actives', '#16a34a'),
        ekpi((pkClotures > 0 ? '+' : '') + pkClotures + ' DA', isAr ? 'فارق' : 'Écart caisse', pkClotures != 0 ? '#EF4444' : '#16a34a')
      ];
      // Régie foncière
      var patri = await safeFetchJSON('/api/patrimoine/dashboard', {headers: authHeaders()}, true).catch(function(){ return {}; });
      var rfKpis = [
        ekpi(patri.total || 0, isAr ? 'عقارات' : 'Biens', '#2563eb'),
        ekpi((patri.taux_occupation || 0) + '%', isAr ? 'إشغال' : 'Occupation', (patri.taux_occupation||0) >= 50 ? '#16a34a' : '#f97316'),
        ekpi(Number(patri.loyers_mois || 0).toLocaleString('fr-DZ'), isAr ? 'إيجارات' : 'Loyers/mois', '#063B5A'),
        ekpi(patri.contrats_expirant || 0, isAr ? 'تنتهي' : 'Expirent', (patri.contrats_expirant||0) > 0 ? '#EF4444' : '#16a34a')
      ];
      epicEl.innerHTML =
        epicCard(isAr ? 'المياه' : 'Eau', '💧', eauKpis) +
        epicCard(isAr ? 'النظافة' : 'Propreté', '🧹', propreteKpis) +
        epicCard(isAr ? 'الطرقات' : 'Voirie', '🛣️', voirieKpis) +
        epicCard(isAr ? 'مواقف' : 'Parkings', '🅿️', pkKpis) +
        epicCard(isAr ? 'العقارات' : 'Régie foncière', '🏛️', rfKpis);
    }
  } catch(e) { console.warn('EPIC cards error:', e); }

  // ── SECTION 5 : Indicateurs ICUA détaillés ──
  try {
    var icuaFull = await safeFetchJSON('/api/dashboard/icua', {}, true);
    var dims = icuaFull.dimensions || {};
    var dimLabels = {
      proprete: isAr ? 'النظافة' : 'Propreté',
      reactivite: isAr ? 'الاستجابة' : 'Réactivité',
      vivre_ensemble: isAr ? 'العيش المشترك' : 'Vivre Ensemble',
      fluidite: isAr ? 'السيولة' : 'Fluidité',
      engagement: isAr ? 'الالتزام' : 'Engagement'
    };
    // Progress bars
    var dimsEl = document.getElementById('sdc-icua-dims');
    if (dimsEl) {
      dimsEl.innerHTML = Object.entries(dimLabels).map(function(e) {
        var val = Math.round(dims[e[0]] || 0);
        var col = val >= 75 ? '#16a34a' : val >= 50 ? '#f97316' : '#EF4444';
        return '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;"><span style="color:var(--navy);font-weight:600;">' + e[1] + '</span><span style="color:' + col + ';font-weight:700;">' + val + '%</span></div>' +
          '<div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + val + '%;background:' + col + ';border-radius:3px;transition:width 0.5s;"></div></div></div>';
      }).join('');
    }
    // Radar chart
    var radarCtx = document.getElementById('sdc-icua-radar');
    if (radarCtx && typeof Chart !== 'undefined') {
      if (window._sdcIcuaChart) window._sdcIcuaChart.destroy();
      window._sdcIcuaChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: Object.values(dimLabels),
          datasets: [{ label: 'ICUA', data: ['proprete','reactivite','vivre_ensemble','fluidite','engagement'].map(function(k){return dims[k]||0;}),
            backgroundColor: 'rgba(10,61,98,0.15)', borderColor: '#0A3D62', borderWidth: 2, pointBackgroundColor: '#E1A730', pointRadius: 4 }]
        },
        options: { scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } }, plugins: { legend: { display: false } } }
      });
    }
  } catch(e) { console.warn('[sdc] échec chargement radar ICUA:', e.message); }
  // Synthèse signalements
  try {
    var synthese = await safeFetchJSON('/api/dashboard/synthese', {}, true);
    var synEl = document.getElementById('sdc-icua-synthese');
    if (synEl && synthese) {
      var synHtml = '';
      if (synthese.par_domaine && synthese.par_domaine.length) {
        synHtml += '<div style="margin-bottom:8px;font-size:11px;font-weight:600;color:var(--navy);">' + (isAr ? 'حسب المجال' : 'Par domaine') + '</div>';
        synHtml += synthese.par_domaine.map(function(d) {
          return '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--line);font-size:11px;"><span>' + escHtml(d.domaine||d.label||'—') + '</span><span style="font-weight:700;">' + (d.total||d.count||0) + '</span></div>';
        }).join('');
      }
      if (synthese.par_commune && synthese.par_commune.length) {
        synHtml += '<div style="margin-top:10px;margin-bottom:8px;font-size:11px;font-weight:600;color:var(--navy);">' + (isAr ? 'حسب البلدية' : 'Par commune') + '</div>';
        synHtml += synthese.par_commune.slice(0,8).map(function(c) {
          return '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--line);font-size:11px;"><span>' + escHtml(c.commune||c.label||'—') + '</span><span style="font-weight:700;">' + (c.total||c.count||0) + '</span></div>';
        }).join('');
      }
      synEl.innerHTML = synHtml || '<div style="color:var(--muted);font-size:11px;">' + (isAr ? 'لا توجد بيانات' : 'Aucune donnée') + '</div>';
    }
  } catch(e) { console.warn('[sdc] échec chargement synthèse:', e.message); }

  // ── SECTION 6 : Activité récente (journal lisible) ──
  try {
    var activite = await safeFetchJSON('/api/supervision/activite' + qs, {}, true);
    var actEl = document.getElementById('sdc-activite-list');
    if (actEl) {
      var actionLabels = {
        recu: isAr ? 'إشارة مستلمة' : 'Signalement reçu',
        transmis: isAr ? 'تم الإحالة' : 'Transmis au service',
        pris_en_charge: isAr ? 'أخذ بعين الاعتبار' : 'Pris en charge',
        en_intervention: isAr ? 'تدخل جاري' : 'Intervention en cours',
        a_valider: isAr ? 'في انتظار المصادقة' : 'En attente de validation',
        resolu: isAr ? 'تم الحل' : 'Résolu',
        rejete: isAr ? 'مرفوض' : 'Rejeté',
        relance_service: isAr ? 'إعادة تنبيه المصلحة' : 'Relance du service',
        message_service: isAr ? 'رسالة للمصلحة' : 'Message au service',
        communique_superviseur: isAr ? 'بلاغ المشرف' : 'Communiqué superviseur',
        notification_superviseur: isAr ? 'إشعار المشرف' : 'Notification superviseur',
        urgence_wali: isAr ? 'استعجال والي' : 'Urgence Wali',
        demande_explication: isAr ? 'طلب توضيح' : 'Demande d\'explication',
        reponse_explication: isAr ? 'رد على طلب توضيح' : 'Réponse à demande d\'explication',
        mission_cap: isAr ? 'مهمة CAP' : 'Mission CAP'
      };
      actEl.innerHTML = activite.length ? activite.slice(0,12).map(function(a) {
        var label = actionLabels[a.action] || actionLabels[a.etat] || escHtml(a.action||a.etat||'—');
        var ref = a.reference ? ' — <strong>#' + escHtml(a.reference) + '</strong>' : '';
        var time = fmtDateTime(a.date);
        return '<div style="padding:6px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;">' +
          '<div style="font-size:12px;color:var(--navy);">' + label + ref + (a.commune ? ' · ' + escHtml(a.commune) : '') + '</div>' +
          '<div style="font-size:10px;color:var(--muted);white-space:nowrap;margin-left:8px;">' + time + '</div></div>';
      }).join('') : '<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px;">' + (isAr ? 'لا يوجد نشاط حديث' : 'Aucune activité récente.') + '</div>';
    }
  } catch(e) { console.warn('[sdc] échec chargement activité récente:', e.message); }

  // ── Carte ──
  try {
    var boardQs = communeId ? '?communeId=' + communeId : '';
    var boardRes = await apiFetch('/api/signaler/board' + boardQs, { headers: authHeaders() });
    if (boardRes.ok) {
      var boardData = await boardRes.json();
      var now = Date.now();
      window._execMapData = (Array.isArray(boardData) ? boardData : []).map(function(s) {
        s._horsDelai = s.etat === 'recu' && s.cree_le && (now - new Date(s.cree_le).getTime()) > 48*3600*1000;
        return s;
      });
      execRenderMapMarkers();
      if (communeId && execMap && window._execMapData.length) {
        var pts = window._execMapData.filter(function(s){return s.lat && s.lng;});
        if (pts.length) {
          var bounds = L.latLngBounds(pts.map(function(s){return [parseFloat(s.lat),parseFloat(s.lng)];}));
          execMap.fitBounds(bounds, {padding:[30,30], maxZoom:15});
        }
      } else if (!communeId && execMap && !hasNiveau('commune')) {
        execMap.setView([36.7538, 3.0588], 11);
      }
    }
  } catch(e) { console.warn('[sdc] échec chargement carte:', e.message); }
}

async function adminTab(tab) {
  _adminCurrentTab = tab;
  // Highlight active tab
  document.querySelectorAll('#admin-tabs .admin-tab-btn').forEach(function(b) {
    var active = b.dataset.tab === tab;
    b.className = active ? 'admin-tab-btn active' : 'admin-tab-btn';
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  var el = document.getElementById('admin-content');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Chargement...</div>';

  try {
    var data = await safeFetchJSON('/api/admin/' + tab, {}, true);
    if (!data || (!Array.isArray(data) && !data.length)) { el.innerHTML = '<div class="ops-empty"><div class="ops-empty-icon">📭</div><p class="ops-empty-text">Aucune donnée</p></div>'; return; }

    if (tab === 'config') {
      el.innerHTML = '<table class="ops-table"><thead><tr><th>Clé</th><th>Valeur</th><th>Module</th><th>Modifié</th></tr></thead><tbody>' +
        data.map(function(c) {
          return '<tr><td style="font-weight:600;font-size:12px;">' + escHtml(c.cle) + '</td>' +
            '<td><input type="text" value="' + escHtml(c.valeur) + '" onchange="adminUpdateConfig(\'' + escHtml(c.cle) + '\',this.value)" style="padding:4px 8px;border:1px solid var(--ops-border);border-radius:6px;font-size:12px;width:120px;"></td>' +
            '<td style="font-size:11px;color:var(--muted);">' + escHtml(c.module||'') + '</td>' +
            '<td style="font-size:11px;color:var(--muted);">' + fmtDateTime(c.modifie_le) + '</td></tr>';
        }).join('') + '</tbody></table>';
    } else if (tab === 'utilisateurs') {
      var fnLabels = {citoyen:'Citoyen',agent_traitant:'Agent traitant',cap:'Agent de Proximité',entite_responsable:'Entité responsable',superviseur:'Superviseur'};
      el.innerHTML = '<div style="overflow-x:auto;"><table class="ops-table"><thead><tr><th>Nom</th><th>Téléphone</th><th>Fonction</th><th>Périmètre</th><th>Organisation</th><th>Capacités</th><th>Actif</th><th>Actions</th></tr></thead><tbody>' +
        data.map(function(u) {
          var caps = Array.isArray(u.capacites) ? u.capacites.join(', ') : '';
          return '<tr><td style="font-weight:600;">' + escHtml((u.prenom||'')+' '+(u.nom||'')) + '</td>' +
            '<td style="font-size:11px;">' + escHtml(u.telephone) + '</td>' +
            '<td style="font-size:11px;">' + escHtml(fnLabels[u.fonction] || u.fonction || u.role) + '</td>' +
            '<td style="font-size:11px;">' + escHtml((u.niveau_perimetre||'—') + (u.perimetre_id ? ' #'+u.perimetre_id : '')) + '</td>' +
            '<td style="font-size:11px;">' + escHtml(u.organisation_nom || '—') + '</td>' +
            '<td style="font-size:10px;max-width:140px;word-break:break-all;">' + escHtml(caps || '—') + '</td>' +
            '<td>' + (u.actif ? '🟢' : '🔴') + '</td>' +
            '<td><button class="btn btn-sm btn-outline" onclick="adminToggle(\'utilisateurs\',\'' + u.id + '\',' + (!!u.actif) + ')" style="font-size:10px;">' + (u.actif ? 'Désactiver' : 'Activer') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div style="margin-top:12px;border-top:1px solid var(--line);padding-top:12px;">' +
          '<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px;">Créer un compte</div>' +
          '<div id="admin-user-form" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">' +
            '<input id="adm-u-tel" placeholder="Téléphone *" style="padding:8px;border:1px solid var(--line);border-radius:8px;">' +
            '<input id="adm-u-mdp" placeholder="Mot de passe *" type="password" style="padding:8px;border:1px solid var(--line);border-radius:8px;">' +
            '<input id="adm-u-prenom" placeholder="Prénom" style="padding:8px;border:1px solid var(--line);border-radius:8px;">' +
            '<input id="adm-u-nom" placeholder="Nom" style="padding:8px;border:1px solid var(--line);border-radius:8px;">' +
            '<select id="adm-u-fonction" style="padding:8px;border:1px solid var(--line);border-radius:8px;">' +
              '<option value="citoyen">Citoyen</option>' +
              '<option value="agent_traitant">Agent traitant</option>' +
              '<option value="cap">Agent de Proximité (CAP)</option>' +
              '<option value="entite_responsable">Entité responsable</option>' +
              '<option value="superviseur">Superviseur</option>' +
            '</select>' +
            '<select id="adm-u-niveau" style="padding:8px;border:1px solid var(--line);border-radius:8px;">' +
              '<option value="commune">Commune</option>' +
              '<option value="wilaya">Wilaya</option>' +
              '<option value="entite">Entité</option>' +
              '<option value="quartier">Quartier</option>' +
            '</select>' +
            '<select id="adm-u-org" style="padding:8px;border:1px solid var(--line);border-radius:8px;"><option value="">— Organisation —</option></select>' +
            '<input id="adm-u-caps" placeholder="Capacités (séparées par virgule)" style="padding:8px;border:1px solid var(--line);border-radius:8px;">' +
            '<div style="grid-column:span 2;"><button class="btn btn-primary btn-sm" onclick="adminCreateUser()" style="width:100%;">Créer le compte</button></div>' +
          '</div>' +
        '</div>';
      // Charger les organisations dans le select
      try {
        safeFetchJSON("/api/admin/organisations", {}, true).then(function(orgs) {
          var sel = document.getElementById("adm-u-org");
          if (sel && orgs) orgs.forEach(function(o) { var opt = document.createElement("option"); opt.value = o.id; opt.textContent = (currentLang === 'ar' && o.nom_ar ? o.nom_ar : o.nom) + ' (' + o.type + ')'; sel.appendChild(opt); });
        }).catch(function(e){ console.warn('[admin] échec chargement organisations select:', e.message); });
      } catch(e) { console.warn('[admin] échec init chargement organisations:', e.message); }
    } else if (tab === 'communes') {
      el.innerHTML = '<div style="overflow-x:auto;"><table class="ops-table"><thead><tr><th>Nom</th><th>Nom AR</th><th>Circonscription</th><th>Actif</th><th>Actions</th></tr></thead><tbody>' +
        data.map(function(c) {
          return '<tr><td style="font-weight:600;">' + escHtml(c.nom) + '</td>' +
            '<td>' + escHtml(c.nom_ar||'—') + '</td>' +
            '<td style="font-size:12px;">' + escHtml(c.circonscription_nom||'—') + '</td>' +
            '<td>' + (c.actif!==false ? '🟢' : '🔴') + '</td>' +
            '<td><button class="btn btn-sm btn-outline" onclick="adminEditPrompt(\'communes\',' + c.id + ',[\'nom\',\'nom_ar\'],[\'' + escHtml(c.nom) + '\',\'' + escHtml(c.nom_ar||'') + '\'])" style="font-size:10px;">Modifier</button> ' +
            '<button class="btn btn-sm btn-outline" onclick="adminToggle(\'communes\',' + c.id + ',' + (c.actif!==false) + ')" style="font-size:10px;">' + (c.actif!==false ? 'Désactiver' : 'Activer') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    } else if (tab === 'services') {
      el.innerHTML = '<div style="overflow-x:auto;"><table class="ops-table"><thead><tr><th>Sigle</th><th>Nom</th><th>Catégorie</th><th>Actif</th><th>Actions</th></tr></thead><tbody>' +
        data.map(function(s) {
          return '<tr><td style="font-weight:700;">' + escHtml(s.sigle) + '</td>' +
            '<td>' + escHtml(s.nom) + '</td>' +
            '<td style="font-size:12px;">' + escHtml(s.categorie||'—') + '</td>' +
            '<td>' + (s.actif ? '🟢' : '🔴') + '</td>' +
            '<td><button class="btn btn-sm btn-outline" onclick="adminEditPrompt(\'services\',' + s.id + ',[\'sigle\',\'nom\',\'categorie\'],[\'' + escHtml(s.sigle||'') + '\',\'' + escHtml(s.nom||'') + '\',\'' + escHtml(s.categorie||'') + '\'])" style="font-size:10px;">Modifier</button> ' +
            '<button class="btn btn-sm btn-outline" onclick="adminToggle(\'services\',' + s.id + ',' + (!!s.actif) + ')" style="font-size:10px;">' + (s.actif ? 'Désactiver' : 'Activer') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div style="margin-top:12px;"><button class="btn btn-sm btn-primary" onclick="adminAddService()">+ Ajouter un service</button></div>';
    } else if (tab === 'engagements') {
      el.innerHTML = '<div style="overflow-x:auto;"><table class="ops-table"><thead><tr><th>Catégorie/Famille</th><th>Délai cible</th><th>Vigilance</th><th>Dépassement</th><th>Actif</th><th>Actions</th></tr></thead><tbody>' +
        data.map(function(e) {
          return '<tr><td style="font-weight:600;">' + escHtml(e.categorie_nom||e.famille||'Défaut') + '</td>' +
            '<td>' + e.delai_cible_h + 'h</td>' +
            '<td>' + e.seuil_vigilance_pct + '%</td>' +
            '<td>' + e.seuil_depassement_pct + '%</td>' +
            '<td>' + (e.actif ? '🟢' : '🔴') + '</td>' +
            '<td><button class="btn btn-sm btn-outline" onclick="adminEditEngagement(' + e.id + ',' + e.delai_cible_h + ',' + e.seuil_vigilance_pct + ',' + e.seuil_depassement_pct + ')" style="font-size:10px;">Modifier</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    } else if (tab === 'catalogue-cap') {
      el.innerHTML = '<div style="overflow-x:auto;"><table class="ops-table"><thead><tr><th>Catégorie</th><th>Nom</th><th>Photo</th><th>Géo</th><th>Actif</th><th>Actions</th></tr></thead><tbody>' +
        data.map(function(m) {
          return '<tr><td>' + escHtml(m.categorie) + '</td>' +
            '<td style="font-weight:600;">' + escHtml(m.nom) + '</td>' +
            '<td>' + (m.photo_obligatoire ? '📷' : '—') + '</td>' +
            '<td>' + (m.geo_obligatoire ? '📍' : '—') + '</td>' +
            '<td>' + (m.actif ? '🟢' : '🔴') + '</td>' +
            '<td><button class="btn btn-sm btn-outline" onclick="adminToggle(\'catalogue-cap\',' + m.id + ',' + (!!m.actif) + ')" style="font-size:10px;">' + (m.actif ? 'Désactiver' : 'Activer') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div style="margin-top:12px;"><button class="btn btn-sm btn-primary" onclick="adminAddCatCap()">+ Ajouter un type CAP</button></div>';
    } else if (tab === 'journal') {
      el.innerHTML = '<table class="ops-table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Module</th><th>Détail</th></tr></thead><tbody>' +
        data.map(function(j) {
          return '<tr><td style="font-size:11px;">' + fmtDateTime(j.created_at) + '</td>' +
            '<td style="font-size:12px;">' + escHtml((j.prenom||'')+' '+(j.nom||'')) + '</td>' +
            '<td style="font-weight:600;font-size:12px;">' + escHtml(j.action||'—') + '</td>' +
            '<td style="font-size:11px;">' + escHtml(j.module||'—') + '</td>' +
            '<td style="font-size:11px;color:var(--muted);">' + escHtml((j.ancien_etat||'')+' → '+(j.nouveau_etat||'')) + '</td></tr>';
        }).join('') + '</tbody></table>';
    } else if (tab === 'categories') {
      el.innerHTML = '<div style="overflow-x:auto;"><table class="ops-table"><thead><tr><th>Libellé</th><th>Famille</th><th>Criticité</th><th>Actions</th></tr></thead><tbody>' +
        data.map(function(c) {
          return '<tr><td style="font-weight:600;">' + escHtml(c.libelle||c.nom||'—') + '</td>' +
            '<td style="font-size:12px;">' + escHtml(c.famille||'—') + '</td>' +
            '<td style="font-size:12px;">' + escHtml(c.criticite||'moyenne') + '</td>' +
            '<td><button class="btn btn-sm btn-outline" onclick="adminEditPrompt(\'categories\',' + c.id + ',[\'libelle\',\'famille\',\'criticite\'],[\'' + escHtml(c.libelle||'') + '\',\'' + escHtml(c.famille||'') + '\',\'' + escHtml(c.criticite||'') + '\'])" style="font-size:10px;">Modifier</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    } else {
      // Fallback générique — tableau auto-détecté
      if (Array.isArray(data) && data.length > 0) {
        var keys = Object.keys(data[0]).filter(function(k) { return k !== 'id' && k !== 'mot_de_passe' && !k.endsWith('_id'); });
        el.innerHTML = '<table class="ops-table"><thead><tr>' + keys.map(function(k) { return '<th>' + escHtml(k.replace(/_/g,' ')) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          data.map(function(row) {
            return '<tr>' + keys.map(function(k) {
              var v = row[k];
              if (v === null || v === undefined) return '<td style="font-size:12px;color:var(--muted);">—</td>';
              if (v === true) return '<td>🟢</td>';
              if (v === false) return '<td>🔴</td>';
              return '<td style="font-size:12px;">' + escHtml(String(v)) + '</td>';
            }).join('') + '</tr>';
          }).join('') + '</tbody></table>';
      } else {
        el.innerHTML = '<div class="ops-empty"><p>Aucune donnée disponible.</p></div>';
      }
    }
  } catch(e) { el.innerHTML = '<div class="ops-empty"><p>' + escHtml(e.message) + '</p></div>'; }
}

async function adminUpdateConfig(cle, valeur) {
  try {
    await apiFetch('/api/admin/config/' + encodeURIComponent(cle), {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ valeur: valeur })
    });
    showToast(t('admin.config_maj'));
  } catch(e) { showToast(e.message, 'error'); }
}

async function adminCreateUser() {
  var tel = document.getElementById('adm-u-tel').value.trim();
  var mdp = document.getElementById('adm-u-mdp').value;
  var prenom = document.getElementById('adm-u-prenom').value.trim();
  var nom = document.getElementById('adm-u-nom').value.trim();
  var fonction = document.getElementById('adm-u-fonction').value;
  var niveau = document.getElementById('adm-u-niveau').value;
  var orgId = document.getElementById('adm-u-org').value;
  var caps = document.getElementById('adm-u-caps').value.trim();
  if (!tel || !mdp) { showToast(t('admin.tel_mdp_requis'), 'error'); return; }
  try {
    var body = {
      telephone: tel, mot_de_passe: mdp, prenom: prenom || null, nom: nom || null,
      fonction: fonction, niveau_perimetre: niveau,
      organisation_id: orgId ? Number(orgId) : null,
      capacites: caps ? caps.split(',').map(function(c){return c.trim();}) : []
    };
    var res = await apiFetch('/api/admin/utilisateurs', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) { showToast(t('admin.compte_cree')); adminTab('utilisateurs'); }
    else { var err = await res.json(); showToast(err.erreur || err.message || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

// ── Admin : édition générique par prompt ──
async function adminEditPrompt(tab, id, fields, values) {
  var body = {};
  for (var i = 0; i < fields.length; i++) {
    var label = fields[i].replace(/_/g, ' ');
    var newVal = prompt(label.charAt(0).toUpperCase() + label.slice(1) + ' :', values[i] || '');
    if (newVal === null) return; // annulé
    if (newVal !== values[i]) body[fields[i]] = newVal;
  }
  if (!Object.keys(body).length) { showToast(t('admin.aucune_modif')); return; }
  try {
    var res = await apiFetch('/api/admin/' + tab + '/' + id, {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) { showToast(t('admin.modifie')); adminTab(tab === 'categories' ? 'categories' : tab); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

async function adminToggle(tab, id, currentlyActive) {
  var action = currentlyActive ? 'Désactiver' : 'Activer';
  if (!confirm(action + ' cet élément ?')) return;
  try {
    var res = await apiFetch('/api/admin/' + tab + '/' + id, {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ actif: !currentlyActive })
    });
    if (res.ok) { showToast(action + ' effectué.'); adminTab(tab); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

async function adminAddService() {
  var sigle = prompt('Sigle du service :');
  if (!sigle) return;
  var nom = prompt('Nom complet :');
  if (!nom) return;
  var categorie = prompt('Catégorie (eau, proprete, voirie, eclairage...) :');
  try {
    var res = await apiFetch('/api/admin/services', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ sigle: sigle, nom: nom, categorie: categorie || null })
    });
    if (res.ok) { showToast(t('admin.service_cree')); adminTab('services'); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

async function adminEditEngagement(id, delai, vigilance, depassement) {
  var newDelai = prompt('Délai cible (heures) :', delai);
  if (newDelai === null) return;
  var newVig = prompt('Seuil vigilance (%) :', vigilance);
  if (newVig === null) return;
  var newDep = prompt('Seuil dépassement (%) :', depassement);
  if (newDep === null) return;
  try {
    var res = await apiFetch('/api/admin/engagements/' + id, {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ delai_cible_h: Number(newDelai), seuil_vigilance_pct: Number(newVig), seuil_depassement_pct: Number(newDep) })
    });
    if (res.ok) { showToast(t('admin.engagement_modifie')); adminTab('engagements'); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

async function adminAddCatCap() {
  var categorie = prompt('Catégorie (verification, constat, ronde...) :');
  if (!categorie) return;
  var nom = prompt('Nom du type de mission :');
  if (!nom) return;
  try {
    var res = await apiFetch('/api/admin/catalogue-cap', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ categorie: categorie, nom: nom })
    });
    if (res.ok) { showToast(t('admin.type_cap_ajoute')); adminTab('catalogue-cap'); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

// ─── À PROPOS (Mon poste) ──────────────────────────────────
function initApropos() {
  // Mon rôle est maintenant dans Mon profil. À propos = infos application uniquement.
}

// ─── AIDE & CONTACT ──────────────────────────────────────────
function initAide() {
  var u = currentUser || {};
  var isAdmin = u.fonction && u.fonction !== 'citoyen';
  var citEl = document.getElementById('aide-citoyen');
  var admEl = document.getElementById('aide-admin');
  if (citEl) citEl.style.display = isAdmin ? 'none' : '';
  if (admEl) admEl.style.display = isAdmin ? '' : 'none';

  // Préremplir le formulaire de contact si connecté
  if (!isAdmin) {
    var nomEl = document.getElementById('contact-nom');
    var emailEl = document.getElementById('contact-email');
    if (nomEl && u.prenom) nomEl.value = (u.prenom || '') + ' ' + (u.nom || '');
    if (emailEl && u.telephone) emailEl.value = u.email || u.telephone || '';
    // Réinitialiser l'affichage
    var formEl = document.getElementById('contact-form');
    var successEl = document.getElementById('contact-success');
    if (formEl) formEl.classList.remove('hidden');
    if (successEl) successEl.classList.add('hidden');
  }

  if (isAdmin && admEl) {
    var guideEl = document.getElementById('aide-admin-guide');
    if (guideEl) {
      var guides = currentLang === 'ar' ? {
        agent_traitant: '1. تحققوا من البلاغات الواردة في لوحة التحكم<br>2. صنّفوا كل ملف (الفئة، الاستعجال)<br>3. أحيلوا إلى المصلحة المختصة<br>4. تابعوا التقدم وأعيدوا التذكير عند الحاجة',
        entite_responsable: '1. اطّلعوا على الملفات المحالة من الولاية<br>2. تكفّلوا بملفات قطاعكم<br>3. نظّموا التدخل (الفريق، التاريخ، المسؤول)<br>4. قدّموا التقرير بعد الإنجاز',
        cap: '1. اطّلعوا على مهامكم الميدانية المكلّفين بها<br>2. أجروا المعاينة في الميدان (صور، ملاحظات)<br>3. حرّروا تقريركم الميداني<br>4. أرسلوا قراركم (تأكيد، تعديل، رفض)',
        superviseur: '1. راقبوا عبر غرفة القيادة (مؤشرات، أولويات، تنبيهات)<br>2. صادقوا على تقارير المصالح<br>3. تواصلوا، ذكّروا أو أبلغوا عن حالة طارئة<br>4. تابعوا أداء المؤسسات وأعوان القرب',
      } : {
        agent_traitant: '1. Vérifiez les signalements reçus dans votre board<br>2. Qualifiez chaque dossier (catégorie, urgence)<br>3. Transmettez au service compétent<br>4. Suivez l\'avancement et relancez si nécessaire',
        entite_responsable: '1. Consultez les dossiers transmis par la Wilaya<br>2. Prenez en charge les dossiers de votre secteur<br>3. Organisez l\'intervention (équipe, date, responsable)<br>4. Soumettez le compte-rendu une fois terminé',
        cap: '1. Consultez vos missions terrain assignées<br>2. Réalisez le constat sur place (photos, observations)<br>3. Rédigez votre rapport de terrain<br>4. Transmettez votre décision (valider, amender, rejeter)',
        superviseur: '1. Pilotez via la Salle de commandement (KPI, priorités, alertes)<br>2. Validez les comptes-rendus des services<br>3. Communiquez, relancez ou signalez une urgence au Wali<br>4. Suivez la performance des organisations et des CAP',
      };
      guideEl.innerHTML = guides[u.fonction] || (currentLang==='ar'?'اطّلعوا على فضاء العمل الخاص بكم لتسيير ملفاتكم.':'Consultez votre espace de travail pour gérer vos dossiers.');
    }
  }
}

async function envoyerContact() {
  var nom = document.getElementById('contact-nom').value.trim();
  var contact = document.getElementById('contact-email').value.trim();
  var sujet = document.getElementById('contact-sujet').value;
  var message = document.getElementById('contact-message').value.trim();
  if (!sujet) { showToast(currentLang==='ar'?'اختاروا موضوعاً.':'Choisissez un sujet.', 'error'); return; }
  if (!message) { showToast(currentLang==='ar'?'اكتبوا رسالتكم.':'Rédigez votre message.', 'error'); return; }
  try {
    var hdrs = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) hdrs['Authorization'] = 'Bearer ' + token;
    var res = await apiFetch('/api/infos/contact', {
      method: 'POST', headers: hdrs,
      body: JSON.stringify({ nom: nom, contact: contact, sujet: sujet, message: message })
    });
    if (res.ok) {
      document.getElementById('contact-form').classList.add('hidden');
      document.getElementById('contact-success').classList.remove('hidden');
    } else {
      var err = await res.json();
      showToast(err.erreur || 'Erreur d\'envoi.', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

// ─── CENTRE DE SUPERVISION ──────────────────────────────────
async function initSupervision() {
  var u = currentUser || {};
  var supNameEl = document.getElementById('sup-name');
  if (supNameEl) supNameEl.textContent = 'Centre Opérationnel — ' + (u.prenom || u.nom || 'Responsable');
  var supIdUser = document.getElementById('sup-id-user');
  if (supIdUser) supIdUser.textContent = (u.prenom || '') + ' ' + (u.nom || '');
  // Populate commune filter
  var sel = document.getElementById('sup-filter-commune');
  if (sel && sel.options.length <= 1 && communes.length) {
    communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; o.style.color = '#333'; sel.appendChild(o); });
  }
  await supLoad();

  // Carte territoriale supervision
  if (document.getElementById('bo-sup-map')) {
    try {
      var boardRes = await apiFetch('/api/signaler/board', { headers: authHeaders() });
      if (boardRes.ok) {
        var sigs = await boardRes.json();
        _boSupMap = initWorkbenchMap('bo-sup-map', Array.isArray(sigs) ? sigs : []);
      }
    } catch(e) { console.warn('[supervision] échec chargement carte superviseur:', e.message); }
  }
}

async function supLoad() {
  var communeId = document.getElementById('sup-filter-commune').value;
  var qs = communeId ? '?communeId=' + communeId : '';

  // KPIs
  try {
    var kpis = await safeFetchJSON('/api/supervision/kpis' + qs, {}, true);
    document.getElementById('sup-kpis').innerHTML =
      '<div class="ops-kpi ops-info"><div><div class="ops-kpi-value">' + kpis.ouverts + '</div><div class="ops-kpi-label">Ouverts</div></div></div>' +
      '<div class="ops-kpi ops-success"><div><div class="ops-kpi-value">' + kpis.resolus_aujourdhui + '</div><div class="ops-kpi-label">Résolus aujourd\'hui</div></div></div>' +
      '<div class="ops-kpi" style="border-left-color:' + (kpis.engagement_pct >= 80 ? 'var(--ops-success)' : kpis.engagement_pct >= 50 ? 'var(--ops-warning)' : 'var(--ops-danger)') + ';"><div><div class="ops-kpi-value">' + kpis.engagement_pct + '%</div><div class="ops-kpi-label">Engagement de Service</div></div></div>' +
      '<div class="ops-kpi ops-warning"><div><div class="ops-kpi-value">' + (kpis.temps_moyen_h || '—') + 'h</div><div class="ops-kpi-label">Temps moyen</div></div></div>' +
      '<div class="ops-kpi ops-purple"><div><div class="ops-kpi-value">' + kpis.missions_cap + '</div><div class="ops-kpi-label">Interventions CAP</div></div></div>' +
      '<div class="ops-kpi ops-danger"><div><div class="ops-kpi-value">' + kpis.alertes_critiques + '</div><div class="ops-kpi-label">Alertes critiques</div></div></div>';
  } catch(e) { document.getElementById('sup-kpis').innerHTML = '<div class="ops-empty"><p>KPIs indisponibles</p></div>'; }

  // Alertes
  try {
    var alertes = await safeFetchJSON('/api/supervision/alertes' + qs, {}, true);
    var aHtml = '';
    if (alertes.hors_delai && alertes.hors_delai.length) {
      aHtml += alertes.hors_delai.map(function(a) {
        return '<div onclick="supOpenDrawer(\'' + (a.id||'') + '\')" style="padding:8px 0;border-bottom:1px solid var(--ops-border);display:flex;gap:8px;align-items:center;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'var(--gray-50)\'" onmouseout="this.style.background=\'transparent\'">' +
          '<span class="ops-sla ops-sla-breach">Hors délai</span>' +
          '<span style="font-weight:600;">#' + escHtml(a.reference) + '</span> · ' + escHtml(a.commune||'') + ' · ' + escHtml(a.categorie||'') +
        '</div>';
      }).join('');
    }
    if (alertes.cap_bloque && alertes.cap_bloque.length) {
      aHtml += alertes.cap_bloque.map(function(a) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--ops-border);display:flex;gap:8px;align-items:center;">' +
          '<span class="ops-status ops-status-bloque">CAP bloqué</span>' +
          '<span>#' + escHtml(a.reference) + '</span> · ' + escHtml(a.commune||'') + ' · ' + escHtml(a.motif_blocage||'') +
        '</div>';
      }).join('');
    }
    if (alertes.hausse_signalements && alertes.hausse_signalements.length) {
      aHtml += alertes.hausse_signalements.map(function(a) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--ops-border);display:flex;gap:8px;align-items:center;">' +
          '<span class="ops-sla ops-sla-warn">Hausse</span>' +
          '<span>' + escHtml(a.commune) + '</span> : <strong>' + a.n + '</strong> signalements cette semaine' +
        '</div>';
      }).join('');
    }
    document.getElementById('sup-alertes').innerHTML = aHtml || '<div class="ops-empty" style="padding:16px;"><p>✅ Aucune alerte en cours</p></div>';
  } catch(e) { console.warn('[supervision] échec chargement alertes:', e.message); }

  // Activité temps réel
  try {
    var activite = await safeFetchJSON('/api/supervision/activite' + qs, {}, true);
    var dotMap = {recu:'',transmis:'ops-dot-info',en_intervention:'ops-dot-warning',resolu:'ops-dot-success',rejete:'ops-dot-danger',cree:'',accepte:'ops-dot-info',en_cours:'ops-dot-warning',termine:'ops-dot-success',bloque:'ops-dot-danger'};
    document.getElementById('sup-activite').innerHTML = activite.length ?
      '<div class="ops-timeline">' + activite.map(function(a) {
        return '<div class="ops-timeline-item"><div class="ops-timeline-dot ' + (dotMap[a.etat]||'') + '"></div><div class="ops-timeline-content">' +
          '<div class="ops-timeline-date">' + fmtDateTime(a.date) + '</div>' +
          '<div class="ops-timeline-action">' + escHtml(a.action||a.etat) + (a.reference?' · #'+escHtml(a.reference):'') + '</div>' +
          (a.commune?'<div class="ops-timeline-detail">📍 '+escHtml(a.commune)+(a.prenom?' — '+escHtml(a.prenom):'')+' </div>':'') +
        '</div></div>';
      }).join('') + '</div>'
      : '<div class="ops-empty" style="padding:16px;"><p>Aucune activité récente</p></div>';
  } catch(e) { console.warn('[supervision] échec chargement activité:', e.message); }

  // Décisions
  try {
    var kpis2 = await safeFetchJSON('/api/supervision/kpis' + qs, {}, true);
    var dHtml = '';
    if (kpis2.alertes_critiques > 0) dHtml += '<div onclick="showView(\'command-center\');" style="padding:6px 0;font-size:13px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'var(--gray-50)\'" onmouseout="this.style.background=\'transparent\'">🔴 <strong>' + kpis2.alertes_critiques + '</strong> signalements hors délai</div>';
    if (kpis2.missions_cap > 0) dHtml += '<div style="padding:6px 0;font-size:13px;">🟣 <strong>' + kpis2.missions_cap + '</strong> interventions CAP en cours</div>';
    if (kpis2.ouverts > 10) dHtml += '<div onclick="showView(\'command-center\');" style="padding:6px 0;font-size:13px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'var(--gray-50)\'" onmouseout="this.style.background=\'transparent\'">🟠 <strong>' + kpis2.ouverts + '</strong> signalements ouverts</div>';
    document.getElementById('sup-decisions').innerHTML = dHtml || '<div style="padding:12px;font-size:13px;color:var(--muted);">Aucune décision urgente</div>';
  } catch(e) { console.warn('[supervision] échec chargement décisions:', e.message); }

  // Services
  try {
    var services = await safeFetchJSON('/api/supervision/services', {}, true);
    document.getElementById('sup-services-body').innerHTML = services.length ?
      services.map(function(s) {
        var slaClass = s.engagement_pct >= 80 ? 'ops-sla-ok' : s.engagement_pct >= 50 ? 'ops-sla-warn' : 'ops-sla-breach';
        return '<tr><td style="font-weight:600;">' + escHtml(s.service) + '</td>' +
          '<td>' + s.signalements + '</td>' +
          '<td>' + (s.temps_moyen || '—') + 'h</td>' +
          '<td><span class="ops-sla ' + slaClass + '">' + s.engagement_pct + '%</span></td>' +
          '<td>' + (s.en_retard || 0) + '</td></tr>';
      }).join('')
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted);">Aucune donnée</td></tr>';
  } catch(e) { console.warn('[supervision] échec chargement services:', e.message); }

  // Communes
  try {
    var communes2 = await safeFetchJSON('/api/supervision/communes', {}, true);
    document.getElementById('sup-communes-body').innerHTML = communes2.length ?
      communes2.map(function(c) {
        var slaClass = c.engagement_pct >= 80 ? 'ops-sla-ok' : c.engagement_pct >= 50 ? 'ops-sla-warn' : 'ops-sla-breach';
        return '<tr><td style="font-weight:600;">' + escHtml(c.commune) + '</td>' +
          '<td>' + c.signalements + '</td>' +
          '<td>' + c.ouverts + '</td>' +
          '<td>' + (c.delai_moyen || '—') + 'h</td>' +
          '<td><span class="ops-sla ' + slaClass + '">' + c.engagement_pct + '%</span></td></tr>';
      }).join('')
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted);">Aucune donnée</td></tr>';
  } catch(e) { console.warn('[supervision] échec chargement communes:', e.message); }
}

// ─── ODS HELPERS ────────────────────────────────────────────
// SLA Indicator: returns class name based on elapsed time vs target
function opsSlaClass(cree_le, targetHours) {
  if (!cree_le) return 'ops-sla-ok';
  var elapsed = (Date.now() - new Date(cree_le).getTime()) / 3600000;
  var ratio = elapsed / (targetHours || 48);
  if (ratio >= 1) return 'ops-sla-breach';
  if (ratio >= 0.75) return 'ops-sla-warn';
  return 'ops-sla-ok';
}
function opsSlaLabel(cree_le, targetHours) {
  if (!cree_le) return t('bo.badge_conforme_label');
  var elapsed = (Date.now() - new Date(cree_le).getTime()) / 3600000;
  var remaining = (targetHours || 48) - elapsed;
  if (remaining <= 0) return t('bo.badge_horsdelai_label') + ' (' + Math.round(-remaining) + 'h)';
  if (remaining <= 12) return Math.round(remaining) + 'h';
  return t('bo.badge_conforme_label');
}
// Status badge HTML
function opsStatusBadge(etat) { var labels = {recu:t('bo.col_recu'),transmis:t('bo.col_transmis'),pris_en_charge:t('bo.col_pris_en_charge'),en_intervention:t('bo.col_en_intervention'),a_valider:t('bo.col_a_valider'),resolu:'Résolu',clos:t('bo.col_clos'),rejete:t('bo.col_rejete')}; return '<span class="ops-status ops-status-' + (etat||'recu') + '">' + escHtml(labels[etat] || etat || t('bo.col_recu')) + '</span>'; }
function opsPrioBadge(prio) { var labels = {haute:t('bo.prio_haute'),moyenne:t('bo.prio_moyenne'),basse:t('bo.prio_basse')}; return '<span class="ops-prio ops-prio-' + (prio||'normale') + '">' + escHtml(labels[prio] || prio || t('bo.prio_moyenne')) + '</span>'; }
function opsSlaBadge(cree_le, target) { var slaDef = (currentLang === 'ar' && ACRONYMES_AR.SLA) ? ACRONYMES_AR.SLA : ACRONYMES_FR.SLA; return '<span class="ops-sla ' + opsSlaClass(cree_le,target) + '" title="' + escHtml(slaDef) + '">' + opsSlaLabel(cree_le,target) + '</span>'; }

// Timeline HTML
function opsTimelineHtml(entries) {
  if (!entries || !entries.length) return '';
  var dotClass = {recu:'',transmis:'ops-dot-info',en_intervention:'ops-dot-warning',resolu:'ops-dot-success',rejete:'ops-dot-danger',cree:'',accepte:'ops-dot-info',en_cours:'ops-dot-warning',termine:'ops-dot-success',bloque:'ops-dot-danger'};
  return '<div class="ops-timeline">' + entries.map(function(h) {
    return '<div class="ops-timeline-item">' +
      '<div class="ops-timeline-dot ' + (dotClass[h.etat]||'') + '"></div>' +
      '<div class="ops-timeline-content">' +
        '<div class="ops-timeline-date">' + fmtDateTime(h.le) + '</div>' +
        '<div class="ops-timeline-action">' + escHtml(h.action||h.etat||'—') + (h.prenom?' — '+escHtml(h.prenom+' '+(h.nom||'')):'') + '</div>' +
        (h.commentaire?'<div class="ops-timeline-detail">'+escHtml(h.commentaire)+'</div>':'') +
      '</div></div>';
  }).join('') + '</div>';
}

// ─── APPLICATION CAP ────────────────────────────────────────
var _capMissions = [];
var _capCurrentId = null;
var _capFilter = '';

async function initBoCap() {
  var u = currentUser || {};
  var capGreeting = (currentLang === 'ar' ? 'مرحباً، ' : 'Bienvenue, ') + (u.prenom || 'Agent CAP');
  document.getElementById('cap-welcome').textContent = capGreeting;
  document.getElementById('cap-secteur').textContent = t('cap.role_desc');
  var capIdUser = document.getElementById('cap-id-user');
  if (capIdUser) capIdUser.textContent = (u.prenom || '') + ' ' + (u.nom || '');
  var metaEl = document.getElementById('cap-meta');
  if (metaEl) {
    var today = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : 'fr-DZ', {weekday:'long', day:'numeric', month:'long'});
    var communeLabel = u.commune_nom
      ? (currentLang === 'ar' ? (u.commune_nom_ar || u.commune_nom) : u.commune_nom)
      : (currentLang === 'ar' ? 'ولاية الجزائر' : 'Wilaya d\'Alger');
    metaEl.textContent = communeLabel + ' · ' + today;
  }
  await capLoadMissions();

  // Carte terrain CAP — missions géolocalisées
  if (document.getElementById('bo-cap-map')) {
    var mapSignals = _capMissions.filter(function(m){return m.sig_lat && m.sig_lng;}).map(function(m){
      return {lat:m.sig_lat, lng:m.sig_lng, etat:m.etat==='termine'?'resolu':m.etat==='en_cours'?'en_intervention':'recu', categorie_nom:m.type||m.sig_categorie, commune_nom:m.commune_nom, _domaine:'general'};
    });
    _boCapMap = initWorkbenchMap('bo-cap-map', mapSignals);
  }

  // Ouvrir un drawer mission depuis une notification (sessionStorage)
  var pendingId = sessionStorage.getItem('algerna_open_drawer');
  if (pendingId && typeof capOpenDrawer === 'function') {
    sessionStorage.removeItem('algerna_open_drawer');
    // Chercher la mission liée au signalement
    var mission = _capMissions.find(function(m) { return m.signalement_id === pendingId || m.id === pendingId; });
    if (mission) {
      setTimeout(function() { capOpenDrawer(mission.id); }, 300);
    } else {
      showToast(t('terrain.mission_introuvable'), 'error');
    }
  }
}

async function capLoadMissions() {
  try {
    var res = await apiFetch('/api/cap/missions', { headers: authHeaders() });
    if (res.ok) _capMissions = await res.json();
  } catch(e) { _capMissions = []; }
  capRenderMissions();
}

function capFilterMissions(etat) {
  _capFilter = etat;
  // Toggle filter pill active state
  document.querySelectorAll('#view-bo-cap .filter-pill').forEach(function(b) {
    var bEtat = (b.getAttribute('onclick')||'').match(/'([^']*)'/);
    b.classList.toggle('active', bEtat && bEtat[1] === etat);
  });
  capRenderMissions();
}

function capRenderMissions() {
  var list = _capFilter ? _capMissions.filter(function(m) { return m.etat === _capFilter; }) : _capMissions;
  // KPI
  document.getElementById('cap-total').textContent = _capMissions.filter(function(m){return m.etat!=='termine';}).length;
  document.getElementById('cap-prio').textContent = _capMissions.filter(function(m){return (m.priorite==='haute'||m.priorite==='urgente')&&m.etat!=='termine';}).length;
  document.getElementById('cap-done').textContent = _capMissions.filter(function(m){return m.etat==='termine';}).length;

  // Bloc "Intervention en cours"
  var currentBlock = document.getElementById('cap-current-intervention');
  var currentContent = document.getElementById('cap-current-content');
  var currentNav = document.getElementById('cap-current-nav');
  var currentPrio = document.getElementById('cap-current-prio');
  var currentId = document.getElementById('cap-current-id');
  var activeM = _capMissions.find(function(m) { return m.etat === 'en_cours' || m.etat === 'accepte'; });
  if (activeM && currentBlock && currentContent) {
    currentBlock.style.display = '';
    if (currentId) currentId.value = activeM.id;
    // Priorité badge
    var prioC = {urgente:'#EF4444',haute:'#F59E0B',normale:'#7C3AED'};
    var prioBgC = {urgente:'#fee2e2',haute:'#fef3c7',normale:'#EDE9FE'};
    var _prioL = currentLang === 'ar' ? {urgente:'عاجلة',haute:'عالية',normale:'عادية'} : {urgente:'Urgente',haute:'Haute',normale:'Normale'};
    if (currentPrio) { currentPrio.style.background = prioBgC[activeM.priorite]||'#EDE9FE'; currentPrio.style.color = prioC[activeM.priorite]||'#7C3AED'; currentPrio.textContent = _prioL[activeM.priorite]||_prioL.normale; }
    // Contenu enrichi
    var typeLabel = currentLang === 'ar'
      ? {verification:'تحقق مسبق',assistance:'مساعدة ميدانية',controle:'مراقبة بعد التدخل',tournee:'جولة مبرمجة',signalement:'بلاغ استباقي'}
      : {verification:'Vérification préalable',assistance:'Assistance terrain',controle:'Contrôle après intervention',tournee:'Tournée programmée',signalement:'Signalement proactif'};
    var _consigneLabel = currentLang === 'ar' ? 'التعليمات :' : 'Consignes :';
    currentContent.innerHTML =
      '<div style="font-weight:700;color:var(--navy);font-size:15px;">' + escHtml(typeLabel[activeM.type] || activeM.type || activeM.sig_categorie || '—') + '</div>' +
      '<div style="font-size:13px;color:var(--gray-700);margin-top:6px;">📍 ' + escHtml(activeM.commune_nom || '—') + '</div>' +
      (activeM.commentaire ? '<div style="font-size:12px;color:var(--gray-600);margin-top:6px;padding:8px 10px;background:var(--gray-50);border-radius:8px;line-height:1.5;"><strong>' + _consigneLabel + '</strong> ' + escHtml(activeM.commentaire) + '</div>' : '');
    if (currentNav && activeM.sig_lat && activeM.sig_lng) {
      currentNav.href = 'https://www.google.com/maps/dir/?api=1&destination=' + activeM.sig_lat + ',' + activeM.sig_lng;
      currentNav.style.display = '';
    } else if (currentNav) { currentNav.style.display = 'none'; }
  } else if (currentBlock) { currentBlock.style.display = 'none'; }

  // Tri : priorité (urgente > haute > normale) puis date
  var prioOrder = {urgente:0, haute:1, normale:2};
  list.sort(function(a,b) {
    var pa = prioOrder[a.priorite] !== undefined ? prioOrder[a.priorite] : 2;
    var pb = prioOrder[b.priorite] !== undefined ? prioOrder[b.priorite] : 2;
    if (pa !== pb) return pa - pb;
    return new Date(b.cree_le) - new Date(a.cree_le);
  });

  var el = document.getElementById('cap-missions-list');
  var _emptyMsg = currentLang === 'ar' ? 'لا توجد مهام حاليا.' : 'Aucune mission pour le moment.';
  if (!list.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>' + _emptyMsg + '</p></div>'; return; }

  var prioColors = {urgente:'#EF4444',haute:'#F59E0B',normale:'#7C3AED'};
  var prioBg = {urgente:'#fee2e2',haute:'#fef3c7',normale:'#EDE9FE'};
  var etatLabels = currentLang === 'ar'
    ? {cree:'للتنفيذ',accepte:'مقبولة',en_cours:'جارية',termine:'منتهية',bloque:'معلّقة'}
    : {cree:'À faire',accepte:'Acceptée',en_cours:'En cours',termine:'Terminée',bloque:'Bloquée'};
  var etatColors = {cree:'#9ca3af',accepte:'#2563eb',en_cours:'#f97316',termine:'#16a34a',bloque:'#EF4444'};
  var prioLabels = currentLang === 'ar' ? {urgente:'عاجلة',haute:'عالية',normale:'عادية'} : {urgente:'Urgente',haute:'Haute',normale:'Normale'};

  var typeL = currentLang === 'ar'
    ? {verification:'تحقق',assistance:'مساعدة',controle:'مراقبة',tournee:'جولة',signalement:'بلاغ استباقي'}
    : {verification:'Vérification',assistance:'Assistance',controle:'Contrôle',tournee:'Tournée',signalement:'Signalement proactif'};
  var _refLabel = currentLang === 'ar' ? 'مرجع' : 'Réf.';
  var _sigLabel = currentLang === 'ar' ? 'بلاغ :' : 'Signalement :';
  el.innerHTML = list.map(function(m) {
    var pc = prioColors[m.priorite] || '#7C3AED';
    var pb = prioBg[m.priorite] || '#EDE9FE';
    var ec = etatColors[m.etat] || '#9ca3af';
    var ago = boTimeAgo(m.cree_le);
    return '<div class="card" style="margin-bottom:10px;padding:16px;cursor:pointer;border-left:3px solid ' + pc + ';" onclick="capOpenDrawer(\'' + m.id + '\')">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">' +
        '<div style="flex:1;">' +
          '<div style="font-weight:700;font-size:14px;color:var(--navy);">' + escHtml(typeL[m.type] || m.type || m.sig_categorie || '—') + '</div>' +
          '<div style="font-size:12px;color:var(--muted);margin-top:2px;">📍 ' + escHtml(arF(m.commune_nom_ar, m.commune_nom) || '—') + ' · ' + ago + '</div>' +
          (m.commentaire ? '<div style="font-size:11px;color:var(--gray-600);margin-top:4px;line-height:1.4;">' + escHtml(m.commentaire).substring(0,80) + (m.commentaire.length > 80 ? '…' : '') + '</div>' : '') +
          (m.sig_reference ? '<div style="font-size:10px;color:var(--muted);margin-top:2px;">' + _refLabel + ' ' + escHtml(m.sig_reference) + (m.sig_etat ? ' · ' + _sigLabel + ' ' + escHtml(m.sig_etat) : '') + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">' +
          '<span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:' + pb + ';color:' + pc + ';">' + escHtml(prioLabels[m.priorite] || prioLabels.normale) + '</span>' +
          '<span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;background:' + ec + '22;color:' + ec + ';">' + (etatLabels[m.etat] || m.etat) + '</span>' +
        '</div>' +
      '</div></div>';
  }).join('');
}

async function capOpenDrawer(id) {
  _capCurrentId = id;
  var m = _capMissions.find(function(x) { return x.id === id; });
  if (!m) return;
  var typeLabels = currentLang === 'ar'
    ? {verification:'تحقق مسبق',assistance:'مساعدة ميدانية',controle:'مراقبة بعد التدخل',tournee:'جولة مبرمجة',signalement:'بلاغ استباقي'}
    : {verification:'Vérification préalable',assistance:'Assistance terrain',controle:'Contrôle après intervention',tournee:'Tournée programmée',signalement:'Signalement proactif'};
  var etatL = currentLang === 'ar'
    ? {cree:'للتنفيذ',accepte:'مقبولة',en_cours:'جارية',termine:'منتهية',bloque:'معلّقة'}
    : {cree:'À faire',accepte:'Acceptée',en_cours:'En cours',termine:'Terminée',bloque:'Bloquée'};
  var prioL = currentLang === 'ar' ? {urgente:'عاجلة',haute:'عالية',normale:'عادية'} : {urgente:'Urgente',haute:'Haute',normale:'Normale'};
  document.getElementById('cap-drawer-title').textContent = typeLabels[m.type] || m.type || '';
  var content = document.getElementById('cap-drawer-content');
  var ficheHtml = '';
  var pc2 = {urgente:'#EF4444',haute:'#F59E0B',normale:'#7C3AED'};
  var pb2 = {urgente:'#fee2e2',haute:'#fef3c7',normale:'#EDE9FE'};
  var secLabel = function(key) { return '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">' + key + '</div>'; };

  ficheHtml += '<div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line);">';
  ficheHtml += secLabel(currentLang==='ar'?'ماذا':'Quoi');
  ficheHtml += '<div style="font-size:16px;font-weight:700;color:var(--navy);">' + escHtml(typeLabels[m.type] || m.type || '—') + '</div>';
  ficheHtml += '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">';
  ficheHtml += '<span style="padding:2px 8px;border-radius:8px;font-size:11px;font-weight:600;background:' + (pb2[m.priorite]||'#EDE9FE') + ';color:' + (pc2[m.priorite]||'#7C3AED') + ';">' + escHtml(prioL[m.priorite] || m.priorite || prioL.normale) + '</span>';
  ficheHtml += '<span style="padding:2px 8px;border-radius:8px;font-size:11px;font-weight:600;background:var(--blue-light);color:var(--blue);">' + (etatL[m.etat] || m.etat) + '</span>';
  ficheHtml += '</div></div>';

  ficheHtml += '<div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line);">';
  ficheHtml += secLabel(currentLang==='ar'?'أين':'Où');
  ficheHtml += '<div style="font-size:13px;color:var(--gray-700);">📍 ' + escHtml(arF(m.commune_nom_ar, m.commune_nom) || '—') + '</div>';
  if (m.sig_lat && m.sig_lng) ficheHtml += '<div style="margin-top:8px;"><a href="https://www.google.com/maps/dir/?api=1&destination=' + m.sig_lat + ',' + m.sig_lng + '" target="_blank" class="btn btn-sm btn-primary" style="width:100%;text-align:center;font-size:14px;padding:12px;">' + t('cap.ouvrir_itineraire') + '</a></div>';
  ficheHtml += '</div>';

  ficheHtml += '<div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line);">';
  ficheHtml += secLabel(currentLang==='ar'?'متى':'Quand');
  ficheHtml += '<div style="font-size:13px;color:var(--gray-700);">' + fmtDateTime(m.cree_le) + '</div>';
  if (m.cloture_le) ficheHtml += '<div style="font-size:12px;color:var(--green);margin-top:2px;">' + fmtDateTime(m.cloture_le) + '</div>';
  if (m.cloture_lat && m.cloture_lng) ficheHtml += '<div style="font-size:11px;color:var(--muted);margin-top:2px;">📍 ' + parseFloat(m.cloture_lat).toFixed(5) + ', ' + parseFloat(m.cloture_lng).toFixed(5) + '</div>';
  ficheHtml += '</div>';

  ficheHtml += '<div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line);">';
  ficheHtml += secLabel(currentLang==='ar'?'كيف':'Comment');
  if (m.commentaire) {
    ficheHtml += '<div style="padding:10px 12px;background:var(--gray-50);border-radius:8px;border-left:3px solid var(--navy);font-size:13px;color:var(--gray-700);line-height:1.5;">' + escHtml(m.commentaire) + '</div>';
  } else {
    ficheHtml += '<div style="font-size:12px;color:var(--muted);">—</div>';
  }
  ficheHtml += '</div>';

  if (m.sig_reference || m.sig_description) {
    ficheHtml += '<div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line);">';
    ficheHtml += secLabel(currentLang==='ar'?'البلاغ الأصلي':'Signalement d\'origine');
    if (m.sig_reference) ficheHtml += '<div style="font-size:12px;color:var(--navy);font-weight:600;">' + escHtml(m.sig_reference) + '</div>';
    if (m.sig_categorie) ficheHtml += '<div style="font-size:12px;color:var(--gray-600);margin-top:2px;">' + escHtml(m.sig_categorie) + '</div>';
    if (m.sig_description) ficheHtml += '<div style="font-size:12px;color:var(--gray-700);margin-top:4px;line-height:1.5;">' + escHtml(m.sig_description) + '</div>';
    if (m.sig_photo) ficheHtml += '<img src="/' + escHtml(m.sig_photo) + '" style="width:100%;border-radius:10px;max-height:160px;object-fit:cover;margin-top:8px;" onerror="this.style.display=\'none\'">';
    ficheHtml += '</div>';
  }

  // ── DEMANDEUR ──
  ficheHtml += '<div style="font-size:12px;color:var(--muted);">' + escHtml((m.createur_prenom || '') + ' ' + (m.createur_nom || '')) + '</div>';
  content.innerHTML = ficheHtml;

  // Actions selon état
  var actions = document.getElementById('cap-drawer-actions');
  if (m.etat === 'cree') {
    actions.innerHTML = '<button class="btn btn-primary btn-sm" style="flex:1;" onclick="capTransition(\'accepte\')">✅ ' + t('cap.accepter') + '</button>';
  } else if (m.etat === 'accepte') {
    actions.innerHTML = '<button class="btn btn-primary btn-sm" style="flex:1;" onclick="capTransition(\'en_cours\')">🚗 ' + t('cap.en_deplacement') + '</button>';
  } else if (m.etat === 'en_cours') {
    actions.innerHTML =
      '<button class="btn btn-primary btn-sm" style="flex:1;" onclick="capTerminer()">📝 ' + t('cap.terminer') + '</button>' +
      '<button class="btn btn-sm" style="background:var(--orange);color:white;" onclick="document.getElementById(\'cap-modal-blocage\').classList.remove(\'hidden\')">⚠️ ' + t('cap.bloquer') + '</button>';
  } else if (m.etat === 'bloque') {
    actions.innerHTML =
      '<button class="btn btn-outline btn-sm" style="flex:1;" onclick="capTransition(\'en_cours\')">↩️</button>' +
      '<button class="btn btn-primary btn-sm" onclick="capTerminer()">📝 ' + t('cap.terminer') + '</button>';
  } else if (m.etat === 'termine') {
    // Afficher le rapport dans le drawer
    var decL = currentLang === 'ar'
      ? {valider:'✅ مؤكّد',amender:'🔄 معدّل',rejeter:'❌ مرفوض'}
      : {valider:'✅ Confirmé',amender:'🔄 Amendé',rejeter:'❌ Rejeté'};
    var _rLabels = currentLang === 'ar'
      ? {titre:'تقرير ميداني', decision:'القرار :', motif:'السبب :', constat:'المعاينة :', temoignages:'الشهادات :', resume:'ملخص :'}
      : {titre:'Rapport terrain', decision:'Décision :', motif:'Motif :', constat:'Constat :', temoignages:'Témoignages :', resume:'Résumé :'};
    var rapportHtml = '<div style="background:var(--gray-50);border-radius:10px;padding:12px;margin-bottom:8px;">';
    rapportHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px;">' + _rLabels.titre + '</div>';
    if (m.decision) rapportHtml += '<div style="font-weight:700;font-size:13px;color:var(--navy);margin-bottom:4px;">' + _rLabels.decision + ' ' + (decL[m.decision] || m.decision) + '</div>';
    if (m.motif_decision) rapportHtml += '<div style="font-size:12px;color:var(--red);margin-bottom:4px;">' + _rLabels.motif + ' ' + escHtml(m.motif_decision) + '</div>';
    if (m.constat_visuel) rapportHtml += '<div style="font-size:12px;color:var(--gray-700);margin-bottom:4px;"><strong>' + _rLabels.constat + '</strong> ' + escHtml(m.constat_visuel) + '</div>';
    if (m.constat_temoignages) rapportHtml += '<div style="font-size:12px;color:var(--gray-700);margin-bottom:4px;"><strong>' + _rLabels.temoignages + '</strong> ' + escHtml(m.constat_temoignages) + '</div>';
    if (m.commentaire_cap) rapportHtml += '<div style="font-size:12px;color:var(--gray-600);"><strong>' + _rLabels.resume + '</strong> ' + escHtml(m.commentaire_cap) + '</div>';
    rapportHtml += '</div>';
    content.innerHTML += rapportHtml;
    var _doneMsg = currentLang === 'ar' ? 'مهمة منتهية — التقرير مرسل' : 'Mission terminée — rapport transmis';
    actions.innerHTML = '<div style="text-align:center;color:var(--green);font-size:13px;width:100%;font-weight:600;">' + _doneMsg + '</div>';
  } else {
    var _interventionMsg = currentLang === 'ar' ? 'تدخل' : 'Intervention';
    actions.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:13px;width:100%;">' + _interventionMsg + ' ' + escHtml(etatL[m.etat] || m.etat) + '</div>';
  }

  document.getElementById('cap-drawer').classList.remove('hidden');

  // Load historique
  try {
    var hRes = await apiFetch('/api/cap/missions/' + id + '/historique', { headers: authHeaders() });
    if (hRes.ok) {
      var hist = await hRes.json();
      if (hist.length) {
        content.innerHTML += '<div style="margin-top:16px;"><h4 style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:8px;">' + (currentLang==='ar'?'السجل':'Historique') + '</h4>' +
          hist.map(function(h) {
            return '<div style="padding:4px 0 4px 12px;border-left:2px solid var(--line);font-size:12px;margin-bottom:4px;">' +
              '<span style="color:var(--muted);">' + fmtDateTime(h.le) + '</span> · ' +
              '<span style="color:var(--navy);font-weight:500;">' + escHtml(h.etat) + '</span>' +
              (h.prenom ? ' — ' + escHtml(h.prenom) : '') +
              (h.commentaire ? '<div style="color:var(--gray-600);font-size:11px;">' + escHtml(h.commentaire) + '</div>' : '') +
            '</div>';
          }).join('') + '</div>';
      }
    }
  } catch(e) { console.warn('[cap] échec chargement historique drawer:', e.message); }
}

function capCloseDrawer() { document.getElementById('cap-drawer').classList.add('hidden'); _capCurrentId = null; }

async function capTransition(newEtat, opts) {
  if (!_capCurrentId) return;
  opts = opts || {};
  try {
    var body = { etat: newEtat };
    if (opts.commentaire) body.commentaire = opts.commentaire;
    if (opts.motif_blocage) body.motif_blocage = opts.motif_blocage;
    var res = await apiFetch('/api/cap/missions/' + _capCurrentId + '/etat', {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      var m = _capMissions.find(function(x) { return x.id === _capCurrentId; });
      if (m) m.etat = newEtat;
      capCloseDrawer();
      capRenderMissions();
      showToast(currentLang==='ar'?'تم تحديث التدخل.':'Intervention mise à jour.');
    } else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

function capTerminer() {
  // Ouvrir le modal de rapport terrain
  document.getElementById('cap-rapport-visuel').value = '';
  document.getElementById('cap-rapport-temoignages').value = '';
  document.getElementById('cap-rapport-decision').value = 'valider';
  document.getElementById('cap-rapport-motif-wrap').style.display = 'none';
  document.getElementById('cap-rapport-comment').value = '';
  var photoInput = document.getElementById('cap-rapport-photo');
  if (photoInput) photoInput.value = '';
  var rapportPhotoName = document.getElementById('cap-rapport-photo-name');
  if (rapportPhotoName) rapportPhotoName.textContent = '';
  document.getElementById('cap-modal-rapport').classList.remove('hidden');
}

async function capConfirmRapport() {
  var visuel = document.getElementById('cap-rapport-visuel').value.trim();
  if (!visuel) { showToast(t('terrain.constat_obligatoire'), 'error'); return; }
  var temoignages = document.getElementById('cap-rapport-temoignages').value.trim();
  var decision = document.getElementById('cap-rapport-decision').value;
  var motifDecision = '';
  if (decision === 'rejeter') {
    motifDecision = (document.getElementById('cap-rapport-motif') || {}).value || '';
    if (!motifDecision.trim()) { showToast(t('terrain.motif_rejet_requis'), 'error'); return; }
  }
  var commentaire = document.getElementById('cap-rapport-comment').value.trim();

  // Capturer la position GPS de clôture (preuve de présence sur site)
  var gpsPromise = new Promise(function(resolve) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(pos) { resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        function() { resolve(null); },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else { resolve(null); }
  });
  var gps = await gpsPromise;

  // Construire le FormData pour supporter l'upload photo
  var fd = new FormData();
  fd.append('etat', 'termine');
  fd.append('constat_visuel', visuel);
  if (temoignages) fd.append('constat_temoignages', temoignages);
  fd.append('decision', decision);
  if (motifDecision) fd.append('motif_decision', motifDecision);
  if (commentaire) fd.append('commentaire', commentaire);
  if (gps) { fd.append('lat', gps.lat); fd.append('lng', gps.lng); }
  var photoFile = document.getElementById('cap-rapport-photo').files[0];
  if (photoFile) fd.append('photo', photoFile);

  try {
    var res = await apiFetch('/api/cap/missions/' + _capCurrentId + '/etat', {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: fd
    });
    if (res.ok) {
      document.getElementById('cap-modal-rapport').classList.add('hidden');
      var decisionLabels = currentLang === 'ar'
        ? {valider:'بلاغ مؤكّد',amender:'بلاغ معدّل',rejeter:'بلاغ مرفوض'}
        : {valider:'Signalement confirmé',amender:'Signalement amendé',rejeter:'Signalement rejeté'};
      showToast((currentLang==='ar'?'تم إرسال التقرير — ':'Rapport envoyé — ') + (decisionLabels[decision] || decision));
      capCloseDrawer();
      await capLoadMissions();
    } else {
      var err = await res.json();
      showToast(err.erreur || err.message || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

function capConfirmBlocage() {
  var motif = document.getElementById('cap-blocage-motif').value;
  var comment = document.getElementById('cap-blocage-comment').value;
  capTransition('bloque', { motif_blocage: motif, commentaire: comment || motif });
  document.getElementById('cap-modal-blocage').classList.add('hidden');
}

function capOpenConstatTerrain(type) {
  var titre = type === 'signalement'
    ? (currentLang === 'ar' ? 'بلاغ استباقي' : 'Signalement proactif')
    : (currentLang === 'ar' ? 'معاينة ميدانية' : 'Constat terrain');
  document.getElementById('cap-constat-titre').textContent = titre;
  var introEl = document.getElementById('cap-constat-intro');
  if (introEl) introEl.textContent = currentLang === 'ar'
    ? 'وثّقوا ما تعاينونه في الميدان. سترسل هذه المعاينة إلى مركز الاستقبال.'
    : 'Documentez ce que vous constatez sur le terrain. Ce constat sera transmis au Centre de Réception.';
  document.getElementById('cap-constat-visuel').value = '';
  document.getElementById('cap-constat-temoignages').value = '';
  document.getElementById('cap-constat-categorie').value = 'voirie';
  document.getElementById('cap-constat-urgence').value = 'moyenne';
  var photoEl = document.getElementById('cap-constat-photo');
  if (photoEl) photoEl.value = '';
  var photoNameEl = document.getElementById('cap-constat-photo-name');
  if (photoNameEl) photoNameEl.textContent = '';
  document.getElementById('cap-constat-lat').value = '';
  document.getElementById('cap-constat-lng').value = '';
  var adresseEl = document.getElementById('cap-constat-adresse');
  if (adresseEl) { adresseEl.value = ''; adresseEl.style.display = 'none'; }
  document.getElementById('cap-modal-constat').classList.remove('hidden');
  // Géolocalisation
  capRetryGeo();
}

function capRetryGeo() {
  var locText = document.getElementById('cap-constat-loc-text');
  var locBtn = document.getElementById('cap-constat-loc-btn');
  var adresseEl = document.getElementById('cap-constat-adresse');
  if (locText) locText.textContent = currentLang === 'ar' ? '⏳ جارٍ تحديد الموقع...' : '⏳ Récupération de la position...';
  if (locText) locText.style.color = 'var(--muted)';
  if (locBtn) locBtn.classList.add('hidden');
  if (adresseEl) adresseEl.style.display = 'none';

  if (!navigator.geolocation) {
    capGeoFail(currentLang === 'ar' ? 'تحديد الموقع غير مدعوم في هذا المتصفح.' : 'Géolocalisation non supportée par ce navigateur.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      document.getElementById('cap-constat-lat').value = pos.coords.latitude;
      document.getElementById('cap-constat-lng').value = pos.coords.longitude;
      if (locText) {
        locText.textContent = '📍 ' + (currentLang === 'ar' ? 'تم تحديد الموقع' : 'Position capturée') + ' (' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) + ')';
        locText.style.color = '#16a34a';
      }
      if (locBtn) locBtn.classList.add('hidden');
      if (adresseEl) adresseEl.style.display = 'none';
    },
    function(err) {
      var msg = currentLang === 'ar' ? 'الموقع غير متوفر' : 'Position non disponible';
      if (err.code === 1) msg = currentLang === 'ar' ? 'تم رفض الإذن — فعّلوا تحديد الموقع' : 'Permission refusée — activez la localisation';
      else if (err.code === 2) msg = currentLang === 'ar' ? 'الموقع غير متوفر' : 'Position indisponible';
      else if (err.code === 3) msg = currentLang === 'ar' ? 'انتهت المهلة — أعيدوا المحاولة' : 'Délai dépassé — réessayez';
      capGeoFail(msg);
    },
    { timeout: 8000, enableHighAccuracy: true, maximumAge: 30000 }
  );
}

function capGeoFail(msg) {
  var locText = document.getElementById('cap-constat-loc-text');
  var locBtn = document.getElementById('cap-constat-loc-btn');
  var adresseEl = document.getElementById('cap-constat-adresse');
  if (locText) { locText.textContent = '⚠️ ' + msg; locText.style.color = '#f97316'; }
  if (locBtn) locBtn.classList.remove('hidden');
  if (adresseEl) adresseEl.style.display = '';
}

// Photo file input → show filename
(function() {
  function bindPhotoBtn(inputId, nameId) {
    var inp = document.getElementById(inputId);
    if (inp) inp.addEventListener('change', function() {
      var nameEl = document.getElementById(nameId);
      if (nameEl) nameEl.textContent = this.files[0] ? this.files[0].name : '';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      bindPhotoBtn('cap-constat-photo', 'cap-constat-photo-name');
      bindPhotoBtn('cap-rapport-photo', 'cap-rapport-photo-name');
    });
  } else {
    bindPhotoBtn('cap-constat-photo', 'cap-constat-photo-name');
    bindPhotoBtn('cap-rapport-photo', 'cap-rapport-photo-name');
  }
})();

async function capSubmitConstat() {
  var visuel = document.getElementById('cap-constat-visuel').value.trim();
  if (!visuel) { showToast(t('terrain.constat_requis'), 'error'); return; }
  var fd = new FormData();
  fd.append('description', visuel);
  fd.append('famille', document.getElementById('cap-constat-categorie').value);
  fd.append('criticite', document.getElementById('cap-constat-urgence').value);
  var temoignages = document.getElementById('cap-constat-temoignages').value.trim();
  if (temoignages) fd.append('contexte', temoignages);
  var lat = document.getElementById('cap-constat-lat').value;
  var lng = document.getElementById('cap-constat-lng').value;
  if (lat) fd.append('lat', lat);
  if (lng) fd.append('lng', lng);
  fd.append('origine', 'cap');
  var photoFile = document.getElementById('cap-constat-photo').files[0];
  if (photoFile) fd.append('photo', photoFile);
  try {
    var res = await apiFetch('/api/signaler', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: fd
    });
    if (res.ok) {
      document.getElementById('cap-modal-constat').classList.add('hidden');
      showToast(currentLang==='ar'?'تم تسجيل المعاينة الميدانية وإرسالها.':'Constat terrain enregistré et transmis.');
    } else {
      var err = await res.json();
      showToast(err.erreur || err.message || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

function capShowAssistance() { document.getElementById('cap-modal-assistance').classList.remove('hidden'); }
async function capConfirmAssistance() {
  try {
    var res = await apiFetch('/api/cap/assistance', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: document.getElementById('cap-assist-type').value,
        commentaire: document.getElementById('cap-assist-comment').value
      })
    });
    if (res.ok) { showToast(currentLang==='ar'?'تم تسجيل المساعدة.':'Assistance enregistrée.'); }
    else { showToast('Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
  document.getElementById('cap-modal-assistance').classList.add('hidden');
}

// ─── BOARD AGENT ────────────────────────────────────────────
var _boSignals = [];
var _boFiltered = [];
var _boCurrentId = null;
var _boDrawerContext = 'bo'; // 'bo' | 'cc' — context where drawer was opened
var _boAgentMode = 'workbench'; // 'workbench' | 'board'
var _boAgentMap = null;
var _boCapMap = null;
var _boSupMap = null;

var _wbMapMarkers = [];

function initWorkbenchMap(mapElId, signals) {
  var el = document.getElementById(mapElId);
  if (!el) return null;

  var map;
  if (el._leafletMap) {
    // Carte existante : nettoyer les anciens marqueurs
    map = el._leafletMap;
    _wbMapMarkers.forEach(function(m) { map.removeLayer(m); });
    _wbMapMarkers = [];
    setTimeout(function() { map.invalidateSize(); }, 200);
  } else {
    // Première initialisation
    map = L.map(mapElId).setView([36.75, 3.06], 12);
    createTileLayer(map);
    el._leafletMap = map;
    setTimeout(function() { map.invalidateSize(); }, 300);
    // Centrer sur la position GPS de l'utilisateur si disponible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        if (!_wbMapMarkers.length) map.setView([pos.coords.latitude, pos.coords.longitude], 14);
      }, function() {}, { timeout: 5000 });
    }
  }

  if (signals && signals.length) {
    signals.filter(function(s){return s.lat && s.lng;}).forEach(function(s) {
      var lat = parseFloat(s.lat), lng = parseFloat(s.lng);
      if (isNaN(lat) || isNaN(lng) || lat === 0) return;
      var color = etatMarkerColor(s.etat || 'recu');
      var icon = createMarkerIcon(color, s._domaine || s.domaine);
      var marker = L.marker([lat, lng], {icon: icon}).addTo(map).bindPopup(
        '<div style="font-size:12px;"><strong>' + escHtml(arF(s.categorie_nom_ar, s.categorie_nom) || s.categorie || '—') + '</strong><br>📍 ' + escHtml(arF(s.commune_nom_ar, s.commune_nom) || '—') + '<br>' + escHtml(s.etat || '') + '</div>'
      );
      _wbMapMarkers.push(marker);
    });
    // Auto-zoom sur les marqueurs
    if (_wbMapMarkers.length) {
      var group = L.featureGroup(_wbMapMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }
  return map;
}

function boShowNewIntervention() {
  document.getElementById('bo-new-int-desc').value = '';
  document.getElementById('bo-new-int-type').value = 'voirie';
  document.getElementById('bo-new-int-urgence').value = 'moyenne';
  document.getElementById('bo-new-int-lat').value = '';
  document.getElementById('bo-new-int-lng').value = '';
  document.getElementById('bo-new-int-adresse').value = '';
  document.getElementById('bo-new-int-repere').value = '';
  document.getElementById('bo-new-int-geostatus').textContent = '';
  var photoEl = document.getElementById('bo-new-int-photo');
  if (photoEl) photoEl.value = '';
  // Charger communes
  var sel = document.getElementById('bo-new-int-commune');
  if (sel && sel.options.length <= 1 && communes.length) {
    communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; sel.appendChild(o); });
  }
  document.getElementById('bo-modal-new-intervention').classList.remove('hidden');
}

function boNewIntGeolocate() {
  var status = document.getElementById('bo-new-int-geostatus');
  if (!navigator.geolocation) { status.textContent = '⚠️ Géolocalisation non disponible sur cet appareil.'; return; }
  status.textContent = '⏳ Récupération de la position...';
  navigator.geolocation.getCurrentPosition(function(pos) {
    document.getElementById('bo-new-int-lat').value = pos.coords.latitude.toFixed(6);
    document.getElementById('bo-new-int-lng').value = pos.coords.longitude.toFixed(6);
    status.textContent = '✅ Position capturée (' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) + ')';
    status.style.color = 'var(--green)';
  }, function(err) {
    status.textContent = '⚠️ Position non disponible' + (err.message ? ' — ' + err.message : '');
    status.style.color = 'var(--orange)';
  }, { enableHighAccuracy: true, timeout: 10000 });
}

async function boSubmitNewIntervention() {
  var desc = document.getElementById('bo-new-int-desc').value.trim();
  if (!desc) { showToast(t('terrain.desc_obligatoire'), 'error'); return; }
  // Enrichir la description avec adresse et repère
  var adresse = document.getElementById('bo-new-int-adresse').value.trim();
  var repere = document.getElementById('bo-new-int-repere').value.trim();
  var descFull = desc;
  if (adresse) descFull += '\n📍 Adresse : ' + adresse;
  if (repere) descFull += '\n🔖 Repère : ' + repere;
  var fd = new FormData();
  fd.append('description', descFull);
  fd.append('famille', document.getElementById('bo-new-int-type').value);
  fd.append('criticite', document.getElementById('bo-new-int-urgence').value);
  var commune = document.getElementById('bo-new-int-commune').value;
  if (commune) fd.append('communeId', commune);
  var lat = document.getElementById('bo-new-int-lat').value;
  var lng = document.getElementById('bo-new-int-lng').value;
  if (lat) fd.append('lat', lat);
  if (lng) fd.append('lng', lng);
  var photo = document.getElementById('bo-new-int-photo').files[0];
  if (photo) fd.append('photo', photo);
  try {
    var res = await apiFetch('/api/signaler/board', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + getToken() }, body: fd
    });
    if (res.ok) {
      var sig = await res.json();
      showToast('Intervention ' + (sig.reference || '') + ' créée.');
      document.getElementById('bo-modal-new-intervention').classList.add('hidden');
      await initBoAgent();
    } else {
      var err = await res.json();
      showToast(err.erreur || err.message || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

// ── Perdu-Trouvé registre (agent) ──
function boShowPerduTrouve() {
  var reg = document.getElementById('bo-pt-registre');
  if (!reg) return;
  reg.style.display = '';
  loadRegistrePT();
}
async function loadRegistrePT(statut) {
  var el = document.getElementById('bo-pt-list');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('global.chargement') + '</div>';
  try {
    var url = '/api/perdu-trouve/registre' + (statut ? '?statut=' + statut : '');
    var data = await safeFetchJSON(url, {}, true);
    if (!data.length) { el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('global.aucun_resultat') + '</div>'; return; }
    var statutColors = {recue:'#f59e0b',traitee:'#2563eb',cloturee:'#16a34a'};
    var statutLabels = {recue:t('pt.statut_recue'),traitee:t('pt.statut_traitee'),cloturee:t('pt.statut_cloturee')};
    var typeLabels = {perte:t('pt.perte'),trouve:t('pt.trouve')};
    var natureLabels = {document_officiel:t('pt.document'),objet:t('pt.objet')};
    el.innerHTML = data.map(function(d) {
      var color = statutColors[d.statut] || '#666';
      return '<div class="card" style="margin-bottom:8px;padding:12px 14px;border-left:3px solid ' + color + ';">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;gap:8px;flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:160px;">' +
          '<div style="font-weight:700;font-size:13px;color:var(--navy);">' + escHtml(d.reference) + ' — ' + (typeLabels[d.type]||d.type) + ' / ' + (natureLabels[d.nature]||d.nature) + '</div>' +
          '<div style="font-size:12px;color:var(--gray-600);margin:3px 0;">' + escHtml(d.description.substring(0,120)) + '</div>' +
          (d.lieu ? '<div style="font-size:11px;color:var(--muted);">📍 ' + escHtml(d.lieu) + '</div>' : '') +
          '<div style="font-size:11px;color:var(--muted);">' + escHtml((d.declarant_prenom||'') + ' ' + (d.declarant_nom_u||d.declarant_nom||'')) + ' — ' + escHtml(d.declarant_tel||'') + '</div>' +
          '<div style="font-size:11px;color:var(--muted);">' + fmtDateTime(d.cree_le) + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">' +
          '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + color + '20;color:' + color + ';font-weight:600;">' + (statutLabels[d.statut]||d.statut) + '</span>' +
          (d.statut === 'recue' ? '<button class="btn btn-sm btn-outline" onclick="ptTraiter(' + d.id + ')" style="font-size:11px;">' + t('pt.traiter') + '</button>' : '') +
          (d.statut === 'traitee' ? '<button class="btn btn-sm btn-outline" onclick="ptCloturer(' + d.id + ')" style="font-size:11px;">' + t('pt.cloturer') + '</button>' : '') +
        '</div></div></div>';
    }).join('');
  } catch(e) { el.innerHTML = '<div style="color:var(--red);padding:12px;">' + escHtml(e.message) + '</div>'; }
}
async function ptTraiter(id) {
  try {
    await apiFetch('/api/perdu-trouve/' + id, { method:'PATCH', headers:{...authHeaders(),'Content-Type':'application/json'}, body:JSON.stringify({statut:'traitee'}) });
    showToast(t('pt.statut_traitee'));
    loadRegistrePT();
  } catch(e) { showToast(e.message, 'error'); }
}
async function ptCloturer(id) {
  try {
    await apiFetch('/api/perdu-trouve/' + id, { method:'PATCH', headers:{...authHeaders(),'Content-Type':'application/json'}, body:JSON.stringify({statut:'cloturee'}) });
    showToast(t('pt.statut_cloturee'));
    loadRegistrePT();
  } catch(e) { showToast(e.message, 'error'); }
}
async function boLoadOrphelins() {
  var section = document.getElementById('bo-orphelins-section');
  if (!section) return;
  try {
    var orphelins = await safeFetchJSON('/api/signaler/board/orphelins', {}, true);
    if (!orphelins.length) { section.style.display = 'none'; return; }
    section.style.display = '';
    var badge = document.getElementById('bo-orphelins-badge');
    if (badge) badge.textContent = orphelins.length;
    var list = document.getElementById('bo-orphelins-list');
    if (!list) return;
    // Load EPICs for the dropdown
    var epics = [];
    try { epics = await safeFetchJSON('/api/signaler/epics', {}, true); } catch(e) { console.warn('[bo] échec chargement EPICs:', e.message); }
    var isAr = currentLang === 'ar';
    list.innerHTML = orphelins.map(function(s) {
      var catLabel = isAr && s.categorie_nom_ar ? s.categorie_nom_ar : s.categorie_nom || s.domaine;
      var communeLabel = isAr && s.commune_nom_ar ? s.commune_nom_ar : s.commune_nom || '—';
      var date = new Date(s.cree_le).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-DZ', {day:'numeric',month:'short'});
      var epicOptions = epics.filter(function(e){return e.actif;}).map(function(e) {
        return '<option value="' + e.id + '">' + escHtml(e.sigle) + ' — ' + escHtml(e.nom) + '</option>';
      }).join('');
      return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #fde68a;" id="orphelin-row-' + s.id + '">' +
        '<div style="flex:1;min-width:0;">' +
          '<span style="font-weight:700;color:#92400e;">#' + escHtml(s.reference) + '</span>' +
          '<span style="color:#78716c;margin-left:6px;">' + escHtml(catLabel) + '</span>' +
          '<span style="color:#a8a29e;margin-left:6px;">' + communeLabel + ' · ' + date + '</span>' +
        '</div>' +
        '<select id="epic-sel-' + s.id + '" style="font-size:11px;padding:4px 6px;border-radius:6px;border:1px solid #d6d3d1;max-width:200px;">' +
          '<option value="">' + (isAr ? '— اختيار EPIC —' : '— Choisir EPIC —') + '</option>' + epicOptions +
        '</select>' +
        '<button onclick="boAssignerEpic(\'' + s.id + '\')" class="btn btn-sm btn-primary" style="font-size:11px;padding:4px 10px;white-space:nowrap;">' + (isAr ? 'تعيين' : 'Assigner') + '</button>' +
      '</div>';
    }).join('');
  } catch(e) { console.warn('[bo] échec chargement orphelins:', e.message); section.style.display = 'none'; }
}

async function boAssignerEpic(sigId) {
  var sel = document.getElementById('epic-sel-' + sigId);
  if (!sel || !sel.value) { showToast(currentLang === 'ar' ? 'اختاروا EPIC أولا' : 'Choisissez un EPIC d\'abord.', 'error'); return; }
  try {
    var res = await apiFetch('/api/signaler/board/' + sigId + '/assigner-epic', {
      method: 'PATCH',
      headers: Object.assign({}, authHeaders(), {'Content-Type': 'application/json'}),
      body: JSON.stringify({ epic_id: parseInt(sel.value) })
    });
    if (!res.ok) { var err = await res.json(); throw new Error(err.erreur || 'Erreur'); }
    var data = await res.json();
    showToast((currentLang === 'ar' ? 'تم التعيين إلى ' : 'Assigné à ') + data.epic, 'success');
    var row = document.getElementById('orphelin-row-' + sigId);
    if (row) row.remove();
    // Update badge
    var badge = document.getElementById('bo-orphelins-badge');
    var remaining = document.querySelectorAll('[id^="orphelin-row-"]').length;
    if (badge) badge.textContent = remaining;
    if (remaining === 0) {
      var section = document.getElementById('bo-orphelins-section');
      if (section) section.style.display = 'none';
    }
  } catch(e) { showToast(e.message, 'error'); }
}

async function boLoadPTBadge() {
  try {
    var d = await safeFetchJSON('/api/perdu-trouve/registre/count', {}, true);
    var badge = document.getElementById('bo-pt-badge');
    if (badge && d.recues > 0) { badge.textContent = d.recues; badge.style.display = ''; }
    else if (badge) { badge.style.display = 'none'; }
  } catch(e) { console.warn('[bo] échec chargement badge perdu-trouvé:', e.message); }
}

function boShowBoard() {
  _boAgentMode = 'board';
  var wbEl = document.getElementById('bo-wb-section');
  var bdEl = document.getElementById('bo-board-section');
  if (wbEl) wbEl.style.display = 'none';
  if (bdEl) bdEl.style.display = '';
  boFilterSignals();
  window.scrollTo(0, 0);
}
function boShowWorkbench() {
  _boAgentMode = 'workbench';
  var wbEl = document.getElementById('bo-wb-section');
  var bdEl = document.getElementById('bo-board-section');
  if (wbEl) wbEl.style.display = '';
  if (bdEl) bdEl.style.display = 'none';
  window.scrollTo(0, 0);
}

async function initBoAgent() {
  var u = currentUser || {};
  var nameEl = document.getElementById('bo-agent-name');
  // Résoudre le nom du service pour l'opérateur
  var serviceName = '';
  if ((u.fonction === 'entite_responsable' || u.role === 'operateur') && (u.operateur_id || u.organisation_id)) {
    try {
      var ops = await safeFetchJSON('/api/referentiel/operateurs', {}, true);
      var op = ops.find(function(o) { return o.id === u.operateur_id; });
      if (op) serviceName = op.nom || '';
    } catch(e) { console.warn('[bo] échec résolution nom service:', e.message); }
  }
  var roleTitle = u.role === 'admin_wilaya' ? 'Pilotage stratégique'
    : u.role === 'admin_apc' ? 'Centre Opérationnel'
    : (u.fonction === 'entite_responsable' || u.role === 'operateur') ? 'Responsable — ' + (u.organisation_nom || serviceName || u.operateur_nom || 'Service')
    : t('bo.role_agent');
  if (nameEl) nameEl.textContent = roleTitle + ' — ' + (u.prenom || u.nom || '');
  // Peupler le bloc identité structuré
  var idUser = document.getElementById('bo-agent-id-user');
  if (idUser) idUser.textContent = (u.prenom || '') + ' ' + (u.nom || '');
  var roleEl = document.getElementById('bo-agent-role');
  // Adapter le sous-titre selon le rôle
  if (u.fonction === 'entite_responsable' || u.role === 'operateur') {
    if (roleEl) roleEl.textContent = t('bo.role_epic_desc');
    // Adapter identité structurée
    var idPoste = document.getElementById('bo-agent-id-poste');
    var idService = document.getElementById('bo-agent-id-service');
    var idOrg = document.getElementById('bo-agent-id-org');
    if (idPoste) idPoste.textContent = 'Responsable du service';
    if (idService) idService.textContent = u.organisation_nom || serviceName || 'Service';
    if (idOrg) idOrg.textContent = 'Wilaya d\'Alger';
    // Adapter permissions
    var canEl = document.getElementById('bo-agent-can');
    var cannotEl = document.getElementById('bo-agent-cannot');
    if (canEl) canEl.innerHTML = '✓ Organiser les interventions<br>✓ Affecter à une équipe<br>✓ Suivre l\'avancement<br>✓ Déclarer l\'intervention terminée<br>✓ Demander une précision à la Wilaya';
    if (cannotEl) cannotEl.innerHTML = '✗ Qualifier un signalement<br>✗ Rejeter un dossier<br>✗ Demander une intervention CAP<br>✗ Publier un communiqué<br>✗ Clôturer administrativement';
    // Adapter étape pédagogique
    var etapeEl = document.getElementById('bo-agent-etape');
    if (etapeEl) etapeEl.textContent = 'Vous intervenez à l\'étape 3 : Traitement et résolution.';
    // Adapter chaîne de responsabilité
    var chainFrom = document.getElementById('bo-agent-chain-from');
    var chainTo = document.getElementById('bo-agent-chain-to');
    var chainDecide = document.getElementById('bo-agent-chain-decide');
    var chainForbid = document.getElementById('bo-agent-chain-forbidden');
    if (chainFrom) chainFrom.textContent = 'Centre de Réception et de Coordination — Wilaya';
    if (chainTo) chainTo.textContent = 'Centre de Réception — Wilaya';
    if (chainDecide) chainDecide.textContent = 'Organiser, affecter, exécuter, déclarer terminé';
    if (chainForbid) chainForbid.textContent = 'Qualifier, rejeter, demander le CAP, publier';
    // Adapter KPI labels — cohérents avec les valeurs
    var lRecu = document.getElementById('bo-kpi-recu-label');
    var lTraiter = document.getElementById('bo-kpi-traiter-label');
    var lResolu = document.getElementById('bo-kpi-resolu-label');
    var lUrgents = document.getElementById('bo-kpi-urgents-label');
    if (lRecu) lRecu.textContent = t('bo.kpi_a_traiter');
    if (lTraiter) lTraiter.textContent = t('bo.kpi_interventions');
    if (lResolu) lResolu.textContent = t('bo.kpi_resolus');
    if (lUrgents) lUrgents.textContent = t('bo.kpi_retard_48');
    // Board header adapté
    var boardTitle = document.getElementById('bo-board-title');
    var boardSub = document.getElementById('bo-board-subtitle');
    if (boardTitle) boardTitle.textContent = 'Dossiers du service';
    if (boardSub) boardSub.textContent = 'À traiter → En cours → Intervention terminée';
    // Masquer la section "Ma mission aujourd'hui" label pour afficher "Mon activité"
    var missionLabel = document.querySelector('#bo-wb-section .wb-section-label');
    if (missionLabel) missionLabel.textContent = t('bo.activite_jour');
  } else {
    if (roleEl) roleEl.textContent = t('bo.role_agent_desc');
  }

  // Populate commune filter
  var commSel = document.getElementById('bo-filter-commune');
  if (commSel && commSel.options.length <= 1 && communes.length) {
    communes.forEach(function(c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.nom; commSel.appendChild(o); });
  }

  // Load ALL signalements (tous domaines) via board endpoint
  try {
    var res = await apiFetch('/api/signaler/board', { headers: authHeaders() });
    _boSignals = [];
    if (res.ok) {
      var data = await res.json();
      _boSignals = Array.isArray(data) ? data : [];
      _boSignals.forEach(function(s) { s._domaine = s.domaine || 'general'; });
    }
  } catch(e) { console.warn('[bo-agent]', e.message); }

  var isEpicUser = u.fonction === 'entite_responsable' || u.role === 'operateur';
  var recuCount = isEpicUser
    ? _boSignals.filter(function(s){return s.etat==='transmis';}).length
    : _boSignals.filter(function(s){return s.etat==='recu';}).length;
  var agentCountEl = document.getElementById('bo-agent-count');
  if (agentCountEl) agentCountEl.textContent = recuCount;

  // Reset to workbench mode
  _boAgentMode = 'workbench';
  var wbEl = document.getElementById('bo-wb-section');
  var bdEl = document.getElementById('bo-board-section');
  if (wbEl) wbEl.style.display = '';
  if (bdEl) bdEl.style.display = 'none';

  // Populate workbench context
  var ctxEl = document.getElementById('bo-agent-context');
  if (ctxEl) {
    var today = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : 'fr-DZ', {weekday:'long', day:'numeric', month:'long'});
    var orgLabel = (u.fonction === 'entite_responsable' || u.role === 'operateur') ? (serviceName || u.organisation_nom || u.service_nom || 'Service') : 'Wilaya d\'Alger';
    ctxEl.textContent = orgLabel + ' · ' + (u.commune_nom || 'Alger') + ' · ' + today;
  }

  // Workbench KPIs — adaptés au rôle
  var kpiRecu = document.getElementById('bo-kpi-recu');
  var kpiTraiter = document.getElementById('bo-kpi-traiter');
  var kpiUrgents = document.getElementById('bo-kpi-urgents');
  var kpiResolu = document.getElementById('bo-kpi-resolu');
  var todayStr = new Date().toDateString();
  if (u.fonction === 'agent_traitant' || u.role === 'agent') {
    // Agent de réception : reçus aujourd'hui, à qualifier, en suivi, en retard
    if (kpiRecu) kpiRecu.textContent = _boSignals.filter(function(s){ return new Date(s.cree_le).toDateString()===todayStr; }).length;
    if (kpiTraiter) kpiTraiter.textContent = recuCount;
    if (kpiResolu) kpiResolu.textContent = _boSignals.filter(function(s){return ['transmis','en_intervention'].includes(s.etat);}).length;
    if (kpiUrgents) kpiUrgents.textContent = _boSignals.filter(function(s){return s.etat==='recu'&&boIsOld(s.cree_le);}).length;
  } else if (u.fonction === 'entite_responsable' || u.role === 'operateur') {
    // Responsable de service EPIC
    var nbTransmis = _boSignals.filter(function(s){return s.etat==='transmis';}).length;
    var nbIntervention = _boSignals.filter(function(s){return s.etat==='en_intervention'||s.etat==='pris_en_charge';}).length;
    var nbResolu = _boSignals.filter(function(s){return s.etat==='resolu';}).length;
    var nbRetard = _boSignals.filter(function(s){return (s.etat==='transmis'||s.etat==='en_intervention'||s.etat==='pris_en_charge')&&boIsOld(s.cree_le);}).length;
    if (kpiRecu) kpiRecu.textContent = nbTransmis;
    if (kpiTraiter) kpiTraiter.textContent = nbIntervention;
    if (kpiResolu) kpiResolu.textContent = nbResolu;
    if (kpiUrgents) kpiUrgents.textContent = nbRetard;
  } else {
    if (kpiRecu) kpiRecu.textContent = recuCount;
    if (kpiTraiter) kpiTraiter.textContent = _boSignals.filter(function(s){return ['recu','transmis'].includes(s.etat);}).length;
    if (kpiResolu) kpiResolu.textContent = _boSignals.filter(function(s){
      if (s.etat !== 'resolu') return false;
      return new Date(s.mis_a_jour_le || s.cree_le).toDateString() === todayStr;
    }).length;
    if (kpiUrgents) kpiUrgents.textContent = _boSignals.filter(function(s){return s.criticite==='haute'&&s.etat!=='resolu'&&s.etat!=='rejete';}).length;
  }

  // Orphelins à router manuellement
  boLoadOrphelins();

  // Badge Perdu-Trouvé
  boLoadPTBadge();

  // Board KPIs (duplicate IDs avoided with -b suffix)
  var kpiRecuB = document.getElementById('bo-kpi-recu-b');
  var kpiRetardB = document.getElementById('bo-kpi-retard-b');
  var kpiCapB = document.getElementById('bo-kpi-cap-b');
  var kpiResoluB = document.getElementById('bo-kpi-resolu-b');
  var countBoard = document.getElementById('bo-agent-count-board');
  if (kpiRecuB) kpiRecuB.textContent = recuCount;
  if (kpiRetardB) kpiRetardB.textContent = _boSignals.filter(function(s){ return s.etat==='recu' && boIsOld(s.cree_le); }).length;
  if (kpiCapB) kpiCapB.textContent = _boSignals.filter(function(s){return s.etat==='cap';}).length;
  if (kpiResoluB) kpiResoluB.textContent = _boSignals.filter(function(s){return s.etat==='resolu';}).length;
  if (countBoard) countBoard.textContent = recuCount;

  // Workbench alerts + activity
  boRenderWbAlertes();
  boRenderWbActivite();

  // Carte des signalements (agent + entité)
  if (document.getElementById('bo-agent-map')) {
    _boAgentMap = initWorkbenchMap('bo-agent-map', _boSignals);
  }

  boFilterSignals();

  // Ouvrir un drawer depuis une notification (sessionStorage)
  var pendingId = sessionStorage.getItem('algerna_open_drawer');
  if (pendingId) {
    sessionStorage.removeItem('algerna_open_drawer');
    boShowBoard();
    setTimeout(function() {
      if (_boSignals && _boSignals.find(function(s) { return s.id === pendingId; })) {
        boOpenDrawer(pendingId);
      } else {
        showToast(t('bo.dossier_indisponible'), 'error');
      }
    }, 300);
  }
}

function boIsOld(dateStr) {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) > 48 * 3600 * 1000;
}

function boRenderWbAlertes() {
  var el = document.getElementById('bo-wb-alertes');
  if (!el) return;
  var u = currentUser || {};
  var isEpic = u.fonction === 'entite_responsable';
  // Pour EPIC : "retard" = transmis ou en_intervention depuis >48h
  var retard = _boSignals.filter(function(s){
    if (!boIsOld(s.cree_le)) return false;
    if (isEpic) return s.etat === 'transmis' || s.etat === 'en_intervention';
    return s.etat === 'recu';
  });
  var urgent = _boSignals.filter(function(s){ return (s.criticite === 'haute' || s.gravite === 'danger_immediat' || s.gravite === 'risque_blessure') && s.etat !== 'resolu' && s.etat !== 'rejete'; });
  var html = '';
  if (!retard.length && !urgent.length) {
    html = '<div class="ops-empty" style="padding:16px;"><p>Aucune alerte en cours</p></div>';
  } else {
    if (urgent.length) {
      html += urgent.slice(0,3).map(function(s) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--ops-border);display:flex;gap:8px;align-items:center;cursor:pointer;" onclick="boOpenDrawer(\''+s.id+'\')">' +
          '<span class="ops-sla ops-sla-breach">Urgent</span>' +
          '<span style="font-weight:600;font-size:13px;">' + escHtml(locCat(s)||s.reference||'\u2014') + '</span>' +
          '<span style="font-size:12px;color:var(--muted);">\u2014 ' + escHtml(s.commune_nom||'') + '</span>' +
        '</div>';
      }).join('');
    }
    if (retard.length) {
      html += retard.slice(0,3).map(function(s) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--ops-border);display:flex;gap:8px;align-items:center;cursor:pointer;" onclick="boOpenDrawer(\''+s.id+'\')">' +
          '<span class="ops-sla ops-sla-warn">En retard</span>' +
          '<span style="font-size:13px;">' + escHtml(s.reference||'\u2014') + '</span>' +
          '<span style="font-size:12px;color:var(--muted);">\u2014 ' + escHtml(s.commune_nom||'') + '</span>' +
        '</div>';
      }).join('');
    }
  }
  el.innerHTML = html;
}

function boRenderWbActivite() {
  var el = document.getElementById('bo-wb-activite');
  if (!el) return;
  // Montrer les dossiers EN COURS (non résolus, non rejetés) triés par date
  var enCours = _boSignals.filter(function(s) { return s.etat !== 'resolu' && s.etat !== 'rejete'; });
  enCours.sort(function(a,b){return new Date(b.cree_le)-new Date(a.cree_le);});
  var display = enCours.slice(0,8);
  el.innerHTML = display.length
    ? display.map(function(s) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--ops-border);cursor:pointer;" onclick="boOpenDrawer(\''+s.id+'\')">' +
          '<div style="font-size:13px;font-weight:600;color:var(--navy);">' + escHtml(locCat(s)||s.reference||'\u2014') + '</div>' +
          '<div style="font-size:11px;color:var(--muted);">' + escHtml(locCommune(s)) + ' \u00b7 ' + opsStatusBadge(s.etat) + '</div>' +
        '</div>';
      }).join('')
    : '<div class="ops-empty" style="padding:12px;"><p>Aucun dossier en cours</p></div>';
}

function boFilterSignals() {
  var q = (document.getElementById('bo-search').value||'').toLowerCase();
  var commune = document.getElementById('bo-filter-commune').value;
  var urgence = document.getElementById('bo-filter-urgence').value;
  var sort = document.getElementById('bo-sort').value;

  _boFiltered = _boSignals.filter(function(s) {
    if (q && !((s.categorie||s.categorie_nom||'').toLowerCase().indexOf(q)>-1) && !((s.reference||'').toLowerCase().indexOf(q)>-1) && !((s.description||'').toLowerCase().indexOf(q)>-1) && !((s.commune_nom||s.commune||'').toLowerCase().indexOf(q)>-1)) return false;
    if (commune && String(s.commune_id) !== commune) return false;
    if (urgence && (s.criticite||'moyenne') !== urgence) return false;
    return true;
  });

  // Sort
  _boFiltered.sort(function(a,b) {
    if (sort==='ancien') return new Date(a.cree_le)-new Date(b.cree_le);
    if (sort==='urgence') { var m={haute:0,moyenne:1,basse:2}; return (m[a.criticite]||1)-(m[b.criticite]||1); }
    if (sort==='commune') return (a.commune_nom||'').localeCompare(b.commune_nom||'');
    return new Date(b.cree_le)-new Date(a.cree_le);
  });

  boRenderKanban();
}

async function boLoadKanban() {
  try {
    var res = await apiFetch('/api/signaler/board', { headers: authHeaders() });
    if (res.ok) {
      var data = await res.json();
      _boSignals = Array.isArray(data) ? data : [];
      _boSignals.forEach(function(s) { s._domaine = s.domaine || 'general'; });
      boFilterSignals();
    }
  } catch(e) { console.warn('[boLoadKanban]', e.message); }
}

function boRenderKanban() {
  var cols = {recu:[],transmis:[],pris_en_charge:[],en_intervention:[],a_valider:[],resolu:[],rejete:[]};
  _boFiltered.forEach(function(s) { var e = s.etat||'recu'; if (cols[e]) cols[e].push(s); else if (e==='cap') cols.en_intervention.push(s); else cols.recu.push(s); });

  // Masquer/renommer les colonnes selon le rôle
  var role = currentUser ? currentUser.role : '';
  var kanbanCols = document.querySelectorAll('#bo-kanban .kanban-col');
  kanbanCols.forEach(function(col) {
    var etat = col.dataset.etat;
    var label = col.querySelector('.kanban-col-header span:first-child');
    if (hasFonction('entite_responsable')) {
      col.style.display = ['transmis','pris_en_charge','en_intervention','a_valider','resolu'].includes(etat) ? '' : 'none';
      if (label && etat === 'transmis') label.textContent = t('epic.a_traiter');
      if (label && etat === 'pris_en_charge') label.textContent = t('epic.pris_en_charge');
      if (label && etat === 'en_intervention') label.textContent = t('epic.en_intervention');
      if (label && etat === 'a_valider') label.textContent = t('epic.cr_envoye');
      if (label && etat === 'resolu') label.textContent = t('epic.termine');
    } else if (hasFonction('agent_traitant')) {
      col.style.display = '';
      if (label && etat === 'recu') label.textContent = t('bo.col_recu');
      if (label && etat === 'transmis') label.textContent = t('bo.col_transmis');
      if (label && etat === 'pris_en_charge') label.textContent = t('bo.col_pris_en_charge');
      if (label && etat === 'en_intervention') label.textContent = t('bo.kpi_en_suivi');
      if (label && etat === 'a_valider') label.textContent = t('bo.col_a_valider');
      if (label && etat === 'resolu') label.textContent = 'Résolu — à clôturer';
      if (label && etat === 'clos') label.textContent = t('bo.col_clos');
      if (label && etat === 'rejete') label.textContent = t('bo.col_rejete');
    } else {
      col.style.display = '';
    }
  });

  // Update counts
  for (var k in cols) {
    var ce = document.getElementById('kc-'+k); if(ce) ce.textContent = cols[k].length;
    var le = document.getElementById('kl-'+k); if(!le) continue;
    if (!cols[k].length) { le.innerHTML = '<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px;">—</div>'; continue; }
    le.innerHTML = cols[k].map(function(s) {
      var ago = boTimeAgo(s.cree_le);
      var cardTitle = s.sous_categorie_a_affiner ? sigFamilleLabel(s.categorie_famille) : locCat(s);
      if (s.sous_categorie_a_affiner && s.description) cardTitle += ' — ' + s.description.substring(0, 40);
      return '<div class="kanban-card" onclick="boOpenDrawer(\''+s.id+'\')">' +
        '<div class="kanban-card-title">' + escHtml(cardTitle) + '</div>' +
        '<div class="kanban-card-meta">📍 ' + escHtml(locCommune(s)) + ' · ' + ago + '</div>' +
        '<div style="margin-top:6px;display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' +
          opsPrioBadge(s.criticite||'moyenne') +
          opsSlaBadge(s.cree_le, 48) +
          (s.photo_path ? '<span style="font-size:11px;color:var(--muted);">📷</span>' : '') +
          (s.sous_categorie_a_affiner ? '<span style="font-size:9px;padding:1px 5px;border-radius:6px;background:#fef3c7;color:#92400e;font-weight:600;">' + t('bo.badge_a_affiner') + '</span>' : '') +
        '</div></div>';
    }).join('');
  }

  // KPI — board section (IDs with -b suffix)
  var kpiR = document.getElementById('bo-kpi-recu-b');
  if (kpiR) kpiR.textContent = cols.recu.length;
  var kpiAQ = document.getElementById('bo-kpi-aqualifier-b');
  if (kpiAQ) kpiAQ.textContent = cols.recu.length;
  var kpiRt = document.getElementById('bo-kpi-retard-b');
  if (kpiRt) kpiRt.textContent = _boFiltered.filter(function(s){return s.etat==='recu'&&boIsOld(s.cree_le);}).length;
  var kpiC = document.getElementById('bo-kpi-cap-b');
  if (kpiC) kpiC.textContent = cols.transmis.length;
  var kpiRs = document.getElementById('bo-kpi-resolu-b');
  if (kpiRs) kpiRs.textContent = cols.resolu.length;
}

function boTimeAgo(d) {
  if (!d) return '—';
  var diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 60) return Math.round(diff) + ' min';
  if (diff < 1440) return Math.round(diff/60) + 'h';
  return Math.round(diff/1440) + 'j';
}

async function boOpenDrawer(id) {
  _boCurrentId = id;
  // If not called from boOpenSignalement, context is BO
  if (_boDrawerContext !== 'cc') _boDrawerContext = 'bo';
  var isCcContext = _boDrawerContext === 'cc';
  var s = _boSignals.find(function(x){return x.id===id;});
  if (!s) { showToast(t('bo.dossier_introuvable'), 'error'); return; }
  var content = document.getElementById('bo-drawer-content');
  var actions = document.getElementById('bo-drawer-actions');
  document.getElementById('bo-drawer-title').textContent = s.reference || 'Fiche signalement';

  // Fiche structurée en 3 blocs : Signalement / Analyse / Historique
  var ficheHtml = '';

  // ── BLOC 1 — Le signalement ──
  ficheHtml += '<div style="margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line);">';
  ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + t('bo.drawer_signalement') + '</div>';
  if (s.photo_path) ficheHtml += '<img src="/'+escHtml(s.photo_path)+'" style="width:100%;border-radius:12px;max-height:180px;object-fit:cover;margin-bottom:10px;" onerror="this.style.display=\'none\'">';
  var ficheCategorie = s.sous_categorie_a_affiner ? sigFamilleLabel(s.categorie_famille) : locCat(s);
  ficheHtml += '<div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:4px;">' + escHtml(ficheCategorie) + (s.sous_categorie_a_affiner ? ' <span style="font-size:10px;padding:1px 5px;border-radius:6px;background:#fef3c7;color:#92400e;font-weight:600;">' + t('bo.badge_a_affiner') + '</span>' : '') + '</div>';
  if (s.description) ficheHtml += '<p style="font-size:13px;color:var(--gray-700);line-height:1.5;margin:6px 0;">' + escHtml(s.description) + '</p>';
  ficheHtml += '<div style="font-size:12px;color:var(--muted);margin-top:6px;">📍 ' + escHtml(locCommune(s));
  if (s.lat && s.lng) ficheHtml += ' · <a href="https://www.google.com/maps?q='+s.lat+','+s.lng+'" target="_blank" style="color:var(--teal);text-decoration:none;font-weight:600;">' + t('bo.voir_carte') + '</a>';
  ficheHtml += '</div>';
  ficheHtml += '<div style="font-size:12px;color:var(--muted);margin-top:2px;">📅 ' + fmtDateTime(s.cree_le) + '</div>';
  if (s.citoyen_prenom) ficheHtml += '<div style="font-size:12px;color:var(--muted);margin-top:2px;">👤 ' + escHtml(s.citoyen_prenom + ' ' + (s.citoyen_nom||'')) + (s.citoyen_tel ? ' · 📞 ' + escHtml(s.citoyen_tel) : '') + '</div>';
  ficheHtml += '</div>';

  // ── BLOC CC — Pilotage institutionnel (CC context only, before Analyse) ──
  if (isCcContext) {
    var dpNom = currentLang === 'ar' && s.direction_pilote_nom_ar ? s.direction_pilote_nom_ar : (s.direction_pilote_nom || '—');
    var oeNom = currentLang === 'ar' && s.executant_nom_ar ? s.executant_nom_ar : (s.executant_nom || '—');
    var daNom = currentLang === 'ar' && s.daira_nom_ar ? s.daira_nom_ar : (s.daira_nom || '—');
    var coNom = currentLang === 'ar' && s.commune_nom_ar ? s.commune_nom_ar : (s.commune_nom || '—');
    ficheHtml += '<div style="margin-bottom:16px;background:#EFF6FF;border-radius:12px;padding:14px 16px;border:1px solid #BFDBFE;">';
    ficheHtml += '<div style="font-size:11px;font-weight:700;color:#1E40AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + t('cc.pilotage_institutionnel') + '</div>';
    ficheHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;font-size:12px;">';
    ficheHtml += '<div><span style="color:var(--muted);">' + t('cc.direction_pilote') + '</span><div style="font-weight:600;color:var(--navy);margin-top:2px;">' + escHtml(dpNom) + '</div></div>';
    ficheHtml += '<div><span style="color:var(--muted);">' + t('cc.executant') + '</span><div style="font-weight:600;color:var(--navy);margin-top:2px;">' + escHtml(oeNom) + '</div></div>';
    ficheHtml += '<div><span style="color:var(--muted);">' + t('cc.dairas') + '</span><div style="font-weight:600;color:var(--navy);margin-top:2px;">' + escHtml(daNom) + '</div></div>';
    ficheHtml += '<div><span style="color:var(--muted);">' + t('cc.commune_label') + '</span><div style="font-weight:600;color:var(--navy);margin-top:2px;">' + escHtml(coNom) + '</div></div>';
    ficheHtml += '</div></div>';
  }

  // ── BLOC 2 — Analyse ──
  var etatLabels = {recu:t('bo.col_recu'),transmis:t('bo.col_transmis'),pris_en_charge:t('bo.col_pris_en_charge'),en_intervention:t('bo.col_en_intervention'),a_valider:t('bo.col_a_valider'),resolu:'Résolu',clos:t('bo.col_clos'),rejete:t('bo.col_rejete')};
  // Note: etatLabels redéfini ici pour usage local dans le drawer
  var criticiteLabels = currentLang === 'ar'
    ? {haute:'استعجال عالي',moyenne:'استعجال متوسط',basse:'استعجال منخفض'}
    : {haute:'Urgence haute',moyenne:'Urgence moyenne',basse:'Urgence basse'};
  ficheHtml += '<div style="margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line);">';
  ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + t('bo.drawer_analyse') + '</div>';
  ficheHtml += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">';
  ficheHtml += '<span class="kanban-card-badge" style="background:#fee2e2;color:#EF4444;">' + escHtml(etatLabels[s.etat] || s.etat) + '</span>';
  ficheHtml += '<span class="kanban-card-badge" style="background:#fef3c7;color:#F59E0B;">' + escHtml(criticiteLabels[s.criticite] || s.criticite) + '</span>';
  ficheHtml += '<span class="kanban-card-badge" style="background:var(--blue-light);color:var(--blue);">' + escHtml(locDomaine(s._domaine||s.domaine)) + '</span>';
  if (s.nb_confirmations > 0) ficheHtml += '<span class="kanban-card-badge" style="background:' + (s.nb_confirmations >= 3 ? '#dc2626' : '#7c3aed') + ';color:white;font-weight:700;">' + (currentLang==='ar' ? 'أكّده ' + s.nb_confirmations + ' مواطنين' : 'Confirmé par ' + s.nb_confirmations + ' citoyen' + (s.nb_confirmations > 1 ? 's' : '')) + '</span>';
  ficheHtml += '</div>';
  ficheHtml += '<div style="font-size:12px;color:var(--muted);">' + escHtml(s.reference||'—') + '</div>';
  ficheHtml += '</div>';

  // ── BLOC 2B — Planification interne (EPIC + superviseur lecture, CC always read-only) ──
  var showPlanifBlock = ['pris_en_charge','en_intervention','a_valider','resolu'].includes(s.etat) && (hasFonction('entite_responsable') || hasFonction('superviseur'));
  if (isCcContext && !['clos','rejete'].includes(s.etat)) showPlanifBlock = true;
  if (showPlanifBlock) {
    var isEpic = hasFonction('entite_responsable') && !isCcContext;
    var hasPlanif = s.equipe_interne || s.responsable_intervention || s.delai_prevu;
    var canEdit = isEpic && ['pris_en_charge'].includes(s.etat);
    var canModify = isEpic && s.etat === 'en_intervention';
    var readOnly = !isEpic || ['a_valider','resolu'].includes(s.etat);
    var lEquipe = t('epic.planif_equipe');
    var lResp = t('epic.planif_resp');
    var lDate = t('epic.planif_date');

    ficheHtml += '<div id="bo-drawer-planif" style="margin-bottom:16px;background:#f8f9fb;border-radius:12px;padding:14px 16px;border:1px solid var(--line);">';
    ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">' + t('bo.drawer_planif') + '</div>';

    if (canEdit) {
      // pris_en_charge : formulaire éditable pré-rempli
      ficheHtml += '<div id="planif-form" style="display:flex;flex-direction:column;gap:8px;">' +
        '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lEquipe + ' :</span><input id="planif-equipe" type="text" value="' + escHtml(s.equipe_interne||'') + '" placeholder="Ex : Équipe voirie 3" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
        '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lResp + ' :</span><input id="planif-responsable" type="text" value="' + escHtml(s.responsable_intervention||'') + '" placeholder="Nom" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
        '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lDate + ' :</span><input id="planif-date" type="date" value="' + (s.delai_prevu ? new Date(s.delai_prevu).toISOString().slice(0,10) : '') + '" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
        '<button class="btn btn-sm btn-outline" onclick="boSavePlanification()" style="margin-top:4px;font-size:11px;align-self:flex-end;">' + t('epic.planif_enregistrer') + '</button>' +
      '</div>';
    } else if (canModify) {
      // en_intervention : récap lecture seule + lien Modifier
      if (hasPlanif) {
        ficheHtml += '<div id="planif-recap" style="font-size:12px;color:var(--navy);line-height:1.8;">' +
          (s.equipe_interne ? '<div>' + lEquipe + ' : <strong>' + escHtml(s.equipe_interne) + '</strong></div>' : '') +
          (s.responsable_intervention ? '<div>' + lResp + ' : <strong>' + escHtml(s.responsable_intervention) + '</strong></div>' : '') +
          (s.delai_prevu ? '<div>' + lDate + ' : <strong>' + fmtDateTime(s.delai_prevu) + '</strong></div>' : '') +
          '<a onclick="document.getElementById(\'planif-recap\').style.display=\'none\';document.getElementById(\'planif-edit\').style.display=\'\';" style="font-size:11px;color:var(--teal);cursor:pointer;margin-top:4px;display:inline-block;">' + t('admin.modifier') + '</a>' +
        '</div>';
        ficheHtml += '<div id="planif-edit" style="display:none;flex-direction:column;gap:8px;">' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lEquipe + ' :</span><input id="planif-equipe" type="text" value="' + escHtml(s.equipe_interne||'') + '" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lResp + ' :</span><input id="planif-responsable" type="text" value="' + escHtml(s.responsable_intervention||'') + '" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lDate + ' :</span><input id="planif-date" type="date" value="' + (s.delai_prevu ? new Date(s.delai_prevu).toISOString().slice(0,10) : '') + '" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
          '<button class="btn btn-sm btn-outline" onclick="boSavePlanification()" style="margin-top:4px;font-size:11px;align-self:flex-end;">' + t('epic.planif_enregistrer') + '</button>' +
        '</div>';
      } else {
        ficheHtml += '<div style="font-size:12px;color:var(--muted);">—</div>' +
          '<a onclick="document.getElementById(\'planif-edit2\').style.display=\'flex\';" style="font-size:11px;color:var(--teal);cursor:pointer;">' + t('bo.drawer_planif') + '</a>' +
          '<div id="planif-edit2" style="display:none;flex-direction:column;gap:8px;margin-top:8px;">' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lEquipe + ' :</span><input id="planif-equipe" type="text" value="" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lResp + ' :</span><input id="planif-responsable" type="text" value="" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--muted);min-width:80px;">' + lDate + ' :</span><input id="planif-date" type="date" value="" style="flex:1;font-size:12px;padding:4px 8px;border:1px solid var(--line);border-radius:6px;"></div>' +
          '<button class="btn btn-sm btn-outline" onclick="boSavePlanification()" style="margin-top:4px;font-size:11px;align-self:flex-end;">' + t('epic.planif_enregistrer') + '</button>' +
        '</div>';
      }
    } else {
      // a_valider, resolu, superviseur, CC : lecture seule
      if (hasPlanif) {
        ficheHtml += '<div style="font-size:12px;color:var(--navy);line-height:1.8;">' +
          (s.equipe_interne ? '<div>' + lEquipe + ' : <strong>' + escHtml(s.equipe_interne) + '</strong></div>' : '') +
          (s.responsable_intervention ? '<div>' + lResp + ' : <strong>' + escHtml(s.responsable_intervention) + '</strong></div>' : '') +
          (s.delai_prevu ? '<div>' + lDate + ' : <strong>' + fmtDateTime(s.delai_prevu) + '</strong></div>' : '') +
        '</div>';
      } else {
        ficheHtml += '<div style="font-size:12px;color:var(--muted);font-style:italic;">' + t('cc.aucune_planif') + '</div>';
      }
    }
    ficheHtml += '</div>';
  }

  // ── BLOC 2C — Compte-rendu (si a_valider ou résolu, visible par superviseur et EPIC) ──
  if (s.compte_rendu_description && (hasFonction('superviseur') || hasFonction('entite_responsable') || hasFonction('agent_traitant'))) {
    var resLabels = {resolu_completement:'Résolu complètement',resolu_partiellement:'Résolu partiellement',impossible_intervenir:'Impossible d\'intervenir',intervention_reportee:'Intervention reportée',autre:'Autre'};
    ficheHtml += '<div style="margin-bottom:16px;background:#F5F3FF;border-radius:12px;padding:14px 16px;border:1px solid #DDD6FE;">';
    ficheHtml += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Compte-rendu d\'intervention</div>';
    ficheHtml += '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>Résultat :</strong> ' + escHtml(resLabels[s.compte_rendu_resultat]||s.compte_rendu_resultat||'—') + '</div>';
    ficheHtml += '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>Description :</strong> ' + escHtml(s.compte_rendu_description) + '</div>';
    if (s.compte_rendu_observation) ficheHtml += '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>Observation :</strong> ' + escHtml(s.compte_rendu_observation) + '</div>';
    if (s.compte_rendu_date_fin) ficheHtml += '<div style="font-size:12px;color:var(--muted);"><strong>Date de fin :</strong> ' + new Date(s.compte_rendu_date_fin).toLocaleString('fr-FR') + '</div>';
    ficheHtml += '</div>';
  }

  // ── BLOC 3 — Historique ──
  // Section rapports CAP
  ficheHtml += '<div id="bo-drawer-cap-reports" style="margin-bottom:16px;"></div>';
  ficheHtml += '<div id="bo-drawer-timeline" style="margin-bottom:16px;">' +
    '<div onclick="var c=document.getElementById(\'bo-tl-content\');c.style.display=c.style.display===\'none\'?\'\':\'none\';" style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">' +
      '<span>' + t('bo.drawer_historique') + '</span><span style="font-size:14px;">▸</span>' +
    '</div>' +
    '<div id="bo-tl-content" style="display:none;font-size:12px;color:var(--muted);">Chargement...</div>' +
  '</div>';
  ficheHtml += '<div id="bo-drawer-route" style="margin-bottom:16px;"></div>';

  content.innerHTML = ficheHtml;

  // Actions conditionnées par rôle
  var canAct = ['recu','transmis','en_intervention','pris_en_charge','a_valider','resolu'].includes(s.etat);
  if (!canAct) {
    actions.innerHTML = '<div style="font-size:13px;color:var(--muted);text-align:center;width:100;">Ce dossier est ' + escHtml(etatLabels[s.etat]||s.etat) + '.</div>';
  } else if (isCcContext) {
    // ── Variante Commandement : Relancer, Message, Urgence Wali, Note ──
    var ccBtns = '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
      '<button class="btn btn-sm btn-outline" onclick="boRelancerService()" style="flex:1;font-size:11px;">🔔 ' + t('bo.btn_relancer') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="boEnvoyerMessage()" style="flex:1;font-size:11px;">💬 ' + t('bo.btn_message') + '</button>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">' +
      '<button class="btn btn-sm" style="background:#fef2f2;color:#EF4444;flex:1;font-size:11px;" onclick="boSignalerUrgenceWali()">🚨 ' + t('bo.btn_urgence_wali') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="boCcAjouterNote()" style="flex:1;font-size:11px;">📝 ' + t('cc.ajouter_note_dossier') + '</button>' +
    '</div>';
    actions.innerHTML = ccBtns;
  } else if (hasFonction('entite_responsable')) {
    // Entité responsable (EPIC) : aide contextuelle + actions selon l'état
    var epicAide = {transmis:t('epic.aide_transmis'), pris_en_charge:t('epic.aide_pec'), en_intervention:t('epic.aide_intervention'), a_valider:t('epic.aide_avalider')};
    var epicBtns = epicAide[s.etat] ? '<div style="font-size:11px;color:var(--navy);padding:8px 10px;background:var(--blue-light);border-radius:8px;margin-bottom:8px;line-height:1.4;">' + epicAide[s.etat] + '</div>' : '';
    if (s.etat === 'transmis') {
      epicBtns +=
        '<button class="btn btn-sm btn-primary" onclick="boAction(\'pris_en_charge\',{commentaire:\'Prise en charge par le service\',toastMsg:\'' + escHtml(t('epic.toast_pec')) + '\'})" style="flex:1;">✅ ' + t('bo.btn_prendre_charge') + '</button>' +
        '<button class="btn btn-sm" style="background:var(--red-light);color:var(--red);" onclick="boRefuserDossier()">✕ ' + t('bo.btn_refuser') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="boDemanderPrecision()" style="flex:1;">📩 ' + t('bo.btn_precisions') + '</button>';
    } else if (s.etat === 'pris_en_charge') {
      epicBtns +=
        '<button class="btn btn-sm btn-primary" onclick="boAction(\'en_intervention\',{commentaire:\'Intervention démarrée\',toastMsg:\'' + escHtml(t('epic.toast_demarrer')) + '\'})" style="flex:1;">🚀 ' + t('bo.btn_demarrer') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="boEstimerDelai()" style="flex:1;">📅 ' + t('bo.btn_estimer') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="boDemanderPrecision()" style="flex:1;">📩 ' + t('bo.btn_precisions') + '</button>';
    } else if (s.etat === 'en_intervention') {
      epicBtns +=
        '<button class="btn btn-sm btn-primary" onclick="boShowFinModal()" style="flex:1;">✅ ' + t('bo.btn_travaux_finis') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="boDemanderPrecision()" style="flex:1;">📩 ' + t('bo.btn_precisions') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="boReorienter()" style="font-size:11px;">↩️ ' + t('bo.btn_reorienter') + '</button>';
    } else if (s.etat === 'a_valider') {
      // Pas de boutons, juste le message d'aide
    } else {
      epicBtns += '<button class="btn btn-sm btn-outline" onclick="boDemanderPrecision()" style="flex:1;">📩 ' + t('bo.btn_precisions') + '</button>';
    }
    actions.innerHTML = epicBtns;
  } else if (s.etat === 'a_valider' && hasFonction('superviseur')) {
    // Superviseur : valider ou demander reprise
    actions.innerHTML =
      '<button class="btn btn-sm btn-primary" onclick="boValiderCompteRendu()" style="flex:1;">✅ ' + t('sup.valider_cr') + '</button>' +
      '<button class="btn btn-sm" style="background:var(--red-light);color:var(--red);flex:1;" onclick="boDemanderReprise()">↩️ ' + t('sup.demander_reprise') + '</button>';
  } else {
    // Centre de Réception + Centre Opérationnel + Pilotage — boutons selon l'état
    var mainBtns = '';
    var capBtn = '<button class="btn btn-sm btn-outline" onclick="boShowCapModal()" style="flex:1;">👮 ' + t('bo.btn_cap') + '</button>';

    if (s.etat === 'recu') {
      // Reçu : qualifier, rejeter, CAP
      mainBtns = '<button class="btn btn-sm btn-primary" onclick="boAction(\'transmis\',{commentaire:\'Dossier qualifié\',toastMsg:\'Dossier qualifié\',keepDrawerOpen:true})" style="flex:1;">✅ ' + t('bo.btn_qualifier') + '</button>' +
        capBtn +
        '<button class="btn btn-sm" style="background:var(--red-light);color:var(--red);" onclick="boShowRejetModal()">✕ ' + t('bo.btn_rejeter') + '</button>';
    } else if (s.etat === 'transmis') {
      mainBtns = '<button class="btn btn-sm btn-primary" onclick="boShowTransmettreModal()" style="flex:1;">↗️ ' + t('bo.btn_transmettre') + '</button>' +
        capBtn +
        '<button class="btn btn-sm" style="background:var(--red-light);color:var(--red);" onclick="boShowRejetModal()">✕ ' + t('bo.btn_rejeter') + '</button>' +
        '<div style="width:100%;margin-top:8px;display:flex;gap:6px;">' +
          '<button class="btn btn-sm btn-outline" onclick="boEnvoyerMessage()" style="flex:1;font-size:11px;">💬 ' + t('bo.btn_message') + '</button>' +
          '<button class="btn btn-sm btn-outline" onclick="boRelancerService()" style="flex:1;font-size:11px;">🔔 ' + t('bo.btn_relancer') + '</button>' +
        '</div>';
    } else if (s.etat === 'pris_en_charge' || s.etat === 'en_intervention') {
      mainBtns = capBtn +
        '<div style="width:100%;margin-top:8px;display:flex;gap:6px;">' +
          '<button class="btn btn-sm btn-outline" onclick="boEnvoyerMessage()" style="flex:1;font-size:11px;">💬 ' + t('bo.btn_message') + '</button>' +
          '<button class="btn btn-sm btn-outline" onclick="boRelancerService()" style="flex:1;font-size:11px;">🔔 ' + t('bo.btn_relancer') + '</button>' +
        '</div>';
    } else if (s.etat === 'a_valider') {
      // L'agent traitant valide et clôture directement
      mainBtns =
        '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px;margin-bottom:8px;font-size:12px;color:#166534;line-height:1.5;">' +
          'L\'intervention est terminée. Validez et clôturez pour archiver et envoyer une confirmation au citoyen.' +
        '</div>' +
        '<button class="btn btn-sm btn-primary" onclick="boCloturer()" style="flex:1;background:#16a34a;border-color:#16a34a;width:100%;">✅ Valider et Clôturer</button>';
    } else if (s.etat === 'resolu') {
      // Résolu (ex-superviseur) → l'agent clôture
      mainBtns =
        '<button class="btn btn-sm btn-primary" onclick="boCloturer()" style="flex:1;background:#16a34a;border-color:#16a34a;width:100%;">✅ Clôturer le dossier</button>';
    } else {
      // rejete : CAP uniquement
      mainBtns = capBtn;
    }
    // Boutons superviseur : communiquer, notifier, signaler urgence
    if (hasFonction('superviseur')) {
      mainBtns += '<div style="width:100%;margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">' +
        '<button class="btn btn-sm btn-outline" onclick="boCommuniquerDossier()" style="flex:1;font-size:11px;">📢 ' + t('bo.btn_communiquer') + '</button>' +
        '<button class="btn btn-sm btn-outline" onclick="boNotifierDossier()" style="flex:1;font-size:11px;">🔔 ' + t('bo.btn_notifier') + '</button>' +
        '<button class="btn btn-sm" style="background:#fef2f2;color:#EF4444;flex:1;font-size:11px;" onclick="boSignalerUrgenceWali()">🚨 ' + t('bo.btn_urgence_wali') + '</button>' +
      '</div>';
    }
    actions.innerHTML = mainBtns;
  }

  document.getElementById('bo-drawer').classList.remove('hidden');

  // Load timeline
  try {
    var hRes = await apiFetch('/api/signaler/board/' + id + '/historique', { headers: authHeaders() });
    if (hRes.ok) {
      var hist = await hRes.json();
      var tlEl = document.getElementById('bo-tl-content');
      if (hist.length && tlEl) {
        tlEl.innerHTML = hist.map(function(h) {
            var detailId = 'tl-d-' + Math.random().toString(36).substr(2,6);
            return '<div style="display:flex;gap:8px;padding:4px 0;border-left:2px solid var(--line);padding-left:10px;margin-left:4px;">' +
              '<div style="font-size:10px;color:var(--muted);min-width:60px;">' + fmtDateTime(h.le) + '</div>' +
              '<div style="font-size:11px;color:var(--navy);">' + escHtml(h.action || h.etat) +
              (h.prenom ? ' — ' + escHtml(h.prenom) : '') +
              (h.commentaire ? '<a onclick="var e=document.getElementById(\'' + detailId + '\');e.style.display=e.style.display===\'none\'?\'\':\'none\'" style="font-size:10px;color:var(--muted);cursor:pointer;margin-left:4px;">détail</a><div id="' + detailId + '" style="display:none;font-size:10px;color:var(--muted);margin-top:2px;">' + escHtml(h.commentaire) + '</div>' : '') +
              '</div></div>';
          }).join('');
      }
    }
  } catch(e) { console.warn('[bo] échec chargement historique drawer:', e.message); }

  // Load CAP reports
  try {
    var capRes = await apiFetch('/api/signaler/board/' + id + '/missions-cap', { headers: authHeaders() });
    if (capRes.ok) {
      var caps = await capRes.json();
      var capEl = document.getElementById('bo-drawer-cap-reports');
      if (caps.length && capEl) {
        var decLabels = {valider:'✅ Confirmé',amender:'⚠️ Partiellement confirmé',rejeter:'❌ Non fondé'};
        capEl.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Rapport(s) terrain CAP</div>' +
          caps.map(function(m) {
            var agentName = (m.agent_prenom || '') + ' ' + (m.agent_nom || '');
            return '<div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:12px;padding:14px;margin-bottom:8px;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<div style="font-size:13px;font-weight:700;color:var(--navy);">👮 ' + escHtml(agentName.trim() || 'Agent CAP') + '</div>' +
                '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:' + (m.etat==='termine'?'#f0fdf4':'#fef3c7') + ';color:' + (m.etat==='termine'?'#16a34a':'#92400e') + ';">' + escHtml(m.etat) + '</span>' +
              '</div>' +
              (m.decision ? '<div style="font-size:13px;font-weight:600;margin-bottom:6px;">' + (decLabels[m.decision] || m.decision) + (m.motif_decision ? ' — ' + escHtml(m.motif_decision) : '') + '</div>' : '') +
              (m.constat_visuel ? '<div style="font-size:12px;color:var(--navy);margin-bottom:6px;"><strong>Constat :</strong> ' + escHtml(m.constat_visuel) + '</div>' : '') +
              (m.constat_temoignages ? '<div style="font-size:12px;color:var(--muted);margin-bottom:6px;"><strong>Témoignages :</strong> ' + escHtml(m.constat_temoignages) + '</div>' : '') +
              (m.photo_path ? '<div style="margin-bottom:6px;"><img src="/' + escHtml(m.photo_path) + '" style="max-width:100%;max-height:150px;border-radius:8px;border:1px solid var(--line);" onerror="this.style.display=\'none\'"></div>' : '') +
              (m.cloture_lat && m.cloture_lng ? '<div style="font-size:11px;color:var(--muted);">📍 ' + parseFloat(m.cloture_lat).toFixed(5) + ', ' + parseFloat(m.cloture_lng).toFixed(5) + '</div>' : '') +
              '<div style="font-size:11px;color:var(--muted);margin-top:4px;">' + fmtDateTime(m.cloture_le || m.cree_le) + '</div>' +
            '</div>';
          }).join('');
      }
    }
  } catch(e) { console.warn('[bo] échec chargement rapports CAP drawer:', e.message); }

  // Load routing suggestion
  try {
    var rRes = await apiFetch('/api/signaler/board/' + id + '/route', { headers: authHeaders() });
    if (rRes.ok) {
      var route = await rRes.json();
      var rEl = document.getElementById('bo-drawer-route');
      if (route.service) {
        rEl.innerHTML = '<h4 style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:6px;">' + t('bo.drawer_routage') + '</h4>' +
          '<div style="font-size:12px;padding:8px 12px;background:var(--teal-light);border-radius:10px;color:var(--teal);font-weight:600;">→ ' + escHtml(locOrg(route.service)) + '</div>';
      }
    }
  } catch(e) { console.warn('[bo] échec chargement suggestion routage:', e.message); }
}

function boCloseDrawer() { document.getElementById('bo-drawer').classList.add('hidden'); _boCurrentId = null; _boDrawerContext = 'bo'; }

async function boAction(newEtat, opts) {
  if (!_boCurrentId) return;
  opts = opts || {};
  try {
    var body = { etat: newEtat };
    if (opts.commentaire) body.commentaire = opts.commentaire;
    if (opts.motifRejet) body.motifRejet = opts.motifRejet;
    if (opts.transmisA) body.transmisA = opts.transmisA;

    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/etat', {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      var data = await res.json();
      var sig = _boSignals.find(function(x) { return x.id === _boCurrentId; });
      if (sig) sig.etat = newEtat;

      // Message clair selon l'action
      var etatLabels = {transmis:'Dossier qualifié',en_intervention:'Transmis au service',pris_en_charge:'Pris en charge',resolu:'Résolu',clos:'Dossier clôturé',rejete:'Rejeté'};
      var msg = (opts.toastMsg) || etatLabels[newEtat] || ('→ ' + newEtat);
      showToast(msg + ' — #' + (data.reference || ''));

      if (opts.keepDrawerOpen && _boCurrentId) {
        // Rafraîchir le drawer sans le fermer
        boOpenDrawer(_boCurrentId);
      } else {
        boCloseDrawer();
      }
      boFilterSignals();
      await initBoAgent();
    } else {
      var err = await res.json();
      showToast(err.erreur || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
}

async function boCloturer() {
  if (!_boCurrentId) return;
  if (!confirm('Clôturer définitivement ce dossier ?\nUn email de confirmation sera envoyé au citoyen.')) return;
  await boAction('clos', { toastMsg: 'Dossier clôturé' });
}

function boShowRejetModal() { document.getElementById('bo-modal-rejet').classList.remove('hidden'); }

async function boShowTransmettreModal() {
  if (!_boCurrentId) return;
  // Trouver le service suggéré par le domaine du dossier
  var sig = _boSignals.find(function(x) { return x.id === _boCurrentId; });
  var domaine = sig ? sig.domaine : '';

  // Charger les organisations
  var orgs = [];
  try { orgs = await safeFetchJSON('/api/admin/organisations', {}, true); } catch(e) { console.warn('[bo] échec chargement organisations:', e.message); showToast(t('global.erreur_chargement_donnees'), 'error'); }
  if (!orgs.length) try { orgs = await safeFetchJSON('/api/referentiel/operateurs', {}, true); } catch(e) { console.warn('[bo] échec chargement opérateurs fallback:', e.message); showToast(t('global.erreur_chargement_donnees'), 'error'); }

  var optionsHtml = orgs.map(function(o) {
    var selected = (o.domaines && o.domaines.includes(domaine)) ? ' selected' : '';
    var orgName = currentLang === 'ar' && o.nom_ar ? o.nom_ar : o.nom;
    return '<option value="' + o.id + '"' + selected + '>' + escHtml(orgName) + (o.type ? ' (' + o.type + ')' : '') + '</option>';
  }).join('');

  showModal(t('bo.transmettre_titre'),
    '<p style="font-size:13px;color:var(--muted);margin-bottom:12px;">' + t('bo.transmettre_desc') + '</p>' +
    '<select id="transmettre-service" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:13px;margin-bottom:14px;">' +
      '<option value="">' + t('bo.transmettre_choisir') + '</option>' + optionsHtml +
    '</select>' +
    '<button class="btn btn-sm btn-primary" onclick="boConfirmTransmettre()" style="width:100%;">' + t('bo.transmettre_confirmer') + '</button>'
  );
}

async function boConfirmTransmettre() {
  var sel = document.getElementById('transmettre-service');
  if (!sel || !sel.value) { showToast(t('bo.transmettre_choisir'), 'error'); return; }
  var serviceName = sel.options[sel.selectedIndex].textContent;
  var transmisA = sel.value;
  var modal = document.getElementById('generic-modal');
  if (modal) modal.remove();
  // Rester en état "transmis" (le dossier est déjà qualifié), écrire transmis_a
  await boAction('transmis', {
    commentaire: 'Transmis à ' + serviceName,
    toastMsg: 'Transmis à ' + serviceName,
    transmisA: transmisA
  });
}
async function boConfirmRejet() {
  var motif = document.getElementById('bo-rejet-motif').value;
  var comment = document.getElementById('bo-rejet-comment').value;
  await boAction('rejete', { motifRejet: motif, commentaire: comment });
  document.getElementById('bo-modal-rejet').classList.add('hidden');
}

function boDemanderPrecision() {
  showPromptModal(t('bo.btn_precisions'), '', function(msg) {
    if (msg && msg.trim()) {
      boAction('transmis', { commentaire: 'Demande de précision du service : ' + msg.trim() });
    }
  }, { textarea: true, desc: 'Complément d\'information, vérification terrain, décision requise...' });
}

function boEnvoyerMessage() {
  if (!_boCurrentId) return;
  showPromptModal(t('bo.btn_message'), '', async function(msg) {
    if (!msg || !msg.trim()) return;
    try {
      var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/commentaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: msg.trim(), type: 'message' })
      });
      if (res.ok) {
        var data = await res.json();
        if (data.spam) { showToast(t('cc.deja_envoye') + ' (' + data.agoMin + 'min)', 'error'); }
        else { showToast(t('bo.message_envoye_service')); }
        boOpenDrawer(_boCurrentId);
      } else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true });
}

function boRelancerService() {
  if (!_boCurrentId) return;
  showPromptModal(t('bo.btn_relancer'), '', async function(msg) {
    msg = msg || 'Relance — dossier en attente de traitement.';
    try {
      var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/commentaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: msg.trim(), type: 'relance' })
      });
      if (res.ok) {
        var data = await res.json();
        if (data.spam) { showToast(t('cc.deja_relance') + ' (' + data.agoMin + 'min)', 'error'); }
        else { showToast(t('bo.relance_envoyee')); }
        boOpenDrawer(_boCurrentId);
      } else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true });
}

function boCommuniquerDossier() {
  if (!_boCurrentId) return;
  showPromptModal(t('bo.btn_communiquer'), '', async function(msg) {
    if (!msg || !msg.trim()) return;
    try {
      var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/commentaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: msg.trim(), type: 'communique' })
      });
      if (res.ok) { showToast(t('bo.communique_enregistre')); boOpenDrawer(_boCurrentId); }
      else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true });
}

function boNotifierDossier() {
  if (!_boCurrentId) return;
  showModal(t('bo.btn_notifier'),
    '<input id="gm-dest" placeholder="Destinataire (service, direction, ou tous)" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:13px;margin-bottom:8px;">' +
    '<textarea id="gm-msg" rows="3" placeholder="Message" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:13px;margin-bottom:12px;"></textarea>' +
    '<div style="display:flex;gap:8px;">' +
      '<button class="btn btn-sm btn-primary" style="flex:1;" onclick="boConfirmNotifier()">' + t('global.enregistrer') + '</button>' +
      '<button class="btn btn-sm btn-outline" onclick="document.getElementById(\'generic-modal\').remove()">' + t('global.annuler') + '</button>' +
    '</div>'
  );
}
async function boConfirmNotifier() {
  var dest = document.getElementById('gm-dest').value.trim();
  var msg = document.getElementById('gm-msg').value.trim();
  if (!dest || !msg) { showToast(t('bo.remplir_champs'), 'error'); return; }
  document.getElementById('generic-modal').remove();
  try {
    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/commentaire', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentaire: 'Notification à ' + dest + ' : ' + msg, type: 'notification' })
    });
    if (res.ok) { showToast('Notification envoyée à ' + dest + '.'); boOpenDrawer(_boCurrentId); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

function boSignalerUrgenceWali() {
  if (!_boCurrentId) return;
  showPromptModal(t('bo.btn_urgence_wali'), '', async function(motif) {
    if (!motif || !motif.trim()) { showToast(t('bo.motif_obligatoire'), 'error'); return; }
    try {
      var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/commentaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: '🚨 URGENCE WALI — ' + motif.trim(), type: 'urgence_wali' })
      });
      if (res.ok) {
        var data = await res.json();
        if (data.spam) { showToast(t('cc.deja_envoye') + ' (' + data.agoMin + 'min)', 'error'); }
        else { showToast(t('bo.urgence_wali')); }
        boOpenDrawer(_boCurrentId);
      } else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true, desc: t('cc.urgence_wali_desc') });
}

function boReorienter() {
  showPromptModal(t('bo.btn_reorienter'), '', function(motif) {
    if (motif && motif.trim()) {
    boAction('transmis', { commentaire: 'Réorienté par le service : ' + motif.trim() });
    showToast(t('bo.reoriente_wilaya'));
    }
  });
}

function boRefuserDossier() {
  showPromptModal(t('bo.btn_refuser'), '', function(motif) {
    if (!motif || !motif.trim()) { showToast(t('bo.motif_refus_requis'), 'error'); return; }
    boAction('transmis', { commentaire: 'Refusé par le service — ' + motif.trim(), motifRejet: motif.trim() });
    showToast(t('bo.dossier_refuse'));
  }, { textarea: true, desc: 'Hors périmètre, incompétence matérielle, informations insuffisantes...' });
}

async function boEstimerDelai() {
  var dateStr = prompt('Date prévisionnelle de résolution (format AAAA-MM-JJ) :');
  if (!dateStr || !dateStr.trim()) return;
  var parsed = new Date(dateStr.trim());
  if (isNaN(parsed.getTime())) { showToast(t('bo.date_invalide'), 'error'); return; }
  if (parsed < new Date()) { showToast(t('bo.date_futur'), 'error'); return; }
  try {
    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/planification', {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ delaiPrevu: parsed.toISOString() })
    });
    if (res.ok) { showToast(t('bo.delai_enregistre')); boOpenDrawer(_boCurrentId); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

function boCcAjouterNote() {
  if (!_boCurrentId) return;
  showPromptModal(t('cc.ajouter_note_dossier'), '', async function(note) {
    if (!note || !note.trim()) return;
    try {
      var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/commentaire', {
        method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: note.trim(), type: 'note_commandement' })
      });
      if (res.ok) { showToast(t('cc.note_ajoutee_dossier')); boOpenDrawer(_boCurrentId); }
      else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
    } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true, desc: t('cc.note_desc') });
}

async function boSavePlanification() {
  if (!_boCurrentId) return;
  var equipe = document.getElementById('planif-equipe');
  var resp = document.getElementById('planif-responsable');
  var dateEl = document.getElementById('planif-date');
  var body = {};
  if (equipe) body.equipeInterne = equipe.value.trim() || null;
  if (resp) body.responsableIntervention = resp.value.trim() || null;
  if (dateEl && dateEl.value) body.delaiPrevu = new Date(dateEl.value).toISOString();
  else if (dateEl) body.delaiPrevu = null;
  if (!Object.keys(body).length) { showToast(t('bo.aucune_modif'), 'error'); return; }
  try {
    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/planification', {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) { showToast(t('bo.planif_enregistree')); boOpenDrawer(_boCurrentId); }
    else { var err = await res.json(); showToast(err.erreur || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

function boValiderCompteRendu() {
  if (!_boCurrentId) return;
  showPromptModal(t('sup.valider_cr'), '', async function(commentaire) {
    commentaire = commentaire || '';
  try {
    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/valider', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentaire: commentaire.trim() })
    });
    if (res.ok) {
      showToast(t('bo.cr_valide_resolu'));
      boLoadKanban();
      boCloseDrawer();
    } else {
      var err = await res.json();
      showToast(err.erreur || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
  });
}

function boDemanderReprise() {
  if (!_boCurrentId) return;
  showPromptModal(t('sup.demander_reprise'), '', async function(motif) {
    if (!motif || !motif.trim()) { showToast(t('bo.motif_obligatoire'), 'error'); return; }
  try {
    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/reprise', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ motif: motif.trim() })
    });
    if (res.ok) {
      showToast(t('bo.reprise_demandee'));
      boLoadKanban();
      boCloseDrawer();
    } else {
      var err = await res.json();
      showToast(err.erreur || 'Erreur', 'error');
    }
  } catch(e) { showToast(e.message, 'error'); }
  }, { textarea: true, desc: 'Travaux incomplets, résultat insatisfaisant, observations manquantes...' });
}

var _boFinPjCount = 0;

function boShowFinModal() {
  document.getElementById('bo-fin-resume').value = '';
  document.getElementById('bo-fin-resultat').value = '';
  document.getElementById('bo-fin-observation').value = '';
  document.getElementById('bo-fin-date').value = new Date().toISOString().slice(0,16);
  document.getElementById('bo-fin-pj-list').innerHTML = '';
  document.getElementById('bo-fin-error').style.display = 'none';
  _boFinPjCount = 0;
  document.getElementById('bo-modal-fin').classList.remove('hidden');
}

function boAddPieceJointe() {
  var idx = _boFinPjCount++;
  var row = document.createElement('div');
  row.id = 'bo-fin-pj-' + idx;
  row.style.cssText = 'display:flex;gap:6px;align-items:center;';
  row.innerHTML =
    '<input type="file" accept="image/*,.pdf,.doc,.docx" id="bo-fin-file-' + idx + '" style="flex:1;font-size:11px;">' +
    '<select id="bo-fin-cat-' + idx + '" style="font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:6px;">' +
      '<option value="avant">Avant</option>' +
      '<option value="pendant">Pendant</option>' +
      '<option value="apres">Après</option>' +
      '<option value="rapport">Rapport</option>' +
      '<option value="autre" selected>Autre</option>' +
    '</select>' +
    '<button type="button" onclick="document.getElementById(\'bo-fin-pj-' + idx + '\').remove()" style="font-size:14px;background:none;border:none;color:var(--red);cursor:pointer;">✕</button>';
  document.getElementById('bo-fin-pj-list').appendChild(row);
}

async function boConfirmFinIntervention() {
  var errEl = document.getElementById('bo-fin-error');
  errEl.style.display = 'none';

  var description = document.getElementById('bo-fin-resume').value.trim();
  var resultat = document.getElementById('bo-fin-resultat').value;
  var observation = document.getElementById('bo-fin-observation').value.trim();
  var dateFin = document.getElementById('bo-fin-date').value;

  // Validation
  var errors = [];
  if (!description) errors.push('La description est obligatoire.');
  if (!resultat) errors.push('Le résultat de l\'intervention est obligatoire.');
  if (errors.length) {
    errEl.textContent = errors.join(' ');
    errEl.style.display = 'block';
    return;
  }

  // Construire le FormData pour multipart
  var fd = new FormData();
  fd.append('description', description);
  fd.append('resultat', resultat);
  if (observation) fd.append('observation', observation);
  if (dateFin) fd.append('dateFin', new Date(dateFin).toISOString());

  // Collecter les pièces jointes
  for (var i = 0; i < _boFinPjCount; i++) {
    var fileEl = document.getElementById('bo-fin-file-' + i);
    var catEl = document.getElementById('bo-fin-cat-' + i);
    if (fileEl && fileEl.files && fileEl.files[0]) {
      fd.append('photos', fileEl.files[0]);
      fd.append('categories', catEl ? catEl.value : 'autre');
    }
  }

  try {
    var hdrs = authHeaders();
    delete hdrs['Content-Type']; // laisser le navigateur gérer multipart
    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/compte-rendu', {
      method: 'POST', headers: hdrs, body: fd
    });
    if (res.ok) {
      document.getElementById('bo-modal-fin').classList.add('hidden');
      showToast(t('bo.cr_envoye'));
      boLoadKanban();
    } else {
      var err = await res.json();
      errEl.textContent = err.erreur || 'Erreur lors de l\'envoi.';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = e.message;
    errEl.style.display = 'block';
  }
}

async function boShowCapModal() {
  document.getElementById('bo-modal-cap').classList.remove('hidden');
  // Charger les agents CAP disponibles
  var sel = document.getElementById('bo-cap-affecte');
  if (sel && sel.options.length <= 1) {
    try {
      var agents = await safeFetchJSON('/api/cap/agents', {}, true);
      agents.filter(function(a) { return a.actif; }).forEach(function(a) {
        var opt = document.createElement('option');
        opt.value = a.utilisateur_id;
        opt.textContent = (a.prenom || '') + ' ' + (a.nom || '') + ' — ' + (a.commune_nom || '') + (a.telephone ? ' — ' + a.telephone : '');
        sel.appendChild(opt);
      });
    } catch(e) { console.warn('[bo] échec chargement agents CAP:', e.message); }
  }
}
async function boConfirmCap() {
  if (!_boCurrentId) return;
  var affecteA = document.getElementById('bo-cap-affecte').value || null;
  try {
    var res = await apiFetch('/api/signaler/board/' + _boCurrentId + '/mission-cap', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: document.getElementById('bo-cap-type').value,
        priorite: document.getElementById('bo-cap-prio').value,
        commentaire: document.getElementById('bo-cap-comment').value,
        affecte_a: affecteA
      })
    });
    if (res.ok) {
      var capSel = document.getElementById('bo-cap-affecte');
      var agentName = capSel && capSel.selectedIndex > 0 ? capSel.options[capSel.selectedIndex].textContent.split(' — ')[0] : '';
      showToast(agentName ? 'Mission envoyée à ' + agentName : 'Intervention CAP créée — à assigner.');
      document.getElementById('bo-modal-cap').classList.add('hidden');
      boCloseDrawer();
    } else { var err = await res.json(); showToast(err.erreur || err.message || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

// ─── ADMIN COMMUNIQUÉS ──────────────────────────────────────
async function loadAdminCommuniques(statut) {
  var el = document.getElementById('admin-communiques-list');
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">Chargement...</div>';
  // Afficher les filtres soumis/rejetés selon le profil
  var btnSoumis = document.getElementById('comm-filter-soumis');
  var btnRejete = document.getElementById('comm-filter-rejete');
  if (btnSoumis) btnSoumis.style.display = '';
  if (btnRejete) btnRejete.style.display = '';
  // Populate commune select
  var commSel = document.getElementById('comm-commune');
  if (commSel && commSel.options.length <= 1) {
    communes.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.nom;
      commSel.appendChild(opt);
    });
  }
  try {
    var url = '/api/infos/communiques?admin=true';
    if (statut) url += '&statut=' + statut;
    var data = await safeFetchJSON(url, {}, true);
    if (!data || !data.length) { el.innerHTML = '<p style="padding:16px;color:var(--muted);">Aucun communiqué.</p>'; return; }
    var niveauColors = { urgent:'#ef4444', important:'#2563eb', info:'#7C3AED' };
    var statutLabels = { brouillon:'Préparation', en_revision:'En révision', soumis_wilaya:'Soumis à la Wilaya', valide:'Validé', publie:'Publié', rejete:'Rejeté', archive:'Archivé' };
    var isCommune = currentUser && currentUser.niveau_perimetre === 'commune';
    var statutColors = { brouillon:'#6b7280', en_revision:'#d97706', soumis_wilaya:'#2563eb', valide:'#16a34a', publie:'#16a34a', rejete:'#ef4444', archive:'#9ca3af' };
    el.innerHTML = '<div class="table-wrapper"><table><thead><tr><th>Statut</th><th>Priorité</th><th>Titre</th><th>Commune</th><th>Début</th><th>Fin</th><th>Actions</th></tr></thead><tbody>' +
      data.map(function(c) {
        var sColor = statutColors[c.statut] || '#9ca3af';
        var statLabel = statutLabels[c.statut] || c.statut;
        var motifHtml = '';
        if (c.statut === 'rejete' && c.commentaire_revision) {
          motifHtml = '<div style="font-size:10px;color:#ef4444;margin-top:2px;">Motif : ' + escHtml(c.commentaire_revision) + '</div>';
        }
        return '<tr>' +
          '<td><span style="padding:2px 8px;border-radius:8px;font-size:11px;background:' + sColor + '22;color:' + sColor + ';">' + statLabel + '</span>' + motifHtml + '</td>' +
          '<td><span style="color:' + (niveauColors[c.niveau]||'#666') + ';font-weight:600;">' + escHtml(c.niveau||'info') + '</span></td>' +
          '<td style="font-weight:600;">' + escHtml(c.titre) + '</td>' +
          '<td>' + escHtml(c.commune_nom || 'Toute la Wilaya') + '</td>' +
          '<td style="font-size:11px;">' + fmtDate(c.date_debut) + '</td>' +
          '<td style="font-size:11px;">' + (c.date_fin ? fmtDate(c.date_fin) : '—') + '</td>' +
          '<td style="white-space:nowrap;display:flex;gap:4px;flex-wrap:wrap;">' +
            '<button class="btn btn-sm btn-outline" onclick="editCommunique(' + c.id + ')" style="font-size:10px;padding:2px 6px;">✏️</button>' +
            // Brouillon → Soumettre à la Wilaya (commune) ou En révision (wilaya)
            (c.statut==='brouillon' && isCommune ? '<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:#2563eb;color:white;" onclick="commSoumettre(' + c.id + ')">→ Soumettre à la Wilaya</button>' : '') +
            (c.statut==='brouillon' && !isCommune ? '<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:var(--ops-info);color:white;" onclick="commEnvoiRevision(' + c.id + ')">→ Soumettre</button>' : '') +
            // Soumis à la Wilaya → Valider et publier / Rejeter (Wilaya only)
            (c.statut==='soumis_wilaya' && canPublishCommunique() ? '<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:var(--ops-success);color:white;" onclick="commPublier(' + c.id + ')">✓ Valider et publier</button><button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:#ef4444;color:white;" onclick="commRejeter(' + c.id + ')">✕ Rejeter</button>' : '') +
            (c.statut==='soumis_wilaya' && !canPublishCommunique() ? '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:#dbeafe;color:#2563eb;">En attente de validation</span>' : '') +
            // Rejeté → Resoumettre (commune author only)
            (c.statut==='rejete' && isCommune ? '<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:var(--ops-info);color:white;" onclick="commResoumettre(' + c.id + ')">↻ Resoumettre</button>' : '') +
            // En révision (workflow wilaya existant)
            (c.statut==='en_revision' && canPublishCommunique() ? '<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:var(--ops-success);color:white;" onclick="commValider(' + c.id + ')">✓ Valider</button><button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:var(--ops-warning);color:white;" onclick="commDemanderCorrection(' + c.id + ')">↩ Retour</button>' : '') +
            (c.statut==='en_revision' && !canPublishCommunique() ? '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:#fef3c7;color:#92400e;">En révision</span>' : '') +
            (c.statut==='valide' && canPublishCommunique() ? '<button class="btn btn-sm" style="font-size:10px;padding:2px 6px;background:var(--ops-success);color:white;" onclick="commPublier(' + c.id + ')">📢 Publier</button>' : '') +
            (c.statut==='valide' && !canPublishCommunique() ? '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:#f0fdf4;color:#16a34a;">Validé</span>' : '') +
            (c.statut==='publie' && canPublishCommunique() ? '<button class="btn btn-sm btn-outline" style="font-size:10px;padding:2px 6px;" onclick="commArchiver(' + c.id + ')">📁 Archiver</button>' : '') +
            (canDeleteCommunique() ? '<button class="btn btn-sm btn-outline" onclick="deleteCommunique(' + c.id + ')" style="font-size:10px;padding:2px 6px;color:var(--red);">✕</button>' : '') +
          '</td></tr>';
      }).join('') + '</tbody></table></div>';
  } catch(e) { el.innerHTML = '<p style="color:var(--red);padding:16px;">' + escHtml(e.message) + '</p>'; }
}

function showCommuniqueForm() {
  document.getElementById('comm-edit-id').value = '';
  document.getElementById('comm-titre').value = '';
  document.getElementById('comm-message').value = '';
  document.getElementById('comm-detail').value = '';
  var natureEl = document.getElementById('comm-nature');
  if (natureEl) natureEl.value = 'operationnelle';
  document.getElementById('comm-categorie').value = 'info';
  document.getElementById('comm-niveau').value = 'info';
  document.getElementById('comm-statut').value = 'brouillon';
  document.getElementById('comm-debut').value = new Date().toISOString().slice(0,16);
  document.getElementById('comm-fin').value = '';
  // Superviseur commune : verrouiller le sélecteur commune + masquer le champ statut
  var isCommune = currentUser && currentUser.niveau_perimetre === 'commune';
  var commSel = document.getElementById('comm-commune');
  if (commSel && isCommune && currentUser.commune_id) {
    commSel.value = currentUser.commune_id;
    commSel.disabled = true;
  } else if (commSel) {
    commSel.disabled = false;
  }
  // Commune : masquer le champ statut (toujours brouillon à la création)
  var statutGroup = document.getElementById('comm-statut-group');
  if (statutGroup) statutGroup.style.display = isCommune ? 'none' : '';
  // Commune : adapter le bouton
  var btnSave = document.getElementById('comm-btn-save');
  if (btnSave) btnSave.textContent = isCommune ? 'Enregistrer brouillon' : 'Enregistrer';
  document.getElementById('communique-form-title').textContent = 'Nouvelle publication';
  document.getElementById('admin-communique-form').classList.remove('hidden');
}

function hideCommuniqueForm() { document.getElementById('admin-communique-form').classList.add('hidden'); }

async function editCommunique(id) {
  try {
    var data = await safeFetchJSON('/api/infos/communiques?admin=true', {}, true);
    var c = data.find(function(x) { return x.id === id; });
    if (!c) return;
    document.getElementById('comm-edit-id').value = c.id;
    document.getElementById('comm-titre').value = c.titre;
    document.getElementById('comm-message').value = c.message;
    document.getElementById('comm-detail').value = c.detail || '';
    document.getElementById('comm-categorie').value = c.categorie || 'info';
    document.getElementById('comm-niveau').value = c.niveau || 'info';
    document.getElementById('comm-statut').value = c.statut || 'publie';
    if (c.commune_id) document.getElementById('comm-commune').value = c.commune_id;
    if (c.date_debut) document.getElementById('comm-debut').value = new Date(c.date_debut).toISOString().slice(0,16);
    if (c.date_fin) document.getElementById('comm-fin').value = new Date(c.date_fin).toISOString().slice(0,16);
    document.getElementById('communique-form-title').textContent = 'Modifier le communiqué';
    document.getElementById('admin-communique-form').classList.remove('hidden');
  } catch(e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function saveCommunique(e) {
  e.preventDefault();
  hideError('comm-form-error');
  var editId = document.getElementById('comm-edit-id').value;
  var isCommune = currentUser && currentUser.niveau_perimetre === 'commune';
  var selectedStatut = document.getElementById('comm-statut').value;
  var body = {
    titre: document.getElementById('comm-titre').value.trim(),
    message: document.getElementById('comm-message').value.trim(),
    detail: document.getElementById('comm-detail').value.trim() || null,
    categorie: document.getElementById('comm-categorie').value,
    niveau: document.getElementById('comm-niveau').value,
    commune_id: document.getElementById('comm-commune').value ? Number(document.getElementById('comm-commune').value) : null,
    date_debut: document.getElementById('comm-debut').value || null,
    date_fin: document.getElementById('comm-fin').value || null,
    statut: isCommune ? 'brouillon' : selectedStatut,
  };
  try {
    var url = editId ? '/api/infos/communiques/' + editId : '/api/infos/communiques';
    var method = editId ? 'PATCH' : 'POST';
    var res = await apiFetch(url, { method: method, headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { var d = await res.json(); throw new Error(d.message || 'Erreur'); }
    hideCommuniqueForm();
    loadAdminCommuniques();
    loadCommuniques();
    showToast(editId ? t('communique.modifie') : t('communique.cree'));
  } catch(e) { showError('comm-form-error', e.message); }
}

async function deleteCommunique(id) {
  if (!window.confirm(t('global.supprimer') + ' ?')) return;
  try {
    await apiFetch('/api/infos/communiques/' + id, { method:'DELETE', headers:authHeaders() });
    loadAdminCommuniques();
    loadCommuniques();
    showToast(t('communique.supprime'));
  } catch(e) { showToast('Erreur: ' + e.message, 'error'); }
}

// ── Workflow communiqués ──
async function commWorkflow(id, statut, commentaire) {
  try {
    var body = { statut: statut };
    if (commentaire) body.commentaire = commentaire;
    var res = await apiFetch('/api/infos/communiques/' + id + '/workflow', {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      var d = await res.json();
      showToast(d.ancienStatut + ' → ' + d.nouveauStatut);
      loadAdminCommuniques();
      if (statut === 'publie') loadCommuniques();
    } else { var err = await res.json(); showToast(err.erreur || err.message || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}

function commEnvoiRevision(id) { commWorkflow(id, 'en_revision'); }
function commValider(id) { commWorkflow(id, 'valide'); }
function commPublier(id) { commWorkflow(id, 'publie'); }
function commArchiver(id) { commWorkflow(id, 'archive'); }
function commDemanderCorrection(id) {
  var c = prompt('Commentaire de correction :');
  if (c) commWorkflow(id, 'brouillon', c);
}
// Commune → Soumettre à la Wilaya
function commSoumettre(id) { commWorkflow(id, 'soumis_wilaya'); }
// Commune → Resoumettre après rejet (remet en brouillon pour modification)
async function commResoumettre(id) {
  try {
    var res = await apiFetch('/api/infos/communiques/' + id + '/workflow', {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'brouillon' })
    });
    if (res.ok) {
      showToast(t('communique.brouillon'));
      loadAdminCommuniques();
    } else { var err = await res.json(); showToast(err.erreur || err.message || 'Erreur', 'error'); }
  } catch(e) { showToast(e.message, 'error'); }
}
// Wilaya → Rejeter avec motif obligatoire
function commRejeter(id) {
  var motif = prompt('Motif de rejet (obligatoire) :');
  if (!motif || !motif.trim()) { showToast(t('communique.motif_rejet_requis'), 'error'); return; }
  commWorkflow(id, 'rejete', motif.trim());
}

// ─── PRÉPARER MON DOSSIER ────────────────────────────────────
function showDemarchesTab(tab) {
  document.getElementById('demarches-preparer').classList.toggle('hidden', tab !== 'preparer');
  document.getElementById('rdv-wizard').classList.add('hidden');
  document.getElementById('rdv-steps').classList.toggle('hidden', tab === 'preparer');
  document.getElementById('rdv-step-1').classList.toggle('hidden', tab === 'preparer');
  var tabPrepStyle = document.getElementById('tab-preparer');
  var tabRdvStyle = document.getElementById('tab-rdv');
  tabPrepStyle.className = tab === 'preparer' ? 'btn btn-primary' : 'btn btn-outline';
  tabRdvStyle.className = tab === 'rdv' ? 'btn btn-primary' : 'btn btn-outline';
  if (tab === 'preparer') {
    var sel = document.getElementById('preparer-service');
    if (sel && sel.options.length <= 1 && rdvServices) {
      var catLabels = {urbanisme:'Urbanisme',logement:'Logement',certificats:'Certificats',biometrique:'Biométrique',etat_civil:'État civil',identite:'Identité'};
      var grouped = {};
      rdvServices.forEach(function(s) {
        var cat = s.categorie || 'autre';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
      });
      Object.keys(grouped).sort().forEach(function(cat) {
        var grp = document.createElement('optgroup');
        grp.label = catLabels[cat] || cat;
        grouped[cat].forEach(function(s) {
          var opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.nom + (s.famille === 'A' ? ' (en ligne)' : '');
          grp.appendChild(opt);
        });
        sel.appendChild(grp);
      });
    }
  }
}

function showPreparerDetail() {
  var id = document.getElementById('preparer-service').value;
  var el = document.getElementById('preparer-detail');
  if (!id || !rdvServices) { el.innerHTML = ''; return; }
  var svc = rdvServices.find(function(s) { return s.id === Number(id); });
  if (!svc) { el.innerHTML = ''; return; }

  var pieces = svc.pieces_requises || [];
  var html = '';

  // Description / explication
  if (svc.description) {
    html += '<div style="padding:12px 14px;background:var(--blue-light);border-radius:10px;font-size:13px;color:var(--navy);margin:14px 0 12px;line-height:1.6;border-left:3px solid var(--blue);">' +
      escHtml(svc.description) + '</div>';
  }

  // Infos pratiques
  if (svc.delai_reel || svc.frais) {
    html += '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">';
    if (svc.delai_reel) html += '<div style="flex:1;min-width:140px;padding:10px 14px;background:#fef3c7;border-radius:10px;font-size:12px;"><div style="font-size:10px;color:var(--muted);text-transform:uppercase;margin-bottom:2px;">Délai estimé</div><div style="font-weight:600;color:var(--navy);">' + escHtml(svc.delai_reel) + '</div></div>';
    if (svc.frais) html += '<div style="flex:1;min-width:140px;padding:10px 14px;background:#F5F3FF;border-radius:10px;font-size:12px;"><div style="font-size:10px;color:var(--muted);text-transform:uppercase;margin-bottom:2px;">Frais</div><div style="font-weight:600;color:var(--navy);">' + escHtml(svc.frais) + '</div></div>';
    html += '</div>';
  }

  // Pièces à fournir avec cases à cocher
  if (pieces.length) {
    html += '<div style="margin-bottom:14px;">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px;">Pièces à réunir</div>';
    html += pieces.map(function(p, i) {
      return '<label style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;margin-bottom:6px;background:white;border:1px solid var(--line);border-radius:10px;cursor:pointer;transition:background 0.15s;" onchange="updatePreparerProgress()">' +
        '<input type="checkbox" id="piece-check-' + i + '" style="margin-top:2px;width:18px;height:18px;accent-color:var(--green);flex-shrink:0;">' +
        '<span style="font-size:13px;color:var(--navy);line-height:1.5;">' + escHtml(p) + '</span>' +
      '</label>';
    }).join('');
    html += '<div id="preparer-progress" style="margin-top:8px;font-size:12px;color:var(--muted);"></div>';
    html += '</div>';
  }

  // Formulaires
  if (svc.formulaires && svc.formulaires.length) {
    html += '<div style="margin-bottom:14px;">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px;">Formulaires à remplir</div>';
    html += svc.formulaires.map(function(f) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:white;border:1px solid var(--line);border-radius:10px;margin-bottom:4px;font-size:13px;color:var(--navy);">' +
        '<span style="font-size:16px;">📝</span>' + escHtml(f) + '</div>';
    }).join('');
    html += '</div>';
  }

  // Famille A : redirection portail
  if (svc.famille === 'A') {
    html += '<div style="padding:14px;background:#eff6ff;border-radius:10px;text-align:center;margin-top:10px;">' +
      '<div style="font-size:13px;color:var(--navy);font-weight:600;margin-bottom:4px;">Cette démarche se fait en ligne</div>' +
      '<div style="font-size:12px;color:var(--muted);">Rendez-vous sur le portail national des services publics.</div>' +
    '</div>';
  }

  // Bouton "Prendre un RDV" (Famille B uniquement)
  if (svc.famille === 'B') {
    html += '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line);text-align:center;">' +
      '<button class="btn btn-primary" id="preparer-btn-rdv" onclick="lancerPriseRDV()" style="padding:12px 28px;font-size:14px;font-weight:600;border-radius:10px;width:100%;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:middle;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        'Dossier prêt ? Prendre un RDV' +
      '</button>' +
    '</div>';
  }

  el.innerHTML = html;
  updatePreparerProgress();
}

function updatePreparerProgress() {
  var checks = document.querySelectorAll('[id^="piece-check-"]');
  var total = checks.length;
  if (!total) return;
  var done = 0;
  checks.forEach(function(c) { if (c.checked) done++; });
  var pct = Math.round((done / total) * 100);
  var progressEl = document.getElementById('preparer-progress');
  if (progressEl) {
    var color = pct === 100 ? '#16a34a' : pct >= 50 ? '#f97316' : 'var(--muted)';
    progressEl.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="flex:1;height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden;">' +
          '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;transition:width 0.3s;"></div>' +
        '</div>' +
        '<span style="font-weight:600;color:' + color + ';">' + done + '/' + total + '</span>' +
      '</div>' +
      (pct === 100 ? '<div style="color:#16a34a;font-weight:600;margin-top:6px;">Dossier complet !</div>' : '');
  }
  // Activer visuellement le bouton quand tout est coché
  var btn = document.getElementById('preparer-btn-rdv');
  if (btn) {
    btn.style.opacity = pct === 100 ? '1' : '0.6';
  }
  // Quand dossier complet : masquer tab "Préparer", activer "Prendre un RDV"
  var tabPrep = document.getElementById('tab-preparer');
  var tabRdv = document.getElementById('tab-rdv');
  if (tabPrep && tabRdv) {
    if (pct === 100) {
      tabPrep.style.display = 'none';
      tabRdv.className = 'btn btn-primary';
      tabRdv.style.flex = '1';
      // Ajouter lien discret "revoir mon dossier" s'il n'existe pas
      if (!document.getElementById('revoir-dossier-link')) {
        var link = document.createElement('button');
        link.id = 'revoir-dossier-link';
        link.className = 'btn-link';
        link.textContent = 'Revoir mon dossier';
        link.style.cssText = 'font-size:11px;color:var(--muted);cursor:pointer;background:none;border:none;text-decoration:underline;margin-left:8px;';
        link.onclick = function() {
          tabPrep.style.display = '';
          link.remove();
          showDemarchesTab('preparer');
        };
        tabRdv.parentNode.appendChild(link);
      }
    } else {
      tabPrep.style.display = '';
      var rl = document.getElementById('revoir-dossier-link');
      if (rl) rl.remove();
    }
  }
}

// ─── PRISE DE RDV (Temps 2) ──────────────────────────────────
var _rdvWizServiceId = null;
var _rdvWizGuichetId = null;
var _rdvWizCreneaux = [];
var _rdvWizSelectedDate = null;

function lancerPriseRDV() {
  var sel = document.getElementById('preparer-service');
  if (!sel || !sel.value) { showToast(t('demarche.choisir_demarche'), 'error'); return; }
  _rdvWizServiceId = Number(sel.value);
  var svc = rdvServices ? rdvServices.find(function(s) { return s.id === _rdvWizServiceId; }) : null;
  if (!svc) return;
  if (svc.famille === 'A') { showToast('Cette démarche se fait en ligne sur le portail national.', 'info'); return; }

  // Masquer le preparer, afficher le wizard
  document.getElementById('demarches-preparer').classList.add('hidden');
  document.getElementById('rdv-wizard').classList.remove('hidden');
  document.getElementById('rdv-wiz-step1').classList.remove('hidden');
  document.getElementById('rdv-wiz-step2').classList.add('hidden');
  document.getElementById('rdv-wiz-step3').classList.add('hidden');
  document.getElementById('rdv-wiz-service-label').textContent = 'Démarche : ' + svc.nom;

  // Charger les guichets
  rdvLoadGuichets(_rdvWizServiceId);
  document.getElementById('rdv-wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function rdvLoadGuichets(serviceId) {
  var container = document.getElementById('rdv-wiz-guichets');
  container.innerHTML = '<div style="color:var(--muted);font-size:13px;">Chargement des guichets...</div>';
  try {
    var res = await apiFetch('/api/rdv/guichets?serviceId=' + serviceId, { headers: authHeaders() });
    if (!res.ok) { container.innerHTML = '<div style="color:var(--red);">Erreur de chargement.</div>'; return; }
    var guichets = await res.json();
    if (!guichets.length) {
      container.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px;">Aucun guichet ne propose cette démarche pour le moment.</div>';
      return;
    }
    container.innerHTML = guichets.map(function(g) {
      return '<div onclick="rdvSelectGuichet(' + g.id + ')" style="padding:14px 16px;background:white;border:1px solid var(--line);border-radius:12px;cursor:pointer;transition:border-color 0.15s,background 0.15s;" onmouseover="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-light)\'" onmouseout="this.style.borderColor=\'var(--line)\';this.style.background=\'white\'">' +
        '<div style="font-size:14px;font-weight:600;color:var(--navy);">' + escHtml(g.nom) + '</div>' +
        '<div style="font-size:12px;color:var(--muted);margin-top:2px;">' + escHtml(g.commune_nom) + (g.adresse ? ' — ' + escHtml(g.adresse) : '') + '</div>' +
        '<div style="font-size:11px;color:var(--muted);margin-top:4px;">Horaires : ' + g.horaire_debut.slice(0,5) + ' - ' + g.horaire_fin.slice(0,5) + ' · Créneaux de ' + g.duree_creneau_min + ' min</div>' +
      '</div>';
    }).join('');
  } catch(e) { container.innerHTML = '<div style="color:var(--red);">Erreur : ' + e.message + '</div>'; }
}

async function rdvSelectGuichet(guichetId) {
  _rdvWizGuichetId = guichetId;
  document.getElementById('rdv-wiz-step1').classList.add('hidden');
  document.getElementById('rdv-wiz-step2').classList.remove('hidden');

  var joursEl = document.getElementById('rdv-wiz-jours');
  var heuresEl = document.getElementById('rdv-wiz-heures');
  joursEl.innerHTML = '<div style="color:var(--muted);font-size:12px;">Chargement...</div>';
  heuresEl.innerHTML = '';

  try {
    var res = await apiFetch('/api/rdv/guichets/' + guichetId + '/creneaux?serviceId=' + _rdvWizServiceId, { headers: authHeaders() });
    if (!res.ok) { joursEl.innerHTML = 'Erreur'; return; }
    var data = await res.json();
    _rdvWizCreneaux = data.creneaux || [];
    document.getElementById('rdv-wiz-guichet-label').textContent = data.guichet.nom + (data.guichet.adresse ? ' — ' + data.guichet.adresse : '');

    // Grouper par jour
    var jours = {};
    _rdvWizCreneaux.forEach(function(c) {
      if (!jours[c.date]) jours[c.date] = [];
      jours[c.date].push(c);
    });

    var jourKeys = Object.keys(jours);
    if (!jourKeys.length) {
      joursEl.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px;">Aucun créneau disponible dans les 14 prochains jours.</div>';
      return;
    }

    var jourNoms = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    var moisNoms = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
    joursEl.innerHTML = jourKeys.map(function(d) {
      var dt = new Date(d + 'T00:00:00');
      var dispos = jours[d].filter(function(c) { return c.disponible; }).length;
      var total = jours[d].length;
      return '<button onclick="rdvSelectJour(\'' + d + '\')" id="rdv-jour-' + d + '" style="min-width:70px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:white;cursor:pointer;text-align:center;flex-shrink:0;transition:all 0.15s;" class="rdv-jour-btn">' +
        '<div style="font-size:10px;color:var(--muted);">' + jourNoms[dt.getDay()] + '</div>' +
        '<div style="font-size:16px;font-weight:700;color:var(--navy);">' + dt.getDate() + '</div>' +
        '<div style="font-size:10px;color:var(--muted);">' + moisNoms[dt.getMonth()] + '</div>' +
        '<div style="font-size:9px;color:' + (dispos > 0 ? '#16a34a' : 'var(--red)') + ';font-weight:600;">' + dispos + '/' + total + '</div>' +
      '</button>';
    }).join('');

    // Sélectionner le premier jour avec dispos
    var firstDispo = jourKeys.find(function(d) { return jours[d].some(function(c) { return c.disponible; }); });
    if (firstDispo) rdvSelectJour(firstDispo);
  } catch(e) { joursEl.innerHTML = 'Erreur : ' + e.message; }
}

function rdvSelectJour(dateStr) {
  _rdvWizSelectedDate = dateStr;
  // Highlight le jour sélectionné
  document.querySelectorAll('.rdv-jour-btn').forEach(function(b) {
    b.style.borderColor = 'var(--line)';
    b.style.background = 'white';
  });
  var sel = document.getElementById('rdv-jour-' + dateStr);
  if (sel) { sel.style.borderColor = 'var(--blue)'; sel.style.background = 'var(--blue-light)'; }

  // Afficher les heures
  var heures = _rdvWizCreneaux.filter(function(c) { return c.date === dateStr; });
  var container = document.getElementById('rdv-wiz-heures');
  container.innerHTML = heures.map(function(c) {
    var dispo = c.disponible;
    return '<button onclick="' + (dispo ? 'rdvConfirmerCreneau(\'' + c.debut + '\')' : '') + '" style="padding:10px;border:1px solid ' + (dispo ? 'var(--line)' : '#fee2e2') + ';border-radius:10px;background:' + (dispo ? 'white' : '#fef2f2') + ';cursor:' + (dispo ? 'pointer' : 'not-allowed') + ';text-align:center;transition:all 0.15s;opacity:' + (dispo ? '1' : '0.5') + ';" ' + (dispo ? 'onmouseover="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-light)\'" onmouseout="this.style.borderColor=\'var(--line)\';this.style.background=\'white\'"' : '') + '>' +
      '<div style="font-size:15px;font-weight:700;color:' + (dispo ? 'var(--navy)' : 'var(--muted)') + ';">' + c.heure + '</div>' +
      '<div style="font-size:10px;color:' + (dispo ? '#16a34a' : 'var(--red)') + ';">' + (dispo ? c.restants + ' place(s)' : 'Complet') + '</div>' +
    '</button>';
  }).join('');
}

async function rdvConfirmerCreneau(debut) {
  // Confirmation intégrée (pas de confirm natif)

  try {
    var res = await apiFetch('/api/rdv/guichets/reserver', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ guichetId: _rdvWizGuichetId, serviceId: _rdvWizServiceId, debut: debut })
    });
    if (!res.ok) {
      var err = await res.json();
      showToast(err.erreur || 'Erreur de réservation.', 'error');
      return;
    }
    var data = await res.json();
    var c = data.confirmation;

    // Afficher la confirmation
    document.getElementById('rdv-wiz-step2').classList.add('hidden');
    document.getElementById('rdv-wiz-step3').classList.remove('hidden');
    var confHtml =
      '<div style="background:var(--gray-50);border:1px solid var(--line);border-radius:12px;padding:16px;">' +
        // QR Code (via API QR publique)
        '<div style="text-align:center;margin-bottom:14px;">' +
          '<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(c.qr_code || c.numero_rdv) + '" alt="QR Code" style="width:140px;height:140px;border-radius:8px;border:1px solid var(--line);">' +
          '<div style="font-size:10px;color:var(--muted);margin-top:4px;">Présentez ce QR code au guichet</div>' +
        '</div>' +
        '<div style="font-size:20px;font-weight:800;color:var(--navy);text-align:center;margin-bottom:14px;letter-spacing:1px;">' + escHtml(c.qr_code || c.numero_rdv) + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Démarche</span><span style="font-weight:600;color:var(--navy);">' + escHtml(c.service) + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Guichet</span><span style="font-weight:600;color:var(--navy);">' + escHtml(c.guichet) + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Commune</span><span style="font-weight:600;color:var(--navy);">' + escHtml(c.commune) + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Adresse</span><span style="font-weight:600;color:var(--navy);">' + escHtml(c.adresse || '—') + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Date</span><span style="font-weight:600;color:var(--navy);">' + new Date(c.date).toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long',year:'numeric'}) + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Heure</span><span style="font-weight:600;color:var(--navy);">' + escHtml(c.heure) + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--muted);">Ticket</span><span style="font-weight:600;color:var(--navy);">N° ' + c.numero_ticket + '</span></div>' +
        '</div>' +
      '</div>';

    // Pièces à apporter
    if (c.pieces_requises && c.pieces_requises.length) {
      confHtml += '<div style="margin-top:14px;background:white;border:1px solid var(--line);border-radius:12px;padding:14px;">' +
        '<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px;">Pièces à apporter</div>' +
        c.pieces_requises.map(function(p) {
          return '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--navy);padding:4px 0;">📄 ' + escHtml(p) + '</div>';
        }).join('') +
      '</div>';
    }

    // Boutons de gestion
    var rdvId = data.rdv.id;
    var nbModifs = data.rdv.nb_modifications || 0;
    confHtml += '<div style="margin-top:16px;display:flex;gap:8px;">';
    if (nbModifs < 2) {
      confHtml += '<button class="btn btn-sm btn-outline" onclick="modifierRDV(\'' + rdvId + '\')" style="flex:1;">Modifier le RDV <span style="font-size:10px;color:var(--muted);">(' + (2 - nbModifs) + ' restante' + ((2-nbModifs)>1?'s':'') + ')</span></button>';
    } else {
      confHtml += '<div style="flex:1;text-align:center;font-size:11px;color:var(--muted);padding:8px;">Nombre maximum de modifications atteint</div>';
    }
    confHtml += '<button class="btn btn-sm" style="background:var(--red-light);color:var(--red);" onclick="annulerRDV(\'' + rdvId + '\')">Annuler</button>';
    confHtml += '</div>';

    document.getElementById('rdv-wiz-confirmation').innerHTML = confHtml;
    showToast(t('demarche.rdv_confirme'));
  } catch(e) { showToast(e.message, 'error'); }
}

function rdvWizBack(step) {
  if (step === 1) {
    document.getElementById('rdv-wiz-step2').classList.add('hidden');
    document.getElementById('rdv-wiz-step1').classList.remove('hidden');
  }
}

function rdvWizBackToStart() {
  document.getElementById('rdv-wizard').classList.add('hidden');
  // Si vient du tab Preparer → retourner au preparer
  if (!document.getElementById('demarches-preparer').classList.contains('hidden')) {
    document.getElementById('demarches-preparer').classList.remove('hidden');
    return;
  }
  // Sinon → retourner au step 1 commune/service
  document.getElementById('rdv-steps').classList.remove('hidden');
  document.getElementById('rdv-step-1').classList.remove('hidden');
  document.getElementById('rdv-demarche-detail').classList.remove('hidden');
}

// ─── PRÉFÉRENCES PROFIL ──────────────────────────────────────
async function loadPreferences() {
  try {
    const u = await safeFetchJSON('/api/auth/me', {}, true);
    const checks = {
      'pref-push': u.notifications_push,
      'pref-sms': u.notifications_sms,
      'pref-email': u.notifications_email,
      'pref-wilaya': u.consentement_wilaya,
      'pref-geo': u.consentement_geo,
    };
    for (const [id, val] of Object.entries(checks)) {
      const el = document.getElementById(id);
      if (el) el.checked = !!val;
    }
  } catch(e) { console.warn('[profil] échec chargement préférences:', e.message); }
}

async function savePref(field, value) {
  try {
    await apiFetch('/api/auth/preferences', {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    });
    showToast(t('profil.pref_sauvee'));
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

// ─── BANDEAU COMMUNIQUÉS OFFICIELS ───────────────────────────
var _bandeauData = [];
var _bandeauIdx = 0;
var _bandeauTimer = null;

async function loadCommuniques() {
  try {
    var data;
    try { data = await safeFetchJSON('/api/referentiel/epics/_CM'); }
    catch(e) {
      try { data = await safeFetchJSON('/api/infos/communiques'); } catch(e2) { data = []; }
    }
    var bandeau = document.getElementById('bandeau-communiques');
    var ticker = document.getElementById('bandeau-ticker');
    var voirTout = document.getElementById('bandeau-voir-tout');
    if (!bandeau || !ticker) return;

    if (!data || !data.length) {
      ticker.innerHTML = '<span class="bandeau-item bandeau-info">📢 Aucun communiqué en cours</span>';
      bandeau.classList.remove('hidden');
      return;
    }

    _bandeauData = data;
    _bandeauIdx = 0;

    // Afficher le premier communiqué
    function renderBandeauItem(idx) {
      var c = _bandeauData[idx];
      if (!c) return;
      var icons = { urgent:'🔴', important:'🔵', info:'📢' };
      var cls = 'bandeau-' + (c.niveau || 'info');
      var dot = 'bandeau-dot bandeau-dot-' + (c.niveau || 'info');
      ticker.innerHTML = '<span class="bandeau-item ' + cls + '"><span class="' + dot + '"></span>' +
        (icons[c.niveau] || '📢') + ' <strong>' + escHtml(c.titre) + '</strong> — ' + escHtml(c.message) + '</span>';
    }

    renderBandeauItem(0);
    bandeau.classList.remove('hidden');

    // Bouton "Voir tout" si plusieurs communiqués
    if (data.length > 1 && voirTout) voirTout.classList.remove('hidden');

    // Rotation automatique toutes les 7 secondes si plusieurs
    if (_bandeauTimer) clearInterval(_bandeauTimer);
    if (data.length > 1) {
      _bandeauTimer = setInterval(function() {
        _bandeauIdx = (_bandeauIdx + 1) % _bandeauData.length;
        renderBandeauItem(_bandeauIdx);
      }, 7000);
    }
  } catch(e) { console.warn('[communiques]', e.message); }
}

// ─── VUE COMMUNIQUÉS CITOYENS ────────────────────────────────
async function initCommuniquesView() {
  var el = document.getElementById('communiques-list');
  if (!el) return;
  try {
    var data;
    try { data = await safeFetchJSON('/api/referentiel/epics/_CM'); }
    catch(e) {
      try { data = await safeFetchJSON('/api/infos/communiques'); } catch(e2) { data = []; }
    }
    if (!data || !data.length) {
      el.innerHTML = '<div class="card" style="padding:24px;text-align:center;color:var(--muted);">Aucun communiqué pour le moment.</div>';
      return;
    }
    var icons = { urgent:'🔴', important:'🔵', info:'📢' };
    el.innerHTML = data.map(function(c) {
      var ico = icons[c.niveau] || '📢';
      var date = c.date_publication ? new Date(c.date_publication).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'}) : '';
      var communeTag = c.commune_nom ? '<span style="font-size:10px;padding:2px 8px;border-radius:8px;background:#dbeafe;color:#2563eb;margin-left:6px;">' + escHtml(c.commune_nom) + '</span>' : '';
      return '<div class="card" style="padding:16px 20px;">' +
        '<div style="display:flex;align-items:flex-start;gap:12px;">' +
          '<span style="font-size:20px;line-height:1;">' + ico + '</span>' +
          '<div style="flex:1;min-width:0;">' +
            '<h4 style="font-size:15px;font-weight:700;color:var(--navy);margin:0 0 4px;">' + escHtml(c.titre) + communeTag + '</h4>' +
            '<p style="font-size:13px;color:var(--gray-600);margin:0 0 6px;line-height:1.5;">' + escHtml(c.message) + '</p>' +
            (date ? '<span style="font-size:11px;color:var(--muted);">' + date + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch(e) {
    el.innerHTML = '<div class="card" style="padding:24px;text-align:center;color:var(--muted);">Erreur de chargement.</div>';
  }
}

// ─── INFOS UTILES ────────────────────────────────────────────
var _infosAllData = [];
const CONTACTS_INLINE=[{"id":39,"nom":"Wilaya d'Alger","categorie":"institutions","telephone":"021 43 28 28","adresse":"Palais du Gouvernement","horaires":"Dim-Jeu 8h-16h","lat":36.77,"lng":3.058,"description":"Siège de la Wilaya — administration territoriale","site_web":"www.wilaya-alger.dz"},{"id":40,"nom":"Call center Wilaya","categorie":"institutions","telephone":"1548","adresse":"Alger","horaires":"Dim-Jeu 8h-17h","description":"Centre d'appel — réclamations, orientations"},{"id":41,"nom":"APC Alger-Centre","categorie":"institutions","telephone":"021 73 30 30","adresse":"Rue Larbi Ben M'hidi","horaires":"Dim-Jeu 8h-16h","lat":36.772,"lng":3.059,"description":"Mairie — état civil, urbanisme, social"},{"id":42,"nom":"Tribunal de Sidi M'Hamed","categorie":"institutions","telephone":"021 67 14 14","adresse":"Rue Abane Ramdane","horaires":"Dim-Jeu 8h-15h","lat":36.755,"lng":3.06,"description":"Tribunal judiciaire — affaires civiles et pénales"},{"id":43,"nom":"Direction de l'urbanisme","categorie":"institutions","telephone":"021 43 37 37","adresse":"Palais du Gouvernement","horaires":"Dim-Jeu 8h-16h","lat":36.77,"lng":3.058,"description":"Permis de construire, certificats d'urbanisme"},{"id":44,"nom":"CNAS — Sécurité sociale","categorie":"institutions","telephone":"3010","adresse":"Plusieurs agences","horaires":"Dim-Jeu 8h-16h","description":"Assurance maladie, maternité, AT","site_web":"www.cnas.dz"},{"id":45,"nom":"CASNOS — Non-salariés","categorie":"institutions","telephone":"3020","adresse":"Alger","horaires":"Dim-Jeu 8h-16h","description":"Sécurité sociale des indépendants","site_web":"www.casnos.com.dz"},{"id":46,"nom":"ANEM — Emploi","categorie":"institutions","telephone":"021 73 46 46","adresse":"Alger","horaires":"Dim-Jeu 8h-16h","description":"Offres d'emploi, inscriptions, aides","site_web":"www.anem.dz"},{"id":47,"nom":"Direction du commerce","categorie":"institutions","telephone":"021 43 28 28","adresse":"Alger","horaires":"Dim-Jeu 8h-16h","description":"Protection du consommateur, contrôle des prix"},{"id":48,"nom":"Direction de l'environnement","categorie":"institutions","telephone":"021 43 28 28","adresse":"Alger","horaires":"Dim-Jeu 8h-16h","description":"Protection environnement, espaces verts"},{"id":22,"nom":"Direction Eau et Assainissement","categorie":"reseaux","telephone":"1594","adresse":"Kouba, Alger","horaires":"24h/24 (urgences)","lat":36.734,"lng":3.08,"description":"Eau potable et assainissement — fuites, coupures","site_web":"contact@wilaya-alger.dz"},{"id":23,"nom":"SONELGAZ — Électricité / Gaz","categorie":"reseaux","telephone":"3303","adresse":"2 Bd Krim Belkacem, Alger","horaires":"Urgences 24h/24","lat":36.77,"lng":3.055,"description":"Électricité et gaz — dépannage, facturation","site_web":"www.sonelgaz.dz"},{"id":24,"nom":"Algérie Télécom","categorie":"reseaux","telephone":"100","adresse":"Mohammadia, Alger","horaires":"Dim-Jeu 8h-16h","description":"Téléphonie fixe, internet ADSL/fibre","site_web":"www.algerietelecom.dz"},{"id":25,"nom":"Mobilis","categorie":"reseaux","telephone":"888","adresse":"Alger","horaires":"Dim-Jeu 8h-17h","description":"Opérateur mobile — assistance abonnés","site_web":"www.mobilis.dz"},{"id":26,"nom":"Djezzy","categorie":"reseaux","telephone":"777","adresse":"Alger","horaires":"Dim-Jeu 8h-17h","description":"Opérateur mobile — service client","site_web":"www.djezzy.dz"},{"id":27,"nom":"Ooredoo","categorie":"reseaux","telephone":"555","adresse":"Alger","horaires":"Dim-Jeu 8h-17h","description":"Opérateur mobile — assistance","site_web":"www.ooredoo.dz"},{"id":28,"nom":"Algérie Poste","categorie":"reseaux","telephone":"1530","adresse":"1 Bd Mohamed Khemisti","horaires":"Dim-Jeu 8h-16h","lat":36.773,"lng":3.056,"description":"Services postaux, CCP, mandats","site_web":"www.poste.dz"},{"id":29,"nom":"Direction Propreté","categorie":"reseaux","telephone":"021 23 10 10","adresse":"Alger Centre","horaires":"Dim-Jeu 8h-16h","description":"Collecte déchets et nettoiement"},{"id":30,"nom":"Naftal — Carburants","categorie":"reseaux","telephone":"1540","adresse":"Alger","horaires":"Stations 24h/24","description":"Distribution carburants et GPL","site_web":"www.naftal.dz"},{"id":31,"nom":"ETUSA — Bus Alger","categorie":"transports","telephone":"021 23 50 00","adresse":"Ruisseau, Hussein Dey","horaires":"6h-22h","lat":36.741,"lng":3.098,"description":"Réseau de bus urbains — 80+ lignes","site_web":"www.etusa.dz"},{"id":32,"nom":"Métro d'Alger (EMA)","categorie":"transports","telephone":"021 83 07 07","adresse":"Place des Martyrs","horaires":"5h30-23h","lat":36.786,"lng":3.06,"description":"Ligne 1 : Haï El Badr — Place des Martyrs","site_web":"www.metroalger-dz.com"},{"id":33,"nom":"Tramway (SETRAM)","categorie":"transports","telephone":"021 83 07 07","adresse":"Bordj El Kiffan — Les Fusillés","horaires":"5h30-23h30","lat":36.74,"lng":3.18,"description":"23 km, 38 stations","site_web":"www.setram-dz.com"},{"id":34,"nom":"Téléphérique (ETAC)","categorie":"transports","telephone":"021 66 12 12","adresse":"Plusieurs lignes","horaires":"6h-20h","lat":36.79,"lng":3.055,"description":"Transport par câble — Notre-Dame d'Afrique, etc."},{"id":35,"nom":"Aéroport Houari Boumédiène","categorie":"transports","telephone":"021 50 91 91","adresse":"Dar El Beïda","horaires":"24h/24","lat":36.691,"lng":3.215,"description":"Vols nationaux et internationaux","site_web":"www.aeroportalger.dz"},{"id":36,"nom":"Gare ferroviaire Agha","categorie":"transports","telephone":"021 63 15 15","adresse":"Place de la Gare","horaires":"5h-23h","lat":36.747,"lng":3.068,"description":"Trains banlieue et grandes lignes — SNTF","site_web":"www.sntf.dz"},{"id":37,"nom":"Port d'Alger (EPAL)","categorie":"transports","telephone":"021 42 35 35","adresse":"Port d'Alger","horaires":"24h/24","lat":36.789,"lng":3.062,"description":"Transport maritime voyageurs"},{"id":38,"nom":"Taxi radio Alger","categorie":"transports","telephone":"021 21 21 21","adresse":"Alger","horaires":"24h/24","description":"Réservation taxi à la demande"},{"id":14,"nom":"Police secours","categorie":"urgences","telephone":"17","adresse":"Alger","horaires":"24h/24","description":"Numéro d'urgence police nationale"},{"id":15,"nom":"Gendarmerie nationale","categorie":"urgences","telephone":"1055","adresse":"Alger","horaires":"24h/24","description":"Numéro d'urgence gendarmerie"},{"id":16,"nom":"Protection civile (Pompiers)","categorie":"urgences","telephone":"14","adresse":"Alger","horaires":"24h/24","description":"Pompiers et secours — incendie, accidents, catastrophes"},{"id":17,"nom":"SAMU / Ambulance","categorie":"urgences","telephone":"115","adresse":"CHU Mustapha, Alger","horaires":"24h/24","lat":36.758,"lng":3.065,"description":"Service d'aide médicale urgente"},{"id":18,"nom":"Croissant-Rouge algérien","categorie":"urgences","telephone":"021 63 48 48","adresse":"15 Bd Mohamed V, Alger","horaires":"Dim-Jeu 8h-16h","lat":36.77,"lng":3.057,"description":"Assistance humanitaire et premiers secours"},{"id":19,"nom":"Centre anti-poison","categorie":"urgences","telephone":"021 97 98 98","adresse":"CHU Bab El Oued","horaires":"24h/24","lat":36.795,"lng":3.05,"description":"Urgences intoxications et empoisonnements"},{"id":20,"nom":"Enfance en danger","categorie":"urgences","telephone":"1111","adresse":"Alger","horaires":"24h/24","description":"Signalement maltraitance enfants"},{"id":21,"nom":"SOS Femmes en détresse","categorie":"urgences","telephone":"3303","adresse":"Alger","horaires":"24h/24","description":"Aide aux femmes victimes de violence"},{"id":49,"nom":"Pharmacies de garde — Sante-DZ","categorie":"sante","description":"Liste des pharmacies de garde par commune, jour et nuit — service tiers Sante-DZ","site_web":"sante-dz.com/infosutiles/8UMTpPA2xP5XY0n4XSDWW5gZ4nKgvDUG"}];
function filterInfos() {
  var q = (document.getElementById('infos-search').value || '').trim().toLowerCase();
  if (!q) { renderInfos(_infosAllData); return; }
  renderInfos(_infosAllData.filter(function(c) {
    return (c.nom||'').toLowerCase().indexOf(q)>-1 || (c.description||'').toLowerCase().indexOf(q)>-1 ||
           (c.telephone||'').indexOf(q)>-1 || (c.adresse||'').toLowerCase().indexOf(q)>-1;
  }));
}
function renderInfos(contacts) {
  var el = document.getElementById('infos-list');
  var countEl = document.getElementById('infos-count');
  if (!contacts || !contacts.length) { el.innerHTML = '<div style="text-align:center;padding:32px 16px;color:var(--muted);"><div style="font-size:32px;margin-bottom:8px;">🔎</div><p style="font-size:14px;">' + t('global.aucun_resultat') + '</p></div>'; if(countEl) countEl.textContent=''; return; }
  if (countEl) countEl.textContent = contacts.length + ' contact' + (contacts.length > 1 ? 's' : '');
  var catIcons = { urgences:'🚨', reseaux:'🔧', transports:'🚌', institutions:'🏛️', sante:'💊' };
  var catColors = { urgences:'#ef4444', reseaux:'#2563eb', transports:'#f59e0b', institutions:'#0B3C5D', sante:'#16a34a' };
  el.innerHTML = contacts.map(function(c) {
    var icon = catIcons[c.categorie] || 'ℹ️';
    var color = catColors[c.categorie] || '#666';
    return '<div class="card" style="margin-bottom:10px;padding:14px 16px;border-left:3px solid ' + color + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">' +
        '<div style="flex:1;min-width:160px;">' +
          '<div style="font-weight:700;font-size:14px;color:var(--navy);">' + icon + ' ' + escHtml(c.nom) + '</div>' +
          (c.description ? '<div style="font-size:12px;color:var(--gray-600);margin:3px 0;">' + escHtml(c.description) + '</div>' : '') +
          (c.horaires ? '<div style="font-size:11px;color:var(--muted);">🕐 ' + escHtml(c.horaires) + '</div>' : '') +
          (c.adresse ? '<div style="font-size:11px;color:var(--muted);">📍 ' + escHtml(c.adresse) + '</div>' : '') +
          (c.site_web ? '<div style="font-size:11px;"><a href="https://' + escHtml(c.site_web) + '" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none;">🌐 ' + escHtml(c.site_web.split('/')[0]) + '</a>' + (c.categorie === 'sante' ? ' <span style="font-size:10px;background:#f0fdf4;color:#16a34a;padding:1px 6px;border-radius:4px;">' + t('infos.service_tiers') + '</span>' : '') + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">' +
          (c.telephone ? '<a href="tel:' + c.telephone + '" class="btn btn-sm btn-primary" style="font-size:12px;padding:4px 10px;">📞 ' + escHtml(c.telephone) + '</a>' : '') +
          (c.site_web && !c.telephone ? '<a href="https://' + escHtml(c.site_web) + '" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="font-size:12px;padding:4px 10px;">🌐 ' + t('infos.ouvrir_site') + '</a>' : '') +
          (c.lat && c.lng ? '<a href="https://www.google.com/maps/dir/?api=1&destination=' + c.lat + ',' + c.lng + '" target="_blank" class="btn btn-sm btn-outline" style="font-size:12px;padding:4px 10px;">🧭 Localiser</a>' : '') +
          (c.email ? '<a href="mailto:' + c.email + '" class="btn btn-sm btn-outline" style="font-size:12px;padding:4px 10px;">✉️ Email</a>' : '') +
        '</div>' +
      '</div></div>';
  }).join('');
}
async function loadInfos(categorie) {
  const el = document.getElementById('infos-list');
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">' + t('global.chargement') + '</div>';
  // Use inline data (always available, no OLS dependency)
  var contacts = CONTACTS_INLINE;
  // Try API for fresh data (may fail via OLS)
  try {
    var fresh = await safeFetchJSON('/api/referentiel/epics/_CT', {}, true);
    if (Array.isArray(fresh) && fresh.length) contacts = fresh;
  } catch(e) {
    try { var fresh2 = await safeFetchJSON('/api/infos/contacts', {}, true);
      if (Array.isArray(fresh2) && fresh2.length) contacts = fresh2;
    } catch(e2) { /* use inline */ }
  }
  // Filter by category if requested
  if (categorie) contacts = contacts.filter(function(c) { return c.categorie === categorie; });
  _infosAllData = contacts;
  var searchEl = document.getElementById('infos-search');
  if (searchEl) searchEl.value = '';
  renderInfos(_infosAllData);
}

// ─── PERDU-TROUVÉ ────────────────────────────────────────────
async function submitPerduTrouve(e) {
  e.preventDefault();
  hideError('pt-error');
  var fd = new FormData();
  fd.append('type', document.getElementById('pt-type').value);
  fd.append('nature', document.getElementById('pt-nature').value);
  fd.append('description', document.getElementById('pt-description').value.trim());
  var lieu = document.getElementById('pt-lieu').value.trim();
  if (lieu) fd.append('lieu', lieu);
  var dateFait = document.getElementById('pt-date').value;
  if (dateFait) fd.append('date_fait', dateFait);
  var photo = document.getElementById('pt-photo').files[0];
  if (photo) fd.append('photo', photo);
  try {
    var res = await apiFetch('/api/perdu-trouve', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + getToken() }, body: fd
    });
    var data = await res.json();
    if (!res.ok) {
      showError('pt-error', currentLang === 'ar' ? (data.erreur_ar || data.erreur) : data.erreur);
      return;
    }
    document.getElementById('pt-form').style.display = 'none';
    document.getElementById('pt-success').style.display = '';
    document.getElementById('pt-ref').textContent = t('pt.reference') + ' ' + data.reference;
  } catch(err) { showError('pt-error', err.message); }
}

// ─── ÉQUIPEMENTS PUBLICS ─────────────────────────────────────
var _equipAllData = [];
var _equipSearchTimer = null;
var _equipCurrentType = null;
var _equipLoaded = false;

function filterEquipType(btn, type) {
  _equipCurrentType = type || null;
  // Highlight
  document.querySelectorAll('#equip-categories .btn').forEach(function(b) {
    b.className = 'btn btn-sm btn-outline';
  });
  if (btn) btn.className = 'btn btn-sm btn-primary';
  // Clear search
  var searchEl = document.getElementById('equip-search');
  if (searchEl) searchEl.value = '';
  // Filter from cached data or reload
  if (_equipLoaded && _equipAllData.length) {
    var filtered = type ? _equipAllData.filter(function(e) { return e.type === type; }) : _equipAllData;
    renderEquipements(filtered);
  } else {
    loadEquipements(type);
  }
}

async function loadEquipements(type) {
  var el = document.getElementById('equip-list');
  var countEl = document.getElementById('equip-count');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Chargement des équipements...</div>';
  if (countEl) countEl.textContent = '';

  try {
    var data = null;
    try { data = await safeFetchJSON('/api/referentiel/epics/_EQ', {}, true); }
    catch(e) {
      try { data = await safeFetchJSON('/api/equipements', {}, true); } catch(e2) { console.warn('[equip] échec chargement équipements fallback:', e2.message); }
    }
    if (!data || !Array.isArray(data)) throw new Error('API indisponible — vérifiez la connexion');

    _equipAllData = data;
    _equipLoaded = true;

    // Appliquer le filtre type si demandé
    var display = type ? data.filter(function(e) { return e.type === type; }) : data;
    renderEquipements(display);
  } catch(e) {
    console.error('[equipements]', e.message);
    el.innerHTML = '<div class="card" style="padding:20px;text-align:center;">' +
      '<p style="color:var(--red);font-size:14px;">Impossible de charger les équipements pour le moment.</p>' +
      '<p style="font-size:12px;color:var(--muted);margin:6px 0;">' + escHtml(e.message) + '</p>' +
      '<button class="btn btn-sm btn-primary" onclick="loadEquipements()" style="margin-top:10px;">Réessayer</button></div>';
  }
}

function searchEquipements() {
  if (_equipSearchTimer) clearTimeout(_equipSearchTimer);
  _equipSearchTimer = setTimeout(function() {
    var q = (document.getElementById('equip-search').value || '').trim().toLowerCase();
    var base = _equipCurrentType ? _equipAllData.filter(function(e) { return e.type === _equipCurrentType; }) : _equipAllData;
    if (!q) { renderEquipements(base); return; }
    var filtered = base.filter(function(e) {
      return (e.nom || '').toLowerCase().indexOf(q) > -1 ||
             (e.type || '').toLowerCase().indexOf(q) > -1 ||
             (e.adresse || '').toLowerCase().indexOf(q) > -1 ||
             (e.commune_nom || '').toLowerCase().indexOf(q) > -1;
    });
    renderEquipements(filtered);
  }, 300);
}

function renderEquipements(data) {
  var el = document.getElementById('equip-list');
  var countEl = document.getElementById('equip-count');
  if (!el) return;
  if (!data || !data.length) {
    el.innerHTML = '<div style="text-align:center;padding:32px 16px;color:var(--muted);"><div style="font-size:32px;margin-bottom:8px;">📍</div><p style="font-size:14px;">Aucun équipement trouvé pour cette catégorie.</p></div>';
    if (countEl) countEl.textContent = '0 équipement';
    return;
  }
  if (countEl) countEl.textContent = data.length + ' équipement' + (data.length > 1 ? 's' : '');
  var icons = {apc:'🏛️',daira:'🏛️',ecole:'🏫',college:'🏫',lycee:'🎓',mosquee:'🕌',hopital:'🏥',polyclinique:'🏥',pharmacie:'💊',poste:'📮',marche:'🛒',parc:'🌳',aire_jeux:'🎠',bibliotheque:'📚',maison_jeunes:'🏠',salle_sport:'⚽',transport:'🚌',parking:'🅿️',cap:'👤',commissariat:'👮',pompiers:'🚒',autre:'📍'};
  var typeLabels = {apc:'APC',daira:'Daïra',ecole:'École',college:'Collège',lycee:'Lycée',mosquee:'Mosquée',hopital:'Hôpital',polyclinique:'Polyclinique',pharmacie:'Pharmacie',poste:'Poste',marche:'Marché',parc:'Parc / Jardin',aire_jeux:'Aire de jeux',bibliotheque:'Bibliothèque',maison_jeunes:'Espace culturel',salle_sport:'Centre sportif',transport:'Transport',parking:'Parking',commissariat:'Commissariat',pompiers:'Protection civile',autre:'Autre'};
  var statusColors = {actif:'#16a34a',ferme_temp:'#f59e0b',en_travaux:'#2563eb',hors_service:'#ef4444'};
  el.innerHTML = data.map(function(e) {
    var icon = icons[e.type] || '📍';
    var color = statusColors[e.statut] || '#16a34a';
    var label = typeLabels[e.type] || e.type;
    return '<div class="card" style="margin-bottom:8px;padding:14px;border-left:3px solid ' + color + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">' +
        '<div style="flex:1;min-width:160px;">' +
          '<div style="font-weight:700;font-size:14px;color:var(--navy);">' + icon + ' ' + escHtml(e.nom) + '</div>' +
          '<div style="font-size:12px;color:var(--blue);font-weight:500;margin:2px 0;">' + escHtml(label) + (e.commune_nom ? ' · ' + escHtml(e.commune_nom) : '') + '</div>' +
          (e.adresse ? '<div style="font-size:12px;color:var(--muted);">📍 ' + escHtml(e.adresse) + '</div>' : '') +
          (e.horaires ? '<div style="font-size:12px;color:var(--muted);">🕐 ' + escHtml(e.horaires) + '</div>' : '') +
          (e.description ? '<div style="font-size:11px;color:var(--gray-500);margin-top:4px;">' + escHtml(e.description) + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">' +
          (e.telephone ? '<a href="tel:' + e.telephone + '" class="btn btn-sm btn-primary" style="font-size:11px;padding:4px 10px;">📞 ' + escHtml(e.telephone) + '</a>' : '') +
          (e.lat && e.lng ? '<a href="https://www.google.com/maps/dir/?api=1&destination=' + e.lat + ',' + e.lng + '" target="_blank" class="btn btn-sm btn-outline" style="font-size:11px;padding:4px 10px;">🧭 ' + t('bo.voir_carte') + '</a>' : '') +
        '</div>' +
      '</div></div>';
  }).join('');
}

// ─── SIGNALER — DOUBLE CHEMIN UNIFIÉ ─────────────────────────
// Taxonomie 16 catégories inline (pas de dépendance API pour le rendu)
let sigFamillesData = null;
const SIG_TAXONOMY_INLINE = {"accessibilite":[{"id":72,"libelle":"Autre accessibilité","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"accessibilite autre handicap mobilite"},{"id":70,"libelle":"Absence de rampe / main courante","groupe":"Bâtiments","criticite":"moyenne","epic_sigle":null,"keywords":"rampe main courante absence escalier"},{"id":69,"libelle":"Trottoir non accessible PMR","groupe":"Piétons","criticite":"moyenne","epic_sigle":null,"keywords":"trottoir non accessible pmr fauteuil roulant"},{"id":71,"libelle":"Place PMR occupée / non conforme","groupe":"Stationnement","criticite":"moyenne","epic_sigle":"DIR-PARK","keywords":"place pmr occupee non conforme parking"}],"animaux":[{"id":68,"libelle":"Autre animal","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"animal autre"},{"id":65,"libelle":"Animal errant (chien, chat)","groupe":"Errants","criticite":"basse","epic_sigle":null,"keywords":"animal errant chien chat abandonner"},{"id":67,"libelle":"Nid d'insectes dangereux (guêpes, frelons)","groupe":"Insectes","criticite":"haute","epic_sigle":null,"keywords":"nid insecte guepe frelon abeille dangereux"},{"id":66,"libelle":"Animal mort sur la voie publique","groupe":"Urgences","criticite":"moyenne","epic_sigle":null,"keywords":"animal mort cadavre voie publique"}],"assainissement":[{"id":40,"libelle":"Autre assainissement","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"assainissement autre"},{"id":38,"libelle":"Odeurs nauséabondes","groupe":"Nuisances","criticite":"moyenne","epic_sigle":null,"keywords":"odeur nauseabonde puanteur egout"},{"id":37,"libelle":"Regard/avaloir bouché","groupe":"Réseau","criticite":"haute","epic_sigle":null,"keywords":"regard avaloir bouche egout grille"},{"id":39,"libelle":"Refoulement eaux usées","groupe":"Urgences","criticite":"haute","epic_sigle":null,"keywords":"refoulement eaux usees debordement"}],"autre":[{"id":36,"libelle":"Autre problème","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"autre probleme divers"}],"batiments":[{"id":42,"libelle":"Accessibilité non conforme","groupe":"Accessibilité","criticite":"moyenne","epic_sigle":null,"keywords":"accessibilite rampe ascenseur handicap"},{"id":44,"libelle":"Autre bâtiment public","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"batiment public autre ecole mairie"},{"id":43,"libelle":"Équipement défectueux (chauffage, sanitaires)","groupe":"Équipements","criticite":"moyenne","epic_sigle":null,"keywords":"equipement chauffage sanitaire plomberie"},{"id":41,"libelle":"Bâtiment dégradé (façade, toiture)","groupe":"Structure","criticite":"moyenne","epic_sigle":null,"keywords":"batiment degrade facade toiture fissure mur"}],"eau":[{"id":9,"libelle":"Coupure d'eau ou pression faible","groupe":"Alimentation","criticite":"haute","epic_sigle":null,"keywords":"coupure eau pression faible robinet"},{"id":12,"libelle":"Pression insuffisante","groupe":"Alimentation","criticite":"moyenne","epic_sigle":null,"keywords":"pression insuffisante debit"},{"id":14,"libelle":"Autre eau","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"eau autre probleme"},{"id":8,"libelle":"Fuite d'eau visible","groupe":"Fuites","criticite":"haute","epic_sigle":null,"keywords":"fuite eau visible canalisation tuyau"},{"id":11,"libelle":"Fuite sur compteur","groupe":"Fuites","criticite":"moyenne","epic_sigle":null,"keywords":"fuite compteur branchement"},{"id":10,"libelle":"Eau non potable ou colorée","groupe":"Qualité","criticite":"haute","epic_sigle":null,"keywords":"eau non potable colorée"},{"id":13,"libelle":"Inondation ou refoulement","groupe":"Urgences","criticite":"haute","epic_sigle":null,"keywords":"inondation refoulement debordement egout"}],"eclairage":[{"id":26,"libelle":"Autre éclairage","groupe":"Autre","criticite":"basse","epic_sigle":"DIR-ECL","keywords":"eclairage autre"},{"id":6,"libelle":"Éclairage défaillant","groupe":"Lampadaires","criticite":"moyenne","epic_sigle":"DIR-ECL","keywords":"eclairage defaillant lampe"},{"id":24,"libelle":"Lampadaire clignotant ou défectueux","groupe":"Lampadaires","criticite":"moyenne","epic_sigle":"DIR-ECL","keywords":"lampadaire clignotant defectueux"},{"id":23,"libelle":"Lampadaire éteint","groupe":"Lampadaires","criticite":"moyenne","epic_sigle":"DIR-ECL","keywords":"lampadaire eteint nuit sombre"},{"id":25,"libelle":"Câble électrique apparent (danger)","groupe":"Urgences","criticite":"haute","epic_sigle":"DIR-ECL","keywords":"cable electrique apparent danger"}],"environnement":[{"id":60,"libelle":"Autre environnement","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"environnement autre ecologie nature"},{"id":58,"libelle":"Cours d'eau / oued pollué","groupe":"Eau","criticite":"haute","epic_sigle":null,"keywords":"cours eau oued pollue riviere"},{"id":57,"libelle":"Déversement illicite (huile, chimique)","groupe":"Pollution","criticite":"haute","epic_sigle":"DIR-CET","keywords":"deversement illicite huile chimique toxique"},{"id":59,"libelle":"Terrain vague insalubre","groupe":"Salubrité","criticite":"moyenne","epic_sigle":null,"keywords":"terrain vague insalubre friche abandon"}],"espaces_verts":[{"id":15,"libelle":"Arbre dangereux ou espace vert dégradé","groupe":"Arbres","criticite":"moyenne","epic_sigle":"DIR-EVT","keywords":"arbre dangereux espace vert degrade branche"},{"id":22,"libelle":"Autre espaces verts","groupe":"Autre","criticite":"basse","epic_sigle":"DIR-EVT","keywords":"espaces verts autre"},{"id":18,"libelle":"Arrosage défectueux ou fuite","groupe":"Entretien","criticite":"moyenne","epic_sigle":"DIR-EVT","keywords":"arrosage defectueux fuite pelouse"},{"id":21,"libelle":"Plantation ou fleurissement à entretenir","groupe":"Entretien","criticite":"basse","epic_sigle":"DIR-EVT","keywords":"plantation fleurissement entretenir herbe"},{"id":20,"libelle":"Aire de jeux endommagée","groupe":"Équipements","criticite":"moyenne","epic_sigle":"DIR-EVT","keywords":"aire jeux endommagee enfant"},{"id":19,"libelle":"Mobilier urbain dégradé (banc…)","groupe":"Équipements","criticite":"basse","epic_sigle":"DIR-EVT","keywords":"mobilier urbain banc degrade casse"}],"mobilier_urbain":[{"id":52,"libelle":"Autre mobilier urbain","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"mobilier urbain autre"},{"id":49,"libelle":"Banc / abri bus dégradé","groupe":"Mobilier","criticite":"basse","epic_sigle":null,"keywords":"banc abri bus degrade casse arret"},{"id":50,"libelle":"Poubelle publique manquante ou cassée","groupe":"Propreté","criticite":"moyenne","epic_sigle":null,"keywords":"poubelle publique manquante cassee corbeille"},{"id":51,"libelle":"Panneau / affichage endommagé","groupe":"Signalétique","criticite":"basse","epic_sigle":null,"keywords":"panneau affichage endommage info"}],"nuisances":[{"id":47,"libelle":"Nuisibles (rats, insectes, pigeons)","groupe":"Animaux","criticite":"moyenne","epic_sigle":null,"keywords":"nuisible rat insecte pigeon cafard moustique"},{"id":48,"libelle":"Autre nuisance","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"nuisance autre gene"},{"id":45,"libelle":"Bruit excessif (chantier, voisinage)","groupe":"Bruit","criticite":"moyenne","epic_sigle":null,"keywords":"bruit excessif chantier voisinage tapage nocturne"},{"id":46,"libelle":"Pollution de l'air / fumées","groupe":"Pollution","criticite":"haute","epic_sigle":null,"keywords":"pollution air fumee odeur usine"}],"proprete":[{"id":7,"libelle":"Autre propreté","groupe":"Autre","criticite":"basse","epic_sigle":null,"keywords":"proprete autre nettoyage"},{"id":2,"libelle":"Benne pleine ou débordante","groupe":"Collecte","criticite":"moyenne","epic_sigle":null,"keywords":"benne pleine debordante conteneur"},{"id":1,"libelle":"Dépôt sauvage (ordures, gravats)","groupe":"Collecte","criticite":"haute","epic_sigle":null,"keywords":"depot sauvage ordure gravats dechets"},{"id":3,"libelle":"Encombrants sur la voie publique","groupe":"Collecte","criticite":"basse","epic_sigle":null,"keywords":"encombrants voie publique meuble matelas"},{"id":4,"libelle":"Tags ou graffitis","groupe":"Dégradations","criticite":"basse","epic_sigle":null,"keywords":"tags graffiti graffitis mur facade"},{"id":17,"libelle":"Décharge sauvage (enfouissement illicite)","groupe":"Urgences","criticite":"haute","epic_sigle":"DIR-CET","keywords":"decharge sauvage enfouissement illicite pollution"}],"securite":[{"id":64,"libelle":"Autre danger","groupe":"Autre","criticite":"haute","epic_sigle":null,"keywords":"securite danger autre risque"},{"id":62,"libelle":"Mur / structure menaçant de s'effondrer","groupe":"Danger","criticite":"haute","epic_sigle":null,"keywords":"mur structure effondrer danger ruine"},{"id":61,"libelle":"Trou / excavation non protégé","groupe":"Danger","criticite":"haute","epic_sigle":null,"keywords":"trou excavation non protege chantier ouvert"},{"id":63,"libelle":"Câble / fil électrique au sol","groupe":"Électrique","criticite":"haute","epic_sigle":"DIR-ECL","keywords":"cable fil electrique sol danger"}],"stationnement":[{"id":33,"libelle":"Place PMR non respectée","groupe":"Accessibilité","criticite":"moyenne","epic_sigle":"DIR-PARK","keywords":"place pmr non respectee handicap"},{"id":35,"libelle":"Autre stationnement","groupe":"Autre","criticite":"basse","epic_sigle":"DIR-PARK","keywords":"stationnement autre parking"},{"id":16,"libelle":"Stationnement gênant ou anarchique","groupe":"Gênant","criticite":"moyenne","epic_sigle":"DIR-PARK","keywords":"stationnement genant anarchique double file"},{"id":34,"libelle":"Zone à réguler","groupe":"Régulation","criticite":"basse","epic_sigle":"DIR-PARK","keywords":"zone reguler horodateur"}],"transport":[{"id":56,"libelle":"Autre transport","groupe":"Autre","criticite":"basse","epic_sigle":"DIR-CIRC","keywords":"transport autre bus tram metro"},{"id":53,"libelle":"Arrêt de bus sans abri / dégradé","groupe":"Infrastructure","criticite":"basse","epic_sigle":"DIR-CIRC","keywords":"arret bus abri degrade transport"},{"id":55,"libelle":"Passage piéton effacé / dangereux","groupe":"Sécurité","criticite":"moyenne","epic_sigle":"DIR-CIRC","keywords":"passage pieton efface dangereux zebra"},{"id":54,"libelle":"Signalisation routière manquante","groupe":"Signalisation","criticite":"moyenne","epic_sigle":"DIR-CIRC","keywords":"signalisation routiere manquante panneau stop"}],"voirie":[{"id":31,"libelle":"Autre voirie","groupe":"Autre","criticite":"basse","epic_sigle":"DIR-CIRC","keywords":"voirie autre route"},{"id":5,"libelle":"Chaussée dégradée (nid-de-poule)","groupe":"Chaussée","criticite":"haute","epic_sigle":"DIR-CIRC","keywords":"chaussee degradee nid poule trou goudron"},{"id":30,"libelle":"Feu tricolore en panne","groupe":"Circulation","criticite":"haute","epic_sigle":"DIR-CIRC","keywords":"feu tricolore panne rouge circulation"},{"id":29,"libelle":"Signalisation manquante ou endommagée","groupe":"Signalisation","criticite":"moyenne","epic_sigle":"DIR-CIRC","keywords":"signalisation manquante endommagee panneau"},{"id":28,"libelle":"Trottoir dégradé ou inaccessible","groupe":"Trottoirs","criticite":"moyenne","epic_sigle":"DIR-CIRC","keywords":"trottoir degrade inaccessible dalle"}]};
let sigMapInitialized = false;
let sigMap = null;
let sigMarker = null;

const SIG_FAMILLE_META = {
  eau:             { icon: '💧', color: '#2563eb', label: 'Eau',              label_ar: 'المياه' },
  assainissement:  { icon: '🚿', color: '#0891b2', label: 'Assainissement',   label_ar: 'الصرف الصحي' },
  voirie:          { icon: '🛣️', color: '#64748b', label: 'Voirie',           label_ar: 'الطرق' },
  eclairage:       { icon: '💡', color: '#eab308', label: 'Éclairage',        label_ar: 'الإنارة' },
  proprete:        { icon: '🗑️', color: '#0B3C5D', label: 'Propreté',         label_ar: 'النظافة' },
  espaces_verts:   { icon: '🌳', color: '#16a34a', label: 'Espaces verts',    label_ar: 'المساحات الخضراء' },
  stationnement:   { icon: '🅿️', color: '#8b5cf6', label: 'Stationnement',   label_ar: 'المواقف' },
  transport:       { icon: '🚌', color: '#f59e0b', label: 'Transport',        label_ar: 'النقل' },
  batiments:       { icon: '🏢', color: '#78716c', label: 'Bâtiments publics',label_ar: 'المباني العمومية' },
  nuisances:       { icon: '🔊', color: '#ef4444', label: 'Nuisances',        label_ar: 'الإزعاجات' },
  mobilier_urbain: { icon: '🪑', color: '#6366f1', label: 'Mobilier urbain',  label_ar: 'الأثاث الحضري' },
  environnement:   { icon: '🌍', color: '#16a34a', label: 'Environnement',    label_ar: 'البيئة' },
  securite:        { icon: '⚠️', color: '#dc2626', label: 'Sécurité',         label_ar: 'الأمن' },
  animaux:         { icon: '🐾', color: '#a16207', label: 'Animaux',          label_ar: 'الحيوانات' },
  accessibilite:   { icon: '♿', color: '#7c3aed', label: 'Accessibilité',    label_ar: 'سهولة الوصول' },
  autre:           { icon: '❓', color: '#9ca3af', label: 'Autre',            label_ar: 'أخرى' },
};

const SIG_FAMILLE_ORDER = ['eau','assainissement','voirie','eclairage','proprete','espaces_verts','stationnement','transport','batiments','nuisances','mobilier_urbain','environnement','securite','animaux','accessibilite','autre'];

async function initSignaler() {
  // Initialiser le parcours rapide
  sigRapideInit();
  // Charger les familles: API d'abord, taxonomie inline en fallback
  if (!sigFamillesData || !Object.keys(sigFamillesData).length) {
    try {
      sigFamillesData = await safeFetchJSON('/api/signaler/familles');
    } catch (e) {
      console.warn('[Signaler] API indisponible, taxonomie inline utilisée');
      sigFamillesData = SIG_TAXONOMY_INLINE;
    }
  }
  // Peupler les communes
  const sel = document.getElementById('sig-commune');
  if (sel && sel.options.length <= 1) {
    communes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nom + (c.circonscription ? ` (${c.circonscription})` : '');
      sel.appendChild(opt);
    });
  }
  // Photo handler
  const photoInput = document.getElementById('sig-photo');
  if (photoInput && !photoInput._sigBound) {
    photoInput._sigBound = true;
    photoInput.addEventListener('change', function() {
      const nameEl = document.getElementById('sig-photo-name');
      if (this.files && this.files[0]) {
        nameEl.textContent = '📎 ' + this.files[0].name;
        nameEl.classList.remove('hidden');
      }
    });
  }
  // Remplir la grille 16 catégories directement
  sigRenderGrid();
  sigShowStep('choix');
}

function sigRenderGrid() {
  const grid = document.getElementById('sig-familles-grid-direct');
  if (!grid) return;
  const lang = currentLang || 'fr';
  grid.innerHTML = SIG_FAMILLE_ORDER.map(fam => {
    const meta = SIG_FAMILLE_META[fam] || SIG_FAMILLE_META.autre;
    const label = lang === 'ar' ? meta.label_ar : meta.label;
    return '<div class="module-card" onclick="sigShowSousCas(\'' + fam + '\')" style="cursor:pointer;min-width:0;">' +
      '<div class="module-icon" style="background:' + meta.color + '15;">' +
      '<span style="font-size:28px;">' + meta.icon + '</span>' +
      '</div>' +
      '<h3 style="font-size:13px;line-height:1.2;">' + escHtml(label) + '</h3>' +
      '</div>';
  }).join('');
}

function sigShowStep(step) {
  ['choix','souscas','epics','form','confirmation'].forEach(s => {
    const el = document.getElementById('sig-step-' + s);
    if (el) el.classList.toggle('hidden', s !== step);
  });
}

// ═══ PARCOURS RAPIDE SIGNALEMENT ═══
var _sigRapideFamille = null;
var _sigRapideLat = null;
var _sigRapideLng = null;
var _sigRapideDoublon = null;

function sigRapideInit() {
  // Reset
  _sigRapideFamille = null;
  _sigRapideLat = null;
  _sigRapideLng = null;
  _sigRapideDoublon = null;
  document.getElementById('sig-r-step1').style.display = '';
  document.getElementById('sig-r-confirm').style.display = 'none';
  document.getElementById('sig-r-doublon').style.display = 'none';
  document.getElementById('sig-r-description').value = '';
  document.getElementById('sig-r-submit').disabled = true;
  document.getElementById('sig-r-submit').style.background = 'var(--muted)';
  document.getElementById('sig-r-submit').style.cursor = 'not-allowed';
  document.getElementById('sig-r-submit').textContent = 'Choisissez un type de problème';
  sigRapideClearPhoto();
  // Highlight aucune tuile
  document.querySelectorAll('.sig-r-tile').forEach(function(t) { t.style.borderColor = 'var(--line)'; t.style.background = 'white'; });
  // Pré-remplir depuis la houma si définie
  if (currentUser && (currentUser.houma_lat && currentUser.houma_lng)) {
    _sigRapideLat = currentUser.houma_lat;
    _sigRapideLng = currentUser.houma_lng;
    document.getElementById('sig-r-gps-status').textContent = '📍 ' + t('houma.ma_houma') + ' (' + currentUser.houma_lat.toFixed(4) + ', ' + currentUser.houma_lng.toFixed(4) + ')';
    document.getElementById('sig-r-gps-status').style.color = '#2563eb';
  } else {
    document.getElementById('sig-r-gps-status').textContent = '📍 Localisation en cours...';
    document.getElementById('sig-r-gps-status').style.color = 'var(--muted)';
  }
  // GPS auto en arrière-plan (override le pré-remplissage houma par la position réelle)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      _sigRapideLat = pos.coords.latitude;
      _sigRapideLng = pos.coords.longitude;
      document.getElementById('sig-r-gps-status').textContent = '📍 Position capturée (' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) + ')';
      document.getElementById('sig-r-gps-status').style.color = '#16a34a';
    }, function() {
      // Si pas de GPS et pas de houma, afficher le message d'erreur
      if (!_sigRapideLat) {
        document.getElementById('sig-r-gps-status').textContent = '📍 Position non disponible — le signalement sera envoyé sans localisation';
        document.getElementById('sig-r-gps-status').style.color = '#f97316';
      }
    }, { timeout: 10000, enableHighAccuracy: true });
  }
}

function sigRapidePhotoChosen() {
  // Vérifier les deux inputs (caméra et galerie)
  var camInput = document.getElementById('sig-r-photo-cam');
  var galInput = document.getElementById('sig-r-photo');
  var input = (camInput && camInput.files && camInput.files[0]) ? camInput : galInput;
  if (input && input.files && input.files[0]) {
    // Copier le fichier vers l'input principal si c'est la caméra
    if (input === camInput) {
      var dt = new DataTransfer();
      dt.items.add(input.files[0]);
      galInput.files = dt.files;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('sig-r-photo-img').src = e.target.result;
      document.getElementById('sig-r-photo-preview').style.display = '';
      document.getElementById('sig-r-photo-zone').style.display = 'none';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function sigRapideClearPhoto() {
  document.getElementById('sig-r-photo').value = '';
  var camInput = document.getElementById('sig-r-photo-cam');
  if (camInput) camInput.value = '';
  document.getElementById('sig-r-photo-preview').style.display = 'none';
  document.getElementById('sig-r-photo-zone').style.display = '';
}

async function sigRapideSelectFamille(famille) {
  _sigRapideFamille = famille;
  // Highlight la tuile sélectionnée
  document.querySelectorAll('.sig-r-tile').forEach(function(t) { t.style.borderColor = 'var(--line)'; t.style.background = 'white'; });
  event.currentTarget.style.borderColor = '#7C3AED';
  event.currentTarget.style.background = '#F5F3FF';
  // Activer le bouton
  var btn = document.getElementById('sig-r-submit');
  btn.disabled = false;
  btn.style.background = '#7C3AED';
  btn.style.cursor = 'pointer';
  btn.textContent = 'Envoyer le signalement';
  // Détection de doublon
  if (_sigRapideLat && _sigRapideLng) {
    try {
      var res = await apiFetch('/api/signaler/doublons?famille=' + famille + '&lat=' + _sigRapideLat + '&lng=' + _sigRapideLng, { headers: authHeaders() });
      if (res.ok) {
        var data = await res.json();
        if (data.doublon) {
          _sigRapideDoublon = data.doublon;
          document.getElementById('sig-r-doublon-detail').innerHTML =
            '<strong>' + escHtml(data.doublon.reference) + '</strong> — ' + escHtml(data.doublon.categorie || '') +
            '<br>' + escHtml(data.doublon.commune_nom || '') + ' · ' + escHtml(data.doublon.etat);
          document.getElementById('sig-r-doublon').style.display = '';
        }
      }
    } catch(e) { console.warn('[signaler] échec vérification doublons:', e.message); }
  }
}

async function sigRapideSuivreDossier() {
  if (!_sigRapideDoublon) return;
  // Abonner le citoyen aux notifications du dossier existant
  try {
    await apiFetch('/api/signaler/board/' + _sigRapideDoublon.id + '/commentaire', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentaire: 'Un citoyen suit également ce dossier.', type: 'message' })
    });
  } catch(e) { console.warn('[signaler] échec suivi dossier:', e.message); }
  showToast('Vous suivez le dossier ' + _sigRapideDoublon.reference);
  showView('home');
}

async function sigRapideEnvoyer() {
  if (!_sigRapideFamille) return;
  var btn = document.getElementById('sig-r-submit');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  var fd = new FormData();
  fd.append('famille', _sigRapideFamille);
  if (_sigRapideLat) fd.append('lat', _sigRapideLat);
  if (_sigRapideLng) fd.append('lng', _sigRapideLng);
  var desc = document.getElementById('sig-r-description').value.trim();
  if (desc) fd.append('description', desc);
  // Commune auto depuis les coords
  if (_sigRapideLat && communes && communes.length) {
    var userCommune = currentUser ? currentUser.commune_id : null;
    if (userCommune) fd.append('communeId', userCommune);
  }
  var photoFile = document.getElementById('sig-r-photo').files[0];
  if (photoFile) fd.append('photo', photoFile);

  try {
    var res = await apiFetch('/api/signaler/signalements/rapide', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + getToken() }, body: fd
    });
    var data = await res.json();
    if (!res.ok) {
      // Quota KYC : message enrichi
      if (data.code === 'QUOTA_MOIS') {
        var msg = currentLang === 'ar' ? (data.erreur_ar || data.erreur) : data.erreur;
        showToast(msg, 'error', 6000);
      } else if (data.code === 'QUOTA_JOUR') {
        var msg = currentLang === 'ar' ? (data.erreur_ar || data.erreur) : data.erreur;
        showToast(msg, 'error', 4000);
      } else {
        showToast(currentLang === 'ar' ? (data.erreur_ar || data.erreur) : (data.erreur || 'Erreur'), 'error');
      }
      btn.disabled = false; btn.textContent = t('signaler.envoyer') || 'Envoyer le signalement'; return;
    }
    // Confirmation
    document.getElementById('sig-r-step1').style.display = 'none';
    document.getElementById('sig-r-confirm').style.display = '';
    document.getElementById('sig-r-confirm-ref').textContent = 'Référence : ' + (data.signalement?.reference || '—') + '\nNous vous tiendrons informé de l\'avancement.';
    // Capture douce : proposer de définir la houma si pas encore fait et pas refusé
    if (_sigRapideLat && _sigRapideLng && currentUser && !currentUser.quartier_id && !currentUser.houma_lat && !currentUser.houma_refus_capture) {
      _showCaptureDouce(_sigRapideLat, _sigRapideLng);
    }
  } catch(e) {
    showToast(e.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Envoyer le signalement';
  }
}

// ── Capture douce — proposer d'enregistrer la houma après signalement ──
function _showCaptureDouce(lat, lng) {
  var confirmDiv = document.getElementById('sig-r-confirm');
  if (!confirmDiv) return;
  var captureHtml = '<div id="sig-capture-douce" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;margin-top:16px;">' +
    '<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px;" data-i18n="houma.capture_titre">' + t('houma.capture_titre') + '</div>' +
    '<div style="display:flex;gap:8px;">' +
    '<button class="btn btn-sm btn-primary" onclick="captureDouceAccept(' + lat + ',' + lng + ')" style="flex:1;" data-i18n="houma.capture_oui">' + t('houma.capture_oui') + '</button>' +
    '<button class="btn btn-sm btn-outline" onclick="captureDouceRefuse()" style="flex:1;" data-i18n="houma.capture_non">' + t('houma.capture_non') + '</button>' +
    '</div></div>';
  confirmDiv.insertAdjacentHTML('beforeend', captureHtml);
}

async function captureDouceAccept(lat, lng) {
  try {
    await apiFetch('/api/quartiers/houma/capture', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepte: true, lat: lat, lng: lng })
    });
    if (currentUser) { currentUser.houma_lat = lat; currentUser.houma_lng = lng; }
    showToast(t('houma.modifiee'));
  } catch(e) { console.warn('[houma] échec capture douce acceptée:', e.message); }
  var el = document.getElementById('sig-capture-douce');
  if (el) el.remove();
}

async function captureDouceRefuse() {
  try {
    await apiFetch('/api/quartiers/houma/capture', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepte: false })
    });
    if (currentUser) currentUser.houma_refus_capture = true;
  } catch(e) { console.warn('[houma] échec capture douce refusée:', e.message); }
  var el = document.getElementById('sig-capture-douce');
  if (el) el.remove();
}

// Helper : nom localisé (FR ou AR selon la langue)
function locCat(s) { return currentLang === 'ar' && s.categorie_nom_ar ? s.categorie_nom_ar : (s.categorie_nom || s.categorie || '—'); }
function locCommune(s) { return currentLang === 'ar' && s.commune_nom_ar ? s.commune_nom_ar : (s.commune_nom || '—'); }
function locOrg(name) {
  if (currentLang !== 'ar' || !name) return name;
  var map = {
    'Direction Propreté (Centre)':'مديرية النظافة (وسط)', 'Direction Propreté (Périphérie)':'مديرية النظافة (ضواحي)',
    'Direction Eau et Assainissement':'مديرية المياه والتطهير', 'Direction Éclairage Public':'مديرية الإنارة العمومية',
    'Direction Voirie et Trottoirs':'مديرية الطرقات والأرصفة', 'Direction Espaces Verts':'مديرية المساحات الخضراء',
    'Direction Stationnement':'مديرية الحظائر', 'Direction Circulation et Transports':'مديرية المرور والنقل',
    'Tri humain':'فرز يدوي'
  };
  // Chercher une correspondance partielle
  for (var k in map) { if (name.indexOf(k) !== -1) return map[k]; }
  // Chercher via le sigle DIR-
  var sigMap = {
    'DIR-PRO':'مديرية النظافة (وسط)', 'DIR-PRO-P':'مديرية النظافة (ضواحي)', 'DIR-EVT':'مديرية المساحات الخضراء',
    'DIR-ECL':'مديرية الإنارة العمومية', 'DIR-EAU':'مديرية المياه والتطهير', 'DIR-VOR':'مديرية الطرقات',
    'DIR-CIRC':'مديرية المرور والنقل', 'DIR-PARK':'مديرية الحظائر', 'DIR-CET':'مديرية مراكز الردم التقني'
  };
  for (var s in sigMap) { if (name.indexOf(s) !== -1) return sigMap[s]; }
  return name;
}

function locDomaine(d) {
  var fr = {eau:'Eau',proprete:'Propreté',general:'Général',voirie:'Voirie',eclairage:'Éclairage',espaces_verts:'Espaces verts',stationnement:'Stationnement',assainissement:'Assainissement'};
  var ar = {eau:'مياه',proprete:'نظافة',general:'عام',voirie:'طرق',eclairage:'إنارة',espaces_verts:'مساحات خضراء',stationnement:'مواقف',assainissement:'صرف صحي'};
  return (currentLang === 'ar' ? ar[d] : fr[d]) || d || '—';
}

function sigFamilleLabel(famille) {
  var labels = {proprete:'Propreté',eau:'Eau',voirie:'Voirie',eclairage:'Éclairage',espaces_verts:'Espaces verts',securite:'Sécurité',stationnement:'Stationnement',assainissement:'Assainissement',environnement:'Environnement',animaux:'Animaux',nuisances:'Nuisances',mobilier_urbain:'Mobilier urbain',batiments:'Bâtiments',transport:'Transport',accessibilite:'Accessibilité',autre:'Autre'};
  return labels[famille] || famille || '—';
}

function sigBackToChoix() {
  document.getElementById('sig-error').classList.add('hidden');
  document.getElementById('sig-success').classList.add('hidden');
  sigShowStep('choix');
}

// ── PORTE 1 : chemin guidé par familles ──
function sigBackToFamilles() { sigShowStep('choix'); }

function sigShowSousCas(famille) {
  // Fallback taxonomie inline si l'API n'a pas chargé
  if (!sigFamillesData || !Object.keys(sigFamillesData).length) {
    sigFamillesData = SIG_TAXONOMY_INLINE;
  }
  const cats = (sigFamillesData[famille] || []);
  if (!cats.length) {
    sigSelectCategorie(null, famille);
    return;
  }
  const meta = SIG_FAMILLE_META[famille] || SIG_FAMILLE_META.autre;
  const list = document.getElementById('sig-souscas-list');
  // Grouper par groupe — "Autre" toujours en dernier
  const groups = {};
  cats.forEach(c => {
    const g = c.groupe || 'Autre';
    if (!groups[g]) groups[g] = [];
    groups[g].push(c);
  });
  // Trier les groupes : "Autre" en dernier
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
    if (a === 'Autre') return 1;
    if (b === 'Autre') return -1;
    return 0;
  });
  let html = '';
  for (const [grp, items] of sortedGroups) {
    // Trier les items dans chaque groupe : "Autre..." en dernier
    items.sort((a, b) => {
      const aIsAutre = (a.libelle || '').toLowerCase().startsWith('autre');
      const bIsAutre = (b.libelle || '').toLowerCase().startsWith('autre');
      if (aIsAutre && !bIsAutre) return 1;
      if (!aIsAutre && bIsAutre) return -1;
      return 0;
    });
    if (sortedGroups.length > 1) {
      html += `<div style="font-size:12px;font-weight:600;color:${meta.color};text-transform:uppercase;margin:12px 0 6px;letter-spacing:0.5px;">${escHtml(grp)}</div>`;
    }
    html += items.map(c => {
      const isAutre = (c.libelle || '').toLowerCase().startsWith('autre');
      const badge = c.criticite === 'haute' ? '<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#fee2e2;color:#ef4444;margin-left:6px;">urgent</span>' : '';
      return `<div class="card" style="margin-bottom:6px;padding:10px 14px;cursor:pointer;transition:background .15s;${isAutre ? 'border-left:3px solid var(--gray-300);' : ''}"
         onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''"
         onclick="sigSelectCategorie(${c.id}, '${famille}'${isAutre ? ', true' : ''})">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;font-weight:500;">${escHtml(c.libelle)}${badge}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2"><polyline points="${currentLang === 'ar' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}"/></svg>
        </div>
      </div>`;
    }).join('');
  }
  list.innerHTML = html;
  sigShowStep('souscas');
}

// ── PORTE 2 : chemin direct par EPIC ──
async function sigShowEpics() {
  const list = document.getElementById('sig-epics-list');
  list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);">' + t('global.chargement') + '</div>';
  sigShowStep('epics');
  try {
    const res = await fetch('/api/signaler/epics');
    if (!res.ok) {
      console.error('[EPIC] fetch failed:', res.status, res.statusText);
      throw new Error('HTTP ' + res.status);
    }
    const raw = await res.text();
    let epics;
    try { epics = JSON.parse(raw); } catch (pe) {
      console.error('[EPIC] JSON parse error:', pe, 'raw:', raw.substring(0, 200));
      throw new Error('Réponse invalide du serveur');
    }
    if (!Array.isArray(epics) || !epics.length) {
      list.innerHTML = '<p style="color:var(--muted);padding:16px;">' + t('global.aucun') + '</p>';
      return;
    }
    list.innerHTML = epics.map(ep => {
      const sigle = ep.sigle || ep.code || '?';
      const nom = ep.nom || ep.libelle || ep.name || '';
      return `
      <div class="card" style="margin-bottom:8px;padding:14px 16px;cursor:pointer;transition:background .15s;"
           onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''"
           onclick="sigSelectEpic(${ep.id}, '${escHtml(sigle)}')">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:40px;height:40px;border-radius:8px;background:var(--navy-light);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:var(--navy);position:relative;">
            ${escHtml(sigle.substring(0,4))}
            <span style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid white;" title="${t('epic.en_ligne')}"></span>
          </div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:14px;color:var(--navy);">${escHtml(sigle)}</div>
            <div style="font-size:12px;color:var(--muted);line-height:1.3;">${escHtml(nom)}</div>
            ${ep.description ? `<div style="font-size:11px;color:var(--muted);margin-top:2px;">${escHtml(ep.description.substring(0,80))}…</div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    console.error('[EPIC] sigShowEpics error:', e);
    list.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_chargement') + ' <span style="font-size:11px;color:var(--muted);display:block;margin-top:4px;">' + escHtml(e.message) + '</span></p>';
  }
}

function sigSelectEpic(epicId, sigle) {
  // Trouver les catégories liées à cet EPIC
  const allCats = [];
  for (const fam of Object.values(sigFamillesData || {})) {
    for (const c of fam) {
      if (c.epic_id === epicId) allCats.push(c);
    }
  }
  if (allCats.length === 1) {
    sigSelectCategorie(allCats[0].id, allCats[0].famille);
  } else if (allCats.length > 1) {
    // Montrer les sous-cas de cet EPIC
    const list = document.getElementById('sig-souscas-list');
    list.innerHTML = allCats.map(c => `
      <div class="card" style="margin-bottom:8px;padding:12px 16px;cursor:pointer;transition:background .15s;"
           onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''"
           onclick="sigSelectCategorie(${c.id}, '${c.famille}')">
        <span style="font-size:14px;font-weight:500;">${escHtml(c.libelle)}</span>
      </div>
    `).join('');
    sigShowStep('souscas');
  } else {
    // EPIC sans catégories directes (ex: Direction Propreté → propreté)
    // Montrer les catégories propreté
    const propCats = sigFamillesData['proprete'] || [];
    if (propCats.length) {
      const list = document.getElementById('sig-souscas-list');
      list.innerHTML = propCats.map(c => `
        <div class="card" style="margin-bottom:8px;padding:12px 16px;cursor:pointer;transition:background .15s;"
             onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''"
             onclick="sigSelectCategorie(${c.id}, 'proprete')">
          <span style="font-size:14px;font-weight:500;">${escHtml(c.libelle)}</span>
        </div>
      `).join('');
      sigShowStep('souscas');
    }
  }
}

// ── Sélection catégorie → formulaire ──
async function sigSelectCategorie(catId, famille, isAutre) {
  const display = document.getElementById('sig-categorie-display');
  const hidden = document.getElementById('sig-categorie-id');

  if (catId) {
    // Trouver le libellé dans les données
    for (const fam of Object.values(sigFamillesData || {})) {
      const found = fam.find(c => c.id === catId);
      if (found) {
        display.value = found.libelle;
        hidden.value = catId;
        break;
      }
    }
  } else {
    // Famille "autre" sans sous-cas précis
    display.value = t('signaler.fam_' + famille);
    // Trouver la catégorie "Autre" de cette famille
    const cats = sigFamillesData[famille] || [];
    const autreCat = cats.find(c => c.libelle.toLowerCase().startsWith('autre'));
    hidden.value = autreCat ? autreCat.id : '';
    isAutre = true;
  }

  // Si "Autre" est sélectionné, rendre la description obligatoire
  var descEl = document.getElementById('sig-description');
  if (descEl) {
    if (isAutre) {
      descEl.required = true;
      descEl.placeholder = 'Décrivez le problème (obligatoire)';
      descEl.style.border = '2px solid var(--gold)';
      descEl.focus();
    } else {
      descEl.required = false;
      descEl.placeholder = 'Que constatez-vous ? Depuis quand ?';
      descEl.style.border = '';
    }
  }

  // Init mini-map
  if (!sigMapInitialized) {
    setTimeout(() => {
      const mapEl = document.getElementById('sig-minimap');
      if (mapEl && !sigMap) {
        sigMap = L.map('sig-minimap').setView([36.7538, 3.0588], 11);
        createTileLayer(sigMap);
        sigMap.on('click', async function(e) {
          const lat = e.latlng.lat.toFixed(6);
          const lng = e.latlng.lng.toFixed(6);
          document.getElementById('sig-lat').value = lat;
          document.getElementById('sig-lng').value = lng;
          const coordsEl = document.getElementById('sig-coords');
          coordsEl.textContent = t('geo.position_selectionnee') + ' ' + lat + ', ' + lng;
          coordsEl.classList.remove('hidden');
          if (sigMarker) sigMap.removeLayer(sigMarker);
          sigMarker = L.marker([lat, lng]).addTo(sigMap);
          const adresseEl = document.getElementById('sig-adresse-geo');
          if (adresseEl) {
            adresseEl.textContent = t('geo.geocodage');
            const adresse = await reverseGeocode(lat, lng);
            adresseEl.textContent = adresse ? '📍 ' + adresse : '';
          }
          // Auto-détecter la commune la plus proche
          autoDetectCommune(parseFloat(lat), parseFloat(lng));
          // Chercher les signalements proches
          checkProches(lat, lng);
        });
        sigMapInitialized = true;
      }
    }, 200);
  } else if (sigMap) {
    setTimeout(() => sigMap.invalidateSize(), 200);
  }

  document.getElementById('sig-error').classList.add('hidden');
  document.getElementById('sig-success').classList.add('hidden');
  sigShowStep('form');
  applyTranslations();
}

async function checkProches(lat, lng) {
  const panel = document.getElementById('sig-proches');
  try {
    const proches = await safeFetchJSON(`/api/signaler/proches?lat=${lat}&lng=${lng}`);
    if (!proches.length) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');
    panel.innerHTML = `
      <div style="padding:10px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
        <div style="font-weight:600;font-size:13px;color:#1d4ed8;margin-bottom:6px;">
          ${proches.length} ${t('signaler.proches_titre')}
        </div>
        ${proches.map(p => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:12px;border-bottom:1px solid #e0e7ff;">
            <span>${escHtml(p.categorie)} — ${escHtml((p.description||'').substring(0,50))}${p.nb_confirmations?` (+${p.nb_confirmations})`:''}</span>
            <button type="button" class="btn btn-sm btn-outline" onclick="confirmerProche('${p.id}')" style="font-size:10px;padding:2px 6px;">
              ${t('signaler.proches_confirmer')}
            </button>
          </div>
        `).join('')}
        <div style="font-size:11px;color:var(--muted);margin-top:6px;">${t('signaler.proches_hint')}</div>
      </div>`;
  } catch(e) { panel.classList.add('hidden'); }
}

async function confirmerProche(id) {
  try {
    const res = await apiFetch('/api/signaler/' + id + '/confirmer', {
      method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const d = await res.json();
      showToast(t('signaler.proches_confirme') + ' (+' + d.nb_confirmations + ')');
      // Recharger les proches
      const lat = document.getElementById('sig-lat').value;
      const lng = document.getElementById('sig-lng').value;
      if (lat && lng) checkProches(lat, lng);
    }
  } catch(e) { showToast(t('global.erreur_reseau'), 'error'); }
}

function selectGravite(el, value) {
  document.querySelectorAll('.gravite-option').forEach(o => {
    o.style.borderColor = 'var(--gray-200)';
    o.style.background = '';
  });
  el.style.borderColor = value === 'danger_immediat' ? '#ef4444' : value === 'risque_blessure' ? '#f59e0b' : 'var(--navy)';
  el.style.background = value === 'danger_immediat' ? '#fef2f2' : value === 'risque_blessure' ? '#fffbeb' : 'var(--navy-light)';
  el.querySelector('input').checked = true;
}

// ── Soumission du formulaire unifié ──
async function handleUnifiedSignalement(e) {
  e.preventDefault();
  const errId = 'sig-error';
  const sucId = 'sig-success';
  hideError(errId);
  document.getElementById(sucId).classList.add('hidden');

  const categorieId = document.getElementById('sig-categorie-id').value;
  if (!categorieId) { showError(errId, t('signaler.erreur_categorie')); return; }

  const communeId   = document.getElementById('sig-commune').value;
  const description = document.getElementById('sig-description').value.trim();
  const lat         = document.getElementById('sig-lat').value;
  const lng         = document.getElementById('sig-lng').value;
  const photoInput  = document.getElementById('sig-photo');

  setLoading('sig-submit-btn', 'sig-submit-text', 'sig-submit-spinner', true);

  try {
    const fd = new FormData();
    fd.append('categorieId', categorieId);
    if (communeId) fd.append('communeId', communeId);
    if (description) fd.append('description', description);
    if (lat) fd.append('lat', lat);
    if (lng) fd.append('lng', lng);
    if (photoInput.files && photoInput.files[0]) fd.append('photo', photoInput.files[0]);
    const graviteRadio = document.querySelector('input[name="sig-gravite"]:checked');
    if (graviteRadio) fd.append('gravite', graviteRadio.value);

    const res = await apiFetch('/api/signaler/signalements', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: fd
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || data.erreur || t('sig.erreur_envoi'));

    const ref = data.signalement?.reference || 'N/A';

    // Sauvegarder dans localStorage pour "Mes signalements"
    try {
      const commune = communes.find(c => String(c.id) === String(communeId));
      const mesSignals = JSON.parse(localStorage.getItem('civismart_mes_signalements') || '[]');
      mesSignals.unshift({
        id: data.signalement?.id || Date.now(),
        reference: ref,
        domaine: data.signalement?.domaine || 'general',
        categorie: document.getElementById('sig-categorie-display').value,
        commune: commune ? commune.nom : '',
        description: description,
        etat: 'recu',
        cree_le: new Date().toISOString(),
        lat: lat || null, lng: lng || null
      });
      localStorage.setItem('civismart_mes_signalements', JSON.stringify(mesSignals));
    } catch(_) { console.warn('[signaler] échec sauvegarde locale signalement:', _.message); }

    // Afficher l'écran de confirmation (remplace le formulaire)
    sigShowStep('confirmation');
    document.getElementById('sig-conf-ref').textContent = '#' + ref;
    const ptsEl = document.getElementById('sig-conf-points');
    if (ptsEl && data.pointsGagnes) ptsEl.textContent = '+' + data.pointsGagnes + ' ' + t('sent.points_accumules');
    // Afficher info email/SMS
    const emailEl = document.getElementById('sig-conf-email');
    const smsEl = document.getElementById('sig-conf-sms');
    if (emailEl && currentUser?.email) emailEl.textContent = t('signaler.conf_email') + ' ' + currentUser.email;
    if (smsEl && currentUser?.telephone) smsEl.textContent = t('signaler.conf_sms') + ' ' + currentUser.telephone;

    // Reset le formulaire en arrière-plan
    document.getElementById('sig-form').reset();
    document.getElementById('sig-lat').value = '';
    document.getElementById('sig-lng').value = '';
    document.getElementById('sig-coords').classList.add('hidden');
    document.getElementById('sig-photo-name').classList.add('hidden');
    document.getElementById('sig-adresse-geo').textContent = '';
  } catch (err) {
    showError(errId, err.message);
  } finally {
    setLoading('sig-submit-btn', 'sig-submit-text', 'sig-submit-spinner', false);
  }
}

// ─── CARTE MAP ───────────────────────────────────────────────
// ── Configuration tuiles centralisée ──────────────────────────
// Principal = CARTO (gratuit, sans clé, pas de Referer requis, CDN mondial).
// Fallback = OSM standard (requiert Referer valide — peut être strippé par
// certains reverse proxies comme OpenLiteSpeed).
// Montée en charge : remplacer TILE_URL par un fournisseur avec clé
// (MapTiler gratuit 100k/mois, Stadia, Thunderforest) sans refactor.
// Fournisseurs de tuiles avec cascade de fallback
// Fournisseurs de tuiles testés et fonctionnels (sans clé API)
// Stadia retiré : requiert une API key depuis 2023 (401 Unauthorized)
const TILE_PROVIDERS = [
  { name: 'OSM-FR', url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    opts: { attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> France', maxZoom: 19, subdomains: 'abc' }},
  { name: 'CARTO-Voyager', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    opts: { attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © CARTO', maxZoom: 19, subdomains: 'abcd' }},
  { name: 'OSM', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    opts: { attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>', maxZoom: 19 }},
];

/**
 * Crée une couche de tuiles avec cascade de fallback automatique.
 * CARTO → Stadia → OSM. Chaque échec bascule vers le suivant.
 */
function createTileLayer(map) {
  let idx = 0;
  function tryProvider(i) {
    if (i >= TILE_PROVIDERS.length) { console.error('[carte] Aucun fournisseur de tuiles disponible'); return; }
    const p = TILE_PROVIDERS[i];
    const layer = L.tileLayer(p.url, p.opts);
    let switched = false;
    layer.on('tileerror', function() {
      if (switched) return;
      switched = true;
      console.warn('[carte]', p.name, 'indisponible — bascule vers', TILE_PROVIDERS[i+1]?.name || 'aucun');
      map.removeLayer(layer);
      tryProvider(i + 1);
    });
    layer.addTo(map);
  }
  tryProvider(0);
}

let carteMap = null;
let carteMarkers = [];
let carteAllSignals = [];
let carteInitialized = false;
let carteActiveFilter = 'tous';

var _houmaDefineMode = false;
var _houmaPickedLat = null;
var _houmaPickedLng = null;
var _houmaPickMarker = null;

async function initCarte() {
  if (!carteInitialized) {
    carteMap = L.map('carte-map').setView([36.7538, 3.0588], 11);
    createTileLayer(carteMap);
    carteInitialized = true;
    // Click handler pour définir houma
    carteMap.on('click', function(e) {
      if (!_houmaDefineMode) return;
      _houmaPickedLat = e.latlng.lat;
      _houmaPickedLng = e.latlng.lng;
      if (_houmaPickMarker) carteMap.removeLayer(_houmaPickMarker);
      _houmaPickMarker = L.marker([_houmaPickedLat, _houmaPickedLng]).addTo(carteMap);
    });
  }

  setTimeout(() => { if (carteMap) carteMap.invalidateSize(); }, 200);

  // Centrage prioritaire : quartier_id → houma_lat/lng → vue wilaya
  if (currentUser && (currentUser.fonction === 'citoyen' || currentUser.role === 'citoyen' || !currentUser.fonction)) {
    try {
      var houma = await safeFetchJSON('/api/quartiers/houma', {}, true);
      _houmaData = houma;
      if (houma && houma.quartier_id && houma.perimetre) {
        // Centre sur le périmètre du quartier
        try {
          var bounds = L.geoJSON(houma.perimetre).getBounds();
          carteMap.fitBounds(bounds);
        } catch(e) {
          if (houma.houma_lat && houma.houma_lng) carteMap.setView([houma.houma_lat, houma.houma_lng], 14);
        }
        _houmaScope = 'houma';
        _updateHoumaBanner(houma);
      } else if (houma && houma.houma_lat && houma.houma_lng) {
        carteMap.setView([houma.houma_lat, houma.houma_lng], 14);
        _houmaScope = 'houma';
        _updateHoumaBanner(houma);
      } else {
        _houmaScope = 'wilaya';
        _updateHoumaBanner(null);
      }
    } catch(e) { _houmaData = null; _houmaScope = 'wilaya'; _updateHoumaBanner(null); }
    _houmaUpdateScopeBar();
  }

  await loadCarteSignals();
  await loadCarteBiens();
  loadQuartierDashboard();
}

function _updateHoumaBanner(houma) {
  var banner = document.getElementById('houma-banner');
  var btn = document.getElementById('houma-definir-btn');
  var txt = document.getElementById('houma-banner-text');
  if (!banner) return;
  if (!currentUser || (currentUser.fonction && currentUser.fonction !== 'citoyen')) { banner.style.display = 'none'; return; }
  banner.style.display = '';
  if (houma && (houma.quartier_id || houma.houma_lat)) {
    var nom = houma.quartier_nom ? (currentLang === 'ar' && houma.quartier_nom_ar ? houma.quartier_nom_ar : houma.quartier_nom) : '';
    txt.textContent = t('houma.ma_houma') + (nom ? ' : ' + nom : '');
    btn.textContent = currentLang === 'ar' ? 'تغيير' : 'Modifier';
  } else {
    txt.textContent = '';
    btn.textContent = t('houma.definir');
  }
}

function houmaStartDefine() {
  _houmaDefineMode = true;
  _houmaPickedLat = null;
  _houmaPickedLng = null;
  document.getElementById('houma-banner').style.display = 'none';
  document.getElementById('houma-confirm').style.display = '';
}

function houmaCancelDefine() {
  _houmaDefineMode = false;
  if (_houmaPickMarker && carteMap) carteMap.removeLayer(_houmaPickMarker);
  _houmaPickMarker = null;
  document.getElementById('houma-confirm').style.display = 'none';
  document.getElementById('houma-banner').style.display = '';
}

async function houmaConfirmChoice() {
  if (!_houmaPickedLat || !_houmaPickedLng) {
    showToast(t('houma.definir_desc'), 'error');
    return;
  }
  _houmaDefineMode = false;
  try {
    var res = await apiFetch('/api/quartiers/houma', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: _houmaPickedLat, lng: _houmaPickedLng })
    });
    var data = await res.json();
    if (!res.ok) { showToast(data.erreur || 'Erreur', 'error'); return; }
    showToast(t('houma.modifiee'));
    if (currentUser) {
      currentUser.quartier_id = data.quartier_id;
      currentUser.houma_lat = data.houma_lat;
      currentUser.houma_lng = data.houma_lng;
    }
    if (_houmaPickMarker && carteMap) carteMap.removeLayer(_houmaPickMarker);
    _houmaPickMarker = null;
    document.getElementById('houma-confirm').style.display = 'none';
    // Refresh banner
    var houma = await safeFetchJSON('/api/quartiers/houma', {}, true);
    _updateHoumaBanner(houma);
  } catch(e) { showToast(e.message, 'error'); }
}

// ── Houma scope state ──
var _houmaScope = 'wilaya'; // 'houma' | 'wilaya'
var _houmaData = null; // cached houma response

function _houmaHasLocation() {
  return _houmaData && (_houmaData.houma_lat && _houmaData.houma_lng);
}

function _houmaScopeLabel() {
  if (_houmaScope === 'houma' && _houmaData) {
    if (_houmaData.quartier_nom) {
      var nom = (currentLang === 'ar' && _houmaData.quartier_nom_ar) ? _houmaData.quartier_nom_ar : _houmaData.quartier_nom;
      return t('houma.scope_quartier').replace('{nom}', nom);
    }
    return t('houma.scope_rayon');
  }
  return t('houma.scope_wilaya');
}

function _houmaUpdateScopeBar() {
  var bar = document.getElementById('houma-scope-bar');
  var label = document.getElementById('houma-scope-label');
  var toggle = document.getElementById('houma-scope-toggle');
  var invite = document.getElementById('houma-invite');
  if (!bar) return;

  var isCitoyen = currentUser && (!currentUser.fonction || currentUser.fonction === 'citoyen');
  if (!isCitoyen) { bar.style.display = 'none'; if (invite) invite.style.display = 'none'; return; }

  if (_houmaHasLocation()) {
    bar.style.display = '';
    label.textContent = _houmaScopeLabel();
    toggle.textContent = _houmaScope === 'houma' ? t('houma.voir_wilaya') : t('houma.voir_houma');
    if (invite) invite.style.display = 'none';
  } else {
    bar.style.display = '';
    label.textContent = _houmaScopeLabel();
    toggle.style.display = 'none';
    // Show invitation once per session
    if (invite && !sessionStorage.getItem('houma_invite_shown')) {
      invite.style.display = '';
      sessionStorage.setItem('houma_invite_shown', '1');
    }
  }
}

function houmaToggleScope() {
  _houmaScope = _houmaScope === 'houma' ? 'wilaya' : 'houma';
  _houmaUpdateScopeBar();
  loadQuartierDashboard();
  renderCarteMarkers(carteActiveFilter);
}

async function loadQuartierDashboard() {
  const el = document.getElementById('quartier-dashboard');
  if (!el) return;
  const communeId = currentUser?.commune_id;
  if (!communeId) { el.innerHTML = ''; return; }

  // Build query params based on scope
  var qs = '';
  if (_houmaScope === 'houma' && _houmaHasLocation()) {
    qs = 'houma_lat=' + _houmaData.houma_lat + '&houma_lng=' + _houmaData.houma_lng;
  } else {
    qs = 'communeId=' + communeId;
  }

  try {
    const d = await safeFetchJSON('/api/dashboard/quartier?' + qs);
    const items = [];
    if (d.ouverts !== undefined) items.push({ label: t('quartier.ouverts'), value: d.ouverts, color: '#ef4444' });
    if (d.resolus_ce_mois !== undefined) items.push({ label: t('quartier.resolus_mois'), value: d.resolus_ce_mois, color: '#16a34a' });
    if (d.pct_resolus !== null) items.push({ label: t('quartier.pct_resolus'), value: d.pct_resolus + '%', color: '#2563eb' });
    if (d.delai_moyen_heures) items.push({ label: t('quartier.delai_moyen'), value: d.delai_moyen_heures + 'h', color: '#f59e0b' });
    if (!items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(i =>
      `<div style="flex:1;min-width:80px;padding:8px 10px;background:${i.color}10;border-radius:8px;text-align:center;">
        <div style="font-size:18px;font-weight:800;color:${i.color};">${i.value}</div>
        <div style="font-size:10px;color:var(--muted);">${i.label}</div>
      </div>`).join('');
  } catch(e) { el.innerHTML = ''; }
}

async function loadCarteBiens() {
  if (!canManagePatrimoine()) return;
  try {
    const res = await apiFetch('/api/patrimoine/biens', {headers: authHeaders()});
    if (!res.ok) return;
    const biens = await res.json();
    biens.filter(b => b.lat && b.lng).forEach(b => {
      const color = {'libre':'#1FA463','loue':'#E1A730','affecte':'#1C7293','occupe_sans_titre':'#EF4444','en_travaux':'#f97316','contentieux':'#EF4444'}[b.statut] || '#9ca3af';
      const icon = L.divIcon({className:'', html:`<div style="width:18px;height:18px;background:${color};border:2px solid white;border-radius:3px;transform:rotate(45deg);box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>`, iconSize:[18,18], iconAnchor:[9,9]});
      const m = L.marker([parseFloat(b.lat), parseFloat(b.lng)], {icon}).addTo(carteMap);
      m.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:13px;"><strong>${b.reference}</strong><br>${b.adresse}<br><span style="color:${color};font-weight:600;">${b.statut}</span>${b.contrat_actif ? '<br>Occ: '+b.contrat_actif.occupant_nom : ''}</div>`);
      carteMarkers.push(m);
    });
  } catch(e) { console.warn('[carte] échec chargement biens patrimoine carte:', e.message); }
}

async function loadCarteSignals() {
  carteAllSignals = [];

  if (isAgent()) {
    // Load from API for agents/admins
    try {
      const [resP, resE] = await Promise.all([
        apiFetch('/api/proprete/signalements', { headers: authHeaders() }),
        apiFetch('/api/eau/signalements', { headers: authHeaders() })
      ]);
      if (resP.ok) {
        const d = await resP.json();
        const list = Array.isArray(d) ? d : (d.signalements || d.data || []);
        list.forEach(s => { s._domaine = 'proprete'; carteAllSignals.push(s); });
      }
      if (resE.ok) {
        const d = await resE.json();
        const list = Array.isArray(d) ? d : (d.signalements || d.data || []);
        list.forEach(s => { s._domaine = 'eau'; carteAllSignals.push(s); });
      }
    } catch (e) { console.warn('carte api error', e); }
  } else {
    // Citizens: load from public carte endpoint
    try {
      const communeId = currentUser?.commune_id;
      const qs = communeId ? '?communeId=' + communeId : '';
      const [resP, resE] = await Promise.all([
        apiFetch('/api/proprete/signalements/carte' + qs, { headers: authHeaders() }).catch(() => null),
        apiFetch('/api/eau/signalements/carte' + qs, { headers: authHeaders() }).catch(() => null)
      ]);
      if (resP && resP.ok) {
        const list = await resP.json();
        (Array.isArray(list) ? list : []).forEach(s => { s._domaine = s.domaine || 'proprete'; carteAllSignals.push(s); });
      }
      if (resE && resE.ok) {
        const list = await resE.json();
        (Array.isArray(list) ? list : []).forEach(s => { s._domaine = s.domaine || 'eau'; carteAllSignals.push(s); });
      }
    } catch(e) { console.warn('[carte citoyen]', e.message); }
    // Also include localStorage signals
    const saved = JSON.parse(localStorage.getItem(MES_SIG_KEY) || '[]');
    saved.forEach(s => {
      if (!carteAllSignals.find(x => x.id === s.id)) {
        carteAllSignals.push({
          id: s.id, reference: s.reference, categorie: s.categorie,
          etat: s.etat, commune: s.commune, created_at: s.cree_le,
          lat: s.lat, lng: s.lng, _domaine: s.domaine
        });
      }
    });
  }

  renderCarteMarkers(carteActiveFilter);
}

function etatMarkerColor(etat) {
  const map = {
    recu: '#9ca3af',
    transmis: '#2563eb',
    en_intervention: '#f97316',
    resolu: '#16a34a',
    rejete: '#EF4444'
  };
  return map[etat] || '#9ca3af';
}

function createMarkerIcon(color, domaine) {
  const isEau = domaine === 'eau';
  if (isEau) {
    // Diamond shape for eau
    return L.divIcon({
      html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;transform:rotate(45deg);box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  } else {
    // Circle for proprete
    return L.divIcon({
      html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }
}

function renderCarteMarkers(filter) {
  carteActiveFilter = filter;
  // Clear existing markers
  carteMarkers.forEach(m => carteMap.removeLayer(m));
  carteMarkers = [];

  let filtered = carteAllSignals.filter(s => s.lat && s.lng);

  // Houma scope: filter by 2km radius around houma point
  if (_houmaScope === 'houma' && _houmaHasLocation()) {
    var hLat = _houmaData.houma_lat, hLng = _houmaData.houma_lng;
    var RAYON = 0.018; // ~2 km
    filtered = filtered.filter(function(s) {
      return Math.abs(parseFloat(s.lat) - hLat) < RAYON && Math.abs(parseFloat(s.lng) - hLng) < RAYON;
    });
  }

  var famFilters = ['proprete','eau','voirie','eclairage','espaces_verts','stationnement','securite','nuisances','mobilier_urbain','animaux','accessibilite','environnement','transport','batiments'];
  if (famFilters.includes(filter)) {
    filtered = filtered.filter(s => s._domaine === filter || s.famille === filter || (s.categorie_famille || '') === filter);
  } else if (filter === 'en_cours') {
    filtered = filtered.filter(s => ['recu','transmis','en_intervention'].includes(s.etat || s.statut));
  } else if (filter === 'resolus') {
    filtered = filtered.filter(s => (s.etat || s.statut) === 'resolu');
  }

  filtered.forEach(s => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    const etat = s.etat || s.statut || 'recu';
    const color = etatMarkerColor(etat);
    const icon = createMarkerIcon(color, s._domaine);
    const marker = L.marker([lat, lng], { icon }).addTo(carteMap);

    const popupContent = `
      <div style="font-family:Inter,sans-serif;font-size:13px;min-width:160px;">
        <strong>${escHtml(arF(s.categorie_nom_ar, s.categorie_nom) || s.categorie || '—')}</strong><br>
        <span style="font-size:11px;color:#6b7280;">${s._domaine === 'eau' ? '💧 ' + t('dash.eau') : '🌿 ' + t('dash.proprete')}</span>
        <div style="margin:6px 0;">
          <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${color}22;color:${color}">${etatLabel(etat)}</span>
        </div>
        <div style="color:#6b7280;">📍 ${escHtml(s.commune || s.commune_nom || '—')}</div>
        <div style="color:#9ca3af;font-size:11px;">${fmtDate(s.created_at || s.createdAt || s.cree_le)}</div>
        ${s.reference ? `<div style="color:#9ca3af;font-size:11px;">Réf: ${escHtml(s.reference)}</div>` : ''}
      </div>`;
    marker.bindPopup(popupContent);
    carteMarkers.push(marker);
  });
}

function filterCarte(filter, btn) {
  document.querySelectorAll('.carte-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCarteMarkers(filter);
}

function centerOnUser() {
  if (!navigator.geolocation) { alert(t('geo.non_supporte')); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      if (carteMap) carteMap.setView([pos.coords.latitude, pos.coords.longitude], 14);
    },
    () => alert(t('geo.impossible'))
  );
}

// ─── MINI-MAP PICKERS ────────────────────────────────────
let csMap = null;
let wsMap = null;
let csMapInitialized = false;
let wsMapInitialized = false;
let csMarker = null;
let wsMarker = null;

async function reverseGeocode(lat, lng) {
  try {
    const lang = currentLang === 'ar' ? 'ar' : 'fr';
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${lang}`,
      { headers: { 'User-Agent': 'CiviSmart/1.0 (civismart.pylcom.app)' } }
    );
    const d = await r.json();
    return d.display_name || null;
  } catch { return null; }
}

async function initMiniMap(prefix) {
  const mapId = prefix + '-minimap';
  const mapEl = document.getElementById(mapId);
  if (!mapEl) return;

  const mapVar = prefix === 'cs' ? 'csMap' : 'wsMap';
  const initVar = prefix === 'cs' ? 'csMapInitialized' : 'wsMapInitialized';

  if (prefix === 'cs' && csMapInitialized) { setTimeout(() => csMap && csMap.invalidateSize(), 100); return; }
  if (prefix === 'ws' && wsMapInitialized) { setTimeout(() => wsMap && wsMap.invalidateSize(), 100); return; }

  const map = L.map(mapId).setView([36.7538, 3.0588], 11);
  createTileLayer(map);

  let marker = null;

  map.on('click', async function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    document.getElementById(prefix + '-lat').value = lat;
    document.getElementById(prefix + '-lng').value = lng;
    const coordsEl = document.getElementById(prefix + '-coords');
    coordsEl.textContent = t('geo.position_selectionnee') + ' ' + lat + ', ' + lng;
    coordsEl.classList.remove('hidden');

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    if (prefix === 'cs') csMarker = marker;
    else wsMarker = marker;

    const adresseEl = document.getElementById(prefix + '-adresse-geo');
    if (adresseEl) {
      adresseEl.textContent = t('geo.geocodage');
      const adresse = await reverseGeocode(lat, lng);
      adresseEl.textContent = adresse ? '📍 ' + adresse : '';
    }
  });

  if (prefix === 'cs') { csMap = map; csMapInitialized = true; }
  else { wsMap = map; wsMapInitialized = true; }
}

function centerMiniMap(prefix) {
  if (!navigator.geolocation) { alert(t('geo.non_supporte')); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const map = prefix === 'cs' ? csMap : prefix === 'ws' ? wsMap : prefix === 'sig' ? sigMap : null;
      if (map) {
        map.setView([lat, lng], 15);
        document.getElementById(prefix + '-lat').value = lat.toFixed(6);
        document.getElementById(prefix + '-lng').value = lng.toFixed(6);
        const coordsEl = document.getElementById(prefix + '-coords');
        coordsEl.textContent = t('geo.position_gps') + ' ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
        coordsEl.classList.remove('hidden');
        const existingMarker = prefix === 'cs' ? csMarker : prefix === 'ws' ? wsMarker : prefix === 'sig' ? sigMarker : null;
        if (existingMarker) map.removeLayer(existingMarker);
        const newMarker = L.marker([lat, lng]).addTo(map);
        if (prefix === 'cs') csMarker = newMarker;
        else if (prefix === 'ws') wsMarker = newMarker;
        else if (prefix === 'sig') sigMarker = newMarker;
        // Auto-détecter la commune pour le signalement unifié
        if (prefix === 'sig') autoDetectCommune(lat, lng);
      }
    },
    () => alert(t('geo.impossible'))
  );
}

// Trouver la commune la plus proche d'un point GPS et pré-remplir le select
function autoDetectCommune(lat, lng) {
  if (!communes || !communes.length) return;
  let best = null, bestDist = Infinity;
  for (const c of communes) {
    if (!c.centre_lat || !c.centre_lng) continue;
    const d = Math.pow(lat - c.centre_lat, 2) + Math.pow(lng - c.centre_lng, 2);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  if (best) {
    const sel = document.getElementById('sig-commune');
    if (sel) { sel.value = best.id; }
    const autoLabel = document.getElementById('sig-commune-auto');
    if (autoLabel) { autoLabel.textContent = '📍 ' + best.nom; autoLabel.classList.remove('hidden'); }
  }
}

// ─── POPULATE AGENT COMMUNE FILTERS ──────────────────────
function populateAgentFilters() {
  const filterSelects = ['cs-filter-commune', 'ws-filter-commune'];
  filterSelects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">' + t('global.toutes_communes') + '</option>';
    communes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nom;
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  });
}

// ─── BOOTSTRAP ────────────────────────────────────────────
(function bootstrap() {
  initI18n();
  if (checkResetToken()) return; // Reset page takes priority — stop bootstrap
  const token = getToken();
  const savedUser = localStorage.getItem(USER_KEY);
  if (token && savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      // Verify token in background
      fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => {
          if (r.status === 401) { handleLogout(); return; }
          return r.json();
        })
        .then(u => { if (u) { currentUser = u; localStorage.setItem(USER_KEY, JSON.stringify(u)); } })
        .catch(e => console.warn('[auth] échec vérification token:', e.message));
      initApp();
    } catch (e) {
      handleLogout();
    }
  } else {
    document.getElementById('auth-page').style.display = 'flex';
    // Pre-load communes for register form
    fetch('/api/referentiel/communes')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        communes = data;
        populateCommuneSelects();
      })
      .catch(e => console.warn('[auth] échec chargement communes inscription:', e.message));
  }
})();

// ═══════════════════════════════════════════════════
// GESTION ADMIN CRÉNEAUX RDV
// ═══════════════════════════════════════════════════
async function initRdvAdminPanel() {
  const panel = document.getElementById('rdv-admin-panel');
  if (!panel) return;
  if (!isSuperAdmin()) { panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');

  // Remplir communes
  const commSel = document.getElementById('admin-rdv-commune');
  const filterComm = document.getElementById('admin-filter-commune');
  if (commSel && commSel.options.length <= 1) {
    (communes || []).forEach(c => {
      [commSel, filterComm].forEach(sel => {
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.nom;
        sel.appendChild(o);
      });
    });
  }

  // Remplir services (B uniquement)
  const svcSel = document.getElementById('admin-rdv-service');
  const filterSvc = document.getElementById('admin-filter-service');
  if (svcSel && svcSel.options.length <= 1) {
    try {
      const r = await apiFetch('/api/rdv/services');
      const svcs = await r.json();
      svcs.filter(s => s.famille === 'B').forEach(s => {
        [svcSel, filterSvc].forEach(sel => {
          const o = document.createElement('option');
          o.value = s.id; o.textContent = s.nom + ' (' + s.duree_min + 'min)';
          sel.appendChild(o);
        });
      });
    } catch(e) { console.warn('[rdv] échec chargement services:', e.message); }
  }

  // Date par défaut = demain 09:00
  const debut = document.getElementById('admin-rdv-debut');
  if (debut && !debut.value) {
    const tom = new Date(); tom.setDate(tom.getDate()+1); tom.setHours(9,0,0,0);
    debut.value = tom.toISOString().slice(0,16);
  }

  adminLoadCreneaux();
}

async function adminLoadCreneaux() {
  const list = document.getElementById('admin-creneaux-list');
  if (!list) return;
  list.innerHTML = '<div class="loading-overlay"><div class="spinner spinner-dark"></div><span>' + t('global.chargement') + '</span></div>';
  const communeId = document.getElementById('admin-filter-commune').value;
  const serviceId = document.getElementById('admin-filter-service').value;
  let url = '/api/rdv/admin/creneaux?';
  if (communeId) url += 'communeId=' + communeId + '&';
  if (serviceId) url += 'serviceId=' + serviceId + '&';
  try {
    const r = await apiFetch(url, { headers: authHeaders() });
    const rows = await r.json();
    if (!rows.length) {
      list.innerHTML = '<p style="color:var(--gray-400);text-align:center;padding:20px;">' + t('rdv_admin.aucun_creneau') + '</p>';
      return;
    }
    list.innerHTML = rows.map(c => {
      const d = new Date(c.debut);
      const locale = currentLang === 'ar' ? 'ar-DZ' : 'fr-DZ';
      const dateStr = d.toLocaleDateString(locale,{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
      const timeStr = d.toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'});
      const res = Number(c.reserves) || 0;
      const dispo = Number(c.capacite) - res;
      return '<div class="creneau-row">' +
        '<div class="creneau-info">' +
          '<div class="cr-service">' + c.service + '</div>' +
          '<div class="cr-meta">📍 ' + c.commune + ' &nbsp;|&nbsp; 📅 ' + dateStr + ' — ' + timeStr + '</div>' +
        '</div>' +
        '<div class="creneau-badges">' +
          '<span class="badge-cap">' + t('rdv_admin.cap') + ' ' + c.capacite + '</span>' +
          (res > 0 ? '<span class="badge-res">' + res + ' ' + (res>1?t('rdv_admin.reserves'):t('rdv_admin.reserve')) + '</span>' : '') +
          '<span style="font-size:12px;color:' + (dispo>0?'var(--success)':'var(--red)') + ';">' + dispo + ' ' + t('rdv_admin.dispo') + '</span>' +
        '</div>' +
        '<button class="btn-delete" onclick="adminSupprimerCreneau(' + c.id + ', this)">' + t('global.supprimer') + '</button>' +
      '</div>';
    }).join('');
  } catch(e) {
    list.innerHTML = '<p style="color:var(--red);padding:16px;">' + t('global.erreur_chargement') + '</p>';
  }
}

async function adminCreerCreneaux() {
  const communeId = parseInt(document.getElementById('admin-rdv-commune').value);
  const serviceId = parseInt(document.getElementById('admin-rdv-service').value);
  const debut = document.getElementById('admin-rdv-debut').value;
  const capacite = parseInt(document.getElementById('admin-rdv-capacite').value) || 10;
  const repetitions = parseInt(document.getElementById('admin-rdv-repetitions').value) || 1;
  const errEl = document.getElementById('rdv-admin-error');
  const sucEl = document.getElementById('rdv-admin-success');
  const btn = document.getElementById('admin-rdv-btn');
  const btnTxt = document.getElementById('admin-rdv-btn-text');
  const btnSpin = document.getElementById('admin-rdv-btn-spinner');

  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  if (!communeId || !serviceId || !debut) {
    errEl.textContent = t('rdv_admin.obligatoire_msg');
    errEl.classList.remove('hidden'); return;
  }

  btn.disabled = true; btnTxt.textContent = t('rdv_admin.creation_en_cours'); btnSpin.classList.remove('hidden');

  try {
    const r = await apiFetch('/api/rdv/admin/creneaux', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ communeId, serviceId, debut: new Date(debut).toISOString(), capacite, repetitions })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.erreur || t('global.erreur'));
    sucEl.textContent = data.created + ' ' + t('rdv_admin.succes');
    sucEl.classList.remove('hidden');
    adminLoadCreneaux();
  } catch(e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false; btnTxt.textContent = t('rdv_admin.btn_creer'); btnSpin.classList.add('hidden');
  }
}

async function adminSupprimerCreneau(id, btn) {
  if (!confirm(t('rdv_admin.supprimer_confirm'))) return;
  btn.disabled = true; btn.textContent = '...';
  try {
    const r = await apiFetch('/api/rdv/admin/creneaux/' + id, {
      method: 'DELETE', headers: authHeaders()
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.erreur || t('global.erreur'));
    adminLoadCreneaux();
  } catch(e) {
    alert(e.message);
    btn.disabled = false; btn.textContent = t('global.supprimer');
  }
}

let deferredInstallPrompt=null,swRegistration=null;
const APP_CACHE_VERSION = 'v21';
(function purgeStaleSW() {
  const stored = localStorage.getItem('civismart_sw_ver');
  if (stored && stored !== APP_CACHE_VERSION && 'serviceWorker' in navigator) {
    console.log('[SW] Version mismatch', stored, '→', APP_CACHE_VERSION, '— purging caches');
    caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))));
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    // Init Google OAuth
    if (document.readyState === 'complete') { initGoogleAuth(); } else { window.addEventListener('load', initGoogleAuth); }
    localStorage.setItem('civismart_sw_ver', APP_CACHE_VERSION);
    location.reload();
    return;
  }
  localStorage.setItem('civismart_sw_ver', APP_CACHE_VERSION);
})();
if("serviceWorker"in navigator){window.addEventListener("load",async()=>{try{swRegistration=await navigator.serviceWorker.register("/sw.js");swRegistration.addEventListener("updatefound",()=>{const nw=swRegistration.installing;nw.addEventListener("statechange",()=>{if(nw.state==="installed"&&navigator.serviceWorker.controller){var ap=document.getElementById('auth-page');if(ap&&ap.style.display!=='none'){nw.postMessage({type:'SKIP_WAITING'});navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());}else{document.getElementById("pwa-update-toast").classList.remove("hidden");}}});});}catch(e){console.warn("SW failed:",e);}});}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;if(!localStorage.getItem("pwa_dismissed")&&!window.matchMedia("(display-mode:standalone)").matches)setTimeout(()=>document.getElementById("pwa-banner").classList.remove("hidden"),3000);});
if(window.matchMedia("(display-mode:standalone)").matches)document.getElementById("pwa-banner").classList.add("hidden");
function pwaInstall(){if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();deferredInstallPrompt.userChoice.then(r=>{if(r.outcome==="accepted")document.getElementById("pwa-banner").classList.add("hidden");deferredInstallPrompt=null;});}
function pwaDismiss(){document.getElementById("pwa-banner").classList.add("hidden");localStorage.setItem("pwa_dismissed","1");}
function pwaUpdate(){document.getElementById("pwa-update-toast").classList.add("hidden");if(swRegistration&&swRegistration.waiting)swRegistration.waiting.postMessage({type:"SKIP_WAITING"});navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload());}
window.addEventListener("appinstalled",()=>{document.getElementById("pwa-banner").classList.add("hidden");deferredInstallPrompt=null;});

// ══════════════════════════════════════════════════════════
// PATRILOCAL — Patrimoine Immobilier
// ══════════════════════════════════════════════════════════
function getStatutPatriLabels() { return {
  libre: t('patri.statut_libre'), loue: t('patri.statut_loue'), affecte: t('patri.statut_affecte'),
  occupe_sans_titre: t('patri.statut_occupe_sans_titre'), en_travaux: t('patri.statut_en_travaux'), contentieux: t('patri.statut_contentieux')
}; }
function getTypePatriLabels() { return {
  local_commercial: t('patri.type_local_commercial'), logement: t('patri.type_logement'), bureau: t('patri.type_bureau'),
  equipement: t('patri.type_equipement'), terrain: t('patri.type_terrain'), immeuble: t('patri.type_immeuble')
}; }
const STATUT_PATRI_COLOR = {
  libre: 'var(--green)', loue: 'var(--gold)', affecte: 'var(--blue)',
  occupe_sans_titre: 'var(--red)', en_travaux: 'var(--orange)', contentieux: 'var(--red)'
};

async function initPatrimoine() {
  await loadPatriDashboard();
  await loadBiens();
  populatePatriCommunes();
}

async function loadPatriDashboard() {
  try {
    const res = await apiFetch('/api/patrimoine/dashboard', { headers: authHeaders() });
    if (!res.ok) return;
    const d = await res.json();
    document.getElementById('patri-total').textContent = d.total;
    document.getElementById('patri-libres').textContent = d.libres;
    document.getElementById('patri-taux').textContent = d.taux_occupation + '%';
    document.getElementById('patri-loyers').textContent = Number(d.loyers_mois).toLocaleString('fr-DZ');
    document.getElementById('patri-alertes').textContent = d.contrats_expirant;
  } catch (e) { console.warn('patri dashboard error', e); }
}

async function loadBiens() {
  const el = document.getElementById('patri-list');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + t('global.chargement') + '</div>';
  const statut = document.getElementById('patri-filter-statut')?.value || '';
  const communeId = document.getElementById('patri-filter-commune')?.value || '';
  const type = document.getElementById('patri-filter-type')?.value || '';
  const params = new URLSearchParams();
  if (statut) params.set('statut', statut);
  if (communeId) params.set('communeId', communeId);
  if (type) params.set('type', type);
  try {
    const SL = getStatutPatriLabels();
    const TL = getTypePatriLabels();
    const res = await apiFetch('/api/patrimoine/biens?' + params.toString(), { headers: authHeaders() });
    if (!res.ok) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red);">' + t('global.erreur_chargement') + '</div>'; return; }
    const biens = await res.json();
    if (!biens.length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + t('patri.aucun_bien') + '</div>';
      return;
    }
    el.innerHTML = biens.map(b => `
      <div class="card" style="margin-bottom:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-weight:700;color:var(--navy);font-size:13px;">${b.reference}</span>
              <span style="font-size:11px;padding:2px 8px;border-radius:20px;font-weight:600;background:${STATUT_PATRI_COLOR[b.statut]}22;color:${STATUT_PATRI_COLOR[b.statut]};">${SL[b.statut] || b.statut}</span>
            </div>
            <div style="font-size:13px;color:var(--gray-700);margin-bottom:2px;">${TL[b.type] || b.type} · ${b.adresse}</div>
            <div style="font-size:12px;color:var(--muted);">${b.commune_nom || '—'} ${b.surface_m2 ? '· ' + b.surface_m2 + ' m²' : ''}</div>
            ${b.contrat_actif ? `<div style="font-size:12px;margin-top:6px;color:var(--navy);"><strong>${t('patri.occupant')}</strong> ${b.contrat_actif.occupant_nom} ${b.contrat_actif.loyer_mensuel > 0 ? '· ' + Number(b.contrat_actif.loyer_mensuel).toLocaleString('fr-DZ') + ' DA/mois' : t('patri.gratuit')}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            ${canManagePatrimoine() ? `
              <select onchange="changerStatutBien(${b.id},this.value,this)" style="padding:5px 8px;font-size:12px;border:1px solid var(--line);border-radius:var(--radius-sm);background:white;">
                <option value="">${t('patri.changer_statut')}</option>
                <option value="libre">${t('patri.statut_libre')}</option>
                <option value="loue">${t('patri.statut_loue')}</option>
                <option value="affecte">${t('patri.statut_affecte')}</option>
                <option value="occupe_sans_titre">${t('patri.statut_occupe_sans_titre')}</option>
                <option value="en_travaux">${t('patri.statut_en_travaux')}</option>
                <option value="contentieux">${t('patri.statut_contentieux')}</option>
              </select>
              <button onclick="showContratModal(${b.id},'${b.reference} — ${b.adresse.substring(0,30)}')" style="padding:6px 12px;font-size:12px;font-weight:600;background:var(--gold-light);color:var(--gold);border:1px solid var(--gold);border-radius:var(--radius-sm);cursor:pointer;">${t('patri.contrat_btn')}</button>
              ${b.contrat_actif ? `<button onclick="showPaiementModal(${b.contrat_actif.id},'${b.reference}')" style="padding:6px 12px;font-size:12px;font-weight:600;background:var(--green-light);color:var(--green);border:1px solid var(--green);border-radius:var(--radius-sm);cursor:pointer;">${t('patri.loyer_btn')}</button>` : ""}
            ` : ""}
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red);">' + t('global.erreur_reseau') + '</div>'; }
}

function populatePatriCommunes() {
  const sel1 = document.getElementById('patri-filter-commune');
  const sel2 = document.getElementById('patri-form-commune');
  if (!communes.length) return;
  const opts = communes.map(c => `<option value="${c.id}">${c.nom}</option>`).join('');
  if (sel1 && sel1.options.length <= 1) sel1.insertAdjacentHTML('beforeend', opts);
  if (sel2 && sel2.options.length <= 1) sel2.insertAdjacentHTML('beforeend', opts);
}

async function populatePatriGestionnaires() {
  const sel = document.getElementById('patri-form-gestionnaire');
  if (!sel || sel.options.length > 1) return;
  try {
    const res = await fetch('/api/referentiel/epics');
    const epics = await res.json();
    const cats = {
      'environnement_nettoiement': 'Environnement & Nettoiement',
      'voirie_eclairage_urbanisme': 'Voirie & Urbanisme',
      'logement_infrastructure': 'Logement & Infrastructure',
      'eau_energie': 'Eau & Énergie',
      'services_transports': 'Services & Transports',
      'social_artisanat': 'Social & Artisanat',
      'culture_medias_tourisme': 'Culture & Médias',
    };
    let lastCat = '';
    epics.forEach(e => {
      if (e.categorie !== lastCat) {
        const og = document.createElement('optgroup');
        og.label = cats[e.categorie] || e.categorie;
        sel.appendChild(og);
        lastCat = e.categorie;
      }
      const opt = document.createElement('option');
      opt.value = e.sigle + ' — ' + e.nom;
      opt.textContent = e.sigle + ' — ' + e.nom.substring(0, 45) + (e.nom.length > 45 ? '…' : '');
      sel.appendChild(opt);
    });
  } catch(e) { console.warn('EPICs load error', e); }
}

function showPatriForm() {
  populatePatriCommunes();
  populatePatriGestionnaires();
  document.getElementById('patri-bien-form').reset();
  document.getElementById('patri-form-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closePatriForm() {
  document.getElementById('patri-form-modal').style.display = 'none';
  document.body.style.overflow = '';
}

async function submitBien(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    type: fd.get('type'),
    adresse: fd.get('adresse'),
    commune_id: fd.get('commune_id') ? Number(fd.get('commune_id')) : null,
    surface_m2: fd.get('surface_m2') ? Number(fd.get('surface_m2')) : null,
    etat_physique: fd.get('etat_physique'),
    proprietaire: fd.get('proprietaire') || "Wilaya d'Alger",
    notes: fd.get('notes') || null,
  };
  try {
    const res = await apiFetch('/api/patrimoine/biens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
      body: JSON.stringify(body)
    });
    let data = {};
    try { data = await res.json(); } catch(_) { console.warn('[patri] échec parse réponse JSON bien:', _.message); }
    if (!res.ok) { alert(t('global.erreur_avec_details', null, { details: data.erreur || t('global.statut_code', null, { code: res.status }) })); return; }
    closePatriForm();
    showToast(data.reference + ' ' + t('toast.bien_cree'));
    await loadBiens();
    await loadPatriDashboard();
  } catch (err) { alert(t('global.erreur_reseau_details', null, { details: err.message })); }
}

function showContratModal(bienId, label) {
  document.getElementById('contrat-bien-id').value = bienId;
  document.getElementById('patri-contrat-bien-info').textContent = label;
  document.getElementById('patri-contrat-form').reset();
  document.getElementById('contrat-bien-id').value = bienId;
  document.getElementById('patri-contrat-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closeContratModal() {
  document.getElementById('patri-contrat-modal').style.display = 'none';
  document.body.style.overflow = '';
}

async function submitContrat(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const bienId = fd.get('bien_id');
  const body = {
    occupant_nom: fd.get('occupant_nom'),
    occupant_tel: fd.get('occupant_tel') || null,
    occupant_nin: fd.get('occupant_nin') || null,
    type_contrat: fd.get('type_contrat'),
    date_debut: fd.get('date_debut'),
    date_fin: fd.get('date_fin') || null,
    loyer_mensuel: Number(fd.get('loyer_mensuel') || 0),
    caution: Number(fd.get('caution') || 0),
    notes: fd.get('notes') || null,
  };
  try {
    const res = await apiFetch('/api/patrimoine/biens/' + bienId + '/contrats', {
      method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { alert(t('global.erreur_avec_details', null, { details: data.erreur || t('global.inconnue') })); return; }
    closeContratModal();
    showToast(t('toast.contrat_enregistre') + ' ' + body.occupant_nom + '.');
    await loadBiens();
    await loadPatriDashboard();
  } catch (e) { alert(t('global.erreur_reseau')); }
}

// ── PATRILOCAL : changer statut ─────────────────────────
async function changerStatutBien(id, statut, sel) {
  if (!statut) return;
  try {
    const res = await apiFetch('/api/patrimoine/biens/' + id + '/statut', {
      method: 'PATCH',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
      body: JSON.stringify({statut: statut})
    });
    if (res.ok) { const SL2 = getStatutPatriLabels(); showToast(t('toast.statut_maj') + ' ' + (SL2[statut] || statut)); await loadBiens(); await loadPatriDashboard(); }
    else { const d = await res.json(); showToast(d.erreur || t('global.erreur_chargement'),'error'); sel.value=''; }
  } catch(e) { showToast(t('global.erreur_reseau'),'error'); sel.value=''; }
}

// ── PATRILOCAL : alertes contrats expirant ───────────────
async function loadAlertesContrats() {
  const panel = document.getElementById('patri-alertes-panel');
  const el = document.getElementById('patri-alertes-list');
  if (!panel || !el) return;
  panel.style.display = 'block';
  try {
    const res = await apiFetch('/api/patrimoine/contrats/expirant?jours=30', {headers: authHeaders()});
    if (!res.ok) { el.innerHTML = t('global.erreur_chargement'); return; }
    const data = await res.json();
    if (!data.length) { el.innerHTML = t('patri.aucun_expirant'); return; }
    const locale = currentLang === 'ar' ? 'ar-DZ' : 'fr-DZ';
    el.innerHTML = data.map(c => `<div style="padding:4px 0;border-bottom:1px solid #F59E0B33;">
      <strong>${c.reference || '—'}</strong> · ${c.occupant_nom}
      <span style="float:right;font-weight:700;">${c.jours_restants} ${t('patri.jours_restants')}</span>
      <div style="font-size:11px;">${c.adresse || ''} — ${t('patri.expire_le')} ${c.date_fin ? new Date(c.date_fin).toLocaleDateString(locale) : '—'}</div>
    </div>`).join('');
  } catch(e) { el.innerHTML = t('global.erreur_reseau'); }
}

// ── PATRILOCAL : paiement loyer ─────────────────────────
function showPaiementModal(contratId, label) {
  document.getElementById('paiement-contrat-id').value = contratId;
  document.getElementById('patri-paiement-info').textContent = t('paiement.loyer_pour') + ' ' + label;
  document.getElementById('patri-paiement-form').reset();
  document.getElementById('paiement-contrat-id').value = contratId;
  // Pré-remplir mois courant
  var now = new Date();
  var mois = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  document.querySelector('#patri-paiement-form [name=mois]').value = mois;
  document.getElementById('patri-paiement-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closePaiementModal() {
  document.getElementById('patri-paiement-modal').style.display = 'none';
  document.body.style.overflow = '';
}
async function submitPaiement(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    mois: fd.get('mois'),
    montant: Number(fd.get('montant')),
    paye_le: fd.get('paye_le') || null,
    mode_paiement: fd.get('mode_paiement') || null,
    reference_virement: fd.get('reference_virement') || null,
  };
  const contratId = fd.get('contrat_id');
  try {
    const res = await apiFetch('/api/patrimoine/contrats/' + contratId + '/paiements', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
      body: JSON.stringify(body)
    });
    let data = {};
    try { data = await res.json(); } catch(_) { console.warn('[patri] échec parse réponse JSON paiement:', _.message); }
    if (!res.ok) { showToast(data.erreur || t('global.erreur'),'error'); return; }
    closePaiementModal();
    showToast(Number(body.montant).toLocaleString(currentLang === 'ar' ? 'ar-DZ' : 'fr-DZ') + ' ' + t('toast.paiement_enregistre'));
    await loadBiens();
  } catch(err) { showToast(t('global.erreur_reseau_details', null, { details: err.message }),'error'); }
}

function showToast(msg,type){type=type||"success";var colors={success:'#063B5A',error:'#EF4444',warning:'#F59E0B',info:'#2563eb'};var el=document.createElement("div");el.textContent=msg;el.style.cssText="position:fixed;top:76px;right:24px;background:"+(colors[type]||colors.success)+";color:white;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.1);max-width:360px;animation:fadeIn .2s ease;";document.body.appendChild(el);setTimeout(function(){el.style.opacity='0';el.style.transition='opacity .2s';setTimeout(function(){el.remove();},200);},3000);}

// ─── OPERATEUR ────────────────────────────────────────────
async function initOperateur() {
  const el = document.getElementById('operateur-list');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + t('global.chargement') + '</div>';
  try {
    const res = await apiFetch('/api/proprete/signalements', {headers: authHeaders()});
    const proprete = (res.ok ? await res.json() : {data:[]});
    const propreteList = Array.isArray(proprete) ? proprete : (proprete.data || []);
    const res2 = await apiFetch('/api/eau/signalements', {headers: authHeaders()});
    const eau = (res2.ok ? await res2.json() : {data:[]});
    const eauList = Array.isArray(eau) ? eau : (eau.data || []);
    const tous = [...propreteList.map(s=>({...s,domaine:'proprete'})), ...eauList.map(s=>({...s,domaine:'eau'}))].sort((a,b) => new Date(b.cree_le) - new Date(a.cree_le));
    if (!tous.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">' + t('op.aucun') + '</div>'; return; }
    el.innerHTML = tous.map(s => `
      <div class="card" style="margin-bottom:10px;padding:14px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <span style="font-weight:700;font-size:13px;color:var(--navy);">${escHtml(s.reference)}</span>
            <span style="margin-left:8px;font-size:11px;padding:2px 8px;border-radius:20px;background:var(--gray-100);color:var(--gray-600);">${escHtml(s.domaine === 'proprete' ? t('dash.proprete') : t('dash.eau'))}</span>
            <div style="font-size:12px;color:var(--muted);margin-top:3px;">${escHtml(s.description || '—')}</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${s.etat !== 'resolu' && s.etat !== 'rejete' ? `
              <select onchange="changerEtatOperateur('${s.domaine}',${JSON.stringify(s.id)},this.value)" style="padding:5px 8px;font-size:12px;border:1px solid var(--line);border-radius:var(--radius-sm);">
                <option value="">${t('op.changer_etat')}</option>
                <option value="transmis">${t('etat.transmis')}</option>
                <option value="en_intervention">${t('etat.en_intervention')}</option>
                <option value="resolu">${t('etat.resolu')}</option>
              </select>` : `<span style="font-size:12px;color:var(--green);font-weight:600;">✓ ${etatLabel(s.etat)}</span>`}
          </div>
        </div>
      </div>
    `).join('');
  } catch(e) { el.innerHTML = '<div style="color:var(--red);padding:20px;">' + t('global.erreur_reseau') + '</div>'; }
}

async function changerEtatOperateur(domaine, id, etat) {
  if (!etat) return;
  const res = await apiFetch(`/api/${domaine}/signalements/${id}/etat`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json', ...authHeaders()},
    body: JSON.stringify({etat})
  });
  if (res.ok) { showToast(t('toast.etat_maj')); initOperateur(); }
  else { showToast(t('toast.erreur_maj'),'error'); }
}

// ═══════════════════════════════════════════════════════════
// SAKSINI v2 — 48 Q&R, 640+ keywords, matching strict + filtrage génériques
// ═══════════════════════════════════════════════════════════
const SAKSINI_FAQ = [
  {k:['signaler','signalement','probleme','declarer','alerter','reporter','denoncer','prevenir'],fr:"Cliquez sur « Je signale » dans le menu. Choisissez la famille (eau, déchets, voirie…), placez le point sur la carte, ajoutez une photo et envoyez.",ar:"اضغط على « أبلّغ » في القائمة. اختر العائلة (مياه، نفايات، طرق…)، ضع النقطة على الخريطة، أضف صورة وأرسل."},
  {k:['rdv','rendez-vous','rendezvous','reservation','reserver','creneau','horaire','disponibilite','agenda','planning'],fr:"Allez dans « Mes démarches », sélectionnez commune + service, choisissez un jour puis un créneau horaire.",ar:"اذهب إلى « إجراءاتي »، اختر البلدية + الخدمة، اختر يوما ثم فترة زمنية."},
  {k:['suivi','suivre','etat','statut','avancement','resolution','traitement','traite','resolu','progression'],fr:"Consultez « Je suis » pour voir l'état de vos signalements et RDV. Vous recevrez un email à chaque changement d'état.",ar:"راجع « أتابع » لمعرفة حالة بلاغاتك ومواعيدك. ستتلقى بريدا إلكترونيا عند كل تغيير."},
  {k:['points','impact','niveau','badge','recompense','citoyennete','merite','score','progres','contribution'],fr:"Chaque signalement rapporte des points. La validation après résolution rapporte +20. Consultez « Mon impact » pour voir votre niveau et vos badges.",ar:"كل بلاغ يمنحك نقاطا. التحقق بعد الحل يمنح +20. راجع « تأثيري » لمعرفة مستواك وشاراتك."},
  {k:['carte','quartier','houma','voisinage','proximite','autour','pres','zone','secteur','cartographie'],fr:"« Ma Houma » affiche la carte des signalements, les zones de stationnement, les équipements publics et les créneaux de collecte de votre quartier.",ar:"« حومتي » تعرض خريطة البلاغات، مناطق الركن، التجهيزات العمومية ومواعيد الجمع في حيك."},
  {k:['inscription','inscrire','compte','creer','register','enregistrer','nouveau','rejoindre'],fr:"Cliquez sur « Inscription » sur la page de connexion. Remplissez prénom, nom, email, téléphone, commune et mot de passe.",ar:"اضغط على « تسجيل » في صفحة الدخول. املأ الاسم، البريد، الهاتف، البلدية وكلمة المرور."},
  {k:['connexion','connecter','login','identifiant','mot de passe','mdp','oublie','reinitialiser','acces'],fr:"Entrez votre numéro de téléphone et mot de passe. Si vous l'avez oublié, contactez support@algerna.dz.",ar:"أدخل رقم هاتفك وكلمة المرور. إذا نسيتها، تواصل مع support@algerna.dz."},
  {k:['eau','fuite','coupure','pression','robinet','compteur','canalisation','tuyau','plomberie'],fr:"Pour un problème d'eau (fuite, coupure, pression), utilisez « Je signale » → famille Eau. Le signalement est transmis au gestionnaire de l'eau.",ar:"لمشكلة مياه (تسرب، انقطاع، ضغط)، استخدم « أبلّغ » → عائلة المياه. يُحال البلاغ إلى مسيّر المياه."},
  {k:['dechet','poubelle','benne','depot','ordure','ramassage','collecte','recyclage','encombrant','tri','horaire','creneau','نفايات','حاويات','قمامة','جمع','فرز','ضخمة'],get fr(){ return t('saksini.poubelles'); },get ar(){ return t('saksini.poubelles'); }},
  {k:['voirie','route','trottoir','nid de poule','chaussee','goudron','bitume','asphalte','trou','fissure','revêtement'],fr:"Problème de voirie ? « Je signale » → Voirie. Transmis à la Direction Circulation et Transports.",ar:"مشكلة طرق؟ « أبلّغ » → الطرق. يُحال إلى مديرية الدورة المرورية والنقل الحضري."},
  {k:['eclairage','lampadaire','lumiere','ampoule','nuit','sombre','electrique','panne'],fr:"Lampadaire en panne ? « Je signale » → Éclairage. Transmis à la Direction Éclairage Public.",ar:"عمود إنارة معطل؟ « أبلّغ » → الإنارة. يُحال إلى مديرية الإنارة العمومية."},
  {k:['espace vert','arbre','parc','jardin','pelouse','herbe','vegetation','plante','branche','taille'],fr:"Arbre dangereux ou parc dégradé ? « Je signale » → Espaces verts. Transmis à la Direction Espaces Verts.",ar:"شجرة خطيرة أو حديقة متدهورة؟ « أبلّغ » → المساحات الخضراء. يُحال إلى مديرية المساحات الخضراء."},
  {k:['stationnement','parking','genant','place','vehicule','gare','stationner','voiture','double file'],fr:"Stationnement gênant ? « Je signale » → Stationnement. Géré par l'EPIC Parkings.",ar:"ركن مزعج؟ « أبلّغ » → المواقف. يديره EPIC المواقف."},
  {k:['epic','operateur','etablissement','public','direction'],fr:"Les EPIC sont les établissements publics de la Wilaya d'Alger (Direction Propreté, Direction Voirie, Direction Éclairage, Direction Espaces Verts, Direction Eau, EPIC Parkings). Votre signalement est automatiquement routé vers le bon EPIC.",ar:"الـ EPIC هي المؤسسات العمومية لولاية الجزائر. يُوجَّه بلاغك تلقائيا نحو الـ EPIC المناسب."},
  {k:['permis','construire','urbanisme','foncier','livret','terrain','construction','batir','cu','conformite'],fr:"Pour le permis de construire ou le livret foncier, allez dans « Mes démarches » → Urbanisme. Délai réel : 2 à 12 mois.",ar:"لرخصة البناء أو الدفتر العقاري، اذهب إلى « إجراءاتي » → اختر إجراء التعمير. الأجل الفعلي: 2 إلى 12 شهرا."},
  {k:['aadl','logement','recours','social','appartement','hlm','attribution','liste','attente'],fr:"Suivi AADL ou recours logement social : « Mes démarches » → Logement. Apportez votre récépissé de dépôt.",ar:"متابعة AADL أو طعن سكن اجتماعي: « إجراءاتي » → السكن. أحضر وصل الإيداع."},
  {k:['certificat','bonne vie','moeurs','residence','attestation','document','papier','administratif'],fr:"Certificats communaux (bonne vie, résidence…) : « Mes démarches » → Certificats. Délai : immédiat à 48h.",ar:"الشهادات البلدية (حسن السيرة، الإقامة…): « إجراءاتي » → الشهادات. الأجل: فوري إلى 48 ساعة."},
  {k:['biometrique','enrolement','cni','passeport','empreinte','identite','carte nationale','voyage','visa'],fr:"Enrôlement biométrique (CNI ou passeport) : « Mes démarches » → Biométrique. Munissez-vous de l'extrait S12 et des photos.",ar:"التسجيل البيومتري (بطاقة أو جواز): « إجراءاتي » → البيومتري. أحضر مستخرج S12 والصور."},
  {k:['prioritaire','handicap','enceinte','age','pmr','mobilite','fauteuil','senior','accessibilite'],fr:"Lors de la réservation d'un créneau, vous pouvez déclarer un accès prioritaire (personne âgée, handicap, femme enceinte).",ar:"عند حجز فترة زمنية، يمكنك التصريح بأولوية الوصول (شخص مسن، إعاقة، امرأة حامل)."},
  {k:['evaluer','evaluation','satisfaction','noter','avis','retour','feedback','qualite','appreciation'],fr:"Après un RDV traité, un bouton « Évaluer » apparaît dans vos RDV. Notez de 1 à 5 — votre avis alimente l'ICUA.",ar:"بعد موعد مُعالَج، يظهر زر « تقييم » في مواعيدك. قيّم من 1 إلى 5 — رأيك يغذي مؤشر ICUA."},
  {k:['icua','indice','qualite','ville','indicateur','mesure','performance','gouvernance'],fr:"L'ICUA est l'Indice de Citoyenneté Urbaine Active. Il mesure la qualité de vie : propreté, réactivité, espaces verts, fluidité, engagement.",ar:"ICUA هو مؤشر المواطنة الحضرية النشطة. يقيس جودة الحياة: نظافة، استجابة، مساحات خضراء، سيولة، مشاركة."},
  {k:['iqep','espaces publics','note','parc','qualite parc','evaluation parc','score parc','vert'],get fr(){ return t('edeval.chatbot'); },get ar(){ return t('edeval.chatbot'); }},
  {k:['famille a','dematerialise','portail','national','en ligne','internet','numerique','digital'],fr:"Les démarches Famille A (extrait de naissance, résidence…) sont dématérialisées. ALGERNA vous redirige vers le portail national.",ar:"الإجراءات فئة أ (مستخرج ميلاد، إقامة…) مُرقمنة. ALGERNA يوجهك نحو البوابة الوطنية."},
  {k:['famille b','presentiel','physique','guichet','bureau','sur place'],fr:"Les démarches Famille B nécessitent une présence physique. Réservez un créneau via « Mes démarches ».",ar:"الإجراءات فئة ب تتطلب حضورا شخصيا. احجز فترة زمنية عبر « إجراءاتي »."},
  {k:['photo','preuve','image','piece jointe','camera','appareil','capture','prise'],fr:"Ajoutez une photo à votre signalement — elle aide les agents à identifier et prioriser le problème. +5 points bonus.",ar:"أضف صورة لبلاغك — تساعد الأعوان في تحديد المشكلة وترتيب الأولويات. +5 نقاط إضافية."},
  {k:['danger','urgence','grave','immediat','blessure','securite','risque','menace','accident'],fr:"Si le problème est dangereux, sélectionnez « Danger immédiat » dans le formulaire. Il sera traité en priorité.",ar:"إذا كانت المشكلة خطيرة، اختر « خطر فوري » في الاستمارة. سيُعالَج بأولوية."},
  {k:['doublon','meme','deja signale','confirmer','proche','similaire','existant','repeter'],fr:"Si un signalement existe déjà à proximité, un bandeau vous propose de confirmer (« Même problème ») au lieu de créer un doublon.",ar:"إذا وُجد بلاغ قريب، يقترح عليك شريط التأكيد (« نفس المشكلة ») بدل إنشاء نسخة."},
  {k:['notification','email','sms','alerte','mail','courriel','message','prevenir','informer'],fr:"Vous recevez un email à la création et à la résolution de votre signalement. Les SMS arrivent bientôt.",ar:"تتلقى بريدا عند إنشاء وحل بلاغك. الرسائل القصيرة قادمة قريبا."},
  {k:['classement','quartier','commune','rang','palmares','top','meilleur','comparaison','competition'],fr:"Le classement est par quartier (commune), jamais par individu. Votre commune gagne des points collectifs.",ar:"التصنيف حسب الحي (البلدية)، وليس حسب الأفراد. بلديتك تكسب نقاطا جماعية."},
  {k:['badge','premier','sentinelle','ambassadeur','protecteur','distinction','trophee','medaille','recompense'],fr:"5 badges : Premier signalement, 10 résolus, Sentinelle quartier, Protecteur des parcs, Ambassadeur de l'eau. Attribués automatiquement.",ar:"5 شارات: أول بلاغ، 10 محلولة، حارس الحي، حامي الحدائق، سفير المياه. تُمنح تلقائيا."},
  {k:['niveau','contributeur','referent','progression','evolution','monter','avancer','palier','grade'],fr:"5 niveaux : Citoyen → Contributeur → Sentinelle → Ambassadeur → Référent de quartier. Basés sur les points ET la pertinence.",ar:"5 مستويات: مواطن → مساهم → حارس → سفير → مرجع الحي. بناءً على النقاط والفعالية."},
  {k:['avantage','diplome','medaille','inauguration','ceremonie','honneur','distinction','officiel'],fr:"Les niveaux débloquent des avantages symboliques : diplôme citoyen, invitation inauguration, médaille, rencontre institutionnelle.",ar:"المستويات تفتح مزايا رمزية: شهادة مواطنة، دعوة تدشين، ميدالية، لقاء مؤسساتي."},
  {k:['algerna','application','plateforme','appli','site','web','outil','c est quoi','presentation','a propos'],fr:"ALGERNA est la plateforme citoyenne de la Wilaya d'Alger. Elle permet de signaler des problèmes, prendre des RDV, et suivre l'amélioration de votre quartier.",ar:"ALGERNA هي المنصة المواطنية لولاية الجزائر. تتيح الإبلاغ عن المشاكل، حجز المواعيد، ومتابعة تحسين حيك."},
  {k:['securite','donnees','confidentialite','vie privee','rgpd','protection','personnel','prive'],fr:"Vos données sont stockées sur des serveurs sécurisés. Aucun score individuel n'est publié. Votre profil est personnel.",ar:"بياناتك مخزنة على خوادم آمنة. لا يُنشر أي تقييم فردي. ملفك شخصي."},
  {k:['langue','arabe','francais','rtl','traduction','bilingue','changer langue'],fr:"Cliquez sur FR/AR en haut pour changer de langue. L'interface s'adapte automatiquement (RTL pour l'arabe).",ar:"اضغط على FR/AR في الأعلى لتغيير اللغة. الواجهة تتكيف تلقائيا."},
  {k:['hors ligne','offline','connexion','reseau','internet','wifi','deconnecte','pas de reseau'],fr:"ALGERNA fonctionne partiellement hors ligne grâce au mode PWA. Les données se synchronisent au retour du réseau.",ar:"ALGERNA يعمل جزئيا بدون إنترنت بفضل وضع PWA. البيانات تتزامن عند عودة الشبكة."},
  {k:['installer','pwa','application','mobile','telephone','ecran accueil','raccourci','icone'],fr:"Sur mobile, cliquez « Installer » dans la bannière pour ajouter ALGERNA à votre écran d'accueil comme une application.",ar:"على الهاتف، اضغط « تثبيت » في الشريط لإضافة ALGERNA إلى شاشتك الرئيسية كتطبيق."},
  {k:['contact','support','aide','probleme technique','bug','erreur','assistance','service client','reclamation'],fr:"Pour l'aide technique : support@algerna.dz. Pour les urgences : contactez votre APC directement.",ar:"للمساعدة التقنية: support@algerna.dz. للطوارئ: تواصل مع بلديتك مباشرة."},
  {k:['wali','wilaya','gouverneur','prefet','autorite','administration','institution','responsable'],fr:"ALGERNA est une plateforme de la Wilaya d'Alger. Pour contacter les services de la Wilaya, utilisez « Mes démarches » ou écrivez à support@algerna.dz.",ar:"ALGERNA هي منصة ولاية الجزائر. للتواصل مع مصالح الولاية، استخدم « إجراءاتي » أو اكتب إلى support@algerna.dz."},
  {k:['apc','mairie','commune','maire','elu','president','assemblee','populaire','communale'],fr:"L'APC (Assemblée Populaire Communale) gère votre commune. Prenez un RDV via « Mes démarches » pour vos démarches en mairie.",ar:"المجلس الشعبي البلدي يدير بلديتك. احجز موعدا عبر « إجراءاتي » لإجراءاتك في البلدية."},
  {k:['saksini','chatbot','robot','assistant','aide automatique','bot','question'],fr:"Je suis Saksini, l'assistant ALGERNA. Posez-moi vos questions sur les signalements, les démarches, les points ou l'application.",ar:"أنا سقسيني، مساعد ALGERNA. اطرح عليّ أسئلتك حول البلاغات، الإجراءات، النقاط أو التطبيق."},
  // ── Groupe 1 : Transports / horaires ──
  {k:['metro','tramway','tram','bus','etusa','train','sntf','telepherique','telecabine','transport','horaire transport','مواقيت','ميترو','ترامواي','حافلة','قطار','تلفريك','نقل','مواعيد النقل','كيفاش نروح','واش كاين ترانسبور'],fr:"Consultez « Se déplacer » pour les horaires et liens officiels : Métro, Tramway (appli eTWASSEL), Train SNTF, Bus ETUSA et téléphériques.",ar:"راجعوا « التنقل » للمواقيت والروابط الرسمية: المترو، الترامواي (تطبيق eTWASSEL)، قطار SNTF، حافلات ETUSA والتلفريك."},
  // ── Groupe 2 : Problème de transport ──
  {k:['abribus','station sale','escalator','escalier mecanique','arret','gare routiere','quai','محطة','محطة وسخة','سلم كهربائي','عطل سلم','موقف','موقف محطم'],fr:"Problème de transport (abribus cassé, station sale, escalator en panne) ? « Je signale » → Transport. Transmis à l'opérateur concerné.",ar:"مشكلة نقل (محطة مكسورة، محطة وسخة، سلم كهربائي معطل)؟ « أبلّغ » → النقل. يُحال إلى المتعامل المعني."},
  // ── Groupe 3 : Pharmacie de garde ──
  {k:['pharmacie','pharmacien','garde','medicament','ordonnance','nuit','ouverte','24h','صيدلية','صيدلية مناوبة','دواء','فارماسيان','صيدلية الليل','وين نلقى فارماسي'],fr:"Consultez les pharmacies de garde dans « Infos utiles » → Pharmacies de garde. Le service Sante-DZ affiche les pharmacies ouvertes 24h/24.",ar:"راجعوا صيدليات المناوبة في « معلومات مفيدة » → صيدليات المناوبة. خدمة Sante-DZ تعرض الصيدليات المفتوحة 24/7."},
  // ── Groupe 4 : Perte / objet trouvé ──
  {k:['perdu','perdue','perte','trouve','trouvee','objet trouve','papiers','portefeuille','telephone perdu','document perdu','ضيعت','ضاع','لقيت','وراقي','بورتفوي','تلفوني ضاع','راني ضيعت وراقي','محفظة','وثيقة ضائعة'],fr:"Déclarez votre perte ou objet trouvé dans « Perdu-Trouvé ». Vous recevrez une référence de suivi (PER-*/TRV-*) consultable dans « Mon suivi ».",ar:"صرّحوا بالضياع أو الشيء الموجود في « مفقود-موجود ». ستحصلون على مرجع متابعة (PER-*/TRV-*) في « متابعتي »."},
  // ── Groupe 5 : Compte / NIN / quota ──
  {k:['nin','quota','limite','limite atteinte','plus signaler','debloquer','verifier compte','niveau compte','رقم التعريف','حصة','حد','ما نقدرش نبلغ','كيفاش نفتح','تحقق','مستوى الحساب'],fr:"Votre compte peut être Simple ou Vérifié (d'autres niveaux arriveront). Simple : 5 signalements/mois. Déclarez votre NIN (18 chiffres) dans « Mon profil » pour débloquer le niveau Vérifié : 5 signalements/jour. Le NIN est réservé aux résidents disposant d'un numéro d'identification nationale.",ar:"حسابكم يمكن أن يكون بسيط أو مُوثَّق (مستويات أخرى قادمة). بسيط: 5 بلاغات/شهر. صرّحوا برقم التعريف الوطني (18 رقم) في « ملفي » لفتح المستوى المُوثَّق: 5 بلاغات/يوم. رقم التعريف مخصص للمقيمين الحاملين لرقم تعريف وطني."},
  // ── Groupe 6 : Ma Houma (définir/changer) ──
  {k:['definir houma','changer quartier','modifier houma','localisation','position','حدد حومتي','بدل الحي','غير حومتي','وين نسكن','موقعي'],fr:"Pour définir ou changer votre houma, ouvrez « Ma Houma » sur la carte et appuyez sur votre emplacement. Votre position sera enregistrée et vos signalements pré-remplis.",ar:"لتحديد أو تغيير حومتكم، افتحوا « حومتي » على الخريطة واضغطوا على موقعكم. سيُحفظ موقعكم وتُملأ بلاغاتكم مسبقا."},
  // ── Groupe 7 : Urgences / contacts ──
  {k:['gendarmerie','police','pompier','pompiers','protection civile','samu','ambulance','croissant rouge','centre anti-poison','secours','urgence medicale','درك','شرطة','حماية مدنية','إسعاف','إطفاء','الهلال الأحمر','مركز مضاد للتسمم','نجدة','طوارئ'],fr:"Numéros d'urgence : Police 17, Gendarmerie 1055, Protection civile / Pompiers 14, SAMU 115, Croissant-Rouge 021 63 48 48, Centre anti-poison 021 97 98 98. Consultez « Infos utiles » → Urgences pour la liste complète.",ar:"أرقام الطوارئ: الشرطة 17، الدرك 1055، الحماية المدنية / الإطفاء 14، الإسعاف 115، الهلال الأحمر 021 63 48 48، مركز مضاد للتسمم 021 97 98 98. راجعوا « معلومات مفيدة » → طوارئ للقائمة الكاملة."},
];

/**
 * Recherche FAQ Saksini v2 — matching strict par keywords.
 * Ignore les mots < 3 chars. Exige un score minimum de 3.
 * Les mots génériques (nuit, ouverte, garde…) ne comptent QUE
 * si un mot du domaine a déjà matché dans la même intention.
 * Retourne null si aucun match → le fallback poli s'affiche.
 */
const SAKSINI_GENERIC = new Set(['nuit','ouverte','ouvert','garde','24h','limite','position','sombre','الليل','مفتوحة','مفتوح']);
function saksiniSearch(q) {
  const words = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .split(/\s+/).filter(w => w.length >= 3); // ignorer les mots courts (le, un, de, je...)
  if (!words.length) return null;
  let best = null, bestScore = 0;
  for (const faq of SAKSINI_FAQ) {
    let domainScore = 0, genericScore = 0;
    for (const w of words) {
      for (const k of faq.k) {
        let pts = 0;
        if (w === k) pts = 4;
        else if (k.length >= 4 && w.includes(k)) pts = 2;
        else if (w.length >= 4 && k.includes(w)) pts = 2;
        else if (w.length >= 4 && k.length >= 4 && k.startsWith(w.substring(0,4))) pts = 1;
        if (pts > 0) {
          if (SAKSINI_GENERIC.has(k) || SAKSINI_GENERIC.has(w)) genericScore += pts;
          else domainScore += pts;
        }
      }
    }
    // Mots génériques ne comptent que si au moins un mot du domaine a matché
    const score = domainScore + (domainScore > 0 ? genericScore : 0);
    if (score > bestScore) { bestScore = score; best = faq; }
  }
  return best && bestScore >= 3 ? best : null; // seuil minimum 3 pour éviter les faux matches
}

function saksiniInit() {
  const msgs = document.getElementById('saksini-msgs');
  msgs.innerHTML = '';
  // Message de bienvenue (dans la langue active)
  saksiniAddMsg('bot', t('saksini.bienvenue'));
  // Charger historique seulement si même langue
  const hist = JSON.parse(localStorage.getItem('saksini_hist') || '[]');
  const lang = currentLang || 'fr';
  hist.filter(h => h.lang === lang).forEach(h => {
    saksiniAddMsg('user', h.q);
    saksiniAddMsg('bot', h.a);
  });
}

function saksiniAddMsg(role, text) {
  const msgs = document.getElementById('saksini-msgs');
  const cls = role === 'user' ? 'sak-msg-user' : 'sak-msg-bot';
  msgs.insertAdjacentHTML('beforeend', `<div class="${cls}">${escHtml(text)}</div>`);
  msgs.scrollTop = msgs.scrollHeight;
}

async function saksiniAsk(q) {
  if (!q || !q.trim()) return;
  saksiniAddMsg('user', q);
  const lang = currentLang || 'fr';

  // 1. Chercher dans la FAQ locale
  const match = saksiniSearch(q);
  if (match) {
    const answer = lang === 'ar' ? match.ar : match.fr;
    saksiniAddMsg('bot', answer);
    saksiniSaveHist(q, answer);
    document.getElementById('saksini-input').value = '';
    return;
  }

  // 1b. Chercher dans l'index Saksini (API)
  try {
    var results = await safeFetchJSON('/api/saksini/search?q=' + encodeURIComponent(q.trim()));
    if (results && results.length) {
      var catLabels = {sante:'Santé',securite:'Sécurité',transport:'Transport',administration:'Administration',demarches:'Démarches',signalements:'Signalements',reseaux:'Réseaux',modules:'Modules',lieux:'Lieux de proximité'};
      var catLabelsAr = {sante:'صحة',securite:'أمن',transport:'نقل',administration:'إدارة',demarches:'إجراءات',signalements:'تبليغات',reseaux:'شبكات',modules:'خدمات',lieux:'أماكن قريبة'};
      var catName = lang === 'ar' ? (catLabelsAr[results[0].category] || results[0].category) : (catLabels[results[0].category] || results[0].category);
      var intro = lang === 'ar' ? 'ربما تبحث عن خدمة: ' + catName : 'Vous cherchez probablement un service : ' + catName;
      saksiniAddMsg('bot', intro);
      var msgs = document.getElementById('saksini-msgs');
      var btnsDiv = document.createElement('div');
      btnsDiv.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-top:6px;';
      results.forEach(function(r) {
        var title = lang === 'ar' ? (r.title_ar || r.title_fr) : r.title_fr;
        var desc = lang === 'ar' ? (r.description_ar || r.description_fr) : r.description_fr;
        var btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline';
        btn.style.cssText = 'text-align:left;padding:8px 12px;font-size:13px;line-height:1.3;';
        btn.innerHTML = '<strong>' + escHtml(title) + '</strong><br><span style="font-size:11px;color:var(--muted);">' + escHtml(desc || '') + '</span>';
        btn.onclick = function() {
          var route = r.target_route;
          if (route.startsWith('/equipements')) { showView('equipements'); var tp = (route.match(/type=([^&]+)/) || [])[1]; if (tp) filterEquipType(null, tp); }
          else if (route.startsWith('/infos')) { showView('infos'); var cat = (route.match(/categorie=([^&]+)/) || [])[1]; if (cat) loadInfos(cat); }
          else if (route.startsWith('/signaler')) showView('signaler');
          else if (route.startsWith('/civiadmin')) { showView('civiadmin'); if (route.includes('preparer')) showDemarchesTab('preparer'); }
          else if (route.startsWith('/mes-signalements')) showView('mes-signalements');
          else showView('carte');
          saksiniToggle();
        };
        btnsDiv.appendChild(btn);
      });
      msgs.appendChild(btnsDiv);
      msgs.scrollTop = msgs.scrollHeight;
      saksiniSaveHist(q, intro);
      document.getElementById('saksini-input').value = '';
      return;
    }
  } catch(e) { /* API indisponible, continuer avec déduction locale */ }

  // 2. Tenter la déduction signalement par mots-clés
  const deduction = saksiniDeduceSignalement(q);
  if (deduction) {
    const meta = SIG_FAMILLE_META[deduction.famille] || {};
    const catLabel = lang === 'ar' ? (meta.label_ar || deduction.famille) : (meta.label || deduction.famille);
    const lieu = deduction.lieu ? ` — ${deduction.lieu}` : '';
    const epicInfo = deduction.epic ? ` (${deduction.epic})` : '';
    const prioLabel = deduction.priorite === 'haute' ? (lang === 'ar' ? '⚠ عاجل' : '⚠ Urgent') : '';
    const msg = lang === 'ar'
      ? `فهمت: ${catLabel} / ${deduction.sousCategorie}${lieu}${epicInfo} ${prioLabel}\n\nهل تريد إنشاء هذا البلاغ؟`
      : `J'ai compris : ${catLabel} / ${deduction.sousCategorie}${lieu}${epicInfo} ${prioLabel}\n\nVoulez-vous créer ce signalement ?`;
    saksiniAddMsg('bot', msg);
    // Ajouter bouton de création
    const msgs = document.getElementById('saksini-msgs');
    const btnOui = lang === 'ar' ? 'نعم، أنشئ' : 'Oui, créer';
    const btnNon = lang === 'ar' ? 'لا' : 'Non';
    const dismissMsg = lang === 'ar' ? 'حسنا، اسأل سؤالا آخر.' : 'Posez une autre question.';
    const btnDiv = document.createElement('div');
    btnDiv.style.cssText = 'display:flex;gap:6px;margin-top:4px;';
    const b1 = document.createElement('button');
    b1.className = 'btn btn-sm btn-primary';
    b1.textContent = btnOui;
    b1.onclick = function() { saksiniCreateSignalement(deduction.catId, deduction.famille); };
    const b2 = document.createElement('button');
    b2.className = 'btn btn-sm btn-outline';
    b2.textContent = btnNon;
    b2.onclick = function() { saksiniAddMsg('bot', dismissMsg); };
    btnDiv.appendChild(b1);
    btnDiv.appendChild(b2);
    msgs.appendChild(btnDiv);
    msgs.scrollTop = msgs.scrollHeight;
    saksiniSaveHist(q, msg);
    document.getElementById('saksini-input').value = '';
    return;
  }

  // 3. Fallback poli avec boutons
  var fallbackMsg = lang === 'ar'
    ? 'لم أجد خدمة مطابقة. يمكنك إعادة صياغة سؤالك أو تصفح الأقسام التالية.'
    : 'Je n\'ai pas trouvé de service correspondant. Vous pouvez reformuler votre question ou consulter :';
  saksiniAddMsg('bot', fallbackMsg);
  var msgs = document.getElementById('saksini-msgs');
  var fbDiv = document.createElement('div');
  fbDiv.style.cssText = 'display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;';
  [{l:lang==='ar'?'معلومات مفيدة':'Infos utiles',v:'infos'},{l:lang==='ar'?'أبلّغ':'Je signale',v:'signaler'},{l:lang==='ar'?'إجراءاتي':'Mes démarches',v:'civiadmin'}].forEach(function(b) {
    var btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline';
    btn.textContent = b.l;
    btn.onclick = function() { showView(b.v); saksiniToggle(); };
    fbDiv.appendChild(btn);
  });
  msgs.appendChild(fbDiv);
  msgs.scrollTop = msgs.scrollHeight;
  saksiniSaveHist(q, fallbackMsg);
  document.getElementById('saksini-input').value = '';
}

function saksiniSaveHist(q, a) {
  const hist = JSON.parse(localStorage.getItem('saksini_hist') || '[]');
  hist.push({ q, a, lang: currentLang || 'fr' });
  if (hist.length > 10) hist.shift();
  localStorage.setItem('saksini_hist', JSON.stringify(hist));
}

// Déduction de signalement par mots-clés des sous-catégories
function saksiniDeduceSignalement(q) {
  if (!sigFamillesData) return null;
  const words = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .split(/\s+/).filter(w => w.length >= 3);
  if (words.length < 2) return null; // besoin d'au moins 2 mots significatifs

  let bestCat = null, bestScore = 0;
  for (const [famille, cats] of Object.entries(sigFamillesData)) {
    for (const cat of cats) {
      const kw = (cat.keywords || '').toLowerCase().split(/\s+/);
      let score = 0;
      for (const w of words) {
        for (const k of kw) {
          if (w === k) score += 4;
          else if (k.length >= 4 && w.includes(k)) score += 2;
          else if (w.length >= 4 && k.includes(w)) score += 2;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestCat = { catId: cat.id, famille, sousCategorie: cat.libelle,
                    epic: cat.epic_sigle || null, priorite: cat.criticite };
      }
    }
  }
  if (bestScore < 4) return null; // seuil strict

  // Détecter un lieu (commune) dans la phrase
  if (communes && communes.length) {
    const qLower = q.toLowerCase();
    for (const c of communes) {
      if (qLower.includes(c.nom.toLowerCase())) {
        bestCat.lieu = c.nom;
        bestCat.communeId = c.id;
        break;
      }
    }
  }
  return bestCat;
}

function saksiniCreateSignalement(catId, famille) {
  saksiniToggle(); // fermer le chat
  showView('signaler');
  // Pré-remplir le formulaire
  setTimeout(() => {
    sigSelectCategorie(catId, famille);
  }, 300);
}

function saksiniToggle() {
  const w = document.getElementById('saksini-widget');
  const visible = !w.classList.contains('hidden');
  w.classList.toggle('hidden');
  if (!visible) saksiniInit();
}

// ═══ COMMAND-CENTER — Salle de Commandement v2 ═══
function ccNom(obj) { return currentLang === 'ar' && obj.nom_ar ? obj.nom_ar : obj.nom; }
function ccLtr(v) { return '<span dir="ltr">' + v + '</span>'; }
function boOpenSignalement(ref) {
  // Open the signalement drawer from CC view — set context
  _boDrawerContext = 'cc';
  if (typeof _boSignals !== 'undefined' && _boSignals && _boSignals.length) {
    var existing = _boSignals.find(function(s) { return s.reference === ref; });
    if (existing) { boOpenDrawer(existing.id); return; }
  }
  // Fallback: fetch board, populate _boSignals, then open
  safeFetchJSON('/api/signaler/board', {}, true).then(function(data) {
    var items = Array.isArray(data) ? data : [];
    if (typeof _boSignals === 'undefined' || !_boSignals || !_boSignals.length) _boSignals = items;
    var s = items.find(function(x) { return x.reference === ref; });
    if (s) {
      document.getElementById('bo-drawer').classList.remove('hidden');
      boOpenDrawer(s.id);
    }
    else showToast(t('cc.aucun_dossier'), 'error');
  }).catch(function() { showToast(t('cc.aucun_dossier'), 'error'); });
}
async function ccLoad() {
  var loading = document.getElementById('cc-loading');
  var error = document.getElementById('cc-error');
  var content = document.getElementById('cc-content');
  if (loading) loading.style.display = '';
  if (error) error.classList.add('hidden');
  if (content) content.classList.add('hidden');

  var period = document.getElementById('cc-period');
  var periodVal = period ? period.value : '30d';

  try {
    var data = await safeFetchJSON('/api/command-center/overview?period=' + periodVal, {}, true);
    if (loading) loading.style.display = 'none';
    if (content) content.classList.remove('hidden');
    // CC edit rights: admin_wilaya or cabinet
    _ccCanEdit = currentUser && (currentUser.role === 'admin_wilaya' || currentUser.fonction === 'cabinet');

    // Updated timestamp
    var updEl = document.getElementById('cc-updated');
    if (updEl) updEl.textContent = t('cc.maj') + ' ' + new Date().toLocaleTimeString(currentLang === 'ar' ? 'ar-DZ' : 'fr-DZ', {hour:'2-digit',minute:'2-digit',hour12:false});

    // Synthesis phrase
    var syn = document.getElementById('cc-synthesis');
    if (syn && data.summary) {
      var s = data.summary;
      syn.innerHTML = ccLtr(s.criticalCases) + ' ' + t('cc.syn_critiques') + ' · ' + ccLtr(s.breachedSla) + ' ' + t('cc.syn_sla') + ' · ' + t('cc.syn_score') + ' ' + ccLtr(s.operationalScore + '/100');
    }

    // Cache data for KPI dropdowns
    _ccSummary = data.summary;
    _ccRiskZones = data.riskZones || [];
    _ccDirectionsData = data.directions || [];
    _ccEpicsPrioData = data.priorityEpics || [];
    _ccEpicsAutresData = data.otherEpics || [];

    // KPI cards
    ccRenderKpis(data.summary);
    // Close any open dropdown on reload
    ccKpiDropdownClose();

    // Priorities
    ccRenderPriorities(data.priorities || []);

    // Palier 2
    ccRenderMap(data.mapIncidents || []);
    ccRenderRiskZones(_ccRiskZones);
    ccRenderTerritory(data.territory || {});
    ccRenderDirections(_ccDirectionsData);
    ccRenderEpicsPrio(_ccEpicsPrioData);
    ccRenderEpicsAutres(_ccEpicsAutresData);
    ccCarouselDots(document.getElementById('cc-directions'));
    ccCarouselDots(document.getElementById('cc-epics-prio'));
    ccRenderPartners(data.externalPartners || []);
    _ccDecisions = data.pendingDecisions || [];
    ccRenderDecisions(_ccDecisions);
    _ccBriefingItems = (data.dailyBriefing || {}).items || [];
    ccRenderBriefing(data.dailyBriefing || {});
    ccRenderActivity(data.recentActivity || []);

    applyTranslations();
  } catch(e) {
    if (loading) loading.style.display = 'none';
    if (error) error.classList.remove('hidden');
    console.error('[cc] load failed:', e.message);
  }
}

var _ccKpiFilter = null;
var _ccCanEdit = false; // true for CC profiles (admin_wilaya, cabinet, cap salle_commandement)
var _ccAllPriorities = [];
var _ccSummary = null; // cached summary with scoreDetails
var _ccRiskZones = [];
var _ccDirectionsData = [];
var _ccEpicsPrioData = [];
var _ccEpicsAutresData = [];

function ccRenderKpis(s) {
  if (!s) return;
  var grid = document.getElementById('cc-kpis');
  if (!grid) return;
  var kpis = [
    { key:'critiques', value:s.criticalCases, icon:'🔴', color:'var(--cc-critique)', action:'critiques' },
    { key:'communes', value:s.communesUnderWatch, icon:'📍', color:'var(--cc-eleve)', action:'communes' },
    { key:'sla', value:s.breachedSla, icon:'⏱', color:'var(--cc-vigilance)', action:'sla' },
    { key:'decisions', value:s.pendingDecisions, icon:'📋', color:'var(--cc-decision)', action:'decisions' },
    { key:'score', value:s.operationalScore + '/100', icon:'📊', color: s.operationalScore >= 80 ? 'var(--cc-maitrise)' : s.operationalScore >= 60 ? 'var(--cc-vigilance)' : 'var(--cc-critique)', action:'score' },
    { key:'orgs', value:s.mobilizedOrganisations, icon:'🏛', color:'var(--navy-950)', action:'orgs' },
  ];
  grid.innerHTML = kpis.map(function(k) {
    return '<div class="cc-kpi-card cc-clickable" data-kpi="' + k.action + '" onclick="ccKpiFilter(\'' + k.action + '\')">' +
      '<div class="cc-kpi-icon" style="color:' + k.color + ';">' + k.icon + '</div>' +
      '<div class="cc-kpi-value" style="color:' + k.color + ';" dir="ltr">' + k.value + '</div>' +
      '<div class="cc-kpi-label">' + t('cc.kpi_' + k.key) + '</div>' +
    '</div>';
  }).join('');
}

function ccKpiFilter(action) {
  // Toggle: second click = close
  if (_ccKpiFilter === action) {
    ccKpiDropdownClose();
    return;
  }
  _ccKpiFilter = action;
  // Highlight active KPI
  document.querySelectorAll('.cc-kpi-card').forEach(function(c) {
    c.classList.toggle('cc-kpi-active', c.dataset.kpi === action);
  });
  // Filter map
  if (action === 'critiques') ccMapFilter('critique');
  else if (action === 'communes') { if (_ccMap) _ccMap.setView([36.7538, 3.0588], 11); }
  else ccMapFilter('all');
  // Filter priorities
  ccFilterPriorities();
  // Render dropdown
  ccKpiDropdownRender(action);
}

function ccKpiDropdownClose() {
  _ccKpiFilter = null;
  document.querySelectorAll('.cc-kpi-card').forEach(function(c) { c.classList.remove('cc-kpi-active'); });
  var dd = document.getElementById('cc-kpi-dropdown');
  if (dd) { dd.classList.remove('cc-dd-open'); dd.innerHTML = ''; }
  // Restore map & priorities
  ccMapFilter('all');
  ccFilterPriorities();
}

function ccKpiDropdownRender(action) {
  var dd = document.getElementById('cc-kpi-dropdown');
  if (!dd) return;
  var title = t('cc.kpi_' + (action === 'critiques' ? 'critiques' : action === 'communes' ? 'communes' : action === 'sla' ? 'sla' : action === 'decisions' ? 'decisions' : action === 'score' ? 'score' : 'orgs'));
  var html = '<div class="cc-kpi-dd-inner"><div class="cc-kpi-dd-header"><h4>' + escHtml(title) + '</h4><button class="cc-kpi-dd-close" onclick="ccKpiDropdownClose()">✕</button></div>';

  if (action === 'critiques') {
    // Critical dossiers from priorities
    var items = _ccAllPriorities.filter(function(p) { return p.criticite === 'danger_immediat'; });
    if (!items.length) { html += '<div class="cc-empty" style="padding:12px;">' + t('cc.aucune_priorite') + '</div>'; }
    else { html += '<div class="cc-kpi-dd-list">' + items.map(function(p) {
      var slaH = p.slaDepassementMinutes > 0 ? '+' + Math.round(p.slaDepassementMinutes / 60) + 'h' : '';
      return '<div class="cc-kpi-dd-row" onclick="boOpenSignalement(\'' + escHtml(p.reference) + '\')">' +
        '<span class="cc-kpi-dd-ref">' + escHtml(p.reference) + '</span>' +
        '<span class="cc-kpi-dd-label">' + escHtml(p.commune || '') + ' — ' + escHtml(ccNom(p) || p.titre || '') + '</span>' +
        (slaH ? '<span class="cc-kpi-dd-badge cc-tag-sla" dir="ltr">' + slaH + '</span>' : '<span class="cc-kpi-dd-badge" style="background:#e8f5e9;color:#159447;">' + t('cc.dans_delai') + '</span>') +
      '</div>';
    }).join('') + '</div>'; }

  } else if (action === 'communes') {
    // Communes under watch from riskZones
    if (!_ccRiskZones.length) { html += '<div class="cc-empty" style="padding:12px;">' + t('cc.aucune_zone') + '</div>'; }
    else { html += '<div class="cc-kpi-dd-list">' + _ccRiskZones.map(function(z) {
      var nom = currentLang === 'ar' && z.nom_ar ? z.nom_ar : z.nom;
      var nClass = z.critiques > 0 ? 'cc-tag-eleve' : 'cc-tag-moyen';
      return '<div class="cc-kpi-dd-row" onclick="ccDrillCommuneIncidents(' + z.id + ',\'' + escHtml(nom).replace(/'/g,'\\x27') + '\',' + z.lat + ',' + z.lng + ')">' +
        '<span class="cc-kpi-dd-label" style="margin:0;">' + escHtml(nom) + '</span>' +
        '<span dir="ltr" style="font-weight:700;margin:0 6px;">' + z.incidents + '</span>' +
        '<span class="cc-kpi-dd-badge ' + nClass + '">' + (z.critiques > 0 ? t('cc.niveau_eleve') : t('cc.niveau_moyen')) + '</span>' +
      '</div>';
    }).join('') + '</div>'; }

  } else if (action === 'sla') {
    // SLA-breached dossiers from priorities
    var items = _ccAllPriorities.filter(function(p) { return p.slaDepassementMinutes > 0; });
    if (!items.length) { html += '<div class="cc-empty" style="padding:12px;">' + t('cc.aucune_priorite') + '</div>'; }
    else { html += '<div class="cc-kpi-dd-list">' + items.map(function(p) {
      var slaH = '+' + Math.round(p.slaDepassementMinutes / 60) + 'h';
      return '<div class="cc-kpi-dd-row" onclick="boOpenSignalement(\'' + escHtml(p.reference) + '\')">' +
        '<span class="cc-kpi-dd-ref">' + escHtml(p.reference) + '</span>' +
        '<span class="cc-kpi-dd-label">' + escHtml(p.commune || '') + ' — ' + escHtml(ccNom(p) || p.titre || '') + '</span>' +
        '<span class="cc-kpi-dd-badge cc-tag-sla" dir="ltr">' + slaH + '</span>' +
      '</div>';
    }).join('') + '</div>'; }

  } else if (action === 'decisions') {
    // Pending decisions
    if (!_ccDecisions.length) { html += '<div class="cc-empty" style="padding:12px;">' + t('cc.aucun_dossier') + '</div>'; }
    else { html += '<div class="cc-kpi-dd-list">' + _ccDecisions.map(function(d) {
      var titre = currentLang === 'ar' && d.titre_ar ? d.titre_ar : d.titre;
      var dir = currentLang === 'ar' && d.direction_ar ? d.direction_ar : (d.direction || '—');
      var badgeCls = d.priorite === 'haute' ? 'cc-badge-haute' : 'cc-badge-moyenne';
      var badgeLabel = d.priorite === 'haute' ? t('cc.priorite_haute') : t('cc.priorite_moyenne');
      return '<div class="cc-kpi-dd-row" onclick="ccShowDecision(' + d.id + ')">' +
        '<span class="cc-kpi-dd-label" style="margin:0;">' + escHtml(titre) + '</span>' +
        '<span style="font-size:11px;color:var(--muted);margin:0 6px;flex-shrink:0;">' + escHtml(dir) + '</span>' +
        '<span class="cc-badge-decision ' + badgeCls + '">' + badgeLabel + '</span>' +
      '</div>';
    }).join('') + '</div>'; }

  } else if (action === 'score') {
    // Score details with 5 components
    if (!_ccSummary || !_ccSummary.scoreDetails) { html += '<div class="cc-empty" style="padding:12px;">—</div>'; }
    else {
      var sd = _ccSummary.scoreDetails;
      var w = sd.weights;
      var components = [
        { label: t('cc.score_sla'), value: sd.slaRespect, weight: w.slaRespect, color: '#2563eb' },
        { label: t('cc.score_traitement'), value: sd.tauxTraitement, weight: w.tauxTraitement, color: '#159447' },
        { label: t('cc.score_reponse'), value: sd.tauxReponse, weight: w.tauxReponse, color: '#7c3aed' },
        { label: t('cc.score_critiques'), value: sd.inverseCritiques, weight: w.inverseCritiques, color: '#e53935' },
        { label: t('cc.score_decisions'), value: sd.inverseDecisions, weight: w.inverseDecisions, color: '#f57c00' }
      ];
      html += '<div class="cc-kpi-dd-list"><table class="cc-score-table">';
      html += '<tr><th>' + t('cc.score_composante') + '</th><th>' + t('cc.score_poids') + '</th><th>' + t('cc.score_valeur') + '</th><th></th></tr>';
      components.forEach(function(c) {
        html += '<tr><td>' + c.label + '</td><td style="text-align:center;" dir="ltr">' + Math.round(c.weight * 100) + '%</td>' +
          '<td style="text-align:center;font-weight:700;" dir="ltr">' + c.value + '/100</td>' +
          '<td><div class="cc-score-bar"><div class="cc-score-bar-fill" style="width:' + c.value + '%;background:' + c.color + ';"></div></div></td></tr>';
      });
      html += '</table><div style="padding:8px 10px;font-size:12px;font-weight:700;color:var(--navy-950);border-top:2px solid var(--cc-border);">' +
        t('cc.score_total') + ' : <span dir="ltr">' + _ccSummary.operationalScore + '/100</span></div></div>';
    }

  } else if (action === 'orgs') {
    // Mobilized organisations by type
    var dirCount = _ccDirectionsData.filter(function(d) { return parseInt(d.ouverts) > 0; }).length;
    var epicCount = _ccEpicsPrioData.length + _ccEpicsAutresData.length;
    var types = [];
    if (dirCount > 0) types.push({ label: t('cc.directions_titre'), count: dirCount, icon: '🏢' });
    if (_ccEpicsPrioData.length > 0) types.push({ label: t('cc.epic_prio_titre'), count: _ccEpicsPrioData.length, icon: '⚡' });
    if (_ccEpicsAutresData.length > 0) types.push({ label: t('cc.epic_autres_titre'), count: _ccEpicsAutresData.length, icon: '🏛' });
    html += '<div class="cc-kpi-dd-list">';
    types.forEach(function(tp) {
      html += '<div class="cc-kpi-dd-row" style="cursor:default;">' +
        '<span style="margin-right:6px;">' + tp.icon + '</span>' +
        '<span class="cc-kpi-dd-label" style="margin:0;">' + tp.label + '</span>' +
        '<span class="cc-badge-count" dir="ltr">' + tp.count + '</span>' +
      '</div>';
    });
    // List mobilized directions
    _ccDirectionsData.filter(function(d) { return parseInt(d.ouverts) > 0; }).forEach(function(d) {
      var dNom = ccNom(d);
      html += '<div class="cc-kpi-dd-row" onclick="ccDrillOrg(\'direction\',' + d.id + ',\'' + escHtml(dNom).replace(/'/g,'\\x27') + '\')">' +
        '<span class="cc-kpi-dd-label" style="margin:0;font-weight:600;">' + escHtml(dNom) + '</span>' +
        '<span dir="ltr" style="font-size:11px;color:var(--muted);">' + d.ouverts + ' ' + t('cc.ouverts') + '</span>' +
      '</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  dd.innerHTML = html;
  dd.classList.add('cc-dd-open');
}

function ccFilterPriorities() {
  var el = document.getElementById('cc-priorities');
  if (!el || !_ccAllPriorities.length) return;
  var filtered = _ccAllPriorities;
  if (_ccKpiFilter === 'critiques') filtered = filtered.filter(function(p) { return p.criticite === 'danger_immediat'; });
  else if (_ccKpiFilter === 'sla') filtered = filtered.filter(function(p) { return p.slaDepassementMinutes > 0; });
  ccRenderPriorityRows(el, filtered.length ? filtered : _ccAllPriorities);
  if (!filtered.length && _ccKpiFilter) el.innerHTML = '<div class="cc-empty">' + t('cc.aucune_priorite') + '</div>';
}

// ── Palier 2 : Carte, Directions, EPIC, Territoire, Partenaires ──

var _ccMap = null;
var _ccMarkers = [];
var _ccMapData = [];

function ccRenderMap(incidents) {
  _ccMapData = incidents;
  var mapEl = document.getElementById('cc-map');
  if (!mapEl) return;
  if (!_ccMap) {
    _ccMap = L.map('cc-map').setView([36.7538, 3.0588], 11);
    createTileLayer(_ccMap);
    setTimeout(function() { _ccMap.invalidateSize(); }, 400);
  } else {
    setTimeout(function() { _ccMap.invalidateSize(); }, 200);
  }
  ccMapFilter('all');
}

function ccMapFilter(type) {
  if (!_ccMap) return;
  _ccMarkers.forEach(function(m) { _ccMap.removeLayer(m); });
  _ccMarkers = [];
  var btns = document.querySelectorAll('.cc-filter-btn');
  btns.forEach(function(b) { b.classList.toggle('active', b.dataset.filter === type); });

  if (type === 'communes') {
    // Aggregate by commune
    var byCommune = {};
    _ccMapData.forEach(function(inc) {
      if (!inc.lat || !inc.lng) return;
      var key = inc.commune || 'Inconnu';
      if (!byCommune[key]) byCommune[key] = { lat: inc.lat, lng: inc.lng, count: 0, nom: key, refs: [] };
      byCommune[key].count++;
      byCommune[key].refs.push(inc.reference);
    });
    Object.values(byCommune).forEach(function(c) {
      var icon = L.divIcon({ className:'', html:'<div style="min-width:20px;height:20px;border-radius:10px;background:#063B5A;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3);">' + c.count + '</div>' });
      var marker = L.marker([c.lat, c.lng], { icon: icon }).addTo(_ccMap).bindPopup('<strong>' + escHtml(c.nom) + '</strong><br>' + ccLtr(c.count) + ' ' + t('cc.incidents_actifs'));
      marker.on('click', function() { ccMapDrillRefs(c.nom, c.refs); });
      _ccMarkers.push(marker);
    });
  } else if (type === 'directions') {
    // Aggregate by direction pilote
    var byDir = {};
    _ccMapData.forEach(function(inc) {
      if (!inc.lat || !inc.lng || !inc.direction_pilote_id) return;
      var key = inc.direction_pilote_id;
      var nom = currentLang === 'ar' && inc.direction_pilote_ar ? inc.direction_pilote_ar : inc.direction_pilote;
      if (!byDir[key]) byDir[key] = { lat: 0, lng: 0, count: 0, nom: nom || 'Inconnu', refs: [], latSum: 0, lngSum: 0 };
      byDir[key].count++;
      byDir[key].latSum += parseFloat(inc.lat);
      byDir[key].lngSum += parseFloat(inc.lng);
      byDir[key].lat = byDir[key].latSum / byDir[key].count;
      byDir[key].lng = byDir[key].lngSum / byDir[key].count;
      byDir[key].refs.push(inc.reference);
    });
    Object.values(byDir).forEach(function(d) {
      var icon = L.divIcon({ className:'', html:'<div style="min-width:20px;height:20px;border-radius:10px;background:#2563EB;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3);">' + d.count + '</div>' });
      var marker = L.marker([d.lat, d.lng], { icon: icon }).addTo(_ccMap).bindPopup('<strong>' + escHtml(d.nom) + '</strong><br>' + ccLtr(d.count) + ' ' + t('cc.incidents_actifs'));
      marker.on('click', function() { ccMapDrillRefs(d.nom, d.refs); });
      _ccMarkers.push(marker);
    });
  } else if (type === 'epic') {
    // Aggregate by organisation executante (EPIC)
    var byEpic = {};
    _ccMapData.forEach(function(inc) {
      if (!inc.lat || !inc.lng || !inc.organisation_executante_id || inc.organisation_type !== 'epic') return;
      var key = inc.organisation_executante_id;
      var nom = currentLang === 'ar' && inc.organisation_executante_ar ? inc.organisation_executante_ar : inc.organisation_executante;
      if (!byEpic[key]) byEpic[key] = { lat: 0, lng: 0, count: 0, nom: nom || 'Inconnu', refs: [], latSum: 0, lngSum: 0 };
      byEpic[key].count++;
      byEpic[key].latSum += parseFloat(inc.lat);
      byEpic[key].lngSum += parseFloat(inc.lng);
      byEpic[key].lat = byEpic[key].latSum / byEpic[key].count;
      byEpic[key].lng = byEpic[key].lngSum / byEpic[key].count;
      byEpic[key].refs.push(inc.reference);
    });
    Object.values(byEpic).forEach(function(e) {
      var icon = L.divIcon({ className:'', html:'<div style="min-width:20px;height:20px;border-radius:10px;background:#7c3aed;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3);">' + e.count + '</div>' });
      var marker = L.marker([e.lat, e.lng], { icon: icon }).addTo(_ccMap).bindPopup('<strong>' + escHtml(e.nom) + '</strong><br>' + ccLtr(e.count) + ' ' + t('cc.incidents_actifs'));
      marker.on('click', function() { ccMapDrillRefs(e.nom, e.refs); });
      _ccMarkers.push(marker);
    });
  } else {
    var items = _ccMapData;
    if (type === 'critique') items = items.filter(function(i) { return i.gravite === 'danger_immediat'; });
    items.forEach(function(inc) {
      if (!inc.lat || !inc.lng) return;
      var color = inc.gravite === 'danger_immediat' ? '#EF4444' : (inc.criticite === 'haute' ? '#f97316' : '#eab308');
      var icon = L.divIcon({ className:'', html:'<div style="width:12px;height:12px;border-radius:50%;background:'+color+';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3);"></div>' });
      var marker = L.marker([inc.lat, inc.lng], { icon: icon }).addTo(_ccMap).bindPopup('<strong>' + escHtml(inc.reference) + '</strong><br>' + escHtml(inc.commune || ''));
      _ccMarkers.push(marker);
    });
  }
  if (_ccMarkers.length) {
    var group = L.featureGroup(_ccMarkers);
    _ccMap.fitBounds(group.getBounds().pad(0.1));
  }
}

function ccRenderRiskZones(zones) {
  var el = document.getElementById('cc-risk-zones-list');
  if (!el) return;
  if (!zones.length) { el.innerHTML = '<div class="cc-empty">' + t('cc.aucune_zone') + '</div>'; return; }
  el.innerHTML = zones.map(function(z) {
    var niveau = z.critiques > 0 ? t('cc.niveau_eleve') : t('cc.niveau_moyen');
    var nClass = z.critiques > 0 ? 'cc-tag-eleve' : 'cc-tag-moyen';
    return '<div class="cc-risk-row cc-clickable" onclick="ccDrillCommuneIncidents(' + z.id + ',\'' + escHtml(z.nom).replace(/'/g,'\\x27') + '\',' + z.lat + ',' + z.lng + ')">' +
      '<div><strong>' + escHtml(currentLang === 'ar' && z.nom_ar ? z.nom_ar : z.nom) + '</strong>' +
      '<div style="font-size:11px;color:var(--muted);">' + ccLtr(z.incidents) + ' ' + t('cc.incidents_actifs') + '</div></div>' +
      '<span class="' + nClass + '">' + niveau + '</span>' +
    '</div>';
  }).join('');
}

function ccMapZoom(lat, lng) {
  if (_ccMap && lat && lng) _ccMap.setView([lat, lng], 14);
}

function ccRenderTerritory(terr) {
  var el = document.getElementById('cc-territory');
  if (!el) return;
  el.innerHTML =
    '<div class="cc-terr-card cc-clickable" onclick="ccDrillTerritory(\'dairas\')">' +
      '<div class="cc-terr-value" dir="ltr">' + (terr.dairasTotal || 14) + '</div>' +
      '<div class="cc-terr-label">' + t('cc.dairas') + '</div>' +
      '<div class="cc-terr-sub">' + ccLtr(terr.dairasConcernees || 0) + ' ' + t('cc.dairas_concernees') + '</div>' +
    '</div>' +
    '<div class="cc-terr-card cc-clickable" onclick="ccDrillTerritory(\'communes\')">' +
      '<div class="cc-terr-value" dir="ltr">' + (terr.apcTotal || 57) + '</div>' +
      '<div class="cc-terr-label">' + t('cc.apc') + '</div>' +
      '<div class="cc-terr-sub">' + ccLtr(terr.apcNoResponse || 0) + ' ' + t('cc.apc_vigilance') + '</div>' +
    '</div>';
}

async function ccDrillTerritory(type) {
  var data = await safeFetchJSON('/api/command-center/detail/' + type + '/0', {}, true);
  if (!data || !data.rows) return;
  var title = type === 'dairas' ? t('cc.dairas') : t('cc.apc');
  var drillType = type === 'dairas' ? 'daira-incidents' : 'commune-incidents';
  var html = '<div class="cc-panel-header"><h3>' + title + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += '<div class="cc-panel-list">' + data.rows.map(function(r) {
    var nom = currentLang === 'ar' && r.nom_ar ? r.nom_ar : r.nom;
    var count = parseInt(r.incidents) || 0;
    var clickable = count > 0;
    var cls = clickable ? 'cc-panel-row cc-clickable' : 'cc-panel-row';
    var onclick = clickable ? ' onclick="ccDrillSubTerritory(\'' + drillType + '\',' + r.id + ',\'' + escHtml(nom).replace(/'/g,'\\x27') + '\')"' : '';
    return '<div class="' + cls + '"' + onclick + '><span>' + escHtml(nom) + '</span><span class="cc-badge-count" dir="ltr">' + count + '</span></div>';
  }).join('') + '</div>';
  ccShowPanel(html);
}

async function ccDrillSubTerritory(type, id, nom) {
  var data = await safeFetchJSON('/api/command-center/detail/' + type + '/' + id, {}, true);
  if (!data || !data.rows) return;
  var html = '<div class="cc-panel-header"><h3>' + escHtml(nom) + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  if (!data.rows.length) {
    html += '<div class="cc-empty" style="margin:12px 16px;">' + t('cc.aucun_dossier') + '</div>';
  } else {
    html += ccBuildDossierList(data.rows);
  }
  ccShowPanel(html);
}

async function ccDrillCommuneIncidents(communeId, nom, lat, lng) {
  if (_ccMap && lat && lng) _ccMap.setView([lat, lng], 14);
  await ccDrillSubTerritory('commune-incidents', communeId, nom);
}

function ccRenderDirections(dirs) {
  var el = document.getElementById('cc-directions');
  if (!el) return;
  var mobilized = dirs.filter(function(d) { return parseInt(d.ouverts) > 0; });
  mobilized.sort(function(a, b) { return parseInt(b.critiques) - parseInt(a.critiques) || parseInt(b.slaDepasses) - parseInt(a.slaDepasses) || parseInt(b.ouverts) - parseInt(a.ouverts); });
  if (!mobilized.length) { el.innerHTML = '<div class="cc-empty">' + t('cc.aucune_direction') + '</div>'; return; }
  el.innerHTML = mobilized.map(function(d) {
    var dNom = ccNom(d);
    return '<div class="cc-dir-card">' +
      '<div class="cc-dir-name">' + escHtml(dNom) + '</div>' +
      '<div class="cc-dir-stats">' +
        '<span>' + ccLtr(d.ouverts) + ' ' + t('cc.ouverts') + '</span>' +
        (parseInt(d.critiques) > 0 ? '<span class="cc-tag-eleve">' + ccLtr(d.critiques) + ' ' + t('cc.critiques_label') + '</span>' : '') +
        (parseInt(d.slaDepasses) > 0 ? '<span class="cc-tag-sla">' + ccLtr(d.slaDepasses) + ' SLA</span>' : '') +
        '<span class="cc-tag-taux">' + ccLtr(d.tauxTraitement + '%') + ' ' + t('cc.traitement') + '</span>' +
      '</div>' +
      '<button class="cc-btn-action" onclick="ccDrillOrg(\'direction\',' + d.id + ',\'' + escHtml(dNom).replace(/'/g,'\\x27') + '\')">' + t('cc.ouvrir_dir') + '</button>' +
    '</div>';
  }).join('');
}

function ccRenderEpicsPrio(epics) {
  var el = document.getElementById('cc-epics-prio');
  if (!el) return;
  if (!epics.length) { el.innerHTML = '<div class="cc-empty">' + t('cc.aucun_epic') + '</div>'; return; }
  el.innerHTML = epics.map(function(e) {
    var eNom = ccNom(e);
    var eTutelle = currentLang === 'ar' && e.tutelle_ar ? e.tutelle_ar : e.tutelle;
    return '<div class="cc-epic-card cc-clickable" onclick="ccDrillOrg(\'epic\',' + e.id + ',\'' + escHtml(eNom).replace(/'/g,'\\x27') + '\')">' +
      '<div class="cc-epic-name">' + escHtml(eNom) + '</div>' +
      (eTutelle ? '<div class="cc-epic-tutelle">' + escHtml(eTutelle) + '</div>' : '') +
      '<div class="cc-epic-stats">' +
        '<div class="cc-epic-stat"><span class="cc-epic-num" dir="ltr">' + e.ouverts + '</span><span class="cc-epic-lbl">' + t('cc.ouverts') + '</span></div>' +
        '<div class="cc-epic-stat"><span class="cc-epic-num cc-critique-num" dir="ltr">' + e.critiques + '</span><span class="cc-epic-lbl">' + t('cc.critiques_label') + '</span></div>' +
        '<div class="cc-epic-stat"><span class="cc-epic-num cc-sla-num" dir="ltr">' + e.slaDepasses + '</span><span class="cc-epic-lbl">SLA</span></div>' +
        '<div class="cc-epic-stat"><span class="cc-epic-num" dir="ltr">' + e.tauxReponse + '%</span><span class="cc-epic-lbl">' + t('cc.reponse') + '</span></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function ccRenderEpicsAutres(epics) {
  var el = document.getElementById('cc-epics-autres');
  if (!el) return;
  if (!epics.length) { el.innerHTML = '<div class="cc-empty">' + t('cc.aucun_epic') + '</div>'; return; }
  el.innerHTML = epics.map(function(e) {
    var eNom = ccNom(e);
    return '<div class="cc-epic-row cc-clickable" onclick="ccDrillOrg(\'epic\',' + e.id + ',\'' + escHtml(eNom).replace(/'/g,'\\x27') + '\')">' +
      '<span>' + escHtml(eNom) + '</span>' +
      '<span class="cc-muted">' + ccLtr(e.ouverts) + ' ' + t('cc.ouverts') + '</span>' +
    '</div>';
  }).join('');
}

function ccCarouselDots(gridEl) {
  if (window.innerWidth > 768 || !gridEl) return;
  var existing = gridEl.parentNode.querySelector('.cc-carousel-dots');
  if (existing) existing.remove();
  var cards = gridEl.children;
  if (cards.length <= 1) return;
  var dots = document.createElement('div');
  dots.className = 'cc-carousel-dots';
  for (var i = 0; i < cards.length; i++) {
    var d = document.createElement('span');
    d.className = 'cc-carousel-dot' + (i === 0 ? ' active' : '');
    dots.appendChild(d);
  }
  gridEl.parentNode.insertBefore(dots, gridEl.nextSibling);
  gridEl.addEventListener('scroll', function() {
    var cardW = cards[0].offsetWidth + 10;
    var idx = Math.round(gridEl.scrollLeft / cardW);
    dots.querySelectorAll('.cc-carousel-dot').forEach(function(dd, j) {
      dd.classList.toggle('active', j === idx);
    });
  });
}

function ccRenderPartners(partners) {
  var el = document.getElementById('cc-partners');
  if (!el) return;
  if (!partners.length) { el.innerHTML = '<div class="cc-empty">' + t('cc.aucun_partenaire') + '</div>'; return; }
  el.innerHTML = partners.map(function(p) {
    var label = p.type_organisation === 'operateur_externe' ? t('cc.operateur') : t('cc.partenaire');
    return '<div class="cc-partner-card cc-clickable" onclick="ccShowPartner(' + p.id + ')">' +
      '<div class="cc-partner-name">' + escHtml(currentLang === 'ar' && p.nom_ar ? p.nom_ar : p.nom) + '</div>' +
      '<span class="cc-partner-type">' + label + '</span>' +
    '</div>';
  }).join('');
}

// ── Panneaux de drilldown ──

async function ccDrillOrg(type, id, nom) {
  // For EPIC, use epic-info to get org details too
  var endpoint = type === 'epic' ? 'epic-info' : type;
  var data = await safeFetchJSON('/api/command-center/detail/' + endpoint + '/' + id, {}, true);
  if (!data) return;
  var rows = data.rows || [];
  var org = data.organisation || null;
  var html = '<div class="cc-panel-header"><h3>' + escHtml(nom) + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  // For EPIC with org info, show tutelle/secteur
  if (org) {
    var orgTutelle = currentLang === 'ar' && org.tutelle_ar ? org.tutelle_ar : org.tutelle;
    html += '<div style="padding:8px 16px;font-size:11px;color:var(--muted);">';
    if (orgTutelle) html += escHtml(orgTutelle);
    if (org.secteur) html += ' · ' + escHtml(org.secteur);
    html += '</div>';
    rows = data.dossiers || [];
  }
  if (!rows.length) {
    html += '<div class="cc-empty" style="margin:12px 16px;">' + t('cc.aucun_dossier') + '</div>';
  } else {
    html += ccBuildDossierList(rows);
  }
  ccShowPanel(html);
}

function ccBuildDossierList(rows) {
  return '<div class="cc-panel-list">' + rows.map(function(r) {
    var sla = r.slaMin > 0 ? '<span class="cc-tag-sla" dir="ltr">+' + Math.round(r.slaMin / 60) + 'h</span>' : '';
    return '<div class="cc-panel-row cc-clickable" onclick="boOpenSignalement(\'' + escHtml(r.reference) + '\')">' +
      '<span class="cc-panel-ref">' + escHtml(r.reference) + '</span>' +
      '<span>' + escHtml(r.commune || '') + '</span>' +
      '<span class="cc-panel-etat">' + escHtml(r.etat) + '</span>' +
      sla +
    '</div>';
  }).join('') + '</div>';
}

var _ccDirectionsList = null;
async function ccShowPartner(id) {
  var data = await safeFetchJSON('/api/command-center/detail/partner/' + id, {}, true);
  if (!data || !data.organisation) return;
  if (!_ccDirectionsList) {
    _ccDirectionsList = await safeFetchJSON('/api/command-center/directions-list', {}, true) || [];
  }
  var o = data.organisation;
  var dirsIf = data.directionsInterface || [];
  var nom = currentLang === 'ar' && o.nom_ar ? o.nom_ar : o.nom;
  var desc = currentLang === 'ar' && o.description_ar ? o.description_ar : (o.description || '');
  var principal = dirsIf.find(function(d) { return d.principal; });
  var html = '<div class="cc-panel-header"><h3>' + escHtml(nom) + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += '<div class="cc-partner-fiche" id="cc-partner-fiche" data-id="' + o.id + '">';

  // Interlocuteur principal en tête
  if (principal) {
    html += '<div class="cc-fiche-principal">' + t('cc.interlocuteur_principal') + ' : <strong>' + escHtml(ccNom(principal)) + '</strong></div>';
  }

  // 1. Opérations en cours
  html += '<h4 class="cc-fiche-section">' + t('cc.operations_en_cours') + '</h4>';
  if (!data.dossiers || !data.dossiers.length) {
    html += '<div class="cc-empty" style="margin:4px 0;padding:12px;">' + t('cc.aucun_dossier_partenaire') + '</div>';
  } else {
    html += ccBuildDossierList(data.dossiers);
  }

  // 2. Coordonnées opérationnelles
  html += '<h4 class="cc-fiche-section">' + t('cc.coordonnees_ops') + '</h4>';
  html += '<div class="cc-fiche-fields">';
  html += ccFieldRow(t('cc.contact_nom'), 'contact_nom', o.contact_nom || '');
  html += ccFieldRow(t('cc.contact_fonction'), 'contact_fonction', o.contact_fonction || '');
  html += ccFieldRow(t('cc.contact_tel'), 'contact_telephone', o.contact_telephone || '');
  html += ccFieldRow(t('cc.contact_email'), 'contact_email', o.contact_email || '');
  if (o.telephone) html += '<div class="cc-fiche-static">' + t('cc.tel_standard') + ' : <a href="tel:' + o.telephone + '">' + o.telephone + '</a></div>';
  if (o.telephone_urgence) html += '<div class="cc-fiche-static">' + t('cc.urgence') + ' : <a href="tel:' + o.telephone_urgence + '">' + o.telephone_urgence + '</a></div>';
  if (o.site_web) html += '<div class="cc-fiche-static"><a href="' + escHtml(o.site_web) + '" target="_blank" rel="noopener">' + escHtml(o.site_web) + '</a></div>';
  html += '</div>';

  // 3. Directions en interface (multi-sélection)
  html += '<h4 class="cc-fiche-section">' + t('cc.directions_interface') + '</h4>';
  html += '<div class="cc-fiche-fields" id="cc-dirs-interface">';
  var selectedIds = dirsIf.map(function(d) { return d.direction_id; });
  var principalId = principal ? principal.direction_id : null;
  (_ccDirectionsList || []).forEach(function(d) {
    var checked = selectedIds.includes(d.id) ? ' checked' : '';
    var isPrincipal = d.id === principalId;
    var dNom = ccNom(d);
    html += '<div class="cc-dir-check">' +
      '<label><input type="checkbox" data-dir-id="' + d.id + '"' + checked + '> ' + escHtml(dNom) + '</label>' +
      '<label class="cc-radio-principal" title="' + t('cc.interlocuteur_principal') + '"><input type="radio" name="cc-principal" value="' + d.id + '"' + (isPrincipal ? ' checked' : '') + '> ★</label>' +
    '</div>';
  });
  html += '</div>';

  // Remarques
  html += '<div class="cc-fiche-fields" style="margin-top:8px;">';
  html += '<div class="cc-field"><label>' + t('cc.remarques') + '</label><textarea id="cc-f-remarques" class="cc-field-input" rows="2">' + escHtml(o.remarques || '') + '</textarea></div>';
  html += '</div>';

  // Bouton sauvegarder
  html += '<button class="cc-btn-action" style="margin-top:12px;" onclick="ccSavePartnerContact(' + o.id + ')">' + t('cc.enregistrer') + '</button>';

  // 4. Description (bas, repliée)
  if (desc) {
    html += '<details style="margin-top:12px;"><summary class="cc-partner-sector" style="cursor:pointer;">' + escHtml(o.secteur || '') + '</summary><p class="cc-partner-desc">' + escHtml(desc) + '</p></details>';
  }
  html += '</div>';
  ccShowPanel(html);
}

function ccFieldRow(label, field, value) {
  return '<div class="cc-field"><label>' + label + '</label><input type="text" id="cc-f-' + field + '" class="cc-field-input" value="' + escHtml(value) + '"></div>';
}

async function ccSavePartnerContact(id) {
  var body = {};
  ['contact_nom','contact_fonction','contact_telephone','contact_email','remarques'].forEach(function(f) {
    var el = document.getElementById('cc-f-' + f);
    if (el) body[f] = el.value;
  });
  // Directions en interface
  var directions = [];
  var principalVal = document.querySelector('input[name="cc-principal"]:checked');
  var principalId = principalVal ? Number(principalVal.value) : null;
  document.querySelectorAll('#cc-dirs-interface input[type="checkbox"]:checked').forEach(function(cb) {
    var dirId = Number(cb.dataset.dirId);
    directions.push({ direction_id: dirId, principal: dirId === principalId });
  });
  body.directions = directions;
  var res = await safeFetchJSON('/api/command-center/contact/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, true);
  if (res && res.ok) {
    showToast(t('cc.contact_sauvegarde'), 'success');
  } else {
    showToast(t('cc.erreur'), 'error');
  }
}

// ── Décisions en attente ──
function ccRenderDecisions(decisions) {
  var el = document.getElementById('cc-decisions');
  if (!el) return;
  var addBtn = _ccCanEdit ? '<button class="cc-btn-action" style="margin-bottom:8px;" onclick="ccCreateDecision()">' + t('cc.ajouter_decision') + '</button>' : '';
  if (!decisions.length) { el.innerHTML = addBtn + '<div class="cc-empty">' + t('cc.aucun_dossier') + '</div>'; return; }
  el.innerHTML = addBtn + decisions.map(function(d) {
    var titre = currentLang === 'ar' && d.titre_ar ? d.titre_ar : d.titre;
    var dir = currentLang === 'ar' && d.direction_ar ? d.direction_ar : (d.direction || '—');
    var jours = Math.max(1, Math.round((Date.now() - new Date(d.cree_le).getTime()) / 86400000));
    var badgeCls = d.priorite === 'haute' ? 'cc-badge-haute' : 'cc-badge-moyenne';
    var badgeLabel = d.priorite === 'haute' ? t('cc.priorite_haute') : t('cc.priorite_moyenne');
    return '<div class="cc-decision-row" onclick="ccShowDecision(' + d.id + ')">' +
      '<div>' +
        '<div class="cc-decision-title">' + escHtml(titre) + '</div>' +
        '<div class="cc-decision-meta">' +
          '<span>' + t('cc.propose_par') + ' : ' + escHtml(dir) + '</span>' +
          '<span>' + t('cc.anciennete') + ' : ' + ccLtr(jours) + ' ' + t('cc.jours') + '</span>' +
        '</div>' +
      '</div>' +
      '<span class="cc-badge-decision ' + badgeCls + '">' + badgeLabel + '</span>' +
    '</div>';
  }).join('');
  var btnDisabled = decisions.length <= 4;
  el.innerHTML += '<button class="' + (btnDisabled ? 'cc-btn-disabled' : 'cc-btn-action') + '"' + (btnDisabled ? ' disabled' : '') +
    ' style="margin-top:8px;">' + t('cc.voir_decisions') + '</button>';
}

var _ccDecisions = [];
function ccShowDecision(id) {
  if (!_ccDecisions.length) {
    safeFetchJSON('/api/command-center/overview?period=30d', {}, true).then(function(data) {
      _ccDecisions = data.pendingDecisions || [];
      _ccShowDecisionPanel(id);
    });
    return;
  }
  _ccShowDecisionPanel(id);
}
function _ccShowDecisionPanel(id) {
  var d = _ccDecisions.find(function(x) { return x.id === id; });
  if (!d) return;
  var titre = currentLang === 'ar' && d.titre_ar ? d.titre_ar : d.titre;
  var desc = currentLang === 'ar' && d.description_ar ? d.description_ar : (d.description || '');
  var dir = currentLang === 'ar' && d.direction_ar ? d.direction_ar : (d.direction || '—');
  var jours = Math.max(1, Math.round((Date.now() - new Date(d.cree_le).getTime()) / 86400000));
  var badgeCls = d.priorite === 'haute' ? 'cc-badge-haute' : 'cc-badge-moyenne';
  var badgeLabel = d.priorite === 'haute' ? t('cc.priorite_haute') : t('cc.priorite_moyenne');
  var html = '<div class="cc-panel-header"><h3>' + t('cc.decision_detail') + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += '<div style="padding:16px;">';
  html += '<div style="margin-bottom:12px;"><span class="cc-badge-decision ' + badgeCls + '">' + badgeLabel + '</span></div>';
  html += '<h4 style="margin:0 0 8px;">' + escHtml(titre) + '</h4>';
  html += '<p style="color:var(--gray-600);font-size:13px;margin:0 0 12px;">' + escHtml(desc) + '</p>';
  html += '<div class="cc-decision-meta" style="flex-direction:column;gap:4px;">';
  html += '<span>' + t('cc.propose_par') + ' : <strong>' + escHtml(dir) + '</strong></span>';
  html += '<span>' + t('cc.anciennete') + ' : ' + ccLtr(jours) + ' ' + t('cc.jours') + '</span>';
  html += '</div>';
  if (_ccCanEdit) {
    html += '<div style="margin-top:16px;display:flex;gap:8px;">';
    html += '<button class="cc-btn-action" onclick="ccEditDecision(' + d.id + ')">' + t('cc.modifier') + '</button>';
    html += '<button class="cc-btn-action" style="background:#7c3aed;color:#fff;" onclick="ccTrancherDecision(' + d.id + ')">' + t('cc.trancher') + '</button>';
    html += '</div>';
  }
  html += '</div>';
  ccShowPanel(html);
}

// ── CRUD Décisions ──
function ccCreateDecision() {
  if (!_ccDirectionsList) {
    safeFetchJSON('/api/command-center/directions-list', {}, true).then(function(dirs) {
      _ccDirectionsList = dirs;
      _ccShowDecisionForm();
    });
    return;
  }
  _ccShowDecisionForm();
}

function _ccShowDecisionForm(existing) {
  var d = existing || {};
  var html = '<div class="cc-panel-header"><h3>' + t(d.id ? 'cc.modifier' : 'cc.ajouter_decision') + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += '<div style="padding:16px;">';
  html += '<div class="cc-field" style="margin-bottom:10px;"><label>' + t('cc.intitule') + '</label><input type="text" id="cc-dec-titre" class="cc-field-input" value="' + escHtml(d.titre || '') + '"></div>';
  html += '<div class="cc-field" style="margin-bottom:10px;"><label>' + t('cc.description') + '</label><textarea id="cc-dec-desc" class="cc-field-input" rows="3">' + escHtml(d.description || '') + '</textarea></div>';
  html += '<div class="cc-field" style="margin-bottom:10px;"><label>' + t('cc.direction_concernee') + '</label><select id="cc-dec-dir" class="cc-field-input">';
  html += '<option value="">—</option>';
  (_ccDirectionsList || []).forEach(function(dir) {
    var sel = d.direction_id && Number(d.direction_id) === dir.id ? ' selected' : '';
    html += '<option value="' + dir.id + '"' + sel + '>' + escHtml(ccNom(dir)) + '</option>';
  });
  html += '</select></div>';
  html += '<div class="cc-field" style="margin-bottom:10px;"><label>' + t('cc.niveau') + '</label><select id="cc-dec-prio" class="cc-field-input">';
  html += '<option value="haute"' + (d.priorite === 'haute' ? ' selected' : '') + '>' + t('cc.priorite_haute') + '</option>';
  html += '<option value="moyenne"' + (d.priorite !== 'haute' ? ' selected' : '') + '>' + t('cc.priorite_moyenne') + '</option>';
  html += '</select></div>';
  html += '<button class="cc-btn-action" style="margin-top:8px;" onclick="ccSaveDecision(' + (d.id || 0) + ')">' + t('cc.enregistrer') + '</button>';
  html += '</div>';
  ccShowPanel(html);
}

async function ccSaveDecision(id) {
  var body = {
    titre: document.getElementById('cc-dec-titre').value,
    description: document.getElementById('cc-dec-desc').value,
    direction_id: document.getElementById('cc-dec-dir').value || null,
    priorite: document.getElementById('cc-dec-prio').value
  };
  if (!body.titre) return;
  var url = id ? '/api/command-center/decisions/' + id : '/api/command-center/decisions';
  var method = id ? 'PATCH' : 'POST';
  var res = await safeFetchJSON(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, true);
  if (res && res.ok) {
    showToast(t(id ? 'cc.decision_modifiee' : 'cc.decision_creee'), 'success');
    ccClosePanel();
    ccLoad();
  }
}

function ccEditDecision(id) {
  var d = _ccDecisions.find(function(x) { return x.id === id; });
  if (!d) return;
  if (!_ccDirectionsList) {
    safeFetchJSON('/api/command-center/directions-list', {}, true).then(function(dirs) {
      _ccDirectionsList = dirs;
      _ccShowDecisionForm(d);
    });
    return;
  }
  _ccShowDecisionForm(d);
}

function ccTrancherDecision(id) {
  ccClosePanel();
  showPromptModal(t('cc.trancher'), '', async function(note) {
    var res = await safeFetchJSON('/api/command-center/decisions/' + id + '/trancher', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note || null })
    }, true);
    if (res && res.ok) {
      showToast(t('cc.decision_tranchee'), 'success');
      ccLoad();
    }
  }, { textarea: true, desc: t('cc.note_trancher') });
}

// ── CRUD Briefing ──
function ccCreateBriefing() { _ccShowBriefingForm(); }

function _ccShowBriefingForm(existing) {
  var b = existing || {};
  var html = '<div class="cc-panel-header"><h3>' + t(b.id ? 'cc.modifier' : 'cc.ajouter_briefing') + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += '<div style="padding:16px;">';
  html += '<div class="cc-field" style="margin-bottom:10px;"><label>' + t('cc.heure') + '</label><input type="text" id="cc-br-heure" class="cc-field-input" value="' + escHtml(b.heure || '09:00') + '" placeholder="HH:MM"></div>';
  html += '<div class="cc-field" style="margin-bottom:10px;"><label>' + t('cc.intitule') + '</label><input type="text" id="cc-br-titre" class="cc-field-input" value="' + escHtml(b.titre || '') + '"></div>';
  html += '<div class="cc-field" style="margin-bottom:10px;"><label>' + t('cc.description') + '</label><textarea id="cc-br-desc" class="cc-field-input" rows="2">' + escHtml(b.contenu || '') + '</textarea></div>';
  html += '<button class="cc-btn-action" style="margin-top:8px;" onclick="ccSaveBriefing(' + (b.id || 0) + ')">' + t('cc.enregistrer') + '</button>';
  html += '</div>';
  ccShowPanel(html);
}

async function ccSaveBriefing(id) {
  var body = {
    titre: document.getElementById('cc-br-titre').value,
    contenu: document.getElementById('cc-br-desc').value,
    heure: document.getElementById('cc-br-heure').value
  };
  if (!body.titre) return;
  var url = id ? '/api/command-center/briefings/' + id : '/api/command-center/briefings';
  var method = id ? 'PATCH' : 'POST';
  var res = await safeFetchJSON(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, true);
  if (res && res.ok) {
    showToast(t(id ? 'cc.briefing_modifie' : 'cc.briefing_cree'), 'success');
    ccClosePanel();
    ccLoad();
  }
}

async function ccDeleteBriefing(id) {
  var res = await safeFetchJSON('/api/command-center/briefings/' + id, { method: 'DELETE' }, true);
  if (res && res.ok) {
    showToast(t('cc.briefing_supprime'), 'success');
    ccClosePanel();
    ccLoad();
  }
}

// ── Briefing du jour ──
function ccRenderBriefing(briefing) {
  var el = document.getElementById('cc-briefing');
  if (!el) return;
  var items = briefing.items || [];
  var addBtn = _ccCanEdit ? '<button class="cc-btn-action" style="margin-bottom:8px;" onclick="ccCreateBriefing()">' + t('cc.ajouter_briefing') + '</button>' : '';
  if (!items.length) { el.innerHTML = addBtn + '<div class="cc-empty">' + t('cc.activite_vide') + '</div>'; return; }
  var typeIcons = { reunion: '🤝', visite: '📍', point_presse: '🎙' };
  el.innerHTML = addBtn + items.map(function(b) {
    var titre = currentLang === 'ar' && b.titre_ar ? b.titre_ar : b.titre;
    var contenu = currentLang === 'ar' && b.contenu_ar ? b.contenu_ar : (b.contenu || '');
    var icon = typeIcons[b.type] || '📋';
    return '<div class="cc-briefing-row" onclick="ccShowBriefingDetail(' + b.id + ')">' +
      '<div class="cc-briefing-heure" dir="ltr">' + escHtml(b.heure || '') + '</div>' +
      '<div class="cc-briefing-body">' +
        '<div class="cc-briefing-title">' + icon + ' ' + escHtml(titre) + '</div>' +
        (contenu ? '<div class="cc-briefing-type">' + escHtml(contenu.substring(0, 80)) + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
  el.innerHTML += '<button class="cc-btn-action" style="margin-top:8px;" onclick="ccExportBriefing()">' + t('cc.exporter_briefing') + '</button>';
}

var _ccBriefingItems = [];
function ccShowBriefingDetail(id) {
  if (!_ccBriefingItems.length) {
    safeFetchJSON('/api/command-center/overview?period=30d', {}, true).then(function(data) {
      _ccBriefingItems = (data.dailyBriefing || {}).items || [];
      _ccShowBriefingPanel(id);
    });
    return;
  }
  _ccShowBriefingPanel(id);
}
function _ccShowBriefingPanel(id) {
  var b = _ccBriefingItems.find(function(x) { return x.id === id; });
  if (!b) return;
  var titre = currentLang === 'ar' && b.titre_ar ? b.titre_ar : b.titre;
  var contenu = currentLang === 'ar' && b.contenu_ar ? b.contenu_ar : (b.contenu || '');
  var html = '<div class="cc-panel-header"><h3>' + escHtml(titre) + '</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += '<div style="padding:16px;">';
  html += '<div style="font-size:12px;color:var(--muted);margin-bottom:8px;" dir="ltr">' + escHtml(b.heure || '') + '</div>';
  html += '<p style="font-size:13px;color:var(--gray-700);margin:0;">' + escHtml(contenu) + '</p>';
  if (_ccCanEdit) {
    html += '<div style="margin-top:16px;display:flex;gap:8px;">';
    html += '<button class="cc-btn-action" onclick="_ccShowBriefingForm({id:' + b.id + ',titre:\'' + escHtml(b.titre || '').replace(/'/g,'\\x27') + '\',contenu:\'' + escHtml(b.contenu || '').replace(/'/g,'\\x27') + '\',heure:\'' + escHtml(b.heure || '') + '\'})">' + t('cc.modifier') + '</button>';
    html += '<button class="cc-btn-action" style="background:var(--red);color:#fff;" onclick="ccDeleteBriefing(' + b.id + ')">' + t('cc.supprimer_briefing') + '</button>';
    html += '</div>';
  }
  html += '</div>';
  ccShowPanel(html);
}

function ccExportBriefing() {
  // Fetch PDF with auth and open as blob
  apiFetch('/api/command-center/briefing-pdf?lang=' + currentLang).then(function(r) {
    return r.blob();
  }).then(function(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'briefing_' + new Date().toISOString().slice(0,10) + '.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }).catch(function() { showToast(t('cc.erreur'), 'error'); });
}

// ── Activité récente ──
function ccRenderActivity(activity) {
  var el = document.getElementById('cc-activity');
  if (!el) return;
  if (!activity.length) { el.innerHTML = '<div class="cc-empty">' + t('cc.activite_vide') + '</div>'; return; }
  el.innerHTML = activity.map(function(a) {
    var ago = Math.round((Date.now() - new Date(a.le).getTime()) / 60000);
    var agoStr = ago >= 60 ? ccLtr(Math.round(ago / 60)) + t('cc.heures') : ccLtr(ago) + t('cc.minutes');
    var actionLabels = { creation: '📥', prise_en_charge: '👤', transmission: '📤', intervention: '🔧', compte_rendu: '📝', validation: '✅', resolution: '🎯', commentaire: '💬', cloture: '🔒' };
    var icon = actionLabels[a.action] || '📌';
    var desc = (a.agent_prenom || '') + ' — ' + (a.action || '').replace(/_/g, ' ');
    if (a.etat) desc += ' → ' + a.etat.replace(/_/g, ' ');
    return '<div class="cc-activity-item">' +
      '<div class="cc-activity-time">' + t('cc.il_y_a') + ' ' + agoStr + '</div>' +
      '<div class="cc-activity-desc">' + icon + ' ' + escHtml(desc) + '</div>' +
      (a.reference ? '<div class="cc-activity-ref" onclick="boOpenSignalement(\'' + escHtml(a.reference) + '\')">' + escHtml(a.reference) + '</div>' : '') +
    '</div>';
  }).join('');
}

// ── Voir toutes les communes ──
async function ccShowAllCommunes() {
  var data = await safeFetchJSON('/api/command-center/detail/communes/0', {}, true);
  if (!data || !data.rows) return;
  var title = t('cc.apc');
  var html = '<div class="cc-panel-header"><h3>' + title + ' (' + ccLtr(data.rows.length) + ')</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += '<div class="cc-panel-list">' + data.rows.map(function(r) {
    var nom = currentLang === 'ar' && r.nom_ar ? r.nom_ar : r.nom;
    var count = parseInt(r.incidents) || 0;
    var clickable = count > 0;
    var cls = clickable ? 'cc-panel-row cc-clickable' : 'cc-panel-row';
    var onclick = clickable ? ' onclick="ccDrillCommuneIncidents(' + r.id + ',\'' + escHtml(nom).replace(/'/g,'\\x27') + '\',null,null)"' : '';
    return '<div class="' + cls + '"' + onclick + '><span>' + escHtml(nom) + '</span><span class="cc-badge-count" dir="ltr">' + count + '</span></div>';
  }).join('') + '</div>';
  ccShowPanel(html);
}

function ccMapDrillRefs(nom, refs) {
  if (!refs || !refs.length) return;
  var rows = refs.map(function(ref) {
    var inc = _ccMapData.find(function(i) { return i.reference === ref; });
    return inc ? { reference: inc.reference, commune: inc.commune || '', etat: inc.etat || '', slaMin: 0 } : { reference: ref, commune: '', etat: '', slaMin: 0 };
  });
  var html = '<div class="cc-panel-header"><h3>' + escHtml(nom) + ' (' + rows.length + ')</h3><button class="cc-panel-close" onclick="ccClosePanel()">✕</button></div>';
  html += ccBuildDossierList(rows);
  ccShowPanel(html);
}

function ccShowPanel(html) {
  var panel = document.getElementById('cc-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'cc-panel';
    panel.className = 'cc-panel';
    document.getElementById('cc-content').appendChild(panel);
  }
  panel.innerHTML = html;
  panel.classList.add('cc-panel-open');
  var overlay = document.getElementById('cc-panel-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cc-panel-overlay';
    overlay.className = 'cc-panel-overlay';
    overlay.onclick = ccClosePanel;
    document.getElementById('cc-content').appendChild(overlay);
  }
  overlay.classList.add('cc-panel-open');
}

function ccClosePanel() {
  var panel = document.getElementById('cc-panel');
  if (panel) panel.classList.remove('cc-panel-open');
  var overlay = document.getElementById('cc-panel-overlay');
  if (overlay) overlay.classList.remove('cc-panel-open');
}

function ccRenderPriorities(priorities) {
  _ccAllPriorities = priorities;
  var el = document.getElementById('cc-priorities');
  if (!el) return;
  if (!priorities.length) { el.innerHTML = '<div class="cc-empty">' + t('cc.aucune_priorite') + '</div>'; return; }
  ccRenderPriorityRows(el, priorities);
}

function ccRenderPriorityRows(el, list) {
  el.innerHTML = list.map(function(p) {
    var severity = p.criticite === 'danger_immediat' ? 'critique' : (p.slaDepassementMinutes > 0 ? 'eleve' : 'maitrise');
    var slaText = p.slaDepassementMinutes > 0 ? '<span dir="ltr">+' + Math.round(p.slaDepassementMinutes / 60) + 'h</span>' : t('cc.dans_delai');
    var pPilote = currentLang === 'ar' && p.directionPiloteAr ? p.directionPiloteAr : p.directionPilote;
    var pExec = currentLang === 'ar' && p.executantAr ? p.executantAr : p.executant;
    var urgBadge = p.urgence_wali ? ' <span style="background:#fef2f2;color:#EF4444;padding:1px 6px;border-radius:6px;font-size:9px;font-weight:700;">🚨 URGENCE</span>' : '';
    var refSafe = escHtml(p.reference).replace(/'/g,'\\x27');
    return '<div class="cc-priority-row cc-severity-' + severity + '" onclick="boOpenSignalement(\'' + refSafe + '\')">' +
      '<div class="cc-priority-body">' +
        '<div class="cc-priority-title">' + escHtml(p.titre || p.reference) + urgBadge + '</div>' +
        '<div class="cc-priority-meta">' +
          '<span>' + escHtml(p.commune || '—') + ' · ' + escHtml(pPilote || '—') + '</span>' +
          '<span class="cc-sla-badge cc-sla-' + severity + '">' + slaText + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="cc-priority-actions" style="position:relative;">' +
        '<button class="cc-btn-open" onclick="event.stopPropagation();boOpenSignalement(\'' + refSafe + '\')" title="' + t('cc.ouvrir') + '">↗</button>' +
        '<button class="cc-btn-more" onclick="event.stopPropagation();ccTogglePrioMenu(this,\'' + refSafe + '\')">⋯</button>' +
        '<div class="cc-priority-menu">' +
          '<button class="cc-priority-menu-item" onclick="event.stopPropagation();ccAddNote(\'' + refSafe + '\')">' + t('cc.ajouter_note') + '</button>' +
          '<button class="cc-priority-menu-item disabled" title="' + t('cc.bientot') + '">' + t('cc.escalader') + '</button>' +
          '<button class="cc-priority-menu-item disabled" title="' + t('cc.bientot') + '">' + t('cc.relancer') + '</button>' +
          '<button class="cc-priority-menu-item disabled" title="' + t('cc.bientot') + '">' + t('cc.affecter') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="cc-priority-chevron">›</div>' +
    '</div>';
  }).join('');
}

function ccTogglePrioMenu(btn, ref) {
  var menu = btn.parentElement.querySelector('.cc-priority-menu');
  var wasOpen = menu.classList.contains('open');
  // Close all menus
  document.querySelectorAll('.cc-priority-menu.open').forEach(function(m) { m.classList.remove('open'); });
  if (!wasOpen) menu.classList.add('open');
}

function ccAddNote(reference) {
  document.querySelectorAll('.cc-priority-menu.open').forEach(function(m) { m.classList.remove('open'); });
  showPromptModal(t('cc.ajouter_note'), '', async function(note) {
    if (!note || !note.trim()) return;
    // Find signalement ID
    var data = await safeFetchJSON('/api/signaler/board?reference=' + encodeURIComponent(reference), {}, true);
    var items = Array.isArray(data) ? data : [];
    var s = items.find(function(x) { return x.reference === reference; });
    if (!s) { showToast(t('cc.aucun_dossier'), 'error'); return; }
    var res = await safeFetchJSON('/api/signaler/board/' + s.id + '/commentaire', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentaire: note.trim(), type: 'message' })
    }, true);
    if (res && res.ok) showToast(t('cc.note_ajoutee'), 'success');
    else showToast(t('cc.erreur'), 'error');
  }, { textarea: true, desc: t('cc.note_placeholder') });
}
document.addEventListener('click', function(e) {
  if (!e.target.closest('.cc-btn-more') && !e.target.closest('.cc-priority-menu')) {
    document.querySelectorAll('.cc-priority-menu.open').forEach(function(m) { m.classList.remove('open'); });
  }
});

// ═══ CC MOBILE — navigation basse + interactions ═══

var _ccMobileTab = 'pilotage';

function ccIsCCProfile() {
  return currentUser && (currentUser.role === 'admin_wilaya' || currentUser.fonction === 'cabinet' ||
    (currentUser.fonction === 'superviseur' && hasNiveau('wilaya')));
}

function ccUpdateMobileNav(viewName) {
  var ccBnav = document.getElementById('cc-bottom-nav');
  if (!ccBnav) return;
  var show = viewName === 'command-center' && ccIsCCProfile() && window.innerWidth <= 768;
  ccBnav.style.display = show ? '' : 'none';
  if (show) {
    document.body.classList.add('cc-mob-tabs');
    ccMobileTab(_ccMobileTab);
  } else {
    document.body.classList.remove('cc-mob-tabs');
    // Show all sections when not in mobile CC
    document.querySelectorAll('[data-cc-section]').forEach(function(s) { s.classList.remove('cc-sec-vis'); });
  }
}

window.addEventListener('resize', function() {
  var ccView = document.getElementById('view-command-center');
  if (!ccView) return;
  var isActive = !ccView.classList.contains('hidden') && ccView.style.display !== 'none';
  if (isActive) ccUpdateMobileNav('command-center');
  else ccUpdateMobileNav('');
});

function ccMobileTab(tab) {
  _ccMobileTab = tab;
  // Active state on nav
  document.querySelectorAll('.cc-bnav-item').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.ccTab === tab);
  });
  document.body.classList.add('cc-mob-tabs');
  // Show/hide sections
  document.querySelectorAll('[data-cc-section]').forEach(function(sec) {
    var secTab = sec.dataset.ccSection;
    if (tab === 'alertes') {
      // Alertes = priorities (pilotage priorities section) with all rows visible
      sec.classList.toggle('cc-sec-vis', secTab === 'pilotage');
    } else if (tab === 'plus') {
      sec.classList.toggle('cc-sec-vis', secTab === 'plus');
    } else {
      sec.classList.toggle('cc-sec-vis', secTab === tab);
    }
  });
  // Alertes: show all priority rows (override nth-child hiding)
  if (tab === 'alertes') {
    document.querySelectorAll('.cc-priority-row').forEach(function(r) { r.style.display = ''; });
  } else {
    document.querySelectorAll('.cc-priority-row').forEach(function(r) { r.style.display = ''; });
  }
  // Plus: render the menu
  if (tab === 'plus') ccRenderPlusMenu();
  // Carte: invalidate map + recentrer sur Alger (la carte initialisée dans un conteneur masqué perd son centre)
  if (tab === 'carte' && _ccMap) setTimeout(function() { _ccMap.invalidateSize(); _ccMap.setView([36.7538, 3.0588], 11); }, 300);
  // Scroll to top
  var ccContent = document.getElementById('cc-content');
  if (ccContent) ccContent.scrollTop = 0;
  window.scrollTo(0, 0);
}

// ── Plus menu ──
function ccRenderPlusMenu() {
  var el = document.getElementById('cc-plus-menu-section');
  if (!el || el.querySelector('.cc-plus-menu')) return;
  el.innerHTML = '<div class="cc-plus-menu">' +
    '<button class="cc-plus-item" onclick="ccMobilePlusView(\'plus-epics\')">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' +
      t('cc.epic_autres_titre') + '</button>' +
    '<button class="cc-plus-item" onclick="ccMobilePlusView(\'plus-partenaires\')">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
      t('cc.partenaires_titre') + '</button>' +
    '<button class="cc-plus-item" onclick="ccMobilePlusView(\'plus-decisions\')">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/></svg>' +
      t('cc.decisions_titre') + '</button>' +
    '<button class="cc-plus-item" onclick="ccMobilePlusView(\'plus-briefing\')">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>' +
      t('cc.briefing_titre') + '</button>' +
    '<button class="cc-plus-item" onclick="ccMobilePlusView(\'plus-activite\')">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
      t('cc.activite_titre') + '</button>' +
  '</div>';
}

function ccMobilePlusView(section) {
  // Show only this section + a back button
  document.querySelectorAll('[data-cc-section]').forEach(function(s) {
    s.classList.toggle('cc-sec-vis', s.dataset.ccSection === section);
  });
  // Add back button at top of the section
  var sec = document.querySelector('[data-cc-section="' + section + '"]');
  if (sec && !sec.querySelector('.cc-mob-back')) {
    var btn = document.createElement('button');
    btn.className = 'cc-mob-back';
    btn.innerHTML = '← ' + t('cc.tab_plus');
    btn.onclick = function() { ccMobileTab('plus'); };
    sec.insertBefore(btn, sec.firstChild);
  }
  window.scrollTo(0, 0);
}

// ── Priorities fullscreen drawer ──
function ccMobilePrioritiesDrawer() {
  var existing = document.getElementById('cc-prio-drawer');
  if (existing) { existing.style.transform = 'translateY(0)'; return; }
  var drawer = document.createElement('div');
  drawer.id = 'cc-prio-drawer';
  drawer.style.cssText = 'position:fixed;inset:0;background:white;z-index:1100;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .25s ease;';
  drawer.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--cc-border);min-height:44px;">' +
      '<h3 style="margin:0;font-size:16px;font-weight:700;">' + t('cc.priorites_titre') + '</h3>' +
      '<button onclick="ccMobilePrioritiesClose()" style="border:none;background:none;font-size:20px;cursor:pointer;padding:8px;min-width:44px;min-height:44px;">✕</button>' +
    '</div>' +
    '<div id="cc-prio-drawer-body" style="flex:1;overflow-y:auto;padding:12px;"></div>';
  document.body.appendChild(drawer);
  var body = document.getElementById('cc-prio-drawer-body');
  ccRenderPriorityRows(body, _ccAllPriorities);
  // Show all rows (override mobile nth-child)
  body.querySelectorAll('.cc-priority-row').forEach(function(r) { r.style.display = ''; });
  requestAnimationFrame(function() { drawer.style.transform = 'translateY(0)'; });
}

function ccMobilePrioritiesClose() {
  var drawer = document.getElementById('cc-prio-drawer');
  if (drawer) {
    drawer.style.transform = 'translateY(100%)';
    setTimeout(function() { drawer.remove(); }, 300);
  }
}

// ── Map fullscreen (with safe re-parenting) ──
var _ccMapOrigParent = null;

function ccMapFullscreenOpen() {
  var overlay = document.getElementById('cc-map-fullscreen');
  var mapEl = document.getElementById('cc-map');
  if (!overlay || !mapEl || !_ccMap) return;
  // Store original parent
  _ccMapOrigParent = mapEl.parentNode;
  // Move map to fullscreen container
  var fsContainer = document.getElementById('cc-map-fs-container');
  fsContainer.appendChild(mapEl);
  mapEl.style.height = '100%';
  mapEl.style.borderRadius = '0';
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Clone filters
  var fsFilters = document.getElementById('cc-map-fs-filters');
  var origFilters = document.getElementById('cc-map-filters');
  if (fsFilters && origFilters) fsFilters.innerHTML = origFilters.innerHTML;
  setTimeout(function() { _ccMap.invalidateSize(); setTimeout(function() { _ccMap.setView([36.7538, 3.0588], 11); }, 100); }, 200);
}

function ccMapFullscreenClose() {
  var overlay = document.getElementById('cc-map-fullscreen');
  if (overlay) overlay.classList.add('hidden');
  // Move map back to original container
  var mapEl = document.getElementById('cc-map');
  if (_ccMapOrigParent && mapEl) {
    _ccMapOrigParent.insertBefore(mapEl, _ccMapOrigParent.firstChild);
    mapEl.style.height = window.innerWidth <= 768 ? '240px' : '400px';
    mapEl.style.borderRadius = 'var(--radius-md)';
    setTimeout(function() { if (_ccMap) { _ccMap.invalidateSize(); setTimeout(function() { _ccMap.setView([36.7538, 3.0588], 11); }, 100); } }, 200);
  }
  document.body.style.overflow = '';
}

