-- Migration 020 : CCOE — colonne transmis_le sur chantier
-- Appliquée le 2026-07-09

ALTER TABLE chantier ADD COLUMN IF NOT EXISTS transmis_le timestamptz;
ALTER TABLE chantier ADD COLUMN IF NOT EXISTS transmis_par uuid REFERENCES utilisateur(id);

INSERT INTO _migrations (nom) VALUES ('020_ccoe_transmis.sql');
