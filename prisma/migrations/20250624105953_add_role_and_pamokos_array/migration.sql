/*
  Warnings:

  - The `pamokos` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL,
DROP COLUMN "pamokos",
ADD COLUMN     "pamokos" TEXT[];
