-- 051 : Score stock/flux + assainissement 4 dossiers anciens
-- STOCK (anomalies, tous actifs sans fenêtre) : breachedSla, criticalCases,
--   communesUnderWatch, slaRespect, inverseCritiques, mobilizedOrganisations
-- FLUX (taux d'activité, fenêtre période) : tauxTraitement, tauxReponse
-- 4 dossiers clôturés (récit cockpit : "résorption provoquée") :
--   PRO-C20AD4, EAU-5FD0B3, PRO-182BE0, PRO-A5771B

INSERT INTO _migrations (nom) VALUES ('051_score_stock_flux') ON CONFLICT DO NOTHING;
