-- Migration 017 : CCOE Phase 1 — Centre de Coordination Opérationnelle des Événements
-- Tables : evenement, opord, chantier, chantier_checklist, chantier_validation,
--          chantier_commentaire, gabarit_evenement, gabarit_axe, gabarit_checklist
-- Organisations ajoutées : Direction Éclairage Public, Direction Santé et Protection Civile,
--                          Cellule Communication — Cabinet
-- Appliquée le 2026-07-09

-- ═══════════════════════════════════════════════════════
-- 1. Nouvelles organisations (noms génériques, nom_ar renseigné)
-- ═══════════════════════════════════════════════════════

-- Direction Éclairage Public — correspondance avec l'epic DIR-ECL (epic.id=8)
-- L'epic gère le routage signalements, cette organisation gère l'affectation CCOE
INSERT INTO organisations (nom, nom_ar, type, actif) VALUES
  ('Direction Éclairage Public', 'مديرية الإنارة العمومية', 'direction', TRUE);

-- Direction Santé et Protection Civile — axe santé des événements
INSERT INTO organisations (nom, nom_ar, type, actif) VALUES
  ('Direction Santé et Protection Civile', 'مديرية الصحة والحماية المدنية', 'direction', TRUE);

-- Cellule Communication — rattachée au Cabinet (parent_id=3)
INSERT INTO organisations (nom, nom_ar, type, parent_id, actif) VALUES
  ('Cellule Communication — Cabinet', 'خلية الاتصال — الديوان', 'direction', 3, TRUE);

-- ═══════════════════════════════════════════════════════
-- 2. Types énumérés
-- ═══════════════════════════════════════════════════════

CREATE TYPE evenement_type AS ENUM (
  'president', 'premier_ministre', 'ministre', 'ambassadeur',
  'fete_nationale', 'sportif', 'culturel', 'inspection_wali'
);

CREATE TYPE evenement_importance AS ENUM ('critique', 'haute', 'normale');

CREATE TYPE chantier_statut AS ENUM (
  'non_commence', 'en_preparation', 'en_cours', 'termine', 'bloque', 'valide'
);
-- NOTE : 'en_retard' est CALCULÉ (date_limite dépassée + statut non terminé/validé), jamais stocké

CREATE TYPE chantier_axe AS ENUM (
  'securite', 'protocole', 'voirie', 'proprete', 'eclairage',
  'espaces_verts', 'mobilite', 'stationnement', 'sante',
  'communication', 'logistique'
);
-- NOTE : mobilité et voirie partagent la même organisation (Direction Voirie) en V1

CREATE TYPE validation_decision AS ENUM ('valide', 'refuse');

-- ═══════════════════════════════════════════════════════
-- 3. Table EVENEMENT
-- ═══════════════════════════════════════════════════════

CREATE TABLE evenement (
  id              SERIAL PRIMARY KEY,
  titre           TEXT NOT NULL,
  titre_ar        TEXT,
  type            evenement_type NOT NULL,
  importance      evenement_importance NOT NULL DEFAULT 'normale',
  date_evenement  DATE NOT NULL,
  heure           TIME,
  lieu            TEXT,
  lieu_ar         TEXT,
  commune_id      INTEGER REFERENCES commune(id),
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  description     TEXT,
  description_ar  TEXT,
  responsable_cabinet UUID REFERENCES utilisateur(id),
  chef_projet     UUID REFERENCES utilisateur(id),
  statut          TEXT NOT NULL DEFAULT 'planifie',  -- planifie, en_preparation, jour_j, cloture
  cree_par        UUID REFERENCES utilisateur(id),
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_le          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evenement_date ON evenement(date_evenement);
CREATE INDEX idx_evenement_statut ON evenement(statut);

-- ═══════════════════════════════════════════════════════
-- 4. Table OPORD (Ordre d'Opération)
-- ═══════════════════════════════════════════════════════

CREATE TABLE opord (
  id                    SERIAL PRIMARY KEY,
  evenement_id          INTEGER NOT NULL REFERENCES evenement(id) ON DELETE CASCADE,
  objectif              TEXT,
  objectif_ar           TEXT,
  intention_commandement TEXT,
  intention_commandement_ar TEXT,
  organisation          TEXT,  -- texte structuré libre
  organisation_ar       TEXT,
  statut                TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon, valide, diffuse
  cree_par              UUID REFERENCES utilisateur(id),
  cree_le               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_le                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- 5. Table CHANTIER
-- ═══════════════════════════════════════════════════════

CREATE TABLE chantier (
  id                SERIAL PRIMARY KEY,
  opord_id          INTEGER NOT NULL REFERENCES opord(id) ON DELETE CASCADE,
  axe               chantier_axe NOT NULL,
  organisation_id   INTEGER REFERENCES organisations(id),
  responsable_id    UUID REFERENCES utilisateur(id),
  adjoint_id        UUID REFERENCES utilisateur(id),
  titre             TEXT NOT NULL,
  titre_ar          TEXT,
  description       TEXT,
  description_ar    TEXT,
  date_limite       TIMESTAMPTZ,
  statut            chantier_statut NOT NULL DEFAULT 'non_commence',
  lat               DOUBLE PRECISION,
  lng               DOUBLE PRECISION,
  cree_le           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_le            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chantier_opord ON chantier(opord_id);
CREATE INDEX idx_chantier_org ON chantier(organisation_id);
CREATE INDEX idx_chantier_statut ON chantier(statut);

-- ═══════════════════════════════════════════════════════
-- 6. Table CHANTIER_CHECKLIST
-- ═══════════════════════════════════════════════════════

CREATE TABLE chantier_checklist (
  id          SERIAL PRIMARY KEY,
  chantier_id INTEGER NOT NULL REFERENCES chantier(id) ON DELETE CASCADE,
  libelle     TEXT NOT NULL,
  libelle_ar  TEXT,
  coche       BOOLEAN NOT NULL DEFAULT FALSE,
  photo_path  TEXT,
  agent_id    UUID REFERENCES utilisateur(id),
  coche_le    TIMESTAMPTZ,
  ordre       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_checklist_chantier ON chantier_checklist(chantier_id);

-- ═══════════════════════════════════════════════════════
-- 7. Table CHANTIER_VALIDATION (signature numérique)
-- ═══════════════════════════════════════════════════════

CREATE TABLE chantier_validation (
  id          BIGSERIAL PRIMARY KEY,
  chantier_id INTEGER NOT NULL REFERENCES chantier(id) ON DELETE CASCADE,
  niveau      TEXT NOT NULL,  -- 'responsable' ou 'cabinet'
  auteur_id   UUID NOT NULL REFERENCES utilisateur(id),
  decision    validation_decision NOT NULL,
  motif       TEXT,  -- obligatoire au refus
  le          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_validation_chantier ON chantier_validation(chantier_id);

-- ═══════════════════════════════════════════════════════
-- 8. Table CHANTIER_COMMENTAIRE (fil de discussion)
-- ═══════════════════════════════════════════════════════

CREATE TABLE chantier_commentaire (
  id          BIGSERIAL PRIMARY KEY,
  chantier_id INTEGER NOT NULL REFERENCES chantier(id) ON DELETE CASCADE,
  auteur_id   UUID NOT NULL REFERENCES utilisateur(id),
  message     TEXT NOT NULL,
  photo_path  TEXT,
  le          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commentaire_chantier ON chantier_commentaire(chantier_id);

-- ═══════════════════════════════════════════════════════
-- 9. Tables GABARIT (templates d'événements)
-- ═══════════════════════════════════════════════════════

CREATE TABLE gabarit_evenement (
  id     SERIAL PRIMARY KEY,
  type   evenement_type NOT NULL,
  nom    TEXT NOT NULL,
  nom_ar TEXT,
  actif  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE gabarit_axe (
  id          SERIAL PRIMARY KEY,
  gabarit_id  INTEGER NOT NULL REFERENCES gabarit_evenement(id) ON DELETE CASCADE,
  axe         chantier_axe NOT NULL,
  titre       TEXT NOT NULL,
  titre_ar    TEXT,
  ordre       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE gabarit_checklist (
  id        SERIAL PRIMARY KEY,
  axe_id    INTEGER NOT NULL REFERENCES gabarit_axe(id) ON DELETE CASCADE,
  libelle   TEXT NOT NULL,
  libelle_ar TEXT,
  ordre     INTEGER NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════════════════════
-- 10. Mapping AXE → ORGANISATION (référence)
-- ═══════════════════════════════════════════════════════
-- Stocké dans une table de référence pour la génération automatique

CREATE TABLE ccoe_axe_organisation (
  axe             chantier_axe PRIMARY KEY,
  organisation_id INTEGER NOT NULL REFERENCES organisations(id)
);

-- Insertion du mapping validé
-- NOTE : mobilité partage la même org que voirie (Direction Voirie, id=6) en V1
INSERT INTO ccoe_axe_organisation (axe, organisation_id) VALUES
  ('securite',      4),   -- Coordination Opérationnelle
  ('protocole',     3),   -- Cabinet
  ('voirie',        6),   -- EPIC — Direction Voirie
  ('proprete',      5),   -- EPIC — Direction Propreté
  ('eclairage',     (SELECT id FROM organisations WHERE nom = 'Direction Éclairage Public')),
  ('espaces_verts', 13),  -- Direction de l'Environnement
  ('mobilite',      6),   -- EPIC — Direction Voirie (doublon voirie V1, à séparer si nécessaire)
  ('stationnement', 16),  -- EPIC — Gestion des Parkings
  ('sante',         (SELECT id FROM organisations WHERE nom = 'Direction Santé et Protection Civile')),
  ('communication', (SELECT id FROM organisations WHERE nom = 'Cellule Communication — Cabinet')),
  ('logistique',    4);   -- Coordination Opérationnelle

-- ═══════════════════════════════════════════════════════
-- 11. Seed GABARIT « Visite officielle »
-- ═══════════════════════════════════════════════════════

INSERT INTO gabarit_evenement (type, nom, nom_ar) VALUES
  ('ministre', 'Visite officielle', 'زيارة رسمية');

-- Axes du gabarit
WITH gab AS (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle')
INSERT INTO gabarit_axe (gabarit_id, axe, titre, titre_ar, ordre) VALUES
  ((SELECT id FROM gab), 'securite',      'Sécurité et ordre public',         'الأمن والنظام العام', 1),
  ((SELECT id FROM gab), 'protocole',     'Protocole et accueil',             'البروتوكول والاستقبال', 2),
  ((SELECT id FROM gab), 'voirie',        'Voirie et chaussées',              'الطرقات والأرصفة', 3),
  ((SELECT id FROM gab), 'proprete',      'Propreté et nettoiement',          'النظافة والتنظيف', 4),
  ((SELECT id FROM gab), 'eclairage',     'Éclairage public',                 'الإنارة العمومية', 5),
  ((SELECT id FROM gab), 'espaces_verts', 'Espaces verts et fleurissement',   'المساحات الخضراء والتزيين', 6),
  ((SELECT id FROM gab), 'mobilite',      'Mobilité et circulation',          'التنقل والمرور', 7),
  ((SELECT id FROM gab), 'stationnement', 'Stationnement',                    'مواقف السيارات', 8),
  ((SELECT id FROM gab), 'sante',         'Santé et secours',                 'الصحة والإسعاف', 9),
  ((SELECT id FROM gab), 'communication', 'Communication et médias',          'الاتصال والإعلام', 10);

-- Checklists par axe
-- Sécurité
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Périmètre de sécurité délimité',        'تحديد المحيط الأمني', 1),
  ('Agents en position sur le parcours',     'نشر الأعوان على المسار', 2),
  ('Contrôle des accès visiteurs',           'مراقبة مداخل الزوار', 3),
  ('Coordination avec les services de sécurité', 'التنسيق مع مصالح الأمن', 4),
  ('Plan d''évacuation d''urgence validé',   'المصادقة على مخطط الإخلاء', 5),
  ('Vérification des véhicules autorisés',   'التحقق من المركبات المرخصة', 6)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'securite' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Protocole
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Liste des invités confirmée',            'تأكيد قائمة المدعوين', 1),
  ('Badges et accréditations préparés',      'تحضير الشارات والاعتمادات', 2),
  ('Plan de placement validé',               'المصادقة على مخطط الجلوس', 3),
  ('Drapeaux et signalétique installés',     'تنصيب الأعلام واللافتات', 4),
  ('Accueil et orientation en place',        'تأمين الاستقبال والتوجيه', 5),
  ('Discours et documents préparés',         'تحضير الخطابات والوثائق', 6),
  ('Répétition générale effectuée',          'إجراء البروفة العامة', 7)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'protocole' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Voirie
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Chaussée inspectée — nids-de-poule comblés', 'معاينة الطريق — ردم الحفر', 1),
  ('Marquage au sol rafraîchi',                   'تجديد العلامات الأرضية', 2),
  ('Trottoirs praticables et propres',            'أرصفة سالكة ونظيفة', 3),
  ('Regards et avaloirs vérifiés',                'التحقق من البالوعات', 4),
  ('Signalisation temporaire installée',          'تنصيب الإشارات المؤقتة', 5)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'voirie' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Propreté
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Lavage mécanique de la chaussée',        'غسل آلي للطريق', 1),
  ('Désherbage des trottoirs et terre-pleins', 'إزالة الأعشاب من الأرصفة', 2),
  ('Ramassage des déchets et encombrants',    'جمع النفايات والمخلفات', 3),
  ('Corbeilles vidées et nettoyées',          'تفريغ وتنظيف سلال المهملات', 4),
  ('Balayage final la veille',                'كنس نهائي عشية الحدث', 5),
  ('Mobilier urbain nettoyé',                 'تنظيف الأثاث الحضري', 6),
  ('Contrôle final le jour J',               'مراقبة نهائية يوم الحدث', 7)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'proprete' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Éclairage
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Lampadaires du parcours vérifiés',        'التحقق من أعمدة الإنارة على المسار', 1),
  ('Ampoules défectueuses remplacées',        'استبدال المصابيح المعطلة', 2),
  ('Éclairage d''ambiance installé si requis', 'تنصيب إنارة تزيينية إذا لزم', 3),
  ('Test nocturne effectué',                   'إجراء اختبار ليلي', 4),
  ('Groupe électrogène de secours disponible', 'توفير مولد كهربائي احتياطي', 5)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'eclairage' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Espaces verts
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Taille des haies et arbustes',            'تقليم الأسيجة والشجيرات', 1),
  ('Tonte du gazon',                          'جز العشب', 2),
  ('Fleurissement des parterres',             'تزيين الأحواض بالزهور', 3),
  ('Arrosage programmé la veille',            'برمجة الري عشية الحدث', 4),
  ('Mobilier de jardin vérifié',              'التحقق من أثاث الحدائق', 5)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'espaces_verts' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Mobilité
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Plan de circulation dévié validé',        'المصادقة على مخطط تحويل المرور', 1),
  ('Signalisation de déviation installée',    'تنصيب إشارات التحويل', 2),
  ('Agents de circulation positionnés',       'نشر أعوان المرور', 3),
  ('Coordination transports en commun',       'التنسيق مع النقل العمومي', 4),
  ('Itinéraire VIP balisé',                   'تحديد مسار الشخصيات', 5)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'mobilite' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Stationnement
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Zones de stationnement officiel balisées', 'تحديد مناطق الركن الرسمية', 1),
  ('Stationnement interdit sur le parcours',   'منع الركن على المسار', 2),
  ('Enlèvement des véhicules gênants',         'إزالة المركبات المعيقة', 3),
  ('Parking presse/médias identifié',           'تحديد موقف الصحافة', 4)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'stationnement' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Santé
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Poste de secours installé',               'تنصيب نقطة إسعاف', 1),
  ('Ambulance en standby',                    'سيارة إسعاف في الاستعداد', 2),
  ('Équipe médicale briefée',                 'إحاطة الفريق الطبي', 3),
  ('Accès hôpital le plus proche identifié',  'تحديد أقرب مستشفى', 4),
  ('Trousse de premiers secours vérifiée',    'التحقق من حقيبة الإسعافات', 5)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'sante' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- Communication
INSERT INTO gabarit_checklist (axe_id, libelle, libelle_ar, ordre)
SELECT a.id, v.libelle, v.libelle_ar, v.ordre
FROM gabarit_axe a, (VALUES
  ('Communiqué de presse rédigé',             'تحرير بيان صحفي', 1),
  ('Photographe officiel confirmé',           'تأكيد المصور الرسمي', 2),
  ('Point presse aménagé',                    'تهيئة نقطة الصحافة', 3),
  ('Réseaux sociaux — publications planifiées', 'تخطيط منشورات مواقع التواصل', 4),
  ('Banderoles et supports visuels installés', 'تنصيب اللافتات والدعائم البصرية', 5)
) AS v(libelle, libelle_ar, ordre) WHERE a.axe = 'communication' AND a.gabarit_id = (SELECT id FROM gabarit_evenement WHERE nom = 'Visite officielle');

-- ═══════════════════════════════════════════════════════
-- 12. Compte démo Cabinet
-- ═══════════════════════════════════════════════════════

INSERT INTO utilisateur (telephone, prenom, nom, email, role, fonction, niveau_perimetre, organisation_id, capacites, mot_de_passe, actif)
VALUES (
  '0550000011', 'Yacine', 'Benmoussa', 'yacine@demo.dz',
  'admin_wilaya', 'cabinet', 'wilaya', 3,
  ARRAY['pilotage','validation','ccoe'],
  -- mot de passe: copié depuis Amina (comptes agents mis à admin@@1234)
  (SELECT mot_de_passe FROM utilisateur WHERE telephone = '0550000001' LIMIT 1),
  TRUE
);

-- ═══════════════════════════════════════════════════════
-- Enregistrer la migration
-- ═══════════════════════════════════════════════════════
INSERT INTO _migrations (nom) VALUES ('017_ccoe_phase1.sql')
  ON CONFLICT DO NOTHING;
