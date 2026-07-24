-- Migration 060 : Bascule des exécutants vers les EPIC prioritaires
-- Pour chaque direction ayant un EPIC prioritaire sous tutelle,
-- l'exécutant des catégories et dossiers bascule vers cet EPIC.
-- Lecture hiérarchie tutelle en base — AUCUNE liste en dur.
--
-- Règle CET : les catégories déjà assignées à un EPIC prioritaire
-- dont la tutelle correspond à la direction pilote de la catégorie
-- restent inchangées (préserve CET sous DIR Environnement).
--
-- Eau/Assainissement : aucun EPIC prioritaire sous tutelle → inchangé.

-- ═══ ÉTAPE 1 : categorie_routage ═══
-- Sélectionne l'EPIC prioritaire de plus petit ordre_affichage par direction tutelle
UPDATE categorie_routage cr
SET organisation_executante_id = epic_map.epic_id,
    maj_le = NOW()
FROM (
  SELECT DISTINCT ON (direction_tutelle_id)
         id AS epic_id, direction_tutelle_id
  FROM organisations
  WHERE type_organisation = 'epic' AND prioritaire = true
        AND direction_tutelle_id IS NOT NULL
  ORDER BY direction_tutelle_id, ordre_affichage
) epic_map
WHERE cr.direction_pilote_id = epic_map.direction_tutelle_id
  -- Ne pas écraser un EPIC prioritaire déjà correctement sous la même tutelle
  AND NOT EXISTS (
    SELECT 1 FROM organisations
    WHERE id = cr.organisation_executante_id
      AND type_organisation = 'epic'
      AND prioritaire = true
      AND direction_tutelle_id = cr.direction_pilote_id
  );

-- ═══ ÉTAPE 2 : signalement (tous les dossiers existants) ═══
-- Aligne l'exécutant de chaque dossier sur sa catégorie de routage
UPDATE signalement s
SET organisation_executante_id = cr.organisation_executante_id
FROM categorie_routage cr
WHERE cr.categorie_id = s.categorie_id
  AND cr.organisation_executante_id IS NOT NULL
  AND s.organisation_executante_id IS DISTINCT FROM cr.organisation_executante_id;
