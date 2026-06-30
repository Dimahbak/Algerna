-- Sprint 2: Workflow complet signalements
-- Mission CAP, historique enrichi, transmission

-- Enrichir signalement_historique
DO $$ BEGIN ALTER TABLE signalement_historique ADD COLUMN commentaire TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE signalement_historique ADD COLUMN action TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE signalement_historique ADD COLUMN ancien_etat TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Ajouter assignation sur signalement
DO $$ BEGIN ALTER TABLE signalement ADD COLUMN assigne_a UUID REFERENCES utilisateur(id); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE signalement ADD COLUMN transmis_a TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE signalement ADD COLUMN motif_rejet TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Table mission_cap
CREATE TABLE IF NOT EXISTS mission_cap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signalement_id UUID NOT NULL REFERENCES signalement(id),
  type TEXT NOT NULL DEFAULT 'constat',
  priorite TEXT NOT NULL DEFAULT 'normale',
  commentaire TEXT,
  secteur TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  etat TEXT NOT NULL DEFAULT 'cree',
  cree_par UUID REFERENCES utilisateur(id),
  affecte_a UUID REFERENCES utilisateur(id),
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  maj_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_cap_etat ON mission_cap(etat);
CREATE INDEX IF NOT EXISTS idx_mission_cap_signal ON mission_cap(signalement_id);

-- Audit log enrichi
DO $$ BEGIN ALTER TABLE audit_log ADD COLUMN ancien_etat TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE audit_log ADD COLUMN nouveau_etat TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE audit_log ADD COLUMN commentaire TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
