# Dette technique connue — ALGERNA

**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Projet** : ALGERNA — Plateforme Citoyenne Intelligente
**Classification** : Document interne

---

## Legende

**Priorites** :
- **P1** — Critique : a traiter avant la mise en production
- **P2** — Importante : a traiter dans les prochains sprints
- **P3** — Moderee : a planifier a moyen terme
- **P4** — Faible : a considerer pour les versions futures

**Statuts** :
- `identifie` — Dette identifiee, non encore prise en charge
- `en_cours` — Travail de remediation entame
- `planifie` — Inscrit dans le backlog d'un sprint a venir

---

## Registre de la dette technique

### DEBT-001 — Monolithe index.html

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-001                                                               |
| **Description** | Le fichier `index.html` depasse 9 500 lignes. Il concentre l'ensemble des vues front-office, back-office et administration dans un seul fichier. Cette structure rend la maintenance difficile, ralentit le chargement initial et complique les revues de code. |
| **Impact**  | Maintenabilite degradee, temps de chargement eleve, conflits de merge frequents |
| **Priorite**| P2                                                                     |
| **Estimation** | 3 a 5 sprints pour un decoupage complet en composants                |
| **Statut**  | identifie                                                              |

---

### DEBT-002 — Absence de pipeline CI/CD

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-002                                                               |
| **Description** | Aucun pipeline d'integration continue ni de deploiement continu n'est en place. Les deploiements sont manuels, ce qui augmente le risque d'erreur et ralentit le cycle de livraison. |
| **Impact**  | Risque d'erreur en deploiement, pas de validation automatique, livraisons lentes |
| **Priorite**| P2                                                                     |
| **Estimation** | 1 sprint                                                             |
| **Statut**  | identifie                                                              |

---

### DEBT-003 — Absence de tests automatises

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-003                                                               |
| **Description** | Hormis les 15 tests de non-regression du Sprint 5.5, la plateforme ne dispose pas de suite de tests automatises (unitaires, integration, end-to-end). Les regressions ne sont detectees qu'en recette manuelle. |
| **Impact**  | Regressions non detectees, confiance faible dans les livraisons, temps de recette eleve |
| **Priorite**| P1                                                                     |
| **Estimation** | 2 a 3 sprints pour une couverture initiale significative             |
| **Statut**  | identifie                                                              |

---

### DEBT-004 — Problemes de cache du proxy OLS

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-004                                                               |
| **Description** | Le proxy OLS presente des problemes de mise en cache. Des bridges (ponts de contournement) sont encore necessaires pour certaines requetes. Le comportement du cache n'est pas pleinement maitrise. |
| **Impact**  | Donnees obsoletes affichees, contournements fragiles en production      |
| **Priorite**| P2                                                                     |
| **Estimation** | 1 sprint                                                             |
| **Statut**  | identifie                                                              |

---

### DEBT-005 — Assets images non optimises

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-005                                                               |
| **Description** | Les images originales au format PNG sont conservees aux cotes de leurs versions WebP. Aucun pipeline d'optimisation automatique n'est en place. Le poids total des assets est plus eleve que necessaire. |
| **Impact**  | Temps de chargement allonge, consommation de bande passante accrue     |
| **Priorite**| P3                                                                     |
| **Estimation** | 0.5 sprint                                                           |
| **Statut**  | identifie                                                              |

---

### DEBT-006 — Pas de gestion automatisee des certificats HTTPS

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-006                                                               |
| **Description** | Le renouvellement des certificats HTTPS est manuel. Aucun mecanisme de type Let's Encrypt / certbot automatise n'est configure. Un oubli de renouvellement entrainerait une interruption de service. |
| **Impact**  | Risque d'expiration du certificat, interruption de service potentielle |
| **Priorite**| P3                                                                     |
| **Estimation** | 0.5 sprint                                                           |
| **Statut**  | identifie                                                              |

---

### DEBT-007 — Pas de supervision du pool de connexions base de donnees

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-007                                                               |
| **Description** | Le pool de connexions a la base de donnees n'est pas supervise. Aucune metrique n'est collectee sur le nombre de connexions actives, le temps d'attente ou les connexions refusees. |
| **Impact**  | Saturation silencieuse possible, diagnostic difficile en cas d'incident |
| **Priorite**| P3                                                                     |
| **Estimation** | 0.5 sprint                                                           |
| **Statut**  | identifie                                                              |

---

### DEBT-008 — Gestion d'etat frontend par variables globales

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-008                                                               |
| **Description** | L'etat de l'application frontend est gere via des variables globales JavaScript. Il n'y a pas de store centralise ni de pattern de gestion d'etat structure. Cela rend le debogage et l'evolution de l'application difficiles. |
| **Impact**  | Effets de bord imprevisibles, debogage complexe, couplage fort entre composants |
| **Priorite**| P2                                                                     |
| **Estimation** | 2 sprints                                                            |
| **Statut**  | identifie                                                              |

---

### DEBT-009 — Pas de limitation de debit par utilisateur

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-009                                                               |
| **Description** | Aucun mecanisme de rate limiting par utilisateur n'est implemente sur les API. Un utilisateur malveillant ou un script defectueux pourrait surcharger le serveur sans restriction. |
| **Impact**  | Vulnerabilite aux abus et au deni de service, instabilite potentielle  |
| **Priorite**| P2                                                                     |
| **Estimation** | 0.5 sprint                                                           |
| **Statut**  | identifie                                                              |

---

### DEBT-010 — Pas d'audit de sanitisation des entrees (OWASP)

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-010                                                               |
| **Description** | Aucun audit systematique de sanitisation des entrees utilisateur n'a ete realise. Les risques d'injection SQL, XSS et autres vulnerabilites OWASP Top 10 n'ont pas ete formellement evalues. |
| **Impact**  | Risque de securite eleve, vulnerabilite potentielle aux attaques courantes |
| **Priorite**| P1                                                                     |
| **Estimation** | 1 sprint (audit) + 1 sprint (remediation)                           |
| **Statut**  | identifie                                                              |

---

### DEBT-011 — Pas de PRA/PCA (plan de reprise et de continuite d'activite)

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-011                                                               |
| **Description** | Aucun plan de reprise d'activite (PRA) ni de continuite d'activite (PCA) n'est defini. En cas de sinistre majeur (panne serveur, corruption de donnees), la procedure de retablissement n'est pas formalisee. |
| **Impact**  | Temps de retablissement imprevisible, risque de perte de donnees       |
| **Priorite**| P2                                                                     |
| **Estimation** | 1 sprint (documentation et mise en place)                            |
| **Statut**  | identifie                                                              |

---

### DEBT-012 — Pas d'application mobile native

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-012                                                               |
| **Description** | La plateforme est accessible uniquement via navigateur web (PWA). Aucune application mobile native (iOS/Android) n'est disponible. Certaines fonctionnalites terrain (notifications push natives, acces hors ligne etendu) sont limitees. |
| **Impact**  | Experience mobile limitee, pas de presence sur les stores d'applications |
| **Priorite**| P3                                                                     |
| **Estimation** | 4 a 6 sprints                                                       |
| **Statut**  | identifie                                                              |

---

### DEBT-013 — Intelligence Saksini non implementee (mots-cles uniquement)

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-013                                                               |
| **Description** | Le chatbot Saksini fonctionne actuellement par correspondance de mots-cles. Aucun modele de traitement du langage naturel (NLP/IA) n'est integre. Les reponses sont limitees aux 43 entrees pre-configurees. |
| **Impact**  | Experience conversationnelle limitee, frustration utilisateur possible  |
| **Priorite**| P3                                                                     |
| **Estimation** | 2 a 3 sprints                                                       |
| **Statut**  | identifie                                                              |

---

### DEBT-014 — Pas d'export PDF/Excel

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-014                                                               |
| **Description** | Aucune fonctionnalite d'export des donnees en format PDF ou Excel n'est disponible. Les responsables et administrateurs ne peuvent pas generer de rapports exploitables en dehors de la plateforme. |
| **Impact**  | Impossibilite de produire des rapports hors ligne, dependance totale a l'interface web |
| **Priorite**| P3                                                                     |
| **Estimation** | 1 sprint                                                             |
| **Statut**  | identifie                                                              |

---

### DEBT-015 — Pas de publication Open Data

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-015                                                               |
| **Description** | Les donnees agrégées de la plateforme ne sont pas publiees en Open Data. Aucun jeu de donnees anonymise n'est mis a disposition du public ou des chercheurs, malgre les objectifs de transparence du projet. |
| **Impact**  | Non-conformite aux objectifs de transparence, opportunite manquee de valorisation des donnees |
| **Priorite**| P4                                                                     |
| **Estimation** | 1 sprint                                                             |
| **Statut**  | identifie                                                              |

---

### DEBT-016 — Pas de monitoring/observabilite (APM)

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-016                                                               |
| **Description** | Aucun outil de monitoring applicatif (APM) n'est deploye. Les metriques de performance (temps de reponse, taux d'erreur, utilisation memoire) ne sont pas collectees de maniere structuree. Le diagnostic des incidents repose sur l'analyse manuelle des logs. |
| **Impact**  | Detection tardive des incidents, diagnostic lent, pas de visibilite sur la performance |
| **Priorite**| P2                                                                     |
| **Estimation** | 1 sprint                                                             |
| **Statut**  | identifie                                                              |

---

### DEBT-017 — Qualite des donnees equipements (import OSM)

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-017                                                               |
| **Description** | Les 301 equipements references proviennent d'un import OpenStreetMap. La qualite des donnees (completude, exactitude des coordonnees, categorisation) n'a pas ete verifiee systematiquement. Certains equipements peuvent etre obsoletes ou mal positionnes. |
| **Impact**  | Informations potentiellement incorrectes affichees aux citoyens         |
| **Priorite**| P3                                                                     |
| **Estimation** | 1 sprint (audit et correction)                                      |
| **Statut**  | identifie                                                              |

---

### DEBT-018 — Pas de verification d'adresse email a l'inscription

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-018                                                               |
| **Description** | Le processus d'inscription ne comporte pas de verification de l'adresse email (envoi d'un lien de confirmation). Des comptes peuvent etre crees avec des adresses email invalides ou usurpees. |
| **Impact**  | Comptes potentiellement frauduleux, impossibilite de contacter certains utilisateurs |
| **Priorite**| P2                                                                     |
| **Estimation** | 0.5 sprint                                                           |
| **Statut**  | identifie                                                              |

---

### DEBT-019 — Role RBAC CAP dedie

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-019                                                               |
| **Description** | L'Agent de Proximite (CAP) ne dispose pas d'un role RBAC dedie en base de donnees. La detection se fait via la table `agent_cap` cote front-end. Cela cree une logique de routage fragile et empeche un controle d'acces propre cote serveur. |
| **Impact**  | Logique de detection CAP fragile, permissions non verifiees cote API, maintenance complexe |
| **Priorite**| P2 — RC2                                                               |
| **Estimation** | 1 sprint (creation du role `cap` en base, migration des utilisateurs, mise a jour des gardes API et front-end) |
| **Statut**  | planifie                                                               |
| **Origine** | Sprint 98 — Gel d'architecture RC1                                     |

---

### DEBT-020 — Referentiel des services enrichi

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-020                                                               |
| **Description** | Le referentiel actuel des operateurs ne porte pas toutes les informations necessaires au routage intelligent des signalements. Il manque : l'administration de rattachement (Wilaya, APC, etablissement public, direction), le territoire couvert, les categories de signalements prises en charge, les engagements de service et le responsable designe. |
| **Impact**  | Routage manuel par l'agent de reception, pas d'affectation automatique, libelle generique "Service concerne" au lieu du vrai nom de service |
| **Priorite**| P2 — RC2                                                               |
| **Estimation** | 2 sprints (extension du schema, migration des donnees, integration front-end, logique de routage) |
| **Statut**  | planifie                                                               |
| **Origine** | Sprint 99 — Gel d'architecture RC1                                     |

---

### DEBT-021 — Permissions CAP separees

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-021                                                               |
| **Description** | Separer les 4 permissions CAP (demander, planifier, affecter, valider) actuellement portees par les memes gardes RBAC. |
| **Priorite**| P3 — RC2                                                               |
| **Statut**  | planifie                                                               |

---

### DEBT-022 — Etats de disponibilite CAP

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-022                                                               |
| **Description** | Implementer les etats de disponibilite des agents CAP (Disponible, En intervention, En deplacement, En pause, Hors service). |
| **Priorite**| P3 — RC2                                                               |
| **Statut**  | planifie                                                               |

---

### DEBT-023 — Ciblage multi-communes et audiences

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-023                                                               |
| **Description** | Ciblage multi-communes et par categorie d'usagers pour la communication institutionnelle. |
| **Priorite**| P3 — RC2                                                               |
| **Statut**  | planifie                                                               |

---

### DEBT-024 — Publication programmee

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-024                                                               |
| **Description** | Etat "Programme" avec publication differee necessitant un mecanisme de type cron/scheduler. |
| **Priorite**| P3 — RC2                                                               |
| **Statut**  | planifie                                                               |

---

### DEBT-025 — Indice territorial enrichi

| Champ       | Valeur                                                                 |
|-------------|------------------------------------------------------------------------|
| **ID**      | DEBT-025                                                               |
| **Description** | Indice de situation territoriale base sur des regles metier (evenements majeurs, communes en difficulte, services degrades, tendances). Doit produire une interpretation, pas un score numerique. Necessite historique J-1 et 7 jours. |
| **Priorite**| P2 — RC2                                                               |
| **Statut**  | planifie                                                               |

---

## Synthese par priorite

| Priorite | Nombre | IDs                                                    |
|----------|--------|--------------------------------------------------------|
| P1       | 2      | DEBT-003, DEBT-010                                     |
| P2       | 11     | DEBT-001, DEBT-002, DEBT-004, DEBT-008, DEBT-009, DEBT-011, DEBT-016, DEBT-018, DEBT-019, DEBT-020, DEBT-025 |
| P3       | 11     | DEBT-005, DEBT-006, DEBT-007, DEBT-012, DEBT-013, DEBT-014, DEBT-017, DEBT-021, DEBT-022, DEBT-023, DEBT-024 |
| P4       | 1      | DEBT-015                                               |

## Estimation globale

La remediation complete de l'ensemble de la dette identifiee represente une charge estimee entre **23 et 33 sprints**. Les elements P1 (DEBT-003 et DEBT-010) doivent etre traites en priorite absolue avant toute mise en production. Les elements DEBT-019 et DEBT-020 sont planifies pour RC2.

---

*Document mis a jour dans le cadre du gel d'architecture RC1 — v1.0.0-rc1 — 2 juillet 2026*
