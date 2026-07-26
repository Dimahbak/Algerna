-- Migration 064 : Correction référentiel des circonscriptions (décret 26-112)
-- 14 wilayas déléguées attendues, 13 en base. Manquantes : Sidi M'Hamed, Hussein Dey.
-- Cause : la table circonscription utilisait l'ancien nom « Alger-Centre » pour Sidi M'Hamed,
-- et Hussein Dey n'avait pas d'entrée du tout.

-- 1. Renommer circ 1 « Alger-Centre » → « Sidi M'Hamed » (même territoire, décret 26-112)
UPDATE circonscription SET nom = 'Sidi M''Hamed' WHERE id = 1;

-- 2. Ajouter circ 14 « Hussein Dey » (daïra 9 — communes : Hussein Dey, Kouba, El Magharia, Belouizdad)
INSERT INTO circonscription (id, nom) VALUES (14, 'Hussein Dey') ON CONFLICT (id) DO NOTHING;

-- 3. Remapper les communes de la daïra Hussein Dey vers la nouvelle circonscription 14
UPDATE commune SET circonscription_id = 14 WHERE daira_id = 9;

-- Vérification : SELECT id, nom FROM circonscription ORDER BY id → 14 lignes attendues
