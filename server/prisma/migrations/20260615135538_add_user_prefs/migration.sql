-- AlterTable
ALTER TABLE "users" ADD COLUMN     "prefs" JSONB NOT NULL DEFAULT '{}';
