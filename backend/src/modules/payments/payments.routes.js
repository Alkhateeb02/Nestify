import express from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { PaymentController } from './payments.controller.js';
import { PaymentService } from './payments.service.js';
import { PaymentRepository } from './payments.repository.js';

import { NotificationService } from '../notifications/notifications.service.js';
import { NotificationRepository } from '../notifications/notifications.repository.js';

const paymentRepository = new PaymentRepository();
const notificationService = new NotificationService(new NotificationRepository());
const paymentService = new PaymentService(paymentRepository, notificationService);
const paymentController = new PaymentController(paymentService);

const router = express.Router();

router.use(protect);

router.get('/logs', paymentController.getFinancialLogs);
router.post('/:paymentId/pay', paymentController.processPayment);

export default router;
