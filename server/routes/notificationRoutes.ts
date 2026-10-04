import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { optionalAuth, authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, NotificationController.getNotifications);
router.patch('/:id/read', authenticateJwt, NotificationController.markAsRead);

export default router;
