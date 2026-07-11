-- Mission 2 correction : rappel_proprete passe de BOOLEAN à TEXT 3 positions
-- Valeurs : 'tous' | 'utiles' (défaut) | 'aucun'
-- 'utiles' = tri sélectif + encombrants uniquement (pas les ménagers quotidiens)

ALTER TABLE utilisateur ALTER COLUMN rappel_proprete DROP DEFAULT;
ALTER TABLE utilisateur ALTER COLUMN rappel_proprete TYPE TEXT
  USING CASE WHEN rappel_proprete::text = 'true' THEN 'utiles'
             WHEN rappel_proprete::text = 'false' THEN 'aucun'
             ELSE rappel_proprete::text END;
ALTER TABLE utilisateur ALTER COLUMN rappel_proprete SET DEFAULT 'utiles';
-- Constraint may already exist from live migration
DO $$ BEGIN
  ALTER TABLE utilisateur ADD CONSTRAINT chk_rappel_proprete
    CHECK (rappel_proprete IN ('tous','utiles','aucun'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
