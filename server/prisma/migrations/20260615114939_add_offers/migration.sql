-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "aoId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL DEFAULT '',
    "montant" TEXT NOT NULL DEFAULT '0',
    "delai" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "statut" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_aoId_supplierId_key" ON "offers"("aoId", "supplierId");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_aoId_fkey" FOREIGN KEY ("aoId") REFERENCES "aos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
