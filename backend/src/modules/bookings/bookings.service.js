import { ApiError } from '../../utils/ApiError.js';
import { encrypt } from '../../utils/crypto.js';

function maskCardNumber(cardNumber) {
  if (!cardNumber) return null;
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return digits;
  const last4 = digits.slice(-4);
  return `**** **** **** ${last4}`;
}

export class BookingService {
  constructor(bookingRepository, notificationService, paymentRepository) {
    this.bookingRepo = bookingRepository;
    this.notificationService = notificationService;
    this.paymentRepo = paymentRepository;
  }

  async createBooking(data, studentId) {
    let { unitId, propertyId, checkinDate, checkoutDate, numberOfDays, paymentData } = data;
    
    // Resolve unitId if propertyId is provided but unitId is missing
    if (!unitId && propertyId) {
      const unit = await this.bookingRepo.prisma.unit.findFirst({
        where: {
          property_id: BigInt(propertyId),
          availability_status: 'available'
        }
      });
      if (unit) {
        unitId = unit.unit_id.toString();
      } else {
        const fallbackUnit = await this.bookingRepo.prisma.unit.findFirst({
          where: { property_id: BigInt(propertyId) }
        });
        if (fallbackUnit) {
          unitId = fallbackUnit.unit_id.toString();
        }
      }
    }

    if (!unitId) {
      throw new ApiError(400, 'Unit ID or Property ID is required to make a booking');
    }

    if (!checkinDate) {
      throw new ApiError(400, 'Check-in date is required');
    }

    const parseLocalDate = (dateStr) => {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, 0, 0, 0, 0);
      }
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const checkin = parseLocalDate(checkinDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minCheckinDate = new Date(today);
    minCheckinDate.setDate(today.getDate() + 2);

    if (checkin < minCheckinDate) {
      throw new ApiError(400, 'Earliest available start date must be at least 2 days after the reservation date.');
    }

    // Step 1: Check unit status in PostgreSQL
    const unit = await this.bookingRepo.getUnitStatus(unitId);
    if (!unit || unit.availability_status !== 'available') {
      throw new ApiError(409, 'Unit is no longer available');
    }

    const rentalType = unit.rental_type || 'monthly';
    const unitPrice = parseFloat(unit.price.toString());

    // Read rental period, listingType, and capacity from property ai_tags
    let propertyRentalPeriod = rentalType;
    let propertyListingType = 'Solo';
    let capacity = 1;
    try {
      const unitWithProperty = await this.bookingRepo.prisma.unit.findUnique({
        where: { unit_id: BigInt(unitId) },
        include: { property: true }
      });
      if (unitWithProperty?.property?.ai_tags) {
        const tags = typeof unitWithProperty.property.ai_tags === 'string'
          ? JSON.parse(unitWithProperty.property.ai_tags)
          : unitWithProperty.property.ai_tags;
        propertyRentalPeriod = tags.rentalPeriod || tags.rental_period || rentalType;
        propertyListingType = tags.listingType || tags.listing_type || 'Solo';
        capacity = Number(tags.capacity) || 1;
      }
    } catch (_) { /* use fallbacks */ }

    // Backend unit capacity validation
    const activeBookingsCount = await this.bookingRepo.prisma.booking.count({
      where: {
        unit_id: BigInt(unitId),
        status: { in: ['pending', 'Pending', 'confirmed', 'Approved', 'approved'] }
      }
    });

    if (activeBookingsCount >= capacity) {
      throw new ApiError(400, 'This dormitory is fully occupied. Please select another dormitory.');
    }

    let amount = 0;
    let computedCheckoutDate = null;
    let dueDate = new Date(checkinDate);

    const checkinObj = new Date(checkinDate);
    if (propertyRentalPeriod === 'daily' || rentalType === 'daily') {
      const days = numberOfDays ? Number(numberOfDays) : 1;
      computedCheckoutDate = new Date(checkinObj.setDate(checkinObj.getDate() + days));
    } else if (propertyRentalPeriod === 'seasonal' || rentalType === 'semester' || propertyRentalPeriod === 'semester') {
      // Seasonal is 4 months. Using setMonth dynamically accounts for varying month lengths (30 vs 31 days).
      computedCheckoutDate = new Date(checkinObj.setMonth(checkinObj.getMonth() + 4));
    } else {
      // Monthly is based on calendar months: Checkout is the last day of the calendar month of check-in
      const year = checkinObj.getFullYear();
      const month = checkinObj.getMonth();
      computedCheckoutDate = new Date(year, month + 1, 0);
    }

    if (propertyRentalPeriod === 'daily' || rentalType === 'daily') {
      const diffTime = Math.abs(computedCheckoutDate - new Date(checkinDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      amount = parseFloat((unitPrice * (diffDays || 1)).toFixed(2));
      dueDate = new Date(); // Due immediately for daily pre-payment
    } else if (propertyRentalPeriod === 'seasonal' || rentalType === 'semester' || propertyRentalPeriod === 'semester') {
      amount = parseFloat(unitPrice.toFixed(2));
      dueDate = new Date(checkinDate);
    } else {
      // Monthly: charge full unit price
      amount = parseFloat(unitPrice.toFixed(2));
      dueDate = new Date(checkinDate);
    }

    // Dynamic Hybrid billing split:
    if (propertyListingType === 'Hybrid') {
      amount = parseFloat((amount / (activeBookingsCount + 1)).toFixed(2));
    }

    // Step 2: Finalize Booking in DB
    const booking = await this.bookingRepo.createBooking({
      studentId,
      unitId,
      checkinDate,
      checkoutDate: computedCheckoutDate,
      rentalType
    });

    // Step 3: Create invoice (Payment)
    if (this.paymentRepo) {
      let paymentStatus = 'Pending Payment';
      let transactionId = null;
      let rawMethod = paymentData?.method || 'cash';
      let paymentMethod = 'Cash';
      if (typeof rawMethod === 'string') {
        const lowerMethod = rawMethod.toLowerCase();
        if (lowerMethod === 'visa' || lowerMethod === 'credit_card' || lowerMethod === 'credit card' || lowerMethod === 'card') {
          paymentMethod = 'Credit Card';
        }
      }
      let paymentDate = null;
      let cardholderName = null;
      let expirationDate = null;
      let cardBankName = null;
      let maskedCardNumber = null;
      let encryptedCardNumber = null;
      let encryptedCvv = null;
      let encryptedPin = null;

      if (paymentMethod === 'Credit Card') {
        if (!paymentData || !paymentData.cardNumber || !paymentData.cardholderName || !paymentData.expiryDate || !paymentData.cvv) {
          throw new ApiError(400, 'Credit card information is required when selecting Credit Card payment method.');
        }

        cardholderName = paymentData.cardholderName || null;
        expirationDate = paymentData.expiryDate || null;
        cardBankName = paymentData.bankName || null;

        if (paymentData.cardNumber) {
          maskedCardNumber = maskCardNumber(paymentData.cardNumber);
          encryptedCardNumber = encrypt(paymentData.cardNumber.replace(/\s/g, ''));
        }
        if (paymentData.cvv) {
          encryptedCvv = encrypt(paymentData.cvv);
        }
        if (paymentData.pin) {
          encryptedPin = encrypt(paymentData.pin);
        }
      }

      await this.paymentRepo.createPayment({
        bookingId: booking.id,
        amount,
        dueDate,
        status: paymentStatus,
        transactionId,
        paymentMethod,
        paymentDate,
        cardholderName,
        expirationDate,
        cardBankName,
        maskedCardNumber,
        encryptedCardNumber,
        encryptedCvv,
        encryptedPin
      });
    }

    // Step 4: Update unit availability status dynamically based on capacity and listing type
    await this.syncUnitAvailability(unitId);
    await this.updateHybridBilling(unitId);
    
    // Notify Landlord (Diagram 4.0.11)
    if (this.notificationService && unit.property && unit.property.landlord_id) {
      await this.notificationService.notifyUser(unit.property.landlord_id.toString(), {
        title: 'New Booking Request',
        message: `A student has requested to book your unit at ${unit.property.title}.`,
        type: 'booking_request'
      });
    }

    // Notify Student
    if (this.notificationService && studentId) {
      await this.notificationService.notifyUser(studentId.toString(), {
        title: 'Booking Request Placed',
        message: 'request done waiting approval',
        type: 'booking_request_placed'
      });
    }

    return booking;
  }

  async simulatePayment(paymentData) {
    // Simulated Service (as per Diagram 4.0.11)
    if (paymentData && paymentData.amount) {
      console.log(`[PAYMENT GATEWAY] Processing transaction. Charged: ${paymentData.amount} JOD`);
    }
    return true;
  }

  async calculateDynamicAmount(booking) {
    const unit = await this.bookingRepo.prisma.unit.findUnique({
      where: { unit_id: BigInt(booking.unitId || booking.unit_id) },
      include: { property: true }
    });
    if (!unit) throw new ApiError(404, 'Associated unit not found');

    const unitPrice = parseFloat(unit.price.toString());
    const rentalType = unit.rental_type || booking.rentalType || booking.rental_type || 'monthly';

    let propertyListingType = 'Solo';
    try {
      if (unit.property?.ai_tags) {
        const tagsObj = typeof unit.property.ai_tags === 'string'
          ? JSON.parse(unit.property.ai_tags)
          : unit.property.ai_tags || {};
        propertyListingType = tagsObj.listingType || tagsObj.listing_type || 'Solo';
      }
    } catch (_) {}

    let amount = 0;
    const checkinDate = new Date(booking.checkInDate || booking.checkin_date || booking.startDate);
    const checkoutDate = new Date(booking.checkoutDate || booking.checkout_date || booking.endDate);

    if (rentalType === 'daily') {
      const diffTime = Math.abs(checkoutDate - checkinDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      amount = parseFloat((unitPrice * (diffDays || 1)).toFixed(2));
    } else if (rentalType === 'seasonal' || rentalType === 'semester') {
      amount = parseFloat(unitPrice.toFixed(2));
    } else {
      // monthly: charge full unit price
      amount = parseFloat(unitPrice.toFixed(2));
    }

    if (propertyListingType === 'Hybrid') {
      const activeBookingsCount = await this.bookingRepo.prisma.booking.count({
        where: {
          unit_id: BigInt(booking.unitId || booking.unit_id),
          status: { in: ['pending', 'Pending', 'confirmed', 'Approved', 'approved'] }
        }
      });
      const divisor = activeBookingsCount > 0 ? activeBookingsCount : 1;
      amount = parseFloat((amount / divisor).toFixed(2));
    }

    return amount;
  }

  async cancelBooking(id, userId, userRole) {
    const booking = await this.bookingRepo.getBookingById(id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (userRole !== 'admin' && booking.studentId !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to cancel this booking');
    }

    // Students are subject to 48-hour limits and payment check
    if (userRole === 'student') {
      const isPaidOrClaimed = booking.payment && (booking.payment.transaction_id || booking.payment.payment_date);
      if (isPaidOrClaimed) {
        throw new ApiError(403, 'Cannot cancel reservation after payment is paid/claimed by landlord');
      }

      const bookingDate = new Date(booking.bookingDate || booking.booking_date);
      const hoursSinceCreation = (Date.now() - bookingDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 48) {
        throw new ApiError(403, 'Cancellation period (48 hours) has expired');
      }
    }

    const result = await this.bookingRepo.cancelBooking(id);
    if (booking.unitId) {
      await this.syncUnitAvailability(booking.unitId);
      await this.updateHybridBilling(booking.unitId);
    }
    
    return result;
  }

  async autoCancelExpiredBookings(hours = 48) {
    try {
      const thresholdDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      const expiredBookings = await this.bookingRepo.prisma.booking.findMany({
        where: {
          booking_date: {
            lt: thresholdDate
          },
          status: {
            in: ['pending', 'approved']
          }
        },
        include: {
          payment: true
        }
      });

      for (const b of expiredBookings) {
        const hasPayment = b.payment && (b.payment.transaction_id || b.payment.payment_date);
        if (!hasPayment) {
          await this.bookingRepo.cancelBooking(b.booking_id.toString());
          if (b.unit_id) {
            await this.syncUnitAvailability(b.unit_id.toString());
            await this.updateHybridBilling(b.unit_id.toString());
          }
        }
      }
    } catch (err) {
      console.error('Failed auto-cancelling expired bookings:', err);
    }
  }

  async getMyBookings(userId, userRole) {
    await this.autoCancelExpiredBookings(48);
    return await this.bookingRepo.getBookingsByUser(userId, userRole);
  }

  async updateBookingStatus(id, status, landlordId) {
    const booking = await this.bookingRepo.getBookingById(id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    const isApprove = status === 'confirmed' || status === 'approved' || status === 'Approved';
    const isReject = status === 'rejected' || status === 'Rejected';

    if (isApprove) {
      // Find associated payment
      const payment = await this.bookingRepo.prisma.payment.findFirst({
        where: { booking_id: BigInt(id) }
      });

      if (payment) {
        // Recalculate dynamic amount based on current unit price
        const dynamicAmount = await this.calculateDynamicAmount(booking);
        if (dynamicAmount <= 0) {
          throw new ApiError(400, 'Invalid reservation price.');
        }

        const isCreditCard = ['visa', 'credit_card', 'credit card'].includes((payment.payment_method || '').toLowerCase());

        if (isCreditCard && payment.status !== 'Paid') {
          // Verify the reservation price before processing payment
          // Log the exact amount sent to the payment gateway
          console.log(`[PAYMENT GATEWAY] Processing credit card charge request for booking ID ${id}. Sent Amount: ${dynamicAmount} JD`);

          // Process the credit card payment
          const paymentSuccess = await this.simulatePayment({ amount: dynamicAmount });
          if (paymentSuccess) {
            // Log the exact amount received in the transaction record
            console.log(`[PAYMENT GATEWAY] Credit card charge successful for booking ID ${id}. Received Amount: ${dynamicAmount} JD`);

            const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            await this.bookingRepo.prisma.payment.update({
              where: { payment_id: payment.payment_id },
              data: {
                status: 'Paid',
                amount: dynamicAmount, // Ensure stored amount is identical to charged amount
                transaction_id: transactionId,
                payment_date: new Date()
              }
            });

            // Notify student and landlord
            if (this.notificationService) {
              await this.notificationService.notifyUser(booking.studentId, {
                title: 'Payment Successful',
                message: 'Your payment was processed successfully.',
                type: 'payment_success'
              });
              const actualLandlordId = landlordId || booking.unit?.property?.landlord_id;
              if (actualLandlordId) {
                await this.notificationService.notifyUser(actualLandlordId.toString(), {
                  title: 'Payment Received',
                  message: `Payment received for booking request.`,
                  type: 'payment_received'
                });
              }
            }
          } else {
            await this.bookingRepo.prisma.payment.update({
              where: { payment_id: payment.payment_id },
              data: { status: 'Failed' }
            });
            throw new ApiError(400, 'Payment processing failed');
          }
        } else {
          // If cash or already paid, update the amount to reflect any changes in unit price
          await this.bookingRepo.prisma.payment.update({
            where: { payment_id: payment.payment_id },
            data: { amount: dynamicAmount }
          });
        }
      }
    } else if (isReject) {
      // Rejected reservations cannot trigger any payment transactions. No payment processed.
      const payment = await this.bookingRepo.prisma.payment.findFirst({
        where: { booking_id: BigInt(id) }
      });
      if (payment) {
        await this.bookingRepo.prisma.payment.update({
          where: { payment_id: payment.payment_id },
          data: { status: 'Failed' }
        });
      }
    }

    // Update status in repository
    const updatedBooking = await this.bookingRepo.updateBookingStatus(id, status);

    // Sync unit availability status based on updated booking statuses
    if (booking.unitId) {
      await this.syncUnitAvailability(booking.unitId);
      await this.updateHybridBilling(booking.unitId);
    }

    // Notify Student
    if (this.notificationService && booking.studentId) {
      await this.notificationService.notifyUser(booking.studentId, {
        title: `Booking ${isApprove ? 'Accepted' : 'Rejected'}`,
        message: `Your booking request has been ${isApprove ? 'approved' : 'declined'} by the landlord.`,
        type: 'booking_status_update'
      });
    }

    // If landlord accepts a reservation that results in a per-bed dorm getting full, notify the landlord
    if (booking.unitId && isApprove) {
      try {
        const unitRecord = await this.bookingRepo.prisma.unit.findUnique({
          where: { unit_id: BigInt(booking.unitId) },
          include: { property: true }
        });
        if (unitRecord && unitRecord.property) {
          let tagsObj = {};
          try {
            tagsObj = typeof unitRecord.property.ai_tags === 'string'
              ? JSON.parse(unitRecord.property.ai_tags)
              : unitRecord.property.ai_tags || {};
          } catch (_) {}
          const listingType = tagsObj.listingType || tagsObj.listing_type || 'Solo';
          const capacity = Number(tagsObj.capacity) || 1;

          if (listingType !== 'Solo') {
            const activeBookingsCount = await this.bookingRepo.prisma.booking.count({
              where: {
                unit_id: BigInt(booking.unitId),
                status: { in: ['pending', 'confirmed', 'Pending', 'Approved', 'approved'] }
              }
            });
            if (activeBookingsCount >= capacity) {
              const actualLandlordId = landlordId || unitRecord.property.landlord_id;
              if (this.notificationService && actualLandlordId) {
                await this.notificationService.notifyUser(actualLandlordId.toString(), {
                  title: 'Unit Full Alert',
                  message: 'telling that the unit is now full',
                  type: 'unit_full'
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error checking full unit for notification:', err);
      }
    }

    return updatedBooking;
  }

  async syncUnitAvailability(unitId) {
    try {
      const unitRecord = await this.bookingRepo.prisma.unit.findUnique({
        where: { unit_id: BigInt(unitId) },
        include: { property: true }
      });

      if (!unitRecord || !unitRecord.property) return;

      let tagsObj = {};
      try {
        tagsObj = typeof unitRecord.property.ai_tags === 'string'
          ? JSON.parse(unitRecord.property.ai_tags)
          : unitRecord.property.ai_tags || {};
      } catch (e) {
        tagsObj = {};
      }

      const listingType = tagsObj.listingType || tagsObj.listing_type || 'Solo';
      const capacity = Number(tagsObj.capacity) || 1;

      if (listingType === 'Solo') {
        const activeBookingsCount = await this.bookingRepo.prisma.booking.count({
          where: {
            unit_id: BigInt(unitId),
            status: { in: ['pending', 'Pending', 'confirmed', 'Approved', 'approved'] }
          }
        });
        const newStatus = activeBookingsCount > 0 ? 'booked' : 'available';
        await this.bookingRepo.updateUnitStatus(unitId, newStatus);
      } else {
        const activeBookingsCount = await this.bookingRepo.prisma.booking.count({
          where: {
            unit_id: BigInt(unitId),
            status: { in: ['pending', 'Pending', 'confirmed', 'Approved', 'approved'] }
          }
        });
        const newStatus = activeBookingsCount >= capacity ? 'booked' : 'available';
        await this.bookingRepo.updateUnitStatus(unitId, newStatus);
      }
    } catch (err) {
      console.error('Error in syncUnitAvailability:', err);
    }
  }

  async updateHybridBilling(unitId) {
    try {
      const unitRecord = await this.bookingRepo.prisma.unit.findUnique({
        where: { unit_id: BigInt(unitId) },
        include: { property: true }
      });
      if (!unitRecord || !unitRecord.property) return;

      let tagsObj = {};
      try {
        tagsObj = typeof unitRecord.property.ai_tags === 'string'
          ? JSON.parse(unitRecord.property.ai_tags)
          : unitRecord.property.ai_tags || {};
      } catch (e) {}

      const listingType = tagsObj.listingType || tagsObj.listing_type || 'Solo';
      if (listingType !== 'Hybrid') return;

      // Find all active bookings for this unit
      const activeBookings = await this.bookingRepo.prisma.booking.findMany({
        where: {
          unit_id: BigInt(unitId),
          status: { in: ['pending', 'Pending', 'confirmed', 'Approved', 'approved'] }
        }
      });

      const count = activeBookings.length;
      if (count === 0) return;

      const unitPrice = parseFloat(unitRecord.price.toString());
      const splitAmount = parseFloat((unitPrice / count).toFixed(2));

      // For each active booking, update its payment amount
      for (const booking of activeBookings) {
        const payment = await this.bookingRepo.prisma.payment.findFirst({
          where: { booking_id: BigInt(booking.booking_id) }
        });
        if (payment) {
          await this.bookingRepo.prisma.payment.update({
            where: { payment_id: payment.payment_id },
            data: { amount: splitAmount }
          });
        }
      }
    } catch (err) {
      console.error('Error updating hybrid billing:', err);
    }
  }
}

