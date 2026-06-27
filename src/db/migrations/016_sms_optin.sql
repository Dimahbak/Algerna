-- Migration 016 : Opt-in SMS pour les notifications
-- Appliquée le 2026-06-27

-- ═══ UP ═══
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS notifications_sms BOOLEAN NOT NULL DEFAULT FALSE;

-- ═══ DOWN ═══
-- ALTER TABLE utilisateur DROP COLUMN IF EXISTS notifications_sms;
