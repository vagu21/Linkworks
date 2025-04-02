/*
  Warnings:

  - A unique constraint covering the columns `[azureId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "azureId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_azureId_key" ON "User"("azureId");
