/**
 * Purpose:
 * This file maps HTTP endpoints for project-related requests to the project controller.
 * It uses session and role check middlewares to protect and control access.
 *
 * How requests flow:
 * 1. An incoming HTTP request hits an endpoint (e.g. POST /api/projects).
 * 2. verifySession runs to make sure the user has a valid active session.
 * 3. If it's a mutation (POST, PUT, DELETE), requireAdmin runs to verify the user is an admin.
 * 4. Express forwards the request to the projectController handler.
 *
 * Why each route exists:
 * - GET /: Returns projects list. Clients see their own; Admins see all.
 * - GET /:id: Returns details of a specific project, with ownership checks.
 * - POST /: Creates a new project (Admin-only).
 * - PUT /:id: Modifies a project (e.g. assigns a client, updates progress/status) (Admin-only).
 * - DELETE /:id: Deletes a project (Admin-only).
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifySession, requireAdmin } = require('../middleware/auth');

// All project routes require authentication
router.use(verifySession);

// GET routes (accessible by Admins and authorized Clients)
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);

// Mutation routes (restricted to Admins only)
router.post('/', requireAdmin, projectController.createProject);
router.put('/:id', requireAdmin, projectController.updateProject);
router.delete('/:id', requireAdmin, projectController.deleteProject);

module.exports = router;
