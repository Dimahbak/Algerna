/**
 * Seed de données de base :
 *  - 13 circonscriptions, échantillon de communes
 *  - opérateurs Direction Propreté / Direction Propreté Périphérie (déchets) et Direction Eau (eau)
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

// 57 communes de la Wilaya d'Alger (référentiel complet)
const COMMUNES = [
  // Circ 1 — Alger-Centre
  ['Alger-Centre',1,36.7723,3.0598],['Sidi M\'Hamed',1,36.7600,3.0530],
  ['El Madania',1,36.7560,3.0670],['Hussein Dey',1,36.7440,3.1000],
  ['Casbah',1,36.7870,3.0610],['Oued Koriche',1,36.7870,3.0430],
  // Circ 2 — Bab El Oued (ancienne Sidi M'Hamed)
  ['Bab El Oued',2,36.7950,3.0490],['Bologhine',2,36.8010,3.0350],
  // Circ 3 — Bir Mourad Raïs
  ['Bir Mourad Raïs',3,36.7400,3.0480],['Hydra',3,36.7460,3.0360],
  ['El Biar',3,36.7630,3.0310],['El Mouradia',3,36.7510,3.0470],
  ['Birkhradem',3,36.7170,3.0500],
  // Circ 4 — Bouzaréah
  ['Bouzaréah',4,36.7870,3.0140],['Ben Aknoun',4,36.7570,3.0090],
  ['Beni Messous',4,36.7710,2.9930],['Dely Ibrahim',4,36.7520,2.9730],
  ['El Achour',4,36.7350,2.9730],['Rahmania',4,36.7340,2.9380],
  ['Souidania',4,36.7250,2.9050],
  // Circ 5 — Chéraga
  ['Chéraga',5,36.7680,2.9560],['Aïn Benian',5,36.8010,2.9210],
  ['Raïs Hamidou',5,36.8060,2.9850],
  // Circ 6 — Zéralda
  ['Zéralda',6,36.7140,2.8420],['Mahelma',6,36.6830,2.8740],
  ['Tessala El Merdja',6,36.6780,2.9440],['Saoula',6,36.7070,3.0100],
  ['Staoueli',6,36.7480,2.8820],['Ouled Fayet',6,36.7320,2.9620],
  // Circ 7 — Draria
  ['Draria',7,36.7180,2.9920],['Baba Hassan',7,36.6970,2.9690],
  ['Ouled Chebel',7,36.6600,3.0070],['Khraïcia',7,36.6780,3.0100],
  ['Birtouta',7,36.6470,3.0270],['Douéra',7,36.6680,2.9480],
  // Circ 8 — El Harrach
  ['El Harrach',8,36.7180,3.1350],['Kouba',8,36.7340,3.0800],
  ['Bachdjarah',8,36.7220,3.1100],['Bourouba',8,36.7180,3.1050],
  ['Mohammadia',8,36.7370,3.1450],['Séhaoula',8,36.6930,3.0430],
  ['Djasr Kasentina',8,36.7130,3.0970],['Gué de Constantine',8,36.6950,3.0800],
  // Circ 9 — Baraki
  ['Baraki',9,36.6650,3.0900],['Les Eucalyptus',9,36.6600,3.1200],
  ['Sidi Moussa',9,36.6100,3.0960],
  // Circ 10 — Bab Ezzouar
  ['Bab Ezzouar',10,36.7220,3.1840],['Bordj El Bahri',10,36.7600,3.2700],
  ['El Magharia',10,36.7300,3.1500],['Oued Smar',10,36.7100,3.1700],
  // Circ 11 — Dar El Beïda
  ['Dar El Beïda',11,36.7150,3.2350],['Aïn Taya',11,36.7780,3.3200],
  ['Hraoua',11,36.7550,3.2950],['El Marsa',11,36.8050,3.2580],
  // Circ 12 — Bordj El Kiffan
  ['Bordj El Kiffan',12,36.7470,3.1930],
  // Circ 13 — Rouïba
  ['Rouïba',13,36.7280,3.2850],['Reghaïa',13,36.7350,3.3450],
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
  // Famille A — démarches dématérialisées (redirection portail national, pas de RDV)
  ['Extrait de naissance','A',0],
  ['Certificat de résidence','A',0],
  ['Carte nationale d\'identité','A',0],
  ['Fiche familiale','A',0],
  // Famille B — présence requise (RDV physique)
  ['Passeport','B',45],
  ['Permis de construire','B',60],
  ['Légalisation de signature','B',15],
  ['Carte d\'invalidité','B',30],
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
      proprete:   (await c.query("INSERT INTO operateur(nom,domaine,contact) VALUES ('Direction Propreté','proprete','contact-proprete@demo.dz') RETURNING id")).rows[0].id,
      proprete_p: (await c.query("INSERT INTO operateur(nom,domaine,contact) VALUES ('Direction Propreté Périphérie','proprete','contact-proprete-p@demo.dz') RETURNING id")).rows[0].id,
      eau:    (await c.query("INSERT INTO operateur(nom,domaine,contact) VALUES ('Direction Eau','eau','1594') RETURNING id")).rows[0].id,
    };

    // périmètres : Direction Propreté = circ 1,2,3 (centre) ; Direction Propreté Périphérie = circ 4-13 (périphérie) ; Direction Eau = toutes
    const communes = (await c.query('SELECT id,nom,circonscription_id FROM commune')).rows;
    for (const cm of communes) {
      const prop = cm.circonscription_id <= 3 ? ops.proprete : ops.proprete_p;
      await c.query('INSERT INTO operateur_perimetre(operateur_id,commune_id) VALUES ($1,$2)',[prop,cm.id]);
      await c.query('INSERT INTO operateur_perimetre(operateur_id,commune_id) VALUES ($1,$2)',[ops.eau,cm.id]);
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
