const express = require('express');
const router = express.Router();

const { register, login, getMe, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddileware'); // using YOUR existing auth.js

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me  — protected, must be logged in
router.get('/me', authMiddleware, getMe);

module.exports = router;