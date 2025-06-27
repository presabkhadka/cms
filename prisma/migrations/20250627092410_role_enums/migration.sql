/*
  Warnings:

  - You are about to drop the column `key` on the `Roles` table. All the data in the column will be lost.
  - The `name` column on the `Roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RoleTypes" AS ENUM ('BASIC', 'ADMIN');

-- AlterTable
ALTER TABLE "Roles" DROP COLUMN "key",
DROP COLUMN "name",
ADD COLUMN     "name" "RoleTypes" NOT NULL DEFAULT 'BASIC';
