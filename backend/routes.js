import express from 'express';
import { protect, authorize, validate, upload } from './middleware/index.js';

// Controllers
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  signupSchema,
  loginSchema
} from './controllers/authController.js';

import {
  suggest,
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  updateStatus,
  submitFeedback,
  toggleSupport,
  getStats
} from './controllers/complaintController.js';

import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  applyToOpportunity,
  getMyApplications,
  getNgoApplications,
  updateApplicationStatus,
  completeVolunteer,
  getNgoStats,
  getMyCsrInitiatives
} from './controllers/opportunityController.js';

import {
  createEvent,
  getEvents,
  toggleRsvp
} from './controllers/eventController.js';

import {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getPendingAuthorities,
  reviewAuthority
} from './controllers/userController.js';

const router = express.Router();

/* ==========================================================================
   1. AUTHENTICATION ROUTES
   ========================================================================== */
router.post('/auth/signup', validate(signupSchema), signup);
router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password/:token', resetPassword);
router.get('/auth/me', protect, getMe);

/* ==========================================================================
   2. COMPLAINTS & CIVIC ISSUES ROUTES
   ========================================================================== */
// Suggest category & priority
router.post('/complaints/suggest', suggest);

// Citizen submissions & history
router.post('/complaints', protect, authorize('citizen'), upload.single('image'), createComplaint);
router.get('/complaints/mine', protect, authorize('citizen'), getMyComplaints);

// Authority queries & analytics (MUST be defined before /:id)
router.get('/complaints/stats', protect, authorize('authority', 'admin'), getStats);
router.get('/complaints', protect, authorize('authority', 'admin'), getComplaints);

// Single complaint operations
router.get('/complaints/:id', protect, getComplaintById);
router.patch('/complaints/:id/status', protect, authorize('authority', 'admin'), updateStatus);
router.post('/complaints/:id/feedback', protect, authorize('citizen'), submitFeedback);
router.post('/complaints/:id/support', protect, authorize('citizen'), toggleSupport);

/* ==========================================================================
   3. VOLUNTEER OPPORTUNITIES & CSR INITIATIVES
   ========================================================================== */
// Creation
router.post('/opportunities', protect, authorize('ngo', 'business', 'admin'), createOpportunity);

// Listing & public discovery
router.get('/opportunities', protect, getOpportunities);

// Specific dashboards & application lists (MUST be defined before /:id)
router.get('/opportunities/stats', protect, authorize('ngo', 'admin'), getNgoStats);
router.get('/opportunities/csr/mine', protect, authorize('business', 'admin'), getMyCsrInitiatives);
router.get('/opportunities/applications/mine', protect, authorize('citizen'), getMyApplications);
router.get('/opportunities/applications', protect, authorize('ngo', 'admin'), getNgoApplications);

// Single opportunity & application management
router.get('/opportunities/:id', protect, getOpportunityById);
router.post('/opportunities/:id/apply', protect, authorize('citizen'), applyToOpportunity);
router.patch('/opportunities/:id/applications/:appId', protect, authorize('ngo', 'admin'), updateApplicationStatus);
router.patch('/opportunities/:id/complete/:userId', protect, authorize('ngo', 'admin'), completeVolunteer);

/* ==========================================================================
   4. EVENTS & COMMUNITY CALENDAR
   ========================================================================== */
router.post('/events', protect, authorize('ngo', 'business', 'authority', 'admin'), createEvent);
router.get('/events', protect, getEvents);
router.post('/events/:id/rsvp', protect, toggleRsvp);

/* ==========================================================================
   5. USERS & IN-APP NOTIFICATIONS
   ========================================================================== */
router.get('/users/profile', protect, getProfile);
router.patch('/users/profile', protect, updateProfile);

// Notifications (read-all must be before /:id/read)
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);

/* ==========================================================================
   6. ADMIN VERIFICATION & GOVERNANCE
   ========================================================================== */
router.get('/admin/pending-authorities', protect, authorize('admin'), getPendingAuthorities);
router.patch('/admin/authorities/:id', protect, authorize('admin'), reviewAuthority);

export default router;
