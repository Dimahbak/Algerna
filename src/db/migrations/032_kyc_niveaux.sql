-- 032_kyc_niveaux.sql
-- KYC : niveaux de compte, NIN déclaré, coordonnées houma, refus capture douce.

-- A. Niveau de compte (1=Simple, 2=Vérifié, 3=Certifié, 4=Hautement sécurisé)
-- Seuls 1 et 2 sont atteignables ; 3 et 4 sont structurels (« à venir »).
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS niveau_compte SMALLINT NOT NULL DEFAULT 1
  CHECK (niveau_compte BETWEEN 1 AND 4);

-- B. NIN déclaré (18 chiffres, unique)
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS nin TEXT
  CONSTRAINT nin_format CHECK (nin ~ '^\d{18}$')
  CONSTRAINT nin_unique UNIQUE;

-- C. Coordonnées houma (fallback quand quartier_id ne matche pas le référentiel)
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS houma_lat DOUBLE PRECISION;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS houma_lng DOUBLE PRECISION;

-- D. Refus capture douce (ne jamais reproposer après refus)
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS houma_refus_capture BOOLEAN NOT NULL DEFAULT FALSE;

-- E. Comptes existants : niveau 1, nin null — aucun impact
-- (les DEFAULT font le travail)

INSERT INTO _migrations (nom) VALUES ('032_kyc_niveaux') ON CONFLICT DO NOTHING;
