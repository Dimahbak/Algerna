-- 034 : Intégration référentiel 508 quartiers (57 communes)
-- Ajoute colonne statut_validation sans toucher au CHECK existant sur statut

ALTER TABLE quartier ADD COLUMN IF NOT EXISTS statut_validation TEXT DEFAULT 'a_valider'
  CHECK (statut_validation IN ('verifie','a_valider'));

-- Les 14 existants (source=demo) reçoivent a_valider par défaut (sera mis à jour par le script d'import)

INSERT INTO _migrations (nom) VALUES ('034_quartiers_referentiel') ON CONFLICT DO NOTHING;
