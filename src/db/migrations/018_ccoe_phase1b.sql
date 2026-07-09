-- Migration 018 : CCOE Phase 1b — type Autre, itinéraire/zones, annuaire contacts
-- Appliquée le 2026-07-09

-- ═══════════════════════════════════════════════════════
-- 1. Type « autre » + champ type_label
-- ═══════════════════════════════════════════════════════

ALTER TYPE evenement_type ADD VALUE IF NOT EXISTS 'autre';

ALTER TABLE evenement ADD COLUMN IF NOT EXISTS type_label text;
-- type_label obligatoire quand type='autre', libre sinon

-- ═══════════════════════════════════════════════════════
-- 2. Itinéraire et zones GeoJSON
-- ═══════════════════════════════════════════════════════

ALTER TABLE evenement ADD COLUMN IF NOT EXISTS itineraire_geojson jsonb;
ALTER TABLE evenement ADD COLUMN IF NOT EXISTS zones_geojson jsonb;
ALTER TABLE evenement ADD COLUMN IF NOT EXISTS itineraire_description text;
ALTER TABLE evenement ADD COLUMN IF NOT EXISTS itineraire_description_ar text;

-- ═══════════════════════════════════════════════════════
-- 3. Annuaire CCOE (contacts responsables par axe)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ccoe_contact (
  id            serial PRIMARY KEY,
  nom           text NOT NULL,
  prenom        text,
  telephone     text,
  email         text,
  organisation_id integer REFERENCES organisations(id),
  axe           chantier_axe,
  fonction_label text,
  fonction_label_ar text,
  actif         boolean NOT NULL DEFAULT TRUE,
  cree_le       timestamptz NOT NULL DEFAULT NOW(),
  maj_le        timestamptz NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- 4. Type de message dans les commentaires chantier
-- ═══════════════════════════════════════════════════════

ALTER TABLE chantier_commentaire ADD COLUMN IF NOT EXISTS type_message text;
-- types : 'demande_precision', 'relance', 'point_situation', 'demande_rapport', NULL (commentaire libre)

-- ═══════════════════════════════════════════════════════
-- 5. Seed annuaire demo-safe
-- ═══════════════════════════════════════════════════════

INSERT INTO ccoe_contact (nom, prenom, telephone, email, organisation_id, axe, fonction_label, fonction_label_ar) VALUES
  ('Benali',    'Kamel',   '0550100001', 'responsable.securite@demo.dz',      4,  'securite',      'Chef de la sécurité',                'رئيس الأمن'),
  ('Medjdoub',  'Salim',   '0550100002', 'responsable.protocole@demo.dz',     3,  'protocole',     'Chef du protocole',                  'رئيس البروتوكول'),
  ('Khelifi',   'Amine',   '0550100003', 'responsable.voirie@demo.dz',        6,  'voirie',        'Directeur adjoint voirie',           'نائب مدير الطرقات'),
  ('Hamidi',    'Noureddine','0550100004','responsable.proprete@demo.dz',      5,  'proprete',      'Responsable nettoiement',            'مسؤول النظافة'),
  ('Boudiaf',   'Rachida', '0550100005', 'responsable.eclairage@demo.dz',    23,  'eclairage',     'Chef service éclairage',             'رئيس مصلحة الإنارة'),
  ('Ferhat',    'Djamel',  '0550100006', 'responsable.espaces-verts@demo.dz',13,  'espaces_verts', 'Responsable espaces verts',          'مسؤول المساحات الخضراء'),
  ('Mansouri',  'Tarik',   '0550100007', 'responsable.mobilite@demo.dz',      6,  'mobilite',      'Chef service circulation',           'رئيس مصلحة المرور'),
  ('Zidane',    'Yassine', '0550100008', 'responsable.stationnement@demo.dz',16,  'stationnement', 'Responsable parkings',               'مسؤول مواقف السيارات'),
  ('Bouazza',   'Houria',  '0550100009', 'responsable.sante@demo.dz',        24,  'sante',         'Responsable sanitaire',              'المسؤول الصحي'),
  ('Tlemcani',  'Fatima',  '0550100010', 'responsable.communication@demo.dz',25,  'communication', 'Chargée de communication',           'مكلفة بالاتصال'),
  ('Zerrouki',  'Mohamed', '0550100011', 'responsable.logistique@demo.dz',    4,  'logistique',    'Chef logistique',                    'رئيس اللوجستيك');

-- ═══════════════════════════════════════════════════════
-- 6. Enregistrement migration
-- ═══════════════════════════════════════════════════════

INSERT INTO _migrations (nom) VALUES ('018_ccoe_phase1b.sql');
