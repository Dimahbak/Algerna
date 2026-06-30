# Centre d'Intelligence Opérationnelle ALGERNA

## Distinction Supervision / Intelligence

| Aspect | Centre de Supervision | Centre d'Intelligence |
|--------|----------------------|----------------------|
| Question | Que se passe-t-il ? | Pourquoi ? Où agir ? |
| Nature | Monitoring temps réel | Analyse décisionnelle |
| Données | Brutes | Analysées |
| Actions | Constat | Recommandation |

## Facteurs de dégradation

Calculés automatiquement à partir des données réelles :

| Facteur | Seuil | Sévérité |
|---------|-------|----------|
| Temps moyen > délai cible | > 48h | Haute |
| Signalements non clôturés > 2× délai | > 96h | Haute |
| Taux de résolution < 50% | < 50% | Moyenne |
| Missions CAP bloquées | > 0 | Variable |
| Service surchargé | > 20 ouverts | Moyenne |

## Score de priorité

```
priority_score = hors_delai × 3 + ouverts + (100 - ICUA)
```

Utilisé pour classer communes et services par urgence d'intervention.

## Recommandations

Déterministes, pas générées par IA :
1. Traiter les signalements les plus anciens
2. Débloquer les missions CAP
3. Renforcer les communes avec ICUA < seuil
4. Surveiller les services à forte charge

## Alertes intelligentes

| Type | Déclencheur | Sévérité |
|------|-------------|----------|
| Commune critique | ICUA < 30 | Danger |
| CAP bloqué longtemps | > 24h | Warning |
| Signalements très anciens | > 4× délai cible | Danger |

## Configuration

Administrable via ConfigEngine :
- `intel.seuil_saturation_service` (défaut: 20)
- `intel.seuil_commune_critique` (défaut: 50)
- `intel.seuil_baisse_icua` (défaut: 10)
- `intel.delai_cap_bloque_h` (défaut: 24)
- `intel.nb_recommandations` (défaut: 8)

## Limites

- Pas d'IA prédictive
- Pas de corrélation inter-domaines
- Pas de recommandations automatiques envoyées aux agents
- Analyses basées uniquement sur les données internes ALGERNA

## Glossaire

| Terme | Définition |
|-------|-----------|
| **Centre d'Intelligence Opérationnelle** | Couche d'analyse au-dessus de la supervision |
| **Facteur de dégradation** | Indicateur identifiant une cause de mauvaise performance |
| **Priorité recommandée** | Action suggérée basée sur l'analyse des données |
| **Score de priorité** | Score interne pour classer les urgences |
| **Alerte intelligente** | Notification automatique basée sur des seuils configurables |
