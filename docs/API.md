# Référence API — Alger CiviSmart

Base URL : `/api` · Format : JSON · Auth : `Authorization: Bearer <token>`

Rôles : `citoyen`, `agent`, `admin_apc`, `admin_wilaya`, `operateur`.

---

## Auth — `/api/auth`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/register` | — | Inscription citoyen. Body : `telephone`, `motDePasse`, (`nom`, `prenom`, `email`, `communeId`). Renvoie `token` + `utilisateur`. |
| POST | `/login` | — | Connexion. Body : `telephone`, `motDePasse`. Renvoie `token`. |
| GET | `/me` | tous | Profil de l'utilisateur courant. |

---

## Référentiel — `/api/referentiel`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/circonscriptions` | — | Les 13 circonscriptions. |
| GET | `/communes` | — | Communes + circonscription + centre géo. |
| GET | `/operateurs` | — | Netcom, Extranet, SEAAL. |

---

## CiviAdmin (RDV) — `/api/rdv`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/services` | — | Services + famille A/B. |
| GET | `/creneaux?communeId=&serviceId=` | — | Créneaux disponibles. Si service famille A → renvoie `familleA:true` + message de redirection (pas de RDV). |
| POST | `/` | citoyen | Réserver. Body : `creneauId`. Attribue un `numero_ticket`. Anti-surbooking par verrou. |
| GET | `/mes` | citoyen | Mes RDV. |
| PATCH | `/:id/statut` | agent+ | `present` \| `absent` \| `annule` \| `traite`. |

---

## Signalements — `/api/proprete` (CiviSignal) et `/api/eau` (WaterSignal)

**Mêmes endpoints pour les deux**, seul le préfixe change.

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/categories` | — | Catégories du domaine (7 propreté / 7 eau). |
| POST | `/signalements` | citoyen | Créer. `multipart/form-data` : `categorieId`, `lat`, `lng`, (`communeId`, `description`, fichier `photo`). Route vers l'opérateur compétent, +10 points. |
| GET | `/signalements?communeId=&etat=&operateurId=` | agent+ | Liste filtrée. |
| PATCH | `/signalements/:id/etat` | agent+ | `multipart` : `etat` (+ fichier `preuve` à la résolution). États : `recu→transmis→en_intervention→resolu` (ou `rejete`). |
| GET | `/dashboard` | agent+ | Scores par commune, points noirs, délai moyen de réparation (heures). |

Exemple création (eau) :
```bash
curl -X POST http://localhost:3000/api/eau/signalements \
  -H "Authorization: Bearer $TOKEN" \
  -F categorieId=8 -F lat=36.7530 -F lng=3.0590 -F communeId=2 \
  -F description="Grosse fuite au carrefour" -F photo=@fuite.jpg
```

---

## Citoyen Sentinelle — `/api/points`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/moi` | citoyen | Solde + journal des gains. |
| GET | `/classement` | — | Top 20 citoyens actifs. |

---

## Tableau de bord Wilaya — `/api/dashboard`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/icua` | admin_apc / admin_wilaya | Calcul ICUA + détail des 5 dimensions + lecture (civique / à surveiller / prioritaire). |
| GET | `/synthese` | admin_apc / admin_wilaya | Scores et points noirs consolidés propreté + eau. |

---

## Codes d'erreur

| Code | Sens |
|------|------|
| 400 | Données invalides (`details` = erreurs de validation). |
| 401 | Non authentifié / token expiré. |
| 403 | Rôle insuffisant. |
| 404 | Ressource introuvable. |
| 429 | Trop de requêtes (rate limit). |
| 500 | Erreur interne. |

Format : `{ "erreur": "message", "details": {...} }`.
