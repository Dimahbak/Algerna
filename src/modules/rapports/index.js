/**
 * Bureau des Rapports — Génération PDF pour superviseurs
 */
const express = require('express');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { query } = require('../../db/pool');
const { authenticate, hasPerimetre } = require('../../middleware/auth');
const { asyncH, unauthorized, forbidden } = require('../../utils/http');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '../../../uploads/rapports');
const FONT_DIR = path.join(__dirname, '../../../public/assets/fonts');
const SLA_H = 48;

function requirePilotage() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    const caps = Array.isArray(req.user.capacites) ? req.user.capacites : [];
    if (caps.includes('pilotage')) return next();
    return next(forbidden());
  };
}

// ── Helpers ──
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('fr-DZ', {day:'2-digit',month:'2-digit',year:'numeric'}) : '—'; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString('fr-DZ', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'; }

function periodeSQL(periode, from, to) {
  switch (periode) {
    case '7j': return { sql: "s.cree_le >= NOW() - INTERVAL '7 days'", label: '7 derniers jours', labelAr: 'آخر 7 أيام' };
    case '30j': return { sql: "s.cree_le >= NOW() - INTERVAL '30 days'", label: '30 derniers jours', labelAr: 'آخر 30 يوماً' };
    case 'trimestre': return { sql: "s.cree_le >= NOW() - INTERVAL '90 days'", label: 'Trimestre en cours', labelAr: 'الربع الحالي' };
    case 'annee': return { sql: "s.cree_le >= DATE_TRUNC('year', NOW())", label: 'Depuis début d\'année', labelAr: 'منذ بداية السنة' };
    case 'custom':
      if (from && to) return { sql: `s.cree_le >= '${from}'::date AND s.cree_le < ('${to}'::date + INTERVAL '1 day')`, label: `${from} → ${to}`, labelAr: `${from} → ${to}` };
      return { sql: "s.cree_le >= NOW() - INTERVAL '30 days'", label: '30 derniers jours', labelAr: 'آخر 30 يوماً' };
    default: return { sql: "s.cree_le >= NOW() - INTERVAL '30 days'", label: '30 derniers jours', labelAr: 'آخر 30 يوماً' };
  }
}

function setupDoc(doc, isAr) {
  const fontR = path.join(FONT_DIR, 'DejaVuSans.ttf');
  const fontB = path.join(FONT_DIR, 'DejaVuSans-Bold.ttf');
  if (fs.existsSync(fontR)) doc.registerFont('main', fontR);
  if (fs.existsSync(fontB)) doc.registerFont('mainB', fontB);
  return { fontR: fs.existsSync(fontR) ? 'main' : 'Helvetica', fontB: fs.existsSync(fontB) ? 'mainB' : 'Helvetica-Bold' };
}

function drawHeader(doc, fonts, title, subtitle, isAr) {
  const fo = isAr ? { features: ['rtla', 'rtlm'] } : {};
  doc.rect(0, 0, doc.page.width, 70).fill('#041F38');
  doc.font(fonts.fontB).fontSize(16).fillColor('#FFFFFF');
  doc.text('ALGERNA', 40, 18, { width: doc.page.width - 80 });
  doc.font(fonts.fontR).fontSize(9).fillColor('#8ecae6');
  doc.text('Wilaya d\'Alger — Plateforme de gouvernance civique', 40, 38, { width: doc.page.width - 80 });
  doc.moveDown(2);
  doc.fillColor('#041F38').font(fonts.fontB).fontSize(14);
  doc.text(title, 40, 85, { width: doc.page.width - 80, ...fo });
  doc.font(fonts.fontR).fontSize(9).fillColor('#666666');
  doc.text(subtitle, 40, 105, { width: doc.page.width - 80, ...fo });
  doc.text((isAr ? 'تاريخ الإنشاء : ' : 'Généré le ') + new Date().toLocaleString(isAr ? 'ar-DZ' : 'fr-DZ'), 40, 118, { width: doc.page.width - 80, ...fo });
  doc.moveDown(3);
  return 140;
}

function sectionTitle(doc, fonts, y, label, isAr) {
  if (y > 700) { doc.addPage(); y = 40; }
  const fo = isAr ? { features: ['rtla', 'rtlm'] } : {};
  doc.rect(40, y, doc.page.width - 80, 22).fill('#063B5A');
  doc.font(fonts.fontB).fontSize(10).fillColor('#FFFFFF');
  doc.text(label, 50, y + 5, { width: doc.page.width - 100, ...fo });
  doc.fillColor('#333333');
  return y + 30;
}

function kpiRow(doc, fonts, y, label, value, w) {
  w = w || 130;
  doc.font(fonts.fontR).fontSize(9).fillColor('#666').text(label, 50, y);
  doc.font(fonts.fontB).fontSize(11).fillColor('#041F38').text(String(value), 50 + w, y);
  return y + 16;
}

// ═══ POST /generer — rapport territoire ═══
router.post('/generer', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { periode, from, to, commune_id, domaine, organisation_id, lang } = req.body;
  const isAr = lang === 'ar';
  const isCommune = hasPerimetre(req.user, 'commune');
  const effectiveCommuneId = isCommune ? req.user.commune_id : (commune_id || null);
  const p = periodeSQL(periode, from, to);

  // Build filters
  let where = `WHERE ${p.sql}`;
  const params = [];
  if (effectiveCommuneId) { params.push(Number(effectiveCommuneId)); where += ` AND s.commune_id = $${params.length}`; }
  if (domaine) { params.push(domaine); where += ` AND s.domaine = $${params.length}`; }

  // Get commune name
  let communeNom = 'Wilaya d\'Alger';
  if (effectiveCommuneId) {
    const { rows: cRows } = await query('SELECT nom FROM commune WHERE id=$1', [effectiveCommuneId]);
    if (cRows.length) communeNom = cRows[0].nom;
  }

  // Get org name if filtered
  let orgNom = '';
  let orgWhere = '';
  if (organisation_id) {
    const { rows: oRows } = await query('SELECT nom FROM organisations WHERE id=$1', [organisation_id]);
    if (oRows.length) orgNom = oRows[0].nom;
    orgWhere = ` AND s.assigne_a IN (SELECT id FROM utilisateur WHERE organisation_id = ${Number(organisation_id)})`;
  }

  const fullWhere = where + orgWhere;

  // KPIs
  const [recus, resolus, enRetard, tempsMoy] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${fullWhere}`, params),
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${fullWhere} AND s.etat='resolu'`, params),
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${fullWhere} AND s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_H} hours'`, params),
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600))::int AS h FROM signalement s ${fullWhere} AND s.etat='resolu' AND s.resolu_le IS NOT NULL`, params),
  ]);
  const kRecus = recus.rows[0].n;
  const kResolus = resolus.rows[0].n;
  const kRetard = enRetard.rows[0].n;
  const kTemps = tempsMoy.rows[0].h || 0;
  const kTaux = kRecus > 0 ? Math.round((kResolus / kRecus) * 100) : 0;

  // Répartition par domaine
  const { rows: parDomaine } = await query(`SELECT s.domaine, COUNT(*)::int AS total FROM signalement s ${fullWhere} AND s.domaine IS NOT NULL GROUP BY s.domaine ORDER BY total DESC`, params);

  // Répartition par commune
  const { rows: parCommune } = await query(`SELECT c.nom AS commune, COUNT(s.id)::int AS total FROM signalement s JOIN commune c ON c.id=s.commune_id ${fullWhere} GROUP BY c.nom ORDER BY total DESC LIMIT 15`, params);

  // Performance organisations
  const { rows: orgPerf } = await query(`SELECT o.nom, COUNT(s.id)::int AS recus,
    COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus,
    COUNT(*) FILTER (WHERE s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_H} hours')::int AS retard
    FROM signalement s JOIN utilisateur u ON u.id=s.assigne_a JOIN organisations o ON o.id=u.organisation_id ${fullWhere} GROUP BY o.nom ORDER BY recus DESC`, params);

  // Dossiers marquants (les plus anciens en retard)
  const { rows: marquants } = await query(`SELECT s.reference, s.cree_le, cs.libelle AS categorie, c.nom AS commune, cs.criticite
    FROM signalement s LEFT JOIN categorie_signal cs ON cs.id=s.categorie_id LEFT JOIN commune c ON c.id=s.commune_id
    ${fullWhere} AND s.etat='recu' AND s.cree_le < NOW()-INTERVAL '${SLA_H} hours' ORDER BY s.cree_le ASC LIMIT 10`, params);

  // ICUA
  let icuaScore = 0;
  try {
    const { rows: icua } = await query(`SELECT ROUND(AVG(CASE WHEN s.etat='resolu' AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_H} THEN 100 ELSE 0 END))::int AS score FROM signalement s WHERE s.etat='resolu'`);
    icuaScore = icua[0].score || 0;
  } catch(e) { console.error('[rapports] échec calcul ICUA:', e.message); }

  // ── Génération PDF ──
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const fonts = setupDoc(doc, isAr);
  const filename = `rapport_${Date.now()}.pdf`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  const title = orgNom ? `Rapport — ${orgNom}` : `Rapport — ${communeNom}`;
  const subtitle = `Période : ${p.label}` + (domaine ? ` · Domaine : ${domaine}` : '');
  let y = drawHeader(doc, fonts, title, subtitle, isAr);

  // Synthèse
  y = sectionTitle(doc, fonts, y, 'Synthèse');
  doc.font(fonts.fontR).fontSize(10).fillColor('#333');
  const synth = `Sur la période « ${p.label} », ${kRecus} signalement${kRecus>1?'s ont été reçus':' a été reçu'} sur le périmètre ${orgNom || communeNom}. ` +
    `${kResolus} ont été résolus (taux de résolution : ${kTaux}%). ` +
    `${kRetard} dossier${kRetard>1?'s sont':'est'} actuellement en retard de traitement. ` +
    `Le temps moyen de résolution est de ${kTemps} heures. ` +
    (icuaScore > 0 ? `L'indice ICUA est à ${icuaScore}%.` : '');
  doc.text(synth, 50, y, { width: doc.page.width - 100, lineGap: 3 });
  y = doc.y + 15;

  // KPIs
  y = sectionTitle(doc, fonts, y, 'Indicateurs clés');
  y = kpiRow(doc, fonts, y, 'Signalements reçus', kRecus);
  y = kpiRow(doc, fonts, y, 'Résolus', kResolus);
  y = kpiRow(doc, fonts, y, 'Taux de résolution', kTaux + '%');
  y = kpiRow(doc, fonts, y, 'Temps moyen (heures)', kTemps || '—');
  y = kpiRow(doc, fonts, y, 'En retard', kRetard);
  y = kpiRow(doc, fonts, y, 'Score ICUA', icuaScore + '%');
  y += 10;

  // Répartition domaine
  if (parDomaine.length) {
    y = sectionTitle(doc, fonts, y, 'Répartition par domaine');
    const domLabels = {eau:'Eau',proprete:'Propreté',general:'Général',voirie:'Voirie',eclairage:'Éclairage',espaces_verts:'Espaces verts',stationnement:'Stationnement'};
    parDomaine.forEach(function(d) {
      doc.font(fonts.fontR).fontSize(9).fillColor('#333').text((domLabels[d.domaine]||d.domaine) + ' : ' + d.total, 50, y);
      y += 14;
      if (y > 720) { doc.addPage(); y = 40; }
    });
    y += 6;
  }

  // Répartition commune
  if (parCommune.length && !effectiveCommuneId) {
    y = sectionTitle(doc, fonts, y, 'Répartition par commune');
    parCommune.forEach(function(c) {
      doc.font(fonts.fontR).fontSize(9).fillColor('#333').text(c.commune + ' : ' + c.total, 50, y);
      y += 14;
      if (y > 720) { doc.addPage(); y = 40; }
    });
    y += 6;
  }

  // Performance organisations
  if (orgPerf.length) {
    y = sectionTitle(doc, fonts, y, 'Performance des organisations');
    // Header
    doc.font(fonts.fontB).fontSize(8).fillColor('#666');
    doc.text('Organisation', 50, y); doc.text('Reçus', 250, y); doc.text('Résolus', 310, y); doc.text('Retard', 370, y);
    y += 14;
    orgPerf.forEach(function(o) {
      doc.font(fonts.fontR).fontSize(9).fillColor('#333');
      doc.text(o.nom, 50, y); doc.text(String(o.recus), 250, y); doc.text(String(o.resolus), 310, y);
      doc.fillColor(o.retard > 0 ? '#EF4444' : '#333').text(String(o.retard), 370, y);
      doc.fillColor('#333');
      y += 14;
      if (y > 720) { doc.addPage(); y = 40; }
    });
    y += 6;
  }

  // Dossiers marquants
  if (marquants.length) {
    y = sectionTitle(doc, fonts, y, 'Dossiers marquants (hors délai)');
    marquants.forEach(function(m) {
      doc.font(fonts.fontR).fontSize(9).fillColor('#333');
      doc.text(`#${m.reference} — ${m.categorie||'—'} · ${m.commune||'—'} · depuis ${fmtDate(m.cree_le)}` + (m.criticite==='haute' ? ' · URGENT' : ''), 50, y, { width: doc.page.width - 100 });
      y += 14;
      if (y > 720) { doc.addPage(); y = 40; }
    });
  }

  // Footer
  doc.font(fonts.fontR).fontSize(7).fillColor('#999');
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.text(`ALGERNA — Rapport confidentiel — Page ${i+1}/${pageCount}`, 40, doc.page.height - 30, { width: doc.page.width - 80, align: 'center' });
  }

  doc.end();
  await new Promise((resolve, reject) => { stream.on('finish', resolve); stream.on('error', reject); });

  // Journal + enregistrement
  await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
    SELECT id, etat, $1, 'rapport_genere', $2 FROM signalement LIMIT 1`,
    [req.user.id, `Rapport généré : ${title} — ${subtitle}`]);
  await query(`INSERT INTO rapport_genere (url, filename, type, titre, genere_par) VALUES ($1,$2,$3,$4,$5)`,
    ['/uploads/rapports/' + filename, filename, 'territoire', `${title} — ${subtitle}`, req.user.id]);

  res.json({ ok: true, url: '/uploads/rapports/' + filename, filename });
}));

// ═══ POST /dossier/:id — rapport d'un dossier ═══
router.post('/dossier/:id', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { lang } = req.body;
  const isAr = lang === 'ar';
  const id = req.params.id;

  // Charger le dossier
  const { rows: sigRows } = await query(`SELECT s.*, cs.libelle AS categorie, cs.libelle_ar AS categorie_ar, cs.criticite,
    c.nom AS commune_nom, u.prenom AS citoyen_prenom, u.nom AS citoyen_nom, u.telephone AS citoyen_tel,
    o.nom AS organisation_nom
    FROM signalement s LEFT JOIN categorie_signal cs ON cs.id=s.categorie_id
    LEFT JOIN commune c ON c.id=s.commune_id LEFT JOIN utilisateur u ON u.id=s.citoyen_id
    LEFT JOIN utilisateur a ON a.id=s.assigne_a LEFT JOIN organisations o ON o.id=a.organisation_id
    WHERE s.id=$1`, [id]);
  if (!sigRows.length) return res.status(404).json({ erreur: 'Signalement introuvable.' });
  const s = sigRows[0];
  // Vérification périmètre commune
  if (hasPerimetre(req.user, 'commune') && req.user.commune_id && s.commune_id !== req.user.commune_id) {
    return res.status(403).json({ erreur: 'Hors périmètre.' });
  }

  // Historique
  const { rows: hist } = await query(`SELECT h.*, u.prenom, u.nom AS nom_u FROM signalement_historique h
    LEFT JOIN utilisateur u ON u.id=h.par_utilisateur WHERE h.signalement_id=$1 ORDER BY h.le ASC`, [id]);

  // Missions CAP
  const { rows: caps } = await query(`SELECT m.*, u.prenom AS agent_prenom, u.nom AS agent_nom
    FROM mission_cap m LEFT JOIN utilisateur u ON u.id=m.affecte_a WHERE m.signalement_id=$1`, [id]);

  // PDF
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const fonts = setupDoc(doc, isAr);
  const filename = `dossier_${s.reference || id.substring(0,8)}_${Date.now()}.pdf`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  let y = drawHeader(doc, fonts, `Fiche dossier — ${s.reference || '—'}`, `Commune : ${s.commune_nom || '—'} · ${fmtDateTime(s.cree_le)}`, isAr);

  // Signalement
  y = sectionTitle(doc, fonts, y, 'Signalement');
  y = kpiRow(doc, fonts, y, 'Catégorie', s.categorie || '—');
  if (s.description) { y = kpiRow(doc, fonts, y, 'Description', ''); doc.font(fonts.fontR).fontSize(9).fillColor('#333').text(s.description, 50, y, { width: doc.page.width - 100 }); y = doc.y + 8; }
  y = kpiRow(doc, fonts, y, 'Commune', s.commune_nom || '—');
  y = kpiRow(doc, fonts, y, 'Date de création', fmtDateTime(s.cree_le));
  if (s.citoyen_prenom) y = kpiRow(doc, fonts, y, 'Citoyen', (s.citoyen_prenom||'') + ' ' + (s.citoyen_nom||''));
  if (s.lat && s.lng) y = kpiRow(doc, fonts, y, 'Coordonnées', s.lat + ', ' + s.lng);
  y += 6;

  // Analyse
  y = sectionTitle(doc, fonts, y, 'Analyse');
  const etatLabels = {recu:'Reçu',transmis:'Transmis',pris_en_charge:'Pris en charge',en_intervention:'En intervention',a_valider:'À valider',resolu:'Résolu',rejete:'Rejeté'};
  y = kpiRow(doc, fonts, y, 'État', etatLabels[s.etat] || s.etat);
  y = kpiRow(doc, fonts, y, 'Criticité', s.criticite || '—');
  y = kpiRow(doc, fonts, y, 'Domaine', s.domaine || '—');
  if (s.organisation_nom) y = kpiRow(doc, fonts, y, 'Organisation', s.organisation_nom);
  y += 6;

  // Planification
  if (s.equipe_interne || s.responsable_intervention || s.delai_prevu) {
    y = sectionTitle(doc, fonts, y, 'Planification');
    if (s.equipe_interne) y = kpiRow(doc, fonts, y, 'Équipe', s.equipe_interne);
    if (s.responsable_intervention) y = kpiRow(doc, fonts, y, 'Responsable', s.responsable_intervention);
    if (s.delai_prevu) y = kpiRow(doc, fonts, y, 'Délai prévu', fmtDateTime(s.delai_prevu));
    y += 6;
  }

  // Compte-rendu
  if (s.compte_rendu_description) {
    y = sectionTitle(doc, fonts, y, 'Compte-rendu d\'intervention');
    y = kpiRow(doc, fonts, y, 'Résultat', s.compte_rendu_resultat || '—');
    doc.font(fonts.fontR).fontSize(9).fillColor('#333').text(s.compte_rendu_description, 50, y, { width: doc.page.width - 100 });
    y = doc.y + 8;
    if (s.compte_rendu_observation) { y = kpiRow(doc, fonts, y, 'Observation', s.compte_rendu_observation); }
    y += 6;
  }

  // Rapports CAP
  if (caps.length) {
    y = sectionTitle(doc, fonts, y, 'Rapports terrain CAP');
    caps.forEach(function(m) {
      if (y > 700) { doc.addPage(); y = 40; }
      const name = ((m.agent_prenom||'') + ' ' + (m.agent_nom||'')).trim() || 'Agent CAP';
      doc.font(fonts.fontB).fontSize(9).fillColor('#333').text(name + ' — ' + (m.etat||'—'), 50, y); y += 14;
      if (m.decision) { doc.font(fonts.fontR).fontSize(9).text('Décision : ' + m.decision + (m.motif_decision ? ' — ' + m.motif_decision : ''), 60, y); y += 14; }
      if (m.constat_visuel) { doc.text('Constat : ' + m.constat_visuel, 60, y); y += 14; }
      y += 4;
    });
    y += 6;
  }

  // Historique
  if (hist.length) {
    if (y > 650) { doc.addPage(); y = 40; }
    y = sectionTitle(doc, fonts, y, 'Historique complet');
    hist.forEach(function(h) {
      if (y > 720) { doc.addPage(); y = 40; }
      const who = ((h.prenom||'') + ' ' + (h.nom_u||'')).trim();
      doc.font(fonts.fontR).fontSize(8).fillColor('#666');
      doc.text(fmtDateTime(h.le) + ' — ' + (h.action||h.etat) + (who ? ' — ' + who : '') + (h.commentaire ? ' : ' + h.commentaire.substring(0,80) : ''), 50, y, { width: doc.page.width - 100 });
      y = doc.y + 4;
    });
  }

  // Footer
  doc.font(fonts.fontR).fontSize(7).fillColor('#999');
  const pc = doc.bufferedPageRange().count;
  for (let i = 0; i < pc; i++) {
    doc.switchToPage(i);
    doc.text(`ALGERNA — Fiche dossier ${s.reference} — Page ${i+1}/${pc}`, 40, doc.page.height - 30, { width: doc.page.width - 80, align: 'center' });
  }

  doc.end();
  await new Promise((resolve, reject) => { stream.on('finish', resolve); stream.on('error', reject); });

  // Journal + enregistrement
  await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
    VALUES ($1, $2, $3, 'rapport_genere', $4)`,
    [id, s.etat, req.user.id, 'Rapport dossier ' + s.reference + ' généré']);
  await query(`INSERT INTO rapport_genere (url, filename, type, titre, genere_par) VALUES ($1,$2,$3,$4,$5)`,
    ['/uploads/rapports/' + filename, filename, 'dossier', 'Fiche dossier ' + s.reference, req.user.id]);

  res.json({ ok: true, url: '/uploads/rapports/' + filename, filename });
}));

// ═══ POST /encaissements — rapport PDF encaissements CiviPark ═══
router.post('/encaissements', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { periode, from, to, commune_id, parking_zone_id, lang } = req.body;
  const isAr = lang === 'ar';
  const isCommune = hasPerimetre(req.user, 'commune');
  const effectiveCommune = isCommune ? req.user.commune_id : (commune_id || null);

  // Period filter (reuse s alias trick — alias pe as s for periodeSQL compat)
  const pRaw = periodeSQL(periode, from, to);
  const pSql = pRaw.sql.replace(/s\./g, 'pe.');

  let where = `WHERE ${pSql} AND pe.valide = TRUE`;
  const params = [];
  if (effectiveCommune) { params.push(Number(effectiveCommune)); where += ` AND pz.commune_id = $${params.length}`; }
  if (parking_zone_id) { params.push(Number(parking_zone_id)); where += ` AND pe.parking_zone_id = $${params.length}`; }

  let communeNom = 'Wilaya d\'Alger';
  if (effectiveCommune) {
    const { rows: cR } = await query('SELECT nom FROM commune WHERE id=$1', [effectiveCommune]);
    if (cR.length) communeNom = cR[0].nom;
  }

  // Data
  const { rows: lignes } = await query(
    `SELECT pe.*, pz.nom AS zone_nom, pz.reference AS zone_ref, c.nom AS commune_nom,
       cr.numero AS carte_numero, u.prenom AS agent_prenom, u.nom AS agent_nom,
       ann.justificatif_numero AS annule_recu
     FROM parking_encaissement pe
     JOIN parking_zone pz ON pz.id = pe.parking_zone_id
     LEFT JOIN commune c ON c.id = pz.commune_id
     LEFT JOIN carte_resident cr ON cr.id = pe.carte_resident_id
     LEFT JOIN utilisateur u ON u.id = pe.agent_id
     LEFT JOIN parking_encaissement ann ON ann.id = pe.annulation_de
     ${where} ORDER BY pe.date_heure DESC LIMIT 500`, params);

  // Totaux
  const { rows: totR } = await query(
    `SELECT COUNT(*)::int AS nb, COALESCE(SUM(pe.montant),0)::numeric AS total,
       COUNT(*) FILTER (WHERE pe.type_paiement='carte_resident')::int AS nb_cartes,
       COALESCE(SUM(pe.montant) FILTER (WHERE pe.type_paiement='carte_resident'),0)::numeric AS total_cartes
     FROM parking_encaissement pe JOIN parking_zone pz ON pz.id=pe.parking_zone_id ${where}`, params);
  const tot = totR[0];

  // Par parking
  const { rows: parPk } = await query(
    `SELECT pz.reference, pz.nom, COUNT(pe.id)::int AS nb, COALESCE(SUM(pe.montant),0)::numeric AS total
     FROM parking_encaissement pe JOIN parking_zone pz ON pz.id=pe.parking_zone_id ${where}
     GROUP BY pz.reference, pz.nom ORDER BY total DESC`, params);

  // Par mode
  const { rows: parMode } = await query(
    `SELECT pe.mode_paiement, COUNT(*)::int AS nb, COALESCE(SUM(pe.montant),0)::numeric AS total
     FROM parking_encaissement pe JOIN parking_zone pz ON pz.id=pe.parking_zone_id ${where}
     GROUP BY pe.mode_paiement ORDER BY total DESC`, params);

  // PDF
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const fonts = setupDoc(doc, isAr);
  const filename = `encaissements_${Date.now()}.pdf`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  const title = `Rapport Encaissements — ${communeNom}`;
  const subtitle = `Période : ${pRaw.label}`;
  let y = drawHeader(doc, fonts, title, subtitle, isAr);

  // Synthèse
  y = sectionTitle(doc, fonts, y, 'Synthèse');
  y = kpiRow(doc, fonts, y, 'Total encaissements', tot.nb);
  y = kpiRow(doc, fonts, y, 'Montant total', tot.total + ' DA');
  y = kpiRow(doc, fonts, y, 'Paiements cartes résident', tot.nb_cartes + ' (' + tot.total_cartes + ' DA)');
  y += 10;

  // Par parking
  if (parPk.length) {
    y = sectionTitle(doc, fonts, y, 'Par parking');
    doc.font(fonts.fontB).fontSize(8).fillColor('#666');
    doc.text('Réf.', 50, y); doc.text('Nom', 130, y); doc.text('Nb', 350, y); doc.text('Total', 400, y);
    y += 14;
    parPk.forEach(p => {
      if (y > 720) { doc.addPage(); y = 40; }
      doc.font(fonts.fontR).fontSize(9).fillColor('#333');
      doc.text(p.reference || '—', 50, y); doc.text(p.nom, 130, y, { width: 210 }); doc.text(String(p.nb), 350, y); doc.text(p.total + ' DA', 400, y);
      y += 14;
    });
    y += 6;
  }

  // Par mode
  if (parMode.length) {
    y = sectionTitle(doc, fonts, y, 'Par mode de paiement');
    const modeLabels = { especes: 'Espèces', carte: 'Carte bancaire', mobile: 'Paiement mobile' };
    parMode.forEach(m => {
      doc.font(fonts.fontR).fontSize(9).fillColor('#333');
      doc.text((modeLabels[m.mode_paiement] || m.mode_paiement) + ' : ' + m.nb + ' (' + m.total + ' DA)', 50, y);
      y += 14;
      if (y > 720) { doc.addPage(); y = 40; }
    });
    y += 6;
  }

  // Détail des lignes (top 50)
  y = sectionTitle(doc, fonts, y, 'Détail des encaissements');
  doc.font(fonts.fontB).fontSize(7).fillColor('#666');
  doc.text('Date', 50, y); doc.text('Reçu', 130, y); doc.text('Parking', 220, y); doc.text('Type', 320, y); doc.text('Montant', 380, y); doc.text('Mode', 440, y);
  y += 12;
  lignes.slice(0, 50).forEach(l => {
    if (y > 720) { doc.addPage(); y = 40; }
    doc.font(fonts.fontR).fontSize(7).fillColor(l.montant < 0 ? '#EF4444' : '#333');
    doc.text(fmtDateTime(l.date_heure), 50, y);
    doc.text(l.justificatif_numero || '—', 130, y);
    doc.text((l.zone_ref || '') + ' ' + (l.zone_nom || ''), 220, y, { width: 95 });
    doc.text(l.type_paiement || '—', 320, y);
    doc.text(l.montant + ' DA', 380, y);
    doc.text(l.mode_paiement || '—', 440, y);
    y += 11;
  });

  // Footer
  doc.font(fonts.fontR).fontSize(7).fillColor('#999');
  const pc = doc.bufferedPageRange().count;
  for (let i = 0; i < pc; i++) {
    doc.switchToPage(i);
    doc.text(`ALGERNA — Rapport Encaissements — Page ${i+1}/${pc}`, 40, doc.page.height - 30, { width: doc.page.width - 80, align: 'center' });
  }

  doc.end();
  await new Promise((resolve, reject) => { stream.on('finish', resolve); stream.on('error', reject); });
  await query(`INSERT INTO rapport_genere (url, filename, type, titre, genere_par) VALUES ($1,$2,$3,$4,$5)`,
    ['/uploads/rapports/' + filename, filename, 'encaissements', `Encaissements — ${communeNom}`, req.user.id]);
  res.json({ ok: true, url: '/uploads/rapports/' + filename, filename });
}));

// ═══ POST /executif — rapport exécutif enrichi (8 sections) ═══
router.post('/executif', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { periode, from, to, commune_id, lang } = req.body;
  const isAr = lang === 'ar';
  const isCommune = hasPerimetre(req.user, 'commune');
  const effectiveCommuneId = isCommune ? req.user.commune_id : (commune_id || null);
  const p = periodeSQL(periode, from, to);

  // Build WHERE for current period
  let where = `WHERE ${p.sql}`;
  const params = [];
  if (effectiveCommuneId) { params.push(Number(effectiveCommuneId)); where += ` AND s.commune_id = $${params.length}`; }
  const fullWhere = where;

  // Build WHERE for PREVIOUS period (comparison)
  const prevPeriodeSQL = {
    '7j': "s.cree_le >= NOW() - INTERVAL '14 days' AND s.cree_le < NOW() - INTERVAL '7 days'",
    '30j': "s.cree_le >= NOW() - INTERVAL '60 days' AND s.cree_le < NOW() - INTERVAL '30 days'",
    'trimestre': "s.cree_le >= NOW() - INTERVAL '180 days' AND s.cree_le < NOW() - INTERVAL '90 days'",
    'annee': "s.cree_le >= (DATE_TRUNC('year', NOW()) - INTERVAL '1 year') AND s.cree_le < DATE_TRUNC('year', NOW())",
  };
  let prevWhere = `WHERE ${prevPeriodeSQL[periode] || prevPeriodeSQL['30j']}`;
  if (effectiveCommuneId) prevWhere += ` AND s.commune_id = ${Number(effectiveCommuneId)}`;

  // Commune name
  let communeNom = isAr ? 'ولاية الجزائر' : 'Wilaya d\'Alger';
  let communeNomAr = 'ولاية الجزائر';
  if (effectiveCommuneId) {
    const { rows: cRows } = await query('SELECT nom, nom_ar FROM commune WHERE id=$1', [effectiveCommuneId]);
    if (cRows.length) { communeNom = cRows[0].nom; communeNomAr = cRows[0].nom_ar || cRows[0].nom; }
  }
  const perimetreTitre = isAr
    ? (effectiveCommuneId ? 'بلدية ' + communeNomAr : 'ولاية الجزائر')
    : (effectiveCommuneId ? 'APC de ' + communeNom : 'Wilaya d\'Alger');

  // ── SECTION 1 DATA: KPIs current + previous ──
  const [recus, resolus, enRetard, tempsMoy, slaConf] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${fullWhere}`, params),
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${fullWhere} AND s.etat='resolu'`, params),
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${fullWhere} AND s.etat NOT IN ('resolu','rejete') AND s.cree_le < NOW()-INTERVAL '${SLA_H} hours'`, params),
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600))::int AS h FROM signalement s ${fullWhere} AND s.etat='resolu' AND s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le`, params),
    query(`SELECT COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_H})::int AS conf, COUNT(*)::int AS total FROM signalement s ${fullWhere} AND s.etat='resolu' AND s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le`, params),
  ]);
  const kR = recus.rows[0].n, kRs = resolus.rows[0].n, kRet = enRetard.rows[0].n, kT = tempsMoy.rows[0].h || 0;
  const kTx = kR > 0 ? Math.round((kRs / kR) * 100) : 0;
  const slaPct = slaConf.rows[0].total > 0 ? Math.round((slaConf.rows[0].conf / slaConf.rows[0].total) * 100) : 0;
  const kEnCours = kR - kRs - kRet;

  // Previous period KPIs
  const [prevRecus, prevResolus, prevTemps] = await Promise.all([
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${prevWhere}`),
    query(`SELECT COUNT(*)::int AS n FROM signalement s ${prevWhere} AND s.etat='resolu'`),
    query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600))::int AS h FROM signalement s ${prevWhere} AND s.etat='resolu' AND s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le`),
  ]);
  const pR = prevRecus.rows[0].n, pRs = prevResolus.rows[0].n, pT = prevTemps.rows[0].h || 0;
  const pTx = pR > 0 ? Math.round((pRs / pR) * 100) : 0;

  function arrow(cur, prev) { return cur > prev ? '↑' : cur < prev ? '↓' : '→'; }
  function delta(cur, prev) { const d = cur - prev; return d > 0 ? `+${d}` : String(d); }

  // ICUA (full, not period-scoped)
  let icuaScore = 0;
  try {
    const icua = require('../../services/icua');
    const icuaData = await icua.calculer(effectiveCommuneId || null);
    icuaScore = icuaData.score;
  } catch(e) { /* fallback */ }

  // Previous ICUA from historique
  let prevIcua = 0;
  try {
    const { rows: ih } = await query(`SELECT score FROM icua_historique WHERE (commune_id = $1 OR ($1 IS NULL AND commune_id IS NULL)) ORDER BY calcule_le DESC LIMIT 1 OFFSET 1`, [effectiveCommuneId || null]);
    if (ih.length) prevIcua = ih[0].score;
  } catch(e) { console.error('[rapports] échec ICUA historique:', e.message); }

  // Demandes d'explication count
  let deCount = 0;
  try {
    let deSql = `SELECT COUNT(*)::int AS n FROM demande_explication de JOIN signalement s ON s.id=de.signalement_id ${fullWhere}`;
    const { rows: deR } = await query(deSql, params);
    deCount = deR[0].n;
  } catch(e) { console.error('[rapports] échec comptage demandes:', e.message); }

  // ── SECTION 3 DATA: Performance directions by month ──
  const { rows: orgPerf } = await query(`
    SELECT o.nom, o.id,
      COUNT(s.id)::int AS recus,
      COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus,
      ROUND(AVG(CASE WHEN s.etat='resolu' AND s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le THEN EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 END))::int AS temps_h,
      COUNT(*) FILTER (WHERE s.etat NOT IN ('resolu','rejete') AND s.cree_le < NOW()-INTERVAL '${SLA_H} hours')::int AS retard,
      COUNT(*) FILTER (WHERE s.etat='resolu' AND s.resolu_le IS NOT NULL AND s.resolu_le >= s.cree_le AND EXTRACT(EPOCH FROM (s.resolu_le-s.cree_le))/3600 <= ${SLA_H})::int AS sla_conf
    FROM organisations o
    LEFT JOIN utilisateur u ON u.organisation_id = o.id
    LEFT JOIN signalement s ON s.assigne_a = u.id AND ${p.sql.replace(/^s\./, 's.')}
      ${effectiveCommuneId ? ' AND s.commune_id = ' + Number(effectiveCommuneId) : ''}
    WHERE o.type IN ('epic','direction') AND o.actif = TRUE
    GROUP BY o.id, o.nom ORDER BY recus DESC`, []);

  // ── SECTION 4 DATA: Zones récurrentes ──
  const { rows: topZones } = await query(`
    SELECT c.nom AS commune, COUNT(s.id)::int AS total,
      MODE() WITHIN GROUP (ORDER BY COALESCE(cs.famille, s.domaine::text)) AS categorie_dom
    FROM signalement s
    JOIN commune c ON c.id = s.commune_id
    LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
    ${fullWhere}
    GROUP BY c.nom ORDER BY total DESC LIMIT 10`, params);

  // Previous period top zones for comparison
  const { rows: prevZones } = await query(`
    SELECT c.nom AS commune, COUNT(s.id)::int AS total
    FROM signalement s JOIN commune c ON c.id = s.commune_id ${prevWhere}
    GROUP BY c.nom ORDER BY total DESC LIMIT 10`);
  const prevZoneMap = {};
  prevZones.forEach(z => { prevZoneMap[z.commune] = z.total; });

  // ── SECTION 5 DATA: Taux par catégorie ──
  const { rows: catStats } = await query(`
    SELECT COALESCE(cs.famille, s.domaine::text) AS famille, COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus
    FROM signalement s LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
    ${fullWhere} GROUP BY COALESCE(cs.famille, s.domaine::text) ORDER BY total DESC`, params);

  // Previous catégories for degradation detection
  const { rows: prevCats } = await query(`
    SELECT COALESCE(cs.famille, s.domaine::text) AS famille, COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus
    FROM signalement s LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
    ${prevWhere} GROUP BY COALESCE(cs.famille, s.domaine::text) ORDER BY total DESC`);
  const prevCatMap = {};
  prevCats.forEach(c => { prevCatMap[c.famille] = { total: c.total, resolus: c.resolus, taux: c.total > 0 ? Math.round(c.resolus / c.total * 100) : 0 }; });

  // ── SECTION 7 DATA: Tendances 6 mois ──
  let tendSql = `SELECT DATE_TRUNC('month', s.cree_le) AS mois,
    COUNT(*)::int AS recus, COUNT(*) FILTER (WHERE s.etat='resolu')::int AS resolus
    FROM signalement s WHERE s.cree_le >= NOW() - INTERVAL '6 months'`;
  if (effectiveCommuneId) tendSql += ` AND s.commune_id = ${Number(effectiveCommuneId)}`;
  tendSql += ` GROUP BY mois ORDER BY mois ASC`;
  const { rows: tendances } = await query(tendSql);

  // ICUA historique 6 mois
  const { rows: icuaHist } = await query(`SELECT calcule_le, score FROM icua_historique
    WHERE (commune_id = $1 OR ($1 IS NULL AND commune_id IS NULL))
    AND calcule_le >= NOW() - INTERVAL '6 months' ORDER BY calcule_le ASC`, [effectiveCommuneId || null]);

  // ── SECTION 8 DATA: Situations notables ──
  let deSql2 = `SELECT de.*, s.reference, o.nom AS org_nom,
    CASE WHEN de.statut='repondu' THEN 'Répondue' WHEN de.echeance < NOW() THEN 'En retard' ELSE 'En attente' END AS statut_label
    FROM demande_explication de
    JOIN signalement s ON s.id = de.signalement_id
    LEFT JOIN organisations o ON o.id = de.organisation_id
    ${fullWhere.replace(/s\./g, 's.')}
    ORDER BY de.cree_le DESC LIMIT 20`;
  let deList = [];
  try { const { rows } = await query(deSql2, params); deList = rows; } catch(e) { console.error('[rapports] échec liste demandes:', e.message); }

  // Classés sans suite
  const { rows: cssRows } = await query(`SELECT COUNT(*)::int AS n FROM signalement s ${fullWhere} AND s.etat='rejete'`, params);
  const cssCount = cssRows[0].n;

  // ══════════════════════════════════════════════
  // ── GÉNÉRATION PDF ──
  // ══════════════════════════════════════════════

  // Load org nom_ar for AR reports
  let orgNomArMap = {};
  if (isAr) {
    try {
      const { rows: orgsAr } = await query('SELECT id, nom, nom_ar FROM organisations WHERE actif = TRUE');
      orgsAr.forEach(o => { orgNomArMap[o.nom] = o.nom_ar || o.nom; });
    } catch(e) { console.error('[rapports] échec nom_ar organisation:', e.message); }
  }
  // Load commune nom_ar map
  let communeNomArMap = {};
  if (isAr) {
    try {
      const { rows: cAr } = await query('SELECT nom, nom_ar FROM commune');
      cAr.forEach(c => { communeNomArMap[c.nom] = c.nom_ar || c.nom; });
    } catch(e) { console.error('[rapports] échec nom_ar commune:', e.message); }
  }

  // ══════════════════════════════════════════════
  // ── RENDU PDF ──
  // AR = Puppeteer (HTML→PDF, RTL natif parfait)
  // FR = PDFKit (rendu direct, pas de dépendance Chrome)
  // ══════════════════════════════════════════════
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `rapport_executif_${Date.now()}.pdf`;
  const filepath = path.join(UPLOAD_DIR, filename);

  if (isAr) {
    // ── RENDU ARABE VIA PUPPETEER ──
    const puppeteer = require('puppeteer');
    const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const fmtDt = d => d ? new Date(d).toLocaleDateString('ar-DZ',{day:'numeric',month:'long',year:'numeric'}) : '—';
    const familleLabelsAr = {eau:'مياه',proprete:'نظافة',general:'عام',voirie:'طرق',eclairage:'إنارة',espaces_verts:'مساحات خضراء',stationnement:'مواقف',assainissement:'صرف صحي',securite:'أمن',environnement:'بيئة',batiments:'مباني',mobilier_urbain:'تجهيزات حضرية',transport:'نقل',nuisances:'إزعاج',animaux:'حيوانات',accessibilite:'ولوجية'};

    // Build HTML
    let orgRows = orgPerf.map(o => {
      const tx = o.recus > 0 ? Math.round(o.resolus/o.recus*100) : 0;
      const sla = o.recus > 0 ? Math.round((o.sla_conf||0)/Math.max(1,o.resolus)*100) : 0;
      const nm = esc((orgNomArMap[o.nom]||o.nom).replace(/^EPIC — /,''));
      return `<tr><td>${nm}</td><td>${o.recus}</td><td>${o.resolus}</td><td>${tx}%</td><td>${o.temps_h?o.temps_h+'س':'—'}</td><td class="${o.retard>0?'red':''}">${o.retard}</td><td>${sla}%</td></tr>`;
    }).join('');

    let zoneRows = topZones.map(z => {
      const prev = prevZoneMap[z.commune]||0;
      const cn = esc(communeNomArMap[z.commune]||z.commune);
      const cl = esc(familleLabelsAr[z.categorie_dom]||z.categorie_dom||'—');
      return `<tr><td>${cn}</td><td>${z.total}</td><td>${cl}</td><td class="${z.total>prev?'red':'green'}">${arrow(z.total,prev)} ${delta(z.total,prev)}</td></tr>`;
    }).join('');

    let catRows = catStats.map(c => {
      const tx = c.total>0?Math.round(c.resolus/c.total*100):0;
      const prev = prevCatMap[c.famille]; const prevTx = prev?prev.taux:tx;
      const degraded = prev && tx < prevTx - 5;
      const cl = esc(familleLabelsAr[c.famille]||c.famille||'—');
      return `<tr class="${degraded?'degraded':''}"><td>${cl}</td><td>${c.total}</td><td>${c.resolus}</td><td>${tx}%</td><td>${prev?arrow(tx,prevTx)+' '+delta(tx,prevTx)+'pts':'—'}</td>${degraded?'<td class="red">تدهور</td>':'<td></td>'}</tr>`;
    }).join('');

    let tendRows = tendances.map(t => {
      const tx = t.recus>0?Math.round(t.resolus/t.recus*100):0;
      const ml = new Date(t.mois).toLocaleDateString('ar-DZ',{month:'long',year:'numeric'});
      return `<tr><td>${ml}</td><td>${t.recus}</td><td>${t.resolus}</td><td>${tx}%</td></tr>`;
    }).join('');

    let icuaHistRows = icuaHist.map(h => {
      const d = new Date(h.calcule_le).toLocaleDateString('ar-DZ',{day:'numeric',month:'long',year:'numeric'});
      return `<div>${d} : ${h.score}/100</div>`;
    }).join('');

    let deRows = deList.length ? deList.map(de => {
      const on = esc(orgNomArMap[de.org_nom]||de.org_nom||'—');
      return `<div>#${de.reference} → ${on} — ${de.statut_label} (${fmtDt(de.cree_le)})</div>`;
    }).join('') : '<div class="muted">لا توجد طلبات توضيح</div>';

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Naskh Arabic','DejaVu Sans',serif; direction:rtl; color:#333; font-size:10px; line-height:1.6; }
  .cover { page-break-after:always; text-align:center; padding-top:140px; min-height:100vh; position:relative; }
  .cover .bar { position:absolute; top:0; left:0; right:0; height:6px; background:#063B5A; }
  .cover .bar-bottom { position:absolute; bottom:0; left:0; right:0; height:6px; background:#063B5A; }
  .cover h1 { font-size:13px; color:#063B5A; margin-bottom:12px; font-weight:700; }
  .cover h2 { font-size:24px; color:#041F38; margin-bottom:16px; font-weight:700; }
  .cover .line { width:120px; height:2px; background:#063B5A; margin:0 auto 24px; }
  .cover .period { font-size:14px; color:#063B5A; margin-bottom:8px; }
  .cover .perimetre { font-size:11px; color:#666; margin-bottom:40px; }
  .cover .date { font-size:9px; color:#999; }
  .cover .footer { position:absolute; bottom:30px; left:0; right:0; font-size:8px; color:#999; }
  .header { background:#041F38; color:white; padding:14px 24px; margin-bottom:16px; }
  .header h3 { font-size:14px; font-weight:700; color:white; margin-bottom:2px; }
  .header .sub { font-size:9px; color:#8ecae6; }
  .section { background:#063B5A; color:white; padding:5px 14px; border-radius:3px; font-size:10px; font-weight:700; margin:16px 0 8px; }
  table { width:100%; border-collapse:collapse; font-size:9px; margin-bottom:8px; }
  th { background:#f0f4f8; text-align:right; padding:5px 8px; font-weight:700; font-size:8px; color:#666; }
  td { padding:5px 8px; border-bottom:1px solid #e5e7eb; }
  .red { color:#EF4444; font-weight:700; }
  .green { color:#16a34a; }
  .degraded td { color:#EF4444; }
  .muted { color:#999; font-style:italic; }
  .kpi-grid { display:grid; grid-template-columns:1fr auto auto; gap:2px 16px; margin-bottom:8px; }
  .kpi-label { color:#666; font-size:9px; }
  .kpi-value { font-weight:700; font-size:12px; color:#041F38; }
  .kpi-delta { font-size:8px; color:#888; }
  .page-footer { text-align:center; font-size:7px; color:#999; margin-top:20px; }
  .content { padding:0 24px; }
</style></head><body>

<div class="cover">
  <div class="bar"></div>
  <h1>ولاية الجزائر</h1>
  <h2>تقرير النشاط</h2>
  <div class="line"></div>
  <div class="period">${esc(p.labelAr)}</div>
  <div class="perimetre">النطاق : ${esc(perimetreTitre)}</div>
  <div class="date">تاريخ الإنشاء : ${new Date().toLocaleString('ar-DZ')}</div>
  <div class="footer">ALGERNA — منصة الحوكمة المدنية</div>
  <div class="bar-bottom"></div>
</div>

<div class="header">
  <h3>الملخص التنفيذي</h3>
  <div class="sub">${esc(p.labelAr)} — ${esc(perimetreTitre)}</div>
</div>
<div class="content">

<div class="section">المؤشرات الرئيسية</div>
<div class="kpi-grid">
  <div class="kpi-label">بلاغات واردة</div><div class="kpi-value">${kR}</div><div class="kpi-delta">${delta(kR,pR)} ${arrow(kR,pR)}</div>
  <div class="kpi-label">تمت معالجتها</div><div class="kpi-value">${kRs}</div><div class="kpi-delta">${delta(kRs,pRs)} ${arrow(kRs,pRs)}</div>
  <div class="kpi-label">قيد المعالجة</div><div class="kpi-value">${Math.max(0,kEnCours)}</div><div class="kpi-delta"></div>
  <div class="kpi-label">معدل المعالجة</div><div class="kpi-value">${kTx}%</div><div class="kpi-delta">${pTx?delta(kTx,pTx)+'pts '+arrow(kTx,pTx):''}</div>
  <div class="kpi-label">المدة المتوسطة (ساعة)</div><div class="kpi-value">${kT||'—'}</div><div class="kpi-delta">${pT?delta(kT,pT)+'س '+arrow(kT,pT):''}</div>
  <div class="kpi-label">نسبة الالتزام بالمهلة</div><div class="kpi-value">${slaPct}%</div><div class="kpi-delta"></div>
  <div class="kpi-label">متأخرة</div><div class="kpi-value">${kRet}</div><div class="kpi-delta"></div>
  <div class="kpi-label">مؤشر الأداء الحضري (ICUA)</div><div class="kpi-value">${icuaScore}</div><div class="kpi-delta">${prevIcua?delta(icuaScore,prevIcua)+' '+arrow(icuaScore,prevIcua):''}</div>
  <div class="kpi-label">طلبات توضيح</div><div class="kpi-value">${deCount}</div><div class="kpi-delta"></div>
</div>

<div class="section">أداء المديريات</div>
<table><tr><th>المديرية</th><th>واردة</th><th>معالجة</th><th>المعدل</th><th>المدة</th><th>متأخرة</th><th>SLA</th></tr>${orgRows||'<tr><td colspan="7" class="muted">لا توجد بيانات</td></tr>'}</table>

<div class="section">المناطق المتكررة</div>
<table><tr><th>البلدية</th><th>العدد</th><th>التصنيف</th><th>التطور</th></tr>${zoneRows||'<tr><td colspan="4" class="muted">لا توجد بيانات</td></tr>'}</table>

<div class="section">المعدل حسب التصنيف</div>
<table><tr><th>التصنيف</th><th>العدد</th><th>معالجة</th><th>المعدل</th><th>التطور</th><th></th></tr>${catRows}</table>

<div class="section">رضا المواطنين</div>
<p class="muted" style="margin:8px 0;">بيانات الرضا : لم يتم تفعيل الجمع بعد. سيتم دمج هذا القسم عند إطلاق استبيانات الرضا.</p>

<div class="section">الاتجاهات — 6 أشهر</div>
${tendRows?'<table><tr><th>الشهر</th><th>واردة</th><th>معالجة</th><th>المعدل</th></tr>'+tendRows+'</table>':'<p class="muted">لا توجد بيانات كافية</p>'}
${icuaHistRows?'<div style="margin-top:8px;"><strong>تطور مؤشر ICUA</strong>'+icuaHistRows+'</div>':''}

<div class="section">الحالات البارزة</div>
<div style="margin-bottom:8px;"><strong>طلبات التوضيح</strong></div>
${deRows}
<div style="margin-top:12px;"><strong>ملفات مرفوضة</strong></div>
<div>${cssCount>0?cssCount+' ملف مرفوض في هذه الفترة':'لا توجد ملفات مرفوضة'}</div>

</div>
</body></html>`;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.pdf({ path: filepath, format: 'A4', margin: { top:'15mm', bottom:'15mm', left:'12mm', right:'12mm' }, printBackground: true });
    await browser.close();

  } else {
    // ── RENDU FRANÇAIS VIA PDFKIT ──
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    const fonts = setupDoc(doc, false);
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    const W = doc.page.width - 80;

    // Page de garde blanche
    doc.rect(0, 0, doc.page.width, 6).fill('#063B5A');
    const logoPath = path.join(__dirname, '../../../public/assets/logo/algerna_icon.png');
    if (fs.existsSync(logoPath)) doc.image(logoPath, (doc.page.width - 80) / 2, 120, { width: 80 });
    doc.font(fonts.fontB).fontSize(13).fillColor('#063B5A').text('WILAYA D\'ALGER', 40, 220, { width: W, align: 'center' });
    doc.moveDown(1);
    doc.font(fonts.fontB).fontSize(24).fillColor('#041F38').text('RAPPORT D\'ACTIVITÉ', 40, doc.y, { width: W, align: 'center' });
    doc.moveDown(1);
    doc.rect(doc.page.width / 2 - 60, doc.y, 120, 2).fill('#063B5A');
    doc.moveDown(1.5);
    doc.font(fonts.fontR).fontSize(14).fillColor('#063B5A').text(p.label, 40, doc.y, { width: W, align: 'center' });
    doc.moveDown(1);
    doc.font(fonts.fontR).fontSize(11).fillColor('#666666').text('Périmètre : ' + perimetreTitre, 40, doc.y, { width: W, align: 'center' });
    doc.moveDown(4);
    doc.font(fonts.fontR).fontSize(9).fillColor('#999999').text('Généré le ' + new Date().toLocaleString('fr-DZ'), 40, doc.y, { width: W, align: 'center' });
    doc.rect(0, doc.page.height - 30, doc.page.width, 6).fill('#063B5A');
    doc.font(fonts.fontR).fontSize(8).fillColor('#999999').text('ALGERNA — Plateforme de gouvernance civique', 40, doc.page.height - 50, { width: W, align: 'center' });

  // ── SYNTHÈSE EXÉCUTIVE (Section 2) ──
  doc.addPage();
  let y = drawHeader(doc, fonts, 'Synthèse exécutive', p.label + ' — ' + perimetreTitre, false);

  y = sectionTitle(doc, fonts, y, 'Chiffres clés de la période');

  const kpis = [
    ['Signalements reçus', kR, delta(kR, pR) + ' ' + arrow(kR, pR)],
    ['Résolus', kRs, delta(kRs, pRs) + ' ' + arrow(kRs, pRs)],
    ['En cours', Math.max(0, kEnCours), ''],
    ['Taux de résolution', kTx + '%', (pTx ? delta(kTx, pTx) + 'pts ' + arrow(kTx, pTx) : '')],
    ['Temps moyen (h)', kT || '—', (pT ? delta(kT, pT) + 'h ' + arrow(kT, pT) : '')],
    ['Conformité SLA', slaPct + '%', ''],
    ['En retard (hors délai)', kRet, ''],
    ['Score ICUA', icuaScore, (prevIcua ? delta(icuaScore, prevIcua) + ' ' + arrow(icuaScore, prevIcua) : '')],
    ['Demandes d\'explication', deCount, ''],
  ];

  kpis.forEach(([label, value, variation]) => {
    doc.font(fonts.fontR).fontSize(9).fillColor('#666').text(label, 50, y, { width: 200 });
    doc.font(fonts.fontB).fontSize(11).fillColor('#041F38').text(String(value), 260, y);
    if (variation) doc.font(fonts.fontR).fontSize(8).fillColor('#888').text(variation, 320, y);
    y += 16;
    if (y > 720) { doc.addPage(); y = 40; }
  });
  y += 10;

  // ── PERFORMANCE DES DIRECTIONS (Section 3) ──
  y = sectionTitle(doc, fonts, y, 'Performance des directions (EPIC)');
  const familleLabels = {eau:'Eau',proprete:'Propreté',general:'Divers',voirie:'Voirie',eclairage:'Éclairage',espaces_verts:'Espaces verts',stationnement:'Stationnement',assainissement:'Assainissement',securite:'Sécurité',environnement:'Environnement',batiments:'Bâtiments',mobilier_urbain:'Mobilier urbain',transport:'Transport',nuisances:'Nuisances',animaux:'Animaux',accessibilite:'Accessibilité'};
  if (orgPerf.length) {
    doc.font(fonts.fontB).fontSize(7).fillColor('#666');
    const cols = [50, 200, 240, 280, 320, 370, 420];
    ['Direction','Reçus','Résol.','Taux','Temps','Retard','SLA'].forEach((h, i) => doc.text(h, cols[i], y, { width: 50 }));
    y += 12;
    orgPerf.forEach(o => {
      if (y > 720) { doc.addPage(); y = 40; }
      const tx = o.recus > 0 ? Math.round(o.resolus / o.recus * 100) : 0;
      const sla = o.recus > 0 ? Math.round((o.sla_conf || 0) / Math.max(1, o.resolus) * 100) : 0;
      doc.font(fonts.fontR).fontSize(8).fillColor('#333');
      doc.text(o.nom.replace(/^EPIC — /, ''), cols[0], y, { width: 145 });
      doc.text(String(o.recus), cols[1], y); doc.text(String(o.resolus), cols[2], y);
      doc.text(tx + '%', cols[3], y); doc.text(o.temps_h ? o.temps_h + 'h' : '—', cols[4], y);
      doc.fillColor(o.retard > 0 ? '#EF4444' : '#333').text(String(o.retard), cols[5], y);
      doc.fillColor('#333').text(sla + '%', cols[6], y);
      y += 13;
    });
  } else { doc.font(fonts.fontR).fontSize(9).fillColor('#999').text('Aucune donnée', 50, y); }
  y += 15;

  // ── ZONES RÉCURRENTES (Section 4) ──
  if (y > 650) { doc.addPage(); y = 40; }
  y = sectionTitle(doc, fonts, y, 'Zones récurrentes (top 10)');
  if (topZones.length) {
    doc.font(fonts.fontB).fontSize(7).fillColor('#666');
    doc.text('Commune', 50, y); doc.text('Total', 230, y); doc.text('Catégorie dominante', 290, y); doc.text('Évolution', 440, y);
    y += 12;
    topZones.forEach(z => {
      if (y > 720) { doc.addPage(); y = 40; }
      const prev = prevZoneMap[z.commune] || 0;
      doc.font(fonts.fontR).fontSize(8).fillColor('#333');
      doc.text(z.commune, 50, y, { width: 175 }); doc.text(String(z.total), 230, y);
      doc.text(familleLabels[z.categorie_dom] || z.categorie_dom || '—', 290, y, { width: 145 });
      doc.fillColor(z.total > prev ? '#EF4444' : '#16a34a').text(arrow(z.total, prev) + ' ' + delta(z.total, prev), 440, y);
      doc.fillColor('#333'); y += 13;
    });
  } else { doc.font(fonts.fontR).fontSize(9).fillColor('#999').text('Aucune donnée', 50, y); y += 14; }
  y += 15;

  // ── TAUX PAR CATÉGORIE (Section 5) ──
  if (y > 600) { doc.addPage(); y = 40; }
  y = sectionTitle(doc, fonts, y, 'Taux de résolution par catégorie');
  if (catStats.length) {
    doc.font(fonts.fontB).fontSize(7).fillColor('#666');
    doc.text('Catégorie', 50, y); doc.text('Total', 230, y); doc.text('Résolus', 280, y); doc.text('Taux', 340, y); doc.text('Tendance', 400, y);
    y += 12;
    catStats.forEach(c => {
      if (y > 720) { doc.addPage(); y = 40; }
      const tx = c.total > 0 ? Math.round(c.resolus / c.total * 100) : 0;
      const prev = prevCatMap[c.famille]; const prevTx = prev ? prev.taux : tx;
      const degraded = prev && tx < prevTx - 5;
      doc.font(fonts.fontR).fontSize(8).fillColor(degraded ? '#EF4444' : '#333');
      doc.text(familleLabels[c.famille] || c.famille || '—', 50, y, { width: 175 });
      doc.text(String(c.total), 230, y); doc.text(String(c.resolus), 280, y);
      doc.text(tx + '%', 340, y);
      doc.text(prev ? arrow(tx, prevTx) + ' ' + delta(tx, prevTx) + 'pts' : '—', 400, y);
      if (degraded) doc.text('dégradation', 460, y);
      doc.fillColor('#333'); y += 13;
    });
  }
  y += 15;

  // ── SATISFACTION CITOYENNE (Section 6) ──
  if (y > 650) { doc.addPage(); y = 40; }
  y = sectionTitle(doc, fonts, y, 'Satisfaction citoyenne');
  doc.font(fonts.fontR).fontSize(9).fillColor('#666');
  doc.text('Données de satisfaction : collecte non activée. Cette section sera alimentée à l\'activation des enquêtes de satisfaction citoyenne.', 50, y, { width: W, lineGap: 3 });
  y = doc.y + 15;

  // ── TENDANCES (Section 7) ──
  if (y > 550) { doc.addPage(); y = 40; }
  y = sectionTitle(doc, fonts, y, 'Tendances — 6 derniers mois');
  if (tendances.length) {
    doc.font(fonts.fontB).fontSize(7).fillColor('#666');
    doc.text('Mois', 50, y); doc.text('Reçus', 180, y); doc.text('Résolus', 240, y); doc.text('Taux', 310, y);
    y += 12;
    tendances.forEach(t => {
      if (y > 720) { doc.addPage(); y = 40; }
      const tx = t.recus > 0 ? Math.round(t.resolus / t.recus * 100) : 0;
      doc.font(fonts.fontR).fontSize(8).fillColor('#333');
      doc.text(new Date(t.mois).toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' }), 50, y, { width: 125 });
      doc.text(String(t.recus), 180, y); doc.text(String(t.resolus), 240, y); doc.text(tx + '%', 310, y);
      y += 13;
    });
    y += 8;
    if (icuaHist.length) {
      doc.font(fonts.fontB).fontSize(8).fillColor('#041F38').text('Évolution ICUA', 50, y); y += 14;
      icuaHist.forEach(h => {
        const d = new Date(h.calcule_le).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' });
        doc.font(fonts.fontR).fontSize(8).fillColor('#333').text(d + ' : ' + h.score + '/100', 60, y); y += 12;
        if (y > 720) { doc.addPage(); y = 40; }
      });
    }
  } else { doc.font(fonts.fontR).fontSize(9).fillColor('#999').text('Données insuffisantes', 50, y); y += 14; }
  y += 15;

  // ── SITUATIONS NOTABLES (Section 8) ──
  if (y > 550) { doc.addPage(); y = 40; }
  y = sectionTitle(doc, fonts, y, 'Situations notables');
  doc.font(fonts.fontB).fontSize(9).fillColor('#041F38').text('Demandes d\'explication émises', 50, y); y += 14;
  if (deList.length) {
    deList.forEach(de => {
      if (y > 720) { doc.addPage(); y = 40; }
      doc.font(fonts.fontR).fontSize(8).fillColor('#333');
      doc.text(`#${de.reference} → ${de.org_nom || '—'} — ${de.statut_label} (${fmtDate(de.cree_le)})`, 60, y, { width: W - 20 }); y += 12;
    });
  } else { doc.font(fonts.fontR).fontSize(8).fillColor('#999').text('Aucune demande d\'explication sur la période', 60, y); y += 12; }
  y += 10;
  doc.font(fonts.fontB).fontSize(9).fillColor('#041F38').text('Dossiers rejetés', 50, y); y += 14;
  doc.font(fonts.fontR).fontSize(8).fillColor('#333');
  doc.text(cssCount > 0 ? `${cssCount} dossier${cssCount > 1 ? 's' : ''} rejeté${cssCount > 1 ? 's' : ''} sur la période.` : 'Aucun dossier rejeté sur la période.', 60, y, { width: W - 20 });

  // Footer
  const contentPages = doc.bufferedPageRange().count;
  for (let i = 1; i < contentPages; i++) {
    doc.switchToPage(i);
    doc.font(fonts.fontR).fontSize(7).fillColor('#999');
    doc.text('ALGERNA — Rapport confidentiel — Page ' + i + '/' + (contentPages - 1), 40, doc.page.height - 30, { width: doc.page.width - 80, align: 'center', lineBreak: false });
  }

  doc.end();
  await new Promise((resolve, reject) => { stream.on('finish', resolve); stream.on('error', reject); });
  } // end else (FR PDFKit)

  // Journal
  const titre = isAr
    ? `تقرير تنفيذي — ${perimetreTitre} — ${p.labelAr}`
    : `Rapport exécutif — ${perimetreTitre} — ${p.label}`;
  try {
    await query(`INSERT INTO signalement_historique (signalement_id, etat, par_utilisateur, action, commentaire)
      SELECT id, etat, $1, 'rapport_executif', $2 FROM signalement LIMIT 1`, [req.user.id, titre]);
  } catch(e) { console.error('[rapports] échec historique rapport:', e.message); }
  await query(`INSERT INTO rapport_genere (url, filename, type, titre, genere_par) VALUES ($1,$2,$3,$4,$5)`,
    ['/uploads/rapports/' + filename, filename, 'executif', titre, req.user.id]);

  res.json({ ok: true, url: '/uploads/rapports/' + filename, filename });
}));

// ═══ GET /mes-rapports — liste des rapports générés ═══
router.get('/mes-rapports', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT r.*, u.prenom, u.nom FROM rapport_genere r
     LEFT JOIN utilisateur u ON u.id = r.genere_par
     WHERE r.genere_par = $1
     ORDER BY r.cree_le DESC LIMIT 50`,
    [req.user.id]);
  res.json(rows);
}));

module.exports = router;
