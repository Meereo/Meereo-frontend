-- AlterTable: projects — add cloture (project closure) fields
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "clotureStatus" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "clotureAt" TIMESTAMP(3);
