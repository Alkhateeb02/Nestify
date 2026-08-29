-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "profile_image" TEXT,
    "phone_number" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "students" (
    "student_id" BIGINT NOT NULL,
    "university_name" VARCHAR(150) NOT NULL,
    "major" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "academic_year" VARCHAR(30) NOT NULL,
    "smoking_status" VARCHAR(20) NOT NULL,
    "bio_interests" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "landlords" (
    "landlord_id" BIGINT NOT NULL,
    "national_id" VARCHAR(50) NOT NULL,
    "business_name" VARCHAR(150) NOT NULL,
    "verification_status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "rating" DECIMAL(3,2) DEFAULT 0.00,

    CONSTRAINT "landlords_pkey" PRIMARY KEY ("landlord_id")
);

-- CreateTable
CREATE TABLE "properties" (
    "property_id" BIGSERIAL NOT NULL,
    "landlord_id" BIGINT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "ai_tags" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("property_id")
);

-- CreateTable
CREATE TABLE "units" (
    "unit_id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "availability_status" VARCHAR(30) NOT NULL DEFAULT 'available',

    CONSTRAINT "units_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "unit_id" BIGINT NOT NULL,
    "booking_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkin_date" DATE NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" BIGSERIAL NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "transaction_id" VARCHAR(100),
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" VARCHAR(50) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "review_id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "property_id" BIGINT NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "maintenance_tickets" (
    "ticket_id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "unit_id" BIGINT NOT NULL,
    "issue_description" TEXT NOT NULL,
    "ticket_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(30) NOT NULL DEFAULT 'open',

    CONSTRAINT "maintenance_tickets_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "ai_matching" (
    "match_id" BIGSERIAL NOT NULL,
    "student1_id" BIGINT NOT NULL,
    "student2_id" BIGINT NOT NULL,
    "match_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "similarity_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "ai_matching_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "reports" (
    "report_id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "target_user_id" BIGINT,
    "property_id" BIGINT,
    "unit_id" BIGINT,
    "booking_id" BIGINT,
    "issue_description" TEXT NOT NULL,
    "report_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(30) NOT NULL DEFAULT 'open',

    CONSTRAINT "reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "property_monitors" (
    "monitor_id" BIGSERIAL NOT NULL,
    "landlord_id" BIGINT NOT NULL,
    "property_id" BIGINT NOT NULL,
    "monitored_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "property_monitors_pkey" PRIMARY KEY ("monitor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "landlords_national_id_key" ON "landlords"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_matching_student1_id_student2_id_key" ON "ai_matching"("student1_id", "student2_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlords" ADD CONSTRAINT "landlords_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "landlords"("landlord_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_matching" ADD CONSTRAINT "ai_matching_student1_id_fkey" FOREIGN KEY ("student1_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_matching" ADD CONSTRAINT "ai_matching_student2_id_fkey" FOREIGN KEY ("student2_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_monitors" ADD CONSTRAINT "property_monitors_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "landlords"("landlord_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_monitors" ADD CONSTRAINT "property_monitors_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;
