-- Migration 059 : champ urgence_wali distinct sur signalement
-- L'escalade Urgence Wali ne modifie pas la gravité métier du dossier
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS urgence_wali BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS urgence_wali_le TIMESTAMPTZ;
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS urgence_wali_par UUID REFERENCES utilisateur(id);
