# Charte de gouvernance ALGERNA — RC1

**Version** : v1.0.0-rc1
**Date de gel** : 2 juillet 2026
**Statut** : Document de reference officiel

---

## Finalite

ALGERNA est la plateforme de gouvernance civique de la Wilaya d'Alger. Elle permet aux citoyens de signaler les problemes de leur environnement urbain et a l'administration territoriale de coordonner leur resolution.

## Mission

Acheminer intelligemment chaque signalement citoyen jusqu'au service competent, en garantissant la tracabilite, le respect des delais et l'information du citoyen a chaque etape.

---

## Les six postes de travail

### 1. Citoyen

| Champ | Valeur |
|-------|--------|
| Role | Usager de la plateforme |
| Responsabilite | Signaler un probleme |
| Il recoit | Confirmations, notifications de suivi, information de resolution |
| Il transmet | Signalements (photo, description, localisation) |

### 2. Agent de reception et de coordination

| Champ | Valeur |
|-------|--------|
| Role RBAC | `agent` |
| Service | Centre de Reception et de Coordination |
| Autorite | Wilaya d'Alger |
| Responsabilite | Recevoir, qualifier, transmettre |
| Il recoit | Signalements citoyens |
| Il transmet | Dossiers qualifies aux services competents |
| Superieur fonctionnel | Centre Operationnel |

### 3. Responsable du service competent

| Champ | Valeur |
|-------|--------|
| Role RBAC | `operateur` |
| Service | Voirie, Hygiene, Eclairage, Assainissement, Direction Propreté, etc. |
| Autorite | Wilaya d'Alger |
| Responsabilite | Organiser l'intervention, declarer la resolution |
| Il recoit | Dossiers transmis par le Centre de Reception |
| Il transmet | Retours d'intervention a la Wilaya |
| Superieur fonctionnel | Centre de Reception — Wilaya |

### 4. Agent de Proximite (CAP)

| Champ | Valeur |
|-------|--------|
| Role RBAC | `agent` (detecte via `agent_cap`) |
| Service | Corps des Agents de Proximite — CAP |
| Autorite | Wilaya d'Alger |
| Responsabilite | Interventions terrain (constat, assistance, controle, tournee) |
| Il recoit | Interventions de la Wilaya |
| Il transmet | Rapports terrain a la Wilaya |
| Superieur fonctionnel | Centre de Reception / Centre Operationnel |

### 5. Centre Operationnel

| Champ | Valeur |
|-------|--------|
| Role RBAC | `admin_apc` |
| Service | Centre Operationnel de Coordination |
| Autorite | Wilaya d'Alger |
| Responsabilite | Coordonner, controler, relancer, preparer les communiques |
| Il recoit | Retours des services, alertes, indicateurs |
| Il transmet | Syntheses au Pilotage strategique |
| Superieur fonctionnel | Pilotage strategique |

### 6. Pilotage strategique

| Champ | Valeur |
|-------|--------|
| Role RBAC | `admin_wilaya` |
| Service | Cabinet — Secretariat General |
| Autorite | Wilaya d'Alger |
| Responsabilite | Arbitrer, valider, publier, decider |
| Il recoit | Syntheses du Centre Operationnel, ICUA, alertes |
| Il transmet | Decisions, communiques publies |
| Superieur fonctionnel | Wali |

---

## Regles fondamentales

1. **Un acteur = une responsabilite.** Aucun acteur ne se substitue a un autre.
2. **Le citoyen ne voit jamais la complexite administrative.** Il voit uniquement : Signale → En cours → Resolu.
3. **Le CAP repond uniquement a la Wilaya.** Les services n'activent jamais directement le CAP.
4. **Le Responsable de service ne cloture jamais un dossier.** Il declare la fin de son intervention. La Wilaya cloture.
5. **Le Centre Operationnel coordonne mais ne traite pas.** Il observe, relance, alerte. Il ne prend aucune decision operationnelle.
6. **Le Pilotage strategique decide mais n'execute pas.** Il arbitre, valide, publie. Il ne descend jamais au niveau du dossier individuel.
7. **Les circuits de validation sont parametrables.** Chaque Wilaya conserve son organisation interne.
8. **Le CAP est une ressource optionnelle.** Il peut intervenir avant, pendant ou apres le traitement, mais uniquement sur decision de la Wilaya.

---

## Chaine officielle de traitement

### Chaine operationnelle (flux du dossier)

```
Citoyen
    |
    v
Centre de Reception et de Coordination
    |
    +--------> [Optionnel] Agent de Proximite CAP
    |                         |
    |                    Rapport terrain
    |                         |
    |             Confirmation / Reorientation
    |
    v
Service competent (Voirie, Hygiene, etc.)
    |
    v
Retour d'intervention → Centre de Reception
    |
    v
Cloture administrative → Information du citoyen
```

Le dossier circule uniquement entre le Centre de Reception, le CAP (optionnel) et le service competent.
Le dossier n'est jamais "transmis" au Centre Operationnel ni au Pilotage strategique.

### Supervision permanente (en parallele)

```
Centre Operationnel ─────── observe, coordonne, relance, alerte
    |                        (n'intervient pas sur les dossiers)
    v
Pilotage strategique ────── arbitre, valide, decide
                             (lecture decisionnelle, pas operationnelle)
```

Le Centre Operationnel et le Pilotage strategique consultent les indicateurs en temps reel.
Ils ne recoivent pas les dossiers. Ils supervisent la performance globale.

---

*Document officiel — Gel RC1 — Revision finale*
