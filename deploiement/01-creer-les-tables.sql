-- =============================================================================
-- NODE.47 — ÉTAPE 1 : création des tables dans Supabase
--
-- Mode d'emploi :
--   1. Ouvrez votre projet sur supabase.com
--   2. Cliquez sur "SQL Editor" dans le menu de gauche
--   3. Copiez TOUT le contenu de ce fichier et collez-le dans l'éditeur
--   4. Cliquez sur le bouton "Run" (Exécuter)
--   5. Vous devez voir "Success. No rows returned" — c'est normal !
--
-- Ce fichier crée les 2 tables du site : "Pick" (analyses) et
-- "NewsletterSubscriber" (abonnés newsletter). Il ne détruit rien.
-- =============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Pick" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "matchName" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "scenarioSummary" TEXT NOT NULL DEFAULT '',
    "keyPoints" TEXT NOT NULL DEFAULT '[]',
    "keyStats" TEXT NOT NULL DEFAULT '[]',
    "alternativeScenario" TEXT,
    "market" TEXT NOT NULL DEFAULT '',
    "selection" TEXT NOT NULL DEFAULT '',
    "line" TEXT,
    "odds" DOUBLE PRECISION,
    "verdict" TEXT NOT NULL DEFAULT 'JE_JOUE',
    "confidence" TEXT NOT NULL DEFAULT 'MODERE',
    "condition" TEXT,
    "synthesis" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "resultNote" TEXT,
    "settledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
