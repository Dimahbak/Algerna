/**
 * Fabrique de routeur de signalements.
 * Propreté et Eau instancient le même routeur avec leur domaine.
 * Démontre concrètement la réutilisation du socle commun.
 */
const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const svc = require('../proprete/signalementService');
const { validate } = require('../../middleware/validation');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH, unauthorized, forbidden } = require('../../utils/http');

// Phase 4C — middlewares sans fallback
const STAFF_FONCTIONS = ['agent_traitant', 'cap', 'entite_responsable', 'superviseur'];
function requireStaff() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (STAFF_FONCTIONS.includes(req.user.fonction)) return next();
    return next(forbidden());
  };
}
function requireSuperviseur() {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.fonction === 'superviseur') return next();
    return next(forbidden());
  };
}
const config = require('../../config');

const upload = multer({
  dest: config.upload.dir,
  limits: { fileSize: config.upload.maxBytes },
});

const creerSchema = z.object({
  categorieId: z.coerce.number().int(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  communeId: z.coerce.number().int().optional(),
  description: z.string().max(1000).optional(),
});

const etatSchema = z.object({
  etat: z.enum(['recu','transmis','pris_en_charge','en_intervention','a_valider','resolu','rejete']),
});

function makeSignalementRouter(domaine) {
  const router = express.Router();

  // GET /categories
  router.get('/categories', asyncH(async (req, res) => {
    res.json(await svc.listCategories(domaine));
  }));

  // POST /signalements (citoyen, avec photo optionnelle)
  router.post('/signalements',
    authenticate,
    upload.single('photo'),
    validate(creerSchema),
    asyncH(async (req, res) => {
      const result = await svc.creer(domaine, {
        ...req.body,
        photoPath: req.file ? req.file.path : null,
        citoyenId: req.user.id,
      });
      res.status(201).json(result);
    }));

  // GET /signalements/export-csv — superviseurs uniquement
  router.get('/signalements/export-csv',
    authenticate, requireSuperviseur(),
    asyncH(async (req, res) => {
      const { query } = require('../../db/pool');
      const { rows } = await query(
        `SELECT s.reference, s.etat, cat.criticite, s.description,
                cat.libelle AS categorie, c.nom AS commune,
                s.lat, s.lng, s.cree_le, s.resolu_le,
                u.telephone AS citoyen_tel
         FROM signalement s
         JOIN categorie_signal cat ON cat.id = s.categorie_id
         LEFT JOIN commune c ON c.id = s.commune_id
         LEFT JOIN utilisateur u ON u.id = s.citoyen_id
         WHERE s.domaine = $1
         ORDER BY s.cree_le DESC`,
        [domaine]);

      const headers = ['Reference','Etat','Criticite','Categorie','Commune','Lat','Lng','Description','Cree_le','Resolu_le','Citoyen_tel'];
      const csvRows = rows.map(r => headers.map(h => {
        const v = r[h.toLowerCase()] != null ? r[h.toLowerCase()] : '';
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(','));
      const csv = [headers.join(','), ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="signalements-' + domaine + '-' + new Date().toISOString().slice(0,10) + '.csv"');
      res.send('\uFEFF' + csv);
    }));

  // GET /signalements/carte — authenticated, read-only pour la carte Ma Houma
  router.get('/signalements/carte', authenticate, asyncH(async (req, res) => {
    const { query: dbQuery } = require('../../db/pool');
    const { communeId } = req.query;
    let sql = `SELECT s.id, s.reference, s.lat, s.lng, s.etat, s.domaine, s.cree_le,
                      cs.libelle AS categorie, cs.famille AS categorie_famille,
                      c.nom AS commune_nom
                 FROM signalement s
                 LEFT JOIN categorie_signal cs ON cs.id = s.categorie_id
                 LEFT JOIN commune c ON c.id = s.commune_id
                WHERE s.domaine = $1`;
    const params = [domaine];
    if (communeId) { params.push(Number(communeId)); sql += ` AND s.commune_id = $${params.length}`; }
    sql += ` ORDER BY s.cree_le DESC LIMIT 200`;
    const { rows } = await dbQuery(sql, params);
    res.json(rows);
  }));

  // GET /signalements — filtres en query + pagination
  router.get('/signalements',
    authenticate, requireStaff(),
    asyncH(async (req, res) => {
      const { communeId, etat, operateurId, page, limit } = req.query;
      res.json(await svc.lister(domaine, {
        communeId: communeId ? Number(communeId) : undefined,
        etat,
        operateurId: operateurId ? Number(operateurId) : undefined,
        page,
        limit,
      }));
    }));

  // GET /signalements/:id/historique
  router.get('/signalements/:id/historique',
    authenticate, requireStaff(),
    asyncH(async (req, res) => {
      const { query } = require('../../db/pool');
      const { rows } = await query(
        `SELECT h.*, u.prenom, u.nom
         FROM signalement_historique h
         LEFT JOIN utilisateur u ON u.id = h.par_utilisateur
         WHERE h.signalement_id = $1
         ORDER BY h.le ASC`,
        [req.params.id]);
      res.json(rows);
    }));

  // PATCH /signalements/:id/etat — workflow engine
  router.patch('/signalements/:id/etat',
    authenticate, requireStaff(),
    upload.single('preuve'),
    asyncH(async (req, res) => {
      const workflow = require('../../services/workflow');
      const { etat, commentaire, motifRejet, transmisA } = req.body;
      if (!etat) return res.status(400).json({ erreur: 'etat requis' });
      const result = await workflow.transitionEtat(
        req.params.id, etat, req.user,
        { commentaire, motifRejet, transmisA }
      );
      // Handle preuve photo if provided
      if (req.file) {
        const { query: dbQ } = require('../../db/pool');
        await dbQ('UPDATE signalement SET preuve_path = $1 WHERE id = $2', [req.file.path, req.params.id]);
      }
      res.json(result);
    }));

  // POST /signalements/:id/mission-cap — créer intervention CAP
  router.post('/signalements/:id/mission-cap',
    authenticate, requireStaff(),
    asyncH(async (req, res) => {
      const workflow = require('../../services/workflow');
      const { type, priorite, commentaire, secteur } = req.body;
      const mission = await workflow.creerMissionCap(
        req.params.id, req.user,
        { type, priorite, commentaire, secteur }
      );
      res.status(201).json(mission);
    }));

  // GET /signalements/:id/route — routage automatique
  router.get('/signalements/:id/route',
    authenticate, requireStaff(),
    asyncH(async (req, res) => {
      const workflow = require('../../services/workflow');
      const service = await workflow.routerSignalement(req.params.id);
      res.json({ service });
    }));

  // GET /dashboard — vue consolidée (scores, points noirs, délai moyen)
  router.get('/dashboard',
    authenticate, requireStaff(),
    asyncH(async (req, res) => {
      const [scores, noirs, delai] = await Promise.all([
        svc.scoresParCommune(domaine),
        svc.pointsNoirs(domaine),
        svc.delaiMoyenHeures(domaine),
      ]);
      res.json({ domaine, scores, pointsNoirs: noirs, delaiMoyenReparationHeures: delai });
    }));

  return router;
}

module.exports = { makeSignalementRouter };
