-- 030_epic_codify.sql
-- Objectif : codifier la structure existante de la table epic
-- qui a été créée manuellement avant le système de migrations.
-- Cette migration est un FILET DE SÉCURITÉ pour la reconstruction.
-- Elle ne modifie ni n'ajoute rien si la table existe déjà.

-- ═══ A. Enums (reproduction à l'identique) ═══

DO $$ BEGIN
  CREATE TYPE epic_categorie AS ENUM (
    'environnement_nettoiement',
    'voirie_eclairage_urbanisme',
    'logement_infrastructure',
    'eau_energie',
    'services_transports',
    'social_artisanat',
    'culture_medias_tourisme'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE epic_type AS ENUM ('local', 'national');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══ B. Table epic (reproduction à l'identique) ═══
-- Note : si la table a été créée par postgres, exécuter au préalable :
--   ALTER TABLE epic OWNER TO civismart;
--   ALTER SEQUENCE epic_id_seq OWNER TO civismart;

CREATE TABLE IF NOT EXISTS epic (
  id          SERIAL PRIMARY KEY,
  sigle       TEXT NOT NULL UNIQUE,
  nom         TEXT NOT NULL,
  categorie   epic_categorie NOT NULL,
  type        epic_type NOT NULL DEFAULT 'local',
  description TEXT,
  actif       BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══ C. Table de correspondance epic ↔ organisations ═══
-- Remplace le ORG_EPIC_MAP hardcodé dans signaler/index.js
-- pour les NOUVEAUX EPIC. Le MAP existant reste intact (pas de refonte du routage).

CREATE TABLE IF NOT EXISTS epic_organisation_map (
  epic_id         INTEGER NOT NULL REFERENCES epic(id) ON DELETE CASCADE,
  organisation_id INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  PRIMARY KEY (epic_id, organisation_id)
);

-- Seed avec les valeurs actuelles du ORG_EPIC_MAP
INSERT INTO epic_organisation_map (organisation_id, epic_id) VALUES
  (5,  1),   -- Direction Propreté → DIR-PRO Centre
  (5,  2),   -- Direction Propreté → DIR-PRO Périphérie
  (6,  7),   -- Direction Voirie → DIR-VOR
  (6,  30),  -- Direction Voirie → DIR-CIRC
  (16, 31),  -- Gestion Parkings → DIR-PARK
  (18, 17),  -- Direction Eau → DIR-EAU
  (13, 3),   -- Direction Environnement → DIR-EVT
  (13, 4),   -- Direction Environnement → DIR-OUED
  (23, 8)    -- Direction Éclairage → DIR-ECL
ON CONFLICT DO NOTHING;

-- ═══ D. Rendre categorie nullable ═══
-- Permet de créer des EPIC « sans signalement citoyen »
-- (foncier, abattoirs, etc.) qui n'ont pas de famille de signalement.

ALTER TABLE epic ALTER COLUMN categorie DROP NOT NULL;
