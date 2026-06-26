-- ============================================================
-- Alger Pass CiviSmart 2030 — Schéma PostgreSQL (v1)
-- Couvre : référentiel territorial, utilisateurs/auth,
--          CiviAdmin (RDV), CiviSignal (propreté), WaterSignal (eau),
--          points Citoyen Sentinelle.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ─── Types énumérés ─────────────────────────────────────────
CREATE TYPE user_role        AS ENUM ('citoyen', 'agent', 'admin_apc', 'admin_wilaya', 'operateur');
CREATE TYPE famille_service  AS ENUM ('A', 'B');   -- A = déjà dématérialisé, B = présence requise
CREATE TYPE rdv_statut       AS ENUM ('reserve', 'present', 'absent', 'annule', 'traite');
CREATE TYPE signal_domaine   AS ENUM ('proprete', 'eau');
CREATE TYPE signal_etat      AS ENUM ('recu', 'transmis', 'en_intervention', 'resolu', 'rejete');
CREATE TYPE signal_criticite AS ENUM ('basse', 'moyenne', 'haute');

-- ============================================================
-- 1. RÉFÉRENTIEL TERRITORIAL
-- ============================================================
CREATE TABLE circonscription (
  id          SMALLINT PRIMARY KEY,
  nom         TEXT NOT NULL
);

CREATE TABLE commune (
  id                  SERIAL PRIMARY KEY,
  nom                 TEXT NOT NULL,
  circonscription_id  SMALLINT NOT NULL REFERENCES circonscription(id),
  centre_lat          DOUBLE PRECISION,
  centre_lng          DOUBLE PRECISION
);

-- Opérateurs publics (Netcom, Extranet pour déchets ; SEAAL pour eau)
CREATE TABLE operateur (
  id        SERIAL PRIMARY KEY,
  nom       TEXT NOT NULL,
  domaine   signal_domaine NOT NULL,
  contact   TEXT
);

-- Affectation : quelle commune est servie par quel opérateur, par domaine
CREATE TABLE operateur_perimetre (
  operateur_id  INT NOT NULL REFERENCES operateur(id),
  commune_id    INT NOT NULL REFERENCES commune(id),
  PRIMARY KEY (operateur_id, commune_id)
);

-- ============================================================
-- 2. UTILISATEURS & AUTHENTIFICATION
-- ============================================================
CREATE TABLE utilisateur (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telephone       TEXT UNIQUE NOT NULL,            -- identifiant principal (mobile)
  email           TEXT UNIQUE,
  nom             TEXT,
  prenom          TEXT,
  mot_de_passe    TEXT NOT NULL,                   -- hash bcrypt
  role            user_role NOT NULL DEFAULT 'citoyen',
  commune_id      INT REFERENCES commune(id),      -- commune de résidence (citoyen) ou d'affectation (agent)
  operateur_id    INT REFERENCES operateur(id),    -- si role = 'operateur'
  points          INT NOT NULL DEFAULT 0,          -- score Citoyen Sentinelle (dénormalisé, voir module points)
  actif           BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_utilisateur_role ON utilisateur(role);

-- ============================================================
-- 3. CIVIADMIN — RENDEZ-VOUS & FILE VIRTUELLE
-- ============================================================
CREATE TABLE service (
  id          SERIAL PRIMARY KEY,
  nom         TEXT NOT NULL,                       -- ex : "Extrait de naissance", "Légalisation"
  famille     famille_service NOT NULL,            -- A : redirigé ; B : présence requise
  duree_min   INT NOT NULL DEFAULT 15              -- durée moyenne d'un créneau
);

-- Créneaux ouverts par une commune pour un service
CREATE TABLE creneau (
  id           SERIAL PRIMARY KEY,
  commune_id   INT NOT NULL REFERENCES commune(id),
  service_id   INT NOT NULL REFERENCES service(id),
  debut        TIMESTAMPTZ NOT NULL,
  capacite     INT NOT NULL DEFAULT 1,             -- nb de RDV simultanés possibles
  UNIQUE (commune_id, service_id, debut)
);
CREATE INDEX idx_creneau_lookup ON creneau(commune_id, service_id, debut);

CREATE TABLE rdv (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creneau_id    INT NOT NULL REFERENCES creneau(id),
  citoyen_id    UUID NOT NULL REFERENCES utilisateur(id),
  numero_ticket INT NOT NULL,                      -- numéro de passage (file virtuelle)
  statut        rdv_statut NOT NULL DEFAULT 'reserve',
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT now(),
  maj_le        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (creneau_id, numero_ticket)
);
CREATE INDEX idx_rdv_citoyen ON rdv(citoyen_id);
CREATE INDEX idx_rdv_statut  ON rdv(statut);

-- ============================================================
-- 4. SIGNALEMENTS — SOCLE COMMUN (propreté + eau)
--    Un seul modèle, discriminé par 'domaine'. WaterSignal et
--    CiviSignal partagent cette table : ~90% de code commun.
-- ============================================================
CREATE TABLE categorie_signal (
  id          SERIAL PRIMARY KEY,
  domaine     signal_domaine NOT NULL,
  libelle     TEXT NOT NULL,
  criticite   signal_criticite NOT NULL DEFAULT 'moyenne'
);
CREATE INDEX idx_categorie_domaine ON categorie_signal(domaine);

CREATE TABLE signalement (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT UNIQUE NOT NULL,            -- ex : "EAU-LX9F3A" / "PRO-K28D1Z"
  domaine         signal_domaine NOT NULL,
  categorie_id    INT NOT NULL REFERENCES categorie_signal(id),
  citoyen_id      UUID REFERENCES utilisateur(id),
  commune_id      INT REFERENCES commune(id),
  operateur_id    INT REFERENCES operateur(id),    -- opérateur routé (résolu à la création)
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  description     TEXT,
  photo_path      TEXT,                            -- chemin du fichier (upload), pas de base64 en BDD
  etat            signal_etat NOT NULL DEFAULT 'recu',
  preuve_path     TEXT,                            -- photo de résolution par l'agent
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolu_le       TIMESTAMPTZ
);
CREATE INDEX idx_signal_domaine_etat ON signalement(domaine, etat);
CREATE INDEX idx_signal_commune      ON signalement(commune_id);
CREATE INDEX idx_signal_geo          ON signalement(lat, lng);

-- Historique des transitions d'état (horodatage = base du calcul des délais SLA)
CREATE TABLE signalement_historique (
  id              BIGSERIAL PRIMARY KEY,
  signalement_id  UUID NOT NULL REFERENCES signalement(id) ON DELETE CASCADE,
  etat            signal_etat NOT NULL,
  par_utilisateur UUID REFERENCES utilisateur(id),
  le              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_histo_signal ON signalement_historique(signalement_id);

-- ============================================================
-- 5. POINTS — CITOYEN SENTINELLE (journal des gains)
-- ============================================================
CREATE TABLE points_journal (
  id          BIGSERIAL PRIMARY KEY,
  citoyen_id  UUID NOT NULL REFERENCES utilisateur(id),
  delta       INT NOT NULL,                        -- +10 à la création d'un signalement, etc.
  motif       TEXT NOT NULL,
  ref_type    TEXT,                                -- 'signalement' | 'rdv' | ...
  ref_id      TEXT,
  le          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_points_citoyen ON points_journal(citoyen_id);

-- ============================================================
-- 6. ICUA — instantanés de l'indice (calcul périodique)
-- ============================================================
CREATE TABLE icua_snapshot (
  id              BIGSERIAL PRIMARY KEY,
  commune_id      INT REFERENCES commune(id),      -- NULL = global wilaya
  date_calcul     DATE NOT NULL,
  proprete        NUMERIC(5,2),
  reactivite      NUMERIC(5,2),
  vivre_ensemble  NUMERIC(5,2),
  fluidite        NUMERIC(5,2),
  engagement      NUMERIC(5,2),
  icua_global     NUMERIC(5,2),
  UNIQUE (commune_id, date_calcul)
);
