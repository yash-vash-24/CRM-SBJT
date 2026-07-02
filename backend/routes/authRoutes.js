/**
 * Purpose:
 * Routes authentication requests to appropriate controller handlers.
 * Includes a unified login endpoint and legacy role-specific routes.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifySession } = require('../middleware/auth');

// Unified login endpoint (frontend uses this)
router.post('/login', authController.login);

// Legacy role-specific login endpoints (kept for backward compatibility)
router.post('/login/admin', authController.loginAdmin);
router.post('/login/client', authController.loginClient);

// Session management
router.post('/logout', verifySession, authController.logout);
router.get('/me', verifySession, authController.getMe);

module.exports = router;
