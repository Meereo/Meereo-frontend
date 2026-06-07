-- Migration: add_task_fields
-- Adds description, priority, dueDate to the Task model

ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'normale';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3);
