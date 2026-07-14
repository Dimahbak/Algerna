# ALGERNA -- Rapport de Collaboration et Guide d'Integration

**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Classification** : Document interne -- Wilaya d'Alger
**Destinataires** : Nouveaux membres de l'equipe de developpement

---

## Table des matieres

1. [Presentation generale](#presentation-generale)
2. [Reference rapide de l'architecture](#reference-rapide-de-larchitecture)
3. [Workflows cles](#workflows-cles)
4. [Profils utilisateurs](#profils-utilisateurs)
5. [Conventions de developpement](#conventions-de-developpement)
6. [Depot GitHub](#depot-github)
7. [Problemes connus](#problemes-connus)
8. [Prochaines etapes](#prochaines-etapes)
9. [Resume executif](#resume-executif)

---

## Presentation generale

ALGERNA est la plateforme civique officielle de la Wilaya d'Alger. Elle met en relation les citoyens, les agents de terrain (CAP -- Corps d'Accompagnement de Proximite), les responsables operationnels et les administrateurs systeme au travers d'une plateforme numerique unifiee.

**Pile technologique** :

- **Backend** : Express.js (Node.js)
- **Base de donnees** : PostgreSQL
- **Frontend** : SPA (Single Page Application) en JavaScript vanilla
- **Authentification** : JWT (JSON Web Token)

**Dimensions du projet** :

- 22 modules fonctionnels
- 8 moteurs (engines) de services
- 49+ tables en base de donnees
- 8 sprints de developpement completes

---

## Reference rapide de l'architecture

### Point d'entree

```
src/server.js  -->  src/app.js
```

Le fichier `server.js` initialise le serveur HTTP et le connecte a la base de donnees. Le fichier `app.js` configure Express, monte les middlewares et enregistre les routes de tous les modules.

### Modules

Chaque module est organise dans son propre repertoire sous `src/modules/` et expose ses routes via un fichier `index.js` :

```
src/modules/
  auth/index.js          -- Authentification et gestion des sessions
  signaler/index.js      -- Signalements citoyens
  cap/index.js           -- Missions de terrain (CAP)
  supervision/index.js   -- Supervision operationnelle
  admin/index.js         -- Administration et configuration
  icua/index.js          -- Indicateur Composite Urbain d'Alger
  intelligence/index.js  -- Analyse et aide a la decision
  communiques/index.js   -- Communiques institutionnels
  equipements/index.js   -- Annuaire des equipements publics
  referentiel/index.js   -- Donnees de reference
  dashboard/index.js     -- Tableaux de bord
  proprete/router.js     -- Module proprete
  saksini/               -- Module Saksini (en developpement)
  ...
```

### Moteurs de services

Les services transversaux sont regroupes sous `src/services/` :

```
src/services/
  workflow.js       -- Moteur de transitions d'etat
  communication.js  -- Notifications et messages
  sla.js            -- Engagements de service (SLA)
  icua.js           -- Calcul du score ICUA
  intelligence.js   -- Analyse deterministe
  configEngine.js   -- Configuration dynamique
  ...
```

### Frontend

```
public/
  index.html   -- Application SPA monolithique (toutes les vues)
  i18n.js      -- Systeme d'internationalisation (FR/AR)
  sw.js        -- Service Worker (cache, mode hors-ligne)
  assets/      -- Ressources statiques (images, icones, styles)
```

### Base de donnees

Les migrations sont numerotees sequentiellement :

```
db/migrations/
  001_init.sql
  002_*.sql
  ...
  009_*.sql
```

---

## Workflows cles

### Workflow de signalement (5 etats)

```
SOUMIS --> EN_COURS --> AFFECTE --> RESOLU --> CLOTURE
```

- **SOUMIS** : Le citoyen a depose un signalement
- **EN_COURS** : Un agent a pris en charge le signalement
- **AFFECTE** : Le signalement est assigne a une equipe ou un agent CAP
- **RESOLU** : L'intervention est terminee
- **CLOTURE** : Le signalement est ferme (avec ou sans validation citoyenne)

### Workflow de mission CAP (5 etats)

```
ASSIGNEE --> EN_DEPLACEMENT --> SUR_SITE --> TERMINEE --> VALIDEE
```

- **ASSIGNEE** : La mission est attribuee a un agent CAP
- **EN_DEPLACEMENT** : L'agent est en route vers le lieu d'intervention
- **SUR_SITE** : L'agent est arrive et intervient
- **TERMINEE** : L'agent a termine son intervention
- **VALIDEE** : Le responsable a valide le compte rendu

### Workflow de communique (6 etats)

```
BROUILLON --> SOUMIS --> EN_REVISION --> APPROUVE --> PUBLIE --> ARCHIVE
```

- **BROUILLON** : L'agent redige le communique
- **SOUMIS** : Le communique est envoye pour validation
- **EN_REVISION** : Le responsable examine le contenu
- **APPROUVE** : Le communique est valide par le responsable
- **PUBLIE** : Le communique est visible publiquement
- **ARCHIVE** : Le communique est retire de la publication active

---

## Profils utilisateurs

Cinq roles sont definis dans la plateforme. Pour l'environnement de developpement, les identifiants suivants sont preconfigures :

| Role | Telephone | Mot de passe | Description |
|------|-----------|-------------|-------------|
| Citoyen test | 0550000001 | admin1234 | Amina Benali — espace citoyen |
| Agent reception wilaya | 0550000002 | admin@@1234 | Youcef Kaci — board Kanban |
| Commandement cabinet wilaya | 0550000003 | admin@@1234 | Rachid Mansouri — Salle de Commandement |
| Superviseur APC | 0550000004 | admin@@1234 | Mourad Hadj — cockpit communal |
| EPIC proprete | 0550000005 | admin@@1234 | Nassim Taleb — operateur EPIC |
| EPIC Eclairage Public | 0550000006 | admin@@1234 | Nadia Aissaoui — Direction Eclairage Public |
| CAP | 0550000007 | admin@@1234 | Karim Benali — agent de proximite |
| EPIC Parking | 0550000008 | admin@@1234 | Khaled Boumediene — operateur EPIC |
| EPIC Patrimoine local | 0550000009 | admin@@1234 | Samira Hadji — Patrimoine Local (Regie Fonciere) |
| EPIC Direction de l'Eau | 0550000010 | admin@@1234 | Farid Mebarki — Direction de l'Eau |
| Cabinet wilaya CCOE | 0550000011 | admin@@1234 | Yacine Benmoussa — CCOE |

**Attention** : Ces identifiants sont destines exclusivement a l'environnement de demonstration. Tableau de reference valide par Hamid le 12 juillet 2026.

---

## Conventions de developpement

### Routes API

Les routes sont montees en double pour assurer la compatibilite avec le proxy OLS (Open Liberty Server) :

```javascript
// Montage dual dans app.js
app.use('/api/signaler', signalerRouter);
app.use('/signaler', signalerRouter);
```

Cette convention permet l'acces aux API aussi bien via le prefixe `/api/` que directement via le chemin du module.

### Authentification

- Protocole : JWT Bearer Token dans le header `Authorization`
- Middleware : `requireRole()` pour le controle d'acces par role
- Exemple d'utilisation :

```javascript
router.get('/liste', requireRole('agent', 'responsable'), asyncH(async (req, res) => {
  // Accessible uniquement aux agents et responsables
}));
```

### Gestion des erreurs

- Wrapper asynchrone : `asyncH()` pour capturer automatiquement les erreurs des handlers async
- Classe d'erreur : `HttpError` pour les erreurs HTTP structurees

```javascript
const { asyncH, HttpError } = require('../../utils');

router.get('/item/:id', asyncH(async (req, res) => {
  const item = await findById(req.params.id);
  if (!item) throw new HttpError(404, 'Element introuvable');
  res.json(item);
}));
```

### Acces a la base de donnees

- Requetes parametrees obligatoires (prevention des injections SQL)
- Transactions via `withTransaction()` pour les operations multi-tables

```javascript
await withTransaction(async (client) => {
  await client.query('UPDATE signalements SET statut = $1 WHERE id = $2', [statut, id]);
  await client.query('INSERT INTO historique (signalement_id, action) VALUES ($1, $2)', [id, action]);
});
```

### Internationalisation (i18n)

- Attributs HTML : `data-i18n="cle.traduction"` sur les elements du DOM
- Objet central : `I18N` dans `public/i18n.js`
- Langues supportees : francais (fr), arabe (ar)

```html
<h1 data-i18n="dashboard.titre">Tableau de bord</h1>
```

### Service Worker

- Fichier : `public/sw.js`
- **Regle imperative** : incrementer le numero de version a chaque modification du Service Worker
- Gestion du cache pour le mode hors-ligne

---

## Depot GitHub

- **URL** : [https://github.com/Dimahbak/Algerna](https://github.com/Dimahbak/Algerna)
- **Branche principale** : `main`
- **Convention de commits** : prefixes semantiques (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `test:`)

---

## Problemes connus

### Cache du proxy OLS

Le proxy OLS applique un cache agressif qui peut empecher la prise en compte immediate des modifications. En developpement, il est recommande de desactiver le cache navigateur et de forcer le rechargement complet (Ctrl+Shift+R).

### Taille du fichier index.html

Le fichier `public/index.html` concentre l'ensemble des vues de l'application SPA. Sa taille impacte le temps de chargement initial et rend la maintenance complexe. La refactorisation en composants modulaires est planifiee dans la feuille de route a court terme.

### Absence de tests automatises

Le projet ne dispose pas encore de suite de tests automatises. Les tests de non-regression sont effectues manuellement. La mise en place de Jest est prevue dans la feuille de route a court terme.

---

## Prochaines etapes

Les priorites immediates pour l'equipe de developpement sont :

1. **CI/CD** : Mise en place du pipeline GitHub Actions pour l'integration et le deploiement continus
2. **Tests automatises** : Integration de Jest et ecriture des tests unitaires sur les modules critiques
3. **Refactorisation frontend** : Eclatement de `index.html` en composants charges dynamiquement
4. **Audit de securite** : Revue OWASP complete et correction des vulnerabilites

Pour le detail complet de la feuille de route, consulter le document `10_ROADMAP_v2.md`.

---

## Resume executif

### ALGERNA -- Plateforme de Gouvernance Civique de la Wilaya d'Alger

ALGERNA est une plateforme numerique de gouvernance civique complete, developpee pour la Wilaya d'Alger. Elle constitue le lien numerique entre les citoyens et l'administration locale, couvrant l'ensemble du cycle de vie de la gestion urbaine : du signalement citoyen a la resolution sur le terrain, avec une tracabilite integrale.

#### Vocation

La plateforme connecte quatre categories d'acteurs au sein d'un ecosysteme numerique unifie :

- **Les citoyens**, qui signalent les dysfonctionnements urbains, prennent rendez-vous avec les services publics et suivent le traitement de leurs demandes en temps reel.
- **Les agents de terrain (CAP)**, qui recoivent et executent les missions d'intervention via une application mobile-first avec navigation GPS integree. Leur role est strictement positif : accompagner, orienter et informer les citoyens, jamais les sanctionner.
- **Les responsables operationnels**, qui supervisent l'activite en temps reel, valident les interventions et les communiques, et disposent d'outils d'analyse pour optimiser le service.
- **Les administrateurs**, qui configurent l'ensemble des parametres de la plateforme sans intervention technique, grace au moteur de configuration dynamique (ConfigEngine).

#### Capacites principales

- **Signalements citoyens** : depot, suivi et resolution des signalements avec workflow a 5 etats et routage automatique vers le service competent.
- **Gestion des rendez-vous** : prise de rendez-vous en ligne avec les services de la Wilaya.
- **Annuaire des equipements** : repertoire de plus de 301 equipements publics georeferencies.
- **Supervision en temps reel** : tableaux de bord operationnels avec KPIs, alertes et suivi de performance.
- **Score ICUA** : Indicateur Composite Urbain d'Alger a 6 composantes, entierement transparent et configurable, mesurant la performance globale du service urbain.
- **Intelligence operationnelle** : analyse deterministe des facteurs de degradation, recommandations de priorites et alertes proactives, sans recours a l'IA generative.
- **Communication institutionnelle** : chaine editoriale complete pour les communiques officiels avec validation hierarchique.

#### Architecture technique

La plateforme est construite sur des technologies web modernes (Node.js, Express.js, PostgreSQL) avec une architecture modulaire a 22 modules et 8 moteurs de services. L'interface utilisateur est une application monopage (SPA) en JavaScript vanilla, avec internationalisation francais/arabe et support du mode hors-ligne via Service Worker.

L'architecture respecte une separation stricte en trois espaces : citoyen, operations et executif. Le controle d'acces s'appuie sur un systeme RBAC (Role-Based Access Control) avec authentification JWT.

#### Etat actuel

Version courante : **v1.0.0-alpha.2**, avec 8 sprints de developpement completes. La plateforme est fonctionnelle et couvre l'ensemble du parcours citoyen-administration. Les priorites a court terme portent sur la stabilisation (CI/CD, tests automatises), la securite (audit OWASP) et l'optimisation de l'experience utilisateur (refactorisation frontend).

La feuille de route a moyen et long terme prevoit le deploiement d'une application mobile native, l'integration de l'intelligence artificielle (Saksini AI), l'ouverture des donnees (Open Data) et l'extension a d'autres wilayas, avec une vision prospective d'integration Smart City.

---

*Document genere le 30 juin 2026 -- ALGERNA v1.0.0-alpha.2*
