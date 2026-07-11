-- Mission 2/5 Alger Propre 2030 : Propreté citoyen
-- Ajoute quartier_id (FK) et rappel_proprete à utilisateur

ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS quartier_id INTEGER REFERENCES quartier(id);
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS rappel_proprete BOOLEAN NOT NULL DEFAULT TRUE;

-- Index pour le cron de rappels
CREATE INDEX IF NOT EXISTS idx_utilisateur_quartier ON utilisateur(quartier_id) WHERE quartier_id IS NOT NULL;
