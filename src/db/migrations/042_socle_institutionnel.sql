-- 042 : Socle institutionnel — typage, hiérarchie, libellés, territoire
-- Aucun impact routage/boards. Référentiel organisationnel uniquement.

-- ═══ A. TYPAGE ET HIÉRARCHIE ═══

-- A1. Nouvelles colonnes sur organisations
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS type_organisation TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS direction_tutelle_id INTEGER REFERENCES organisations(id);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS secteur TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS prioritaire BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS ordre_affichage INTEGER NOT NULL DEFAULT 999;

-- A2. Organisation racine — renommer la Wilaya existante
UPDATE organisations SET
  nom = 'Wilaya d''Alger', nom_ar = 'ولاية الجزائر',
  type_organisation = 'wilaya', ordre_affichage = 1
WHERE id = 1;

-- A3. Classification des organisations existantes

-- Directions de wilaya (parent = Wilaya d'Alger id=1)
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1, prioritaire = TRUE WHERE id = 5;   -- Propreté
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1, prioritaire = TRUE WHERE id = 6;   -- Voirie
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1, prioritaire = TRUE WHERE id = 13;  -- Environnement
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1 WHERE id = 14;                      -- Urbanisme
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1, prioritaire = TRUE WHERE id = 16;  -- Stationnement
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1 WHERE id = 17;                      -- Patrimoine/Régie Foncière
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1, prioritaire = TRUE WHERE id = 18;  -- Eau
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1, prioritaire = TRUE WHERE id = 23;  -- Éclairage
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1 WHERE id = 24;                      -- Santé et Protection Civile
UPDATE organisations SET type_organisation = 'direction_wilaya', parent_id = 1, prioritaire = TRUE WHERE id = 41;  -- CET

-- Services internes
UPDATE organisations SET type_organisation = 'service_interne', parent_id = 1 WHERE id = 2;   -- Service de Réception
UPDATE organisations SET type_organisation = 'service_interne', parent_id = 1 WHERE id = 3;   -- Cabinet
UPDATE organisations SET type_organisation = 'service_interne', parent_id = 1 WHERE id = 4;   -- Coordination Opérationnelle
UPDATE organisations SET type_organisation = 'service_interne', parent_id = 1 WHERE id = 19;  -- Brigade CAP
UPDATE organisations SET type_organisation = 'service_interne', parent_id = 3 WHERE id = 25;  -- Cellule Communication (sous Cabinet)

-- Vrais établissements publics (EPIC) — avec direction de tutelle
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 5  WHERE id = 30; -- Ét. nettoiement → Propreté
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 13 WHERE id = 31; -- Ét. mobilier urbain → Environnement
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 24 WHERE id = 32; -- Ét. pompes funèbres → Santé (proposition)
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 13 WHERE id = 33; -- Office parcs sports → Environnement (proposition)
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 24 WHERE id = 34; -- Ét. abattoirs → Santé (proposition)
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 13 WHERE id = 35; -- Jardin d'Essai → Environnement
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 14 WHERE id = 36; -- Agence études techniques → Urbanisme (proposition)
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 13 WHERE id = 37; -- Parc zoologique → Environnement
UPDATE organisations SET type_organisation = 'epic', direction_tutelle_id = 14 WHERE id = 38; -- Agence régulation foncière → Urbanisme
UPDATE organisations SET type_organisation = 'epic'                            WHERE id = 40; -- Ét. art et culture → tutelle ambiguë (pas de direction culture)

-- ═══ B. LIBELLÉS INSTITUTIONNELS ═══

-- B1. Renommage des organisations (FR + AR, suppression préfixe "EPIC — ")
UPDATE organisations SET nom = 'Direction de la Propreté',                          nom_ar = 'مديرية النظافة',                   ordre_affichage = 10 WHERE id = 5;
UPDATE organisations SET nom = 'Direction de la Voirie',                            nom_ar = 'مديرية الطرق',                     ordre_affichage = 20 WHERE id = 6;
UPDATE organisations SET nom = 'Direction de l''Environnement',                     nom_ar = 'مديرية البيئة',                    ordre_affichage = 30 WHERE id = 13;
UPDATE organisations SET nom = 'Direction de l''Urbanisme',                         nom_ar = 'مديرية التعمير',                   ordre_affichage = 40 WHERE id = 14;
UPDATE organisations SET nom = 'Direction du Stationnement',                        nom_ar = 'مديرية مواقف السيارات',            ordre_affichage = 50 WHERE id = 16;
UPDATE organisations SET nom = 'Direction du Patrimoine',                           nom_ar = 'مديرية الأملاك',                   ordre_affichage = 60 WHERE id = 17;
UPDATE organisations SET nom = 'Direction de l''Eau et de l''Assainissement',       nom_ar = 'مديرية المياه والتطهير',           ordre_affichage = 70 WHERE id = 18;
UPDATE organisations SET nom = 'Direction de l''Éclairage public',                  nom_ar = 'مديرية الإنارة العمومية',          ordre_affichage = 80 WHERE id = 23;
UPDATE organisations SET nom = 'Direction de la Santé et de la Protection Civile',  nom_ar = 'مديرية الصحة والحماية المدنية',    ordre_affichage = 90 WHERE id = 24;
UPDATE organisations SET nom = 'Centres d''Enfouissement Technique',                nom_ar = 'مراكز الردم التقني',               ordre_affichage = 100 WHERE id = 41;

-- B2. Renommage des EPIC (table epic) — modal Transmettre et rapports
UPDATE epic SET nom = 'Direction de la Propreté (Centre)'                   WHERE id = 1;
UPDATE epic SET nom = 'Direction de la Propreté (Périphérie)'               WHERE id = 2;
UPDATE epic SET nom = 'Direction des Espaces verts'                         WHERE id = 3;
UPDATE epic SET nom = 'Direction de la Voirie et des Trottoirs'             WHERE id = 7;
UPDATE epic SET nom = 'Direction de l''Éclairage public'                    WHERE id = 8;
UPDATE epic SET nom = 'Direction de l''Eau et de l''Assainissement'         WHERE id = 17;
UPDATE epic SET nom = 'Direction de la Circulation et des Transports'       WHERE id = 30;
UPDATE epic SET nom = 'Direction du Stationnement'                          WHERE id = 31;
UPDATE epic SET nom = 'Direction des Centres d''Enfouissement'              WHERE id = 32;

-- ═══ C. TERRITOIRE — DAÏRAS ═══

-- C1. Table daira (13 daïras officielles de la Wilaya d'Alger)
-- Note : le découpage officiel compte 13 daïras (pas 14).
-- Birtouta et Hussein Dey sont des communes chef-lieu de quartier, pas des daïras.
-- Les 13 correspondent aux 13 circonscriptions administratives existantes.
-- Sidi M'Hamed = ex "Alger-Centre" dans les données.
CREATE TABLE IF NOT EXISTS daira (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  nom_ar TEXT,
  code TEXT,
  organisation_id INTEGER REFERENCES organisations(id),
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO daira (id, nom, nom_ar, code) VALUES
  (1,  'Sidi M''Hamed',     'سيدي امحمد',     'DAR-01'),
  (2,  'Bab El Oued',       'باب الوادي',      'DAR-02'),
  (3,  'Bir Mourad Raïs',   'بئر مراد رايس',   'DAR-03'),
  (4,  'Bouzaréah',         'بوزريعة',         'DAR-04'),
  (5,  'Chéraga',           'الشراقة',         'DAR-05'),
  (6,  'Zéralda',           'زرالدة',          'DAR-06'),
  (7,  'Draria',            'الدرارية',        'DAR-07'),
  (8,  'El Harrach',        'الحراش',          'DAR-08'),
  (9,  'Baraki',            'براقي',           'DAR-09'),
  (10, 'Bab Ezzouar',       'باب الزوار',      'DAR-10'),
  (11, 'Dar El Beïda',      'الدار البيضاء',   'DAR-11'),
  (12, 'Bordj El Kiffan',   'برج الكيفان',     'DAR-12'),
  (13, 'Rouïba',            'الرويبة',         'DAR-13')
ON CONFLICT DO NOTHING;

-- C2. Rattachement communes → daïras (via circonscription existante = 1:1)
ALTER TABLE commune ADD COLUMN IF NOT EXISTS daira_id INTEGER REFERENCES daira(id);
UPDATE commune SET daira_id = circonscription_id;

-- C3. Organisations référentielles pour les 13 daïras
INSERT INTO organisations (nom, nom_ar, type, type_organisation, parent_id, actif, ordre_affichage)
SELECT 'Daïra de ' || d.nom, 'دائرة ' || d.nom_ar, 'daira', 'daira', 1, TRUE, 200 + d.id
FROM daira d
ON CONFLICT DO NOTHING;
-- Link daira.organisation_id
UPDATE daira d SET organisation_id = o.id
FROM organisations o WHERE o.nom = 'Daïra de ' || d.nom AND o.type_organisation = 'daira';

-- C4. Organisations référentielles pour les 57 APC
INSERT INTO organisations (nom, nom_ar, type, type_organisation, parent_id, actif, ordre_affichage)
SELECT 'APC de ' || c.nom, 'بلدية ' || COALESCE(c.nom_ar, c.nom), 'apc', 'apc', 1, TRUE, 300 + c.id
FROM commune c
ON CONFLICT DO NOTHING;

-- ═══ REGISTRE ═══
INSERT INTO _migrations (nom) VALUES ('042_socle_institutionnel') ON CONFLICT DO NOTHING;
