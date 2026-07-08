/**
 * Email Service — ALGERNA
 * SMTP via club@capcowork.co
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.capcowork.co',
  port: 587,
  secure: false,
  auth: {
    user: 'club@capcowork.co',
    pass: 'Club@@2026',
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

// FROM sans caracteres speciaux (tiret long, apostrophe) — reduit score spam
const FROM = '"ALGERNA Plateforme Citoyenne" <club@capcowork.co>';
const UNSUBSCRIBE = '<mailto:club@capcowork.co?subject=desabonnement>';

function baseHeaders() {
  return {
    'List-Unsubscribe': UNSUBSCRIBE,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'Precedence': 'transactional',
    'X-Entity-Ref-ID': `algerna-${Date.now()}`,
  };
}

/**
 * Email de bienvenue a l'inscription (avec code de confirmation)
 */
async function sendWelcomeEmail(email, prenom, code) {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `[ALGERNA] Votre code de confirmation : ${code}`,
      headers: baseHeaders(),
      text: `Bonjour${prenom ? ' ' + prenom : ''},\n\nVotre compte ALGERNA a ete cree.\n\nCode de confirmation : ${code}\n\nCe code expire dans 30 minutes.\nSi vous n'avez pas cree de compte, ignorez ce message.\n\n--\nALGERNA - Plateforme citoyenne de la Wilaya d'Alger\ncontact@wilaya-alger.dz`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <tr><td style="background:#063B5A;padding:24px;text-align:center;">
        <p style="margin:0;font-size:22px;font-weight:700;color:white;letter-spacing:1px;">ALGERNA</p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Plateforme citoyenne - Wilaya d'Alger</p>
      </td></tr>
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#063B5A;">Bonjour${prenom ? ' ' + prenom : ''} !</p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">Votre compte ALGERNA a ete cree. Entrez ce code pour activer votre compte :</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:8px 0 24px;">
            <div style="display:inline-block;background:#f0f4ff;border:2px solid #3b5bdb;border-radius:10px;padding:18px 36px;font-size:32px;font-weight:800;letter-spacing:6px;color:#3b5bdb;font-family:monospace;">${code}</div>
          </td></tr>
        </table>
        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">Ce code expire dans <strong>30 minutes</strong>. Si vous n'avez pas cree de compte sur ALGERNA, ignorez ce message.</p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">ALGERNA - Plateforme citoyenne de la Wilaya d'Alger | contact@wilaya-alger.dz</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
    return { ok: true };
  } catch (e) {
    console.warn('[emailService] sendWelcomeEmail failed:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Email de confirmation (apres validation du code)
 */
async function sendConfirmationEmail(email, prenom) {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: '[ALGERNA] Votre compte est active',
      headers: baseHeaders(),
      text: `Bonjour${prenom ? ' ' + prenom : ''},\n\nVotre compte ALGERNA est maintenant active.\n\nConnectez-vous sur : https://civismart.pylcom.app\n\nServices disponibles :\n- Je signale : problemes sur l'espace public\n- Mes demarches : rendez-vous en ligne\n- Ma Houma : equipements autour de vous\n- Mon suivi : avancement de vos signalements\n\n--\nALGERNA - Plateforme citoyenne de la Wilaya d'Alger\ncontact@wilaya-alger.dz`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <tr><td style="background:#063B5A;padding:24px;text-align:center;">
        <p style="margin:0;font-size:22px;font-weight:700;color:white;letter-spacing:1px;">ALGERNA</p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Plateforme citoyenne - Wilaya d'Alger</p>
      </td></tr>
      <tr><td style="padding:32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:36px;">&#10003;</p>
        <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#063B5A;">Compte active${prenom ? ', ' + prenom : ''} !</p>
        <p style="margin:0 0 28px;font-size:14px;color:#475569;">Votre compte est pret. Decouvrez vos services citoyens :</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="text-align:left;margin-bottom:28px;">
          <tr><td style="padding:9px 0;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9;">&#128681; <strong>Je signale</strong> &mdash; Problemes sur l'espace public</td></tr>
          <tr><td style="padding:9px 0;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9;">&#128197; <strong>Mes demarches</strong> &mdash; Rendez-vous en ligne</td></tr>
          <tr><td style="padding:9px 0;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9;">&#128205; <strong>Ma Houma</strong> &mdash; Equipements autour de vous</td></tr>
          <tr><td style="padding:9px 0;font-size:14px;color:#334155;">&#128203; <strong>Mon suivi</strong> &mdash; Avancement de vos signalements</td></tr>
        </table>
        <a href="https://civismart.pylcom.app" style="display:inline-block;background:#063B5A;color:white;text-decoration:none;padding:13px 36px;border-radius:8px;font-size:15px;font-weight:700;">Acceder a mon espace</a>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">ALGERNA - Plateforme citoyenne de la Wilaya d'Alger | contact@wilaya-alger.dz</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
    return { ok: true };
  } catch (e) {
    console.warn('[emailService] sendConfirmationEmail failed:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Email de campagne (alertes/newsletters par quartier)
 */
async function sendCampaignEmail(recipients, subject, htmlBody, campaignType) {
  const results = { sent: 0, failed: 0, errors: [] };
  for (const r of recipients) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: r.email,
        subject: subject,
        headers: baseHeaders(),
        text: `ALGERNA - ${campaignType === 'alert' ? 'Alerte' : 'Communique'}\n\n${htmlBody.replace(/<[^>]+>/g, '')}\n\n--\nALGERNA - Plateforme citoyenne de la Wilaya d'Alger`,
        html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <tr><td style="background:#063B5A;padding:16px 24px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:white;">ALGERNA - ${campaignType === 'alert' ? 'Alerte' : 'Communique'}</p>
      </td></tr>
      <tr><td style="padding:24px;">${htmlBody}</td></tr>
      <tr><td style="background:#f8fafc;padding:16px 24px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Vous recevez ce message car vous etes inscrit sur ALGERNA.<br>contact@wilaya-alger.dz</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
      });
      results.sent++;
    } catch (e) {
      results.failed++;
      results.errors.push({ email: r.email, error: e.message });
    }
  }
  return results;
}

/**
 * Test de connexion SMTP
 */
async function testConnection() {
  try {
    await transporter.verify();
    return { ok: true, message: 'SMTP connecte' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { sendWelcomeEmail, sendConfirmationEmail, sendCampaignEmail, testConnection };
