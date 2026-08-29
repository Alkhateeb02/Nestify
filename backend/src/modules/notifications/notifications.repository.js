import prisma from '../../config/prisma.js';

export class NotificationRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async getNotifications(userId) {
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: BigInt(userId) },
      orderBy: { created_at: 'desc' }
    });
    return notifications.map(n => ({
      ...n,
      id: n.notification_id.toString(),
      user_id: n.user_id.toString()
    }));
  }

  async markAsRead(id, userId) {
    const updated = await this.prisma.notification.updateMany({
      where: { notification_id: BigInt(id), user_id: BigInt(userId) },
      data: { is_read: true }
    });
    return updated.count > 0;
  }

  async createNotification(userId, title, message, type) {
    const notification = await this.prisma.notification.create({
      data: {
        user_id: BigInt(userId),
        title,
        message,
        type,
        is_read: false
      }
    });
    return {
      ...notification,
      id: notification.notification_id.toString(),
      user_id: notification.user_id.toString()
    };
  }
}

