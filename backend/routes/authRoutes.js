import express from 'express';
import { body } from 'express-validator';
import { 
  signupCitizen, 
  signupNgo, 
  signupBusiness, 
  signupAuthority, 
  login, 
  refresh, 
  logout, 
  getMe, 
  approveAuthority 
} from '../controllers/authController.js';
import { authProtect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

const commonSignupValidate = [
  body('email').isEmail().withMessage('Please supply a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Citizen Signup
router.post(
  '/signup/citizen',
  [
    ...commonSignupValidate,
    body('name').notEmpty().withMessage('Name is required'),
    validateRequest
  ],
  signupCitizen
);

// NGO Signup
router.post(
  '/signup/ngo',
  [
    ...commonSignupValidate,
    body('orgName').notEmpty().withMessage('Organization Name is required'),
    body('registrationNumber').notEmpty().withMessage('NGO registration number is required'),
    body('contactPerson').notEmpty().withMessage('Contact person is required'),
    validateRequest
  ],
  signupNgo
);

// Business Signup
router.post(
  '/signup/business',
  [
    ...commonSignupValidate,
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('gstNumber').notEmpty().withMessage('GST number is required'),
    body('csrFocusArea').notEmpty().withMessage('CSR focus area is required'),
    validateRequest
  ],
  signupBusiness
);

// Authority Signup
router.post(
  '/signup/authority',
  [
    ...commonSignupValidate,
    body('name').notEmpty().withMessage('Official name is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    validateRequest
  ],
  signupAuthority
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please supply a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').isIn(['citizen', 'ngo', 'business', 'authority']).withMessage('Invalid role selected'),
    validateRequest
  ],
  login
);

// Session operations
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authProtect, getMe);

// Approve Authority Account (Admin-only simulated checks)
router.patch('/authority/:id/approve', async (req, res, next) => {
  // Simple check: Allow if admin key is supplied in headers
  // For sandbox testing, let's verify if x-admin-key equals 'admin123'
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'admin123') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Denied: Admin authorization required (provide x-admin-key: admin123 header)' 
    });
  }
  next();
}, approveAuthority);

export default router;
