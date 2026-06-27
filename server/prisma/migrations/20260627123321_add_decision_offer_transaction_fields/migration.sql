-- AlterTable
ALTER TABLE "decisions" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "respondedBy" TEXT,
ADD COLUMN     "respondedByRole" TEXT,
ADD COLUMN     "urgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'client_visible';

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedBy" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "fromRole" TEXT,
ADD COLUMN     "fromUserId" TEXT,
ADD COLUMN     "toRole" TEXT,
ADD COLUMN     "toUserId" TEXT;
