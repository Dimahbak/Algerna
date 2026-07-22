-- 052 : EPIC réels Wilaya d'Alger + enrichissement partenaires
-- Décision Hamid : noms réels des EPIC, fiches partenaires complètes
-- NOTES (dettes actées, aucune action maintenant) :
--   - Dossiers transport : restent à la Direction Circulation ;
--     bascule exécutant vers EGCTU = décision séparée.
--   - Dossiers éclairage : restent chez Direction Éclairage/Nadia ;
--     bascule exécutant vers ERMA = décision séparée.

-- A. Schéma partenaires : ajout colonnes description, telephone, site_web
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS telephone TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS telephone_urgence TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS site_web TEXT;

-- B. RENOMMAGE EPIC existants → noms réels

-- id=30 : nettoiement centre Alger → NETCOM
UPDATE organisations SET
  nom = 'NETCOM — Entreprise de Nettoiement et Collecte des Ordures Ménagères d''Alger',
  nom_ar = 'نيتكوم — مؤسسة تنظيف وجمع ونقل النفايات المنزلية',
  sigle_officiel = 'NETCOM',
  prioritaire = TRUE, ordre_affichage = 1
WHERE id = 30;

-- id=31 : mobilier urbain → EMCU (NOM OFFICIEL Hamid, PAS ERMA)
UPDATE organisations SET
  nom = 'EMCU — Établissement Mobilier et Confort Urbain',
  nom_ar = 'مؤسسة الأثاث و الرفاهية الحضرية',
  sigle_officiel = 'EMCU',
  prioritaire = FALSE, ordre_affichage = 999
WHERE id = 31;

-- id=33 : Office parcs sports → OPLA, pas prioritaire
UPDATE organisations SET
  sigle_officiel = 'OPLA',
  prioritaire = FALSE, ordre_affichage = 999
WHERE id = 33;

-- id=41 : CET → pas prioritaire
UPDATE organisations SET
  sigle_officiel = 'CET',
  prioritaire = FALSE, ordre_affichage = 999
WHERE id = 41;

-- id=35 : Jardin d'Essai → pas prioritaire
UPDATE organisations SET prioritaire = FALSE, ordre_affichage = 999 WHERE id = 35;

-- id=32 : pompes funèbres → pas prioritaire
UPDATE organisations SET prioritaire = FALSE, ordre_affichage = 999 WHERE id = 32;

-- id=36 : AETI
UPDATE organisations SET sigle_officiel = 'AETI' WHERE id = 36;

-- id=38 : AGRU
UPDATE organisations SET sigle_officiel = 'AGRU' WHERE id = 38;

-- C. CRÉATION EPIC manquants

-- ASROUT (voirie) — tutelle = Direction de la Voirie (id=6)
INSERT INTO organisations (id, nom, nom_ar, type, type_organisation, direction_tutelle_id, actif, prioritaire, ordre_affichage, sigle_officiel, secteur)
VALUES (130, 'ASROUT — Entreprise de Travaux Routiers d''Alger', 'أسروت — مؤسسة أشغال الطرقات لولاية الجزائر', 'epic', 'epic', 6, TRUE, TRUE, 2, 'ASROUT', 'voirie')
ON CONFLICT (id) DO NOTHING;

-- ERMA (éclairage public — donnée officielle Hamid) — tutelle = Direction de l'Éclairage public (id=23)
INSERT INTO organisations (id, nom, nom_ar, type, type_organisation, direction_tutelle_id, actif, prioritaire, ordre_affichage, sigle_officiel, secteur)
VALUES (135, 'ERMA — Établissement public de Réalisation et de Maintenance de l''Éclairage public', 'مؤسسة انجاز وصيانة الانارة العمومية', 'epic', 'epic', 23, TRUE, TRUE, 3, 'ERMA', 'eclairage')
ON CONFLICT (id) DO NOTHING;

-- EGCTU (circulation et transport urbain) — tutelle = Direction du Stationnement (id=16)
INSERT INTO organisations (id, nom, nom_ar, type, type_organisation, direction_tutelle_id, actif, prioritaire, ordre_affichage, sigle_officiel, secteur)
VALUES (131, 'EGCTU — Établissement de Gestion de la Circulation et du Transport Urbain', 'إقستو — مؤسسة تسيير حركة المرور والنقل الحضري', 'epic', 'epic', 16, TRUE, TRUE, 4, 'EGCTU', 'transport')
ON CONFLICT (id) DO NOTHING;

-- EDEVAL (espaces verts) — tutelle = Direction de l'Environnement (id=13)
INSERT INTO organisations (id, nom, nom_ar, type, type_organisation, direction_tutelle_id, actif, prioritaire, ordre_affichage, sigle_officiel, secteur)
VALUES (132, 'EDEVAL — Entreprise de Développement des Espaces Verts d''Alger', 'إديفال — مؤسسة تطوير المساحات الخضراء لولاية الجزائر', 'epic', 'epic', 13, TRUE, TRUE, 5, 'EDEVAL', 'espaces_verts')
ON CONFLICT (id) DO NOTHING;

-- EPIC Parkings — tutelle = Direction du Stationnement (id=16)
INSERT INTO organisations (id, nom, nom_ar, type, type_organisation, direction_tutelle_id, actif, prioritaire, ordre_affichage, sigle_officiel, secteur)
VALUES (133, 'EPIC de Gestion des Parkings', 'المؤسسة العمومية لتسيير مواقف السيارات', 'epic', 'epic', 16, TRUE, TRUE, 6, 'EPIC Parkings', 'stationnement')
ON CONFLICT (id) DO NOTHING;

-- EXTRANET (nettoiement grand Alger extramuros, pendant de NETCOM pour le centre)
-- tutelle = Direction de la Propreté (id=5)
INSERT INTO organisations (id, nom, nom_ar, type, type_organisation, direction_tutelle_id, actif, prioritaire, ordre_affichage, sigle_officiel, secteur)
VALUES (134, 'EXTRANET — Entreprise de Nettoiement de la Banlieue d''Alger', 'إكسترانات — مؤسسة تنظيف ضواحي الجزائر', 'epic', 'epic', 5, TRUE, FALSE, 999, 'EXTRANET', 'proprete')
ON CONFLICT (id) DO NOTHING;

-- D. FICHES PARTENAIRES — description, téléphone, site web
-- Numéros : UNIQUEMENT publics vérifiables. Champ vide si doute.

-- SEAAL (id=124)
UPDATE organisations SET
  description = 'Société des Eaux et de l''Assainissement d''Alger. Gestion du service public de l''eau potable et de l''assainissement sur le territoire de la wilaya d''Alger.',
  description_ar = 'الشركة الجزائرية للمياه. تسيير المرفق العمومي للمياه الصالحة للشرب والتطهير على مستوى ولاية الجزائر.',
  telephone = '3021',
  site_web = 'https://www.seaal.dz'
WHERE id = 124;

-- Sonelgaz (id=125)
UPDATE organisations SET
  description = 'Société Nationale de l''Électricité et du Gaz. Production, transport et distribution d''électricité et de gaz sur tout le territoire national.',
  description_ar = 'الشركة الوطنية للكهرباء والغاز. إنتاج ونقل وتوزيع الكهرباء والغاز عبر كامل التراب الوطني.',
  telephone = '3303',
  site_web = 'https://www.sonelgaz.dz'
WHERE id = 125;

-- ADE (id=126)
UPDATE organisations SET
  description = 'Algérienne Des Eaux. Établissement public national chargé de la gestion des systèmes de production et d''adduction d''eau potable.',
  description_ar = 'الجزائرية للمياه. مؤسسة عمومية وطنية مكلفة بتسيير أنظمة إنتاج ونقل المياه الصالحة للشرب.',
  site_web = 'https://www.ade.dz'
WHERE id = 126;

-- ONA (id=127)
UPDATE organisations SET
  description = 'Office National de l''Assainissement. Gestion et exploitation des réseaux d''assainissement et des stations d''épuration.',
  description_ar = 'الديوان الوطني للتطهير. تسيير واستغلال شبكات التطهير ومحطات التصفية.',
  site_web = 'https://www.ona.dz'
WHERE id = 127;

-- Algérie Télécom (id=128)
UPDATE organisations SET
  description = 'Opérateur historique de télécommunications. Réseau fixe, internet ADSL/fibre et services numériques.',
  description_ar = 'المتعامل التاريخي للاتصالات. الشبكة الثابتة والإنترنت وخدمات رقمية.',
  telephone = '12',
  site_web = 'https://www.algerietelecom.dz'
WHERE id = 128;

-- Protection civile (id=129)
UPDATE organisations SET
  description = 'Direction Générale de la Protection Civile. Secours, lutte contre les incendies, catastrophes naturelles et technologiques.',
  description_ar = 'المديرية العامة للحماية المدنية. الإنقاذ ومكافحة الحرائق والكوارث الطبيعية والتكنولوجية.',
  telephone = '14',
  telephone_urgence = '1021',
  site_web = 'https://www.protectioncivile.dz'
WHERE id = 129;

-- E. Migration marker
INSERT INTO _migrations (nom) VALUES ('052_epic_reels_partenaires') ON CONFLICT DO NOTHING;
