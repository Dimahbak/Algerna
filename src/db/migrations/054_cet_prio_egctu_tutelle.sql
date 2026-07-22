-- 054 : CET prioritaire ordre 6 + EGCTU tutelle corrigée
-- Décision Hamid : CET = 6e EPIC prioritaire.
-- EGCTU tutelle = id=6 (actuellement "Direction de la Voirie" —
--   Hamid indique "Direction de la Circulation et des Transports"
--   mais l'org id=6 porte le libellé Voirie en base ; rattachement
--   à id=6 comme demandé, question libellé à clarifier séparément).

-- A. CET (id=41) → prioritaire, ordre 6
UPDATE organisations SET
  prioritaire = TRUE,
  ordre_affichage = 6
WHERE id = 41;

-- B. EGCTU (id=131) → tutelle = id 6
UPDATE organisations SET
  direction_tutelle_id = 6
WHERE id = 131;

INSERT INTO _migrations (nom) VALUES ('054_cet_prio_egctu_tutelle') ON CONFLICT DO NOTHING;
