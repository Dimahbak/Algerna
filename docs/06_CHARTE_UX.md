# Charte UX — ALGERNA

**Version** : v1.0.0-alpha.2
**Date** : 30 juin 2026
**Projet** : ALGERNA — Plateforme Citoyenne Intelligente
**Classification** : Document interne

---

## 1. Introduction

La charte UX ALGERNA definit les principes de conception et les regles d'experience utilisateur applicables a l'ensemble de la plateforme. Elle structure l'experience autour de trois couches distinctes, chacune repondant aux besoins specifiques de ses utilisateurs.

L'objectif est de garantir coherence, accessibilite et efficacite a travers tous les points de contact de la plateforme.

---

## 2. Couche 1 — Experience Citoyenne (Front Office)

### 2.1 Identite visuelle

L'experience citoyenne adopte une identite chaleureuse a caractere mediterraneen. L'interface privilegie les illustrations, les photographies d'Alger et une atmosphere accueillante qui reflete l'identite locale.

- **Hero** : photographie grand format d'Alger, glassmorphism sur la landing page
- **Illustrations** : chaque module dispose d'une illustration dediee sur les cartes d'acces
- **Ton** : accessible, humain, institutionnel sans etre austere

### 2.2 Palette de couleurs

| Couleur        | Code hex  | Proportion |
|----------------|-----------|------------|
| Blanc          | `#FFFFFF` | 40%        |
| Turquoise      | `#12A6A6` | 20%        |
| Sable          | `#F5F0E8` | 15%        |
| Vert           | `#2F8F3A` | 10%        |
| Bleu marine    | `#063B5A` | 10%        |
| Accents divers | —         | 5%         |

### 2.3 Composants

- **Cartes** : border-radius 26px, ombre douce, illustration de module
- **Landing** : glassmorphism (backdrop-filter: blur), fond photographique
- **Navigation mobile** : barre de navigation en bas de l'ecran (bottom nav)
- **Chatbot Saksini** : bouton flottant (FAB) en bas a droite

### 2.4 Typographie

| Usage        | Police | Taille | Graisse |
|--------------|--------|--------|---------|
| Corps        | Inter  | 15px   | 400     |
| Titres       | Inter  | 24px   | 600     |
| Sous-titres  | Inter  | 18px   | 500     |
| Labels       | Inter  | 13px   | 500     |

### 2.5 Approche responsive

La conception suit une logique **mobile-first**. L'interface est d'abord concue pour les ecrans mobiles, puis adaptee aux tablettes et aux ecrans de bureau. Le chatbot Saksini est accessible depuis toutes les tailles d'ecran.

---

## 3. Couche 2 — Experience Operations (Back Office)

### 3.1 Principes

L'interface operationnelle est efficace, dense en donnees et depourvue d'elements decoratifs. Chaque pixel sert un objectif fonctionnel. La lisibilite et la rapidite de prise de decision sont prioritaires.

### 3.2 Composants ODS (Operations Design System)

Le back-office s'appuie sur un systeme de composants dedie :

| Composant        | Usage                                              |
|------------------|-----------------------------------------------------|
| `ops-kpi`        | Indicateur cle de performance                       |
| `ops-status`     | Badge de statut (couleur semantique)                |
| `ops-prio`       | Indicateur de priorite (P1 a P4)                    |
| `ops-sla`        | Jauge de respect du delai d'engagement de service   |
| `ops-timeline`   | Chronologie des evenements d'un signalement         |
| `ops-drawer`     | Panneau lateral de detail (remplace la navigation)  |
| `ops-table`      | Tableau de donnees avec tri et filtrage              |

### 3.3 Couleurs semantiques

Les couleurs du back-office sont exclusivement semantiques :

| Role      | Code hex  | Usage                                  |
|-----------|-----------|----------------------------------------|
| Info      | `#2563EB` | Informations, elements neutres         |
| Success   | `#16A34A` | Actions reussies, statuts positifs     |
| Warning   | `#F59E0B` | Alertes, delais proches                |
| Danger    | `#EF4444` | Erreurs, depassements, statuts critiques|
| Purple    | `#7C3AED` | Elements speciaux, intelligence        |

### 3.4 Vues par role

- **Agent** : tableau Kanban a 6 colonnes, organisation par statut de workflow
- **CAP (Citoyen d'Appui de Proximite)** : liste de missions, navigation GPS
- **Responsable** : vue consolidee, supervision des equipes

### 3.5 Navigation

Le detail d'un signalement ou d'une mission s'ouvre dans un **drawer** (panneau lateral glissant), jamais dans une nouvelle page. Ce choix preserve le contexte de travail de l'operateur.

---

## 4. Couche 3 — Experience Executive (Supervision / Intelligence)

### 4.1 Principes

L'experience executive est orientee visualisation de donnees, indicateurs de performance et aide a la decision. L'interface est sobre, structuree et permet une lecture rapide de l'etat operationnel.

### 4.2 Elements cles

- **Score ICUA** : affiche en position proeminente, indicateur de sante globale
- **Engagement de service** : pourcentage de respect des engagements, visible en permanence
- **Indicateurs SLA** : jauges de conformite aux delais contractuels
- **KPIs** : cartes synthetiques avec tendance et comparaison
- **Tableaux** : donnees detaillees, triables et filtrables
- **Timelines** : activite en temps reel

### 4.3 Filtrage global

L'ensemble des widgets d'un tableau de bord partage un systeme de filtrage unique. Modifier un filtre (commune, service, periode) applique instantanement la selection a tous les composants visibles.

---

## 5. Regles communes

### 5.1 Tokens d'espacement

| Token | Valeur |
|-------|--------|
| `xs`  | 6px    |
| `sm`  | 10px   |
| `md`  | 16px   |
| `lg`  | 24px   |
| `xl`  | 32px   |

### 5.2 Rayons de bordure

| Token | Valeur |
|-------|--------|
| `sm`  | 10px   |
| `md`  | 14px   |
| `lg`  | 20px   |
| `xl`  | 26px   |

### 5.3 Ombres

| Nom    | Valeur                                      |
|--------|----------------------------------------------|
| soft   | `0 2px 8px rgba(15, 46, 94, 0.07)`          |
| card   | `0 4px 16px rgba(15, 46, 94, 0.10)`         |
| hover  | `0 8px 24px rgba(15, 46, 94, 0.13)`         |

### 5.4 Transitions

Toutes les transitions utilisent une duree de **0.18s** avec une courbe **ease**. Ce reglage assure une reactivite percue sans distraction.

### 5.5 Accessibilite

- Contraste minimum **AA** conforme aux WCAG 2.1
- Indicateur `:focus-visible` sur tous les elements interactifs
- Cibles tactiles minimum 44x44px
- Respect de `prefers-reduced-motion` : desactivation des animations pour les utilisateurs qui le demandent
- Navigation complete au clavier

### 5.6 Responsive

L'adaptation suit trois points de rupture :

1. **Desktop** (>= 1024px)
2. **Tablette** (768px - 1023px)
3. **Mobile** (< 768px)

Les memes composants sont utilises a toutes les tailles. La disposition change, pas les composants.

### 5.7 Animations

| Animation    | Duree  | Effet                               |
|-------------|--------|--------------------------------------|
| fadeInView  | 250ms  | Apparition progressive au scroll     |
| hover       | 0.18s  | translateY(-3px) + ombre hover       |

Les animations lourdes (parallax, particles, videos de fond) sont proscrites. La sobriete est privilegiee.

### 5.8 Etats vides

Aucune page ne doit rester visuellement vide. En l'absence de donnees, afficher :

- Une **icone** illustrative
- Un **message** explicatif
- Eventuellement une **action** suggeree

### 5.9 Internationalisation (i18n)

- Langues supportees : **francais (FR)** et **arabe (AR)**
- Plus de **700 cles** de traduction
- Attributs `data-i18n` sur tous les elements textuels
- Basculement dynamique sans rechargement de page
- Support RTL pour l'arabe

---

## 6. Synthese des principes directeurs

1. **Clarte** : chaque ecran a un objectif unique et lisible
2. **Coherence** : memes tokens, memes composants a travers toute la plateforme
3. **Efficacite** : le moins de clics possible pour accomplir une action
4. **Accessibilite** : la plateforme est utilisable par tous
5. **Sobriete** : pas de decoration superflue, chaque element a une fonction
6. **Identite** : l'ancrage mediterraneen et algerois est present sans surcharger

---

*Document genere dans le cadre du projet ALGERNA — v1.0.0-alpha.2*
