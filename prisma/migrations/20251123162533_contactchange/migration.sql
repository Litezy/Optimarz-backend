/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `ContactMessage` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `ContactMessage` table. All the data in the column will be lost.
  - Added the required column `message` to the `ContactMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactMessage" DROP COLUMN "phoneNumber",
DROP COLUMN "subject",
ADD COLUMN     "message" TEXT NOT NULL;
