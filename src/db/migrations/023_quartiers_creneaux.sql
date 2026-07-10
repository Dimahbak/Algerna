-- 023 : Alger Propre 2030 — Quartiers et créneaux de dépôt des déchets
-- Phase A, Mission 1/5

CREATE TABLE IF NOT EXISTS quartier (
  id            SERIAL PRIMARY KEY,
  nom           TEXT NOT NULL,
  nom_ar        TEXT,
  commune_id    INTEGER NOT NULL REFERENCES commune(id),
  perimetre     JSONB,          -- GeoJSON optionnel
  statut        TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif','inactif')),
  source        TEXT DEFAULT 'officiel', -- 'demo' pour les données de démonstration
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_le        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creneau_depot (
  id            SERIAL PRIMARY KEY,
  quartier_id   INTEGER NOT NULL REFERENCES quartier(id) ON DELETE CASCADE,
  jour          SMALLINT NOT NULL CHECK (jour BETWEEN 0 AND 6), -- 0=dimanche … 6=samedi
  heure_debut   TIME NOT NULL,
  heure_fin     TIME NOT NULL,
  type_collecte TEXT NOT NULL CHECK (type_collecte IN ('menagers','tri','encombrants')),
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quartier_commune ON quartier(commune_id);
CREATE INDEX IF NOT EXISTS idx_creneau_quartier ON creneau_depot(quartier_id);

INSERT INTO _migrations (nom) VALUES ('023_quartiers_creneaux') ON CONFLICT DO NOTHING;
