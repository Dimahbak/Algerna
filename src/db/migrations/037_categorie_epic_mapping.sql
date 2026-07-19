-- 037 : Compléter le mapping catégorie → EPIC dans la base
-- Toutes les catégories actives reçoivent un epic_id sauf :
--   - "autre" (famille autre, id=36) → tri humain intentionnel
--   - "proprete" sans CET → routage dynamique par zone commune (centre/périphérie)

-- eau → DIR-EAU (id=17) — même si inactif, le signalement sera créé et visible
UPDATE categorie_signal SET epic_id = 17 WHERE famille = 'eau' AND epic_id IS NULL;

-- animaux → DIR-PRO Centre (id=1) — salubrité publique
UPDATE categorie_signal SET epic_id = 1 WHERE famille = 'animaux' AND epic_id IS NULL;

-- nuisances → DIR-PRO Centre (id=1) — salubrité publique
UPDATE categorie_signal SET epic_id = 1 WHERE famille = 'nuisances' AND epic_id IS NULL;

-- assainissement → DIR-EAU (id=17) — réseau hydraulique
UPDATE categorie_signal SET epic_id = 17 WHERE famille = 'assainissement' AND epic_id IS NULL;

-- batiments → DIR-VOR (id=7) — patrimoine bâti
UPDATE categorie_signal SET epic_id = 7 WHERE famille = 'batiments' AND epic_id IS NULL;

-- mobilier_urbain → DIR-EVT (id=3) — espaces verts et mobilier
UPDATE categorie_signal SET epic_id = 3 WHERE famille = 'mobilier_urbain' AND epic_id IS NULL;

-- securite (trou, mur, danger) → DIR-CIRC (id=30) — sécurité voie publique
UPDATE categorie_signal SET epic_id = 30 WHERE famille = 'securite' AND epic_id IS NULL;

-- accessibilite (trottoir, rampe) → DIR-CIRC (id=30) — aménagement voie publique
UPDATE categorie_signal SET epic_id = 30 WHERE famille = 'accessibilite' AND epic_id IS NULL;

-- environnement (oued pollué, terrain vague) → DIR-CET (id=32) — environnement
UPDATE categorie_signal SET epic_id = 32 WHERE famille = 'environnement' AND epic_id IS NULL;

-- NOTE : proprete (ids 1,2,3,4,7) garde epic_id=NULL → routage dynamique zone commune
-- NOTE : autre (id=36) garde epic_id=NULL → tri humain

INSERT INTO _migrations (nom) VALUES ('037_categorie_epic_mapping') ON CONFLICT DO NOTHING;
