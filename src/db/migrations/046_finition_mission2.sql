-- 046 : Finition Mission 2 — Oued Koriche + exécutant dynamique
-- Source rattachement : décret présidentiel n° 26-112 (JO 12/03/2026)

-- A. Oued Koriche → Bab El Oued (décision Hamid)
UPDATE commune SET daira_id = 2, statut_rattachement = 'verifie' WHERE id = 6;
-- Raïs Hamidou et Casbah → Bab El Oued (composition décret)
UPDATE commune SET daira_id = 2, statut_rattachement = 'verifie' WHERE id = 23;
UPDATE commune SET daira_id = 2, statut_rattachement = 'verifie' WHERE id = 4;
-- Bab El Oued (7) + Bologhine (8) statut verifie
UPDATE commune SET statut_rattachement = 'verifie' WHERE id IN (7, 8);

-- B. Backfill exécutant pour les propreté dynamiques (epic_id=NULL → zone)
-- epic 1 Centre et epic 2 Périphérie → org 5 (Direction Propreté)
-- Résolution epic_id + executant en un seul pass :
-- Pour les 34 dossiers propreté dynamique sans epic_id, on résout via
-- commune.zone (peripherie → epic 2, sinon → epic 1), exécutant = org 5.
-- Appliqué via script Node (zone dynamique per commune).

-- C. Branchement création : POST /signalements résout l'exécutant
-- des catégories dynamiques via epic_organisation_map après routerEpic().

-- RAPPEL : un rattachement non couvert par l'instruction = question
-- à Hamid, jamais de décision unilatérale.

INSERT INTO _migrations (nom) VALUES ('046_finition_mission2') ON CONFLICT DO NOTHING;
