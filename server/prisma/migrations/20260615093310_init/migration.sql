-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('pro', 'client', 'fournisseur');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "metier" TEXT,
    "ville" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "civilite" TEXT,
    "tel" TEXT NOT NULL,
    "ville" TEXT NOT NULL DEFAULT 'Abidjan',
    "pays" TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
    "photoUrl" TEXT,
    "projectType" TEXT,
    "location" TEXT,
    "surface" TEXT,
    "budget" TEXT,
    "description" TEXT,
    "situation" TEXT,
    "architecteEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pro_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "ville" TEXT NOT NULL DEFAULT 'Abidjan',
    "pays" TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
    "annee" TEXT,
    "rccm" TEXT,
    "ncc" TEXT,
    "tel" TEXT NOT NULL,
    "secteurs" TEXT[],
    "services" TEXT[],
    "logoColor" TEXT NOT NULL DEFAULT '#1D1D1F',
    "logoShape" TEXT NOT NULL DEFAULT 'Hexagone',
    "logoTypo" TEXT NOT NULL DEFAULT 'Gras',
    "logoFileUrl" TEXT,
    "slogan" TEXT,
    "bio" TEXT,
    "projetsN" TEXT,
    "effectif" TEXT,
    "portfolioFiles" JSONB NOT NULL DEFAULT '[]',
    "cockpitTeam" JSONB NOT NULL DEFAULT '[]',
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pro_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseur_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "ville" TEXT NOT NULL DEFAULT 'Abidjan',
    "pays" TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
    "rccm" TEXT,
    "ncc" TEXT,
    "tel" TEXT NOT NULL,
    "logoColor" TEXT NOT NULL DEFAULT '#1D1D1F',
    "logoShape" TEXT NOT NULL DEFAULT 'Hexagone',
    "logoTypo" TEXT NOT NULL DEFAULT 'Gras',
    "logoFileUrl" TEXT,
    "categories" TEXT[],
    "zones" TEXT[],
    "delaiLivraison" TEXT,
    "products" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fournisseur_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_userId_key" ON "client_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pro_profiles_userId_key" ON "pro_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "fournisseur_profiles_userId_key" ON "fournisseur_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_profiles" ADD CONSTRAINT "pro_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseur_profiles" ADD CONSTRAINT "fournisseur_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
