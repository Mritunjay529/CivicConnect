import express from 'express';
import { 
  getMineNotifications, 
  markNotificationRead 
} from '../controllers/notificationController.js';
import { authProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get mine alerts
router.get('/mine', authProtect, getMineNotifications);

// Mark read
router.patch('/:id/read', authProtect, markNotificationRead);

export default router;
