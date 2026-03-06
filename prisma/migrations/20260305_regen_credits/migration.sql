-- AlterTable
ALTER TABLE "users" ADD COLUMN "monthlyRegenerateUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "regenerateResetMonth" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "extraRegenerateCredits" INTEGER NOT NULL DEFAULT 0;
