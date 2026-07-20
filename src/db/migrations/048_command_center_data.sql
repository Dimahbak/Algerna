-- 048 : Données Command-Center — partenaires externes + démo
-- Partenaires externes : SEAAL, Sonelgaz, ADE, ONA, Algérie Télécom, Protection civile
-- Décision doctrine actée : noms réels autorisés (post-présentation).
-- Tables demo_decisions et demo_briefing : contenu démo marqué is_demo=true

-- Appliqué via script Node (IDs dynamiques)
INSERT INTO _migrations (nom) VALUES ('048_command_center_data') ON CONFLICT DO NOTHING;
