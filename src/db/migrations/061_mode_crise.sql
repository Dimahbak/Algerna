-- Migration 061 : Mode crise — sessions de crise multi-événements
-- Plusieurs sessions actives en parallèle.
-- Périmètre géographique via tables de jointure (circonscriptions + communes du référentiel).
-- Gouvernance à 3 niveaux d'activation (vigilance, majeur, critique).
-- Champs préparés pour les étapes futures (main courante, rattachement signalements).

-- ═══ TABLE PRINCIPALE : session de crise ═══
CREATE TABLE IF NOT EXISTS crise_session (
  id              SERIAL PRIMARY KEY,
  titre           TEXT NOT NULL,
  titre_ar        TEXT,
  type_crise      TEXT NOT NULL DEFAULT 'general',
    -- types : incendie, inondation, seisme, manifestation, attentat, sanitaire, infrastructure, general
  niveau          TEXT NOT NULL DEFAULT 'vigilance',
    -- 3 niveaux de gouvernance :
    --   vigilance : alerte sectorielle, tout profil CC autorisé
    --   majeur    : crise multi-services, admin_wilaya (cabinet + superviseur)
    --   critique  : crise majeure, admin_wilaya superviseur uniquement
  statut          TEXT NOT NULL DEFAULT 'active',
    -- active, cloture_provisoire, cloture_definitive (cloture_definitive = Crise-4)
  active_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cloture_le      TIMESTAMPTZ,
  active_par      UUID NOT NULL REFERENCES utilisateur(id),
  cloture_par     UUID REFERENCES utilisateur(id),
  notes           TEXT,
  -- Champs préparés pour étapes futures (non implémentés dans Crise-1)
  -- main_courante : table séparée future
  -- signalements_rattaches : via crise_signalement future
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  maj_le          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══ PÉRIMÈTRE GÉOGRAPHIQUE : circonscriptions concernées ═══
CREATE TABLE IF NOT EXISTS crise_circonscription (
  crise_id          INT NOT NULL REFERENCES crise_session(id) ON DELETE CASCADE,
  circonscription_id SMALLINT NOT NULL REFERENCES circonscription(id),
  PRIMARY KEY (crise_id, circonscription_id)
);

-- ═══ PÉRIMÈTRE GÉOGRAPHIQUE : communes concernées (granularité fine) ═══
CREATE TABLE IF NOT EXISTS crise_commune (
  crise_id    INT NOT NULL REFERENCES crise_session(id) ON DELETE CASCADE,
  commune_id  INT NOT NULL REFERENCES commune(id),
  PRIMARY KEY (crise_id, commune_id)
);

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_crise_session_statut ON crise_session(statut);
CREATE INDEX IF NOT EXISTS idx_crise_session_active ON crise_session(statut) WHERE statut = 'active';
