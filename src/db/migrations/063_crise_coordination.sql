-- Migration 063 : Mode crise CRISE-3 — Coordination (coeur de la boucle)
-- Référentiel : docs/REFERENTIEL_MODE_CRISE.txt, section CRISE-3.
-- États de mobilisation, accusés d'engagement, relances, points de situation,
-- cercle de visibilité restreint, rôle Wali délégué, traçabilité contacts.

-- ═══ PARAMÈTRES CONFIGURABLES (délais et cadences — jamais en dur) ═══
CREATE TABLE IF NOT EXISTS crise_param (
  cle         TEXT PRIMARY KEY,
  valeur      TEXT NOT NULL,
  description TEXT
);

-- Délais d'accusé d'engagement (en minutes)
INSERT INTO crise_param (cle, valeur, description) VALUES
  ('delai_engagement_critique', '15',   'Délai accusé d''engagement niveau critique (minutes)'),
  ('delai_engagement_majeur',   '60',   'Délai accusé d''engagement niveau majeur (minutes)'),
  ('delai_engagement_vigilance','240',  'Délai accusé d''engagement niveau vigilance (minutes)'),
  ('cadence_sitrep_critique',   '60',   'Cadence points de situation critique (minutes)'),
  ('cadence_sitrep_majeur',     '720',  'Cadence points de situation majeur (minutes, matin+soir)'),
  ('cadence_sitrep_vigilance',  '1440', 'Cadence points de situation vigilance (minutes, quotidien)')
ON CONFLICT (cle) DO NOTHING;

-- ═══ ÉTATS DE MOBILISATION PAR ORGANISME ═══
-- sollicite → engage → sur_place → desengage
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS etat_mobilisation TEXT NOT NULL DEFAULT 'sollicite';
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS referent_nom TEXT;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS referent_tel TEXT;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS engage_le TIMESTAMPTZ;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS sur_place_le TIMESTAMPTZ;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS desengage_le TIMESTAMPTZ;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS derniere_relance_le TIMESTAMPTZ;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS nb_relances INT NOT NULL DEFAULT 0;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS alerte_rouge BOOLEAN NOT NULL DEFAULT FALSE;
-- Traçabilité hors plateforme (organismes sans compte)
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS sans_compte BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS contact_hors_nom TEXT;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS contact_hors_quand TIMESTAMPTZ;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS contact_hors_par TEXT;
ALTER TABLE crise_organisme ADD COLUMN IF NOT EXISTS contact_hors_reponse TEXT;

-- ═══ JOURNAL DE MOBILISATION (horodatage de chaque changement) ═══
CREATE TABLE IF NOT EXISTS crise_mobilisation_log (
  id              SERIAL PRIMARY KEY,
  crise_id        INT NOT NULL REFERENCES crise_session(id) ON DELETE CASCADE,
  organisation_id INT NOT NULL REFERENCES organisations(id),
  ancien_etat     TEXT,
  nouvel_etat     TEXT NOT NULL,
  referent_nom    TEXT,
  referent_tel    TEXT,
  auteur_id       UUID REFERENCES utilisateur(id),
  horodatage      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mob_log_crise ON crise_mobilisation_log(crise_id);

-- ═══ POINTS DE SITUATION ═══
-- Format court : fait / en_cours / bloque / besoin
-- Chaîne : APC → Wilaya déléguée → CC ; directions/EPIC → CC direct
CREATE TABLE IF NOT EXISTS crise_point_situation (
  id              SERIAL PRIMARY KEY,
  crise_id        INT NOT NULL REFERENCES crise_session(id) ON DELETE CASCADE,
  auteur_id       UUID NOT NULL REFERENCES utilisateur(id),
  organisation_id INT REFERENCES organisations(id),
  -- Contenu structuré
  fait            TEXT,
  en_cours        TEXT,
  bloque          TEXT,
  besoin          TEXT,
  -- Chaîne de consolidation
  destinataire    TEXT NOT NULL DEFAULT 'cc',
    -- 'cc' = direct au CC (directions/EPIC)
    -- 'wilaya_deleguee' = vers le Wali délégué (APC)
    -- 'consolide' = consolidé par le Wali délégué vers le CC
  consolide_par   UUID REFERENCES utilisateur(id),
  consolide_le    TIMESTAMPTZ,
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sitrep_crise ON crise_point_situation(crise_id);
CREATE INDEX IF NOT EXISTS idx_sitrep_dest ON crise_point_situation(destinataire);

-- ═══ VISIBILITÉ RESTREINTE (cercle ordre public) ═══
ALTER TABLE crise_session ADD COLUMN IF NOT EXISTS visibilite_restreinte BOOLEAN NOT NULL DEFAULT FALSE;

-- Profils explicitement habilités pour une session restreinte
CREATE TABLE IF NOT EXISTS crise_habilite (
  crise_id       INT NOT NULL REFERENCES crise_session(id) ON DELETE CASCADE,
  utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
  PRIMARY KEY (crise_id, utilisateur_id)
);

-- ═══ PERSONAS WALI DÉLÉGUÉ DE TEST ═══
-- Daïra 1 = Sidi M'Hamed (org 42, circ 1)
-- Daïra 5 = Chéraga (org 46, circ 5)
INSERT INTO utilisateur (telephone, prenom, nom, email, role, fonction, niveau_perimetre, organisation_id, capacites, mot_de_passe, actif)
VALUES (
  '0550000015', 'Ahmed', 'Khelifi', 'ahmed.khelifi@demo.dz',
  'admin_apc', 'wali_delegue', 'circonscription', 42,
  '{coordination_crise}',
  '$2a$12$A6UlPPGSCd.Xu3nO9g64w.y2wkVA2Y0CFlHTxbrBTqGF2GKkYtPEq',
  TRUE
) ON CONFLICT (telephone) DO NOTHING;

INSERT INTO utilisateur (telephone, prenom, nom, email, role, fonction, niveau_perimetre, organisation_id, capacites, mot_de_passe, actif)
VALUES (
  '0550000016', 'Djamila', 'Bouzid', 'djamila.bouzid@demo.dz',
  'admin_apc', 'wali_delegue', 'circonscription', 46,
  '{coordination_crise}',
  '$2a$12$A6UlPPGSCd.Xu3nO9g64w.y2wkVA2Y0CFlHTxbrBTqGF2GKkYtPEq',
  TRUE
) ON CONFLICT (telephone) DO NOTHING;
-- Ahmed Khelifi → Daïra Sidi M'Hamed (org 42) → couvre circonscription 1
-- Djamila Bouzid → Daïra Chéraga (org 46) → couvre circonscription 5
