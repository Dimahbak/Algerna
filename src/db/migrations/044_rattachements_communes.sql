-- 044 : Rattachements communes → daïras — corrections décret présidentiel
-- Source : décret présidentiel n° 26-112 du 8 mars 2026
--          (Journal officiel du 12 mars 2026)
-- Fourni par Hamid, annexe organisation administrative Wilaya d'Alger.

-- Ajout colonne statut
ALTER TABLE commune ADD COLUMN IF NOT EXISTS statut_rattachement TEXT DEFAULT 'a_valider';

-- Hussein Dey = Mohamed Belouizdad, Hussein Dey, Kouba, El Magharia
UPDATE commune SET daira_id = 9 WHERE id = 36;  -- Kouba: El Harrach → Hussein Dey
UPDATE commune SET daira_id = 9 WHERE id = 48;  -- El Magharia: Dar El Beïda → Hussein Dey
UPDATE commune SET daira_id = 1 WHERE id = 6;   -- Oued Koriche: Hussein Dey → Sidi M'Hamed (hors décret HD)

-- Birtouta = Birtouta, Ouled Chebel, Tessala El Merdja
UPDATE commune SET daira_id = 8 WHERE id = 32;  -- Ouled Chebel: Draria → Birtouta
UPDATE commune SET daira_id = 8 WHERE id = 26;  -- Tessala El Merdja: Zéralda → Birtouta

-- Draria = Douéra, Khraïssia, Draria, Baba Hassen, El Achour
UPDATE commune SET daira_id = 7 WHERE id = 15;  -- El Achour: Bouzareah → Draria

-- Statut verifie sur les 12 communes confirmées par le décret
UPDATE commune SET statut_rattachement = 'verifie'
WHERE id IN (36, 48, 59, 5, 34, 32, 26, 56, 33, 30, 31, 15);

INSERT INTO _migrations (nom) VALUES ('044_rattachements_communes') ON CONFLICT DO NOTHING;
