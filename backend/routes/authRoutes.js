/**
 * Purpose:
 * Routes authentication requests to appropriate controller handlers.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifySession } = require('../middleware/auth');

router.post('/login/admin', authController.loginAdmin);
router.post('/login/client', authController.loginClient);
router.post('/logout', verifySession, authController.logout);
router.get('/me', verifySession, authController.getMe);

module.exports = router;
