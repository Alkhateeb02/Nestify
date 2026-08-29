-- CreateTable
CREATE TABLE "property_views" (
    "view_id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "ip_address" VARCHAR(45),
    "viewed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_views_pkey" PRIMARY KEY ("view_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_views_property_id_user_id_key" ON "property_views"("property_id", "user_id");

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
