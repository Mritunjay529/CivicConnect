import express from 'express';
import { 
  getUserProfile, 
  generateCertificate 
} from '../controllers/rewardController.js';
import { authProtect } from '../middleware/authMiddleware.js';
import { roleRestrict } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get profile, badges, activity history timeline
router.get('/:id/profile', authProtect, getUserProfile);

// Generate/Download PDF Certificate
// Open to citizen role
router.get('/:id/certificate/:activityId', authProtect, roleRestrict('citizen'), generateCertificate);

export default router;
