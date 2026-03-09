-- AlterTable
ALTER TABLE "APIKeys" ALTER COLUMN "expirationDate" SET DEFAULT NOW() + interval '1 year';
