# ICUA — Indice Citoyen Urbain ALGERNA

## Définition

L'ICUA mesure la qualité globale du fonctionnement des services publics de la Wilaya d'Alger, observée à travers la plateforme ALGERNA.

Score : **0 à 100**

## Formule V1

```
ICUA = Σ (Score_composante × Pondération_composante)
```

## Composantes

| Composante | Pondération | Calcul |
|-----------|-------------|--------|
| **Engagement de Service** | 40% | % signalements résolus dans le délai cible |
| **Taux de résolution** | 20% | % signalements résolus / total |
| **Temps moyen de traitement** | 15% | Score inversé (plus rapide = meilleur) |
| **Activité CAP** | 10% | % missions CAP terminées / créées |
| **Satisfaction citoyenne** | 10% | Moyenne des confirmations citoyennes |
| **Communication institutionnelle** | 5% | Nombre de communiqués publiés (semaine) |

## Santé opérationnelle

Score complémentaire calculé :

```
Santé = Engagement × 0.5 + Résolution × 0.3 + Temps × 0.2
```

## Niveaux

| Score | Niveau | Libellé |
|-------|--------|---------|
| 90-100 | Excellent | Excellent |
| 75-89 | Bon | Bon fonctionnement |
| 60-74 | Vigilance | Vigilance |
| < 60 | Critique | Critique |

## Configuration

Toutes les pondérations et seuils sont administrables via :
- `icua.poids.engagement` (défaut: 40)
- `icua.poids.resolution` (défaut: 20)
- `icua.poids.temps` (défaut: 15)
- `icua.poids.cap` (défaut: 10)
- `icua.poids.satisfaction` (défaut: 10)
- `icua.poids.communication` (défaut: 5)
- `icua.seuil.excellent` (défaut: 90)
- `icua.seuil.bon` (défaut: 75)
- `icua.seuil.vigilance` (défaut: 60)

## Gouvernance

- Les pondérations ne peuvent être modifiées que par un administrateur Wilaya.
- Toute modification est auditée.
- L'historique des scores est conservé indéfiniment.

## Glossaire

| Terme | Définition |
|-------|-----------|
| **ICUA** | Indice Citoyen Urbain ALGERNA |
| **Santé opérationnelle** | Score synthétique du fonctionnement quotidien |
| **Engagement de Service** | Délai cible de traitement (terme public pour SLA) |
| **Pondération** | Poids relatif d'une composante dans le score |
| **Score composite** | Score calculé à partir de plusieurs indicateurs pondérés |
| **Contribution** | Part d'une composante dans le score final |
| **Tendance** | Évolution du score sur une période donnée |
