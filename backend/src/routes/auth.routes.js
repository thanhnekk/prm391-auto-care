// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { handleLogin, handleRefreshToken, handleLogout } = require('../services/auth.service');

// Middleware parse cookie (cần cho logout và refresh token)
router.use(cookieParser());

// POST /auth/login
router.post('/login', handleLogin);

// POST /auth/refresh-token
router.post('/refresh-token', handleRefreshToken);

// POST /auth/logout
router.post('/logout', handleLogout);

module.exports = router;
