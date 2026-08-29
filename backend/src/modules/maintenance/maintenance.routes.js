import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { MaintenanceController } from './maintenance.controller.js';
import { MaintenanceService } from './maintenance.service.js';
import { MaintenanceRepository } from './maintenance.repository.js';
import * as maintenanceSchema from './maintenance.schema.js';

import { NotificationService } from '../notifications/notifications.service.js';
import { NotificationRepository } from '../notifications/notifications.repository.js';

// Dependency Injection Setup
const maintenanceRepository = new MaintenanceRepository();
const notificationService = new NotificationService(new NotificationRepository());
const maintenanceService = new MaintenanceService(maintenanceRepository, notificationService);
const maintenanceController = new MaintenanceController(maintenanceService);

const router = express.Router();

router.use(protect);

router.get(
  '/',
  authorize('student'),
  maintenanceController.getStudentTickets
);

router.get(
  '/landlord',
  authorize('landlord', 'admin'),
  maintenanceController.getLandlordTickets
);

router.post(
  '/',
  authorize('student'), // Only students report issues
  validate(maintenanceSchema.submitTicketSchema),
  maintenanceController.submitTicket
);

router.put(
  '/:id/status',
  authorize('landlord', 'admin'), // Only landlords/admins update status
  validate(maintenanceSchema.updateTicketStatusSchema),
  maintenanceController.updateTicketStatus
);

router.post(
  '/:id/rate',
  authorize('student'),
  validate(maintenanceSchema.rateTicketSchema),
  maintenanceController.rateTicket
);

export default router;
