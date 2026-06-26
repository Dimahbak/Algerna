const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { query } = require('../../db/pool');
const config = require('../../config');
const { validate } = require('../../middleware/validation');
const { signToken, authenticate } = require('../../middleware/auth');
const { asyncH, badRequest, unauthorized } = require('../../utils/http');

const router = express.Router();

const registerSchema = z.object({
  telephone: z.string().min(9).max(20),
  motDePasse: z.string().min(6),
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().email().optional(),
  communeId: z.number().int().optional(),
});

const loginSchema = z.object({
  telephone: z.string(),
  motDePasse: z.string(),
});

// POST /api/auth/register — inscription citoyen
router.post('/register', validate(registerSchema), asyncH(async (req, res) => {
  const { telephone, motDePasse, nom, prenom, email, communeId } = req.body;
  const exists = await query('SELECT 1 FROM utilisateur WHERE telephone=$1', [telephone]);
  if (exists.rowCount) throw badRequest('Ce numéro est déjà inscrit.');

  const hash = await bcrypt.hash(motDePasse, config.bcryptRounds);
  const { rows } = await query(
    `INSERT INTO utilisateur(telephone,email,nom,prenom,mot_de_passe,commune_id,role)
     VALUES ($1,$2,$3,$4,$5,$6,'citoyen')
     RETURNING id, telephone, nom, prenom, role, commune_id, points`,
    [telephone, email || null, nom || null, prenom || null, hash, communeId || null]
  );
  const user = rows[0];
  res.status(201).json({ token: signToken(user), utilisateur: user });
}));

// POST /api/auth/login
router.post('/login', validate(loginSchema), asyncH(async (req, res) => {
  const { telephone, motDePasse } = req.body;
  const { rows } = await query(
    'SELECT * FROM utilisateur WHERE telephone=$1 AND actif=TRUE', [telephone]);
  if (!rows.length) throw unauthorized('Identifiants incorrects.');

  const user = rows[0];
  const ok = await bcrypt.compare(motDePasse, user.mot_de_passe);
  if (!ok) throw unauthorized('Identifiants incorrects.');

  delete user.mot_de_passe;
  res.json({ token: signToken(user), utilisateur: user });
}));

// GET /api/auth/me — profil courant
router.get('/me', authenticate, asyncH(async (req, res) => {
  const { rows } = await query(
    'SELECT id,telephone,nom,prenom,email,role,commune_id,operateur_id,points FROM utilisateur WHERE id=$1',
    [req.user.id]);
  res.json(rows[0]);
}));

module.exports = router;
