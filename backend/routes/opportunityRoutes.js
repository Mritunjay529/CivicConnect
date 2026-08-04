import express from 'express';
import { body } from 'express-validator';
import { 
  createOpportunity, 
  getOpportunities, 
  applyOpportunity, 
  updateApplicantStatus, 
  getRecommendedOpportunities 
} from '../controllers/opportunityController.js';
import { authProtect } from '../middleware/authMiddleware.js';
import { roleRestrict } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// NGO/Business posts opportunity
router.post(
  '/',
  authProtect,
  roleRestrict('ngo', 'business'),
  [
    body('title').notEmpty().withMessage('Opportunity title is required'),
    body('description').notEmpty().withMessage('Opportunity description is required'),
    body('category').notEmpty().withMessage('Focus category is required'),
    body('date').isISO8601().withMessage('Opportunity date must be a valid date format'),
    body('location').notEmpty().withMessage('Meeting location is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Spot capacity must be an integer >= 1'),
    validateRequest
  ],
  createOpportunity
);

// Get matching volunteer suggestions for citizen
router.get('/recommended', authProtect, roleRestrict('citizen'), getRecommendedOpportunities);

// List opportunities
router.get('/', authProtect, getOpportunities);

// Citizen apply to drive
router.post('/:id/apply', authProtect, roleRestrict('citizen'), applyOpportunity);

// NGO/Business approve/reject candidates
router.patch(
  '/:id/applicants/:userId',
  authProtect,
  roleRestrict('ngo', 'business'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    validateRequest
  ],
  updateApplicantStatus
);

export default router;
