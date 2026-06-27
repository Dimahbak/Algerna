-- Migration 015 : Avantages symboliques par niveau
-- Appliquée le 2026-06-27

-- ═══ UP ═══

CREATE TABLE avantage_symbolique (
  id              SERIAL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  nom             TEXT NOT NULL,
  description     TEXT,
  icone           TEXT DEFAULT '🎖️',
  niveau_requis_id INTEGER NOT NULL REFERENCES niveau(id)
);

INSERT INTO avantage_symbolique (code, nom, description, icone, niveau_requis_id) VALUES
  ('diplome',       'Diplôme citoyen',                'Diplôme officiel de citoyenneté active.',                      '📜', 3),
  ('inauguration',  'Invitation à une inauguration',  'Invitation à une cérémonie officielle de la Wilaya.',          '🏛️', 4),
  ('photo_off',     'Photo officielle',               'Séance photo avec un représentant institutionnel.',            '📸', 4),
  ('medaille',      'Médaille citoyenne',             'Distinction honorifique de la Wilaya d''Alger.',               '🏅', 5),
  ('rencontre',     'Rencontre institutionnelle',     'Échange avec les responsables de la gouvernance territoriale.', '🤝', 5);

-- ═══ DOWN ═══
-- DROP TABLE IF EXISTS avantage_symbolique;
