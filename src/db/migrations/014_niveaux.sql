-- Migration 014 : Niveaux du Programme de Citoyenneté Active
-- Appliquée le 2026-06-27

-- ═══ UP ═══

CREATE TABLE niveau (
  id               SERIAL PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  nom              TEXT NOT NULL,
  seuil_points     INTEGER NOT NULL DEFAULT 0,
  seuil_pertinence INTEGER NOT NULL DEFAULT 0  -- % de signalements validés (résolus)
);

INSERT INTO niveau (code, nom, seuil_points, seuil_pertinence) VALUES
  ('citoyen',      'Citoyen',                0,   0),
  ('contributeur', 'Contributeur',          50,  20),
  ('sentinelle',   'Sentinelle',           200,  30),
  ('ambassadeur',  'Ambassadeur',          500,  40),
  ('referent',     'Référent de quartier', 1000,  50);

ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS niveau_id INTEGER REFERENCES niveau(id) DEFAULT 1;

-- ═══ DOWN ═══
-- ALTER TABLE utilisateur DROP COLUMN IF EXISTS niveau_id;
-- DROP TABLE IF EXISTS niveau;
