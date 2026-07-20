-- 043 : Rectifications sur arbitrages de Hamid
-- Source : Journal officiel 2026, annexe organisation administrative Wilaya d'Alger

-- ═══ A. DAÏRAS — LISTE OFFICIELLE 14 DAÏRAS ═══
-- Remplacement des 13 daïras par les 14 officielles :
-- Ajout : Birtouta, Hussein Dey, Sidi Abdellah
-- Retrait : Bab Ezzouar, Bordj El Kiffan (absorbés par Dar El Beïda)

-- Communes à confirmer :
--   Kouba → maintenu El Harrach (pourrait relever de Hussein Dey)
--   El Magharia → maintenu Dar El Beïda (pourrait relever de Hussein Dey)
--   Birtouta daïra → seule Birtouta pour l'instant (d'autres pourraient y être rattachées)

-- ═══ B. TUTELLES — NOUVELLES DIRECTIONS ═══
-- Direction de la Culture et des Arts
-- Direction de la Jeunesse, des Sports et des Loisirs
-- Direction du Commerce
-- Direction de l'Administration Locale
-- Direction des Travaux publics
-- Rattachements :
--   Ét. pompes funèbres → Administration Locale
--   Ét. abattoirs → Commerce
--   Office parcs sports → Jeunesse/Sports/Loisirs
--   Ét. art et culture → Culture et Arts
--   Agence études techniques → Urbanisme (par défaut, activité non confirmée)

-- ═══ C. CET — RECLASSEMENT ═══
-- Org 41 : type epic (plus direction_wilaya), tutelle Environnement (13)
-- Nom : "Établissement de gestion des centres d'enfouissement technique"
-- Sites : CET de Hamici, CET de Corso (unite_operationnelle, parent 41)

-- NOTE ROUTAGE (Mission 2, aucun changement maintenant) :
-- Principe acté : le dépôt sauvage simple (cat 1 proprete) reste à la
-- collecte Propreté/APC. Le gestionnaire CET n'intervient qu'en
-- réception/traitement (cat 17 "Décharge sauvage" routée epic 32).
-- Le routage actuel est déjà conforme à ce principe.

-- Appliquée via script Node (bcrypt, IDs dynamiques)
INSERT INTO _migrations (nom) VALUES ('043_rectifications_hamid') ON CONFLICT DO NOTHING;
