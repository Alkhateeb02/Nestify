import { asyncHandler } from '../../utils/asyncHandler.js';

export class PaymentController {
  constructor(paymentService) {
    this.paymentService = paymentService;
  }

  getFinancialLogs = asyncHandler(async (req, res, next) => {
    let result;
    if (req.user.role === 'admin') {
      result = await this.paymentService.getAllPlatformFinancialLogs();
    } else if (req.user.role === 'student') {
      result = await this.paymentService.getStudentFinancialLogs(req.user.id);
    } else {
      result = await this.paymentService.getLandlordFinancialLogs(req.user.id);
    }
    res.status(200).json({ success: true, count: result.length, data: result });
  });

  processPayment = asyncHandler(async (req, res, next) => {
    const { paymentId } = req.params;
    const { 
      transactionId, 
      paymentMethod,
      cardholderName,
      cardNumber,
      expiryDate,
      cvv,
      pin,
      bankName
    } = req.body;
    const result = await this.paymentService.payInvoice(paymentId, {
      transactionId,
      paymentMethod,
      paymentDate: new Date(),
      status: 'completed',
      cardholderName,
      cardNumber,
      expiryDate,
      cvv,
      pin,
      bankName
    });
    res.status(200).json({ success: true, data: result });
  });
}
