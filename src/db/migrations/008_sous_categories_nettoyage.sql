-- Migration 008 : Nettoyage doublons catégories + libellés citoyen
-- Appliquée le 2026-06-27

-- ═══ UP ═══

-- Supprimer les doublons sans signalements rattachés
DELETE FROM categorie_signal WHERE id = 27; -- "Nid-de-poule" doublon de id 5
DELETE FROM categorie_signal WHERE id = 32; -- "Stationnement gênant" doublon de id 16

-- Renommer les libellés en langage citoyen naturel
UPDATE categorie_signal SET libelle = 'Dépôt sauvage (ordures, gravats)' WHERE id = 1;
UPDATE categorie_signal SET libelle = 'Benne pleine ou débordante' WHERE id = 2;
UPDATE categorie_signal SET libelle = 'Encombrants sur la voie publique' WHERE id = 3;
UPDATE categorie_signal SET libelle = 'Tags ou graffitis' WHERE id = 4;
UPDATE categorie_signal SET libelle = 'Chaussée dégradée (nid-de-poule)' WHERE id = 5;
UPDATE categorie_signal SET libelle = 'Éclairage défaillant' WHERE id = 6;
UPDATE categorie_signal SET libelle = 'Fuite d''eau visible' WHERE id = 8;
UPDATE categorie_signal SET libelle = 'Coupure d''eau ou pression faible' WHERE id = 9;
UPDATE categorie_signal SET libelle = 'Eau non potable ou colorée' WHERE id = 10;
UPDATE categorie_signal SET libelle = 'Fuite sur compteur' WHERE id = 11;
UPDATE categorie_signal SET libelle = 'Pression insuffisante' WHERE id = 12;
UPDATE categorie_signal SET libelle = 'Inondation ou refoulement' WHERE id = 13;
UPDATE categorie_signal SET libelle = 'Arbre dangereux ou espace vert dégradé' WHERE id = 15;
UPDATE categorie_signal SET libelle = 'Stationnement gênant ou anarchique' WHERE id = 16;
UPDATE categorie_signal SET libelle = 'Décharge sauvage (enfouissement illicite)' WHERE id = 17;
UPDATE categorie_signal SET libelle = 'Arrosage défectueux ou fuite' WHERE id = 18;
UPDATE categorie_signal SET libelle = 'Mobilier urbain dégradé (banc…)' WHERE id = 19;
UPDATE categorie_signal SET libelle = 'Aire de jeux endommagée' WHERE id = 20;
UPDATE categorie_signal SET libelle = 'Plantation ou fleurissement à entretenir' WHERE id = 21;
UPDATE categorie_signal SET libelle = 'Lampadaire éteint' WHERE id = 23;
UPDATE categorie_signal SET libelle = 'Lampadaire clignotant ou défectueux' WHERE id = 24;
UPDATE categorie_signal SET libelle = 'Câble électrique apparent (danger)' WHERE id = 25;
UPDATE categorie_signal SET libelle = 'Trottoir dégradé ou inaccessible' WHERE id = 28;
UPDATE categorie_signal SET libelle = 'Signalisation manquante ou endommagée' WHERE id = 29;
UPDATE categorie_signal SET libelle = 'Feu tricolore en panne' WHERE id = 30;
UPDATE categorie_signal SET libelle = 'Place PMR non respectée' WHERE id = 33;
UPDATE categorie_signal SET libelle = 'Zone à réguler' WHERE id = 34;

-- ═══ DOWN ═══
-- Les anciens libellés étaient techniques, pas de rollback critique.
