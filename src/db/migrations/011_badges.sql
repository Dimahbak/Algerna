-- Migration 011 : Badges de gamification
-- Appliquée le 2026-06-27

-- ═══ UP ═══

CREATE TABLE badge (
  id              SERIAL PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  nom             TEXT NOT NULL,
  description     TEXT,
  icone           TEXT DEFAULT '🏅',
  condition_type  TEXT NOT NULL,   -- 'signalements_total', 'resolus', 'commune', 'famille_eau', 'famille_espaces_verts'
  condition_seuil INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE utilisateur_badge (
  utilisateur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  badge_id       INTEGER NOT NULL REFERENCES badge(id) ON DELETE CASCADE,
  obtenu_le      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (utilisateur_id, badge_id)
);

-- Seed 5 badges
INSERT INTO badge (code, nom, description, icone, condition_type, condition_seuil) VALUES
  ('premier_signalement', 'Premier signalement', 'Vous avez créé votre premier signalement.', '🎯', 'signalements_total', 1),
  ('dix_resolus',         '10 problèmes résolus', '10 de vos signalements ont été résolus.', '✅', 'resolus', 10),
  ('sentinelle_quartier', 'Sentinelle du quartier', '20 signalements dans la même commune.', '🛡️', 'commune', 20),
  ('protecteur_parcs',    'Protecteur des parcs', '5 signalements espaces verts.', '🌳', 'famille_espaces_verts', 5),
  ('ambassadeur_eau',     'Ambassadeur de l''eau', '5 signalements liés à l''eau.', '💧', 'famille_eau', 5);

-- ═══ DOWN ═══
-- DROP TABLE IF EXISTS utilisateur_badge;
-- DROP TABLE IF EXISTS badge;
