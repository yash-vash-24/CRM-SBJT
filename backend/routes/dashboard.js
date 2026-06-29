/**
 * Purpose:
 * Maps HTTP paths for Dashboard Statistics to the dashboard controller.
 *
 * How requests flow:
 * 1. GET /api/dashboard/stats is requested.
 * 2. verifySession checks authorization.
 * 3. dashboardController.getStats handles the request.
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifySession } = require('../middleware/auth');

// Protected route
router.get('/stats', verifySession, dashboardController.getStats);

module.exports = router;
