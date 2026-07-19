-- 035 : Nettoyage EPIC agences nationales orphelines
-- Suppression de 16 entrées inactives sans aucune référence (signalement, categorie_signal, epic_organisation_map)
--
-- Orphelines supprimées :
--   DIR-DEC (id=6), DIR-LOG (id=11), DIR-HAB1 (id=12), DIR-HAB2 (id=13),
--   DIR-HAB3 (id=14), DIR-RAIL (id=15), DIR-AUTO (id=16), DIR-BAR (id=18),
--   DIR-ENR (id=19), DIR-POST (id=20), DIR-METRO (id=21), DIR-FERR (id=22),
--   DIR-GARE (id=23), DIR-PAT (id=26), DIR-PUB (id=28), DIR-PRESSE (id=29)
--
-- NON touchés : DIR-PARK (actif, CiviPark), DIR-EAU (arbitrage en cours)

DELETE FROM epic
WHERE sigle IN (
  'DIR-DEC', 'DIR-LOG', 'DIR-HAB1', 'DIR-HAB2', 'DIR-HAB3',
  'DIR-RAIL', 'DIR-AUTO', 'DIR-BAR', 'DIR-ENR', 'DIR-POST',
  'DIR-METRO', 'DIR-FERR', 'DIR-GARE', 'DIR-PAT', 'DIR-PUB', 'DIR-PRESSE'
)
AND actif = false;

INSERT INTO _migrations (nom) VALUES ('035_nettoyage_epic_agences') ON CONFLICT DO NOTHING;
