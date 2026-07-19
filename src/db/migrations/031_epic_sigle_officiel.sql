-- 031_epic_sigle_officiel.sql
-- Ajoute les champs descriptifs pour le sigle et le nom officiels des EPIC.
-- Le champ sigle (interne, ex. DIR-VOR) reste la clé technique.
-- sigle_officiel porte le sigle institutionnel (ex. ASROUT).

ALTER TABLE epic ADD COLUMN IF NOT EXISTS sigle_officiel TEXT;
ALTER TABLE epic ADD COLUMN IF NOT EXISTS nom_officiel TEXT;

ALTER TABLE organisations ADD COLUMN IF NOT EXISTS sigle_officiel TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS nom_officiel TEXT;
