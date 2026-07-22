-- 057 : Directions en interface (multi-sélection) — remplace le champ unique direction_concernee_id
-- Un partenaire travaille avec PLUSIEURS directions.
-- Une direction marquée "principal" = interlocuteur affiché en tête de fiche.

CREATE TABLE IF NOT EXISTS organisation_directions_interface (
  partenaire_id INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  direction_id INTEGER NOT NULL REFERENCES organisations(id),
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  a_valider BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (partenaire_id, direction_id)
);

-- Migration donnée existante : SEAAL → Eau (principal, saisie test)
INSERT INTO organisation_directions_interface (partenaire_id, direction_id, principal, a_valider)
SELECT 124, direction_concernee_id, TRUE, FALSE
FROM organisations WHERE id = 124 AND direction_concernee_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Pré-remplissage logique (a_valider = TRUE, modifiable par Hamid)
-- SEAAL (124) → + Travaux publics (6)
INSERT INTO organisation_directions_interface VALUES (124, 6, FALSE, TRUE) ON CONFLICT DO NOTHING;
-- Sonelgaz (125) → principal Éclairage public (23) + Travaux publics (6)
INSERT INTO organisation_directions_interface VALUES (125, 23, TRUE, TRUE) ON CONFLICT DO NOTHING;
INSERT INTO organisation_directions_interface VALUES (125, 6, FALSE, TRUE) ON CONFLICT DO NOTHING;
-- ADE (126) → principal Eau (18)
INSERT INTO organisation_directions_interface VALUES (126, 18, TRUE, TRUE) ON CONFLICT DO NOTHING;
-- ONA (127) → principal Eau (18) + Environnement (13)
INSERT INTO organisation_directions_interface VALUES (127, 18, TRUE, TRUE) ON CONFLICT DO NOTHING;
INSERT INTO organisation_directions_interface VALUES (127, 13, FALSE, TRUE) ON CONFLICT DO NOTHING;
-- Algérie Télécom (128) → principal Travaux publics (6)
INSERT INTO organisation_directions_interface VALUES (128, 6, TRUE, TRUE) ON CONFLICT DO NOTHING;
-- Protection civile (129) → principal Administration Locale (120) + Santé et Protection Civile (24)
INSERT INTO organisation_directions_interface VALUES (129, 120, TRUE, TRUE) ON CONFLICT DO NOTHING;
INSERT INTO organisation_directions_interface VALUES (129, 24, FALSE, TRUE) ON CONFLICT DO NOTHING;

-- Nettoyage ancien champ (colonne conservée pour rollback, données vidées)
-- UPDATE organisations SET direction_concernee_id = NULL WHERE direction_concernee_id IS NOT NULL;

INSERT INTO _migrations (nom) VALUES ('057_directions_interface') ON CONFLICT DO NOTHING;
