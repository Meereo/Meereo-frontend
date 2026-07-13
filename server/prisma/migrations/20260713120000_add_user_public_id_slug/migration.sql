-- AlterTable: users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "publicId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_publicId_key" ON "users"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_slug_key" ON "users"("slug");

-- AlterTable: pro_profiles
ALTER TABLE "pro_profiles" ADD COLUMN IF NOT EXISTS "pageSections" JSONB DEFAULT '[]';

-- AlterTable: products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ficheUrl" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "noticeUrl" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "certificatUrl" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "garantieUrl" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "garantieDuree" TEXT;

-- AlterTable: contacts
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "relationshipStatus" TEXT DEFAULT 'premier_contact';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "linkedUserId" TEXT;

-- AlterTable: documents
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "version" INTEGER DEFAULT 1;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "missionId" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "isEntreprise" BOOLEAN DEFAULT false;

-- AlterTable: tasks
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "missionId" TEXT;

-- AlterTable: orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "missionId" TEXT;

-- AlterTable: conversations
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'libre';
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "missionId" TEXT;

-- Document self-relation FK
ALTER TABLE "documents" ADD CONSTRAINT "documents_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Orders -> Projects FK
ALTER TABLE "orders" ADD CONSTRAINT "orders_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── CreateEnum: MilestoneStatus ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE', 'IN_VALIDATION', 'VALIDATED', 'REOPENED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── CreateEnum: ProjectTaskStatus ───────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "ProjectTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_VALIDATION', 'DONE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── CreateTable: reviews ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "projectId" TEXT,
    "note" INTEGER NOT NULL DEFAULT 5,
    "qualite" INTEGER,
    "delais" INTEGER,
    "communication" INTEGER,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_authorId_targetId_projectId_key" ON "reviews"("authorId", "targetId", "projectId");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CreateTable: missions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "missions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'created',
    "avancement" INTEGER NOT NULL DEFAULT 0,
    "responsibleUserId" TEXT,
    "responsibleName" TEXT NOT NULL DEFAULT '',
    "responsibleEmail" TEXT NOT NULL DEFAULT '',
    "conversationId" TEXT,
    "jalons" JSONB NOT NULL DEFAULT '[]',
    "createdBy" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "missions" ADD CONSTRAINT "missions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "missions" ADD CONSTRAINT "missions_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "missions" ADD CONSTRAINT "missions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CreateTable: assets ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "assets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "localisation" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'planifie',
    "fabricant" TEXT,
    "fournisseur" TEXT,
    "reference" TEXT,
    "garantieDebut" TIMESTAMP(3),
    "garantieFin" TIMESTAMP(3),
    "garantieDoc" TEXT,
    "dureeVie" TEXT,
    "installDate" TIMESTAMP(3),
    "installateurId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "maintenances" JSONB NOT NULL DEFAULT '[]',
    "missionId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "assets" ADD CONSTRAINT "assets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CreateTable: passports ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "passports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "surface" TEXT,
    "dateLivraison" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "transferredTo" TEXT,
    "snapshot" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "passports_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "passports_projectId_key" ON "passports"("projectId");
ALTER TABLE "passports" ADD CONSTRAINT "passports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "passports" ADD CONSTRAINT "passports_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CreateTable: knowledge_nodes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "knowledge_nodes" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "knowledge_nodes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "knowledge_nodes_type_refId_key" ON "knowledge_nodes"("type", "refId");

-- ─── CreateTable: knowledge_edges ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "knowledge_edges" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "knowledge_edges_pkey" PRIMARY KEY ("id")
);

-- ─── CreateTable: mission_templates ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "mission_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "responsible" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mission_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "mission_templates_code_key" ON "mission_templates"("code");

-- ─── CreateTable: milestone_templates ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "milestone_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "missionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "milestone_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "milestone_templates_code_key" ON "milestone_templates"("code");
ALTER TABLE "milestone_templates" ADD CONSTRAINT "milestone_templates_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CreateTable: task_templates ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "task_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "milestoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "task_templates_code_key" ON "task_templates"("code");
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestone_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CreateTable: project_missions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "project_missions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "responsibleUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_missions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_missions_projectId_templateId_key" ON "project_missions"("projectId", "templateId");
ALTER TABLE "project_missions" ADD CONSTRAINT "project_missions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_missions" ADD CONSTRAINT "project_missions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "mission_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_missions" ADD CONSTRAINT "project_missions_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── CreateTable: project_milestones ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "project_milestones" (
    "id" TEXT NOT NULL,
    "projectMissionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "validatedByPro" BOOLEAN NOT NULL DEFAULT false,
    "validatedByClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_milestones_projectMissionId_templateId_key" ON "project_milestones"("projectMissionId", "templateId");
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_projectMissionId_fkey" FOREIGN KEY ("projectMissionId") REFERENCES "project_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "milestone_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── CreateTable: project_tasks ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "project_tasks" (
    "id" TEXT NOT NULL,
    "projectMilestoneId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" "ProjectTaskStatus" NOT NULL DEFAULT 'TODO',
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "project_tasks_projectMilestoneId_templateId_key" ON "project_tasks"("projectMilestoneId", "templateId");
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_projectMilestoneId_fkey" FOREIGN KEY ("projectMilestoneId") REFERENCES "project_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "task_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
