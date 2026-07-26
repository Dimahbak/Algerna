-- Migration 065 : Retypage des 5 directions mal classées « epic » → « direction »
-- Décision de Hamid actée le 26 juillet 2026.
-- Seuls ces 5 id, par id explicite.

UPDATE organisations SET type = 'direction' WHERE id = 5;   -- Direction de la Propreté
UPDATE organisations SET type = 'direction' WHERE id = 6;   -- Direction des Travaux publics
UPDATE organisations SET type = 'direction' WHERE id = 16;  -- Direction du Stationnement
UPDATE organisations SET type = 'direction' WHERE id = 17;  -- Direction du Patrimoine
UPDATE organisations SET type = 'direction' WHERE id = 18;  -- Direction de l'Eau et de l'Assainissement
