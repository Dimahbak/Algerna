-- Migration 009 : Gravité / danger sur les signalements
-- Appliquée le 2026-06-27

-- ═══ UP ═══
CREATE TYPE signal_gravite AS ENUM ('danger_immediat', 'risque_blessure', 'degradation');
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS gravite signal_gravite DEFAULT 'degradation';

-- ═══ DOWN ═══
-- ALTER TABLE signalement DROP COLUMN IF EXISTS gravite;
-- DROP TYPE IF EXISTS signal_gravite;
