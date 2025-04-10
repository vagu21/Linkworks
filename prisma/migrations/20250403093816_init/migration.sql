-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isFilterable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSearchable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSortable" BOOLEAN NOT NULL DEFAULT false;
