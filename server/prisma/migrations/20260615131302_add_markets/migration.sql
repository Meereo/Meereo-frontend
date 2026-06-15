-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL DEFAULT '',
    "lot" TEXT NOT NULL DEFAULT '',
    "entreprise" TEXT NOT NULL DEFAULT '',
    "montant" TEXT NOT NULL DEFAULT '0',
    "statut" TEXT NOT NULL DEFAULT 'signed',
    "avancement" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "delai" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT,
    "aoId" TEXT,
    "offerId" TEXT,
    "clientId" TEXT,
    "supplierId" TEXT,
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "validations" JSONB NOT NULL DEFAULT '[]',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
