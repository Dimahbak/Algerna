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
  doc.rect(0, 0, doc.page.width, 70).fill('#041F38');
  doc.font(fonts.fontB).fontSize(16).fillColor('#FFFFFF');
  doc.text('ALGERNA', 40, 18, { width: doc.page.width - 80 });
  doc.font(fonts.fontR).fontSize(9).fillColor('#8ecae6');
  doc.text('Wilaya d\'Alger — Plateforme de gouvernance civique', 40, 38, { width: doc.page.width - 80 });
  doc.moveDown(2);
  doc.fillColor('#041F38').font(fonts.fontB).fontSize(14);
  doc.text(title, 40, 85, { width: doc.page.width - 80 });
  doc.font(fonts.fontR).fontSize(9).fillColor('#666666');
  doc.text(subtitle, 40, 105, { width: doc.page.width - 80 });
  doc.text('Généré le ' + new Date().toLocaleString('fr-DZ'), 40, 118, { width: doc.page.width - 80 });
  doc.moveDown(3);
  return 140;
}

function sectionTitle(doc, fonts, y, label) {
  if (y > 700) { doc.addPage(); y = 40; }
  doc.rect(40, y, doc.page.width - 80, 22).fill('#063B5A');
  doc.font(fonts.fontB).fontSize(10).fillColor('#FFFFFF');
  doc.text(label, 50, y + 5, { width: doc.page.width - 100 });
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
  } catch(e) {}

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
  const effectiveCommune = commune_id || (isCommune ? req.user.commune_id : null);

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

// ═══ GET /mes-rapports — liste des rapports générés ═══
router.get('/mes-rapports', authenticate, requirePilotage(), asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT r.*, u.prenom, u.nom FROM rapport_genere r
     LEFT JOIN utilisateur u ON u.id = r.genere_par
     ORDER BY r.cree_le DESC LIMIT 50`);
  res.json(rows);
}));

module.exports = router;
