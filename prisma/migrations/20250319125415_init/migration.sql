-- CreateTable
CREATE TABLE "ChartConfig" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tenantId" TEXT[],
    "groupSlug" TEXT,
    "entitySlug" TEXT,
    "graphWidth" TEXT DEFAULT '100',
    "description" TEXT NOT NULL,
    "visualizationType" TEXT NOT NULL,
    "subGroupBy" TEXT[],
    "timeGranularity" TEXT NOT NULL,
    "dateField" TEXT NOT NULL,

    CONSTRAINT "ChartConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupBy" (
    "id" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "GroupBy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "property" TEXT,
    "propertyId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filter" (
    "id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "Filter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputedField" (
    "id" TEXT NOT NULL,
    "fieldA" TEXT NOT NULL,
    "fieldB" TEXT,
    "operator" TEXT NOT NULL,
    "field_a_id" TEXT NOT NULL,
    "field_b_id" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "ComputedField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompareWith" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "dateField" TEXT NOT NULL,
    "timeShift" TEXT NOT NULL,
    "chartConfigId" TEXT NOT NULL,

    CONSTRAINT "CompareWith_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompareWith_chartConfigId_key" ON "CompareWith"("chartConfigId");

-- AddForeignKey
ALTER TABLE "GroupBy" ADD CONSTRAINT "GroupBy_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComputedField" ADD CONSTRAINT "ComputedField_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompareWith" ADD CONSTRAINT "CompareWith_chartConfigId_fkey" FOREIGN KEY ("chartConfigId") REFERENCES "ChartConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
