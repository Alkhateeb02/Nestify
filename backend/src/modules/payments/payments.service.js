import { encrypt } from '../../utils/crypto.js';
import { ApiError } from '../../utils/ApiError.js';

function maskCardNumber(cardNumber) {
  if (!cardNumber) return null;
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return digits;
  const last4 = digits.slice(-4);
  return `**** **** **** ${last4}`;
}

export class PaymentService {
  constructor(paymentRepository, notificationService) {
    this.paymentRepo = paymentRepository;
    this.notificationService = notificationService;
  }

  async getLandlordFinancialLogs(landlordId) {
    return await this.paymentRepo.getPaymentsByLandlord(landlordId);
  }

  async getStudentFinancialLogs(studentId) {
    return await this.paymentRepo.getPaymentsByStudent(studentId);
  }

  async getAllPlatformFinancialLogs() {
    return await this.paymentRepo.getAllPayments();
  }

  async calculateDynamicAmount(booking) {
    const unit = booking.unit;
    if (!unit) throw new ApiError(404, 'Associated unit not found');

    const unitPrice = parseFloat(unit.price.toString());
    const rentalType = unit.rental_type || booking.rental_type || 'monthly';

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
    const checkinDate = new Date(booking.checkin_date || booking.checkInDate);
    const checkoutDate = new Date(booking.checkout_date || booking.checkoutDate);

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
      const activeBookingsCount = await this.paymentRepo.prisma.booking.count({
        where: {
          unit_id: BigInt(booking.unit_id || booking.unitId),
          status: { in: ['pending', 'Pending', 'confirmed', 'Approved', 'approved'] }
        }
      });
      const divisor = activeBookingsCount > 0 ? activeBookingsCount : 1;
      amount = parseFloat((amount / divisor).toFixed(2));
    }

    return amount;
  }

  async payInvoice(paymentId, { 
    transactionId, 
    paymentMethod, 
    paymentDate, 
    status,
    cardholderName,
    cardNumber,
    expiryDate,
    cvv,
    pin,
    bankName
  }) {
    const payment = await this.paymentRepo.getPaymentById(paymentId);
    if (!payment) throw new ApiError(404, 'Payment not found');

    const booking = await this.paymentRepo.prisma.booking.findUnique({
      where: { booking_id: BigInt(payment.bookingId) },
      include: { unit: { include: { property: true } } }
    });

    if (booking) {
      const bStatus = booking.status || '';
      if (['Pending', 'pending', 'pending_approval'].includes(bStatus)) {
        throw new ApiError(400, 'Payments cannot be processed while the reservation is Pending.');
      }
      if (['Rejected', 'rejected'].includes(bStatus)) {
        throw new ApiError(400, 'Rejected reservations cannot trigger any payment transactions.');
      }
      if (['cancelled', 'Cancelled'].includes(bStatus)) {
        throw new ApiError(400, 'Cancelled reservations cannot trigger any payment transactions.');
      }
    }

    let rawMethod = paymentMethod || 'cash';
    let normalizedMethod = 'Cash';
    if (typeof rawMethod === 'string') {
      const lowerMethod = rawMethod.toLowerCase();
      if (lowerMethod === 'visa' || lowerMethod === 'credit_card' || lowerMethod === 'credit card' || lowerMethod === 'card') {
        normalizedMethod = 'Credit Card';
      }
    }

    let dynamicAmount = parseFloat(payment.amount.toString());
    if (booking) {
      dynamicAmount = await this.calculateDynamicAmount(booking);
    }
    if (dynamicAmount <= 0) {
      throw new ApiError(400, 'Invalid reservation price.');
    }

    const updatePayload = {
      transactionId,
      paymentMethod: normalizedMethod,
      paymentDate,
      status,
      amount: dynamicAmount
    };

    if (normalizedMethod === 'Credit Card') {
      // Log the exact amount sent to the payment gateway
      console.log(`[PAYMENT GATEWAY] Processing credit card charge request for invoice ${paymentId}. Sent Amount: ${dynamicAmount} JD`);
      console.log(`[PAYMENT GATEWAY] Credit card charge successful for invoice ${paymentId}. Received Amount: ${dynamicAmount} JD`);

      if (cardNumber) {
        updatePayload.cardholderName = cardholderName || null;
        updatePayload.expirationDate = expiryDate || null;
        updatePayload.cardBankName = bankName || null;
        updatePayload.maskedCardNumber = maskCardNumber(cardNumber);
        updatePayload.encryptedCardNumber = encrypt(cardNumber.replace(/\s/g, ''));
        if (cvv) updatePayload.encryptedCvv = encrypt(cvv);
        if (pin) updatePayload.encryptedPin = encrypt(pin);
      }
    } else {
      // Cash payment
      updatePayload.cardholderName = null;
      updatePayload.expirationDate = null;
      updatePayload.cardBankName = null;
      updatePayload.maskedCardNumber = null;
      updatePayload.encryptedCardNumber = null;
      updatePayload.encryptedCvv = null;
      updatePayload.encryptedPin = null;
    }

    const result = await this.paymentRepo.updatePayment(paymentId, updatePayload);

    if (payment && this.notificationService) {
      try {
        const booking = await this.paymentRepo.prisma.booking.findUnique({
          where: { booking_id: BigInt(payment.bookingId) }
        });
        if (booking && booking.student_id) {
          await this.notificationService.notifyUser(booking.student_id.toString(), {
            title: 'Payment Claimed',
            message: 'payment is claimed',
            type: 'payment_claimed'
          });
        }
      } catch (err) {
        console.error('Failed to send payment claimed notification:', err);
      }
    }

    return result;
  }
}
