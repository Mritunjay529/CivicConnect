import express from 'express';
import { body } from 'express-validator';
import { 
  createEvent, 
  getEvents, 
  rsvpEvent, 
  sponsorEvent 
} from '../controllers/eventController.js';
import { authProtect } from '../middleware/authMiddleware.js';
import { roleRestrict } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Create Event
router.post(
  '/',
  authProtect,
  roleRestrict('ngo', 'business'),
  [
    body('title').notEmpty().withMessage('Event title is required'),
    body('description').notEmpty().withMessage('Event description is required'),
    body('date').isISO8601().withMessage('Event date must be a valid date format'),
    body('type').isIn(['campaign', 'volunteering', 'csr']).withMessage('Event type must be campaign, volunteering, or csr'),
    validateRequest
  ],
  createEvent
);

// Get events list (calendar)
router.get('/', authProtect, getEvents);

// RSVP to event
router.post('/:id/rsvp', authProtect, rsvpEvent);

// Business sponsor event
router.patch('/:id/sponsor', authProtect, roleRestrict('business'), sponsorEvent);

export default router;
