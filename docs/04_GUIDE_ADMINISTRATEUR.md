# ALGERNA - Guide Administrateur Technique

**Projet** : ALGERNA - Plateforme Citoyenne Intelligente de la Wilaya d'Alger
**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Classification** : Document technique - Diffusion restreinte aux administrateurs
**Langue** : Francais (version arabe a venir)

---

## Table des matieres

1. [Installation](#1-installation)
2. [Structure du projet](#2-structure-du-projet)
3. [Configuration environnement](#3-configuration-environnement)
4. [Deploiement](#4-deploiement)
5. [Base de donnees](#5-base-de-donnees)
6. [Securite](#6-securite)
7. [ConfigEngine](#7-configengine)
8. [Sauvegarde et restauration](#8-sauvegarde-et-restauration)
9. [Maintenance](#9-maintenance)
10. [Audit et tracabilite](#10-audit-et-tracabilite)

---

## 1. Installation

### 1.1. Pre-requis systeme

| Composant | Version minimale | Recommandee |
|-----------|-----------------|-------------|
| Node.js | 20.x LTS | 20.x LTS |
| PostgreSQL | 14.x | 16.x |
| npm | 10.x | 10.x |
| Systeme d'exploitation | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### 1.2. Procedure d'installation

```bash
# 1. Cloner le depot
git clone <url-du-depot> civismart
cd civismart

# 2. Installer les dependances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Editer .env avec les valeurs appropriees (voir section 3)

# 4. Executer les migrations de base de donnees
node db/migrate.js up

# 5. Demarrer le serveur
node src/server.js
```

Le serveur demarre par defaut sur le port 3055.

### 1.3. Verification de l'installation

```bash
# Verifier que le serveur repond
curl http://localhost:3055/api/health

# Reponse attendue :
# {"status":"ok","version":"1.0.0-alpha.2"}
```

---

## 2. Structure du projet

```
civismart/
├── db/
│   ├── migrations/          # Fichiers de migration SQL (001 a 009)
│   ├── migrate.js           # Outil de migration
│   └── pool.js              # Pool de connexions PostgreSQL
├── public/
│   ├── assets/              # Ressources statiques (images, icones, polices)
│   │   ├── algerna/         # Ressources du design system ALGERNA
│   │   ├── bg/              # Images de fond (landing, illustrations)
│   │   └── icons/           # Icones de l'application
│   ├── index.html           # Point d'entree HTML (SPA)
│   ├── sw.js                # Service Worker (cache PWA)
│   ├── i18n.js              # Internationalisation (FR/AR)
│   └── .htaccess            # Configuration Apache/OLS
├── src/
│   ├── modules/             # Modules fonctionnels
│   │   ├── auth/            # Authentification et autorisation
│   │   ├── dashboard/       # Tableaux de bord (citoyen, agent, responsable)
│   │   ├── equipements/     # Gestion des equipements publics
│   │   ├── proprete/        # Module proprete
│   │   ├── referentiel/     # Donnees de reference
│   │   └── saksini/         # Assistant numerique Saksini
│   ├── services/            # Services transversaux
│   ├── middleware/           # Middlewares Express (auth, validation, upload)
│   ├── app.js               # Configuration Express
│   └── server.js            # Point d'entree serveur
├── docs/                    # Documentation du projet
├── package.json
└── .env                     # Variables d'environnement (non versionne)
```

### 2.1. Modules fonctionnels (`src/modules/`)

Chaque module suit une architecture standardisee :

- `index.js` : Routes Express (router) et logique metier.
- Les modules s'enregistrent dans `src/app.js` via `app.use('/api/<module>', router)`.

### 2.2. Ressources statiques (`public/`)

L'application est une SPA (Single Page Application). Le fichier `index.html` charge l'ensemble de l'interface. Le Service Worker (`sw.js`) gere le cache pour le fonctionnement hors-ligne (mode PWA).

---

## 3. Configuration environnement

Le fichier `.env` situe a la racine du projet contient l'ensemble des variables de configuration.

### 3.1. Variables obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port d'ecoute du serveur HTTP | `3055` |
| `DATABASE_URL` | Chaine de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/civismart` |
| `JWT_SECRET` | Cle secrete pour la generation des tokens JWT | `<chaine aleatoire 64+ caracteres>` |
| `BCRYPT_ROUNDS` | Nombre de tours de hachage bcrypt | `12` |

### 3.2. Variables optionnelles

| Variable | Description | Valeur par defaut |
|----------|-------------|-------------------|
| `UPLOAD_DIR` | Repertoire de stockage des fichiers uploades | `./uploads` |
| `SMTP_HOST` | Serveur SMTP pour l'envoi de courriels | *(non configure)* |
| `SMTP_PORT` | Port du serveur SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | *(non configure)* |
| `SMTP_PASS` | Mot de passe SMTP | *(non configure)* |
| `SMTP_FROM` | Adresse expediteur des courriels | `noreply@algerna.dz` |

> **Securite** : Le fichier `.env` ne doit jamais etre versionne. Il est inclus dans le `.gitignore`. La valeur de `JWT_SECRET` doit etre une chaine aleatoire robuste, generee par exemple avec `openssl rand -hex 64`.

---

## 4. Deploiement

### 4.1. Deploiement avec PM2

PM2 est le gestionnaire de processus recommande pour la production.

```bash
# Installation globale de PM2
npm install -g pm2

# Demarrage de l'application
pm2 start src/server.js --name civismart

# Commandes utiles
pm2 status              # Etat des processus
pm2 logs civismart      # Consulter les logs
pm2 restart civismart   # Redemarrer l'application
pm2 stop civismart      # Arreter l'application

# Demarrage automatique au boot
pm2 startup
pm2 save
```

### 4.2. Configuration du proxy inverse (OLS)

OpenLiteSpeed (OLS) est utilise comme serveur frontal et proxy inverse.

Configuration type pour le virtual host :

```
# Proxy vers l'application Node.js
extprocessor civismart {
  type            proxy
  address         127.0.0.1:3055
  maxConns        100
  initTimeout     60
  retryTimeout    0
}
```

Les fichiers statiques du repertoire `public/` sont servis directement par OLS pour des performances optimales. Le fichier `public/.htaccess` contient les regles de reecriture necessaires.

### 4.3. Configuration HTTPS

Le certificat SSL/TLS doit etre configure au niveau d'OLS. L'utilisation de Let's Encrypt avec renouvellement automatique est recommandee.

---

## 5. Base de donnees

### 5.1. Schema general

La base de donnees PostgreSQL comprend **49 tables** organisees par domaine fonctionnel.

### 5.2. Migrations

Les migrations sont gerees par le fichier `db/migrate.js` et stockees dans `db/migrations/`.

| Migration | Fichier | Description |
|-----------|---------|-------------|
| 001 | `001_init.sql` | Schema initial (utilisateurs, signalements, categories) |
| 002 | `002_patrimoine.sql` | Tables du patrimoine et equipements publics |
| 003 | `003_communique_admin.sql` | Communiques et administration initiale |
| 004 | `004_workflow_sprint2.sql` | Workflow de traitement avance (Sprint 2) |
| 005 | `005_cap_sprint3.sql` | Module CAP et missions terrain (Sprint 3) |
| 006 | `006_communiques_workflow.sql` | Workflow complet des communiques |
| 007 | `007_administration.sql` | Tables d'administration et configuration |
| 008 | `008_icua_engine.sql` | Moteur ICUA (Indice de Cadre Urbain Algerois) |
| 009 | `009_intelligence.sql` | Centre d'Intelligence Operationnelle |

### 5.3. Commandes de migration

```bash
# Appliquer toutes les migrations en attente
node db/migrate.js up

# Verifier l'etat des migrations
node db/migrate.js status
```

### 5.4. Tables principales

| Domaine | Tables cles |
|---------|-------------|
| Authentification | `utilisateurs`, `sessions` |
| Signalements | `signalements`, `signalement_historique`, `categories`, `sous_categories` |
| CAP | `missions_cap`, `cap_agents` |
| Equipements | `equipements`, `types_equipement` |
| Administration | `config_systeme`, `communes`, `services`, `engagements_service` |
| Communiques | `communiques`, `communique_workflow` |
| ICUA | `icua_scores`, `icua_composantes` |
| Intelligence | `facteurs_degradation`, `alertes_intelligentes` |
| Audit | `audit_log`, `signalement_historique` |
| Saksini | `saksini_index` |

---

## 6. Securite

### 6.1. Authentification

- **JWT (JSON Web Tokens)** : Chaque utilisateur authentifie recoit un token JWT signe avec `JWT_SECRET`. Le token est transmis dans l'en-tete `Authorization: Bearer <token>`.
- **Duree de validite** : Configurable via `config_systeme`.
- **Renouvellement** : Le token est renouvele a chaque requete authentifiee.

### 6.2. Hachage des mots de passe

- **bcrypt** avec **12 rounds** de salage (configurable via `BCRYPT_ROUNDS`).
- Les mots de passe ne sont jamais stockes en clair.
- Le nombre de rounds est un compromis entre securite et performance.

### 6.3. Controle d'acces (RBAC)

Le systeme de controle d'acces base sur les roles (RBAC) definit 5 profils :

| Role | Code | Niveau d'acces |
|------|------|----------------|
| Citoyen | `citoyen` | Acces aux modules citoyens uniquement |
| Agent | `agent` | Traitement des signalements |
| CAP | `cap` | Missions terrain |
| Responsable | `responsable` | Supervision et intelligence |
| Administrateur | `admin` | Acces complet a toutes les fonctionnalites |

Chaque route API verifie le role de l'utilisateur via le middleware d'autorisation.

### 6.4. Protections supplementaires

- **Rate limiting** : Limitation du nombre de requetes par IP et par utilisateur pour prevenir les abus.
- **Helmet** : En-tetes de securite HTTP (CSP, HSTS, X-Frame-Options, etc.).
- **Validation des entrees** : Toutes les donnees utilisateur sont validees et nettoyees avant traitement.
- **Upload securise** : Verification du type MIME, limite de taille, renommage des fichiers.

---

## 7. ConfigEngine

Le ConfigEngine est le systeme de configuration dynamique de la plateforme, base sur la table `config_systeme`.

### 7.1. Principe de fonctionnement

Les parametres de configuration sont stockes en base de donnees et accessibles via une API interne avec cache en memoire.

### 7.2. API interne

```javascript
const config = require('./services/config');

// Recuperer une valeur (string)
const val = await config.get('cle_param');

// Recuperer une valeur entiere
const nbr = await config.getInt('delai_max_jours');

// Recuperer une valeur booleenne
const flag = await config.getBool('maintenance_mode');

// Definir une valeur
await config.set('cle_param', 'nouvelle_valeur');
```

### 7.3. Cache

- **Duree du cache** : 5 minutes.
- Le cache est invalide automatiquement lors d'un appel a `set()`.
- En cas de besoin, le cache peut etre purge manuellement via un redemarrage du processus.

### 7.4. Parametres principaux

| Cle | Type | Description |
|-----|------|-------------|
| `maintenance_mode` | bool | Active/desactive le mode maintenance |
| `delai_engagement_heures` | int | Delai cible de traitement (defaut: 48) |
| `max_upload_size_mb` | int | Taille maximale des fichiers uploades |
| `gamification_active` | bool | Active/desactive le systeme de points |
| `icua_refresh_interval` | int | Intervalle de recalcul ICUA (minutes) |

---

## 8. Sauvegarde et restauration

### 8.1. Sauvegarde de la base de donnees

```bash
# Sauvegarde complete (format custom compresse)
pg_dump -Fc -f backup_civismart_$(date +%Y%m%d_%H%M%S).dump $DATABASE_URL

# Sauvegarde en SQL lisible
pg_dump -f backup_civismart_$(date +%Y%m%d_%H%M%S).sql $DATABASE_URL

# Restauration depuis un dump
pg_restore -d $DATABASE_URL backup_civismart_XXXXXXXX.dump
```

**Recommandation** : Mettre en place une sauvegarde automatique quotidienne via cron.

```bash
# Exemple crontab (sauvegarde quotidienne a 2h00)
0 2 * * * pg_dump -Fc -f /backups/civismart_$(date +\%Y\%m\%d).dump $DATABASE_URL
```

### 8.2. Sauvegarde des fichiers uploades

Les fichiers uploades (photos de signalements, pieces jointes) sont stockes dans le repertoire configure par `UPLOAD_DIR`.

```bash
# Sauvegarde incrementale avec rsync
rsync -avz --delete $UPLOAD_DIR/ /backups/uploads/
```

### 8.3. Strategie de retention

| Type | Frequence | Retention |
|------|-----------|-----------|
| Base de donnees | Quotidienne | 30 jours |
| Fichiers uploades | Quotidienne | 90 jours |
| Sauvegarde complete | Hebdomadaire | 12 semaines |

---

## 9. Maintenance

### 9.1. Redemarrage de l'application

```bash
# Redemarrage standard (zero downtime si cluster PM2)
pm2 restart civismart

# Redemarrage avec vidage des logs
pm2 flush civismart && pm2 restart civismart
```

### 9.2. Application des migrations

Lors d'une mise a jour, les migrations doivent etre appliquees avant le redemarrage :

```bash
# 1. Appliquer les nouvelles migrations
node db/migrate.js up

# 2. Redemarrer l'application
pm2 restart civismart
```

### 9.3. Gestion du cache Service Worker

Le Service Worker (`public/sw.js`) utilise un systeme de versionnement du cache. Lors d'une mise a jour de l'application :

1. Incrementer la version du cache dans `sw.js` (constante `CACHE_VERSION`).
2. Deployer les nouveaux fichiers.
3. Les clients recevront automatiquement la mise a jour au prochain chargement.

### 9.4. Surveillance

```bash
# Etat des processus PM2
pm2 status

# Monitoring temps reel
pm2 monit

# Logs en temps reel
pm2 logs civismart --lines 100
```

---

## 10. Audit et tracabilite

### 10.1. Journal d'audit (`audit_log`)

La table `audit_log` enregistre toutes les actions sensibles effectuees sur la plateforme :

| Champ | Description |
|-------|-------------|
| `id` | Identifiant unique de l'entree |
| `utilisateur_id` | Auteur de l'action |
| `action` | Type d'action (CREATE, UPDATE, DELETE, LOGIN, etc.) |
| `table_cible` | Table affectee |
| `enregistrement_id` | Identifiant de l'enregistrement concerne |
| `donnees_avant` | Etat avant modification (JSON) |
| `donnees_apres` | Etat apres modification (JSON) |
| `ip_adresse` | Adresse IP de l'utilisateur |
| `created_at` | Horodatage de l'action |

### 10.2. Historique des signalements (`signalement_historique`)

Chaque changement d'etat d'un signalement est trace dans la table `signalement_historique` :

- Ancien etat et nouvel etat.
- Utilisateur ayant effectue le changement.
- Commentaire associe.
- Horodatage.

### 10.3. Workflow des communiques (`communique_workflow`)

Chaque etape du workflow de publication est tracee :

- Passage de brouillon a revision.
- Passage de revision a validation.
- Publication effective.
- Acteur et horodatage de chaque etape.

### 10.4. Consultation du journal

Le journal d'audit est consultable depuis l'onglet **Journal** du panneau d'administration. Les filtres disponibles permettent de rechercher par :

- Utilisateur.
- Type d'action.
- Periode.
- Table concernee.

---

## Annexes

### A. Commandes de reference rapide

```bash
# Demarrage
npm install && node db/migrate.js up && pm2 start src/server.js --name civismart

# Mise a jour
git pull && npm install && node db/migrate.js up && pm2 restart civismart

# Sauvegarde
pg_dump -Fc -f backup.dump $DATABASE_URL

# Logs
pm2 logs civismart --lines 200
```

### B. Ports et services

| Service | Port | Protocole |
|---------|------|-----------|
| Application Node.js | 3055 | HTTP |
| PostgreSQL | 5432 | TCP |
| OLS (HTTPS) | 443 | HTTPS |
| OLS (HTTP redirect) | 80 | HTTP |

---

*Document genere le 30 juin 2026 — ALGERNA v1.0.0-alpha.2*
*Usage reserve aux administrateurs techniques de la plateforme.*
