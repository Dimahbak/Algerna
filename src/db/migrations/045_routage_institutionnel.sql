-- 045 : Routage institutionnel — couche de données organisationnelle
-- Ne remplace PAS le routage EPIC existant (epic_id). Ajoute des
-- champs de responsabilité institutionnelle parallèles.

-- A. Table categorie_routage (70 catégories → pilote + exécutant + mode)
CREATE TABLE IF NOT EXISTS categorie_routage (
  categorie_id INTEGER PRIMARY KEY REFERENCES categorie_signal(id),
  direction_pilote_id INTEGER REFERENCES organisations(id),
  organisation_executante_id INTEGER REFERENCES organisations(id),
  mode_routage TEXT NOT NULL CHECK (mode_routage IN ('fixe','territorial','dynamique','tri_humain')) DEFAULT 'fixe',
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Remplissage : voir script Node (IDs dynamiques, pilote/exécutant déduits)

-- B. Colonnes sur signalement
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS direction_pilote_id INTEGER REFERENCES organisations(id);
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS organisation_executante_id INTEGER REFERENCES organisations(id);
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS daira_id INTEGER REFERENCES daira(id);
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS autorite_escalade TEXT;
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS responsable_nominatif TEXT;

-- Backfill : pilote + exécutant depuis categorie_routage, daira depuis commune
-- Branchement : POST /signalements remplit les 3 champs à la création

-- PRINCIPES ACTÉS :
-- - Dépôt sauvage simple (cat 1) → collecte Propreté/APC
-- - CET (Redouane) = réception/traitement uniquement (cat 17 + environnement)
-- - Une daïra n'est JAMAIS exécutante (coordination/escalade uniquement)

INSERT INTO _migrations (nom) VALUES ('045_routage_institutionnel') ON CONFLICT DO NOTHING;
