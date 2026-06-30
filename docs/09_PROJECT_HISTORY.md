# ALGERNA -- Historique du Projet

**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Classification** : Document interne -- Wilaya d'Alger

---

## Table des matieres

1. [Pre-Sprint](#pre-sprint)
2. [Sprint 0 -- Separation des profils](#sprint-0--separation-des-profils)
3. [Sprint 1 -- Board Agent](#sprint-1--board-agent)
4. [Sprint 2 -- Workflow](#sprint-2--workflow)
5. [Sprint 3 -- CAP](#sprint-3--cap)
6. [Sprint 3.5 -- ODS](#sprint-35--ods)
7. [Sprint 4 -- Supervision](#sprint-4--supervision)
8. [Sprint 5 -- Communiques](#sprint-5--communiques)
9. [Sprint 5.5 -- Consolidation](#sprint-55--consolidation)
10. [Sprint 6 -- Administration](#sprint-6--administration)
11. [Sprint 7 -- ICUA](#sprint-7--icua)
12. [Sprint 8 -- Intelligence](#sprint-8--intelligence)
13. [Decisions structurantes](#decisions-structurantes)

---

## Pre-Sprint

**Objectif** : Poser les fondations visuelles et techniques de la plateforme.

**Contexte** : Le projet ALGERNA demarre avec la necessite de creer une vitrine institutionnelle et un socle technique solide avant tout developpement fonctionnel.

**Livrables** :

- Pages d'atterrissage desktop et mobile avec integration du design institutionnel
- Integration graphique conforme a la charte de la Wilaya d'Alger
- Module d'authentification de base (JWT)
- Schema de base de donnees initial (`db/migrations/001_init.sql`)
- Structure du projet (Express.js, PostgreSQL, SPA vanilla JS)

---

## Sprint 0 -- Separation des profils

**Contexte** : A l'issue du pre-sprint, l'ensemble des roles (citoyen, agent, responsable, administrateur) partageaient un seul et meme tableau de bord citoyen. Cette situation rendait impossible toute operation metier pour les agents et responsables.

**Decision** : Creer des espaces separes pour chaque profil utilisateur, avec un routage automatique apres authentification.

**Livrables** :

- Systeme de routage par role a l'authentification
- Quatre vues provisoires de back-office (une par profil operationnel)
- Separation claire entre l'espace citoyen et les espaces operationnels

---

## Sprint 1 -- Board Agent

**Contexte** : Les agents disposaient d'espaces provisoires sans outillage reel. Ils ne pouvaient ni visualiser les signalements, ni les filtrer, ni agir dessus de maniere structuree.

**Decision** : Developper un tableau Kanban complet comme outil principal de travail des agents.

**Livrables** :

- Tableau Kanban a 6 colonnes (representant les etats du workflow)
- Tiroir lateral (drawer) pour le detail des signalements
- Recherche textuelle sur les signalements
- Systeme de filtres avances (statut, categorie, date, priorite)
- Modale de rejet avec motif obligatoire
- Modale de creation de mission CAP

---

## Sprint 2 -- Workflow

**Contexte** : Les boutons d'action sur le board etaient non fonctionnels. Les transitions de statut n'etaient pas controlees et il n'existait aucune tracabilite des actions.

**Decision** : Centraliser toute la logique metier dans un moteur de workflow unique, source de verite pour les transitions d'etat.

**Livrables** :

- **workflow.js** : moteur centralise de transitions d'etat
- Validation des transitions (verification des droits, des conditions prealables)
- Historique complet des transitions (qui, quand, quoi, pourquoi)
- Routage automatique des signalements vers le service competent
- Notifications citoyennes a chaque changement de statut
- Journal d'audit (audit log) pour la tracabilite reglementaire

**Decision majeure** : Le routage automatique s'effectue via un mapping `categorie -> EPIC` (Equipe de Prise en Charge), permettant d'orienter chaque signalement vers le service le plus pertinent sans intervention manuelle.

---

## Sprint 3 -- CAP

**Contexte** : Les agents de terrain (Corps d'Accompagnement de Proximite) ne disposaient d'aucune application pour gerer leurs missions sur le terrain. Ils travaillaient a partir de documents papier ou d'appels telephoniques.

**Decision** : Developper une application mobile-first dediee aux missions de terrain.

**Livrables** :

- Cycle de vie complet des missions (assignation, deplacement, intervention, cloture)
- Navigation GPS integree (guidage vers le lieu d'intervention)
- Module d'assistance citoyenne (interaction directe avec le citoyen sur place)
- Signalement proactif (l'agent peut creer des signalements depuis le terrain)

---

## Sprint 3.5 -- ODS (Operations Design System)

**Contexte** : Apres trois sprints de developpement, un constat s'impose : l'interface des differents back-offices presente des incoherences visuelles et ergonomiques significatives. Chaque module a ete developpe avec ses propres composants, creant une dette technique d'interface.

**Decision** : Suspendre le developpement fonctionnel pour creer un systeme de design operationnel (ODS) unifie. Cette decision strategique vise a garantir la coherence de tous les modules futurs.

**Livrables** :

- 16 composants reutilisables (boutons, cartes, tableaux, modales, formulaires, indicateurs, etc.)
- Indicateur SLA (Engagement de Service) visuel avec code couleur
- Conformite aux standards d'accessibilite
- Documentation d'utilisation des composants pour les developpeurs

---

## Sprint 4 -- Supervision

**Contexte** : Les responsables operationnels n'avaient aucune visibilite sur le fonctionnement global du service. Ils ne pouvaient ni mesurer la performance, ni detecter les anomalies, ni suivre l'activite en temps reel.

**Livrables** :

- 5 API de supervision (KPIs, alertes, performance, activite, tendances)
- Tableau de bord des indicateurs cles de performance (KPIs)
- Systeme d'alertes operationnelles (SLA depasses, anomalies detectees)
- Tableaux de performance par agent et par service
- Vue d'activite en temps reel

---

## Sprint 5 -- Communiques

**Contexte** : La Wilaya n'avait aucun outil numerique pour la publication de communiques officiels. La communication institutionnelle passait par des canaux informels sans validation hierarchique.

**Decision** : Mettre en place une chaine editoriale complete avec separation des roles (l'agent redige, le responsable valide et publie).

**Livrables** :

- Workflow a 6 etats (brouillon, soumis, en revision, approuve, publie, archive)
- 11 categories de communiques (travaux, securite, environnement, culture, etc.)
- Separation stricte des roles redacteur/valideur
- Historique des versions et des validations

---

## Sprint 5.5 -- Consolidation

**Contexte** : Une revue d'architecture post-Sprint 5 a revele des duplications de code significatives entre modules, notamment sur la gestion des SLA, le controle d'acces et les services de donnees.

**Livrables** :

- Service SLA centralise (factorisation de la logique repartie dans 4 modules)
- Constantes RBAC partagees (roles, permissions, niveaux d'acces)
- 3 services de donnees mutualises (signalements, utilisateurs, statistiques)
- Suite de non-regression : 15 tests sur 15 passes

---

## Sprint 6 -- Administration

**Contexte** : Les donnees de reference (categories, statuts, services, zones geographiques) etaient codees en dur dans le code source. Toute modification necessitait un redeploiement.

**Decision** : Rendre l'ensemble des references configurables via une interface d'administration, sans intervention technique.

**Livrables** :

- **ConfigEngine** : moteur de configuration dynamique
- 18 endpoints d'administration (CRUD sur toutes les entites de reference)
- Catalogue CAP (gestion des missions types, zones d'intervention, competences)
- Interface d'administration complete pour les administrateurs systeme

---

## Sprint 7 -- ICUA (Indicateur Composite Urbain d'Alger)

**Contexte** : Malgre les tableaux de supervision, il n'existait aucun indicateur global et synthetique de la performance du service urbain. Les decideurs ne pouvaient comparer ni les periodes, ni les territoires.

**Decision** : Creer un score composite explicable, dont chaque composante est transparente et comprehensible. Aucune boite noire.

**Livrables** :

- Score ICUA composite a 6 composantes :
  - **Engagement citoyen** : 40% (participation, signalements, interactions)
  - **Resolution** : 20% (taux de resolution, delais)
  - **Temps de reponse** : 15% (respect des engagements de service)
  - **Performance CAP** : 10% (efficacite des missions de terrain)
  - **Satisfaction** : 10% (retours citoyens, evaluations)
  - **Communication** : 5% (communiques publies, couverture informationnelle)
- Ponderations configurables via ConfigEngine
- Historique et tendances du score

---

## Sprint 8 -- Intelligence

**Contexte** : Le module de supervision montre le "quoi" (que se passe-t-il ?) mais pas le "pourquoi" (quelles sont les causes ?). Les responsables manquent d'outils d'aide a la decision.

**Decision** : Developper un module d'analyse deterministe, sans recours a l'intelligence artificielle generative. Les recommandations sont basees sur des regles metier explicites et des correlations statistiques simples.

**Livrables** :

- Analyse des facteurs de degradation (identification des causes racines)
- Priorites recommandees (classement des actions a entreprendre)
- Score de priorite par signalement (criticite, anciennete, impact)
- Alertes intelligentes (detection proactive des situations a risque)

---

## Decisions structurantes

Les decisions suivantes ont ete prises au cours du projet et constituent les principes directeurs d'ALGERNA :

### 1. SLA devient "Engagement de Service"

La terminologie technique "SLA" (Service Level Agreement) a ete remplacee par "Engagement de Service" dans toutes les interfaces citoyennes. Ce choix reflète la volonte de communiquer en termes comprehensibles par les citoyens, tout en conservant la rigueur technique en interne.

### 2. CAP : accompagner, orienter, informer -- jamais sanctionner

Le Corps d'Accompagnement de Proximite a une mission exclusivement positive. Les agents CAP accompagnent les citoyens, les orientent vers les services competents et les informent de leurs droits. En aucun cas ils ne disposent de pouvoirs de sanction. Cette decision fondatrice definit la philosophie du service.

### 3. Separation Citoyen / Operations / Executif

L'architecture de la plateforme repose sur une separation stricte en trois espaces :

- **Espace Citoyen** : signaler, suivre, evaluer
- **Espace Operations** : traiter, intervenir, rendre compte
- **Espace Executif** : superviser, analyser, decider

Cette separation garantit que chaque utilisateur accede uniquement aux fonctionnalites pertinentes pour son role.

### 4. ODS avant toute nouvelle fonctionnalite

La decision de creer l'Operations Design System (Sprint 3.5) avant de poursuivre le developpement fonctionnel a ete prise pour eviter l'accumulation de dette technique d'interface. Tout nouveau module doit utiliser les composants ODS.

### 5. ICUA explicable, sans boite noire

Le score ICUA est integralement transparent : chaque composante, sa ponderation et sa methode de calcul sont documentees et accessibles. Aucun algorithme opaque n'est utilise. Les decideurs peuvent comprendre et expliquer chaque variation du score.

### 6. Intelligence sans IA generative

Le module d'intelligence repose sur des regles deterministes et des analyses statistiques classiques. Ce choix garantit la reproductibilite des resultats, la tracabilite des recommandations et l'independance vis-a-vis de services tiers. L'integration eventuelle de l'IA generative est envisagee dans la feuille de route a moyen terme (Saksini AI).

---

*Document genere le 30 juin 2026 -- ALGERNA v1.0.0-alpha.2*
