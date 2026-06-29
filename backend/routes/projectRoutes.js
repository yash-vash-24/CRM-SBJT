/**
 * Purpose:
 * Routes project management and dashboard stats endpoints to projectController.
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifySession, requireAdmin } = require('../middleware/auth');

// All project routes require authentication
router.use(verifySession);

router.get('/', projectController.getProjects);
router.get('/dashboard/stats', projectController.getDashboardStats); // Dashboard endpoint
router.get('/:id', projectController.getProject);

// Administrative CRUD operations
router.post('/', requireAdmin, projectController.addProject);
router.patch('/:id/status', requireAdmin, projectController.updateProjectStatus);

module.exports = router;
