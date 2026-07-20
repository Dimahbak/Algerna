-- 040 : Rattachement des 5 dossiers propreté invisibles (epic_id vide)
-- Tous en circonscription 1 (Centre) → epic_id=1 (Propreté Centre)
-- Ne touche ni états, ni assignations, ni historique.

UPDATE signalement SET epic_id = 1
WHERE reference IN ('PRO-6ZZT0KP4','PRO-A87FF6','PRO-ALG008','PRO-J89U07UQ','PRO-K123J9PK')
  AND epic_id IS NULL;

INSERT INTO _migrations (nom) VALUES ('040_backfill_proprete_centre') ON CONFLICT DO NOTHING;
