-- Migration 027 : Module collecte des déchets
-- A. Capacité collecte_dechets pour Nassim (Direction Propreté)
UPDATE utilisateur SET capacites = array_append(capacites, 'collecte_dechets')
WHERE telephone = '0550000005' AND NOT ('collecte_dechets' = ANY(COALESCE(capacites, ARRAY[]::TEXT[])));

-- B. Table categorie_dechet
CREATE TABLE IF NOT EXISTS categorie_dechet (
  id             SERIAL PRIMARY KEY,
  nom_fr         TEXT NOT NULL UNIQUE,
  nom_ar         TEXT,
  rappel_defaut  BOOLEAN NOT NULL DEFAULT FALSE,
  statut         TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif','inactif')),
  cree_le        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO categorie_dechet (nom_fr, nom_ar, rappel_defaut) VALUES
  ('menagers', 'منزلية', FALSE),
  ('tri', 'فرز انتقائي', TRUE),
  ('encombrants', 'نفايات ضخمة', TRUE)
ON CONFLICT (nom_fr) DO NOTHING;

-- C. FK optionnel sur creneau_depot (backward compat)
ALTER TABLE creneau_depot ADD COLUMN IF NOT EXISTS categorie_dechet_id INTEGER REFERENCES categorie_dechet(id);
UPDATE creneau_depot SET categorie_dechet_id = (
  SELECT id FROM categorie_dechet WHERE nom_fr = creneau_depot.type_collecte
) WHERE categorie_dechet_id IS NULL;

-- D. Tables notes bidirectionnelles
CREATE TABLE IF NOT EXISTS note_proprete (
  id          SERIAL PRIMARY KEY,
  auteur_id   UUID NOT NULL REFERENCES utilisateur(id),
  titre       TEXT NOT NULL,
  texte       TEXT NOT NULL,
  niveau      TEXT NOT NULL DEFAULT 'info' CHECK (niveau IN ('info','important','urgent')),
  communes    INTEGER[] DEFAULT '{}',
  cree_le     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS note_proprete_lu (
  note_id        INTEGER NOT NULL REFERENCES note_proprete(id) ON DELETE CASCADE,
  utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
  lu_le          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (note_id, utilisateur_id)
);
CREATE INDEX IF NOT EXISTS idx_note_proprete_auteur ON note_proprete(auteur_id);
