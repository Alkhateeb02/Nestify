import dotenv from 'dotenv';
dotenv.config();
import prisma from '../config/prisma.js';

async function seedPrevious() {
  const user = await prisma.user.findFirst({
    where: { email: 'student.test@nestify.com' }
  });

  const unit = await prisma.unit.findFirst();

  if (!user || !unit) {
    console.error("Student or Unit not found");
    process.exit(1);
  }

  // Create previous booking
  const prevBooking = await prisma.booking.create({
    data: {
      student_id: user.user_id,
      unit_id: unit.unit_id,
      status: 'confirmed',
      booking_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      checkin_date: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000), // 39 days ago
      checkout_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago (ended)
    }
  });

  // Create completed payment
  await prisma.payment.create({
    data: {
      booking_id: prevBooking.booking_id,
      amount: 150.00,
      payment_date: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000),
      payment_method: 'credit_card',
      transaction_id: 'TXN-PAID-PREV'
    }
  });

  console.log(`Successfully seeded previous booking ${prevBooking.booking_id} for user ${user.name}`);
  process.exit(0);
}

seedPrevious();
