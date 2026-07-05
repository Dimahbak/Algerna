# Table officielle des profils ALGERNA — RC1

**Version** : v1.0.0-rc1
**Date** : 2 juillet 2026
**Revision** : Finale — aucun doublon

---

## Comptes de demonstration

| # | Telephone | Nom | Prenom | Role RBAC | Poste officiel | Service | Statut RC1 |
|---|---|---|---|---|---|---|---|
| 1 | 0550000001 | Benali | Amina | `citoyen` | Citoyen | — | Valide |
| 2 | 0550000002 | Kaci | Youcef | `agent` | Agent de reception et de coordination | Centre de Reception et de Coordination | Valide |
| 3 | 0550000003 | Mansouri | Rachid | `admin_wilaya` | Pilotage strategique | Cabinet — Secretariat General | Valide |
| 4 | 0550000004 | Hadj | Mourad | `admin_apc` | Centre Operationnel | Centre Operationnel de Coordination | Valide |
| 5 | 0550000005 | Brahimi | Karim | `operateur` | Responsable — Netcom Alger | Netcom Alger (proprete) | Valide |
| 6 | 0550000006 | Aissaoui | Nadia | `operateur` | Responsable — SEAAL | SEAAL (eau) | Valide |

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
