-- Sprint 3: Application CAP
DO $$ BEGIN ALTER TABLE mission_cap ADD COLUMN commentaire_cap TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mission_cap ADD COLUMN motif_blocage TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mission_cap ADD COLUMN photo_path TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mission_cap ADD COLUMN cloture_lat DOUBLE PRECISION; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mission_cap ADD COLUMN cloture_lng DOUBLE PRECISION; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mission_cap ADD COLUMN cloture_le TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mission_cap ADD COLUMN origine TEXT DEFAULT 'agent'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Historique missions CAP
CREATE TABLE IF NOT EXISTS mission_cap_historique (
  id BIGSERIAL PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES mission_cap(id) ON DELETE CASCADE,
  etat TEXT NOT NULL,
  par_utilisateur UUID REFERENCES utilisateur(id),
  commentaire TEXT,
  le TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mch_mission ON mission_cap_historique(mission_id);

-- Assistance citoyenne (actions CAP hors missions)
CREATE TABLE IF NOT EXISTS cap_assistance (
  id SERIAL PRIMARY KEY,
  cap_id UUID NOT NULL REFERENCES utilisateur(id),
  type TEXT NOT NULL,
  commentaire TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
