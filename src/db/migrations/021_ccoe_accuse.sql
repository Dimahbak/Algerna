-- Migration 021 : CCOE — accusé de réception des ordres de mission
-- Colonnes vu_le/vu_par + accuse_le/accuse_par sur chantier
-- Appliquée le 2026-07-09

ALTER TABLE chantier ADD COLUMN IF NOT EXISTS vu_le timestamptz;
ALTER TABLE chantier ADD COLUMN IF NOT EXISTS vu_par uuid REFERENCES utilisateur(id);
ALTER TABLE chantier ADD COLUMN IF NOT EXISTS accuse_le timestamptz;
ALTER TABLE chantier ADD COLUMN IF NOT EXISTS accuse_par uuid REFERENCES utilisateur(id);

INSERT INTO _migrations (nom) VALUES ('021_ccoe_accuse.sql');
