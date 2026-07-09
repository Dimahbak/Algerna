/**
 * ICUA API — Indice Citoyen Urbain ALGERNA
 */
const express = require('express');
const { authenticate, requireRole, hasPerimetre } = require('../../middleware/auth');
const { asyncH } = require('../../utils/http');
const icuaEngine = require('../../services/icua');
const router = express.Router();

// GET /api/icua — score global
router.get('/', authenticate, asyncH(async (req, res) => {
  const communeId = req.query.communeId || null;
  const data = await icuaEngine.calculer(communeId ? Number(communeId) : null);
  res.json(data);
}));

// GET /api/icua/details — détail des composantes
router.get('/details', authenticate, asyncH(async (req, res) => {
  const communeId = req.query.communeId || null;
  const data = await icuaEngine.calculer(communeId ? Number(communeId) : null);
  res.json({
    score: data.score,
    sante: data.sante,
    niveau: data.niveau,
    niveauLabel: data.niveauLabel,
    composantes: data.composantes,
    seuils: data.seuils,
    explicabilite: Object.entries(data.composantes).map(([k, v]) => ({
      domaine: k.replace(/_/g, ' '),
      score: v.score,
      poids: v.poids + '%',
      contribution: v.contribution + ' pts',
    })),
  });
}));

// GET /api/icua/historique — évolution
router.get('/historique', authenticate, asyncH(async (req, res) => {
  const communeId = req.query.communeId || null;
  const jours = parseInt(req.query.jours) || 30;
  const data = await icuaEngine.getHistorique(communeId ? Number(communeId) : null, jours);
  res.json(data);
}));

// GET /api/icua/communes — classement par commune
router.get('/communes', authenticate, requireRole('admin_apc', 'admin_wilaya'), asyncH(async (req, res) => {
  let data = await icuaEngine.parCommune();
  if (hasPerimetre(req.user, 'commune') && req.user.commune_id) {
    data = data.filter(c => c.commune_id === req.user.commune_id);
  }
  res.json(data);
}));

// POST /api/icua/snapshot — sauvegarder snapshot (cron ou admin)
router.post('/snapshot', authenticate, requireRole('admin_wilaya'), asyncH(async (req, res) => {
  const communeId = req.body.communeId || null;
  await icuaEngine.sauvegarderSnapshot(communeId ? Number(communeId) : null);
  res.json({ ok: true });
}));

module.exports = router;
