/**
 * Service de signalements — SOCLE COMMUN.
 * CiviSignal (propreté) et WaterSignal (eau) appellent ces fonctions
 * en passant simplement leur 'domaine'. ~90% du code est partagé ;
 * seules les catégories et l'opérateur routé diffèrent.
 */
const { query, withTransaction } = require('../../db/pool');
const { makeReference, badRequest, notFound } = require('../../utils/http');

const PREFIX = { proprete: 'PRO', eau: 'EAU' };
const POIDS_CRITICITE = { haute: 3, moyenne: 2, basse: 1 };

const SEUIL_POINT_NOIR = 3;        // signalements convergents
const RAYON_DEG = 0.0005;          // ~50 m
const POINTS_CREATION = 10;        // points Citoyen Sentinelle

// Liste les catégories d'un domaine (avec EPIC associé si applicable)
async function listCategories(domaine) {
  const { rows } = await query(
    `SELECT cs.id, cs.libelle, cs.criticite, cs.epic_id, e.sigle AS epic_sigle
       FROM categorie_signal cs
       LEFT JOIN epic e ON e.id = cs.epic_id AND e.actif = TRUE
      WHERE cs.domaine=$1 ORDER BY cs.id`,
    [domaine]);
  return rows;
}

// Résout l'opérateur compétent pour une commune et un domaine
async function resoudreOperateur(communeId, domaine) {
  if (!communeId) return null;
  const { rows } = await query(
    `SELECT o.id FROM operateur o
       JOIN operateur_perimetre p ON p.operateur_id=o.id
      WHERE p.commune_id=$1 AND o.domaine=$2 LIMIT 1`,
    [communeId, domaine]);
  return rows.length ? rows[0].id : null;
}

// Crée un signalement + historique + points, en transaction
async function creer(domaine, data) {
  const { categorieId, lat, lng, communeId, description, photoPath, citoyenId } = data;

  const cat = await query(
    'SELECT id, epic_id FROM categorie_signal WHERE id=$1 AND domaine=$2', [categorieId, domaine]);
  if (!cat.rowCount) throw badRequest('Catégorie inconnue pour ce domaine.');

  // Si la catégorie est liée à un EPIC spécifique, on l'utilise ; sinon routage par commune/opérateur
  const epicId = cat.rows[0].epic_id || null;
  const operateurId = epicId ? null : await resoudreOperateur(communeId, domaine);
  const reference = makeReference(PREFIX[domaine]);

  return withTransaction(async (c) => {
    const { rows } = await c.query(
      `INSERT INTO signalement
         (reference,domaine,categorie_id,citoyen_id,commune_id,operateur_id,epic_id,lat,lng,description,photo_path,etat)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'recu')
       RETURNING *`,
      [reference, domaine, categorieId, citoyenId || null, communeId || null,
       operateurId, epicId, lat, lng, description || null, photoPath || null]);
    const sig = rows[0];

    await c.query(
      'INSERT INTO signalement_historique(signalement_id,etat,par_utilisateur) VALUES ($1,$2,$3)',
      [sig.id, 'recu', citoyenId || null]);

    if (citoyenId) {
      await c.query(
        `INSERT INTO points_journal(citoyen_id,delta,motif,ref_type,ref_id)
         VALUES ($1,$2,'Signalement créé','signalement',$3)`,
        [citoyenId, POINTS_CREATION, sig.id]);
      await c.query('UPDATE utilisateur SET points=points+$1 WHERE id=$2',
        [POINTS_CREATION, citoyenId]);
    }
    return { signalement: sig, pointsGagnes: citoyenId ? POINTS_CREATION : 0 };
  });
}

// Liste filtrée (vue agent/opérateur/wilaya)
async function lister(domaine, { communeId, etat, operateurId, page, limit } = {}) {
  const pg = Math.max(1, parseInt(page || '1', 10));
  const lm = Math.min(100, parseInt(limit || '20', 10));
  const offset = (pg - 1) * lm;

  const cond = ['s.domaine=$1'];
  const params = [domaine];
  if (communeId)   { params.push(communeId);   cond.push(`s.commune_id=$${params.length}`); }
  if (etat)        { params.push(etat);         cond.push(`s.etat=$${params.length}`); }
  if (operateurId) { params.push(operateurId);  cond.push(`s.operateur_id=$${params.length}`); }
  const where = cond.join(' AND ');

  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM signalement s WHERE ${where}`, params);
  const total = parseInt(countRows[0].count, 10);

  params.push(lm); params.push(offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const { rows } = await query(
    `SELECT s.*,
            cat.libelle AS categorie, cat.criticite,
            com.nom AS commune
     FROM signalement s
     JOIN categorie_signal cat ON cat.id = s.categorie_id
     LEFT JOIN commune com ON com.id = s.commune_id
     WHERE ${where}
     ORDER BY s.cree_le DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params);
  return { data: rows, total, page: pg, pages: Math.ceil(total / lm) };
}

// Change l'état + journalise. preuvePath optionnel à la résolution.
async function changerEtat(domaine, id, etat, parUtilisateur, preuvePath) {
  const valides = ['recu','transmis','en_intervention','resolu','rejete'];
  if (!valides.includes(etat)) throw badRequest('État invalide.', { valides });

  return withTransaction(async (c) => {
    const { rows } = await c.query(
      'SELECT * FROM signalement WHERE id=$1 AND domaine=$2', [id, domaine]);
    if (!rows.length) throw notFound('Signalement introuvable.');

    const resoluLe = etat === 'resolu' ? 'now()' : 'resolu_le';
    await c.query(
      `UPDATE signalement
         SET etat=$1, resolu_le=${resoluLe}, preuve_path=COALESCE($2,preuve_path)
       WHERE id=$3`,
      [etat, preuvePath || null, id]);
    await c.query(
      'INSERT INTO signalement_historique(signalement_id,etat,par_utilisateur) VALUES ($1,$2,$3)',
      [id, etat, parUtilisateur || null]);

    const { rows: maj } = await c.query('SELECT * FROM signalement WHERE id=$1', [id]);
    const sig = maj[0];

    // Hook résolution : message d'impact + points validation
    if (etat === 'resolu' && sig.citoyen_id) {
      try {
        // Construire le message d'impact personnalisé
        const { rows: uRows } = await c.query('SELECT prenom FROM utilisateur WHERE id=$1', [sig.citoyen_id]);
        const { rows: catRows } = await c.query('SELECT libelle FROM categorie_signal WHERE id=$1', [sig.categorie_id]);
        const { rows: comRows } = await c.query('SELECT nom FROM commune WHERE id=$1', [sig.commune_id]);
        const prenom = uRows[0]?.prenom || 'Citoyen';
        const categorie = catRows[0]?.libelle || 'problème signalé';
        const commune = comRows[0]?.nom || '';
        const msg = commune
          ? `Merci ${prenom} ! Votre signalement « ${categorie} » à ${commune} a été traité. Le problème est résolu.`
          : `Merci ${prenom} ! Votre signalement « ${categorie} » a été traité. Le problème est résolu.`;
        await c.query(
          'INSERT INTO impact_message (citoyen_id, signalement_id, message) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
          [sig.citoyen_id, sig.id, msg]);
        // Points Citoyens : +20 pour validation après intervention (le plus valorisé)
        const { awardPoints } = require('../../utils/points');
        await awardPoints(sig.citoyen_id, 'validation_resolution', 'signalement', sig.id);
      } catch (e) { console.warn('[impact]', e.message); }
    }

    return sig;
  });
}

// Score par commune (0–100). 100 = aucun signalement ouvert.
async function scoresParCommune(domaine) {
  const { rows } = await query(
    `SELECT s.commune_id, c.nom AS commune,
            COUNT(*) FILTER (WHERE s.etat <> 'resolu') AS ouverts,
            COUNT(*) FILTER (WHERE s.etat = 'resolu')  AS resolus,
            COALESCE(SUM(
              CASE cat.criticite WHEN 'haute' THEN 3 WHEN 'moyenne' THEN 2 ELSE 1 END
            ) FILTER (WHERE s.etat <> 'resolu'),0) AS penalite
       FROM signalement s
       JOIN categorie_signal cat ON cat.id=s.categorie_id
       LEFT JOIN commune c ON c.id=s.commune_id
      WHERE s.domaine=$1
      GROUP BY s.commune_id, c.nom`,
    [domaine]);
  return rows.map(r => ({
    communeId: r.commune_id,
    commune: r.commune,
    ouverts: Number(r.ouverts),
    resolus: Number(r.resolus),
    score: Math.max(0, 100 - Number(r.penalite) * 4),
  }));
}

// Détection des points noirs (clustering simple par proximité)
async function pointsNoirs(domaine) {
  const { rows } = await query(
    `SELECT lat,lng,commune_id FROM signalement
      WHERE domaine=$1 AND etat <> 'resolu'`, [domaine]);
  const clusters = [];
  for (const r of rows) {
    const c = clusters.find(cl =>
      Math.hypot(cl.lat - r.lat, cl.lng - r.lng) <= RAYON_DEG);
    if (c) c.items.push(r);
    else clusters.push({ lat: r.lat, lng: r.lng, communeId: r.commune_id, items: [r] });
  }
  return clusters
    .filter(c => c.items.length >= SEUIL_POINT_NOIR)
    .map(c => ({ lat: c.lat, lng: c.lng, communeId: c.communeId, nombre: c.items.length }));
}

// Délai moyen de résolution en heures (indicateur SLA clé, surtout pour l'eau)
async function delaiMoyenHeures(domaine, communeId) {
  const params = [domaine];
  let filtreCommune = '';
  if (communeId) { params.push(communeId); filtreCommune = ' AND commune_id=$2'; }
  const { rows } = await query(
    `SELECT AVG(EXTRACT(EPOCH FROM (resolu_le - cree_le))/3600) AS h
       FROM signalement
      WHERE domaine=$1 AND etat='resolu' AND resolu_le IS NOT NULL${filtreCommune}`,
    params);
  return rows[0].h !== null ? Math.round(Number(rows[0].h)) : null;
}

module.exports = {
  listCategories, creer, lister, changerEtat,
  scoresParCommune, pointsNoirs, delaiMoyenHeures,
  resoudreOperateur,
};
