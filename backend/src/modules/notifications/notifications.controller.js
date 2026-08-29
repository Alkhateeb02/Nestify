import { asyncHandler } from '../../utils/asyncHandler.js';

export class NotificationController {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  getNotifications = asyncHandler(async (req, res, next) => {
    const result = await this.notificationService.getNotifications(req.user.id);
    res.status(200).json({ success: true, count: result.length, data: result });
  });

  markAsRead = asyncHandler(async (req, res, next) => {
    await this.notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  });
}
