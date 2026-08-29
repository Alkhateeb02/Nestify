export class Payment {
  constructor({ paymentID, amount, paymentDate, paymentMethod, dueDate, status = 'pending', cardholderName, expirationDate, cardBankName, maskedCardNumber }) {
    this.paymentID = paymentID;
    this.amount = amount;
    this.paymentDate = paymentDate ? new Date(paymentDate) : null;
    this.paymentMethod = paymentMethod;
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.status = status;
    this.cardholderName = cardholderName;
    this.expirationDate = expirationDate;
    this.cardBankName = cardBankName;
    this.maskedCardNumber = maskedCardNumber;
  }

  // Activity Diagram 4.0.27: Pay Booking Fee
  complete(method, transactionId) {
    this.status = 'paid';
    this.paymentDate = new Date();
    this.paymentMethod = method;
    this.transactionId = transactionId;
  }

  fail() {
    this.status = 'FAILED';
  }

  // Activity Diagram 4.0.27: Confirm Booking & Send Receipt
  generateReceipt() {
    if (this.status !== 'paid') {
      throw new Error('Cannot generate receipt for incomplete payment');
    }
    return `
      --- NESTIFY RECEIPT ---
      Payment ID: ${this.paymentID}
      Amount: ${this.amount} JOD
      Date: ${this.paymentDate ? this.paymentDate.toLocaleString() : ''}
      Method: ${this.paymentMethod}
      Status: ${this.status}
      -----------------------
    `;
  }
}

