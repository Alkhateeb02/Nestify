import express from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminRepository } from './admin.repository.js';
import { AiService } from '../ai/ai.service.js';
import { NotificationService } from '../notifications/notifications.service.js';
import { NotificationRepository } from '../notifications/notifications.repository.js';

// Dependency Injection Setup
const adminRepository = new AdminRepository();
const notificationService = new NotificationService(new NotificationRepository());
const aiService = new AiService();
const adminService = new AdminService(adminRepository, aiService, notificationService);
const adminController = new AdminController(adminService);

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/ai-performance', adminController.getAiPerformance);
router.get('/pending-properties', adminController.getPendingProperties);
router.get('/reports', adminController.getReports);
router.post('/ban-user/:userId', adminController.banUser);
router.patch('/reports/:reportId', adminController.updateReportStatus);



export default router;
