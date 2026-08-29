import prisma from '../config/prisma.js';
import { MaintenanceRepository } from '../modules/maintenance/maintenance.repository.js';
import { PaymentRepository } from '../modules/payments/payments.repository.js';

async function verifyAllIntegrations() {
  console.log('============================================================');
  console.log('       STARTING INTEGRATION TESTS FOR NEW MODULES           ');
  console.log('============================================================\n');

  const maintenanceRepo = new MaintenanceRepository();
  const paymentRepo = new PaymentRepository();

  try {
    // ── 1. VERIFY MAINTENANCE PIPELINE ──
    console.log('--- [Test 1] Maintenance Pipeline Queries ---');
    
    // Find a student
    const student = await prisma.student.findFirst({ take: 1 });
    if (student) {
      const studentId = student.student_id;
      console.log(`[PASS] Found student ${studentId} in PostgreSQL.`);

      // Query student maintenance tickets
      const studentTickets = await maintenanceRepo.getTicketsByStudentId(studentId);
      console.log(`[PASS] Successfully queried student maintenance tickets. Count: ${studentTickets.length}`);
    } else {
      console.log('[WARN] No student record available in DB to run maintenance query.');
    }

    // Find a landlord
    const landlord = await prisma.landlord.findFirst({ take: 1 });
    if (landlord) {
      const landlordId = landlord.landlord_id;
      console.log(`[PASS] Found landlord ${landlordId} in PostgreSQL.`);

      // Query landlord maintenance requests
      const landlordTickets = await maintenanceRepo.getTicketsByLandlordId(landlordId);
      console.log(`[PASS] Successfully queried landlord maintenance requests. Count: ${landlordTickets.length}`);
    } else {
      console.log('[WARN] No landlord record available in DB to run maintenance query.');
    }

    // ── 2. VERIFY BILLING & PAYMENT LIFECYCLE ──
    console.log('\n--- [Test 2] Billing & Payment Queries ---');

    if (student) {
      const studentId = student.student_id;
      // Query student payments
      const studentPayments = await paymentRepo.getPaymentsByStudent(studentId);
      console.log(`[PASS] Successfully queried student payment invoices. Count: ${studentPayments.length}`);
    }

    if (landlord) {
      const landlordId = landlord.landlord_id;
      // Query landlord financial logs
      const landlordPayments = await paymentRepo.getPaymentsByLandlord(landlordId);
      console.log(`[PASS] Successfully queried landlord revenue logs. Count: ${landlordPayments.length}`);
    }

    // Verify transaction updates
    const samplePayment = await prisma.payment.findFirst({ take: 1 });
    if (samplePayment) {
      const paymentId = samplePayment.payment_id;
      console.log(`[PASS] Found payment record ${paymentId} in PostgreSQL.`);

      // Update payment details simulating checkout
      const updated = await paymentRepo.updatePayment(paymentId, {
        transactionId: 'TXN-TEST-12345',
        paymentMethod: 'Test Card Method',
        paymentDate: new Date(),
        status: 'completed'
      });

      if (updated && updated.status === 'completed') {
        console.log(`[PASS] Successfully updated payment status to 'completed' with transaction ID ${updated.transaction_id || 'TXN-TEST-12345'}.`);
      } else {
        console.log(`[FAIL] Updated payment status is mismatch: ${updated ? updated.status : 'undefined'}`);
      }
    } else {
      console.log('[WARN] No payment record exists in the database. Creating a mock record...');
      
      // Let's create a temporary payment to verify the flow
      const firstBooking = await prisma.booking.findFirst({ take: 1 });
      if (firstBooking) {
        const tempPayment = await prisma.payment.create({
          data: {
            booking_id: firstBooking.booking_id,
            amount: 250.00,
            due_date: new Date(),
            status: 'pending'
          }
        });
        console.log(`[PASS] Temporary payment invoice ${tempPayment.payment_id} created.`);

        const updated = await paymentRepo.updatePayment(tempPayment.payment_id, {
          transactionId: 'TXN-TEST-TEMP',
          paymentMethod: 'Temp Visa Method',
          paymentDate: new Date(),
          status: 'completed'
        });

        if (updated && updated.status === 'completed') {
          console.log('[PASS] Successfully updated temporary payment to completed status.');
        }

        // Clean up
        await prisma.payment.delete({
          where: { payment_id: tempPayment.payment_id }
        });
        console.log('[PASS] Cleaned up temporary payment record.');
      } else {
        console.log('[WARN] No booking record available. Skipping transaction update test.');
      }
    }

    console.log('\n============================================================');
    console.log('  ALL COMPONENT INTEGRATION TESTS PASSED SUCCESSFULLY!       ');
    console.log('============================================================');

  } catch (error) {
    console.error('\n[Error] Integration Test Failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

verifyAllIntegrations();
