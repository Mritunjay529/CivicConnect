import bcrypt from 'bcryptjs';
import { User, Citizen, NGO, Business, Authority } from '../models/User.js';
import { 
  generateAccessToken, 
  generateRefreshToken 
} from '../middleware/authMiddleware.js';
import { Notification } from '../models/Notification.js';
import { sendEmail } from '../services/emailService.js';

// Signup Citizen
export const signupCitizen = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const citizen = await Citizen.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'citizen'
    });

    const accessToken = generateAccessToken(citizen);
    const refreshToken = generateRefreshToken(citizen);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        role: citizen.role,
        points: citizen.points,
        badges: citizen.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

// Signup NGO
export const signupNgo = async (req, res, next) => {
  try {
    const { orgName, registrationNumber, contactPerson, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const ngo = await NGO.create({
      orgName,
      registrationNumber,
      contactPerson,
      email,
      password: hashedPassword,
      phone,
      role: 'ngo',
      status: 'pending' // pending until verified (mock admin verification)
    });

    res.status(201).json({
      success: true,
      message: 'NGO account created successfully. Verification is pending.',
      user: {
        id: ngo._id,
        orgName: ngo.orgName,
        email: ngo.email,
        role: ngo.role,
        status: ngo.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Signup Business
export const signupBusiness = async (req, res, next) => {
  try {
    const { businessName, gstNumber, email, csrFocusArea, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const business = await Business.create({
      businessName,
      gstNumber,
      email,
      csrFocusArea,
      password: hashedPassword,
      phone,
      role: 'business'
    });

    const accessToken = generateAccessToken(business);
    const refreshToken = generateRefreshToken(business);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: business._id,
        businessName: business.businessName,
        email: business.email,
        role: business.role,
        csrFocusArea: business.csrFocusArea
      }
    });
  } catch (error) {
    next(error);
  }
};

// Signup Authority
export const signupAuthority = async (req, res, next) => {
  try {
    const { name, department, employeeId, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const authority = await Authority.create({
      name,
      department,
      employeeId,
      email,
      password: hashedPassword,
      phone,
      role: 'authority',
      status: 'pending' // needs admin approval before activation
    });

    res.status(201).json({
      success: true,
      message: 'Authority account created successfully. Representative activation is pending admin approval.',
      user: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        role: authority.role,
        department: authority.department,
        status: authority.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login User
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(400).json({ success: false, message: `Access denied. Incorrect role selection for this account.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Role-specific status checks
    if (user.role === 'authority' && user.status === 'pending') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your municipal authority representative account is pending admin approval' 
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Formatting return object
    let formattedUser = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    if (user.role === 'citizen') {
      formattedUser.name = user.name;
      formattedUser.points = user.points;
      formattedUser.badges = user.badges;
    } else if (user.role === 'ngo') {
      formattedUser.orgName = user.orgName;
      formattedUser.status = user.status;
    } else if (user.role === 'business') {
      formattedUser.businessName = user.businessName;
      formattedUser.csrFocusArea = user.csrFocusArea;
    } else if (user.role === 'authority') {
      formattedUser.name = user.name;
      formattedUser.department = user.department;
      formattedUser.status = user.status;
    }

    res.status(200).json({
      success: true,
      accessToken,
      user: formattedUser
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default_super_secret_refresh_key_998822');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Session user not found' });
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Get Current User (Me)
export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Admin Approve Authority Account
export const approveAuthority = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rep = await Authority.findById(id);
    if (!rep) {
      return res.status(404).json({ success: false, message: 'Authority user not found' });
    }

    rep.status = 'approved';
    await rep.save();

    // Trigger Notification for the rep
    await Notification.create({
      userId: rep._id,
      title: 'Account Activated',
      message: 'Your official authority account is approved by admin. You can now access your control dashboard.',
      type: 'account'
    });

    // Mock Email notify
    await sendEmail({
      to: rep.email,
      subject: 'CivicConnect Authority Activation Approved',
      html: `<h3>Welcome to CivicConnect, ${rep.name}!</h3>
      <p>Your authority rep account for the <strong>${rep.department}</strong> department is active. You can now login and resolve complaints.</p>`
    });

    res.status(200).json({
      success: true,
      message: `Representative ${rep.name} approved and notified.`,
      user: {
        id: rep._id,
        name: rep.name,
        role: rep.role,
        status: rep.status
      }
    });
  } catch (error) {
    next(error);
  }
};
