/**
 * Purpose:
 * Routes dashboard executive reporting requests to reportController.
 * Enforces role-based security using verifySession and requireAdminOrSupervisor.
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifySession, requireAdminOrSupervisor } = require('../middleware/auth');

// All report routes require authentication and manager/supervisor permissions
router.use(verifySession);
router.use(requireAdminOrSupervisor);

router.get('/dashboard', reportController.getDashboardStats);

module.exports = router;
