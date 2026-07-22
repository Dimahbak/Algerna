-- 056 : Restructuration Voirie/Transports — décision Hamid (option a)
-- NOTE : rattachement juridique d'ASROUT et EGCTU à confirmer par
-- leurs actes de création (réserve du document de référence).

-- ═══ A. DIRECTIONS ═══

-- A1. Fusion id=121 "Direction des Travaux publics" → id=6
-- id=121 : 0 signalement, 0 utilisateur, 0 tutelle, 0 parent → suppression
DELETE FROM categorie_routage WHERE direction_pilote_id = 121;
DELETE FROM organisations WHERE id = 121;

-- A1b. id=6 : renommage → "Direction des Travaux publics de la Wilaya d'Alger"
UPDATE organisations SET
  nom = 'Direction des Travaux publics de la Wilaya d''Alger',
  nom_ar = 'مديرية الأشغال العمومية لولاية الجزائر'
WHERE id = 6;

-- A2. Création "Direction des Transports de la Wilaya d'Alger"
INSERT INTO organisations (id, nom, nom_ar, type, type_organisation, actif, secteur)
VALUES (
  136,
  'Direction des Transports de la Wilaya d''Alger',
  'مديرية النقل لولاية الجزائر',
  'direction_wilaya', 'direction_wilaya', TRUE, 'transport'
) ON CONFLICT (id) DO NOTHING;

-- A3. Direction du Stationnement (id=16) → service_interne, parent = Dir. Transports
UPDATE organisations SET
  type_organisation = 'service_interne',
  parent_id = 136
WHERE id = 16;

-- ═══ B. TUTELLES EPIC ═══

-- B4. ASROUT (id=130) : renommage + tutelle = Dir. Travaux publics (id=6)
UPDATE organisations SET
  nom = 'ASROUT — Établissement de maintenance des réseaux routiers et d''assainissement de la Wilaya d''Alger',
  nom_ar = 'أسروت — مؤسسة صيانة شبكات الطرقات والتطهير لولاية الجزائر',
  direction_tutelle_id = 6
WHERE id = 130;

-- B5. EGCTU (id=131) : tutelle = Dir. Transports (id=136)
UPDATE organisations SET
  direction_tutelle_id = 136
WHERE id = 131;

-- ═══ C. RE-VENTILATION DES CATÉGORIES ═══

-- C6. → Travaux publics (id=6) : catégories 5, 28, 61, 31, 69, 70, 72, 62
-- (cat 62 : mur menaçant — provisoire, à réorienter selon propriété du bâtiment)
-- Les catégories 5, 28, 61, 31, 69, 70, 72 sont DÉJÀ routées vers id=6.
-- Cat 62 est DÉJÀ routée vers id=6. Rien à changer pour ces catégories.

-- C7. → Transports (id=136) : catégories 29, 30, 55, 34, 54, 53, 56, 16, 71, 33, 35
-- Catégories actuellement vers id=6 à basculer vers id=136 :
UPDATE categorie_routage SET direction_pilote_id = 136 WHERE categorie_id IN (29, 30, 55, 34, 54, 53, 56, 71);
-- Catégories actuellement vers id=16 à basculer vers id=136 :
UPDATE categorie_routage SET direction_pilote_id = 136 WHERE categorie_id IN (16, 33, 35);

-- C8. Catégories bâtiment (41-44) : restent sur Travaux publics (id=6) — déjà le cas.

-- C9. Backfill dossiers existants : mettre à jour direction_pilote_id
-- Dossiers dont la catégorie est maintenant routée vers Transports
UPDATE signalement s SET direction_pilote_id = 136
FROM categorie_routage cr
WHERE cr.categorie_id = s.categorie_id
  AND cr.direction_pilote_id = 136
  AND s.direction_pilote_id != 136;

-- Vérification : aucune catégorie ne reste pilotée par id=16
-- (toutes les 4 ont été migrées vers 136 ci-dessus)

-- ═══ D. NETTOYAGE ═══

-- Utilisateur Khaled (id=16) reste rattaché à son org (Direction du Stationnement
-- devenue service_interne sous Transports) — son compte fonctionne toujours,
-- seul le type_organisation change pour le filtrage Directions de la Wilaya.

INSERT INTO _migrations (nom) VALUES ('056_restructuration_voirie_transports') ON CONFLICT DO NOTHING;
