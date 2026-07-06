/**
 * Module CiviPark — Parkings + Cartes Résident avec paiement + Registre des encaissements.
 */
const express = require('express');
const { query } = require('../../db/pool');
const { authenticate, requireRole, hasPerimetre } = require('../../middleware/auth');
const { asyncH, badRequest, notFound, forbidden } = require('../../utils/http');

const router = express.Router();

// ── Helpers ─────────────────────────────────────────────
function communeCode(id) { return String(id || 0).padStart(2, '0'); }

async function audit(entityType, entityId, action, champ, ancienne, nouvelle, userId) {
  await query(`INSERT INTO civipark_audit (entity_type, entity_id, action, champ, ancienne_valeur, nouvelle_valeur, par_utilisateur)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`, [entityType, entityId, action, champ || null, ancienne != null ? String(ancienne) : null, nouvelle != null ? String(nouvelle) : null, userId || null]);
}

async function notifier(userId, titre, message, lien) {
  if (!userId) return;
  await query(`INSERT INTO notification (utilisateur_id, titre, message, type, lien) VALUES ($1,$2,$3,'info',$4)`,
    [userId, titre, message, lien || null]);
}

function isGestionnaire(user) {
  return ['admin_apc', 'admin_wilaya'].includes(user.role);
}
function isAgent(user) {
  return ['agent', 'operateur', 'admin_apc', 'admin_wilaya'].includes(user.role);
}
function communeFilter(user) {
  if (user.role === 'admin_wilaya') return { sql: '', params: [], idx: 0 };
  if (user.commune_id) return { sql: 'AND pz.commune_id = $CIDX', params: [user.commune_id], idx: 1 };
  return { sql: '', params: [], idx: 0 };
}

// ══════════════════════════════════════════════════════════
// 1. PARKINGS (zones)
// ══════════════════════════════════════════════════════════

// GET /zones — liste filtrée par commune si admin_apc
router.get('/zones', asyncH(async (req, res) => {
  const where = ['1=1'];
  const vals = [];
  let i = 1;
  if (req.query.commune_id) { where.push(`pz.commune_id = $${i++}`); vals.push(req.query.commune_id); }
  if (req.query.statut) { where.push(`pz.statut = $${i++}`); vals.push(req.query.statut); }
  const { rows } = await query(
    `SELECT pz.*, c.nom AS commune_nom FROM parking_zone pz
     LEFT JOIN commune c ON c.id = pz.commune_id
     WHERE ${where.join(' AND ')} ORDER BY pz.reference, pz.nom`, vals);
  res.json(rows);
}));

// GET /zones/:id — fiche avec journal d'audit
router.get('/zones/:id', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT pz.*, c.nom AS commune_nom FROM parking_zone pz
     LEFT JOIN commune c ON c.id = pz.commune_id WHERE pz.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Parking introuvable');
  const { rows: journal } = await query(
    `SELECT a.*, u.prenom, u.nom AS nom_u FROM civipark_audit a
     LEFT JOIN utilisateur u ON u.id = a.par_utilisateur
     WHERE a.entity_type = 'parking' AND a.entity_id = $1 ORDER BY a.cree_le DESC LIMIT 50`, [req.params.id]);
  res.json({ ...rows[0], journal });
}));

// POST /zones — créer un parking
router.post('/zones', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { nom, commune_id, adresse, lat, lng, places_total, places_pmr, horaires, type } = req.body;
  if (!nom || !commune_id) throw badRequest('nom et commune_id requis');
  // Generate reference PRK-<COMMUNE>-<n°>
  const cc = communeCode(commune_id);
  const { rows: seqR } = await query(`SELECT COALESCE(MAX(id),0)+1 AS n FROM parking_zone`);
  const reference = `PRK-${cc}-${String(seqR[0].n).padStart(4, '0')}`;
  const { rows } = await query(
    `INSERT INTO parking_zone (nom, commune_id, adresse, lat, lng, places_total, places_pmr, horaires, type, reference, tarif_horaire)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [nom, commune_id, adresse || null, lat || null, lng || null, places_total || 0, places_pmr || 0,
     horaires || null, type || 'bleue', reference, req.body.tarif_horaire || 0]);
  await audit('parking', rows[0].id, 'creation', null, null, nom, req.user.id);
  res.status(201).json(rows[0]);
}));

// PATCH /zones/:id — modifier un parking
router.patch('/zones/:id', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { rows: old } = await query('SELECT * FROM parking_zone WHERE id=$1', [req.params.id]);
  if (!old.length) throw notFound('Parking introuvable');
  const fields = ['nom', 'adresse', 'lat', 'lng', 'places_total', 'places_pmr', 'horaires', 'type', 'tarif_horaire', 'statut', 'motif_desactivation'];
  const sets = []; const vals = []; let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined && String(req.body[f]) !== String(old[0][f])) {
      sets.push(`${f} = $${i++}`); vals.push(req.body[f]);
      await audit('parking', old[0].id, 'modification', f, old[0][f], req.body[f], req.user.id);
    }
  }
  if (!sets.length) throw badRequest('Rien à modifier');
  vals.push(req.params.id);
  const { rows } = await query(`UPDATE parking_zone SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  res.json(rows[0]);
}));

// DELETE /zones/:id — suppression si zéro historique, sinon refus
router.delete('/zones/:id', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const id = req.params.id;
  const { rows: enc } = await query('SELECT COUNT(*)::int AS n FROM parking_encaissement WHERE parking_zone_id=$1', [id]);
  const { rows: cr } = await query('SELECT COUNT(*)::int AS n FROM carte_resident WHERE parking_zone_id=$1', [id]);
  if (enc[0].n > 0 || cr[0].n > 0) {
    return res.status(409).json({ erreur: `Suppression impossible : ${enc[0].n} encaissement(s) et ${cr[0].n} carte(s) liés. Utilisez la désactivation.` });
  }
  await query('DELETE FROM civipark_audit WHERE entity_type=$1 AND entity_id=$2', ['parking', id]);
  await query('DELETE FROM parking_zone WHERE id=$1', [id]);
  res.json({ ok: true });
}));

// ══════════════════════════════════════════════════════════
// 2. CARTES RÉSIDENT
// ══════════════════════════════════════════════════════════

// GET /cartes — filtrées par rôle
router.get('/cartes', authenticate, asyncH(async (req, res) => {
  const isCitoyen = req.user.role === 'citoyen';
  let sql, vals = [];
  if (isCitoyen) {
    sql = `SELECT cr.*, c.nom AS commune_nom, pz.reference AS parking_ref,
             pe.justificatif_numero AS recu_numero
           FROM carte_resident cr
           LEFT JOIN commune c ON c.id = cr.commune_id
           LEFT JOIN parking_zone pz ON pz.id = cr.parking_zone_id
           LEFT JOIN parking_encaissement pe ON pe.id = cr.recu_id
           WHERE cr.citoyen_id = $1 ORDER BY cr.cree_le DESC`;
    vals = [req.user.id];
  } else {
    const cFilter = (req.user.role === 'admin_apc' && req.user.commune_id) ? 'WHERE cr.commune_id = $1' : '';
    vals = cFilter ? [req.user.commune_id] : [];
    sql = `SELECT cr.*, u.nom, u.prenom, u.telephone, c.nom AS commune_nom, pz.reference AS parking_ref,
             pe.justificatif_numero AS recu_numero
           FROM carte_resident cr
           JOIN utilisateur u ON u.id = cr.citoyen_id
           LEFT JOIN commune c ON c.id = cr.commune_id
           LEFT JOIN parking_zone pz ON pz.id = cr.parking_zone_id
           LEFT JOIN parking_encaissement pe ON pe.id = cr.recu_id
           ${cFilter} ORDER BY cr.cree_le DESC LIMIT 200`;
  }
  const { rows } = await query(sql, vals);
  res.json(rows);
}));

// GET /cartes/:id — fiche avec journal d'audit
router.get('/cartes/:id', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT cr.*, u.nom, u.prenom, u.telephone, c.nom AS commune_nom, pz.reference AS parking_ref,
       pe.justificatif_numero AS recu_numero, pe.montant AS recu_montant, pe.date_heure AS recu_date
     FROM carte_resident cr
     JOIN utilisateur u ON u.id = cr.citoyen_id
     LEFT JOIN commune c ON c.id = cr.commune_id
     LEFT JOIN parking_zone pz ON pz.id = cr.parking_zone_id
     LEFT JOIN parking_encaissement pe ON pe.id = cr.recu_id
     WHERE cr.id = $1`, [req.params.id]);
  if (!rows.length) throw notFound('Carte introuvable');
  const { rows: journal } = await query(
    `SELECT a.*, u.prenom, u.nom AS nom_u FROM civipark_audit a
     LEFT JOIN utilisateur u ON u.id = a.par_utilisateur
     WHERE a.entity_type = 'carte' AND a.entity_id = $1 ORDER BY a.cree_le DESC LIMIT 50`, [req.params.id]);
  res.json({ ...rows[0], journal });
}));

// POST /cartes — demande de carte (citoyen ou agent)
router.post('/cartes', authenticate, asyncH(async (req, res) => {
  const { commune_id, plaque, adresse, justif_url, parking_zone_id, citoyen_id } = req.body;
  const isCitoyen = req.user.role === 'citoyen';
  const effectiveCitoyenId = isCitoyen ? req.user.id : citoyen_id;
  if (!effectiveCitoyenId || !commune_id) throw badRequest('commune_id requis');
  // Generate numero CR-<COMMUNE>-<n°>
  const cc = communeCode(commune_id);
  const { rows: seqR } = await query(`SELECT COALESCE(MAX(id),0)+1 AS n FROM carte_resident`);
  const numero = `CR-${cc}-${String(seqR[0].n).padStart(4, '0')}`;
  const { rows } = await query(
    `INSERT INTO carte_resident (citoyen_id, commune_id, plaque, adresse, justif_url, parking_zone_id, numero, statut, agent_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'en_attente',$8) RETURNING *`,
    [effectiveCitoyenId, commune_id, plaque || null, adresse || null, justif_url || null,
     parking_zone_id || null, numero, isCitoyen ? null : req.user.id]);
  await audit('carte', rows[0].id, 'demande', 'statut', null, 'en_attente', req.user.id);
  await notifier(effectiveCitoyenId, 'Carte résident', `Votre demande de carte résident ${numero} a été enregistrée.`, null);
  res.status(201).json(rows[0]);
}));

// PATCH /cartes/:id — changer statut (workflow)
router.patch('/cartes/:id', authenticate, requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { rows: old } = await query('SELECT * FROM carte_resident WHERE id=$1', [req.params.id]);
  if (!old.length) throw notFound('Carte introuvable');
  const carte = old[0];
  const { statut, motif_refus, motif_suspension } = req.body;
  if (!statut) throw badRequest('statut requis');

  const sets = [`statut = $1`]; const vals = [statut]; let i = 2;

  if (statut === 'validee_attente_paiement' && carte.statut === 'en_attente') {
    // Validation by responsable → waiting for payment
  } else if (statut === 'suspendue') {
    if (!motif_suspension) throw badRequest('motif_suspension requis');
    sets.push(`motif_suspension = $${i++}`); vals.push(motif_suspension);
  } else if (statut === 'revoquee') {
    if (!req.body.motif_revocation) throw badRequest('motif requis');
    sets.push(`motif_refus = $${i++}`); vals.push(req.body.motif_revocation);
  }

  // Validity for activation (set by encaissement, not here)
  if (req.body.valide_jusqu_a) { sets.push(`valide_jusqu_a = $${i++}`); vals.push(req.body.valide_jusqu_a); }

  vals.push(req.params.id);
  const { rows } = await query(`UPDATE carte_resident SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  await audit('carte', carte.id, 'changement_statut', 'statut', carte.statut, statut, req.user.id);

  // Notify citizen
  const statutLabels = { en_attente: 'en attente', validee_attente_paiement: 'validée — en attente de paiement', active: 'active', suspendue: 'suspendue', revoquee: 'révoquée' };
  await notifier(carte.citoyen_id, 'Carte résident', `Votre carte ${carte.numero} est maintenant ${statutLabels[statut] || statut}.`, null);

  res.json(rows[0]);
}));

// GET /cartes/tarif — tarif carte résident
router.get('/config/tarif', asyncH(async (req, res) => {
  const { rows } = await query("SELECT valeur FROM civipark_config WHERE cle = 'tarif_carte_resident'");
  res.json({ tarif: rows.length ? Number(rows[0].valeur) : 5000 });
}));

// PATCH /config/tarif — modifier tarif (gestionnaire EPIC)
router.patch('/config/tarif', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { tarif } = req.body;
  if (!tarif || tarif <= 0) throw badRequest('tarif invalide');
  const { rows: old } = await query("SELECT valeur FROM civipark_config WHERE cle = 'tarif_carte_resident'");
  const oldVal = old.length ? old[0].valeur : '0';
  await query("INSERT INTO civipark_config (cle, valeur, modifie_par, modifie_le) VALUES ('tarif_carte_resident', $1, $2, NOW()) ON CONFLICT (cle) DO UPDATE SET valeur=$1, modifie_par=$2, modifie_le=NOW()", [String(tarif), req.user.id]);
  await audit('config', 0, 'modification_tarif', 'tarif_carte_resident', oldVal, String(tarif), req.user.id);
  res.json({ ok: true, tarif });
}));

// ══════════════════════════════════════════════════════════
// 3. REGISTRE DES ENCAISSEMENTS
// ══════════════════════════════════════════════════════════

// GET /encaissements — registre filtrable
router.get('/encaissements', authenticate, requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const where = ['pe.valide = TRUE OR pe.annulation_de IS NOT NULL'];
  const vals = []; let i = 1;
  // Commune filter for admin_apc
  if (req.user.role === 'admin_apc' && req.user.commune_id) {
    where.push(`pz.commune_id = $${i++}`); vals.push(req.user.commune_id);
  }
  if (req.query.zone_id) { where.push(`pe.parking_zone_id = $${i++}`); vals.push(req.query.zone_id); }
  if (req.query.type_paiement) { where.push(`pe.type_paiement = $${i++}`); vals.push(req.query.type_paiement); }
  if (req.query.mode_paiement) { where.push(`pe.mode_paiement = $${i++}`); vals.push(req.query.mode_paiement); }
  if (req.query.plaque) { where.push(`pe.plaque ILIKE $${i++}`); vals.push('%' + req.query.plaque + '%'); }
  if (req.query.ticket) { where.push(`pe.justificatif_numero = $${i++}`); vals.push(req.query.ticket); }
  if (req.query.date_debut) { where.push(`pe.date_heure >= $${i++}`); vals.push(req.query.date_debut); }
  if (req.query.date_fin) { where.push(`pe.date_heure <= $${i++}`); vals.push(req.query.date_fin); }
  if (req.query.agent_id) { where.push(`pe.agent_id = $${i++}`); vals.push(req.query.agent_id); }
  const { rows } = await query(
    `SELECT pe.*, pz.nom AS zone_nom, pz.reference AS zone_ref, pz.type AS zone_type, c.nom AS commune_nom,
       cr.numero AS carte_numero, u.prenom AS agent_prenom, u.nom AS agent_nom,
       ann.justificatif_numero AS annule_recu
     FROM parking_encaissement pe
     JOIN parking_zone pz ON pz.id = pe.parking_zone_id
     LEFT JOIN commune c ON c.id = pz.commune_id
     LEFT JOIN carte_resident cr ON cr.id = pe.carte_resident_id
     LEFT JOIN utilisateur u ON u.id = pe.agent_id
     LEFT JOIN parking_encaissement ann ON ann.id = pe.annulation_de
     WHERE ${where.join(' AND ')}
     ORDER BY pe.date_heure DESC LIMIT 300`, vals);
  // Totaux
  const { rows: totaux } = await query(
    `SELECT COUNT(*)::int AS nb, COALESCE(SUM(pe.montant),0)::numeric AS total
     FROM parking_encaissement pe
     JOIN parking_zone pz ON pz.id = pe.parking_zone_id
     WHERE (${where.join(' AND ')})`, vals);
  res.json({ lignes: rows, totaux: totaux[0] });
}));

// POST /encaissements — enregistrer un encaissement
router.post('/encaissements', authenticate, requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { parking_zone_id, montant, duree_minutes, type_paiement, mode_paiement, plaque, carte_resident_id } = req.body;
  if (!parking_zone_id || montant === undefined) throw badRequest('parking_zone_id et montant requis');

  // Generate REC-<PARKING_REF>-<n°>
  const { rows: pzR } = await query('SELECT reference FROM parking_zone WHERE id=$1', [parking_zone_id]);
  const pzRef = pzR.length ? pzR[0].reference : 'PRK';
  const { rows: seqR } = await query("SELECT nextval('parking_ticket_seq')::int AS seq");
  const recuNum = `REC-${pzRef}-${String(seqR[0].seq).padStart(5, '0')}`;

  const { rows } = await query(
    `INSERT INTO parking_encaissement
      (parking_zone_id, montant, duree_minutes, type_paiement, mode_paiement,
       justificatif_numero, numero_sequence, plaque, agent_id, carte_resident_id,
       type_encaisseur, justificatif_type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'agent_tpe','recu_mobile') RETURNING *`,
    [parking_zone_id, montant, duree_minutes || null, type_paiement || 'horaire',
     mode_paiement || 'especes', recuNum, seqR[0].seq, plaque || null,
     req.user.id, carte_resident_id || null]);

  const enc = rows[0];

  // If carte_resident payment → activate carte
  if (carte_resident_id && type_paiement === 'carte_resident') {
    const now = new Date();
    const expiry = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    await query(
      `UPDATE carte_resident SET statut = 'active', recu_id = $1, valide_jusqu_a = $2 WHERE id = $3`,
      [enc.id, expiry.toISOString().split('T')[0], carte_resident_id]);
    await audit('carte', carte_resident_id, 'activation_paiement', 'statut', 'validee_attente_paiement', 'active', req.user.id);
    // Notify citizen
    const { rows: crR } = await query('SELECT citoyen_id, numero FROM carte_resident WHERE id=$1', [carte_resident_id]);
    if (crR.length) {
      await notifier(crR[0].citoyen_id, 'Carte activée',
        `Votre carte ${crR[0].numero} est maintenant active. Reçu : ${recuNum}. Validité : 12 mois.`, null);
    }
  }

  await audit('encaissement', enc.id, 'creation', null, null, `${montant} DA - ${recuNum}`, req.user.id);
  res.status(201).json(enc);
}));

// POST /encaissements/:id/annuler — annulation (écriture négative)
router.post('/encaissements/:id/annuler', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { motif } = req.body;
  if (!motif) throw badRequest('motif requis');
  const { rows: orig } = await query('SELECT * FROM parking_encaissement WHERE id=$1', [req.params.id]);
  if (!orig.length) throw notFound('Encaissement introuvable');
  const o = orig[0];
  // Check not already annulled
  const { rows: existing } = await query('SELECT id FROM parking_encaissement WHERE annulation_de=$1', [o.id]);
  if (existing.length) throw badRequest('Cet encaissement a déjà été annulé');

  // Generate annulation recu
  const { rows: seqR } = await query("SELECT nextval('parking_ticket_seq')::int AS seq");
  const annRecuNum = `ANN-${o.justificatif_numero}`;

  const { rows } = await query(
    `INSERT INTO parking_encaissement
      (parking_zone_id, montant, type_paiement, mode_paiement, justificatif_numero, numero_sequence,
       plaque, agent_id, annulation_de, motif_annulation, type_encaisseur, justificatif_type, valide)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'agent_tpe','recu_mobile', TRUE) RETURNING *`,
    [o.parking_zone_id, -Math.abs(o.montant), o.type_paiement, o.mode_paiement,
     annRecuNum, seqR[0].seq, o.plaque, req.user.id, o.id, motif]);

  // Mark original as invalidated
  await query('UPDATE parking_encaissement SET valide=FALSE WHERE id=$1', [o.id]);
  await audit('encaissement', o.id, 'annulation', 'valide', 'true', 'false', req.user.id);
  await audit('encaissement', rows[0].id, 'creation_annulation', 'motif', null, motif, req.user.id);
  res.status(201).json(rows[0]);
}));

// GET /encaissements/stats
router.get('/encaissements/stats', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const cWhere = (req.user.role === 'admin_apc' && req.user.commune_id) ? `AND pz.commune_id = ${Number(req.user.commune_id)}` : '';
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total_encaissements,
            COALESCE(SUM(pe.montant),0)::numeric AS total_montant,
            COUNT(DISTINCT pe.parking_zone_id)::int AS zones_actives
     FROM parking_encaissement pe
     JOIN parking_zone pz ON pz.id = pe.parking_zone_id
     WHERE pe.date_heure >= NOW() - INTERVAL '30 days' AND pe.valide = TRUE ${cWhere}`);
  res.json(rows[0]);
}));

// ══════════════════════════════════════════════════════════
// 4. CLÔTURES
// ══════════════════════════════════════════════════════════

// GET /clotures
router.get('/clotures', authenticate, requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const cWhere = (req.user.role === 'admin_apc' && req.user.commune_id) ? `AND pz.commune_id = ${Number(req.user.commune_id)}` : '';
  const { rows } = await query(
    `SELECT cl.*, pz.nom AS zone_nom, pz.reference AS zone_ref, c.nom AS commune_nom,
       uc.prenom AS cloture_prenom, uc.nom AS cloture_nom,
       uv.prenom AS valid_prenom, uv.nom AS valid_nom
     FROM civipark_cloture cl
     JOIN parking_zone pz ON pz.id = cl.parking_zone_id
     LEFT JOIN commune c ON c.id = pz.commune_id
     LEFT JOIN utilisateur uc ON uc.id = cl.cloturee_par
     LEFT JOIN utilisateur uv ON uv.id = cl.validee_par
     WHERE 1=1 ${cWhere}
     ORDER BY cl.date_cloture DESC, cl.cree_le DESC LIMIT 100`);
  res.json(rows);
}));

// POST /clotures — clôture quotidienne
router.post('/clotures', authenticate, requireRole('agent', 'operateur', 'admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { parking_zone_id, date_cloture, total_declare, commentaire } = req.body;
  if (!parking_zone_id || !date_cloture || total_declare === undefined) throw badRequest('parking_zone_id, date_cloture et total_declare requis');
  // Calcul total système
  const { rows: sysR } = await query(
    `SELECT COALESCE(SUM(montant),0)::numeric AS total FROM parking_encaissement
     WHERE parking_zone_id=$1 AND date_heure::date = $2::date AND valide=TRUE`, [parking_zone_id, date_cloture]);
  const totalSys = Number(sysR[0].total);
  const ecart = Number(total_declare) - totalSys;
  const { rows } = await query(
    `INSERT INTO civipark_cloture (parking_zone_id, date_cloture, total_systeme, total_declare, ecart, cloturee_par, commentaire)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [parking_zone_id, date_cloture, totalSys, total_declare, ecart, req.user.id, commentaire || null]);
  await audit('cloture', rows[0].id, 'creation', 'ecart', null, String(ecart), req.user.id);
  res.status(201).json(rows[0]);
}));

// PATCH /clotures/:id/valider — validation par responsable
router.patch('/clotures/:id/valider', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const { rows: cl } = await query('SELECT * FROM civipark_cloture WHERE id=$1', [req.params.id]);
  if (!cl.length) throw notFound('Clôture introuvable');
  if (cl[0].cloturee_par === req.user.id) throw badRequest('Le responsable ne peut pas valider sa propre clôture');
  await query('UPDATE civipark_cloture SET validee=TRUE, validee_par=$1 WHERE id=$2', [req.user.id, req.params.id]);
  await audit('cloture', cl[0].id, 'validation', 'validee', 'false', 'true', req.user.id);
  res.json({ ok: true });
}));

// ══════════════════════════════════════════════════════════
// 5. JOURNAL D'AUDIT
// ══════════════════════════════════════════════════════════
router.get('/audit', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  const where = []; const vals = []; let i = 1;
  if (req.query.entity_type) { where.push(`a.entity_type=$${i++}`); vals.push(req.query.entity_type); }
  if (req.query.entity_id) { where.push(`a.entity_id=$${i++}`); vals.push(req.query.entity_id); }
  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const { rows } = await query(
    `SELECT a.*, u.prenom, u.nom AS nom_u FROM civipark_audit a
     LEFT JOIN utilisateur u ON u.id = a.par_utilisateur ${clause}
     ORDER BY a.cree_le DESC LIMIT 200`, vals);
  res.json(rows);
}));

// ICUA score
async function scoreMobilite() {
  const { rows } = await query(
    `SELECT COUNT(DISTINCT pz.id)::int AS zones_bleues,
       COUNT(DISTINCT pe.parking_zone_id)::int AS zones_avec_encaissement
     FROM parking_zone pz
     LEFT JOIN parking_encaissement pe ON pe.parking_zone_id = pz.id AND pe.date_heure >= NOW() - INTERVAL '30 days'
     WHERE pz.type = 'bleue' AND pz.actif = TRUE`);
  const { zones_bleues, zones_avec_encaissement } = rows[0];
  if (zones_bleues === 0) return null;
  return Math.round((zones_avec_encaissement / zones_bleues) * 100);
}

module.exports = router;
module.exports.scoreMobilite = scoreMobilite;
