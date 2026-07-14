/**
 * Purpose:
 * Routes Document Vault endpoints to documentController.
 * Enforces role-based security using verifySession, requireAdmin, and requireAdminOrSupervisor.
 */

const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifySession, requireAdmin, requireAdminOrSupervisor } = require('../middleware/auth');

// All document routes require authentication
router.use(verifySession);

// GET routes (accessible by all authenticated roles — filtered internally)
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocument);

// Upload/index route (Admin and Supervisor only)
router.post('/', requireAdminOrSupervisor, documentController.addDocument);

// Administrative delete route (Admin only)
router.delete('/:id', requireAdmin, documentController.deleteDocument);

module.exports = router;
