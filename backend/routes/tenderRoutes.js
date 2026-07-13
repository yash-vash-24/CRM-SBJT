/**
 * Purpose:
 * Routes tender pipeline CRUD endpoints to tenderController.
 * Enforces role-based security using verifySession, requireAdmin, and requireAdminOrSupervisor.
 */

const express = require('express');
const router = express.Router();
const tenderController = require('../controllers/tenderController');
const { verifySession, requireAdmin, requireAdminOrSupervisor } = require('../middleware/auth');

// All tender routes require authentication and admin/supervisor role
router.use(verifySession);
router.use(requireAdminOrSupervisor);

// GET routes
router.get('/', tenderController.getTenders);
router.get('/:id', tenderController.getTender);

// Write routes (accessible to Admin and Supervisor)
router.post('/', tenderController.addTender);
router.put('/:id', tenderController.updateTender);

// Administrative delete route (Admin only)
router.delete('/:id', requireAdmin, tenderController.deleteTender);

module.exports = router;
