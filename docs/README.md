# ALGERNA -- Documentation du Projet

**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Statut** : Alpha -- en developpement actif

---

## Presentation

**ALGERNA** est la plateforme citoyenne officielle de la Wilaya d'Alger.

Elle a pour vocation de moderniser la relation entre les citoyens et l'administration locale en offrant un point d'entree unique, numerique et transparent, pour l'ensemble des services publics de proximite : signalement d'anomalies, suivi des interventions, consultation des equipements publics, communication institutionnelle et participation citoyenne.

ALGERNA s'inscrit dans une demarche de gouvernance intelligente portee par la Wilaya d'Alger, avec un objectif clair : chaque citoyen devient un acteur de l'amelioration de son cadre de vie, et chaque agent public dispose des outils necessaires pour agir avec efficacite et transparence.

---

## Architecture documentaire

La documentation d'ALGERNA est organisee en 11 documents, chacun couvrant un aspect specifique du projet.

| # | Document | Description |
|---|----------|-------------|
| 01 | `01_VISION_ALGERNA_2030.md` | Vision strategique, mission, valeurs, philosophie citoyenne et feuille de route 2026-2030 |
| 02 | `02_ARCHITECTURE_REFERENCE.md` | Architecture technique de reference : stack, modules, moteurs, base de donnees, RBAC, workflows |
| 03 | `03_MODULES_BACKEND.md` | Documentation detaillee des 22 modules backend (routes, logique metier, dependances) |
| 04 | `04_FRONT_OFFICE.md` | Portail citoyen : dashboard, signalement, Ma Houma, infos, equipements, Saksini |
| 05 | `05_BACK_OFFICE.md` | Interfaces d'administration : Kanban agent, application CAP, supervision, admin, intelligence |
| 06 | `06_MOTEURS_SERVICES.md` | Documentation des moteurs centraux : workflow, communication, SLA, ICUA, intelligence, config |
| 07 | `07_MODELE_DONNEES.md` | Schema de la base de donnees PostgreSQL : tables, relations, migrations |
| 08 | `08_SECURITE_RBAC.md` | Modele de securite, roles, permissions, authentification JWT |
| 09 | `09_DESIGN_SYSTEM.md` | Operations Design System : composants ops-*, conventions visuelles, guidelines |
| 10 | `10_DEPLOIEMENT.md` | Infrastructure, configuration CyberPanel/OLS, mise en production |
| 11 | `11_API_REFERENCE.md` | Reference exhaustive de l'API REST : endpoints, parametres, reponses |

---

## Ordre de lecture recommande

Pour une comprehension progressive du projet, nous recommandons l'ordre suivant :

1. **Vision et strategie** -- `01_VISION_ALGERNA_2030.md`
   Comprendre le contexte, la mission et les objectifs d'ALGERNA.

2. **Architecture technique** -- `02_ARCHITECTURE_REFERENCE.md`
   Vue d'ensemble de l'architecture, des composants et de leurs interactions.

3. **Modules backend** -- `03_MODULES_BACKEND.md`
   Detail des 22 modules qui composent le systeme.

4. **Portail citoyen** -- `04_FRONT_OFFICE.md`
   L'experience utilisateur cote citoyen.

5. **Back office** -- `05_BACK_OFFICE.md`
   Les outils de gestion pour agents et administrateurs.

6. **Moteurs et services** -- `06_MOTEURS_SERVICES.md`
   La logique metier centralisee (workflows, SLA, ICUA).

7. **Modele de donnees** -- `07_MODELE_DONNEES.md`
   La structure de la base de donnees.

8. **Securite** -- `08_SECURITE_RBAC.md`
   Le modele de controle d'acces.

9. **Design System** -- `09_DESIGN_SYSTEM.md`
   Les conventions visuelles et composants d'interface.

10. **Deploiement** -- `10_DEPLOIEMENT.md`
    La mise en production et l'infrastructure.

11. **API** -- `11_API_REFERENCE.md`
    La reference technique des endpoints.

---

## Conventions

- **Langue principale** : francais (interfaces bilingues francais/arabe dans l'application)
- **Nommage technique** : anglais pour le code, francais pour les libelles metier
- **Terminologie institutionnelle** : les termes « Engagement de Service » (et non SLA), « ICUA », « CAP » sont specifiques a ALGERNA et documentes dans `01_VISION_ALGERNA_2030.md`

---

*ALGERNA -- Plateforme citoyenne de la Wilaya d'Alger*
*Wilaya d'Alger, 2026*
