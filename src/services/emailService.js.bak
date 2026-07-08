/**
 * Email Service — ALGERNA
 * SMTP via Postfix local (102.220.x.62 port 25)
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 25,
  secure: false,
  tls: { rejectUnauthorized: false },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
});

const FROM = '"ALGERNA — Wilaya d\'Alger" <noreply@civismart.pylcom.app>';

/**
 * Email de bienvenue à l'inscription (avec code de confirmation)
 */
async function sendWelcomeEmail(email, prenom, code) {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Bienvenue sur ALGERNA — Confirmez votre inscription',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <div style="background:#063B5A;color:white;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:22px;">ALGERNA</h1>
            <p style="margin:4px 0 0;font-size:13px;opacity:0.8;">Wilaya d'Alger — Plateforme citoyenne</p>
          </div>
          <div style="background:white;border:1px solid #e0e7ed;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
            <h2 style="color:#063B5A;margin:0 0 12px;">Bienvenue${prenom ? ', ' + prenom : ''} !</h2>
            <p style="color:#334155;line-height:1.6;">Votre compte ALGERNA a été créé. Pour activer votre compte, utilisez le code ci-dessous :</p>
            <div style="text-align:center;margin:20px 0;">
              <div style="display:inline-block;background:#F5F3FF;border:2px solid #7C3AED;border-radius:12px;padding:16px 32px;font-size:28px;font-weight:800;letter-spacing:4px;color:#7C3AED;">${code}</div>
            </div>
            <p style="color:#64748B;font-size:13px;line-height:1.6;">Ce code est valable 30 minutes. Si vous n'avez pas créé de compte, ignorez ce message.</p>
            <hr style="border:none;border-top:1px solid #e0e7ed;margin:20px 0;">
            <p style="color:#94a3b8;font-size:11px;text-align:center;">ALGERNA — Wilaya d'Alger<br>contact@wilaya-alger.dz</p>
          </div>
        </div>
      `,
    });
    return { ok: true };
  } catch (e) {
    console.warn('[emailService] sendWelcomeEmail failed:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Email de confirmation (après validation du code)
 */
async function sendConfirmationEmail(email, prenom) {
  const svc = (icon, title, desc) => `
    <tr><td style="padding:6px 0;vertical-align:top;width:32px;font-size:20px;">${icon}</td>
    <td style="padding:6px 0 6px 10px;"><strong style="color:#063B5A;">${title}</strong><br><span style="color:#64748B;font-size:12px;">${desc}</span></td></tr>`;

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Bienvenue sur ALGERNA — Votre compte est activé',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <div style="background:#063B5A;color:white;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:22px;">Bienvenue sur ALGERNA</h1>
            <p style="margin:4px 0 0;font-size:13px;opacity:0.8;">Wilaya d'Alger — Plateforme citoyenne</p>
          </div>
          <div style="background:white;border:1px solid #e0e7ed;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
            <div style="text-align:center;margin-bottom:16px;font-size:40px;">✅</div>
            <h2 style="color:#063B5A;margin:0 0 8px;text-align:center;">Compte activé${prenom ? ', ' + prenom : ''} !</h2>
            <p style="color:#334155;line-height:1.6;text-align:center;margin-bottom:20px;">Votre compte est prêt. Découvrez vos services citoyens :</p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;line-height:1.5;">
              ${svc('🚩', 'Je signale', 'Signalez un problème sur l\'espace public (propreté, voirie, eau…)')}
              ${svc('📅', 'Mes démarches & RDV', 'Préparez vos documents et prenez rendez-vous en ligne')}
              ${svc('📍', 'Ma Houma', 'Explorez les équipements et services autour de vous')}
              ${svc('📋', 'Mon suivi', 'Suivez l\'avancement de vos signalements en temps réel')}
              ${svc('📰', 'Infos utiles', 'Contacts, numéros d\'urgence et communiqués officiels')}
              ${svc('🏅', 'Mon impact', 'Visualisez votre contribution et gagnez des points')}
            </table>

            <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;padding:16px;margin-bottom:20px;">
              <h3 style="color:#5B21B6;margin:0 0 6px;font-size:14px;">Complétez votre profil</h3>
              <p style="color:#334155;font-size:13px;line-height:1.5;margin:0 0 12px;">Pour une meilleure expérience, ajoutez votre numéro de téléphone, votre quartier et vos préférences de notification.</p>
              <a href="https://civismart.pylcom.app/#/profil" style="display:inline-block;background:#7C3AED;color:white;text-decoration:none;padding:10px 24px;border-radius:10px;font-size:14px;font-weight:700;">Aller sur mon profil →</a>
            </div>

            <hr style="border:none;border-top:1px solid #e0e7ed;margin:20px 0;">
            <p style="color:#94a3b8;font-size:11px;text-align:center;">ALGERNA — Wilaya d'Alger<br>contact@wilaya-alger.dz</p>
          </div>
        </div>
      `,
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
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <div style="background:#063B5A;color:white;padding:16px 24px;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-size:18px;">ALGERNA — ${campaignType === 'alert' ? 'Alerte' : 'Communiqué'}</h1>
            </div>
            <div style="background:white;border:1px solid #e0e7ed;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
              ${htmlBody}
              <hr style="border:none;border-top:1px solid #e0e7ed;margin:20px 0;">
              <p style="color:#94a3b8;font-size:11px;text-align:center;">
                Vous recevez ce message car vous êtes inscrit sur ALGERNA.<br>
                Pour vous désabonner, connectez-vous et modifiez vos préférences.<br>
                contact@wilaya-alger.dz
              </p>
            </div>
          </div>
        `,
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
    return { ok: true, message: 'SMTP connecté' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { sendWelcomeEmail, sendConfirmationEmail, sendCampaignEmail, testConnection };
