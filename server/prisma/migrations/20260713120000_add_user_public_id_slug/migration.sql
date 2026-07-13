-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "publicId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_publicId_key" ON "users"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_slug_key" ON "users"("slug");
