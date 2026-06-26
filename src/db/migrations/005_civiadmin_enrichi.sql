-- Migration 005 : CiviAdmin enrichi — Démarches B, pièces, assistant, prioritaire, évaluation
-- Appliquée le 2026-06-26

-- ═══ UP ═══

-- Enrichir la table service (démarches)
ALTER TABLE service ADD COLUMN IF NOT EXISTS categorie TEXT;
ALTER TABLE service ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE service ADD COLUMN IF NOT EXISTS pieces_requises JSONB DEFAULT '[]';
ALTER TABLE service ADD COLUMN IF NOT EXISTS formulaires JSONB DEFAULT '[]';
ALTER TABLE service ADD COLUMN IF NOT EXISTS frais TEXT;
ALTER TABLE service ADD COLUMN IF NOT EXISTS delai_reel TEXT;
ALTER TABLE service ADD COLUMN IF NOT EXISTS assistant_questions JSONB DEFAULT '[]';

-- Public prioritaire sur la réservation
CREATE TYPE public_prioritaire AS ENUM ('age', 'handicap', 'femme_enceinte');
ALTER TABLE rdv ADD COLUMN IF NOT EXISTS public_prioritaire public_prioritaire;

-- Évaluation post-RDV
ALTER TABLE rdv ADD COLUMN IF NOT EXISTS note_satisfaction SMALLINT
  CHECK (note_satisfaction IS NULL OR (note_satisfaction >= 1 AND note_satisfaction <= 5));
ALTER TABLE rdv ADD COLUMN IF NOT EXISTS rdv_honore BOOLEAN;
ALTER TABLE rdv ADD COLUMN IF NOT EXISTS delai_respecte BOOLEAN;
ALTER TABLE rdv ADD COLUMN IF NOT EXISTS commentaire_eval TEXT;
ALTER TABLE rdv ADD COLUMN IF NOT EXISTS evalue_le TIMESTAMPTZ;

-- ═══ SEED DÉMARCHES FAMILLE B ═══

-- Urbanisme / Foncier
UPDATE service SET categorie = 'urbanisme', description = 'Demande de permis de construire auprès de l''APC',
  pieces_requises = '[
    "Demande manuscrite adressée au P/APC",
    "Acte de propriété ou certificat de possession",
    "Plan de situation et plan de masse",
    "Plans architecturaux (façades, coupes, niveaux)",
    "Certificat d''urbanisme (CU) en cours de validité",
    "Étude de sol (si exigée)",
    "Photos du terrain",
    "Copie de la carte nationale d''identité"
  ]'::jsonb,
  formulaires = '["Formulaire CERFA permis de construire (à retirer à l''APC)"]'::jsonb,
  frais = 'Variable selon surface — à vérifier au guichet',
  delai_reel = '2 à 6 mois (instruction + commissions techniques)',
  assistant_questions = '[
    {"q": "Êtes-vous propriétaire du terrain ?", "oui": "next", "non": "Vous devez d''abord obtenir un acte de propriété ou un certificat de possession."},
    {"q": "Avez-vous un certificat d''urbanisme (CU) en cours de validité ?", "oui": "next", "non": "Demandez d''abord un certificat d''urbanisme — démarche disponible ci-dessous."},
    {"q": "Avez-vous fait réaliser les plans par un architecte agréé ?", "oui": "next", "non": "Les plans architecturaux sont obligatoires. Consultez un architecte agréé."}
  ]'::jsonb
WHERE nom = 'Permis de construire';

INSERT INTO service (nom, famille, duree_min, categorie, description, pieces_requises, formulaires, frais, delai_reel, assistant_questions)
VALUES
  ('Certificat d''urbanisme', 'B', 30, 'urbanisme',
   'Renseigne sur les règles d''urbanisme applicables à un terrain',
   '["Demande manuscrite", "Plan de situation du terrain", "Copie de l''acte de propriété", "Copie CNI"]'::jsonb,
   '["Formulaire de demande CU (APC)"]'::jsonb,
   'Gratuit',
   '1 à 3 mois',
   '[{"q": "Êtes-vous propriétaire ou mandataire du propriétaire ?", "oui": "next", "non": "Procuration ou mandat nécessaire."}]'::jsonb
  ),
  ('Certificat de conformité', 'B', 30, 'urbanisme',
   'Atteste la conformité d''une construction au permis de construire délivré',
   '["Demande manuscrite", "Copie du permis de construire", "PV de réception des travaux", "Plans de récolement", "Copie CNI"]'::jsonb,
   '["Formulaire de demande (APC)"]'::jsonb,
   'Variable selon surface',
   '2 à 4 mois (visite de conformité incluse)',
   '[{"q": "Avez-vous un permis de construire valide pour cette construction ?", "oui": "next", "non": "Le permis de construire est un pré-requis."}]'::jsonb
  ),
  ('Livret foncier', 'B', 45, 'urbanisme',
   'Document officiel attestant la propriété d''un bien immobilier',
   '["Acte de propriété (notarié ou administratif)", "Copie CNI", "Extrait de naissance", "Plan cadastral", "Certificat négatif d''hypothèque"]'::jsonb,
   '["Formulaire de demande (Conservation foncière)"]'::jsonb,
   'Timbres fiscaux + frais Conservation foncière',
   '3 à 12 mois (selon charge Conservation foncière)',
   '[{"q": "Disposez-vous d''un acte de propriété notarié ?", "oui": "next", "non": "Vous devez d''abord faire établir un acte par un notaire."}]'::jsonb
  ),

  -- Logement / AADL
  ('Suivi dossier AADL', 'B', 30, 'logement',
   'Consultation et suivi de dossier programme AADL auprès de l''APC',
   '["Récépissé de dépôt AADL", "Copie CNI", "Attestation de non-propriété"]'::jsonb,
   '[]'::jsonb,
   'Gratuit',
   'Réponse immédiate (consultation) — décision AADL : délais variables',
   '[{"q": "Avez-vous déjà déposé un dossier AADL ?", "oui": "next", "non": "Déposez d''abord votre dossier sur le portail AADL (aadl.com.dz)."}]'::jsonb
  ),
  ('Recours logement social', 'B', 30, 'logement',
   'Dépôt de recours ou réclamation concernant l''attribution de logement social',
   '["Demande manuscrite motivée", "Copie CNI", "Attestation de résidence", "Justificatifs de situation (revenus, famille)", "Copies des courriers précédents"]'::jsonb,
   '["Formulaire de recours (APC)"]'::jsonb,
   'Gratuit',
   '1 à 6 mois (commission daïra)',
   '[]'::jsonb
  ),

  -- Certificats communaux
  ('Certificat de bonne vie et mœurs', 'B', 15, 'certificats',
   'Certificat délivré par l''APC attestant l''absence de condamnation',
   '["Copie CNI", "Extrait de naissance", "2 photos d''identité", "Timbre fiscal"]'::jsonb,
   '[]'::jsonb,
   'Timbre fiscal 100 DA',
   'Délivrance immédiate ou sous 48h',
   '[]'::jsonb
  ),
  ('Attestation de changement de résidence', 'B', 20, 'certificats',
   'Attestation officielle pour changement de domicile entre communes',
   '["Copie CNI", "Ancien certificat de résidence", "Nouveau justificatif de domicile (quittance/contrat)", "Extrait de naissance"]'::jsonb,
   '[]'::jsonb,
   'Gratuit',
   'Sous 48h à 1 semaine',
   '[]'::jsonb
  ),

  -- Enrôlement biométrique
  ('Enrôlement biométrique CNI', 'B', 30, 'biometrique',
   'RDV pour enrôlement biométrique (prise d''empreintes et photo) — carte nationale d''identité',
   '["Extrait de naissance spécial (S12)", "Certificat de résidence de moins de 3 mois", "Ancien document d''identité (si renouvellement)", "2 photos biométriques", "Timbre fiscal"]'::jsonb,
   '[]'::jsonb,
   'Timbre fiscal 2000 DA (première) / 4000 DA (renouvellement)',
   '15 à 45 jours après enrôlement',
   '[{"q": "Est-ce une première demande ou un renouvellement ?", "oui": "Si renouvellement, munissez-vous de votre ancien document.", "non": "next"}]'::jsonb
  ),
  ('Enrôlement biométrique Passeport', 'B', 30, 'biometrique',
   'RDV pour enrôlement biométrique — passeport biométrique',
   '["Extrait de naissance spécial (S12)", "Certificat de résidence", "CNI biométrique en cours de validité", "2 photos biométriques", "Timbre fiscal", "Ancien passeport (si renouvellement)"]'::jsonb,
   '[]'::jsonb,
   'Timbre fiscal 6000 DA (28 pages) / 12000 DA (48 pages)',
   '15 à 30 jours après enrôlement',
   '[]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Mettre à jour les services B existants qui n'ont pas encore de catégorie
UPDATE service SET categorie = 'biometrique',
  description = 'RDV pour démarches passeport (enrôlement déjà couvert par service dédié)',
  pieces_requises = '["Voir Enrôlement biométrique Passeport"]'::jsonb,
  delai_reel = '15 à 30 jours'
WHERE nom = 'Passeport' AND categorie IS NULL;

UPDATE service SET categorie = 'certificats',
  description = 'Légalisation de signature de documents officiels',
  pieces_requises = '["Document à légaliser", "Copie CNI", "Présence physique obligatoire"]'::jsonb,
  frais = 'Gratuit',
  delai_reel = 'Immédiat'
WHERE nom = 'Légalisation de signature' AND categorie IS NULL;

UPDATE service SET categorie = 'certificats',
  description = 'Démarche pour obtention de la carte d''invalidité',
  pieces_requises = '["Certificat médical", "Copie CNI", "Photos d''identité", "Dossier médical"]'::jsonb,
  frais = 'Gratuit',
  delai_reel = '1 à 3 mois (commission médicale)'
WHERE nom = 'Carte d''invalidité' AND categorie IS NULL;

-- Enrichir les services Famille A (info seulement, pas de RDV)
UPDATE service SET categorie = 'etat_civil', description = 'Disponible en ligne sur le portail national',
  delai_reel = 'Immédiat (en ligne)' WHERE nom = 'Extrait de naissance' AND categorie IS NULL;
UPDATE service SET categorie = 'etat_civil', description = 'Disponible en ligne sur le portail national',
  delai_reel = 'Immédiat (en ligne)' WHERE nom = 'Certificat de résidence' AND categorie IS NULL;
UPDATE service SET categorie = 'identite', description = 'Demande via portail national CNIEC',
  delai_reel = '15 à 45 jours' WHERE nom = 'Carte nationale d''identité' AND categorie IS NULL;
UPDATE service SET categorie = 'etat_civil', description = 'Disponible en ligne sur le portail national',
  delai_reel = 'Immédiat (en ligne)' WHERE nom = 'Fiche familiale' AND categorie IS NULL;

-- ═══ DOWN ═══
-- ALTER TABLE rdv DROP COLUMN IF EXISTS evalue_le;
-- ALTER TABLE rdv DROP COLUMN IF EXISTS commentaire_eval;
-- ALTER TABLE rdv DROP COLUMN IF EXISTS delai_respecte;
-- ALTER TABLE rdv DROP COLUMN IF EXISTS rdv_honore;
-- ALTER TABLE rdv DROP COLUMN IF EXISTS note_satisfaction;
-- ALTER TABLE rdv DROP COLUMN IF EXISTS public_prioritaire;
-- DROP TYPE IF EXISTS public_prioritaire;
-- ALTER TABLE service DROP COLUMN IF EXISTS assistant_questions;
-- ALTER TABLE service DROP COLUMN IF EXISTS delai_reel;
-- ALTER TABLE service DROP COLUMN IF EXISTS frais;
-- ALTER TABLE service DROP COLUMN IF EXISTS formulaires;
-- ALTER TABLE service DROP COLUMN IF EXISTS pieces_requises;
-- ALTER TABLE service DROP COLUMN IF EXISTS description;
-- ALTER TABLE service DROP COLUMN IF EXISTS categorie;
