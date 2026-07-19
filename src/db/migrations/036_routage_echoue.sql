-- 036 : Filet de rattrapage — marqueur signalements à routage échoué
-- Ajoute un booléen pour identifier les signalements sans routage EPIC

ALTER TABLE signalement ADD COLUMN IF NOT EXISTS routage_echoue BOOLEAN NOT NULL DEFAULT FALSE;

-- Marquer les orphelins existants (epic_id=NULL ET operateur_id=NULL)
UPDATE signalement SET routage_echoue = TRUE
WHERE epic_id IS NULL AND operateur_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_signalement_routage_echoue ON signalement(routage_echoue) WHERE routage_echoue = TRUE;

INSERT INTO _migrations (nom) VALUES ('036_routage_echoue') ON CONFLICT DO NOTHING;
