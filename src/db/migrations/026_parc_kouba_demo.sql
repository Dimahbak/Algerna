-- Migration 026 : parc démo Kouba pour validation IQEP admin_apc

-- Ajouter nom_ar si absent
ALTER TABLE parc ADD COLUMN IF NOT EXISTS nom_ar TEXT;

-- Insérer le parc communal de Kouba (commune_id = 36)
INSERT INTO parc (nom, nom_ar, commune_id, lat, lng, superficie)
VALUES ('Parc communal de Kouba', 'حديقة بلدية القبة', 36, 36.7267, 3.0983, 4)
ON CONFLICT DO NOTHING;
