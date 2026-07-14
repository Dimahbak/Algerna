# Table officielle des profils ALGERNA — RC1

**Version** : v1.2 — Realignement final sur tableau Hamid
**Date** : 14 juillet 2026
**Revision** : Ecarts resolus — organisations corrigees en base

---

## Comptes de demonstration

| # | Telephone | Nom | Prenom | Role RBAC | Poste officiel | Organisation (base) | Bandeau ecran | Mdp | Statut |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0550000001 | Benali | Amina | `citoyen` | Citoyen test | — | — | admin1234 | Valide |
| 2 | 0550000002 | Kaci | Youcef | `agent` | Agent reception wilaya | Service de Reception | Agent de reception | admin@@1234 | Valide |
| 3 | 0550000003 | Mansouri | Rachid | `admin_wilaya` | Commandement cabinet wilaya | Cabinet | Salle de Commandement | admin@@1234 | Valide |
| 4 | 0550000004 | Benali | Karim | `agent` | CAP | Brigade CAP | Agent de proximite | admin@@1234 | Valide |
| 5 | 0550000005 | Hadj | Mourad | `admin_apc` | Superviseur APC | Coordination Operationnelle | Centre Operationnel | admin@@1234 | Valide |
| 6 | 0550000006 | Benmoussa | Yacine | `admin_wilaya` | Cabinet wilaya CCOE | Cabinet | CCOE | admin@@1234 | Valide |
| 7 | 0550000007 | Taleb | Nassim | `operateur` | EPIC proprete | EPIC — Direction Proprete | Responsable — Direction Proprete Centre | admin@@1234 | Valide |
| 8 | 0550000008 | Aissaoui | Nadia | `operateur` | EPIC eclairage | Direction Eclairage Public | Responsable — Direction Eclairage Public | admin@@1234 | Valide |
| 9 | 0550000009 | Boumediene | Khaled | `operateur` | EPIC Parking | EPIC — Gestion des Parkings | Responsable — EPIC Gestion des Parkings | admin@@1234 | Valide |
| 10 | 0550000010 | Hadji | Samira | `operateur` | EPIC Patrimoine local | EPIC — Patrimoine Local (Regie Fonciere) | PatriLocal — Patrimoine Immobilier | admin@@1234 | Valide |
| 11 | 0550000011 | Mebarki | Farid | `operateur` | EPIC Direction de l'Eau | EPIC — Direction de l'Eau | Responsable — EPIC Direction de l'Eau | admin@@1234 | Valide |
| 12 | 0550000012 | Cherif | Sofiane | `operateur` | EPIC Voirie | EPIC — Direction Voirie | Responsable — Direction Voirie et Trottoirs | admin@@1234 | Valide |

## Agent de Proximite (CAP)

Le CAP n'est pas un compte separe. C'est un **role fonctionnel** detecte parmi les utilisateurs de role `agent` inscrits dans la table `agent_cap`.

En RC1, la detection se fait cote front-end. En RC2 (DEBT-019), un role RBAC dedie `cap` sera cree.

Pour la demonstration, tout utilisateur `agent` inscrit dans `agent_cap` atterrit automatiquement sur le workbench Agent de Proximite.

---

## RBAC

| Role RBAC | ADMIN_ROLES | SUPER_ADMIN_ROLES | isAdmin() | isSuperAdmin() |
|---|---|---|---|---|
| `citoyen` | — | — | false | false |
| `agent` | — | — | false | false |
| `operateur` | — | — | false | false |
| `admin_apc` | oui | — | true | false |
| `admin_wilaya` | oui | oui | true | true |

## Fonctions de verification

| Fonction | Roles | Usage |
|---|---|---|
| `canManagePatrimoine()` | admin_apc, admin_wilaya | PatriLocal |
| `canCreateCapIntervention()` | admin_apc, admin_wilaya | Interventions CAP admin |
| `canManageCapAgents()` | admin_wilaya | Gestion agents CAP |
| `canPublishCommunique()` | admin_wilaya | Publication communiques |
| `canDeleteCommunique()` | admin_wilaya | Suppression communiques |

## Matrice des permissions

| Permission | agent | operateur | admin_apc | admin_wilaya |
|---|:-:|:-:|:-:|:-:|
| Qualifier | x | — | x | — |
| Transmettre | x | — | x | — |
| Rejeter | x | — | x | — |
| Intervention CAP (drawer) | x | — | x | — |
| Declarer resolution | — | x | — | — |
| Reorienter | — | x | — | — |
| Demander precision | — | x | — | — |
| Creer intervention (admin) | — | — | x | x |
| Terminer intervention (admin) | — | — | x | x |
| Gerer agents CAP | — | — | — | x |
| Creer communique | — | — | x | x |
| Publier communique | — | — | — | x |
| Supprimer communique | — | — | — | x |
| Voir ICUA | — | — | — | x |
| Exporter CSV | — | — | x | x |
| Administration | — | — | — | x |

---

*Document officiel — Gel RC1 — Revision finale*
