-- ════════════════════════════════════════════════════════════
-- MIGRATION 010b — RBAC Phase 0 bis
-- Renommage perimetre → niveau_perimetre
-- Ajout table organisations + organisation_id
-- IDEMPOTENT — peut etre relance sans risque
-- Date : 2 juillet 2026
-- ════════════════════════════════════════════════════════════

-- ══════════════════════════════════════
-- 1. RENOMMAGE perimetre → niveau_perimetre
-- ══════════════════════════════════════
DO $$
BEGIN
  -- Renommer la colonne si elle existe encore sous l'ancien nom
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'perimetre'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'niveau_perimetre'
  ) THEN
    ALTER TABLE utilisateur RENAME COLUMN perimetre TO niveau_perimetre;
  END IF;
END $$;

-- Si la colonne n'existait pas du tout (cas improbable), la creer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'niveau_perimetre'
  ) THEN
    ALTER TABLE utilisateur ADD COLUMN niveau_perimetre TEXT;
  END IF;
END $$;

-- ══════════════════════════════════════
-- 2. TABLE organisations
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS organisations (
  id         SERIAL PRIMARY KEY,
  nom        TEXT NOT NULL,
  type       TEXT NOT NULL,
  parent_id  INTEGER REFERENCES organisations(id),
  actif      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════
-- 3. COLONNE organisation_id sur utilisateur
-- ══════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'organisation_id'
  ) THEN
    ALTER TABLE utilisateur ADD COLUMN organisation_id INTEGER REFERENCES organisations(id);
  END IF;
END $$;

-- ══════════════════════════════════════
-- 4. DONNEES INITIALES organisations (IDEMPOTENT)
-- Utilise INSERT ... ON CONFLICT pour eviter les doublons
-- ══════════════════════════════════════

-- Creer un index unique pour l'idempotence
CREATE UNIQUE INDEX IF NOT EXISTS idx_organisations_nom_type
  ON organisations(nom, type);

-- Organisations racines
INSERT INTO organisations (nom, type, parent_id)
VALUES ('Wilaya d''Alger', 'wilaya', NULL)
ON CONFLICT (nom, type) DO NOTHING;

-- Sous-organisations de la Wilaya
INSERT INTO organisations (nom, type, parent_id)
VALUES (
  'Centre de Reception et de Coordination',
  'service',
  (SELECT id FROM organisations WHERE nom = 'Wilaya d''Alger' AND type = 'wilaya')
)
ON CONFLICT (nom, type) DO NOTHING;

INSERT INTO organisations (nom, type, parent_id)
VALUES (
  'Cabinet — Secretariat General',
  'cabinet',
  (SELECT id FROM organisations WHERE nom = 'Wilaya d''Alger' AND type = 'wilaya')
)
ON CONFLICT (nom, type) DO NOTHING;

INSERT INTO organisations (nom, type, parent_id)
VALUES (
  'Centre Operationnel de Coordination',
  'service',
  (SELECT id FROM organisations WHERE nom = 'Wilaya d''Alger' AND type = 'wilaya')
)
ON CONFLICT (nom, type) DO NOTHING;

-- Entites responsables (EPIC / operateurs)
INSERT INTO organisations (nom, type, parent_id)
VALUES (
  'Netcom Alger',
  'epic',
  (SELECT id FROM organisations WHERE nom = 'Wilaya d''Alger' AND type = 'wilaya')
)
ON CONFLICT (nom, type) DO NOTHING;

INSERT INTO organisations (nom, type, parent_id)
VALUES (
  'SEAAL',
  'epic',
  (SELECT id FROM organisations WHERE nom = 'Wilaya d''Alger' AND type = 'wilaya')
)
ON CONFLICT (nom, type) DO NOTHING;

-- ══════════════════════════════════════
-- 5. AFFECTATION organisation_id aux comptes de demo (IDEMPOTENT)
-- Ne touche que les comptes dont organisation_id est NULL
-- ══════════════════════════════════════

-- 0550000001 (citoyen) → pas d'organisation
-- 0550000002 (agent / Centre de Reception)
UPDATE utilisateur
SET organisation_id = (SELECT id FROM organisations WHERE nom = 'Centre de Reception et de Coordination' AND type = 'service')
WHERE telephone = '0550000002' AND organisation_id IS NULL;

-- 0550000003 (admin_wilaya / Cabinet)
UPDATE utilisateur
SET organisation_id = (SELECT id FROM organisations WHERE nom = 'Cabinet — Secretariat General' AND type = 'cabinet')
WHERE telephone = '0550000003' AND organisation_id IS NULL;

-- 0550000004 (admin_apc / Centre Operationnel)
UPDATE utilisateur
SET organisation_id = (SELECT id FROM organisations WHERE nom = 'Centre Operationnel de Coordination' AND type = 'service')
WHERE telephone = '0550000004' AND organisation_id IS NULL;

-- 0550000005 (operateur / Netcom)
UPDATE utilisateur
SET organisation_id = (SELECT id FROM organisations WHERE nom = 'Netcom Alger' AND type = 'epic')
WHERE telephone = '0550000005' AND organisation_id IS NULL;

-- 0550000006 (operateur / SEAAL)
UPDATE utilisateur
SET organisation_id = (SELECT id FROM organisations WHERE nom = 'SEAAL' AND type = 'epic')
WHERE telephone = '0550000006' AND organisation_id IS NULL;

-- ════════════════════════════════════════════════════════════
-- NOTES :
-- - La colonne 'role' n'est PAS modifiee
-- - La colonne 'perimetre' est renommee en 'niveau_perimetre'
-- - Aucun code applicatif ne reference encore ces colonnes
-- - Le script est idempotent
-- ════════════════════════════════════════════════════════════
