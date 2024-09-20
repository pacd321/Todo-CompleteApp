-- AlterTable
ALTER TABLE "Todos" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "urgency" TEXT NOT NULL DEFAULT 'normal';
