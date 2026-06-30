-- Sprint 8: Centre d'Intelligence Opérationnelle
INSERT INTO config_systeme (cle, valeur, description, module) VALUES
  ('intel.seuil_saturation_service', '20', 'Seuil signalements ouverts = service saturé', 'intelligence'),
  ('intel.seuil_commune_critique', '50', 'Seuil engagement % = commune critique', 'intelligence'),
  ('intel.seuil_baisse_icua', '10', 'Baisse ICUA sur 7j déclenchant alerte', 'intelligence'),
  ('intel.delai_cap_bloque_h', '24', 'Heures avant alerte mission CAP bloquée', 'intelligence'),
  ('intel.nb_recommandations', '8', 'Nombre max de recommandations affichées', 'intelligence')
ON CONFLICT (cle) DO NOTHING;
