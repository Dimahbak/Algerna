-- Migration 013 : Barème de points ajustable + dégressivité anti-spam
-- Appliquée le 2026-06-27

-- ═══ UP ═══

CREATE TABLE bareme_points (
  code        TEXT PRIMARY KEY,
  delta       INTEGER NOT NULL,
  description TEXT,
  plafond_jour INTEGER  -- NULL = pas de plafond ; sinon nombre max d'attributions/jour
);

INSERT INTO bareme_points (code, delta, description, plafond_jour) VALUES
  ('creation',              5,  'Signalement créé',                          5),
  ('photo',                 5,  'Photo exploitable jointe',                  5),
  ('validation_resolution', 20, 'Signalement validé après intervention',     NULL),
  ('participation_enquete', 15, 'Participation à une enquête / consultation', NULL),
  ('parrainage',            20, 'Parrainage d''un nouveau citoyen',          3);

-- Compteur quotidien de créations pour la dégressivité
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS creations_today INTEGER NOT NULL DEFAULT 0;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS creations_today_date DATE DEFAULT CURRENT_DATE;

-- ═══ DOWN ═══
-- ALTER TABLE utilisateur DROP COLUMN IF EXISTS creations_today_date;
-- ALTER TABLE utilisateur DROP COLUMN IF EXISTS creations_today;
-- DROP TABLE IF EXISTS bareme_points;
