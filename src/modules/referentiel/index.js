// Référentiel territorial (lecture publique).
const express = require('express');
const { query } = require('../../db/pool');
const { asyncH } = require('../../utils/http');

const router = express.Router();

router.get('/circonscriptions', asyncH(async (req, res) => {
  const { rows } = await query('SELECT id,nom FROM circonscription ORDER BY id');
  res.json(rows);
}));

router.get('/communes', asyncH(async (req, res) => {
  const { rows } = await query(
    `SELECT c.id,c.nom,c.circonscription_id,c.centre_lat,c.centre_lng, ci.nom AS circonscription
       FROM commune c JOIN circonscription ci ON ci.id=c.circonscription_id
      ORDER BY c.nom`);
  res.json(rows);
}));

router.get('/operateurs', asyncH(async (req, res) => {
  const { rows } = await query('SELECT id,nom,domaine FROM operateur ORDER BY domaine,nom');
  res.json(rows);
}));


router.get('/epics', asyncH(async (req, res) => {
  const { categorie, type } = req.query;
  let sql = 'SELECT id,sigle,nom,categorie,type,description FROM epic WHERE actif=TRUE';
  const params = [];
  if (categorie) { params.push(categorie); sql += ` AND categorie=$${params.length}`; }
  if (type)      { params.push(type);      sql += ` AND type=$${params.length}`; }
  sql += ' ORDER BY categorie,sigle';
  const { rows } = await query(sql, params);
  res.json(rows);
}));

router.get('/epics/:sigle', asyncH(async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM epic WHERE sigle=$1', [req.params.sigle.toUpperCase()]);
  if (!rows.length) return res.status(404).json({erreur:'EPIC introuvable.'});
  res.json(rows[0]);
}));

module.exports = router;
