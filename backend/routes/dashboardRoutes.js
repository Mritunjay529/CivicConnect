import express from 'express';
import { 
  getNgoDashboard, 
  getBusinessDashboard, 
  getAuthorityDashboard 
} from '../controllers/dashboardController.js';
import { authProtect } from '../middleware/authMiddleware.js';
import { roleRestrict } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/ngo', authProtect, roleRestrict('ngo'), getNgoDashboard);
router.get('/business', authProtect, roleRestrict('business'), getBusinessDashboard);
router.get('/authority', authProtect, roleRestrict('authority'), getAuthorityDashboard);

export default router;
