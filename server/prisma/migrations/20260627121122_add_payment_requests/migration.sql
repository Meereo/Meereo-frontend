-- CreateTable
CREATE TABLE "payment_requests" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "marketId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL DEFAULT '',
    "paymentType" TEXT NOT NULL DEFAULT 'paiement',
    "statut" TEXT NOT NULL DEFAULT 'pending',
    "visibility" TEXT NOT NULL DEFAULT 'client_visible',
    "createdByName" TEXT NOT NULL DEFAULT '',
    "createdByRole" TEXT,
    "respondedBy" TEXT,
    "respondedByRole" TEXT,
    "respondedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
