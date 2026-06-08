-- Migration initiale : création de toutes les tables
-- Les migrations suivantes utilisent IF NOT EXISTS et seront des no-ops.

-- ───────────────────────────────────────────────
-- User
-- ───────────────────────────────────────────────
CREATE TABLE "User" (
    "id"                    TEXT         NOT NULL,
    "email"                 TEXT         NOT NULL,
    "password"              TEXT         NOT NULL,
    "name"                  TEXT         NOT NULL,
    "phone"                 TEXT,
    "avatar"                TEXT,
    "type"                  TEXT         NOT NULL DEFAULT 'pro',
    "company"               TEXT,
    "metier"                TEXT,
    "ville"                 TEXT,
    "wallet"                DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emailVerified"         BOOLEAN      NOT NULL DEFAULT false,
    "verificationCode"      TEXT,
    "verificationExpiresAt" TIMESTAMP(3),
    "verified"              BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- ───────────────────────────────────────────────
-- Project
-- ───────────────────────────────────────────────
CREATE TABLE "Project" (
    "id"           TEXT         NOT NULL,
    "nom"          TEXT         NOT NULL,
    "type"         TEXT,
    "phase"        TEXT         NOT NULL DEFAULT 'ESQUISSE',
    "budget"       TEXT,
    "adresse"      TEXT,
    "livraison"    TEXT,
    "priorite"     TEXT         NOT NULL DEFAULT 'Normale',
    "description"  TEXT,
    "avancement"   INTEGER      NOT NULL DEFAULT 0,
    "status"       TEXT         NOT NULL DEFAULT 'active',
    "kanbanStatus" TEXT         NOT NULL DEFAULT 'todo',
    "img"          TEXT,
    "client"       TEXT,
    "clientEmail"  TEXT,
    "color"        TEXT,
    "clientId"     TEXT,
    "sourceAoId"   TEXT,
    "etapes"       JSONB,
    "equipe"       JSONB,
    "ownerId"      TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- ProjectMember
-- ───────────────────────────────────────────────
CREATE TABLE "ProjectMember" (
    "id"        TEXT         NOT NULL,
    "projectId" TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "role"      TEXT         NOT NULL DEFAULT 'member',
    "userName"  TEXT,
    "userEmail" TEXT,
    "joinedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- ───────────────────────────────────────────────
-- Client
-- ───────────────────────────────────────────────
CREATE TABLE "Client" (
    "id"        TEXT         NOT NULL,
    "nom"       TEXT         NOT NULL,
    "type"      TEXT,
    "statut"    TEXT         NOT NULL DEFAULT 'actif',
    "contact"   TEXT,
    "poste"     TEXT,
    "email"     TEXT,
    "tel"       TEXT,
    "ville"     TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Intervenant
-- ───────────────────────────────────────────────
CREATE TABLE "Intervenant" (
    "id"         TEXT             NOT NULL,
    "nom"        TEXT             NOT NULL,
    "role"       TEXT,
    "specialite" TEXT,
    "email"      TEXT,
    "tel"        TEXT,
    "photo"      TEXT,
    "statut"     TEXT             NOT NULL DEFAULT 'actif',
    "entreprise" BOOLEAN          NOT NULL DEFAULT false,
    "ville"      TEXT,
    "note"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nbAvis"     INTEGER          NOT NULL DEFAULT 0,
    "projectId"  TEXT,
    "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Intervenant_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- AO
-- ───────────────────────────────────────────────
CREATE TABLE "AO" (
    "id"               TEXT         NOT NULL,
    "title"            TEXT         NOT NULL,
    "description"      TEXT,
    "budget"           TEXT,
    "lot"              TEXT,
    "status"           TEXT         NOT NULL DEFAULT 'open',
    "ownerUserId"      TEXT,
    "ownerProfileType" TEXT,
    "requestedTrade"   TEXT,
    "visibilityScope"  TEXT         NOT NULL DEFAULT 'public',
    "createdByClient"  BOOLEAN      NOT NULL DEFAULT false,
    "projectId"        TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AO_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Offer
-- ───────────────────────────────────────────────
CREATE TABLE "Offer" (
    "id"           TEXT         NOT NULL,
    "titre"        TEXT         NOT NULL,
    "entreprise"   TEXT,
    "montant"      TEXT,
    "delai"        TEXT,
    "lot"          TEXT,
    "note"         TEXT,
    "message"      TEXT,
    "statut"       TEXT         NOT NULL DEFAULT 'pending',
    "aoId"         TEXT,
    "userId"       TEXT,
    "supplierId"   TEXT,
    "supplierRole" TEXT,
    "acceptedBy"   TEXT,
    "acceptedAt"   TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Market
-- ───────────────────────────────────────────────
CREATE TABLE "Market" (
    "id"          TEXT             NOT NULL,
    "titre"       TEXT,
    "entreprise"  TEXT             NOT NULL,
    "lot"         TEXT,
    "montant"     TEXT,
    "statut"      TEXT             NOT NULL DEFAULT 'signed',
    "avancement"  INTEGER          NOT NULL DEFAULT 0,
    "delai"       TEXT,
    "projectId"   TEXT,
    "offerId"     TEXT,
    "aoId"        TEXT,
    "clientId"    TEXT,
    "supplierId"  TEXT,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Document
-- ───────────────────────────────────────────────
CREATE TABLE "Document" (
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "type"      TEXT         NOT NULL DEFAULT 'general',
    "url"       TEXT,
    "projectId" TEXT,
    "userId"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Photo
-- ───────────────────────────────────────────────
CREATE TABLE "Photo" (
    "id"        TEXT         NOT NULL,
    "url"       TEXT         NOT NULL,
    "caption"   TEXT,
    "projectId" TEXT,
    "userId"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Task (colonnes finales incluses — les ALTER IF NOT EXISTS seront des no-ops)
-- ───────────────────────────────────────────────
CREATE TABLE "Task" (
    "id"          TEXT         NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT,
    "status"      TEXT         NOT NULL DEFAULT 'todo',
    "priority"    TEXT         NOT NULL DEFAULT 'normale',
    "progress"    INTEGER      NOT NULL DEFAULT 0,
    "dueDate"     TIMESTAMP(3),
    "projectId"   TEXT,
    "marketId"    TEXT,
    "assignedTo"  TEXT,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "rejectedBy"  TEXT,
    "rejectedAt"  TIMESTAMP(3),
    "comment"     TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Event
-- ───────────────────────────────────────────────
CREATE TABLE "Event" (
    "id"        TEXT         NOT NULL,
    "titre"     TEXT         NOT NULL,
    "date"      TEXT         NOT NULL,
    "heure"     TEXT,
    "type"      TEXT,
    "color"     TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Decision
-- ───────────────────────────────────────────────
CREATE TABLE "Decision" (
    "id"         TEXT         NOT NULL,
    "titre"      TEXT         NOT NULL,
    "desc"       TEXT,
    "statut"     TEXT         NOT NULL DEFAULT 'pending',
    "urgent"     BOOLEAN      NOT NULL DEFAULT false,
    "projectId"  TEXT,
    "visibility" TEXT         NOT NULL DEFAULT 'client_visible',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Product
-- ───────────────────────────────────────────────
CREATE TABLE "Product" (
    "id"          TEXT             NOT NULL,
    "name"        TEXT             NOT NULL,
    "category"    TEXT,
    "price"       DOUBLE PRECISION,
    "unit"        TEXT             NOT NULL DEFAULT 'unité',
    "photoUrl"    TEXT,
    "description" TEXT,
    "userId"      TEXT,
    "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Commande
-- ───────────────────────────────────────────────
CREATE TABLE "Commande" (
    "id"        TEXT             NOT NULL,
    "reference" TEXT,
    "statut"    TEXT             NOT NULL DEFAULT 'confirmee',
    "total"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectId" TEXT,
    "userId"    TEXT,
    "createdAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Fournisseur
-- ───────────────────────────────────────────────
CREATE TABLE "Fournisseur" (
    "id"         TEXT             NOT NULL,
    "nom"        TEXT             NOT NULL,
    "specialite" TEXT,
    "ville"      TEXT,
    "tel"        TEXT,
    "email"      TEXT,
    "statut"     TEXT             NOT NULL DEFAULT 'actif',
    "verified"   BOOLEAN          NOT NULL DEFAULT false,
    "note"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nbAvis"     INTEGER          NOT NULL DEFAULT 0,
    "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fournisseur_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Rapport
-- ───────────────────────────────────────────────
CREATE TABLE "Rapport" (
    "id"        TEXT         NOT NULL,
    "type"      TEXT         NOT NULL DEFAULT 'hebdo',
    "titre"     TEXT,
    "statut"    TEXT         NOT NULL DEFAULT 'brouillon',
    "projectId" TEXT,
    "userId"    TEXT,
    "contenu"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rapport_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Transaction
-- ───────────────────────────────────────────────
CREATE TABLE "Transaction" (
    "id"        TEXT             NOT NULL,
    "type"      TEXT             NOT NULL DEFAULT 'debit',
    "label"     TEXT             NOT NULL,
    "montant"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statut"    TEXT             NOT NULL DEFAULT 'confirme',
    "provider"  TEXT,
    "userId"    TEXT,
    "projectId" TEXT,
    "marketId"  TEXT,
    "createdAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Notification
-- ───────────────────────────────────────────────
CREATE TABLE "Notification" (
    "id"        TEXT         NOT NULL,
    "msg"       TEXT         NOT NULL,
    "type"      TEXT         NOT NULL DEFAULT 'info',
    "read"      BOOLEAN      NOT NULL DEFAULT false,
    "role"      TEXT,
    "userId"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Activity
-- ───────────────────────────────────────────────
CREATE TABLE "Activity" (
    "id"        TEXT         NOT NULL,
    "action"    TEXT         NOT NULL,
    "data"      JSONB,
    "userId"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Conversation
-- ───────────────────────────────────────────────
CREATE TABLE "Conversation" (
    "id"           TEXT         NOT NULL,
    "title"        TEXT,
    "projectId"    TEXT,
    "aoId"         TEXT,
    "offerId"      TEXT,
    "marketId"     TEXT,
    "participants" JSONB,
    "lastMessage"  TEXT,
    "lastAt"       TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Message
-- ───────────────────────────────────────────────
CREATE TABLE "Message" (
    "id"             TEXT         NOT NULL,
    "contenu"        TEXT         NOT NULL,
    "conversationId" TEXT,
    "userId"         TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Introduction
-- ───────────────────────────────────────────────
CREATE TABLE "Introduction" (
    "id"            TEXT         NOT NULL,
    "projectId"     TEXT,
    "clientId"      TEXT,
    "structureId"   TEXT,
    "structureName" TEXT,
    "metier"        TEXT,
    "status"        TEXT         NOT NULL DEFAULT 'introduced',
    "introDate"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retainedAt"    TIMESTAMP(3),
    "source"        TEXT         NOT NULL DEFAULT 'meereo_cle_en_main',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Introduction_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Commission
-- ───────────────────────────────────────────────
CREATE TABLE "Commission" (
    "id"               TEXT             NOT NULL,
    "introductionId"   TEXT,
    "structureId"      TEXT,
    "structureName"    TEXT,
    "projectId"        TEXT,
    "clientId"         TEXT,
    "montantBase"      INTEGER          NOT NULL DEFAULT 0,
    "montantCommission" INTEGER         NOT NULL DEFAULT 0,
    "rate"             DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "status"           TEXT             NOT NULL DEFAULT 'potential',
    "paidAt"           TIMESTAMP(3),
    "createdAt"        TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- PaymentOrder
-- ───────────────────────────────────────────────
CREATE TABLE "PaymentOrder" (
    "id"            TEXT             NOT NULL,
    "amount"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"        TEXT             NOT NULL DEFAULT 'PAY_INIT',
    "rail"          TEXT,
    "label"         TEXT,
    "disputeReason" TEXT,
    "resolvedAt"    TIMESTAMP(3),
    "projectId"     TEXT,
    "marketId"      TEXT,
    "payerId"       TEXT,
    "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- Milestone
-- ───────────────────────────────────────────────
CREATE TABLE "Milestone" (
    "id"             TEXT             NOT NULL,
    "title"          TEXT             NOT NULL,
    "amount"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"         TEXT             NOT NULL DEFAULT 'pending',
    "order"          INTEGER          NOT NULL DEFAULT 0,
    "marketId"       TEXT,
    "paymentOrderId" TEXT,
    "dueAt"          TIMESTAMP(3),
    "completedAt"    TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- PaymentProof
-- ───────────────────────────────────────────────
CREATE TABLE "PaymentProof" (
    "id"             TEXT         NOT NULL,
    "type"           TEXT         NOT NULL DEFAULT 'document',
    "url"            TEXT         NOT NULL,
    "paymentOrderId" TEXT         NOT NULL,
    "uploadedBy"     TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- PaymentValidation
-- ───────────────────────────────────────────────
CREATE TABLE "PaymentValidation" (
    "id"             TEXT         NOT NULL,
    "validated"      BOOLEAN      NOT NULL DEFAULT false,
    "comment"        TEXT,
    "paymentOrderId" TEXT         NOT NULL,
    "validatedBy"    TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentValidation_pkey" PRIMARY KEY ("id")
);

-- ───────────────────────────────────────────────
-- MarketplaceCategory (incluse ici — CREATE TABLE IF NOT EXISTS dans 20260607 sera no-op)
-- ───────────────────────────────────────────────
CREATE TABLE "MarketplaceCategory" (
    "id"        TEXT         NOT NULL,
    "slug"      TEXT         NOT NULL,
    "label"     TEXT         NOT NULL,
    "ico"       TEXT,
    "order"     INTEGER      NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketplaceCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MarketplaceCategory_slug_key" ON "MarketplaceCategory"("slug");

-- ───────────────────────────────────────────────
-- KaiEntitlement
-- ───────────────────────────────────────────────
CREATE TABLE "KaiEntitlement" (
    "id"          TEXT         NOT NULL,
    "userId"      TEXT         NOT NULL,
    "tier"        TEXT         NOT NULL DEFAULT 'standard',
    "quotaLimit"  INTEGER      NOT NULL DEFAULT 25,
    "quotaUsed"   INTEGER      NOT NULL DEFAULT 0,
    "quotaReset"  TIMESTAMP(3),
    "goldEndDate" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiEntitlement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "KaiEntitlement_userId_key" ON "KaiEntitlement"("userId");

-- ═══════════════════════════════════════════════
-- FOREIGN KEYS
-- ═══════════════════════════════════════════════

ALTER TABLE "Project"
    ADD CONSTRAINT "Project_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProjectMember"
    ADD CONSTRAINT "ProjectMember_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectMember"
    ADD CONSTRAINT "ProjectMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Client"
    ADD CONSTRAINT "Client_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Intervenant"
    ADD CONSTRAINT "Intervenant_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AO"
    ADD CONSTRAINT "AO_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AO"
    ADD CONSTRAINT "AO_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Offer"
    ADD CONSTRAINT "Offer_aoId_fkey"
    FOREIGN KEY ("aoId") REFERENCES "AO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Offer"
    ADD CONSTRAINT "Offer_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Market"
    ADD CONSTRAINT "Market_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Document"
    ADD CONSTRAINT "Document_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Document"
    ADD CONSTRAINT "Document_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Photo"
    ADD CONSTRAINT "Photo_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Photo"
    ADD CONSTRAINT "Photo_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task"
    ADD CONSTRAINT "Task_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Event"
    ADD CONSTRAINT "Event_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Decision"
    ADD CONSTRAINT "Decision_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Product"
    ADD CONSTRAINT "Product_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Commande"
    ADD CONSTRAINT "Commande_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Commande"
    ADD CONSTRAINT "Commande_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Rapport"
    ADD CONSTRAINT "Rapport_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Rapport"
    ADD CONSTRAINT "Rapport_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Transaction"
    ADD CONSTRAINT "Transaction_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Transaction"
    ADD CONSTRAINT "Transaction_marketId_fkey"
    FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Activity"
    ADD CONSTRAINT "Activity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Message"
    ADD CONSTRAINT "Message_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Message"
    ADD CONSTRAINT "Message_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentOrder"
    ADD CONSTRAINT "PaymentOrder_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentOrder"
    ADD CONSTRAINT "PaymentOrder_marketId_fkey"
    FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentOrder"
    ADD CONSTRAINT "PaymentOrder_payerId_fkey"
    FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Milestone"
    ADD CONSTRAINT "Milestone_marketId_fkey"
    FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Milestone"
    ADD CONSTRAINT "Milestone_paymentOrderId_fkey"
    FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentProof"
    ADD CONSTRAINT "PaymentProof_paymentOrderId_fkey"
    FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentValidation"
    ADD CONSTRAINT "PaymentValidation_paymentOrderId_fkey"
    FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KaiEntitlement"
    ADD CONSTRAINT "KaiEntitlement_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
