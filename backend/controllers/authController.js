import crypto from 'crypto';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, generateToken } from '../utils/helpers.js';
import {
  sendMail,
  signupWelcomeTemplate,
  loginAlertTemplate,
  forgotPasswordTemplate,
  passwordChangedTemplate
} from '../utils/mailer.js';

// Zod signup validation schema supporting both frontend variations
export const signupSchema = z
  .object({
    role: z.enum(['citizen', 'ngo', 'business', 'authority']).default('citizen'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phone: z.string().optional(),
    name: z.string().optional(),
    fullName: z.string().optional(),
    orgName: z.string().optional(),
    regNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    contact: z.string().optional(),
    contactPerson: z.string().optional(),
    bizName: z.string().optional(),
    businessName: z.string().optional(),
    gst: z.string().optional(),
    gstNumber: z.string().optional(),
    focusArea: z.string().optional(),
    csrFocusArea: z.string().optional(),
    department: z.string().optional(),
    dept: z.string().optional(),
    employeeId: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const role = data.role.toLowerCase();
    if (role === 'citizen') {
      const name = data.name || data.fullName;
      if (!name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Full name is required for citizen accounts',
          path: ['name']
        });
      }
    } else if (role === 'ngo') {
      const orgName = data.orgName;
      const regNumber = data.regNumber || data.registrationNumber;
      const contact = data.contact || data.contactPerson;
      if (!orgName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Organization name is required', path: ['orgName'] });
      if (!regNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Registration number is required', path: ['regNumber'] });
      if (!contact) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Contact person name is required', path: ['contact'] });
    } else if (role === 'business') {
      const bizName = data.bizName || data.businessName;
      const gst = data.gst || data.gstNumber;
      if (!bizName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Business name is required', path: ['bizName'] });
      if (!gst) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'GST / Tax ID is required', path: ['gst'] });
    } else if (role === 'authority') {
      const department = data.department || data.dept;
      const employeeId = data.employeeId;
      if (!department) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Department is required', path: ['department'] });
      if (!employeeId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Employee ID is required', path: ['employeeId'] });
    }
  });

// Zod login validation schema
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone identifier is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.string().optional()
});

/**
 * @desc    Register a new user (citizen, ngo, business, authority)
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const {
    role = 'citizen',
    email,
    password,
    phone,
    name,
    fullName,
    orgName,
    regNumber,
    registrationNumber,
    contact,
    contactPerson,
    bizName,
    businessName,
    gst,
    gstNumber,
    focusArea,
    csrFocusArea,
    department,
    dept,
    employeeId
  } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email address already exists. Please log in instead.'
    });
  }

  // Construct standard user record
  const resolvedRole = role.toLowerCase() === 'municipal authority' ? 'authority' : role.toLowerCase();
  const resolvedName = name || fullName || orgName || bizName || department || 'Civic User';

  const userData = {
    role: resolvedRole,
    name: resolvedName,
    email: normalizedEmail,
    phone: phone ? phone.trim() : '',
    password,
    status: resolvedRole === 'authority' ? 'pending' : 'active',
    orgName: orgName || '',
    regNumber: regNumber || registrationNumber || '',
    contact: contact || contactPerson || '',
    bizName: bizName || businessName || '',
    gst: gst || gstNumber || '',
    focusArea: focusArea || csrFocusArea || 'Environment',
    department: department || dept || '',
    employeeId: employeeId || ''
  };

  const user = await User.create(userData);

  // Send signup email fire-and-forget
  const welcomeHtml = signupWelcomeTemplate(user);
  sendMail({
    to: user.email,
    subject: resolvedRole === 'authority' ? 'CivicConnect: Authority Access Pending Verification' : 'Welcome to CivicConnect!',
    html: welcomeHtml
  });

  const responseUser = user.toObject();
  delete responseUser.password;

  if (user.status === 'pending') {
    return res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Authority access is pending verification by an administrator.',
      data: responseUser
    });
  }

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Account registered successfully',
    token,
    data: responseUser
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password, role } = req.body;

  const cleanIdentifier = identifier.trim().toLowerCase();

  // Query by email OR phone, selecting password
  const user = await User.findOne({
    $or: [{ email: cleanIdentifier }, { phone: identifier.trim() }]
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email/phone or password'
    });
  }

  // Check role matching if role was explicitly passed from frontend tab
  if (role) {
    const requestedRole = role.toLowerCase().replace('municipal authority', 'authority');
    if (user.role !== requestedRole && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Account is registered as '${user.role}', but you attempted to log in as '${requestedRole}'. Please select the correct role tab.`
      });
    }
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email/phone or password'
    });
  }

  // Check account status
  if (user.status === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your authority account is pending administrator verification. Access has not yet been approved.'
    });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({
      success: false,
      message: 'Your account access has been rejected by an administrator. Please contact municipal support.'
    });
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Send security alert login email fire-and-forget
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Web Browser';
  const loginAlertHtml = loginAlertTemplate(user, { ip, userAgent, timestamp: user.lastLoginAt });

  sendMail({
    to: user.email,
    subject: 'Security Alert: New Sign-in to CivicConnect',
    html: loginAlertHtml
  });

  const responseUser = user.toObject();
  delete responseUser.password;

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    data: responseUser
  });
});

/**
 * @desc    Request password reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Avoid user enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been dispatched.'
    });
  }

  // Generate unhashed reset token
  const rawToken = crypto.randomBytes(32).toString('hex');
  // Store hashed token in DB
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

  // Send email fire-and-forget
  sendMail({
    to: user.email,
    subject: 'CivicConnect: Password Reset Request',
    html: forgotPasswordTemplate(user, resetUrl)
  });

  // Create in-app Notification
  await Notification.create({
    user: user._id,
    title: 'Password Reset Initiated',
    message: 'A password reset link was sent to your email address.',
    type: 'security'
  }).catch((err) => console.warn('Notification create failed:', err.message));

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been dispatched.'
  });
});

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a new password with at least 6 characters'
    });
  }

  // Hash received raw token to compare with DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Password reset token is invalid or has expired'
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  // Send confirmation email fire-and-forget
  sendMail({
    to: user.email,
    subject: 'CivicConnect: Password Changed Successfully',
    html: passwordChangedTemplate(user)
  });

  // Create in-app notification
  await Notification.create({
    user: user._id,
    title: 'Password Updated',
    message: 'Your account password has been successfully updated.',
    type: 'security'
  }).catch((err) => console.warn('Notification create failed:', err.message));

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You may now log in with your new password.'
  });
});

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});
