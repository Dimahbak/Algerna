-- 053 : Correction EGCTU / suppression EPIC Parkings fictif
-- Donnée officielle Hamid : EGCTU gère AUSSI parkings à étages,
-- espaces de stationnement et certaines stations urbaines.
-- Il n'existe PAS d'EPIC Parkings distinct.
--
-- NOTES (dettes actées, aucune action maintenant) :
--   - Routage dossiers stationnement (Dir. Stationnement / Khaled)
--     vers EGCTU en exécutant = décision séparée.
--   - Question : la "Direction du Stationnement" a-t-elle encore lieu
--     d'être comme direction distincte, ou ses attributions relèvent-
--     elles de la Direction de la Circulation ? À trancher plus tard.
--   - Tutelle EGCTU : devrait être "Direction de la Circulation et des
--     Transports" mais cette direction n'existe pas encore en base.
--     Rattaché à Direction du Stationnement (id=16) en attendant
--     la clarification de Hamid sur la structure direction.

-- A. EGCTU (id=131) : secteur élargi, description
UPDATE organisations SET
  secteur = 'circulation_transport_stationnement',
  description = 'Gestion de la circulation routière, du transport urbain, des parkings à étages, des espaces de stationnement et de certaines stations urbaines de la wilaya d''Alger.',
  description_ar = 'تسيير حركة المرور، النقل الحضري، مواقف السيارات متعددة الطوابق، فضاءات التوقف وبعض المحطات الحضرية لولاية الجزائر.'
WHERE id = 131;

-- B. Suppression EPIC Parkings fictif (id=133)
-- Vérifié : 0 signalement, 0 utilisateur, 0 epic_organisation_map
DELETE FROM organisations WHERE id = 133;

-- C. Réordonnement : 5 prioritaires (place ★6 en attente décision Hamid)
-- NETCOM=1, ASROUT=2, ERMA=3, EGCTU=4, EDEVAL=5
-- (ordres déjà corrects, seul EPIC Parkings avait ordre=6 et est supprimé)

-- D. Migration marker
INSERT INTO _migrations (nom) VALUES ('053_egctu_parkings') ON CONFLICT DO NOTHING;
