-- Migration 029 : ajout état 'clos' pour la clôture finale par l'agent traitant
-- Workflow : resolu (validé superviseur) → clos (clôturé agent traitant)

-- 1. Ajouter la valeur à l'enum (idempotent depuis Pg 9.6+)
ALTER TYPE signal_etat ADD VALUE IF NOT EXISTS 'clos' AFTER 'resolu';

-- 2. Ajouter la colonne de date de clôture
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS clos_le TIMESTAMPTZ;
