import express from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { NotificationController } from './notifications.controller.js';
import { NotificationService } from './notifications.service.js';
import { NotificationRepository } from './notifications.repository.js';

// Dependency Injection Setup
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

const router = express.Router();

router.use(protect);
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
