/**
 * Purpose:
 * This file contains the routing definitions for the authentication API endpoints.
 * It maps specific URL paths to functions in the authController.
 *
 * How requests flow:
 * 1. An HTTP request comes in (e.g. POST /api/auth/admin/login).
 * 2. Express directs it to this router file.
 * 3. If the endpoint is protected (like /me or /logout), the verifySession middleware is run first.
 * 4. Finally, the controller function (e.g. loginAdmin) executes and returns a response.
 *
 * Why each route exists:
 * - POST /admin/login: Allows electrical CRM administrators to log in.
 * - POST /client/login: Allows clients to access their dedicated read-only client portal.
 * - POST /logout: Allows any logged-in user to clear their session.
 * - GET /me: Allows client apps to check if their stored session token is still valid.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifySession } = require('../middleware/auth');

// Public login routes
router.post('/admin/login', authController.loginAdmin);
router.post('/client/login', authController.loginClient);

// Protected routes (require a valid session token)
router.post('/logout', verifySession, authController.logout);
router.get('/me', verifySession, authController.getMe);

module.exports = router;
