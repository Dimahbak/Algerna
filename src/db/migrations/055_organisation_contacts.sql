-- 055 : Contacts opérationnels des partenaires/organisations — éditables Salle de Commandement
-- Champs de suivi : personne de contact, téléphone direct, email,
-- direction Wilaya concernée, remarques.

ALTER TABLE organisations ADD COLUMN IF NOT EXISTS contact_nom TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS contact_fonction TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS contact_telephone TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS direction_concernee_id INTEGER REFERENCES organisations(id);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS remarques TEXT;

INSERT INTO _migrations (nom) VALUES ('055_organisation_contacts') ON CONFLICT DO NOTHING;
