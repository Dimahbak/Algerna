-- 038 : Suppression des 16 signalements de test orphelins
-- Références supprimées :
--   INT-S1D2ZJXN, INT-S1A5N3H8, INT-G8PGJDY0, INT-D7ZD0QJI (système, batch test)
--   PRO-VALID01, EAU-VALID01, VOI-VALID01 (fixtures validation workflow)
--   STA-PRK001 à STA-PRK007 (test CiviPark, persona Amina)
--   SIG-11I2SJL2 (test workflow qualification, persona Amina, description "Agression")
--   EAU-QJUQZ1 (test RBAC + fix, persona Amina, commentaire "[TEST RBAC]")

-- Supprimer les dépendances d'abord (missions CAP, historique)
DELETE FROM mission_cap WHERE signalement_id IN (
  SELECT id FROM signalement WHERE reference IN (
    'INT-S1D2ZJXN','INT-S1A5N3H8','INT-G8PGJDY0','INT-D7ZD0QJI',
    'PRO-VALID01','EAU-VALID01','VOI-VALID01',
    'STA-PRK001','STA-PRK002','STA-PRK003','STA-PRK004','STA-PRK005','STA-PRK006','STA-PRK007',
    'SIG-11I2SJL2','EAU-QJUQZ1'
  )
);

DELETE FROM signalement_historique WHERE signalement_id IN (
  SELECT id FROM signalement WHERE reference IN (
    'INT-S1D2ZJXN','INT-S1A5N3H8','INT-G8PGJDY0','INT-D7ZD0QJI',
    'PRO-VALID01','EAU-VALID01','VOI-VALID01',
    'STA-PRK001','STA-PRK002','STA-PRK003','STA-PRK004','STA-PRK005','STA-PRK006','STA-PRK007',
    'SIG-11I2SJL2','EAU-QJUQZ1'
  )
);

-- Supprimer les signalements
DELETE FROM signalement WHERE reference IN (
  'INT-S1D2ZJXN','INT-S1A5N3H8','INT-G8PGJDY0','INT-D7ZD0QJI',
  'PRO-VALID01','EAU-VALID01','VOI-VALID01',
  'STA-PRK001','STA-PRK002','STA-PRK003','STA-PRK004','STA-PRK005','STA-PRK006','STA-PRK007',
  'SIG-11I2SJL2','EAU-QJUQZ1'
);

INSERT INTO _migrations (nom) VALUES ('038_nettoyage_signalements_test') ON CONFLICT DO NOTHING;
