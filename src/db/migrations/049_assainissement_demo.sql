-- 049 : Assainissement données démo — jeu crédible pour le cockpit
-- 32 dossiers clôturés (resolu + dates réalistes étalées) → 80% traités
-- 13 dossiers actifs récents (cree_le dans les 36h) pour SLA crédible
-- 8 dossiers actifs anciens (SLA dépassé) pour tension cockpit
-- Score opérationnel cible : 75-85
-- Aucun DELETE, total inchangé 111
-- Dossiers protégés : SIG-38MZ853Y, SIG-NOKU1TLT (réels)
-- Score formula fix : criticalCases = danger_immediat only (not haute criticite)
-- Appliqué via script Node (dates dynamiques)

INSERT INTO _migrations (nom) VALUES ('049_assainissement_demo') ON CONFLICT DO NOTHING;
