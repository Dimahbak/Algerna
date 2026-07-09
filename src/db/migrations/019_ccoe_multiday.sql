-- Migration 019 : CCOE — événements multi-jours avec plages horaires
-- date_evenement → date_debut, ajout date_fin, heure → heure_debut, ajout heure_fin
-- Appliquée le 2026-07-09

-- 1. Rename date_evenement → date_debut
ALTER TABLE evenement RENAME COLUMN date_evenement TO date_debut;

-- 2. Rename heure → heure_debut
ALTER TABLE evenement RENAME COLUMN heure TO heure_debut;

-- 3. Add date_fin and heure_fin (both optional)
ALTER TABLE evenement ADD COLUMN IF NOT EXISTS date_fin date;
ALTER TABLE evenement ADD COLUMN IF NOT EXISTS heure_fin time;

-- 4. Add check constraint: date_fin >= date_debut when provided
ALTER TABLE evenement ADD CONSTRAINT chk_dates CHECK (date_fin IS NULL OR date_fin >= date_debut);

-- 5. Rename index
ALTER INDEX IF EXISTS idx_evenement_date RENAME TO idx_evenement_date_debut;

-- 6. Record migration
INSERT INTO _migrations (nom) VALUES ('019_ccoe_multiday.sql');
