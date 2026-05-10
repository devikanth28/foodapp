const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const { errorResponse } = require('../utils/apiResponse');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Fetch fresh user from DB (checks if user is still active)
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'name', 'phone', 'email', 'isActive'],
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or account deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 500);
  }
};

// Optional auth — attaches user if token exists, but doesn't block if missing
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await User.findByPk(decoded.userId);
    }
  } catch (err) {
    // Silently ignore — optional auth
  }
  next();
};

module.exports = { authMiddleware, optionalAuth };
