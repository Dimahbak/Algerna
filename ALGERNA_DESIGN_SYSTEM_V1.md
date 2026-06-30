# ALGERNA Design System V1

## Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-navy` | `#063B5A` | Header, sidebar, titres |
| `--color-navy-dark` | `#052B42` | Fond sidebar, dégradés |
| `--color-turquoise` | `#12A6A6` | Accent, item actif, Ma Houma |
| `--color-green` | `#2F8F3A` | Bouton principal, résolu |
| `--color-red` | `#EF4444` | Urgence, signalement ouvert |
| `--color-orange` | `#F59E0B` | En cours, intervention |
| `--color-blue` | `#2563EB` | Information, administratif |
| `--color-bg` | `#F3F8FB` | Fond général |
| `--color-text` | `#0B2545` | Texte principal |
| `--color-muted` | `#64748B` | Texte secondaire |

## Rayons

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-sm` | `10px` | Boutons, inputs, badges |
| `--radius-md` | `14px` | Cards standard, filtres |
| `--radius-lg` | `20px` | Cards larges |
| `--radius-xl` | `26px` | Module cards, welcome card |

## Ombres

| Token | Usage |
|-------|-------|
| `--shadow-soft` | Cards au repos |
| `--shadow-card` | Cards interactives |
| `--shadow-hover` | Hover desktop |
| `--shadow-sm` | Éléments discrets |

## Espacements

| Token | Valeur |
|-------|--------|
| `--space-xs` | `6px` |
| `--space-sm` | `10px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |

## Typographie

| Élément | Taille | Poids |
|---------|--------|-------|
| Titre principal | `28px` | `800` |
| Titre section | `20px` | `700` |
| Texte courant | `15px` | `400` |
| Texte secondaire | `13px` | `400` + `--color-muted` |

## Composants

### `.app-card`
Card principale — radius xl, ombre card, hover translateY(-3px)

### `.stat-card`
Carte statistique — radius 22px, ombre soft, hover

### `.module-card`
Carte module accueil — radius 26px, min-height 160px, teinte par module

### `.info-card`
Carte information — radius md, ombre sm

### `.empty-state`
État vide — icône + message centré

### `.filter-pill`
Bouton filtre pill — radius 20px, actif = fond navy

### `.status-badge`
Badge statut — `.status-open`, `.status-progress`, `.status-resolved`, `.status-info`, `.status-proximity`

## États métier

| État | Couleur | Classe |
|------|---------|--------|
| Ouvert / Urgence | Rouge | `.status-open` |
| En cours | Orange | `.status-progress` |
| Résolu / Succès | Vert | `.status-resolved` |
| Information | Bleu | `.status-info` |
| Proximité | Turquoise | `.status-proximity` |

## Interdictions

- Ne jamais coder de couleur en dur — utiliser les tokens
- Ne jamais utiliser de border-radius < 8px
- Ne jamais utiliser d'ombre supérieure à `--shadow-hover`
- Ne jamais modifier les landings via le Design System
- Toujours ajouter les traductions FR + AR pour tout nouveau texte

---

# Operations Design System (ODS) — V1

## Palette métier

| Token | Hex | Usage |
|-------|-----|-------|
| `--ops-info` | `#2563EB` | Information |
| `--ops-success` | `#16a34a` | Conforme / Résolu |
| `--ops-warning` | `#F59E0B` | Attention / En cours |
| `--ops-danger` | `#EF4444` | Critique / Hors délai |
| `--ops-purple` | `#7c3aed` | Supervision |
| `--ops-neutral` | `#64748b` | Terminé / Inactif |

## Composants ODS

### `.ops-kpi`
Carte KPI compacte avec bordure gauche colorée. Variantes : `.ops-danger`, `.ops-warning`, `.ops-success`, `.ops-info`, `.ops-purple`.

### `.ops-status` + `.ops-status-{etat}`
Badge statut unifié : `recu`, `transmis`, `en_intervention`, `resolu`, `rejete`, `cree`, `accepte`, `en_cours`, `termine`, `bloque`.

### `.ops-prio` + `.ops-prio-{niveau}`
Badge priorité : `faible/basse`, `normale/moyenne`, `haute`, `urgente/critique`.

### `.ops-sla` + `.ops-sla-{ok|warn|breach}`
Indicateur SLA : conforme (vert), échéance proche (orange), hors délai (rouge). Calculé via `opsSlaClass(cree_le, targetHours)`.

### `.ops-timeline`
Timeline verticale avec dots colorés par type d'événement. Utilisé pour signalements, missions CAP, audit.

### `.ops-drawer`
Drawer latéral réutilisable : overlay + panel + header/body/footer.

### `.ops-table`
Table métier avec tri, hover, espacement standard.

### `.ops-card`
Carte métier compacte. Header + meta + contenu.

### `.ops-empty`
État vide harmonisé : icône + texte.

### `.ops-form`
Formulaire standard : labels, inputs, erreurs.

## Hiérarchie standard

```
ops-layout-header (gradient navy)
  ↓
ops-layout-kpis (flex row)
  ↓
ops-layout-filters (flex row)
  ↓
ops-layout-workspace
```

## SLA Citoyen

| Seuil | Indicateur | Classe |
|-------|-----------|--------|
| < 75% du délai | 🟢 Conforme | `.ops-sla-ok` |
| 75-100% | 🟠 Échéance proche | `.ops-sla-warn` |
| > 100% | 🔴 Hors délai | `.ops-sla-breach` |

Délai cible par défaut : 48h. Configurable.
