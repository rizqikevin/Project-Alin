const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // For development, handle mock tokens
    if (token.startsWith('mock_token_')) {
      const userId = token.split('_')[2];
      const user = await User.findById(userId);
      if (!user) {
        throw new AuthenticationError('Invalid mock token');
      }
      req.user = user;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthenticationError('Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  auth,
  requireRole
}; 