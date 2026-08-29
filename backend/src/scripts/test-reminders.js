import dotenv from 'dotenv';
dotenv.config();

import prisma from '../config/prisma.js';
import { BookingService } from '../modules/bookings/bookings.service.js';
import { BookingRepository } from '../modules/bookings/bookings.repository.js';
import { PaymentRepository } from '../modules/payments/payments.repository.js';
import { NotificationService } from '../modules/notifications/notifications.service.js';
import { NotificationRepository } from '../modules/notifications/notifications.repository.js';
import {
  sendPaymentReminders,
  sendCheckoutReminders,
  enforceDailyBookingExpirations,
  enforcePaymentSuspensions
} from '../config/cron.js';

// Setup Services
const bookingRepo = new BookingRepository();
const paymentRepo = new PaymentRepository();
const notificationService = new NotificationService(new NotificationRepository());
const bookingService = new BookingService(bookingRepo, notificationService, paymentRepo);

async function runTests() {
  console.log('=== STARTING LEASE TYPES & REMINDERS VERIFICATION ===');

  // 1. Setup Test Data (Student, Landlord, Property, Units)
  console.log('\n[TEST 1] Setting up mock users and units...');
  
  // Find or create test student user
  let studentUser = await prisma.user.findFirst({ where: { email: 'student.test@nestify.com' } });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        name: 'Test Student',
        email: 'student.test@nestify.com',
        phone_number: '123456789',
        role: 'student',
        verified: true,
        student: {
          create: {
            university_name: 'Al-Hussein Bin Talal University',
            major: 'Computer Science',
            gender: 'Male',
            academic_year: '3rd Year',
            preferences: {
              create: {
                sleep_schedule: 'early',
                smoking_status: 'no',
                cleanliness_level: 4,
                noise_tolerance: 2,
                social_level: 3,
                study_level: 4,
                guest_preference: 'no',
                lifestyle_type: 'quiet',
                personality_type: 'introvert'
              }
            }
          }
        }
      }
    });
  }

  // Find or create test landlord user
  let landlordUser = await prisma.user.findFirst({ where: { email: 'landlord.test@nestify.com' } });
  if (!landlordUser) {
    landlordUser = await prisma.user.create({
      data: {
        name: 'Test Landlord',
        email: 'landlord.test@nestify.com',
        phone_number: '987654321',
        role: 'landlord',
        verified: true,
        landlord: {
          create: {
            national_id: 'LANDLORD_NAT_123',
            business_name: 'Nestify Rentals',
            verification_status: 'verified'
          }
        }
      }
    });
  }

  // Create property
  const property = await prisma.property.create({
    data: {
      landlord_id: landlordUser.user_id,
      title: 'Dorm Complex A',
      description: 'Standard student accommodation near AHU.',
      address: 'Ma’an, Jordan',
      ai_tags: '{}'
    }
  });

  // Create units of each rental type
  const dailyUnit = await prisma.unit.create({
    data: {
      property_id: property.property_id,
      type: 'Single Room',
      price: 15.00, // 15 JOD / day
      rental_type: 'daily',
      availability_status: 'available'
    }
  });

  const monthlyUnit = await prisma.unit.create({
    data: {
      property_id: property.property_id,
      type: 'Double Shared',
      price: 120.00, // 120 JOD / month
      rental_type: 'monthly',
      availability_status: 'available'
    }
  });

  const semesterUnit = await prisma.unit.create({
    data: {
      property_id: property.property_id,
      type: 'Premium Suite',
      price: 500.00, // 500 JOD / semester
      rental_type: 'semester',
      availability_status: 'available'
    }
  });

  console.log('Test users and units successfully registered.');
  console.log(`- Daily Unit ID: ${dailyUnit.unit_id} (Price: 15 JOD/day)`);
  console.log(`- Monthly Unit ID: ${monthlyUnit.unit_id} (Price: 120 JOD/month)`);
  console.log(`- Semester Unit ID: ${semesterUnit.unit_id} (Price: 500 JOD/semester)`);

  // 2. Test Daily Booking & Pre-payment Price Generation
  console.log('\n[TEST 2] Testing Daily Booking booking creation & payment amount calculation...');
  const checkinDate = new Date();
  checkinDate.setDate(checkinDate.getDate() + 2);
  const checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkoutDate.getDate() + 5); // 5-day stay

  const dailyBooking = await bookingService.createBooking({
    unitId: dailyUnit.unit_id.toString(),
    checkinDate: checkinDate.toISOString(),
    checkoutDate: checkoutDate.toISOString()
  }, studentUser.user_id.toString());

  const dailyPayment = await prisma.payment.findUnique({
    where: { booking_id: BigInt(dailyBooking.bookingID) }
  });

  console.log('Daily Booking created successfully!');
  console.log(`- Booking ID: ${dailyBooking.bookingID}`);
  console.log(`- Expected Duration: 5 days`);
  console.log(`- Invoice Amount: ${dailyPayment.amount} JOD (Expected: 75 JOD)`);
  console.log(`- Due Date: ${dailyPayment.due_date.toISOString()} (Due immediately)`);

  // 3. Test Monthly Booking & Pro-rated rent calculation
  console.log('\n[TEST 3] Testing Monthly Booking & Pro-rated invoice...');
  // We'll set checkin date to middle of month (e.g. May 15th if total days in month is 31, remaining is 17)
  const testCheckinDate = new Date();
  testCheckinDate.setDate(15);
  const minAllowed = new Date();
  minAllowed.setDate(minAllowed.getDate() + 2);
  if (testCheckinDate < minAllowed) {
    testCheckinDate.setMonth(testCheckinDate.getMonth() + 1);
  }

  const monthlyBooking = await bookingService.createBooking({
    unitId: monthlyUnit.unit_id.toString(),
    checkinDate: testCheckinDate.toISOString()
  }, studentUser.user_id.toString());

  const monthlyPayment = await prisma.payment.findUnique({
    where: { booking_id: BigInt(monthlyBooking.bookingID) }
  });

  const year = testCheckinDate.getFullYear();
  const month = testCheckinDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const remaining = totalDays - testCheckinDate.getDate() + 1;
  const expectedProRated = parseFloat(((120.00 * remaining) / totalDays).toFixed(2));

  console.log('Monthly Booking created successfully!');
  console.log(`- Booking ID: ${monthlyBooking.bookingID}`);
  console.log(`- Remaining check-in days: ${remaining}/${totalDays}`);
  console.log(`- Invoice Amount: ${monthlyPayment.amount} JOD (Expected pro-rated: ${expectedProRated} JOD)`);
  console.log(`- Due Date: ${monthlyPayment.due_date.toISOString()} (Due check-in date)`);

  // 4. Test Semester Booking & 5-month duration auto-calculation
  console.log('\n[TEST 4] Testing Semester Booking duration...');
  const semesterCheckin = new Date();
  semesterCheckin.setDate(semesterCheckin.getDate() + 2);

  const semesterBooking = await bookingService.createBooking({
    unitId: semesterUnit.unit_id.toString(),
    checkinDate: semesterCheckin.toISOString()
  }, studentUser.user_id.toString());

  const semesterPayment = await prisma.payment.findUnique({
    where: { booking_id: BigInt(semesterBooking.bookingID) }
  });

  // Re-fetch booking from DB to inspect computed checkout date
  const semesterBookingDb = await prisma.booking.findUnique({
    where: { booking_id: BigInt(semesterBooking.bookingID) }
  });

  const expectedCheckout = new Date(semesterCheckin);
  expectedCheckout.setMonth(expectedCheckout.getMonth() + 5);

  console.log('Semester Booking created successfully!');
  console.log(`- Booking ID: ${semesterBooking.bookingID}`);
  console.log(`- computed Checkout Date: ${semesterBookingDb.checkout_date.toISOString()}`);
  console.log(`- Expected Checkout Date: ${expectedCheckout.toISOString()} (Exactly 5 months)`);
  console.log(`- Invoice Amount: ${semesterPayment.amount} JOD (Expected: 500 JOD)`);

  // 5. Test Job 1: Payment Reminders (due in 2 days)
  console.log('\n[TEST 5] Testing Cron Job 1: Payment Reminders (Due in 2 days)...');
  // Set our semester payment due date to exactly 2 days from now
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  
  await prisma.payment.update({
    where: { payment_id: semesterPayment.payment_id },
    data: { due_date: twoDaysFromNow }
  });

  console.log('Forcing Semester Payment due date to 2 days from now...');
  await sendPaymentReminders();

  // 6. Test Job 2: Checkout Reminders (stay ending in 2 days)
  console.log('\n[TEST 6] Testing Cron Job 2: Stay Ending Reminders...');
  // Force daily booking checkout date to exactly 2 days from now and status to confirmed
  await prisma.booking.update({
    where: { booking_id: BigInt(dailyBooking.bookingID) },
    data: { checkout_date: twoDaysFromNow, status: 'confirmed' }
  });

  console.log('Forcing Daily Booking checkout date to 2 days from now (Confirmed status)...');
  await sendCheckoutReminders();

  // 7. Test Job 3: Unpaid Daily Expirations (created > 24 hours ago)
  console.log('\n[TEST 7] Testing Cron Job 3: Unpaid Daily Booking Auto-Cancellations (> 24 hours)...');
  // Set daily booking's booking_date to 2 days ago
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.booking.update({
    where: { booking_id: BigInt(dailyBooking.bookingID) },
    data: { booking_date: twoDaysAgo, status: 'pending_approval' }
  });
  
  await prisma.payment.update({
    where: { payment_id: dailyPayment.payment_id },
    data: { status: 'pending' }
  });

  console.log('Forcing Daily Booking date to 2 days ago with pending payment...');
  await enforceDailyBookingExpirations();

  // Verify cancelled status
  const dailyBookingAfter = await prisma.booking.findUnique({
    where: { booking_id: BigInt(dailyBooking.bookingID) }
  });
  const dailyUnitAfter = await prisma.unit.findUnique({
    where: { unit_id: dailyUnit.unit_id }
  });
  console.log(`- Booking Status: ${dailyBookingAfter.status} (Expected: cancelled)`);
  console.log(`- Unit Availability Status: ${dailyUnitAfter.availability_status} (Expected: available)`);

  // 8. Test Job 4: Overdue Payment Suspensions
  console.log('\n[TEST 8] Testing Cron Job 4: Overdue Payment Booking Suspension...');
  // Force monthly payment due date to yesterday, and booking status to confirmed
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.payment.update({
    where: { payment_id: monthlyPayment.payment_id },
    data: { due_date: yesterday, status: 'pending' }
  });

  await prisma.booking.update({
    where: { booking_id: BigInt(monthlyBooking.bookingID) },
    data: { status: 'confirmed' }
  });

  console.log('Forcing Monthly Payment due date to yesterday (Booking status Confirmed)...');
  await enforcePaymentSuspensions();

  // Verify suspended status
  const monthlyBookingAfter = await prisma.booking.findUnique({
    where: { booking_id: BigInt(monthlyBooking.bookingID) }
  });
  const monthlyPaymentAfter = await prisma.payment.findUnique({
    where: { payment_id: monthlyPayment.payment_id }
  });
  console.log(`- Booking Status: ${monthlyBookingAfter.status} (Expected: suspended)`);
  console.log(`- Payment Status: ${monthlyPaymentAfter.status} (Expected: overdue)`);

  // Cleanup Test Data
  console.log('\n[CLEANUP] Cleaning up test data...');
  await prisma.payment.deleteMany({
    where: {
      booking_id: {
        in: [BigInt(dailyBooking.bookingID), BigInt(monthlyBooking.bookingID), BigInt(semesterBooking.bookingID)]
      }
    }
  });

  await prisma.booking.deleteMany({
    where: {
      booking_id: {
        in: [BigInt(dailyBooking.bookingID), BigInt(monthlyBooking.bookingID), BigInt(semesterBooking.bookingID)]
      }
    }
  });

  await prisma.unit.deleteMany({
    where: {
      unit_id: { in: [dailyUnit.unit_id, monthlyUnit.unit_id, semesterUnit.unit_id] }
    }
  });

  await prisma.property.delete({
    where: { property_id: property.property_id }
  });

  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
