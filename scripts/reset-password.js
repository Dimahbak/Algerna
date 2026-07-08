#!/usr/bin/env node
/**
 * Reset manuel d'un mot de passe utilisateur.
 * Usage : node scripts/reset-password.js <téléphone-ou-email> <nouveau-mot-de-passe>
 */
const bcrypt = require('bcryptjs');
const pool = require('../src/db/pool');

(async () => {
  const [,, identifiant, motDePasse] = process.argv;
  if (!identifiant || !motDePasse) {
    console.error('Usage : node scripts/reset-password.js <téléphone-ou-email> <nouveau-mot-de-passe>');
    process.exit(1);
  }
  if (motDePasse.length < 6) { console.error('Mot de passe trop court (min 6 caractères).'); process.exit(1); }

  const isEmail = identifiant.includes('@');
  const { rows } = await pool.query(
    `SELECT id, telephone, email, prenom, nom FROM utilisateur WHERE ${isEmail ? 'email=$1' : 'telephone=$1'}`,
    [identifiant]
  );
  if (!rows.length) { console.error('Compte introuvable :', identifiant); process.exit(1); }

  const user = rows[0];
  const hash = await bcrypt.hash(motDePasse, 10);
  await pool.query('UPDATE utilisateur SET mot_de_passe=$1, reset_token=NULL, reset_expire=NULL WHERE id=$2', [hash, user.id]);

  console.log('Mot de passe réinitialisé pour', user.prenom, user.nom, '(' + user.telephone + ')');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
