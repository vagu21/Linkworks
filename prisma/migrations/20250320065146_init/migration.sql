/*
  Warnings:

  - You are about to drop the `CompareWith` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComputedField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Filter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupBy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Metric` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompareWith" DROP CONSTRAINT "CompareWith_chartConfigId_fkey";

-- DropForeignKey
ALTER TABLE "ComputedField" DROP CONSTRAINT "ComputedField_chartConfigId_fkey";

-- DropForeignKey
ALTER TABLE "Filter" DROP CONSTRAINT "Filter_chartConfigId_fkey";

-- DropForeignKey
ALTER TABLE "GroupBy" DROP CONSTRAINT "GroupBy_chartConfigId_fkey";

-- DropForeignKey
ALTER TABLE "Metric" DROP CONSTRAINT "Metric_chartConfigId_fkey";

-- DropTable
DROP TABLE "CompareWith";

-- DropTable
DROP TABLE "ComputedField";

-- DropTable
DROP TABLE "Filter";

-- DropTable
DROP TABLE "GroupBy";

-- DropTable
DROP TABLE "Metric";

-- CreateTable
CREATE TABLE "GraphGropBy" (
    "id" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "GraphGropBy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "property" TEXT,
    "propertyId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "GraphMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphFilter" (
    "id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "GraphFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphComputedField" (
    "id" TEXT NOT NULL,
    "fieldA" TEXT NOT NULL,
    "fieldB" TEXT,
    "operator" TEXT NOT NULL,
    "field_a_id" TEXT NOT NULL,
    "field_b_id" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "GraphComputedField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphCompareWith" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "dateField" TEXT NOT NULL,
    "timeShift" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "GraphCompareWith_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GraphCompareWith_chartConfigId_key" ON "GraphCompareWith"("chartConfigId");

-- AddForeignKey
ALTER TABLE "GraphGropBy" ADD CONSTRAINT "GraphGropBy_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphMetric" ADD CONSTRAINT "GraphMetric_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphFilter" ADD CONSTRAINT "GraphFilter_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphComputedField" ADD CONSTRAINT "GraphComputedField_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphCompareWith" ADD CONSTRAINT "GraphCompareWith_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
