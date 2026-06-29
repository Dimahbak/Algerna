-- 003_communique_admin.sql
-- Ajout des colonnes admin + table d'audit pour communiqués

-- Ajout colonne statut
DO $$ BEGIN
  ALTER TABLE communique ADD COLUMN statut TEXT NOT NULL DEFAULT 'publie';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajout colonne priorite
DO $$ BEGIN
  ALTER TABLE communique ADD COLUMN priorite TEXT NOT NULL DEFAULT 'normale';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ajout colonne maj_le
DO $$ BEGIN
  ALTER TABLE communique ADD COLUMN maj_le TIMESTAMPTZ NOT NULL DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Table d'audit
CREATE TABLE IF NOT EXISTS communique_audit (
  id BIGSERIAL PRIMARY KEY,
  communique_id INT NOT NULL REFERENCES communique(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  par_utilisateur UUID REFERENCES utilisateur(id),
  details JSONB,
  le TIMESTAMPTZ NOT NULL DEFAULT now()
);
