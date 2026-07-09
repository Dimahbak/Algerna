# ALGERNA - Glossaire Officiel

**Projet** : ALGERNA - Plateforme Citoyenne Intelligente de la Wilaya d'Alger
**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Classification** : Document de reference
**Langue** : Francais (version arabe a venir)

---

## Table des matieres

1. [Acronymes techniques](#1-acronymes-techniques)
2. [Vocabulaire metier](#2-vocabulaire-metier)
3. [Vocabulaire administratif algerien](#3-vocabulaire-administratif-algerien)

---

## 1. Acronymes techniques

| Acronyme | Signification | Definition |
|----------|--------------|------------|
| **API** | Application Programming Interface | Interface de programmation permettant la communication entre les composants logiciels de la plateforme. |
| **RBAC** | Role-Based Access Control | Controle d'acces base sur les roles. Systeme d'autorisation attribuant des permissions selon le profil de l'utilisateur (citoyen, agent, CAP, responsable, administrateur). |
| **CRUD** | Create, Read, Update, Delete | Quatre operations fondamentales de gestion des donnees en base. |
| **JWT** | JSON Web Token | Standard de creation de jetons d'acces securises utilise pour l'authentification des utilisateurs de la plateforme. |
| **KPI** | Key Performance Indicator | Indicateur cle de performance. Metrique mesurant l'efficacite d'un processus ou d'un service (ex. : taux de resolution, delai moyen de traitement). |
| **ODS** | Ordre De Service | Document administratif formalisant une instruction de traitement d'un signalement vers un service competent. |
| **ICUA** | Indice de Cadre Urbain Algerois | Indicateur synthetique (score de 0 a 100) mesurant la qualite du cadre de vie urbain a travers 6 composantes. Specifique a ALGERNA. |
| **SPA** | Single Page Application | Architecture web ou l'application est chargee en une seule page, offrant une navigation fluide sans rechargement complet. |
| **PWA** | Progressive Web App | Application web progressive, installable sur les appareils mobiles, fonctionnant hors-ligne grace au Service Worker. |
| **SW** | Service Worker | Script executant en arriere-plan dans le navigateur, gerant le cache et le fonctionnement hors-ligne de la PWA. |
| **OLS** | OpenLiteSpeed | Serveur web haute performance utilise comme proxy inverse devant l'application Node.js. |
| **EPIC** | Etablissement Public a caractere Industriel et Commercial | Forme juridique des etablissements publics algeriens de gestion des services urbains (Direction Eau, SONELGAZ, etc.). |
| **SLA** | Service Level Agreement | Accord de niveau de service. Terme technique interne designant les engagements de delai de traitement. Le terme public equivalent est « Engagement de Service ». *Usage interne uniquement.* |

---

## 2. Vocabulaire metier

### Signalement

Rapport effectue par un citoyen (ou un agent CAP de maniere proactive) pour signaler un desordre, un dysfonctionnement ou un danger dans l'espace urbain.

**Cycle de vie (etats)** :

| Etat | Code technique | Description |
|------|---------------|-------------|
| Recu | `recu` | Le signalement a ete enregistre dans le systeme. Il est en attente de prise en charge par un agent. |
| Transmis | `transmis` | Le signalement a ete transfere au service competent pour traitement. |
| En intervention | `en_intervention` | Une intervention est en cours sur le terrain (mission CAP ou traitement direct). |
| Resolu | `resolu` | Le probleme signale a ete traite et la situation est retablie. |
| Rejete | `rejete` | Le signalement a ete declare non recevable (doublon, hors perimetre, information insuffisante). Un motif de rejet est systematiquement enregistre. |

### Mission CAP

Ordre de mission attribue a un Agent de Proximite (CAP) pour une intervention terrain suite a un signalement ou a une initiative proactive.

**Cycle de vie (etats)** :

| Etat | Code technique | Description |
|------|---------------|-------------|
| Creee | `cree` | La mission a ete creee et attribuee a un agent CAP. |
| Acceptee | `accepte` | L'agent CAP a confirme la prise en charge de la mission. |
| En cours | `en_cours` | L'agent CAP est en intervention sur le terrain. |
| Terminee | `termine` | L'intervention est achevee. Le commentaire de cloture et les photos sont enregistres. |
| Bloquee | `bloque` | L'intervention ne peut pas etre menee a bien (acces impossible, materiel manquant, situation necessitant un autre service). |

### Engagement de Service

Terme public designant le delai maximal dans lequel la Wilaya s'engage a traiter un signalement citoyen. Le delai cible standard est de **48 heures**. Ce terme remplace le sigle technique SLA dans toute communication a destination des citoyens.

### Centre de Supervision

Tableau de bord operationnel a destination des responsables, affichant en temps reel les indicateurs de performance, les alertes et l'activite des services. Permet le pilotage quotidien de la reponse aux signalements citoyens.

### Centre d'Intelligence Operationnelle

Module d'analyse avancee identifiant les facteurs de degradation recurrents, proposant des priorites d'intervention et generant des alertes intelligentes basees sur les tendances detectees.

### ICUA (Indice de Cadre Urbain Algerois)

Score composite de 0 a 100 evaluant la qualite du cadre de vie urbain de la Wilaya d'Alger. Il integre 6 composantes :

1. **Proprete** : Etat de proprete des espaces publics.
2. **Voirie** : Etat des routes, trottoirs et chaussees.
3. **Eclairage** : Fonctionnement du reseau d'eclairage public.
4. **Espaces verts** : Entretien des parcs, jardins et plantations.
5. **Reseaux** : Fonctionnement des reseaux d'eau, d'assainissement et d'energie.
6. **Securite** : Conditions de securite dans l'espace public.

### Sante operationnelle

Vue synthetique de l'etat de fonctionnement de chaque composante de l'ICUA. Indique si un domaine est en situation normale, degradee ou critique.

### Saksini

Assistant numerique integre a la plateforme, permettant aux citoyens d'obtenir des reponses a leurs questions frequentes via une interface conversationnelle. Le nom « Saksini » signifie « demandez-moi » en arabe algerien. La base de connaissances contient 43 entrees indexees couvrant les principaux sujets de la vie urbaine.

### Citoyen Sentinelle

Distinction attribuee aux citoyens particulierement actifs et engages sur la plateforme. Le statut de Citoyen Sentinelle est obtenu en accumulant des points citoyens a travers des signalements pertinents et un suivi assidu.

### Score de priorite

Valeur calculee automatiquement pour chaque signalement, determinant son ordre de traitement. Le score integre plusieurs facteurs : categorie, niveau d'urgence declare, zone geographique, recurrence, anciennete.

### Facteur de degradation

Element identifie par le Centre d'Intelligence Operationnelle comme cause recurrente ou structurelle de la degradation du cadre de vie urbain dans une zone donnee (ex. : insuffisance de collecte, vetuste du reseau, absence de maintenance preventive).

---

## 3. Vocabulaire administratif algerien

### Organisation territoriale

| Terme | Definition |
|-------|------------|
| **Wilaya** | Prefecture. Division administrative de premier niveau en Algerie. La Wilaya d'Alger est le perimetre d'intervention d'ALGERNA. Equivalent du departement francais. |
| **Wali** | Prefet. Representant de l'Etat a la tete de la Wilaya, nomme par decret presidentiel. Autorite tutelaire de la plateforme ALGERNA. |
| **APC** | Assemblee Populaire Communale. Organe deliberant de la commune, equivalent du conseil municipal. Par extension, designe la commune elle-meme dans le langage courant (ex. : « l'APC de Bab El Oued »). |
| **Daira** | Sous-prefecture. Echelon administratif intermediaire entre la Wilaya et la commune, regroupant plusieurs APC. |
| **Circonscription** | Subdivision administrative de la Wilaya d'Alger regroupant plusieurs Dairas. La Wilaya d'Alger compte 13 circonscriptions administratives. |

### Etablissements publics et operateurs

| Sigle | Denomination complete | Domaine |
|-------|----------------------|---------|
| **EPIC** | Etablissement Public a caractere Industriel et Commercial | Forme juridique commune aux operateurs de services urbains algeriens. |
| **Direction Eau** | Societe des Eaux et de l'Assainissement d'Alger | Gestion de la distribution d'eau potable et du reseau d'assainissement de la Wilaya d'Alger. |
| **SONELGAZ** | Societe Nationale de l'Electricite et du Gaz | Production et distribution d'electricite et de gaz naturel sur l'ensemble du territoire national. |
| **Direction Propreté** | Societe de Nettoiement et de Collecte des Ordures Menageres | Collecte et traitement des dechets menagers. Opere sous la tutelle de la Wilaya d'Alger. |
| **Direction Propreté Périphérie** | Entreprise de Nettoiement de la Wilaya d'Alger | Nettoiement des espaces publics et voiries de la Wilaya d'Alger. |
| **Direction Éclairage** | Entreprise de Realisation et de Maintenance de l'Eclairage public d'Alger | Installation et maintenance du reseau d'eclairage public de la Wilaya d'Alger. |
| **Direction Circulation** | Entreprise de Gestion de la Circulation et des Transports Urbains | Gestion de la voirie, de la signalisation et de la circulation sur le territoire de la Wilaya d'Alger. |
| **Direction Espaces Verts** | Entreprise de Developpement des Espaces Verts d'Alger | Amenagement et entretien des espaces verts, parcs et jardins publics de la Wilaya d'Alger. |

---

## Note sur l'evolution bilingue

Ce glossaire est prepare pour une evolution bilingue francais/arabe. La structure des entrees est concue pour accueillir, dans une version ulterieure :

- **Terme en arabe** (المصطلح بالعربية) : Traduction officielle du terme.
- **Definition en arabe** (التعريف بالعربية) : Definition complete en langue arabe.

Cette evolution s'inscrit dans la strategie d'internationalisation de la plateforme, deja amorcee par le fichier `i18n.js` gerant les traductions de l'interface utilisateur.

---

*Document genere le 30 juin 2026 — ALGERNA v1.0.0-alpha.2*
*Glossaire de reference officiel du projet ALGERNA.*
