-- Migration 004 : CAP (Corps des Agents de Proximité) + CiviPark (Stationnement)
-- Appliquée le 2026-06-26

-- ═══ UP ═══

-- ──────────────────────────────────
-- MODULE CAP
-- ──────────────────────────────────

-- Spécialisations agents CAP (modifiable dans le temps)
CREATE TYPE cap_specialisation AS ENUM (
  'stationnement', 'jeunesse', 'sport', 'general'
);

-- Table agent CAP : profil étendu rattaché à un utilisateur (role agent/operateur)
CREATE TABLE cap_agent (
  id            SERIAL PRIMARY KEY,
  utilisateur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  specialisation cap_specialisation NOT NULL DEFAULT 'general',
  commune_id    INTEGER REFERENCES commune(id),
  secteur       TEXT,
  actif         BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(utilisateur_id)
);

-- Interventions CAP
CREATE TYPE cap_type_intervention AS ENUM (
  'orientation', 'mediation', 'constat', 'accompagnement', 'autre'
);

CREATE TYPE cap_priorite AS ENUM ('basse', 'normale', 'haute', 'urgente');

CREATE TABLE cap_intervention (
  id            SERIAL PRIMARY KEY,
  reference     TEXT NOT NULL UNIQUE,
  agent_id      INTEGER NOT NULL REFERENCES cap_agent(id),
  type          cap_type_intervention NOT NULL,
  priorite      cap_priorite NOT NULL DEFAULT 'normale',
  description   TEXT NOT NULL,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  commune_id    INTEGER REFERENCES commune(id),
  citoyen_id    UUID REFERENCES utilisateur(id),
  signalement_id UUID REFERENCES signalement(id),
  -- Alerte superviseur
  alerte_superviseur BOOLEAN NOT NULL DEFAULT FALSE,
  motif_alerte  TEXT,
  -- Suivi
  etat          TEXT NOT NULL DEFAULT 'en_cours'
                CHECK (etat IN ('en_cours','termine','annule')),
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  termine_le    TIMESTAMPTZ,
  notes         TEXT
);

-- ──────────────────────────────────
-- MODULE CIVIPARK
-- ──────────────────────────────────

-- Types de zone
CREATE TYPE parking_zone_type AS ENUM ('blanche', 'bleue', 'jaune', 'rouge');

CREATE TABLE parking_zone (
  id            SERIAL PRIMARY KEY,
  nom           TEXT NOT NULL,
  commune_id    INTEGER REFERENCES commune(id),
  type          parking_zone_type NOT NULL DEFAULT 'blanche',
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  places_total  INTEGER,
  tarif_horaire NUMERIC(6,2),
  -- Sous-types de places (comptages optionnels)
  places_resident INTEGER,
  places_pmr      INTEGER,
  places_livraison INTEGER,
  places_transit   INTEGER,
  actif         BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Carte résident
CREATE TYPE carte_resident_statut AS ENUM ('active', 'expiree', 'revoquee');

CREATE TABLE carte_resident (
  id            SERIAL PRIMARY KEY,
  citoyen_id    UUID NOT NULL REFERENCES utilisateur(id),
  commune_id    INTEGER NOT NULL REFERENCES commune(id),
  plaque        TEXT,
  justif_residence BOOLEAN NOT NULL DEFAULT FALSE,
  statut        carte_resident_statut NOT NULL DEFAULT 'active',
  valide_jusqu_a DATE NOT NULL,
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Encaissement tracé (dispositif souple)
CREATE TYPE type_encaisseur AS ENUM (
  'kiosque', 'buraliste', 'agent_tpe', 'mobile', 'autre'
);
CREATE TYPE justificatif_type AS ENUM (
  'ticket', 'bon', 'facture', 'recu_mobile'
);

CREATE TABLE parking_encaissement (
  id                SERIAL PRIMARY KEY,
  parking_zone_id   INTEGER NOT NULL REFERENCES parking_zone(id),
  montant           NUMERIC(8,2) NOT NULL,
  duree_minutes     INTEGER,
  date_heure        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Dispositif d'encaissement (souple, la Wilaya choisit)
  type_encaisseur   type_encaisseur NOT NULL DEFAULT 'autre',
  encaisseur_ref    TEXT,
  -- Justificatif (traçabilité anti-hogra)
  justificatif_type justificatif_type NOT NULL DEFAULT 'ticket',
  justificatif_numero TEXT NOT NULL,
  -- Compteur séquentiel par zone pour numérotation tickets
  numero_sequence   INTEGER NOT NULL,
  -- Véhicule / citoyen (optionnels)
  plaque            TEXT,
  citoyen_id        UUID REFERENCES utilisateur(id),
  cree_le           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Séquence de tickets par zone (compteur)
CREATE SEQUENCE parking_ticket_seq START 1;

-- Points d'extension (non activés, branchables plus tard)
CREATE TABLE parking_extension (
  id            SERIAL PRIMARY KEY,
  parking_zone_id INTEGER NOT NULL REFERENCES parking_zone(id),
  type_extension TEXT NOT NULL
                 CHECK (type_extension IN ('horodateur','capteur_place','anpr','paiement_mobile')),
  identifiant   TEXT,
  actif         BOOLEAN NOT NULL DEFAULT FALSE,
  config_json   JSONB DEFAULT '{}',
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lien optionnel CAP ↔ CiviPark (rattachement agent)
ALTER TABLE cap_agent ADD COLUMN parking_zone_id INTEGER REFERENCES parking_zone(id);

-- ═══ SEED DÉMO ═══

-- Zones pilotes (2 communes : Alger-Centre + Hussein Dey)
INSERT INTO parking_zone (nom, commune_id, type, lat, lng, places_total, tarif_horaire, places_pmr, places_transit) VALUES
  ('Rue Didouche Mourad',     1, 'bleue',   36.7623, 3.0580, 40, 50.00, 2, 38),
  ('Place des Martyrs',       1, 'rouge',   36.7867, 3.0607, 0,  NULL,  0, 0),
  ('Bd Amirouche',            1, 'bleue',   36.7700, 3.0575, 30, 50.00, 2, 28),
  ('Rue Hassiba Ben Bouali',  1, 'jaune',   36.7580, 3.0540, 10, 30.00, 0, 0),
  ('Stade 20 Août — abords',  5, 'blanche', 36.7440, 3.0730, 60, NULL,  3, 57),
  ('Gare Hussein Dey',        5, 'bleue',   36.7410, 3.0770, 25, 40.00, 2, 23);

-- ═══ DOWN ═══
-- DROP TABLE IF EXISTS parking_extension;
-- DROP TABLE IF EXISTS parking_encaissement;
-- DROP TABLE IF EXISTS carte_resident;
-- DROP TABLE IF EXISTS parking_zone;
-- DROP TABLE IF EXISTS cap_intervention;
-- DROP TABLE IF EXISTS cap_agent;
-- DROP TYPE IF EXISTS justificatif_type;
-- DROP TYPE IF EXISTS type_encaisseur;
-- DROP TYPE IF EXISTS carte_resident_statut;
-- DROP TYPE IF EXISTS parking_zone_type;
-- DROP TYPE IF EXISTS cap_priorite;
-- DROP TYPE IF EXISTS cap_type_intervention;
-- DROP TYPE IF EXISTS cap_specialisation;
