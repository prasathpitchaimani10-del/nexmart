import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const notifications = await DbService.getNotifications(req.user?.userId);
      return sendSuccess(res, 'Notifications retrieved.', { notifications });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await DbService.markNotificationRead(id);
      return sendSuccess(res, 'Notification marked as read.');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
