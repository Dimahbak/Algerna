-- Migration 003 : Espaces Verts — Tables parc + IQEP + parc_id sur signalement
-- Appliquée le 2026-06-26

-- ═══ UP ═══

CREATE TABLE IF NOT EXISTS parc (
  id         SERIAL PRIMARY KEY,
  nom        TEXT NOT NULL,
  commune_id INTEGER REFERENCES commune(id),
  lat        DOUBLE PRECISION,
  lng        DOUBLE PRECISION,
  superficie REAL,
  actif      BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iqep (
  parc_id          INTEGER PRIMARY KEY REFERENCES parc(id) ON DELETE CASCADE,
  note_auto        SMALLINT NOT NULL DEFAULT 100 CHECK (note_auto >= 0 AND note_auto <= 100),
  note_manuelle    SMALLINT CHECK (note_manuelle IS NULL OR (note_manuelle >= 0 AND note_manuelle <= 100)),
  sc_espaces_verts SMALLINT CHECK (sc_espaces_verts IS NULL OR (sc_espaces_verts >= 0 AND sc_espaces_verts <= 100)),
  sc_equipements   SMALLINT CHECK (sc_equipements IS NULL OR (sc_equipements >= 0 AND sc_equipements <= 100)),
  sc_proprete      SMALLINT CHECK (sc_proprete IS NULL OR (sc_proprete >= 0 AND sc_proprete <= 100)),
  sc_eclairage     SMALLINT CHECK (sc_eclairage IS NULL OR (sc_eclairage >= 0 AND sc_eclairage <= 100)),
  sc_securite      SMALLINT CHECK (sc_securite IS NULL OR (sc_securite >= 0 AND sc_securite <= 100)),
  sc_satisfaction  SMALLINT CHECK (sc_satisfaction IS NULL OR (sc_satisfaction >= 0 AND sc_satisfaction <= 100)),
  maj_le           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_par          UUID REFERENCES utilisateur(id)
);

-- Champ optionnel parc_id sur signalement (rattachement espaces verts)
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS parc_id INTEGER REFERENCES parc(id);

-- Seed : 8 parcs emblematiques d'Alger
INSERT INTO parc (nom, commune_id, lat, lng, superficie) VALUES
  ('Jardin d''Essai du Hamma',          5,  36.7468, 3.0698, 32),
  ('Parc de la Liberté (Galland)',      10,  36.7565, 3.0432,  8),
  ('Parc Dounia',                       50,  36.714,  3.216,  15),
  ('Bois des Arcades',                   9,  36.775,  2.98,   12),
  ('Parc Zoologique de Ben Aknoun',     17,  36.76,   3.01,   10),
  ('Jardin public de Bir Mourad Raïs',   9,  36.737,  3.035,   3),
  ('Parc des Grands Vents',             16,  36.753,  2.974,   6),
  ('Square Port-Saïd',                   1,  36.761,  3.056,   2)
ON CONFLICT DO NOTHING;

-- ═══ DOWN ═══
-- ALTER TABLE signalement DROP COLUMN IF EXISTS parc_id;
-- DROP TABLE IF EXISTS iqep;
-- DROP TABLE IF EXISTS parc;
