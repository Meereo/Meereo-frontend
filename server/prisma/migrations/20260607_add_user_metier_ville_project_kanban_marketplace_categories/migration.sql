-- Migration: add_user_metier_ville_project_kanban_marketplace_categories
-- 1. Add metier + ville to User (for professionals directory & search)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "metier" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ville"  TEXT;

-- 2. Add kanbanStatus to Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "kanbanStatus" TEXT NOT NULL DEFAULT 'todo';

-- 3. Create MarketplaceCategory
CREATE TABLE IF NOT EXISTS "MarketplaceCategory" (
  "id"        TEXT         NOT NULL,
  "slug"      TEXT         NOT NULL,
  "label"     TEXT         NOT NULL,
  "ico"        TEXT,
  "order"     INTEGER      NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MarketplaceCategory_slug_key" ON "MarketplaceCategory"("slug");
