-- 047 : Correction zones propreté — alignement sur daïras
-- Règle : daïras Sidi M'Hamed (1), Bab El Oued (2), Bir Mourad Raïs (3) = centre
-- Les 11 autres daïras = peripherie
-- 43 communes corrigées de centre → peripherie
-- 19 dossiers propreté dynamique re-routés de epic 1 (Centre) → epic 2 (Périphérie)

UPDATE commune SET zone = 'peripherie' WHERE daira_id NOT IN (1,2,3);
UPDATE commune SET zone = 'centre' WHERE daira_id IN (1,2,3);

-- Re-résolution epic_id : appliquée via script Node (par commune)

INSERT INTO _migrations (nom) VALUES ('047_correction_zones') ON CONFLICT DO NOTHING;
