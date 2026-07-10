-- 022 : Ajout nom arabe aux parkings CiviPark
ALTER TABLE parking_zone ADD COLUMN IF NOT EXISTS nom_ar TEXT;

INSERT INTO _migrations (nom) VALUES ('022_civipark_nom_ar') ON CONFLICT DO NOTHING;
