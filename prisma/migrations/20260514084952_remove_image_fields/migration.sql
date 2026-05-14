/*
  Warnings:

  - You are about to drop the column `image_1` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `image_2` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `image_3` on the `Blog` table. All the data in the column will be lost.
  - Made the column `featuredImage` on table `Blog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "image_1",
DROP COLUMN "image_2",
DROP COLUMN "image_3",
ALTER COLUMN "featuredImage" SET NOT NULL;
