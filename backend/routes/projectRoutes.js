/**
 * Purpose:
 * Routes project management, dashboard stats, and worker assignment endpoints to projectController.
 * Enforces role-based security using verifySession, requireAdmin, and requireAdminOrSupervisor.
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifySession, requireAdmin, requireAdminOrSupervisor } = require('../middleware/auth');

// All project routes require authentication
router.use(verifySession);

// GET routes
router.get('/', projectController.getProjects);
router.get('/dashboard/stats', projectController.getDashboardStats); // Legacy stats
router.get('/:id', projectController.getProject);

// Administrative CRUD operations
router.post('/', requireAdmin, projectController.addProject);
router.put('/:id', requireAdminOrSupervisor, projectController.updateProject);
router.delete('/:id', requireAdmin, projectController.deleteProject);

// Workforce team assignment routes
router.post('/:id/assign-worker', requireAdminOrSupervisor, projectController.assignWorker);
router.delete('/:id/remove-worker/:workerId', requireAdminOrSupervisor, projectController.removeWorker);

// Legacy PATCH status route
router.patch('/:id/status', requireAdmin, projectController.updateProjectStatus);

module.exports = router;
