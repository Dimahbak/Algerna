# ALGERNA -- Feuille de Route v2

**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Classification** : Document interne -- Wilaya d'Alger

---

## Table des matieres

1. [Court terme (0-3 mois)](#court-terme-0-3-mois)
2. [Moyen terme (6-12 mois)](#moyen-terme-6-12-mois)
3. [Long terme (12-36 mois)](#long-terme-12-36-mois)

---

## Court terme (0-3 mois)

Objectifs prioritaires : stabilisation, qualite et securite de la plateforme existante.

### Pipeline CI/CD

- Mise en place de GitHub Actions pour l'integration et le deploiement continus
- Automatisation du build, des tests et du deploiement sur les environnements de staging et de production
- Notifications d'echec vers l'equipe de developpement

### Tests automatises

- Integration du framework Jest pour les tests unitaires et d'integration
- Couverture minimale ciblee : 70% sur les modules critiques (workflow, SLA, ICUA)
- Tests de non-regression automatises sur les API existantes

### Refactorisation du frontend

- Eclatement du fichier monolithique `index.html` en composants modulaires
- Separation des vues par module (signaler, supervision, administration, etc.)
- Mise en place d'un systeme de chargement dynamique des vues

### Audit de securite OWASP

- Audit complet selon le referentiel OWASP Top 10
- Correction des vulnerabilites identifiees (injection SQL, XSS, CSRF, etc.)
- Mise en place de headers de securite (CSP, HSTS, X-Frame-Options)
- Revue des mecanismes d'authentification et d'autorisation

### Verification par e-mail

- Validation de l'adresse e-mail a l'inscription du citoyen
- Envoi d'un lien de confirmation avec jeton a duree limitee
- Mecanisme de reinitialisation de mot de passe securise

### Exports PDF et Excel

- Generation de rapports PDF pour les signalements, les missions et les communiques
- Exports Excel des donnees de supervision et des statistiques
- Modeles de documents conformes a la charte graphique institutionnelle

### Amelioration de l'UX back-office

- Optimisation de la navigation entre les modules
- Amelioration de la reactivite (responsive design) sur tablettes
- Integration des retours utilisateurs des phases de test internes

---

## Moyen terme (6-12 mois)

Objectifs strategiques : extension fonctionnelle, ouverture et resilience.

### Application mobile native

- Developpement d'une application mobile native avec React Native
- Espace citoyen complet (signalement, suivi, notifications push)
- Module CAP optimise pour le terrain (GPS, camera, mode hors-ligne)
- Publication sur Google Play Store et Apple App Store

### Saksini AI (NLP)

- Integration du traitement automatique du langage naturel (NLP)
- Classification automatique des signalements a partir de la description textuelle
- Suggestion de categorie et de localisation
- Analyse de sentiment sur les retours citoyens
- Detection des doublons de signalements

### Tableau de bord analytique avance

- Visualisations interactives (graphiques temporels, cartes thermiques, diagrammes de flux)
- Analyses comparatives inter-communes et inter-periodes
- Rapports automatises periodiques (hebdomadaires, mensuels, trimestriels)

### Publication Open Data

- Mise a disposition de jeux de donnees anonymises en format ouvert
- Conformite aux standards nationaux de donnees ouvertes
- API publique documentee pour les developpeurs et chercheurs
- Tableau de bord de transparence accessible aux citoyens

### Monitoring et observabilite (APM)

- Mise en place d'un systeme de monitoring applicatif (Application Performance Monitoring)
- Tableaux de bord de sante systeme (temps de reponse, taux d'erreur, charge)
- Alertes proactives sur les degradations de performance
- Traçabilite des requetes de bout en bout (distributed tracing)

### Support multilingue etendu

- Extension du support linguistique au-dela du francais et de l'arabe
- Integration de l'amazigh (tamazight)
- Anglais pour les interfaces techniques et la documentation API
- Gestion dynamique des traductions via l'interface d'administration

### Enquetes de satisfaction citoyenne

- Questionnaires de satisfaction apres resolution d'un signalement
- Enquetes periodiques sur la qualite du service urbain
- Analyse statistique des resultats et integration dans le score ICUA
- Tableaux de bord de satisfaction par zone geographique et par service

### Plan de reprise et de continuite d'activite (PRA/PCA)

- Definition du plan de reprise d'activite (RTO, RPO)
- Sauvegardes automatisees et testees regulierement
- Infrastructure de basculement (failover)
- Procedures documentees et testees semestriellement

### Interoperabilite inter-systemes (e-Algerie)

- Integration avec les systemes d'information nationaux (e-Algerie)
- Echange de donnees avec les services de l'etat civil
- Interconnexion avec les systemes de gestion des collectivites locales
- Conformite aux referentiels d'interoperabilite nationaux

---

## Long terme (12-36 mois)

Vision prospective : ville intelligente, prediction et rayonnement territorial.

### Integration Smart City (capteurs IoT)

- Raccordement aux capteurs urbains (qualite de l'air, bruit, eclairage, dechets)
- Creation automatique de signalements a partir des donnees capteurs
- Tableaux de bord environnementaux en temps reel
- Seuils d'alerte configurables par zone geographique

### Analytique predictive

- Modeles de prediction des incidents urbains (saisonnalite, recurrence)
- Anticipation des besoins en ressources (agents, vehicules, materiels)
- Prevision des pics de signalements
- Optimisation des tournees CAP par algorithmes predictifs

### Scoring environnemental

- Indice de qualite environnementale par quartier
- Suivi des indicateurs de developpement durable (ODD)
- Integration des donnees climatiques et de pollution
- Rapports environnementaux periodiques automatises

### Integration du suivi budgetaire

- Rattachement des interventions aux lignes budgetaires
- Cout moyen par type d'intervention
- Suivi de l'execution budgetaire en temps reel
- Aide a la decision pour l'allocation des ressources

### Expansion regionale (autres wilayas)

- Architecture multi-tenant pour le deploiement dans d'autres wilayas
- Personnalisation par collectivite (charte graphique, categories, workflows)
- Mutualisation des donnees a l'echelle nationale
- Benchmarking inter-wilayas

### Marketplace API

- Catalogue d'API documentees pour les developpeurs tiers
- Portail developpeur avec sandbox et cles d'acces
- Ecosysteme d'applications tierces (startups, associations, universites)
- Modele de gouvernance des API (versioning, deprecation, SLA)

### Blockchain pour le journal d'audit

- Enregistrement des transitions critiques sur une blockchain permissionnee
- Garantie d'immutabilite des traces d'audit
- Certification des documents officiels (communiques, rapports)
- Conformite aux exigences de transparence et de non-repudiation

### Jumeau numerique d'Alger

- Modelisation 3D de la ville integrant les donnees de la plateforme
- Visualisation spatiale des signalements, interventions et equipements
- Simulation de scenarios urbains (travaux, evenements, catastrophes)
- Outil d'aide a la planification urbaine et a la prise de decision strategique

---

*Document genere le 30 juin 2026 -- ALGERNA v1.0.0-alpha.2*
