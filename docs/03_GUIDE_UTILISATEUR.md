# ALGERNA - Guide Utilisateur

**Projet** : ALGERNA - Plateforme Citoyenne Intelligente de la Wilaya d'Alger
**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Classification** : Document interne - Diffusion restreinte
**Langue** : Francais (version arabe a venir)

---

## Table des matieres

1. [Presentation generale](#1-presentation-generale)
2. [Profil Citoyen](#2-profil-citoyen)
3. [Profil Agent](#3-profil-agent)
4. [Profil CAP (Agent de Proximite)](#4-profil-cap-agent-de-proximite)
5. [Profil Responsable](#5-profil-responsable)
6. [Profil Administrateur](#6-profil-administrateur)

---

## 1. Presentation generale

ALGERNA est une application web progressive (PWA) permettant aux citoyens, agents et responsables de la Wilaya d'Alger de collaborer pour ameliorer la qualite de vie urbaine. Chaque profil dispose d'un parcours dedie, adapte a ses missions.

### Acces a la plateforme

| Profil | Identifiant | Mot de passe |
|--------|-------------|-------------|
| Citoyen test | 0550000001 (Amina Benali) | admin1234 |
| Agent reception wilaya | 0550000002 (Youcef Kaci) | admin@@1234 |
| Commandement cabinet wilaya | 0550000003 (Rachid Mansouri) | admin@@1234 |
| Superviseur APC | 0550000004 (Mourad Hadj) | admin@@1234 |
| EPIC proprete | 0550000005 (Nassim Taleb) | admin@@1234 |
| EPIC eclairage | 0550000006 (Nadia Aissaoui) | admin@@1234 |
| CAP | 0550000007 (Karim Benali) | admin@@1234 |
| EPIC Parking | 0550000008 (Khaled Boumediene) | admin@@1234 |
| EPIC Patrimoine local | 0550000009 (Samira Hadji) | admin@@1234 |
| EPIC | 0550000010 (Farid Mebarki) | admin@@1234 |
| Cabinet wilaya CCOE | 0550000011 (Yacine Benmoussa) | admin@@1234 |

> **Note** : Ces identifiants sont valables uniquement pour l'environnement de demonstration. Tableau de reference valide par Hamid le 12 juillet 2026.

---

## 2. Profil Citoyen

Le citoyen est l'utilisateur principal de la plateforme. Son parcours est concu pour etre intuitif et accessible, y compris pour les personnes peu familieres avec les outils numeriques.

### 2.1. Dashboard (Tableau de bord)

A la connexion, le citoyen accede a son tableau de bord personnel compose de :

- **Hero Alger** : Banniere illustree representant la Wilaya d'Alger, renforce l'ancrage territorial de la plateforme.
- **KPIs personnels** : Indicateurs cles (signalements en cours, resolus, points citoyens accumules).
- **Mes services** : Grille de 8 cartes illustrees donnant acces direct aux fonctionnalites principales :
  - Je signale
  - Ma Houma
  - Mes demarches
  - Mon suivi
  - Infos utiles
  - Mon impact
  - Saksini
  - Mon profil
- **Communiques** : Fil d'actualites et communiques officiels publies par les services de la Wilaya.

<!-- TODO: Capture d'ecran — Dashboard citoyen -->

### 2.2. Je signale

Le module de signalement permet au citoyen de rapporter un probleme urbain en quelques etapes.

**Etape 1 — Choix de la categorie**

Le citoyen selectionne parmi une grille de 16 categories couvrant l'ensemble des domaines de la vie urbaine :

| # | Categorie | Exemples |
|---|-----------|----------|
| 1 | Voirie | Nid-de-poule, trottoir deteriore |
| 2 | Eclairage public | Lampadaire en panne, zone sombre |
| 3 | Proprete | Depot sauvage, poubelle debordante |
| 4 | Espaces verts | Arbre dangereux, jardin non entretenu |
| 5 | Eau et assainissement | Fuite, regard ouvert |
| 6 | Reseaux divers | Cable pendant, armoire ouverte |
| 7 | Mobilier urbain | Banc casse, panneau endommage |
| 8 | Circulation | Feu en panne, signalisation absente |
| 9 | Batiment public | Facade degradee, accessibilite |
| 10 | Nuisances | Bruit, odeurs, pollution |
| 11 | Securite | Danger imminent, zone a risque |
| 12 | Transport | Arret deteriore, information manquante |
| 13 | Commerce | Occupation illegale, affichage |
| 14 | Travaux | Chantier non securise, duree excessive |
| 15 | Patrimoine | Monument degrade, site historique |
| 16 | Autre | Tout signalement hors categories |

**Etape 2 — Sous-cas**

Chaque categorie propose des sous-cas precis pour qualifier le signalement de maniere fine.

**Etape 3 — Formulaire de signalement**

Le citoyen remplit le formulaire comportant :

- **Photo** : Prise de vue directe ou import depuis la galerie (obligatoire pour la plupart des categories).
- **Geolocalisation** : Positionnement automatique via GPS du terminal ou placement manuel sur la carte.
- **Description** : Champ texte libre pour preciser la nature et le contexte du probleme.
- **Urgence** : Niveau de priorite ressenti par le citoyen.

<!-- TODO: Capture d'ecran — Grille des categories -->
<!-- TODO: Capture d'ecran — Formulaire de signalement -->

### 2.3. Ma Houma

"Ma Houma" (mon quartier) offre une vision cartographique de l'environnement urbain du citoyen.

**Composants** :

- **Carte interactive Leaflet** : Vue centree sur la position du citoyen, zoom et deplacement fluides.
- **Signalements** : Marqueurs colores selon l'etat (recu, en cours, resolu) affiches sur la carte.
- **Equipements** : 301 equipements publics georeferencies (ecoles, hopitaux, stades, mosques, etc.).
- **Filtres par categorie** : 20 types d'equipements filtrables individuellement pour une lecture claire de la carte.

Le citoyen peut cliquer sur un marqueur pour afficher la fiche detaillee (nom, adresse, horaires, contact).

<!-- TODO: Capture d'ecran — Carte Ma Houma avec filtres -->

### 2.4. Mes demarches

Ce module accompagne le citoyen dans ses demarches administratives aupres des services de la Wilaya.

**Preparer un dossier** :
- Selection du type de demarche (etat civil, urbanisme, social, etc.).
- Affichage de la liste des pieces a fournir.
- Verification prealable de l'eligibilite.

**Prendre un rendez-vous** :
- Choix du service concerne.
- Selection d'un creneau horaire disponible dans le calendrier.
- Confirmation et generation d'un recepisse numerique.

<!-- TODO: Capture d'ecran — Selection de creneau RDV -->

### 2.5. Mon suivi

Historique complet des signalements emis par le citoyen avec pour chacun :

- Numero de reference unique.
- Categorie et sous-cas.
- Date de creation.
- Etat actuel (Recu, En cours, Transmis, Resolu, Rejete).
- Timeline des evenements (changements d'etat, commentaires agents).

Le citoyen peut filtrer par etat et consulter le detail de chaque signalement.

<!-- TODO: Capture d'ecran — Liste Mon suivi -->

### 2.6. Infos utiles

Annuaire de 35 contacts essentiels organises en categories :

| Categorie | Exemples |
|-----------|----------|
| Urgences | Protection civile, SAMU, Police |
| Reseaux | Direction Eau (eau), SONELGAZ (electricite/gaz) |
| Transports | ETUSA, Metro d'Alger, Tramway |
| Institutions | APC, Daira, Wilaya |

Chaque contact dispose de boutons d'action :
- **Appeler** : Lancement direct de l'appel telephonique.
- **Localiser** : Ouverture de l'itineraire sur la carte.

<!-- TODO: Capture d'ecran — Annuaire Infos utiles -->

### 2.7. Mon impact

Module de gamification encourageant l'engagement citoyen.

- **Points citoyens** : Accumulation de points pour chaque signalement emis, valide et suivi.
- **Badges** : Recompenses debloquees selon les actions (premier signalement, citoyen assidu, sentinelle, etc.).
- **Classement quartiers** : Tableau comparatif de l'engagement citoyen par quartier, favorisant l'emulation collective.

<!-- TODO: Capture d'ecran — Tableau Mon impact -->

### 2.8. Saksini

Saksini est l'assistant numerique de la plateforme, concu pour repondre aux questions frequentes des citoyens.

**Fonctionnalites** :

- **Chatbot FAQ** : Interface conversationnelle permettant de poser des questions en langage naturel (francais et arabe).
- **Recherche par mot-cle** : Interrogation de la base de connaissances `saksini_index` contenant 43 entrees couvrant les principaux sujets (services publics, demarches, urgences, fonctionnement de la plateforme).
- **Systeme de scoring** : Pertinence des resultats calculee selon la correspondance (mot-cle exact, synonymes, titre, description).

<!-- TODO: Capture d'ecran — Interface Saksini -->

### 2.9. Mon profil

Gestion du compte personnel du citoyen :

- **Informations personnelles** : Nom, prenom, telephone, adresse, commune.
- **Parametres** : Langue preferee, notifications, theme.
- **Securite** : Modification du mot de passe, historique des connexions.

<!-- TODO: Capture d'ecran — Page Mon profil -->

---

## 3. Profil Agent

L'agent est le premier niveau de traitement des signalements. Son interface est optimisee pour le traitement rapide et le routage efficace.

### 3.1. Board Kanban

L'agent accede a un tableau Kanban organise en 6 colonnes representant le cycle de vie du signalement :

| Colonne | Description |
|---------|-------------|
| **Recu** | Signalements fraichement emis par les citoyens, en attente de prise en charge. |
| **En cours** | Signalements en cours de traitement par l'agent. |
| **Transmis** | Signalements transferes a un service competent ou a un echelon superieur. |
| **Mission CAP** | Signalements ayant donne lieu a une mission terrain pour un Agent de Proximite. |
| **Resolu** | Signalements dont le traitement est acheve. |
| **Non recevable** | Signalements rejetes (motif obligatoire). |

<!-- TODO: Capture d'ecran — Board Kanban agent -->

### 3.2. Drawer fiche signalement

En cliquant sur un signalement, un panneau lateral (drawer) s'ouvre et affiche :

- **Description** : Texte saisi par le citoyen.
- **Photo** : Image jointe au signalement.
- **Carte** : Localisation precise sur une carte interactive.
- **Citoyen** : Informations du declarant (nom, commune, historique).
- **Historique timeline** : Chronologie de toutes les actions effectuees sur le signalement.
- **Routage suggere** : Proposition automatique du service competent en fonction de la categorie.

<!-- TODO: Capture d'ecran — Drawer fiche signalement -->

### 3.3. Actions disponibles

| Action | Description |
|--------|-------------|
| **Traiter** | Prise en charge directe du signalement par l'agent. |
| **Transmettre** | Transfert vers un service specifique avec commentaire. |
| **Mission CAP** | Creation d'une mission terrain pour un Agent de Proximite. |
| **Rejeter** | Rejet du signalement. Un motif de rejet est obligatoire. |

### 3.4. Filtres et recherche

- **Recherche textuelle** : Par numero, description ou nom du citoyen.
- **Filtre par commune** : Restriction aux signalements d'une commune donnee.
- **Filtre par urgence** : Tri par niveau de priorite.
- **Tri** : Par date, urgence, commune ou categorie.

<!-- TODO: Capture d'ecran — Filtres agent -->

---

## 4. Profil CAP (Agent de Proximite)

Le CAP (Citoyen-Agent de Proximite) intervient sur le terrain. Son interface est concue pour une utilisation mobile.

### 4.1. Dashboard CAP

A la connexion, le CAP visualise :

- **Missions du jour** : Liste des missions assignees, triees par priorite.
- **KPIs personnels** :
  - Total des missions assignees.
  - Missions prioritaires en attente.
  - Missions terminees dans la journee.

<!-- TODO: Capture d'ecran — Dashboard CAP -->

### 4.2. Workflow mission

Le traitement d'une mission suit un workflow lineaire :

```
Accepter → Commencer → Terminer / Bloquer
```

| Etape | Description |
|-------|-------------|
| **Accepter** | Le CAP confirme la prise en charge de la mission. |
| **Commencer** | Debut de l'intervention sur site (horodatage automatique). |
| **Terminer** | Cloture de la mission apres intervention. |
| **Bloquer** | Signalement d'un blocage (acces impossible, materiel manquant, etc.). |

> **Important** : La cloture d'une mission requiert obligatoirement un commentaire et peut etre accompagnee de photos avant/apres.

### 4.3. Outils terrain

- **Navigation GPS** : Itineraire vers le lieu d'intervention depuis la position actuelle.
- **Prise de photos** : Capture de l'etat avant et apres intervention.
- **Commentaire de cloture** : Champ texte obligatoire decrivant l'intervention realisee.

### 4.4. Assistance citoyenne

Le CAP assure egalement un role de mediation et d'accompagnement :

- **Information** : Renseignement des citoyens sur les services disponibles.
- **Orientation** : Redirection vers le service competent.
- **Aide numerique** : Accompagnement dans l'utilisation de la plateforme.
- **Accompagnement PMR** : Assistance aux personnes a mobilite reduite.

### 4.5. Signalement proactif

Le CAP peut emettre des signalements de maniere proactive lorsqu'il identifie un probleme sur le terrain, sans qu'un citoyen n'ait prealablement fait de declaration.

<!-- TODO: Capture d'ecran — Interface terrain CAP -->

---

## 5. Profil Responsable

Le responsable dispose d'outils de supervision et d'aide a la decision pour piloter la performance des services urbains.

### 5.1. Centre de Supervision

Tableau de bord operationnel affichant :

- **6 KPIs principaux** : Signalements recus, en cours, resolus, taux de resolution, delai moyen, satisfaction.
- **Alertes** : Notifications des situations critiques (depassement de delai, accumulation, urgences).
- **Activite temps reel** : Flux en direct des signalements entrants et des actions agents.
- **Performance services/communes** : Tableaux comparatifs de la performance par service et par commune.

<!-- TODO: Capture d'ecran — Centre de Supervision -->

### 5.2. Centre d'Intelligence Operationnelle

Module d'analyse avancee proposant :

- **Facteurs de degradation** : Identification des causes recurrentes de degradation urbaine par zone et par categorie.
- **Priorites recommandees** : Suggestions de priorisation basees sur l'analyse croisee (frequence, impact, zone).
- **Alertes intelligentes** : Detection automatique des tendances anormales et des situations necessitant une intervention rapide.

<!-- TODO: Capture d'ecran — Centre d'Intelligence -->

### 5.3. ICUA (Indice de Cadre Urbain Algerois)

Indicateur synthetique de la qualite du cadre de vie urbain :

- **Score global** : Valeur de 0 a 100, calculee en temps reel.
- **6 composantes** : Proprete, voirie, eclairage, espaces verts, reseaux, securite.
- **Sante operationnelle** : Vue synthetique de l'etat de fonctionnement de chaque domaine.

Chaque composante est detaillee avec son score individuel, sa tendance et les facteurs d'influence.

<!-- TODO: Capture d'ecran — Tableau de bord ICUA -->

### 5.4. Communiques

Workflow de publication des communiques officiels :

```
Brouillon → Revision → Validation → Publication
```

| Etape | Acteur | Description |
|-------|--------|-------------|
| **Brouillon** | Redacteur | Redaction du communique (titre, contenu, categorie). |
| **Revision** | Relecteur | Verification et corrections eventuelles. |
| **Validation** | Responsable | Approbation finale du communique. |
| **Publication** | Systeme | Diffusion aux citoyens via le fil d'actualites. |

<!-- TODO: Capture d'ecran — Workflow communiques -->

---

## 6. Profil Administrateur

L'administrateur dispose d'un acces complet a la configuration et a la gestion de la plateforme.

### 6.1. Panneau d'administration

Le panneau d'administration est organise en 8 onglets :

| Onglet | Description |
|--------|-------------|
| **Configuration** | Parametres globaux de la plateforme (ConfigEngine, delais, seuils). |
| **Communes** | Gestion des 13 communes de la Wilaya d'Alger (noms, codes, coordonnees). |
| **Services** | Configuration des services publics (directions, contacts, responsables). |
| **Categories** | Gestion des 16 categories et sous-categories de signalement. |
| **Engagements** | Definition des engagements de service (delais cibles, escalade). |
| **Utilisateurs** | Gestion des comptes (creation, roles, activation/desactivation). |
| **Catalogue CAP** | Configuration des types de missions et competences CAP. |
| **Journal** | Consultation du journal d'audit (toutes les actions tracees). |

<!-- TODO: Capture d'ecran — Panneau d'administration (chaque onglet) -->

---

## Annexes

### A. Navigation generale

L'application est accessible via navigateur web (Chrome, Firefox, Safari, Edge) et peut etre installee en tant que PWA sur les appareils mobiles (Android et iOS).

### B. Support et assistance

Pour toute question relative a l'utilisation de la plateforme, les utilisateurs peuvent :
- Consulter l'assistant Saksini (profil citoyen).
- Contacter leur referent de service (profils agent et CAP).
- Joindre l'equipe support technique (profil administrateur).

---

*Document genere le 30 juin 2026 — ALGERNA v1.0.0-alpha.2*
*Prepare pour evolution bilingue FR/AR.*
