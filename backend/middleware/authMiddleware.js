import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_super_secret_access_key_10293');

      // Get user from the token and attach to req.user (excl. password)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Check if user is approved (only for authority role)
      if (user.role === 'authority' && user.status === 'pending') {
        return res.status(403).json({ success: false, message: 'Your municipal representative account is pending admin approval' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Token utilities
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET || 'default_super_secret_access_key_10293', 
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_REFRESH_SECRET || 'default_super_secret_refresh_key_998822', 
    { expiresIn: '7d' }
  );
};
