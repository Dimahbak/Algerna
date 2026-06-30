-- Sprint 5: Workflow complet communiqués institutionnels

-- Enrichir la table communique
DO $$ BEGIN ALTER TABLE communique ADD COLUMN titre_ar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN message_ar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN detail_ar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN image_path TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN service TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN validateur_id UUID REFERENCES utilisateur(id); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN valide_le TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN archive_le TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN date_publication TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE communique ADD COLUMN commentaire_revision TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Historique des communiqués (workflow)
CREATE TABLE IF NOT EXISTS communique_workflow (
  id BIGSERIAL PRIMARY KEY,
  communique_id INT NOT NULL REFERENCES communique(id) ON DELETE CASCADE,
  ancien_statut TEXT,
  nouveau_statut TEXT NOT NULL,
  action TEXT NOT NULL,
  par_utilisateur UUID REFERENCES utilisateur(id),
  commentaire TEXT,
  le TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cw_communique ON communique_workflow(communique_id);

-- Catégories communiqués (paramétrable)
CREATE TABLE IF NOT EXISTS communique_categorie (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  libelle_fr TEXT NOT NULL,
  libelle_ar TEXT,
  actif BOOLEAN DEFAULT TRUE,
  ordre INT DEFAULT 0
);

INSERT INTO communique_categorie (code, libelle_fr, libelle_ar, ordre) VALUES
  ('information', 'Information', 'معلومات', 1),
  ('travaux', 'Travaux', 'أشغال', 2),
  ('circulation', 'Circulation', 'مرور', 3),
  ('eau', 'Eau', 'مياه', 4),
  ('electricite', 'Électricité', 'كهرباء', 5),
  ('proprete', 'Propreté', 'نظافة', 6),
  ('espaces_verts', 'Espaces verts', 'مساحات خضراء', 7),
  ('evenement', 'Événement', 'حدث', 8),
  ('securite', 'Sécurité', 'أمن', 9),
  ('urgence', 'Urgence', 'طوارئ', 10),
  ('institutionnel', 'Institutionnel', 'مؤسسي', 11)
ON CONFLICT (code) DO NOTHING;
