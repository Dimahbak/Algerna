-- Sprint 7: ICUA Engine

-- Historique ICUA
CREATE TABLE IF NOT EXISTS icua_historique (
  id BIGSERIAL PRIMARY KEY,
  commune_id INT REFERENCES commune(id),
  score NUMERIC(5,2) NOT NULL,
  engagement_service NUMERIC(5,2),
  taux_resolution NUMERIC(5,2),
  temps_moyen NUMERIC(5,2),
  activite_cap NUMERIC(5,2),
  satisfaction NUMERIC(5,2),
  communication NUMERIC(5,2),
  sante_operationnelle NUMERIC(5,2),
  periode TEXT DEFAULT 'jour',
  calcule_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_icua_hist_date ON icua_historique(calcule_le);
CREATE INDEX IF NOT EXISTS idx_icua_hist_commune ON icua_historique(commune_id);

-- Config ICUA (pondérations)
INSERT INTO config_systeme (cle, valeur, description, module) VALUES
  ('icua.poids.engagement', '40', 'Pondération Engagement de Service (%)', 'icua'),
  ('icua.poids.resolution', '20', 'Pondération Taux de résolution (%)', 'icua'),
  ('icua.poids.temps', '15', 'Pondération Temps moyen (%)', 'icua'),
  ('icua.poids.cap', '10', 'Pondération Activité CAP (%)', 'icua'),
  ('icua.poids.satisfaction', '10', 'Pondération Satisfaction citoyenne (%)', 'icua'),
  ('icua.poids.communication', '5', 'Pondération Communication (%)', 'icua'),
  ('icua.seuil.excellent', '90', 'Seuil Excellent', 'icua'),
  ('icua.seuil.bon', '75', 'Seuil Bon', 'icua'),
  ('icua.seuil.vigilance', '60', 'Seuil Vigilance', 'icua')
ON CONFLICT (cle) DO NOTHING;
