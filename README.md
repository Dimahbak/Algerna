# Alger CiviSmart · Code de départ (backend)

Plateforme citoyenne de gouvernance territoriale pour la Wilaya d'Alger.
Ce dépôt est le **squelette applicatif prêt à coder** : architecture, base de
données PostgreSQL, authentification, et les modules métier déjà câblés avec un
premier niveau d'implémentation fonctionnelle.

> Document compagnon : `docs/CAHIER_DES_CHARGES.md` (fonctionnel) et
> `docs/API.md` (référence des endpoints).

---

## 1. Stack

| Couche | Choix | Pourquoi |
|--------|-------|----------|
| Runtime | Node.js ≥ 18 + Express | Standard, rapide à déployer |
| Base de données | **PostgreSQL** | Vraie base relationnelle : intégrité, transactions, requêtes géo/agrégées |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` | Sans dépendance native, déployable sans build |
| Validation | `zod` | Schémas d'entrée stricts |
| Sécurité | `helmet`, `cors`, `express-rate-limit` | Durcissement de base |
| Upload | `multer` | Photos de signalement (stockées sur disque, pas en base) |

Aucune compilation native requise (`bcryptjs` et non `bcrypt`).

---

## 2. Démarrage

```bash
cp .env.example .env          # renseigner DATABASE_URL et JWT_SECRET
npm install
npm run migrate               # crée le schéma
npm run seed                  # référentiel + opérateurs + catégories + admin
npm run dev                   # API sur http://localhost:3000
```

Compte admin de départ après seed : téléphone `0000000000`, mot de passe
`admin1234` (**à changer immédiatement**).

Vérifier : `GET /api/health` → `{ "ok": true }`.

---

## 3. Architecture

```
src/
  config/        Configuration centralisée (.env)
  db/            Pool PostgreSQL + helper de transaction
  middleware/    auth (JWT/rôles), validation (zod), gestion d'erreurs
  modules/
    auth/        Inscription, connexion, profil
    referentiel/ Circonscriptions, communes, opérateurs
    rdv/         CiviAdmin — RDV & file virtuelle (familles A/B)
    proprete/    CiviSignal — déchets  ── socle commun de signalements ──┐
    eau/         WaterSignal — fuites (SEAAL)  ← réutilise le même socle ─┘
    points/      Citoyen Sentinelle (solde + classement)
    dashboard/   Tableau de bord Wilaya + calcul ICUA
  app.js         Montage Express
  server.js      Démarrage
db/
  migrations/    SQL versionné (001_init.sql)
  migrate.js     Runner de migrations
  seed.js        Données de base
```

### Le socle de signalements (point d'architecture clé)

`CiviSignal` (propreté) et `WaterSignal` (eau) **ne sont pas deux modules
séparés** : ils partagent une seule table `signalement` discriminée par un champ
`domaine` (`proprete` | `eau`), et un seul service
(`modules/proprete/signalementService.js`). Le routeur est produit par une
fabrique (`makeSignalementRouter(domaine)`).

Conséquence directe : ajouter WaterSignal n'a coûté qu'un fichier de 2 lignes
(`modules/eau/index.js`). Le même mécanisme permettrait d'ajouter un 3ᵉ domaine
(éclairage, voirie…) au même coût marginal. **C'est l'argument « coût de
développement marginal » du dossier, rendu vrai dans le code.**

---

## 4. Modèle de données (résumé)

- **Référentiel** : `circonscription` (13), `commune`, `operateur`
  (Netcom/Extranet/SEAAL), `operateur_perimetre` (qui sert quelle commune).
- **Utilisateurs** : `utilisateur` avec rôles `citoyen | agent | admin_apc |
  admin_wilaya | operateur`.
- **CiviAdmin** : `service` (famille A/B), `creneau`, `rdv` (file virtuelle,
  numéro de ticket, anti-surbooking par verrou transactionnel).
- **Signalements** : `categorie_signal`, `signalement`,
  `signalement_historique` (horodatage de chaque état = base des délais SLA).
- **Points** : `points_journal` + colonne dénormalisée `utilisateur.points`.
- **ICUA** : `icua_snapshot` (instantanés périodiques de l'indice).

Schéma complet et commenté : `db/migrations/001_init.sql`.

---

## 5. Ce qui est fait / ce qui reste

**Fait (fonctionnel)** : auth complète, référentiel, RDV + file + gestion
présence, signalements propreté & eau (création/photo/routage opérateur/
changement d'état/preuve), scores par commune, détection de points noirs,
délai moyen de réparation, points Citoyen Sentinelle, ICUA, durcissement
sécurité de base.

**À développer (jalonné dans le cahier des charges)** :
- Interconnexion API réelle avec les opérateurs (Netcom, Extranet, SEAAL) —
  aujourd'hui : transmission autonome ; cible : échange bidirectionnel.
- Notifications (SMS/push) sur changement d'état.
- Calcul ICUA enrichi (dimension Vivre-ensemble) + job planifié de snapshot.
- Génération des créneaux RDV en masse + no-show management (relances,
  surbooking, remplissage de liste d'attente).
- Front citoyen (les maquettes existent) et front agent/wilaya.
- Tests d'intégration sur base de test.

---

## 6. Conventions

- Toutes les requêtes SQL sont **paramétrées** (`$1, $2…`) — jamais de
  concaténation. Pas d'ORM imposé ; `pg` directement pour rester lisible.
- Les écritures multi-tables passent par `withTransaction`.
- Les erreurs métier lèvent un `HttpError` (voir `utils/http.js`) capté par le
  middleware global.
- Réponses et messages d'erreur en français (public algérien).
