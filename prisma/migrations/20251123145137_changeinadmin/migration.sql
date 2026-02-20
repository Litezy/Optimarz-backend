/*
  Warnings:

  - You are about to drop the column `bio` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "bio",
DROP COLUMN "image";
