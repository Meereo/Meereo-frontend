-- CreateTable
CREATE TABLE "kai_entitlements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'standard',
    "quotaLimit" INTEGER NOT NULL DEFAULT 25,
    "quotaUsed" INTEGER NOT NULL DEFAULT 0,
    "goldStartDate" TIMESTAMP(3),
    "goldEndDate" TIMESTAMP(3),
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kai_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "topic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "lastDiscussed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kai_memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kai_entitlements_userId_role_key" ON "kai_entitlements"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "kai_memory_userId_topic_context_key" ON "kai_memory"("userId", "topic", "context");

-- AddForeignKey
ALTER TABLE "kai_entitlements" ADD CONSTRAINT "kai_entitlements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kai_conversations" ADD CONSTRAINT "kai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kai_memory" ADD CONSTRAINT "kai_memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
