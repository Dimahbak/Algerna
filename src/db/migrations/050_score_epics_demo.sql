-- 050 : Score cohérent + EPIC prioritaires + démo EPIC

-- A. DÉFINITION UNIQUE "CRITIQUE" :
-- Un dossier est critique si gravite = 'danger_immediat' ET actif.
-- Partagée par : summary.criticalCases, liste priorities, scoreDetails.inverseCritiques.

-- B. EPIC PRIORITAIRES (décision Hamid) :
-- 6 établissements type epic marqués prioritaire=true :
-- CET (41), Nettoiement (30), Mobilier urbain (31), Jardin d'Essai (35),
-- Parcs sports (33), Pompes funèbres (32).
-- L'API lit priorityEpics depuis organisations type_organisation='epic' + prioritaire.

-- C. DOSSIERS DÉMO (11) :
-- 2 par EPIC sans activité (nettoiement, mobilier, Jardin d'Essai, parcs sports)
-- 3 pour pompes funèbres. Marqués is_demo=true pour purge future.
-- Ne polluent PAS les boards des 6 responsables.

-- D. 3 dossiers marqués danger_immediat : EAU-C45147, PRO-C81E72, EAU-ALG007.
-- 5 EPIC entries activées (39,40,41,42,44) pour apparaître dans l'API.

-- Appliqué via script Node
INSERT INTO _migrations (nom) VALUES ('050_score_epics_demo') ON CONFLICT DO NOTHING;
