const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth');
const { asyncH } = require('../../utils/http');
const intel = require('../../services/intelligence');
const router = express.Router();

const GATE = requireRole('admin_apc', 'admin_wilaya');

router.get('/summary', authenticate, GATE, asyncH(async (req, res) => {
  res.json(await intel.getSummary());
}));

router.get('/facteurs', authenticate, GATE, asyncH(async (req, res) => {
  res.json(await intel.getFacteurs());
}));

router.get('/priorites', authenticate, GATE, asyncH(async (req, res) => {
  res.json(await intel.getPriorites());
}));

router.get('/communes', authenticate, GATE, asyncH(async (req, res) => {
  res.json(await intel.getCommunes());
}));

router.get('/services', authenticate, GATE, asyncH(async (req, res) => {
  res.json(await intel.getServices());
}));

router.get('/alertes', authenticate, GATE, asyncH(async (req, res) => {
  res.json(await intel.getAlertes());
}));

module.exports = router;
