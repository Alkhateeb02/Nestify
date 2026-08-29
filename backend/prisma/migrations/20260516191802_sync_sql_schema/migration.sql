/*
  Warnings:

  - Made the column `ai_tags` on table `properties` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "ai_tags" SET NOT NULL,
ALTER COLUMN "ai_tags" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" VARCHAR(20) NOT NULL DEFAULT 'student',
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "property_locations" (
    "location_id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "google_place_id" VARCHAR(255),
    "formatted_address" TEXT,
    "city" VARCHAR(100),
    "area" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_locations_property_id_key" ON "property_locations"("property_id");

-- AddForeignKey
ALTER TABLE "property_locations" ADD CONSTRAINT "property_locations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;
