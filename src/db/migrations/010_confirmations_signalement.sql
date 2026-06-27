-- Migration 010 : Compteur confirmations (doublons citoyens) sur signalements
-- Appliquée le 2026-06-27

-- ═══ UP ═══
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS nb_confirmations INTEGER NOT NULL DEFAULT 0;

-- ═══ DOWN ═══
-- ALTER TABLE signalement DROP COLUMN IF EXISTS nb_confirmations;
