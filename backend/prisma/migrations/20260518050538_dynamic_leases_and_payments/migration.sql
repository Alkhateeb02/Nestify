/*
  Warnings:

  - Added the required column `due_date` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "checkout_date" DATE,
ADD COLUMN     "rental_type" VARCHAR(20) NOT NULL DEFAULT 'monthly';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "due_date" DATE NOT NULL,
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
ALTER COLUMN "payment_date" DROP NOT NULL,
ALTER COLUMN "payment_date" DROP DEFAULT,
ALTER COLUMN "payment_method" DROP NOT NULL;

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "rental_type" VARCHAR(20) NOT NULL DEFAULT 'monthly';
