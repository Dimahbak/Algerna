-- Sprint 6: Administration Centrale

-- Table de configuration système (clé/valeur)
CREATE TABLE IF NOT EXISTS config_systeme (
  cle TEXT PRIMARY KEY,
  valeur TEXT NOT NULL,
  description TEXT,
  module TEXT,
  modifie_par UUID REFERENCES utilisateur(id),
  modifie_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Engagements de Service par catégorie
CREATE TABLE IF NOT EXISTS engagement_service (
  id SERIAL PRIMARY KEY,
  categorie_id INT REFERENCES categorie_signal(id),
  famille TEXT,
  delai_cible_h INT NOT NULL DEFAULT 48,
  seuil_vigilance_pct INT NOT NULL DEFAULT 75,
  seuil_depassement_pct INT NOT NULL DEFAULT 100,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  modifie_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_es_categorie ON engagement_service(categorie_id);
CREATE INDEX IF NOT EXISTS idx_es_famille ON engagement_service(famille);

-- Catalogue missions CAP (administrable)
CREATE TABLE IF NOT EXISTS catalogue_mission_cap (
  id SERIAL PRIMARY KEY,
  categorie TEXT NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  photo_obligatoire BOOLEAN DEFAULT TRUE,
  geo_obligatoire BOOLEAN DEFAULT TRUE,
  commentaire_obligatoire BOOLEAN DEFAULT TRUE,
  actif BOOLEAN DEFAULT TRUE,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed config système
INSERT INTO config_systeme (cle, valeur, description, module) VALUES
  ('sla.delai_defaut_h', '48', 'Délai cible par défaut (heures)', 'sla'),
  ('sla.seuil_vigilance_pct', '75', 'Seuil de vigilance (%)', 'sla'),
  ('notif.push_actif', 'true', 'Notifications push activées', 'notifications'),
  ('notif.email_actif', 'false', 'Notifications email activées', 'notifications'),
  ('workflow.routage_auto', 'true', 'Routage automatique activé', 'workflow'),
  ('app.version', '1.0.0', 'Version de l''application', 'systeme'),
  ('app.maintenance', 'false', 'Mode maintenance', 'systeme')
ON CONFLICT (cle) DO NOTHING;

-- Seed catalogue missions CAP
INSERT INTO catalogue_mission_cap (categorie, nom, description) VALUES
  ('presence', 'Ronde de secteur', 'Patrouille de présence sur le secteur assigné'),
  ('presence', 'Surveillance école', 'Présence aux abords d''un établissement scolaire'),
  ('stationnement', 'Contrôle zone bleue', 'Vérification du respect du stationnement réglementé'),
  ('stationnement', 'Constat stationnement gênant', 'Constat de véhicule en stationnement gênant'),
  ('signalements', 'Inspection terrain', 'Vérification d''un signalement citoyen sur place'),
  ('signalements', 'Constat dégradation', 'Constat photographique d''une dégradation'),
  ('orientation', 'Aide administrative', 'Orientation d''un citoyen vers le bon service'),
  ('orientation', 'Information travaux', 'Information des riverains sur des travaux en cours'),
  ('assistance', 'Aide PMR', 'Assistance à une personne à mobilité réduite'),
  ('assistance', 'Aide numérique', 'Aide à l''utilisation de la plateforme ALGERNA')
ON CONFLICT DO NOTHING;

-- Enrichir commune pour admin
DO $$ BEGIN ALTER TABLE commune ADD COLUMN nom_ar TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE commune ADD COLUMN code TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE commune ADD COLUMN actif BOOLEAN DEFAULT TRUE; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
