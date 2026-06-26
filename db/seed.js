/**
 * Seed de données de base :
 *  - 13 circonscriptions, échantillon de communes
 *  - opérateurs Netcom / Extranet (déchets) et SEAAL (eau)
 *  - catégories de signalement propreté + eau
 *  - services CiviAdmin (familles A/B)
 *  - un compte admin_wilaya de départ
 *
 *   node db/seed.js
 */
const bcrypt = require('bcryptjs');
const { pool, withTransaction } = require('../src/db/pool');
const config = require('../src/config');

// 13 circonscriptions (décret n° 26-112 du 8 mars 2026)
const CIRCONSCRIPTIONS = [
  [1,'Alger-Centre'],[2,'Sidi M\'Hamed'],[3,'El Madania'],[4,'Bab El Oued'],
  [5,'Bouzaréah'],[6,'Hussein Dey'],[7,'El Harrach'],[8,'Baraki'],
  [9,'Dar El Beïda'],[10,'Bir Mourad Raïs'],[11,'Birtouta'],[12,'Zéralda'],[13,'Chéraga'],
];

// Échantillon de communes (à compléter pour les 57)
const COMMUNES = [
  ['Alger-Centre',1,36.7723,3.0598],
  ['Sidi M\'Hamed',2,36.7600,3.0530],
  ['Bab El Oued',4,36.7950,3.0490],
  ['Hydra',10,36.7460,3.0360],
  ['Bab Ezzouar',9,36.7220,3.1840],
  ['El Harrach',7,36.7180,3.1350],
  ['Chéraga',13,36.7680,2.9560],
  ['Zéralda',12,36.7140,2.8420],
];

const CATEGORIES = [
  // propreté
  ['proprete','Dépôt sauvage / ordures','haute'],
  ['proprete','Conteneur débordant','moyenne'],
  ['proprete','Encombrants sur voie publique','moyenne'],
  ['proprete','Déchets verts','basse'],
  ['proprete','Point noir récurrent','haute'],
  ['proprete','Salissure / tags','basse'],
  ['proprete','Animal mort','moyenne'],
  // eau (WaterSignal)
  ['eau','Fuite sur voirie (canalisation visible)','haute'],
  ['eau','Fuite sur compteur / branchement','moyenne'],
  ['eau','Fuite sur bouche / poteau incendie','haute'],
  ['eau','Écoulement d\'eau usée (assainissement)','haute'],
  ['eau','Affaissement / chaussée humide','moyenne'],
  ['eau','Coupure ou baisse de pression','basse'],
  ['eau','Regard / avaloir bouché','moyenne'],
];

const SERVICES = [
  ['Extrait de naissance','A',10],
  ['Acte de mariage','A',10],
  ['Acte de décès','A',10],
  ['Légalisation de signature','B',10],
  ['Certificat de résidence','B',15],
  ['Dossier social','B',20],
];

async function seed() {
  await withTransaction(async (c) => {
    for (const [id,nom] of CIRCONSCRIPTIONS)
      await c.query('INSERT INTO circonscription(id,nom) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING',[id,nom]);

    // communes (résolution du nom de circonscription -> id)
    for (const [nom,circ,lat,lng] of COMMUNES)
      await c.query(
        'INSERT INTO commune(nom,circonscription_id,centre_lat,centre_lng) VALUES ($1,$2,$3,$4)',
        [nom,circ,lat,lng]);

    // opérateurs
    const ops = {
      netcom:   (await c.query("INSERT INTO operateur(nom,domaine,contact) VALUES ('Netcom','proprete','contact@netcom.dz') RETURNING id")).rows[0].id,
      extranet: (await c.query("INSERT INTO operateur(nom,domaine,contact) VALUES ('Extranet','proprete','contact@extranet.dz') RETURNING id")).rows[0].id,
      seaal:    (await c.query("INSERT INTO operateur(nom,domaine,contact) VALUES ('SEAAL','eau','1594') RETURNING id")).rows[0].id,
    };

    // périmètres : Netcom = hypercentre, Extranet = couronne ; SEAAL = tout
    const communes = (await c.query('SELECT id,nom FROM commune')).rows;
    const hyper = new Set(['Alger-Centre','Sidi M\'Hamed','Bab El Oued']);
    for (const cm of communes) {
      const prop = hyper.has(cm.nom) ? ops.netcom : ops.extranet;
      await c.query('INSERT INTO operateur_perimetre(operateur_id,commune_id) VALUES ($1,$2)',[prop,cm.id]);
      await c.query('INSERT INTO operateur_perimetre(operateur_id,commune_id) VALUES ($1,$2)',[ops.seaal,cm.id]);
    }

    for (const [dom,lib,crit] of CATEGORIES)
      await c.query('INSERT INTO categorie_signal(domaine,libelle,criticite) VALUES ($1,$2,$3)',[dom,lib,crit]);

    for (const [nom,fam,duree] of SERVICES)
      await c.query('INSERT INTO service(nom,famille,duree_min) VALUES ($1,$2,$3)',[nom,fam,duree]);

    // compte admin wilaya de départ
    const hash = await bcrypt.hash('admin1234', config.bcryptRounds);
    await c.query(
      `INSERT INTO utilisateur(telephone,nom,prenom,mot_de_passe,role)
       VALUES ('0000000000','Wilaya','Admin',$1,'admin_wilaya')
       ON CONFLICT (telephone) DO NOTHING`, [hash]);
  });
  console.log('Seed terminé. Admin : tel 0000000000 / mdp admin1234 (à changer).');
}

seed().then(() => pool.end()).catch(e => { console.error(e); process.exit(1); });
