import { emitToUser } from '../../config/socket.js';
import { emailService } from '../../utils/email.service.js';
import { UserRepository } from '../users/users.repository.js';

const userRepo = new UserRepository();

export class NotificationService {
  constructor(notificationRepository) {
    this.notificationRepo = notificationRepository;
  }

  async getNotifications(userId) {
    return await this.notificationRepo.getNotifications(userId);
  }

  async markAsRead(id, userId) {
    return await this.notificationRepo.markAsRead(id, userId);
  }

  async notifyUser(userId, { title, message, type, sendEmail = true }) {
    const notification = await this.notificationRepo.createNotification(userId, title, message, type);

    // Emit Real-time via Socket.io
    emitToUser(userId, 'notification', notification);

    // Send Email if requested
    if (sendEmail) {
      const user = await userRepo.getUserById(userId);
      if (user && user.email) {
        console.log(`[Email] Sending notification email to ${user.email}: ${title}`);
      }
    }

    return notification;
  }
}

