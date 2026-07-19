-- 033_perdu_trouve.sql
-- Registre Perdu-Trouvé : déclarations citoyennes, registre back-office distinct des signalements.

CREATE TABLE IF NOT EXISTS declaration_perdu_trouve (
  id            SERIAL PRIMARY KEY,
  reference     TEXT NOT NULL UNIQUE,
  type          TEXT NOT NULL CHECK (type IN ('perte','trouve')),
  nature        TEXT NOT NULL CHECK (nature IN ('document_officiel','objet')),
  description   TEXT NOT NULL,
  lieu          TEXT,
  date_fait     DATE,
  photo_path    TEXT,
  declarant_id  UUID NOT NULL REFERENCES utilisateur(id),
  declarant_nom TEXT,
  declarant_tel TEXT,
  statut        TEXT NOT NULL DEFAULT 'recue' CHECK (statut IN ('recue','traitee','cloturee')),
  traite_par    UUID REFERENCES utilisateur(id),
  note_agent    TEXT,
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_le        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dpt_declarant ON declaration_perdu_trouve(declarant_id);
CREATE INDEX IF NOT EXISTS idx_dpt_statut ON declaration_perdu_trouve(statut);

INSERT INTO _migrations (nom) VALUES ('033_perdu_trouve') ON CONFLICT DO NOTHING;
