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

async function sendResetEmail(email, prenom, token) {
  const link = `https://civismart.pylcom.app/?reset=${token}`;
  try {
    await transporter.sendMail({ from: FROM, to: email, subject: 'ALGERNA — Réinitialisation mot de passe',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><div style="background:#063B5A;color:white;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;"><h1 style="margin:0;font-size:22px;">ALGERNA</h1></div><div style="background:white;border:1px solid #e0e7ed;border-top:none;padding:24px;border-radius:0 0 12px 12px;"><h2 style="color:#063B5A;">Bonjour${prenom?' '+prenom:''}</h2><p>Cliquez ci-dessous pour réinitialiser votre mot de passe :</p><div style="text-align:center;margin:24px 0;"><a href="${link}" style="display:inline-block;background:#7C3AED;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;">Réinitialiser</a></div><p style="color:#64748B;font-size:13px;">Ce lien expire dans 1 heure.</p></div></div>` });
    console.log('[emailService] Reset email sent to', email);
    return { ok: true };
  } catch(e) { console.warn('[emailService] sendResetEmail failed:', e.message); return { ok: false }; }
}

async function sendSignalementEmail(email, prenom, reference, categorie, commune) {
  try {
    await transporter.sendMail({ from: FROM, to: email, subject: `ALGERNA — Signalement ${reference} enregistré`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><div style="background:#063B5A;color:white;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;"><h1 style="margin:0;font-size:22px;">ALGERNA</h1><p style="margin:4px 0 0;font-size:13px;opacity:0.8;">Confirmation de signalement</p></div><div style="background:white;border:1px solid #e0e7ed;border-top:none;padding:24px;border-radius:0 0 12px 12px;"><h2 style="color:#063B5A;margin:0 0 12px;">Signalement enregistré${prenom?', '+prenom:''} !</h2><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:16px;"><div style="font-size:11px;color:#166534;text-transform:uppercase;">Référence</div><div style="font-size:22px;font-weight:800;color:#166534;">${reference}</div></div><table style="width:100%;font-size:14px;color:#334155;line-height:1.8;"><tr><td style="font-weight:600;">Catégorie</td><td>${categorie}</td></tr>${commune?'<tr><td style="font-weight:600;">Commune</td><td>'+commune+'</td></tr>':''}<tr><td style="font-weight:600;">Statut</td><td>Reçu</td></tr></table><p style="color:#64748B;font-size:13px;margin-top:16px;">Suivez l'avancement dans <strong>Mon suivi</strong>.</p></div></div>` });
    console.log('[emailService] Signalement confirmation sent to', email, 'ref:', reference);
    return { ok: true };
  } catch(e) { console.warn('[emailService] sendSignalementEmail failed:', e.message); return { ok: false }; }
}

/**
 * Email de confirmation RDV (booking)
 */
async function sendRdvConfirmEmail(email, prenom, data) {
  const { reference, service, guichet, adresse, commune, date, heure, pieces } = data;
  const piecesHtml = (pieces || []).map(p => '<li>' + p + '</li>').join('');
  try {
    await transporter.sendMail({
      from: FROM, to: email,
      subject: `[ALGERNA] RDV confirme - ${service} - ${date}`,
      headers: baseHeaders(),
      text: `Bonjour${prenom ? ' ' + prenom : ''},\n\nVotre rendez-vous est confirme.\n\nReference : ${reference}\nDemarche : ${service}\nDate : ${date}\nHeure : ${heure}\nGuichet : ${guichet}\nAdresse : ${adresse || 'non precisee'}\nCommune : ${commune}\n\n${pieces && pieces.length ? 'Pieces a apporter :\n' + pieces.map(p => '- ' + p).join('\n') + '\n\n' : ''}Presentez le QR code ci-dessous au guichet le jour du rendez-vous.\nVous pouvez modifier votre RDV 2 fois maximum depuis votre espace.\nPour annuler, connectez-vous sur https://civismart.pylcom.app\n\n--\nALGERNA - Plateforme citoyenne de la Wilaya d'Alger`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <tr><td style="background:#063B5A;padding:24px;text-align:center;">
        <p style="margin:0;font-size:22px;font-weight:700;color:white;letter-spacing:1px;">ALGERNA</p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Confirmation de rendez-vous</p>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#063B5A;">Rendez-vous confirme${prenom ? ', ' + prenom : ''} !</p>
        <div style="text-align:center;margin-bottom:20px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(reference)}" alt="QR" style="width:150px;height:150px;border-radius:8px;">
          <div style="font-size:20px;font-weight:800;color:#063B5A;margin-top:8px;letter-spacing:1px;">${reference}</div>
        </div>
        <table style="width:100%;font-size:14px;line-height:2;color:#334155;">
          <tr><td style="color:#64748B;width:120px;">Demarche</td><td style="font-weight:600;">${service}</td></tr>
          <tr><td style="color:#64748B;">Date</td><td style="font-weight:600;">${date}</td></tr>
          <tr><td style="color:#64748B;">Heure</td><td style="font-weight:600;">${heure}</td></tr>
          <tr><td style="color:#64748B;">Guichet</td><td style="font-weight:600;">${guichet}</td></tr>
          <tr><td style="color:#64748B;">Adresse</td><td style="font-weight:600;">${adresse || 'Non precisee'}</td></tr>
          <tr><td style="color:#64748B;">Commune</td><td style="font-weight:600;">${commune}</td></tr>
        </table>
        ${piecesHtml ? '<div style="margin-top:20px;background:#F5F3FF;border-radius:10px;padding:16px;"><h3 style="margin:0 0 8px;font-size:14px;color:#5B21B6;">Pieces a apporter</h3><ul style="margin:0;padding-left:20px;color:#334155;line-height:1.8;">' + piecesHtml + '</ul></div>' : ''}
        <div style="margin-top:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;font-size:13px;color:#166534;">
          <strong>Instructions :</strong><br>
          Presentez le QR code ci-dessus au guichet le jour du rendez-vous.<br>
          Vous pouvez modifier votre RDV 2 fois maximum depuis votre espace citoyen.<br>
          Pour annuler, connectez-vous sur <a href="https://civismart.pylcom.app" style="color:#166534;">civismart.pylcom.app</a>.
        </div>
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
    console.log('[emailService] RDV confirm sent to', email, 'ref:', reference);
    return { ok: true };
  } catch (e) {
    console.warn('[emailService] sendRdvConfirmEmail failed:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Email de modification RDV
 */
async function sendRdvModifEmail(email, prenom, data) {
  const { reference, service, guichet, adresse, commune, date, heure, modificationsRestantes } = data;
  try {
    await transporter.sendMail({
      from: FROM, to: email,
      subject: `[ALGERNA] RDV modifie - ${service} - ${date}`,
      headers: baseHeaders(),
      text: `Bonjour${prenom ? ' ' + prenom : ''},\n\nVotre rendez-vous a ete modifie.\n\nReference : ${reference}\nDemarche : ${service}\nNouvelle date : ${date}\nNouvelle heure : ${heure}\nGuichet : ${guichet}\nAdresse : ${adresse || 'non precisee'}\nCommune : ${commune}\n\nModifications restantes : ${modificationsRestantes}\nPresentez le meme QR code au guichet.\n\n--\nALGERNA - Plateforme citoyenne de la Wilaya d'Alger`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <tr><td style="background:#7C3AED;padding:24px;text-align:center;">
        <p style="margin:0;font-size:22px;font-weight:700;color:white;letter-spacing:1px;">ALGERNA</p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Modification de rendez-vous</p>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#7C3AED;">Rendez-vous modifie${prenom ? ', ' + prenom : ''}</p>
        <div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:10px;padding:12px;margin-bottom:20px;font-size:13px;color:#92400E;">
          Votre rendez-vous a ete reporte. Les nouvelles informations sont ci-dessous.
          ${modificationsRestantes > 0 ? '<br>Il vous reste <strong>' + modificationsRestantes + ' modification(s)</strong> possible(s).' : '<br><strong>Vous ne pouvez plus modifier ce rendez-vous.</strong>'}
        </div>
        <div style="text-align:center;margin-bottom:16px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(reference)}" alt="QR" style="width:120px;height:120px;border-radius:8px;">
          <div style="font-size:16px;font-weight:800;color:#7C3AED;margin-top:6px;">${reference}</div>
        </div>
        <table style="width:100%;font-size:14px;line-height:2;color:#334155;">
          <tr><td style="color:#64748B;width:120px;">Demarche</td><td style="font-weight:600;">${service}</td></tr>
          <tr><td style="color:#64748B;">Nouvelle date</td><td style="font-weight:600;">${date}</td></tr>
          <tr><td style="color:#64748B;">Nouvelle heure</td><td style="font-weight:600;">${heure}</td></tr>
          <tr><td style="color:#64748B;">Guichet</td><td style="font-weight:600;">${guichet}</td></tr>
          <tr><td style="color:#64748B;">Adresse</td><td style="font-weight:600;">${adresse || 'Non precisee'}</td></tr>
          <tr><td style="color:#64748B;">Commune</td><td style="font-weight:600;">${commune}</td></tr>
        </table>
        <p style="margin-top:16px;font-size:12px;color:#64748B;text-align:center;">Presentez le meme QR code au guichet le jour du rendez-vous.</p>
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
    console.log('[emailService] RDV modif sent to', email, 'ref:', reference);
    return { ok: true };
  } catch (e) {
    console.warn('[emailService] sendRdvModifEmail failed:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendWelcomeEmail, sendConfirmationEmail, sendCampaignEmail, sendResetEmail, sendSignalementEmail, sendRdvConfirmEmail, sendRdvModifEmail, testConnection };
