-- Migration 012 : Messages d'impact personnalisés (résolution signalements)
-- Appliquée le 2026-06-27

-- ═══ UP ═══
CREATE TABLE impact_message (
  id              SERIAL PRIMARY KEY,
  citoyen_id      UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  signalement_id  UUID NOT NULL REFERENCES signalement(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(signalement_id)  -- un message par signalement résolu
);
CREATE INDEX idx_impact_citoyen ON impact_message(citoyen_id);

-- ═══ DOWN ═══
-- DROP TABLE IF EXISTS impact_message;
