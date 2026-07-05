-- ════════════════════════════════════════════════════════════
-- MIGRATION 010 — RBAC Phase 0
-- Modele Fonction x Perimetre x Capacites
-- Phase preparatoire uniquement — aucun changement fonctionnel
-- Date : 2 juillet 2026
-- ════════════════════════════════════════════════════════════

-- 1. Ajout des colonnes (idempotent via IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'fonction'
  ) THEN
    ALTER TABLE utilisateur ADD COLUMN fonction TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'niveau_perimetre'
  ) THEN
    ALTER TABLE utilisateur ADD COLUMN niveau_perimetre TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'perimetre_id'
  ) THEN
    ALTER TABLE utilisateur ADD COLUMN perimetre_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'utilisateur' AND column_name = 'capacites'
  ) THEN
    ALTER TABLE utilisateur ADD COLUMN capacites TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 2. Remappage des comptes existants (IDEMPOTENT)
-- Ne touche QUE les lignes dont fonction est NULL (pas encore migrées)

-- Citoyens
UPDATE utilisateur
SET fonction = 'citoyen',
    niveau_perimetre = 'commune',
    capacites = '{}'
WHERE role = 'citoyen' AND fonction IS NULL;

-- Agents (Centre de Reception)
UPDATE utilisateur
SET fonction = 'agent_traitant',
    niveau_perimetre = 'commune',
    capacites = ARRAY['reception', 'qualification']
WHERE role = 'agent' AND fonction IS NULL;

-- Admin APC (Centre Operationnel / Superviseur communal)
UPDATE utilisateur
SET fonction = 'superviseur',
    niveau_perimetre = 'commune',
    capacites = ARRAY['pilotage']
WHERE role = 'admin_apc' AND fonction IS NULL;

-- Admin Wilaya (Pilotage strategique / Superviseur Wilaya)
UPDATE utilisateur
SET fonction = 'superviseur',
    niveau_perimetre = 'wilaya',
    capacites = ARRAY['pilotage', 'validation']
WHERE role = 'admin_wilaya' AND fonction IS NULL;

-- Operateurs (Entites responsables)
UPDATE utilisateur
SET fonction = 'entite_responsable',
    niveau_perimetre = 'entite',
    capacites = ARRAY['traitement']
WHERE role = 'operateur' AND fonction IS NULL;

-- 3. Remappage agents CAP (via la table cap_agent)
-- Un agent inscrit dans cap_agent est un agent traitant terrain
UPDATE utilisateur u
SET fonction = 'agent_traitant',
    niveau_perimetre = 'quartier',
    capacites = ARRAY['terrain', 'inspection', 'assistance', 'tournees']
FROM cap_agent ca
WHERE ca.utilisateur_id = u.id
  AND ca.actif = true
  AND (u.fonction IS NULL OR u.fonction = 'agent_traitant');

-- 4. Peupler perimetre_id pour les operateurs (depuis operateur_id)
UPDATE utilisateur
SET perimetre_id = operateur_id::TEXT
WHERE role = 'operateur' AND perimetre_id IS NULL AND operateur_id IS NOT NULL;

-- Peupler perimetre_id pour les comptes lies a une commune
UPDATE utilisateur
SET perimetre_id = commune_id::TEXT
WHERE niveau_perimetre IN ('commune', 'quartier') AND perimetre_id IS NULL AND commune_id IS NOT NULL;

-- ════════════════════════════════════════════════════════════
-- NOTES IMPORTANTES :
-- - Le champ 'role' n'est PAS modifie
-- - L'ENUM user_role n'est PAS modifie
-- - Aucune capacite 'publication' ou 'administration' n'est attribuee
-- - Ce script est idempotent : il peut etre relance sans effet
-- ════════════════════════════════════════════════════════════
