import prisma from '../../config/prisma.js';
import { Payment } from '../../domain/entities/Payment.js';

export class PaymentRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async getPaymentsByLandlord(landlordId) {
    const payments = await this.prisma.payment.findMany({
      where: {
        booking: {
          unit: {
            property: {
              landlord_id: BigInt(landlordId)
            }
          }
        }
      },
      include: {
        booking: {
          include: {
            student: { include: { user: true } },
            unit: { include: { property: true } }
          }
        }
      },
      orderBy: { payment_date: 'desc' }
    });

    return payments
      .filter(p => {
        const isPaid = p.payment_date || p.transaction_id;
        const isBookingApproved = p.booking && ['approved', 'confirmed'].includes((p.booking.status || '').toLowerCase());
        return isPaid || isBookingApproved;
      })
      .map(p => this._mapToDomain(p));
  }

  async getPaymentsByStudent(studentId) {
    const payments = await this.prisma.payment.findMany({
      where: {
        booking: {
          student_id: BigInt(studentId)
        }
      },
      include: {
        booking: {
          include: {
            student: { include: { user: true } },
            unit: { include: { property: true } }
          }
        }
      },
      orderBy: { payment_date: 'desc' }
    });

    return payments
      .filter(p => {
        const isPaid = p.payment_date || p.transaction_id;
        const isBookingApproved = p.booking && ['approved', 'confirmed'].includes((p.booking.status || '').toLowerCase());
        return isPaid || isBookingApproved;
      })
      .map(p => this._mapToDomain(p));
  }

  async getAllPayments() {
    const payments = await this.prisma.payment.findMany({
      include: {
        booking: {
          include: {
            student: { include: { user: true } },
            unit: { include: { property: true } }
          }
        }
      },
      orderBy: { payment_date: 'desc' }
    });
    return payments
      .filter(p => {
        const isPaid = p.payment_date || p.transaction_id;
        const isBookingApproved = p.booking && ['approved', 'confirmed'].includes((p.booking.status || '').toLowerCase());
        return isPaid || isBookingApproved;
      })
      .map(p => this._mapToDomain(p));
  }

  async createPayment({ 
    bookingId, 
    amount, 
    dueDate, 
    status, 
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
  }) {
    const payment = await this.prisma.payment.create({
      data: {
        booking_id: BigInt(bookingId),
        amount: amount,
        transaction_id: transactionId || null,
        payment_method: paymentMethod || null,
        payment_date: paymentDate ? new Date(paymentDate) : null,
        due_date: dueDate ? new Date(dueDate) : null,
        status: status || 'pending',
        cardholder_name: cardholderName || null,
        expiration_date: expirationDate || null,
        card_bank_name: cardBankName || null,
        masked_card_number: maskedCardNumber || null,
        encrypted_card_number: encryptedCardNumber || null,
        encrypted_cvv: encryptedCvv || null,
        encrypted_pin: encryptedPin || null
      }
    });
    return this._mapToDomain(payment);
  }

  async updatePayment(paymentId, { 
    transactionId, 
    paymentMethod, 
    paymentDate, 
    status,
    cardholderName,
    expirationDate,
    cardBankName,
    maskedCardNumber,
    encryptedCardNumber,
    encryptedCvv,
    encryptedPin
  }) {
    const updated = await this.prisma.payment.update({
      where: { payment_id: BigInt(paymentId) },
      data: {
        transaction_id: transactionId,
        payment_method: paymentMethod,
        payment_date: paymentDate ? new Date(paymentDate) : undefined,
        status: status,
        cardholder_name: cardholderName,
        expiration_date: expirationDate,
        card_bank_name: cardBankName,
        masked_card_number: maskedCardNumber,
        encrypted_card_number: encryptedCardNumber,
        encrypted_cvv: encryptedCvv,
        encrypted_pin: encryptedPin
      }
    });
    return this._mapToDomain(updated);
  }

  async getPaymentById(id) {
    const payment = await this.prisma.payment.findUnique({
      where: { payment_id: BigInt(id) },
      include: {
        booking: {
          include: {
            student: { include: { user: true } },
            unit: { include: { property: true } }
          }
        }
      }
    });
    if (!payment) return null;
    return this._mapToDomain(payment);
  }

  _mapToDomain(record) {
    let status = record.status || 'pending';
    if (!record.status && (record.payment_date || record.transaction_id)) {
      status = (record.payment_method || '').toLowerCase() === 'cash' ? 'received' : 'completed';
    }
    const payment = new Payment({
      paymentID: record.payment_id.toString(),
      amount: record.amount,
      paymentDate: record.payment_date,
      paymentMethod: record.payment_method,
      dueDate: record.due_date || record.payment_date || new Date(),
      status: status,
      cardholderName: record.cardholder_name,
      expirationDate: record.expiration_date,
      cardBankName: record.card_bank_name,
      maskedCardNumber: record.masked_card_number
    });
    // Add context for the UI
    payment.id = payment.paymentID;
    payment.transactionId = record.transaction_id;
    payment.transaction_id = record.transaction_id;
    payment.studentName = record.booking?.student?.user?.name;
    payment.propertyTitle = record.booking?.unit?.property?.title;
    payment.bookingId = record.booking_id.toString();
    payment.paymentMethod = record.payment_method;
    
    // UI convenience properties:
    payment.cardholderName = record.cardholder_name;
    payment.expirationDate = record.expiration_date;
    payment.cardBankName = record.card_bank_name;
    payment.maskedCardNumber = record.masked_card_number;

    return payment;
  }
}
