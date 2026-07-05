# Recette institutionnelle — Scenarios RC1

**Version** : v1.0.0-rc1
**Date** : 2 juillet 2026

---

## Scenario 1 — Lampadaire en panne

| Etape | Acteur | Action | Resultat |
|---|---|---|---|
| 1 | Citoyen | Signale "Lampadaire en panne" + photo + localisation | Signalement cree, etat "recu" |
| 2 | Agent de reception | Ouvre le drawer, verifie la photo, qualifie | Categorie : Eclairage public |
| 3 | Agent de reception | Clique "Transmettre" | Dossier transmis au service Eclairage |
| 4 | Responsable — Eclairage | Recoit le dossier dans "A traiter" | Organise l'intervention |
| 5 | Responsable — Eclairage | Clique "Intervention terminee" + resume | Retour transmis a la Wilaya |
| — | Centre Operationnel *(supervision)* | Voit le retour dans la situation operationnelle | Controle les delais |
| 7 | Citoyen | Recoit notification "Votre signalement est resolu" | Boucle fermee |

**CAP** : non necessaire. Intervention directe du service.

---

## Scenario 2 — Fuite d'eau

| Etape | Acteur | Action | Resultat |
|---|---|---|---|
| 1 | Citoyen | Signale "Fuite d'eau" + photo + urgence haute | Signalement recu |
| 2 | Agent de reception | Verifie, qualifie, note l'urgence haute | Categorie : Eau |
| 3 | Agent de reception | Clique "Transmettre" | Dossier urgent transmis au service Eau |
| 4 | Responsable — Eau | Recoit le dossier urgent | Mobilise une equipe |
| 5 | Responsable — Eau | Intervention terminee + resume "Fuite colmatee" | Retour a la Wilaya |
| — | Centre Operationnel *(supervision)* | Surveille le delai (urgence haute = SLA court) | Alerte si hors delai |
| 7 | Citoyen | Informe de la resolution | Boucle fermee |

**CAP** : non necessaire.

---

## Scenario 3 — Depot sauvage

| Etape | Acteur | Action | Resultat |
|---|---|---|---|
| 1 | Citoyen | Signale "Depot sauvage" + photo | Signalement recu |
| 2 | Agent de reception | Doute sur la localisation exacte | Demande intervention CAP |
| 3 | Agent de reception | Clique "Intervention CAP" → type "Verification prealable" | Intervention creee |
| 4 | Agent de Proximite | Accepte, se deplace, constate | Confirme le depot, photos complementaires |
| 5 | Agent de Proximite | Transmet le rapport : "Confirme, 3m3 de dechets, acces facile" | Rapport transmis a la Wilaya |
| 6 | Agent de reception | Recoit le retour, transmet au service Proprete | Dossier enrichi transmis |
| 7 | Responsable — Proprete | Organise l'enlevement | Intervention terminee |
| 8 | Citoyen | Informe | Boucle fermee |

**CAP** : necessaire pour verification prealable.

---

## Scenario 4 — Batiment dangereux

| Etape | Acteur | Action | Resultat |
|---|---|---|---|
| 1 | Citoyen | Signale "Batiment dangereux" + urgence haute | Signalement recu |
| 2 | Agent de reception | Situation grave → demande intervention CAP "Verification prealable" | Intervention urgente creee |
| 3 | Agent de Proximite | Se deplace en urgence, constate le danger | Rapport : "Confirme, risque effondrement, perimetre a securiser" |
| 4 | Agent de reception | Transmet au service competent (Urbanisme ou Protection civile) | Dossier prioritaire |
| — | Centre Operationnel *(supervision)* | Surveille activement | Alerte critique visible |
| — | Pilotage strategique *(decision)* | Voit l'alerte 🔴, peut decider un communique | Communique si necessaire |
| 7 | Responsable service | Intervient, securise | Intervention terminee |
| 8 | Citoyen | Informe | Boucle fermee |

**CAP** : necessaire pour evaluation urgente.

---

## Scenario 5 — Stationnement genant

| Etape | Acteur | Action | Resultat |
|---|---|---|---|
| 1 | Citoyen | Signale "Vehicule bloquant le trottoir" | Signalement recu |
| 2 | Agent de reception | Qualifie → categorie Circulation | Transmet au service Mobilite |
| 3 | Responsable — Mobilite | Organise la verbalisation ou l'enlevement | Intervention terminee |
| 4 | Citoyen | Informe | Boucle fermee |

**CAP** : non necessaire. Sauf si l'agent de reception souhaite une verification prealable.

---

## Scenario 6 — Arbre tombe

| Etape | Acteur | Action | Resultat |
|---|---|---|---|
| 1 | Citoyen | Signale "Arbre tombe sur la chaussee" + urgence haute | Signalement recu |
| 2 | Agent de reception | Urgence haute constatee, transmet immediatement | Service Espaces verts |
| 3 | Agent de reception | Demande egalement une intervention CAP "Assistance terrain" | L'agent CAP peut securiser en attendant |
| 4 | Agent de Proximite | Se deplace, securise le perimetre, assiste les usagers | Rapport transmis |
| 5 | Responsable — Espaces verts | Envoie une equipe pour deblayer | Intervention terminee |
| — | Centre Operationnel *(supervision)* | Surveille la situation (urgence haute) | Controle des delais |
| 7 | Citoyen | Informe | Boucle fermee |

**CAP** : necessaire pour assistance terrain en attendant le service.

---

## Synthese des scenarios

| Scenario | CAP necessaire | Type intervention | Service destinataire |
|---|---|---|---|
| Lampadaire en panne | Non | — | Eclairage public |
| Fuite d'eau | Non | — | Eau |
| Depot sauvage | Oui | Verification prealable | Proprete |
| Batiment dangereux | Oui | Verification prealable | Urbanisme / Protection civile |
| Stationnement genant | Non (optionnel) | — | Mobilite |
| Arbre tombe | Oui | Assistance terrain | Espaces verts |

Dans tous les cas, aucun acteur ne sort de son perimetre. Le citoyen ne voit que : Signale → En cours → Resolu.

---

*Document officiel — Gel RC1 — 2 juillet 2026*
