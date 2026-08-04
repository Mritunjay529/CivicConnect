import express from 'express';
import { body } from 'express-validator';
import { 
  createComplaint, 
  getMineComplaints, 
  getComplaints, 
  assignComplaint, 
  resolveComplaint, 
  rejectComplaint, 
  addFeedback, 
  exportComplaints 
} from '../controllers/complaintController.js';
import { authProtect } from '../middleware/authMiddleware.js';
import { roleRestrict } from '../middleware/roleMiddleware.js';
import { upload } from '../services/uploadService.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Citizen file a complaint (processes image upload)
router.post(
  '/',
  authProtect,
  roleRestrict('citizen'),
  upload.single('photo'),
  [
    body('title').notEmpty().withMessage('Complaint title is required'),
    body('description').notEmpty().withMessage('Complaint description is required'),
    body('address').notEmpty().withMessage('Location address is required'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid float (-90 to 90)'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid float (-180 to 180)'),
    validateRequest
  ],
  createComplaint
);

// Citizen views their reports
router.get('/mine', authProtect, roleRestrict('citizen'), getMineComplaints);

// Authority exports complaints list as CSV
router.get('/export', authProtect, roleRestrict('authority'), exportComplaints);

// Authority inspects the queue
router.get('/', authProtect, roleRestrict('authority'), getComplaints);

// Authority resolves/rejects/assigns tickets
router.patch('/:id/assign', authProtect, roleRestrict('authority'), assignComplaint);
router.patch('/:id/resolve', authProtect, roleRestrict('authority'), resolveComplaint);
router.patch('/:id/reject', authProtect, roleRestrict('authority'), rejectComplaint);

// Citizen feedback on resolved complaint
router.post(
  '/:id/feedback',
  authProtect,
  roleRestrict('citizen'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating score must be an integer between 1 and 5'),
    validateRequest
  ],
  addFeedback
);

export default router;
