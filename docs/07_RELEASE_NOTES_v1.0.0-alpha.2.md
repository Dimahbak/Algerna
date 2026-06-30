# Notes de version — ALGERNA v1.0.0-alpha.2

**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Projet** : ALGERNA — Plateforme Citoyenne Intelligente
**Classification** : Document interne

---

## Resume

La version v1.0.0-alpha.2 consolide les developpements realises au cours de 10 sprints (Sprint 0 a Sprint 8). Elle couvre l'ensemble du perimetre fonctionnel prevu pour la phase alpha : signalement citoyen, traitement operationnel, supervision, administration et intelligence operationnelle.

---

## Historique des sprints

### Sprint 0 — Fondations et separation des profils

- Mise en place de la separation des profils utilisateurs
- Implementation du routage base sur les roles :
  - `citoyen` → page d'accueil (`/home`)
  - `agent` → back-office agent (`/bo-agent`)
  - `admin` / `responsable` → back-office responsable (`/bo-responsable`)
- Architecture de base de la plateforme

---

### Sprint 1 — Board Agent V1

- **Tableau Kanban** a 6 colonnes pour le suivi des signalements par les agents
- **Drawer** de detail : consultation des informations d'un signalement sans quitter le board
- **Recherche et filtres** : recherche textuelle, filtrage par statut, priorite, commune, service
- **Modal mission CAP** : creation et affectation de missions aux Citoyens d'Appui de Proximite
- **Modal de rejet** : rejet motive d'un signalement avec selection de motif

---

### Sprint 2 — Moteur de Workflow

- Implementation du moteur de transitions d'etat des signalements
- **Historique** complet des transitions avec horodatage et auteur
- **Routage automatique** vers les services competents :
  - ERMA (eclairage, reseaux)
  - NETCOM (nettoyage, collecte)
  - SEAAL (eau, assainissement)
  - Autres services selon la categorisation
- **Notifications citoyennes** : le citoyen est informe a chaque changement de statut
- **Journal d'audit** : traçabilite complete des actions

---

### Sprint 3 — Application CAP

- Gestion du cycle de vie des missions CAP :
  - `cree` → `accepte` → `en_cours` → `termine` / `bloque`
- **Assistance citoyenne** : interface dediee pour les CAP sur le terrain
- **Navigation GPS** : guidage vers la localisation du signalement
- Interface mobile optimisee pour l'usage terrain

---

### Sprint 3.5 — Operations Design System (ODS)

Mise en place d'un systeme de design dedie aux interfaces operationnelles, compose de **16 composants** :

| Composant      | Description                                   |
|----------------|------------------------------------------------|
| `ops-kpi`      | Carte d'indicateur cle de performance          |
| `ops-status`   | Badge de statut avec couleur semantique        |
| `ops-prio`     | Indicateur de priorite (P1 a P4)               |
| `ops-sla`      | Jauge de respect d'engagement de service       |
| `ops-timeline` | Chronologie des evenements                     |
| `ops-drawer`   | Panneau lateral de detail                      |
| `ops-table`    | Tableau de donnees avec tri et filtrage         |
| `ops-card`     | Carte generique operationnelle                 |
| `ops-empty`    | Etat vide (icone + message)                    |
| `ops-toast`    | Notification temporaire                        |
| `ops-form`     | Formulaire standardise                         |
| `ops-layout`   | Grille de mise en page operationnelle          |

- Integration de l'indicateur SLA sur les vues operationnelles

---

### Sprint 4 — Centre de Supervision

- **5 endpoints API** dedies a la supervision :
  - KPIs globaux
  - Alertes actives
  - Performance par service
  - Performance par commune
  - Activite en temps reel
- Tableau de bord executif avec filtrage global
- Alertes automatiques sur depassement de seuils

---

### Sprint 5 — Workflow de Communication

- Cycle de vie des publications :
  - `brouillon` → `en_revision` → `valide` → `publie` → `archive`
- **11 categories** de communication (annonces, evenements, travaux, etc.)
- **Notifications de publication** : diffusion automatique lors de la publication
- Interface de redaction et de validation

---

### Sprint 5.5 — Consolidation technique

- **Service SLA** extrait en module autonome et reutilisable
- **RBAC centralise** : controle d'acces base sur les roles unifie a travers toute la plateforme
- **Services de donnees partages** : factorisation des acces aux donnees
- **15 tests de non-regression sur 15** : couverture complete des scenarios critiques

---

### Sprint 6 — Administration

- **ConfigEngine** : moteur de configuration dynamique
- **18 endpoints CRUD** couvrant :
  - Gestion des communes
  - Gestion des services
  - Gestion des categories de signalement
  - Gestion des engagements de service
  - Gestion des utilisateurs
  - Catalogue des missions CAP
  - Journal d'activite
- Interface d'administration complete

---

### Sprint 7 — Moteur ICUA

- **6 composantes ponderees** pour le calcul du score ICUA (Indice Citoyen Urbain d'Alger)
- Indicateur de **sante operationnelle** globale
- **Historique** du score avec evolution temporelle
- Calcul **par commune** pour la comparaison territoriale
- Ponderations **configurables** par l'administrateur

---

### Sprint 8 — Intelligence Operationnelle

- Identification automatique des **facteurs de degradation**
- Calcul de **priorites recommandees** basees sur les donnees
- **Score de priorite** multi-criteres
- **Alertes intelligentes** : notifications proactives sur les situations a risque
- Aide a la decision pour les responsables

---

## Chiffres cles

| Indicateur                    | Valeur       |
|-------------------------------|--------------|
| Modules backend               | 22           |
| Moteurs (engines)             | 8            |
| Tables de base de donnees     | 49+          |
| Migrations                    | 9            |
| Roles utilisateur             | 5            |
| Cles d'internationalisation   | 700+         |
| Equipements references        | 301          |
| Contacts references           | 35           |
| Entrees Saksini               | 43           |

---

## Perimetre fonctionnel couvert

- Signalement citoyen (creation, suivi, historique)
- Traitement operationnel (board agent, workflow, routage)
- Missions CAP (affectation, suivi terrain, GPS)
- Supervision (KPIs, alertes, performance)
- Communication (publications, cycle de validation)
- Administration (configuration, CRUD, journal)
- Intelligence (ICUA, priorites, facteurs de degradation)
- Internationalisation (FR/AR)
- Chatbot Saksini (base de connaissances par mots-cles)

---

## Limitations connues

Les limitations techniques et fonctionnelles identifiees sont documentees dans le fichier `08_KNOWN_DEBT.md`.

---

*Document genere dans le cadre du projet ALGERNA — v1.0.0-alpha.2*
