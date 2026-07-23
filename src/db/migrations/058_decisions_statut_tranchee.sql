-- Migration 058 : ajout statut 'tranchee' pour demo_decisions
ALTER TABLE demo_decisions DROP CONSTRAINT IF EXISTS demo_decisions_statut_check;
ALTER TABLE demo_decisions ADD CONSTRAINT demo_decisions_statut_check
  CHECK (statut IN ('en_attente','validee','reportee','tranchee'));
