/*
  Warnings:

  - You are about to drop the column `interest` on the `Waitlist` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Made the column `phoneNumber` on table `Waitlist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Waitlist" DROP COLUMN "interest",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL;
