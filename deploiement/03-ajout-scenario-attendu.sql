-- ============================================================
-- NODE.47 — MISE À JOUR DE LA BASE SUPABASE (déjà déployée)
-- Ajoute le champ « Scénario attendu » (expectedScenario).
--
-- OÙ EXÉCUTER : Supabase → SQL Editor → New query → coller ce
-- fichier en entier → Run. (Une seule fois. Sans danger : les
-- analyses existantes gardent toutes leurs données, le nouveau
-- champ démarre vide.)
-- ============================================================

ALTER TABLE "Pick" ADD COLUMN IF NOT EXISTS "expectedScenario" TEXT NOT NULL DEFAULT '';
