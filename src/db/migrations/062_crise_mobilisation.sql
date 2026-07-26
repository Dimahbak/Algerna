-- Migration 062 : Mode crise CRISE-2 — Mobilisation des organismes + rattachement des signalements
-- Référentiel : docs/REFERENTIEL_MODE_CRISE.txt, section CRISE-2.
-- Organismes mobilisés par session (directions, EPIC, partenaires, APC — lus en base).
-- Signalements rattachés avec états de crise propres (ne remplacent pas les états normaux du dossier).

-- ═══ ORGANISMES MOBILISÉS PAR SESSION DE CRISE ═══
CREATE TABLE IF NOT EXISTS crise_organisme (
  id              SERIAL PRIMARY KEY,
  crise_id        INT NOT NULL REFERENCES crise_session(id) ON DELETE CASCADE,
  organisation_id INT NOT NULL REFERENCES organisations(id),
  auto_territorial BOOLEAN NOT NULL DEFAULT FALSE,
    -- TRUE = ajouté automatiquement d'après le périmètre géographique (daïra, APC)
    -- FALSE = sélectionné manuellement par le CC
  ajoute_par      UUID REFERENCES utilisateur(id),
  ajoute_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (crise_id, organisation_id)
);

CREATE INDEX IF NOT EXISTS idx_crise_org_crise ON crise_organisme(crise_id);
CREATE INDEX IF NOT EXISTS idx_crise_org_org ON crise_organisme(organisation_id);

-- ═══ SIGNALEMENTS RATTACHÉS À UNE SESSION DE CRISE ═══
-- États de crise propres : non_verifie → confirme → en_intervention → maitrise
-- Ces états coexistent avec le champ signalement.etat (recu, transmis, …) qu'ils ne remplacent pas.
CREATE TABLE IF NOT EXISTS crise_signalement (
  id              SERIAL PRIMARY KEY,
  crise_id        INT NOT NULL REFERENCES crise_session(id) ON DELETE CASCADE,
  signalement_id  UUID NOT NULL REFERENCES signalement(id) ON DELETE CASCADE,
  etat_crise      TEXT NOT NULL DEFAULT 'non_verifie',
    -- non_verifie : signalé mais pas encore confirmé sur le terrain
    -- confirme    : validé par l'APC / les agents CAP
    -- en_intervention : équipes mobilisées en cours de traitement
    -- maitrise    : situation sous contrôle
  rattache_par    UUID REFERENCES utilisateur(id),
  rattache_le     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auto_suggere    BOOLEAN NOT NULL DEFAULT FALSE,
    -- TRUE = proposé automatiquement (périmètre + type cohérent), confirmé par humain
  maj_etat_par    UUID REFERENCES utilisateur(id),
  maj_etat_le     TIMESTAMPTZ,
  UNIQUE (crise_id, signalement_id)
);

CREATE INDEX IF NOT EXISTS idx_crise_sig_crise ON crise_signalement(crise_id);
CREATE INDEX IF NOT EXISTS idx_crise_sig_sig ON crise_signalement(signalement_id);
CREATE INDEX IF NOT EXISTS idx_crise_sig_etat ON crise_signalement(etat_crise);
