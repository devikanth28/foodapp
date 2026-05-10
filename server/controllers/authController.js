const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { errorResponse } = require('../utils/apiResponse');

// ── Helper: generate JWT token ────────────────────────────────────────────
// IMPORTANT: payload key must be 'userId' — this is what auth.js middleware
// reads when it does: jwt.verify(token) → decoded.userId
const generateToken = (userId) => {
  return jwt.sign(
    { userId },                     // ← must match decoded.userId in auth.js
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// ── Helper: send token in cookie + response body ──────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  // Cookie — browser sends this automatically on every request
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      role:  user.role,
    },
  });
};

// ── POST /api/auth/register ───────────────────────────────────────────────
const register = async (req, res, next) => {
    // console.log('Register endpoint hit with body:', req.body); // Debug log
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email and password', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email is already registered', 400);
    }

    // Password gets hashed automatically by the beforeSave hook in User model
    const user = await User.create({ name, email, password, phone });

    sendTokenResponse(user, 201, res);

  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated', 403);
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────
// Protected — auth.js middleware already verified token and set req.user
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────
const logout = (req, res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000),
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, logout };