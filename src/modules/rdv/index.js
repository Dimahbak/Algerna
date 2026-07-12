/**
 * CiviAdmin — rendez-vous & file d'attente virtuelle.
 * Tri Famille A (redirigé) / Famille B (présence requise).
 */
const express = require('express');
const { z } = require('zod');
const { query, withTransaction } = require('../../db/pool');
const { validate } = require('../../middleware/validation');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, badRequest, notFound } = require('../../utils/http');

const router = express.Router();

// GET /api/rdv/services (enrichi)
router.get('/services', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT id, nom, famille, duree_min, categorie, description,
            pieces_requises, formulaires, frais, delai_reel, assistant_questions
       FROM service ORDER BY famille, categorie, nom`);
  res.json(rows);
}));

// GET /api/rdv/services/:id — détail démarche
router.get('/services/:id', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM service WHERE id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Démarche introuvable.');
  res.json(rows[0]);
}));

// GET /api/rdv/creneaux?communeId=&serviceId=
router.get('/creneaux', asyncH(async (req, res) => {
  const { communeId, serviceId } = req.query;
  if (!communeId || !serviceId) throw badRequest('communeId et serviceId requis.');
  const svc = await query('SELECT famille FROM service WHERE id=$1', [serviceId]);
  if (!svc.rowCount) throw notFound('Service inconnu.');
  if (svc.rows[0].famille === 'A') {
    return res.json({ familleA: true, message: 'Démarche déjà dématérialisée — voir le portail national.', creneaux: [] });
  }
  const { rows } = await query(
    `SELECT c.id, c.debut, c.capacite,
            c.capacite - COUNT(r.id) FILTER (WHERE r.statut IN ('reserve','present')) AS restants
       FROM creneau c
       LEFT JOIN rdv r ON r.creneau_id=c.id
      WHERE c.commune_id=$1 AND c.service_id=$2 AND c.debut > now()
      GROUP BY c.id
      HAVING c.capacite - COUNT(r.id) FILTER (WHERE r.statut IN ('reserve','present')) > 0
      ORDER BY c.debut`,
    [communeId, serviceId]);
  res.json({ familleA: false, creneaux: rows });
}));

const reserverSchema = z.object({
  creneauId: z.number().int(),
  public_prioritaire: z.enum(['age', 'handicap', 'femme_enceinte']).optional().nullable(),
});

// POST /api/rdv — réserver un créneau (avec option prioritaire)
router.post('/', authenticate, validate(reserverSchema), asyncH(async (req, res) => {
  const { creneauId, public_prioritaire } = req.body;
  const result = await withTransaction(async (c) => {
    const cr = await c.query('SELECT * FROM creneau WHERE id=$1 FOR UPDATE', [creneauId]);
    if (!cr.rowCount) throw notFound('Créneau introuvable.');
    const pris = await c.query(
      `SELECT COUNT(*) AS n FROM rdv WHERE creneau_id=$1 AND statut IN ('reserve','present')`,
      [creneauId]);
    if (Number(pris.rows[0].n) >= cr.rows[0].capacite) throw badRequest('Créneau complet.');
    const numero = Number(pris.rows[0].n) + 1;
    const { rows } = await c.query(
      `INSERT INTO rdv(creneau_id,citoyen_id,numero_ticket,statut,public_prioritaire)
       VALUES ($1,$2,$3,'reserve',$4) RETURNING *`,
      [creneauId, req.user.id, numero, public_prioritaire || null]);
    return rows[0];
  });
  res.status(201).json(result);
}));

// GET /api/rdv/mes
router.get('/mes', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT r.*, c.debut, s.nom AS service, s.id AS service_id, cm.nom AS commune, c.commune_id
       FROM rdv r
       JOIN creneau c ON c.id=r.creneau_id
       JOIN service s ON s.id=c.service_id
       JOIN commune cm ON cm.id=c.commune_id
      WHERE r.citoyen_id=$1 ORDER BY c.debut DESC`,
    [req.user.id]);
  res.json(rows);
}));

const statutSchema = z.object({ statut: z.enum(['present','absent','annule','traite']) });

// PATCH /api/rdv/:id/statut
router.patch('/:id/statut',
  authenticate, requireRole('agent','admin_apc','admin_wilaya'),
  validate(statutSchema),
  asyncH(async (req, res) => {
    const { rows } = await query(
      'UPDATE rdv SET statut=$1, maj_le=now() WHERE id=$2 RETURNING *',
      [req.body.statut, req.params.id]);
    if (!rows.length) throw notFound('RDV introuvable.');
    res.json(rows[0]);
  }));

// PATCH /api/rdv/:id/annuler — citoyen annule son propre RDV
router.patch('/:id/annuler', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    "UPDATE rdv SET statut='annule', maj_le=now() WHERE id=$1 AND citoyen_id=$2 AND statut='reserve' RETURNING *",
    [req.params.id, req.user.id]);
  if (!rows.length) throw badRequest('RDV introuvable ou déjà traité.');
  res.json(rows[0]);
}));

// ═══════════════════════════════════════════════════
// GESTION ADMIN DES CRÉNEAUX
// ═══════════════════════════════════════════════════

const creneauSchema = z.object({
  communeId:   z.number().int(),
  serviceId:   z.number().int(),
  debut:       z.string().min(10),
  capacite:    z.number().int().min(1).max(200).default(10),
  repetitions: z.number().int().min(1).max(60).default(1),
});

// GET /api/rdv/admin/creneaux
router.get('/admin/creneaux',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  asyncH(async (req, res) => {
    const { communeId, serviceId } = req.query;
    let sql = `SELECT c.id, c.debut, c.capacite, c.commune_id, c.service_id,
                      cm.nom AS commune, s.nom AS service, s.duree_min,
                      COUNT(r.id) FILTER (WHERE r.statut IN ('reserve','present')) AS reserves
               FROM creneau c
               JOIN commune cm ON cm.id=c.commune_id
               JOIN service s ON s.id=c.service_id
               LEFT JOIN rdv r ON r.creneau_id=c.id
               WHERE c.debut > now()`;
    const params = [];
    if (communeId) { params.push(communeId); sql += ` AND c.commune_id=$${params.length}`; }
    if (serviceId) { params.push(serviceId); sql += ` AND c.service_id=$${params.length}`; }
    sql += ' GROUP BY c.id, cm.nom, s.nom, s.duree_min ORDER BY c.debut LIMIT 200';
    const { rows } = await query(sql, params);
    res.json(rows);
  }));

// POST /api/rdv/admin/creneaux — créer 1 à N créneaux consécutifs
router.post('/admin/creneaux',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  validate(creneauSchema),
  asyncH(async (req, res) => {
    const { communeId, serviceId, debut, capacite, repetitions } = req.body;
    const [cm, sv] = await Promise.all([
      query('SELECT id FROM commune WHERE id=$1', [communeId]),
      query('SELECT id,famille,duree_min FROM service WHERE id=$1', [serviceId]),
    ]);
    if (!cm.rowCount) throw badRequest('Commune introuvable.');
    if (!sv.rowCount) throw badRequest('Service introuvable.');
    if (sv.rows[0].famille === 'A') throw badRequest('Service dématérialisé (Famille A) — pas de créneau requis.');
    const duree = sv.rows[0].duree_min || 30;
    const debutDate = new Date(debut);
    const created = [];
    for (let i = 0; i < repetitions; i++) {
      const d = new Date(debutDate.getTime() + i * duree * 60000);
      const { rows } = await query(
        'INSERT INTO creneau(commune_id,service_id,debut,capacite) VALUES($1,$2,$3,$4) RETURNING *',
        [communeId, serviceId, d.toISOString(), capacite]);
      created.push(rows[0]);
    }
    res.status(201).json({ created: created.length, creneaux: created });
  }));

// DELETE /api/rdv/admin/creneaux/:id
router.delete('/admin/creneaux/:id',
  authenticate, requireRole('admin_apc','admin_wilaya'),
  asyncH(async (req, res) => {
    const rdvs = await query(
      `SELECT COUNT(*) AS n FROM rdv WHERE creneau_id=$1 AND statut IN ('reserve','present')`,
      [req.params.id]);
    if (Number(rdvs.rows[0].n) > 0)
      throw badRequest(`Impossible : ${rdvs.rows[0].n} RDV réservé(s) sur ce créneau.`);
    const { rows } = await query('DELETE FROM creneau WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows.length) throw notFound('Créneau introuvable.');
    res.json({ deleted: rows[0].id });
  }));

// ═══════════════════════════════════════════════════
// ÉVALUATION POST-RDV (boucle de redevabilité)
// ═══════════════════════════════════════════════════

// PATCH /api/rdv/:id/evaluer — citoyen évalue après le RDV
router.patch('/:id/evaluer', authenticate, asyncH(async (req, res) => {
  const { note_satisfaction, rdv_honore, delai_respecte, commentaire_eval } = req.body;
  if (!note_satisfaction || note_satisfaction < 1 || note_satisfaction > 5)
    throw badRequest('note_satisfaction requis (1-5)');
  // Vérifier que c'est bien le RDV du citoyen et qu'il est traité/présent
  const { rows } = await query(
    `UPDATE rdv SET note_satisfaction=$1, rdv_honore=$2, delai_respecte=$3,
                    commentaire_eval=$4, evalue_le=NOW(), maj_le=NOW()
      WHERE id=$5 AND citoyen_id=$6 AND statut IN ('traite','present')
      RETURNING *`,
    [note_satisfaction, rdv_honore ?? null, delai_respecte ?? null,
     commentaire_eval || null, req.params.id, req.user.id]);
  if (!rows.length) throw badRequest('RDV introuvable ou non éligible à l\'évaluation');
  res.json(rows[0]);
}));

// ═══════════════════════════════════════════════════
// GUICHETS & CRÉNEAUX DYNAMIQUES (Temps 2)
// ═══════════════════════════════════════════════════

// GET /api/rdv/guichets?serviceId= — guichets offrant un service donné
router.get('/guichets', asyncH(async (req, res) => {
  const { serviceId, communeId } = req.query;
  let sql = `SELECT g.id, g.nom, g.adresse, g.commune_id, c.nom AS commune_nom,
                    g.horaire_debut, g.horaire_fin, g.duree_creneau_min
               FROM guichet g
               JOIN commune c ON c.id = g.commune_id
              WHERE g.actif = true`;
  const params = [];
  if (serviceId) {
    params.push(Number(serviceId));
    sql += ` AND g.id IN (SELECT guichet_id FROM guichet_service WHERE service_id = $${params.length})`;
  }
  if (communeId) {
    params.push(Number(communeId));
    sql += ` AND g.commune_id = $${params.length}`;
  }
  sql += ' ORDER BY c.nom, g.nom';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

// GET /api/rdv/guichets/:id/creneaux?serviceId=&from=&to=
// Génère les créneaux dynamiquement à partir des horaires
router.get('/guichets/:id/creneaux', asyncH(async (req, res) => {
  const guichetId = Number(req.params.id);
  const serviceId = req.query.serviceId ? Number(req.query.serviceId) : null;

  // Charger le guichet
  const { rows: gRows } = await query(
    'SELECT * FROM guichet WHERE id = $1 AND actif = true', [guichetId]);
  if (!gRows.length) throw notFound('Guichet introuvable.');
  const g = gRows[0];

  // Vérifier que le guichet offre ce service
  if (serviceId) {
    const { rowCount } = await query(
      'SELECT 1 FROM guichet_service WHERE guichet_id = $1 AND service_id = $2',
      [guichetId, serviceId]);
    if (!rowCount) throw badRequest('Ce guichet ne propose pas ce service.');
  }

  // Période : 14 jours à partir de demain
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() + 1);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate() + 14);

  // Charger les jours fériés
  const { rows: feries } = await query(
    'SELECT date FROM jour_ferie WHERE date >= $1 AND date <= $2',
    [fromDate.toISOString().slice(0, 10), toDate.toISOString().slice(0, 10)]);
  const ferieSet = new Set(feries.map(f => f.date.toISOString().slice(0, 10)));

  // Charger les RDV existants pour anti-double
  const { rows: rdvExistants } = await query(
    `SELECT r.creneau_id, COUNT(*)::int AS nb
       FROM rdv r
       JOIN creneau c ON c.id = r.creneau_id
      WHERE c.commune_id = $1 AND r.statut IN ('reserve','present')
        AND c.debut >= $2
      GROUP BY r.creneau_id`,
    [g.commune_id, fromDate.toISOString()]);
  const rdvMap = {};
  rdvExistants.forEach(r => { rdvMap[r.creneau_id] = r.nb; });

  // Charger créneaux existants dans la période (pour les rattacher)
  const { rows: creneauxExistants } = await query(
    `SELECT id, debut FROM creneau
      WHERE commune_id = $1 AND debut >= $2 AND debut < $3
        ${serviceId ? 'AND service_id = ' + serviceId : ''}`,
    [g.commune_id, fromDate.toISOString(), toDate.toISOString()]);
  const creneauxMap = {};
  creneauxExistants.forEach(c => {
    creneauxMap[new Date(c.debut).toISOString()] = c.id;
  });

  // Générer les créneaux
  const jours = g.jours_ouverture || [0, 1, 2, 3, 4]; // dim=0..sam=6
  const duree = g.duree_creneau_min || 30;
  const creneaux = [];

  for (let d = new Date(fromDate); d < toDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();

    // Jour ouvré ?
    if (!jours.includes(dayOfWeek)) continue;
    // Jour férié ?
    if (ferieSet.has(dateStr)) continue;

    // Créneaux de la journée
    const [dh, dm] = g.horaire_debut.split(':').map(Number);
    const [fh, fm] = g.horaire_fin.split(':').map(Number);
    const ph = g.pause_debut ? g.pause_debut.split(':').map(Number) : null;
    const pf = g.pause_fin ? g.pause_fin.split(':').map(Number) : null;

    let startMin = dh * 60 + dm;
    const endMin = fh * 60 + fm;
    const pauseStart = ph ? ph[0] * 60 + ph[1] : null;
    const pauseEnd = pf ? pf[0] * 60 + pf[1] : null;

    while (startMin + duree <= endMin) {
      // Pause ?
      if (pauseStart !== null && pauseEnd !== null) {
        if (startMin >= pauseStart && startMin < pauseEnd) {
          startMin = pauseEnd;
          continue;
        }
      }

      const debut = new Date(dateStr + 'T' +
        String(Math.floor(startMin / 60)).padStart(2, '0') + ':' +
        String(startMin % 60).padStart(2, '0') + ':00');

      const isoKey = debut.toISOString();
      const creneauId = creneauxMap[isoKey] || null;
      const reserves = creneauId ? (rdvMap[creneauId] || 0) : 0;
      const restants = g.capacite_par_creneau - reserves;

      creneaux.push({
        debut: debut.toISOString(),
        heure: String(Math.floor(startMin / 60)).padStart(2, '0') + ':' + String(startMin % 60).padStart(2, '0'),
        date: dateStr,
        creneau_id: creneauId,
        capacite: g.capacite_par_creneau,
        restants: restants > 0 ? restants : 0,
        disponible: restants > 0,
      });

      startMin += duree;
    }
  }

  res.json({
    guichet: { id: g.id, nom: g.nom, adresse: g.adresse, commune: g.commune_id },
    creneaux,
    jours_feries: Array.from(ferieSet),
  });
}));

// POST /api/rdv/guichets/reserver — réserver un créneau dynamique
router.post('/guichets/reserver', authenticate, asyncH(async (req, res) => {
  const { guichetId, serviceId, debut } = req.body;
  if (!guichetId || !serviceId || !debut) throw badRequest('guichetId, serviceId et debut requis.');

  // Vérifier anti-double : le citoyen n'a pas déjà un RDV actif pour ce service
  const { rows: existing } = await query(
    `SELECT r.id FROM rdv r
       JOIN creneau c ON c.id = r.creneau_id
      WHERE r.citoyen_id = $1 AND c.service_id = $2 AND r.statut = 'reserve'`,
    [req.user.id, serviceId]);
  if (existing.length) throw badRequest('Vous avez déjà un RDV actif pour cette démarche.');

  const result = await withTransaction(async (client) => {
    // Charger ou créer le créneau
    const { rows: gRows } = await client.query(
      'SELECT * FROM guichet WHERE id = $1 AND actif = true', [guichetId]);
    if (!gRows.length) throw notFound('Guichet introuvable.');
    const g = gRows[0];

    // Vérifier jour férié
    const dateStr = new Date(debut).toISOString().slice(0, 10);
    const { rowCount: isFerie } = await client.query(
      'SELECT 1 FROM jour_ferie WHERE date = $1', [dateStr]);
    if (isFerie) throw badRequest('Ce jour est férié.');

    // Chercher ou créer le créneau dans la table creneau
    let creneauId;
    const { rows: existingCr } = await client.query(
      'SELECT id FROM creneau WHERE commune_id = $1 AND service_id = $2 AND debut = $3 FOR UPDATE',
      [g.commune_id, serviceId, debut]);

    if (existingCr.length) {
      creneauId = existingCr[0].id;
    } else {
      const { rows: newCr } = await client.query(
        'INSERT INTO creneau (commune_id, service_id, debut, capacite) VALUES ($1, $2, $3, $4) RETURNING id',
        [g.commune_id, serviceId, debut, g.capacite_par_creneau]);
      creneauId = newCr[0].id;
    }

    // Vérifier capacité
    const { rows: pris } = await client.query(
      `SELECT COUNT(*)::int AS n FROM rdv WHERE creneau_id = $1 AND statut IN ('reserve','present')`,
      [creneauId]);
    if (Number(pris[0].n) >= g.capacite_par_creneau) throw badRequest('Ce créneau est complet.');

    const numero = Number(pris[0].n) + 1;
    const qrCode = 'RDV-' + require('crypto').randomBytes(6).toString('hex').toUpperCase();
    const { rows: rdvRows } = await client.query(
      `INSERT INTO rdv (creneau_id, citoyen_id, numero_ticket, statut, qr_code)
       VALUES ($1, $2, $3, 'reserve', $4) RETURNING *`,
      [creneauId, req.user.id, numero, qrCode]);

    // Charger les infos pour la confirmation (service + commune + pièces)
    const { rows: info } = await client.query(
      `SELECT s.nom AS service_nom, s.pieces_requises, cm.nom AS commune_nom
         FROM service s, commune cm
        WHERE s.id = $1 AND cm.id = $2`,
      [serviceId, g.commune_id]);

    // Notification in-app
    const dateLabel = new Date(debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const heureLabel = new Date(debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    try {
      await client.query(
        `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
         VALUES ($1, 'rdv', $2, $3, $4)`,
        [req.user.id,
         'RDV confirmé — ' + info[0].service_nom,
         dateLabel + ' à ' + heureLabel + ' · ' + g.nom + ' · ' + info[0].commune_nom + ' · N° ' + qrCode,
         '/civiadmin']);
    } catch(e) { /* notification non bloquante */ }

    // Email de confirmation RDV
    try {
      const { rows: userInfo } = await client.query('SELECT email, prenom FROM utilisateur WHERE id=$1', [req.user.id]);
      if (userInfo[0]?.email) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({ host:'127.0.0.1', port:25, secure:false, tls:{rejectUnauthorized:false} });
        const pieces = (info[0].pieces_requises || []).map(p => '<li>' + p + '</li>').join('');
        await transporter.sendMail({
          from: '"ALGERNA" <noreply@civismart.pylcom.app>',
          to: userInfo[0].email,
          subject: 'RDV confirmé — ' + info[0].service_nom + ' · ' + dateLabel,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <div style="background:#063B5A;color:white;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;">Rendez-vous confirmé</h1>
            </div>
            <div style="background:white;border:1px solid #e0e7ed;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
              <div style="text-align:center;margin-bottom:16px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrCode)}" alt="QR" style="width:140px;height:140px;border-radius:8px;">
                <div style="font-size:18px;font-weight:800;color:#063B5A;margin-top:8px;">${qrCode}</div>
              </div>
              <table style="width:100%;font-size:14px;line-height:2;color:#334155;">
                <tr><td style="color:#64748B;">Démarche</td><td style="font-weight:600;">${info[0].service_nom}</td></tr>
                <tr><td style="color:#64748B;">Date</td><td style="font-weight:600;">${dateLabel}</td></tr>
                <tr><td style="color:#64748B;">Heure</td><td style="font-weight:600;">${heureLabel}</td></tr>
                <tr><td style="color:#64748B;">Guichet</td><td style="font-weight:600;">${g.nom}</td></tr>
                <tr><td style="color:#64748B;">Adresse</td><td style="font-weight:600;">${g.adresse || '—'}</td></tr>
                <tr><td style="color:#64748B;">Commune</td><td style="font-weight:600;">${info[0].commune_nom}</td></tr>
              </table>
              ${pieces ? '<div style="margin-top:16px;background:#F5F3FF;border-radius:10px;padding:14px;"><h3 style="margin:0 0 8px;font-size:14px;color:#5B21B6;">Pièces à apporter</h3><ul style="margin:0;padding-left:20px;color:#334155;line-height:1.8;">' + pieces + '</ul></div>' : ''}
              <p style="margin-top:16px;font-size:12px;color:#64748B;text-align:center;">Présentez le QR code ci-dessus au guichet le jour du rendez-vous.</p>
              <hr style="border:none;border-top:1px solid #e0e7ed;margin:20px 0;">
              <p style="color:#94a3b8;font-size:11px;text-align:center;">ALGERNA — Wilaya d'Alger<br>contact@wilaya-alger.dz</p>
            </div>
          </div>`
        });
      }
    } catch(e) { console.warn('[rdv] email confirm failed:', e.message); }

    return {
      rdv: rdvRows[0],
      confirmation: {
        numero_rdv: qrCode,
        numero_ticket: numero,
        service: info[0].service_nom,
        guichet: g.nom,
        adresse: g.adresse,
        commune: info[0].commune_nom,
        date: dateStr,
        heure: heureLabel,
        qr_code: qrCode,
        pieces_requises: info[0].pieces_requises || [],
      }
    };
  });

  res.status(201).json(result);
}));

// PATCH /api/rdv/:id/modifier — modifier un RDV (max 2 fois)
router.patch('/:id/modifier', authenticate, asyncH(async (req, res) => {
  const { guichetId, serviceId, debut } = req.body;
  if (!guichetId || !serviceId || !debut) throw badRequest('guichetId, serviceId et debut requis.');

  const result = await withTransaction(async (client) => {
    // Charger le RDV existant
    const { rows: rdvRows } = await client.query(
      'SELECT * FROM rdv WHERE id = $1 AND citoyen_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]);
    if (!rdvRows.length) throw notFound('RDV introuvable.');
    const rdv = rdvRows[0];
    if (rdv.statut !== 'reserve') throw badRequest('Seul un RDV en attente peut être modifié.');
    if (rdv.nb_modifications >= 2) throw badRequest('Vous avez atteint le nombre maximum de modifications (2).');

    // Libérer l'ancien créneau (annuler le RDV)
    const ancienCreneauId = rdv.creneau_id;

    // Charger le guichet
    const { rows: gRows } = await client.query(
      'SELECT * FROM guichet WHERE id = $1 AND actif = true', [guichetId]);
    if (!gRows.length) throw notFound('Guichet introuvable.');
    const g = gRows[0];

    // Vérifier jour férié
    const dateStr = new Date(debut).toISOString().slice(0, 10);
    const { rowCount: isFerie } = await client.query(
      'SELECT 1 FROM jour_ferie WHERE date = $1', [dateStr]);
    if (isFerie) throw badRequest('Ce jour est férié.');

    // Chercher ou créer le nouveau créneau
    let newCreneauId;
    const { rows: existingCr } = await client.query(
      'SELECT id FROM creneau WHERE commune_id = $1 AND service_id = $2 AND debut = $3 FOR UPDATE',
      [g.commune_id, serviceId, debut]);
    if (existingCr.length) {
      newCreneauId = existingCr[0].id;
    } else {
      const { rows: newCr } = await client.query(
        'INSERT INTO creneau (commune_id, service_id, debut, capacite) VALUES ($1, $2, $3, $4) RETURNING id',
        [g.commune_id, serviceId, debut, g.capacite_par_creneau]);
      newCreneauId = newCr[0].id;
    }

    // Vérifier capacité du nouveau créneau
    const { rows: pris } = await client.query(
      `SELECT COUNT(*)::int AS n FROM rdv WHERE creneau_id = $1 AND statut IN ('reserve','present')`,
      [newCreneauId]);
    if (Number(pris[0].n) >= g.capacite_par_creneau) throw badRequest('Ce créneau est complet.');

    const newNumero = Number(pris[0].n) + 1;

    // Mettre à jour le RDV
    await client.query(
      `UPDATE rdv SET creneau_id = $1, numero_ticket = $2, nb_modifications = nb_modifications + 1, maj_le = NOW()
       WHERE id = $3`,
      [newCreneauId, newNumero, req.params.id]);

    // Notification
    const heureLabel = new Date(debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateLabel = new Date(debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    try {
      await client.query(
        `INSERT INTO notification (utilisateur_id, type, titre, message, lien)
         VALUES ($1, 'rdv', $2, $3, $4)`,
        [req.user.id,
         'RDV modifié',
         'Nouveau créneau : ' + dateLabel + ' à ' + heureLabel + ' · ' + g.nom,
         '/civiadmin']);
    } catch(e) {}

    return { ok: true, modifications_restantes: 2 - (rdv.nb_modifications + 1) };
  });

  res.json(result);
}));

// GET /api/rdv/verification/:qr — vérifier un QR code (pour l'agent)
router.get('/verification/:qr', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT r.*, c.debut, s.nom AS service, cm.nom AS commune, g.nom AS guichet, g.adresse
       FROM rdv r
       JOIN creneau c ON c.id = r.creneau_id
       JOIN service s ON s.id = c.service_id
       JOIN commune cm ON cm.id = c.commune_id
       LEFT JOIN guichet g ON g.commune_id = c.commune_id
      WHERE r.qr_code = $1
      LIMIT 1`,
    [req.params.qr]);
  if (!rows.length) throw notFound('QR code invalide ou RDV introuvable.');
  res.json(rows[0]);
}));

// Score satisfaction RDV pour l'ICUA (dimension Fluidité)
async function scoreSatisfactionRDV() {
  const { rows } = await query(
    `SELECT AVG(note_satisfaction)::numeric(3,1) AS moy,
            COUNT(*)::int AS total_eval,
            COUNT(*) FILTER (WHERE rdv_honore = TRUE)::int AS honores,
            COUNT(*) FILTER (WHERE rdv_honore IS NOT NULL)::int AS total_honore
       FROM rdv WHERE note_satisfaction IS NOT NULL`);
  if (!rows[0].total_eval) return null;
  // Score 0-100 basé sur la satisfaction moyenne (1-5 → 0-100)
  return Math.round(((Number(rows[0].moy) - 1) / 4) * 100);
}

module.exports = router;
module.exports.scoreSatisfactionRDV = scoreSatisfactionRDV;
