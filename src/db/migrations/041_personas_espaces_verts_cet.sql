-- 041 : Deux nouveaux responsables EPIC + organisation CET + correction epic 17

-- A. Correction : EPIC Eau (id=17) marqué actif — opérationnel (Farid, 27 dossiers)
UPDATE epic SET actif = TRUE WHERE id = 17;

-- B. Organisation CET manquante + mapping vers epic 32
INSERT INTO organisations (nom, type, actif)
VALUES ('EPIC — Centres d''Enfouissement Technique', 'epic', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO epic_organisation_map (epic_id, organisation_id)
SELECT 32, id FROM organisations WHERE nom = 'EPIC — Centres d''Enfouissement Technique'
ON CONFLICT DO NOTHING;

-- C. Persona 1 : Leïla Haddad — EPIC Espaces Verts (org 13, epic 3)
INSERT INTO utilisateur (telephone, prenom, nom, email, role, fonction, niveau_perimetre, organisation_id, capacites, mot_de_passe, actif)
VALUES (
  '0550000013', 'Leïla', 'Haddad', 'leila.haddad@demo.dz',
  'operateur', 'entite_responsable', 'entite', 13,
  ARRAY['traitement'],
  -- admin@@1234 haché via bcrypt (appliqué par le script Node d'exécution)
  (SELECT mot_de_passe FROM utilisateur WHERE telephone = '0550000003' LIMIT 1),
  TRUE
) ON CONFLICT (telephone) DO NOTHING;

-- D. Persona 2 : Redouane Ferhat — EPIC CET (org créée ci-dessus, epic 32)
INSERT INTO utilisateur (telephone, prenom, nom, email, role, fonction, niveau_perimetre, organisation_id, capacites, mot_de_passe, actif)
VALUES (
  '0550000014', 'Redouane', 'Ferhat', 'redouane.ferhat@demo.dz',
  'operateur', 'entite_responsable', 'entite',
  (SELECT id FROM organisations WHERE nom = 'EPIC — Centres d''Enfouissement Technique'),
  ARRAY['traitement'],
  'PLACEHOLDER',
  TRUE
) ON CONFLICT (telephone) DO NOTHING;

INSERT INTO _migrations (nom) VALUES ('041_personas_espaces_verts_cet') ON CONFLICT DO NOTHING;
