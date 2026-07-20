-- 039 : Backfill epic_id sur les signalements antérieurs au système EPIC
-- Les 47 dossiers dont la catégorie a un epic_id défini mais dont le
-- signalement a encore epic_id NULL (créés avant le routage EPIC).
-- Les dossiers routage_echoue=TRUE restent intacts (zone manuelle Youcef).
-- Les dossiers propreté à routage dynamique (catégorie sans epic_id) restent intacts.
--
-- Familles concernées :
--   eau (27) → epic_id=17 (Direction Eau et Assainissement)
--   eclairage (5) → epic_id=8 (Direction Éclairage Public)
--   voirie (5) → epic_id=30 (Direction Circulation et Transports)
--   espaces_verts (4) → epic_id=3 (Direction Espaces Verts)
--   stationnement (3) → epic_id=31 (Direction Stationnement)
--   proprete/environnement (3) → epic_id=32 (Direction CET)

UPDATE signalement s
SET epic_id = cs.epic_id
FROM categorie_signal cs
WHERE cs.id = s.categorie_id
  AND s.epic_id IS NULL
  AND s.routage_echoue = FALSE
  AND cs.epic_id IS NOT NULL;

INSERT INTO _migrations (nom) VALUES ('039_backfill_epic_id') ON CONFLICT DO NOTHING;
