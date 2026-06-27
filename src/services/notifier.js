/**
 * Service de notification multi-canal.
 *
 * Canal email : actif si SMTP configuré (SMTP_HOST + SMTP_USER).
 * Canal SMS   : préparé, inactif — phase 2 (fournisseur algérien).
 *
 * RÈGLE : ne JAMAIS bloquer le flux principal si l'envoi échoue.
 * Toutes les fonctions sont fire-and-forget.
 */
const nodemailer = require('nodemailer');
const config = require('../config');

// ── Transport SMTP (lazy init) ──
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!config.smtp.enabled) return null;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  return transporter;
}

/**
 * Envoie un email. Ne plante jamais — loggue et continue.
 */
async function sendEmail(to, subject, html) {
  const t = getTransporter();
  if (!t) {
    console.log('[notifier] SMTP non configuré — email non envoyé à', to);
    return false;
  }
  try {
    await t.sendMail({ from: config.smtp.from, to, subject, html });
    console.log('[notifier] Email envoyé à', to, ':', subject);
    return true;
  } catch (e) {
    console.warn('[notifier] Échec envoi email à', to, ':', e.message);
    return false;
  }
}

/**
 * Envoie un SMS. Phase 2 — loggue et retourne false.
 * @param {string} phone - numéro de téléphone
 * @param {string} body  - corps du message
 */
async function sendSMS(phone, body) {
  if (!config.sms.enabled) {
    console.log('[notifier] SMS non configuré — message non envoyé à', phone);
    return false;
  }
  // Phase 2 : intégrer un fournisseur algérien (Mobilis, Djezzy Business, etc.)
  // Exemple :
  //   const provider = require('./sms-providers/' + config.sms.provider);
  //   return provider.send(config.sms.apiKey, config.sms.from, phone, body);
  console.log('[notifier] SMS provider', config.sms.provider, '— envoi non implémenté (phase 2)');
  return false;
}

/**
 * Notification unifiée. Fire-and-forget.
 * @param {object} opts
 * @param {string} opts.email - adresse email (si dispo)
 * @param {string} opts.phone - numéro tel (si dispo)
 * @param {string} opts.subject - sujet email
 * @param {string} opts.html - corps email HTML
 * @param {string} opts.smsBody - corps SMS (texte court)
 */
function notify({ email, phone, subject, html, smsBody }) {
  if (email) sendEmail(email, subject, html).catch(() => {});
  if (phone && smsBody) sendSMS(phone, smsBody).catch(() => {});
}

// ── Templates email ──

const HEADER = `<div style="background:#0A3D62;padding:16px 20px;text-align:center;">
  <span style="color:white;font-size:18px;font-weight:700;font-family:Inter,sans-serif;">ALGERNA</span>
</div>`;
const FOOTER = `<div style="padding:12px 20px;text-align:center;font-size:11px;color:#9ca3af;font-family:Inter,sans-serif;">
  Wilaya d'Alger — Gouvernance civique numérique<br>
  <a href="https://civismart.pylcom.app" style="color:#0A3D62;">civismart.pylcom.app</a>
</div>`;

function emailCreation({ reference, categorie, commune, date, lat, lng }) {
  return `<div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    ${HEADER}
    <div style="padding:20px;">
      <h2 style="color:#1FA463;margin:0 0 8px;">Signalement transmis</h2>
      <p style="color:#374151;margin:0 0 16px;">Votre signalement a bien été enregistré. Vous serez notifié dès qu'il sera traité.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#6b7280;">Référence</td><td style="padding:6px 0;font-weight:700;color:#0A3D62;">#${reference}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Type</td><td style="padding:6px 0;">${categorie}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Commune</td><td style="padding:6px 0;">${commune || '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;">${date}</td></tr>
        ${lat ? `<tr><td style="padding:6px 0;color:#6b7280;">Position</td><td style="padding:6px 0;">${lat}, ${lng}</td></tr>` : ''}
      </table>
    </div>
    ${FOOTER}
  </div>`;
}

function emailResolution({ reference, message, preuvePath }) {
  return `<div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    ${HEADER}
    <div style="padding:20px;">
      <h2 style="color:#1FA463;margin:0 0 8px;">Problème résolu !</h2>
      <p style="color:#374151;margin:0 0 16px;">${message}</p>
      <p style="color:#6b7280;font-size:13px;">Référence : <strong style="color:#0A3D62;">#${reference}</strong></p>
      ${preuvePath ? `<p style="color:#6b7280;font-size:13px;">Une photo preuve a été jointe au dossier.</p>` : ''}
      <div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;">
        <p style="color:#1FA463;font-weight:600;margin:0;">+20 points d'impact</p>
        <p style="color:#6b7280;font-size:12px;margin:4px 0 0;">Votre signalement a eu un impact concret.</p>
      </div>
    </div>
    ${FOOTER}
  </div>`;
}

module.exports = { notify, sendEmail, sendSMS, emailCreation, emailResolution };
