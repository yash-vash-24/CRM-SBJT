/**
 * Purpose:
 * Intercepts HTTP requests for Project management and Dashboard stats,
 * enforces client ownership locks, and formats standard JSON outputs.
 */

const projectService = require('../services/projectService');

/**
 * GET /api/projects - Lists projects (Filtered by user session role)
 */
async function getProjects(req, res) {
    try {
        let projects = [];
        if (req.user.role === 'client') {
            // Client: Only view projects assigned to them
            projects = await projectService.getProjectsByClientId(req.user.userId);
        } else {
            // Admin: View all projects in the system
            projects = await projectService.getAllProjects();
        }
        return res.status(200).json(projects);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/projects/:id - Reads project metadata with ownership guards
 */
async function getProject(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Project ID.' });
    }

    try {
        const project = await projectService.getProjectById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Ownership lock: Client can only view their own projects
        if (req.user.role === 'client' && project.clientId !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied: You do not have permission to view this project.' });
        }

        return res.status(200).json(project);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/projects - Creates a new project (Admin only)
 */
async function addProject(req, res) {
    try {
        const project = await projectService.createProject(req.body);
        return res.status(201).json({
            message: 'Project created successfully.',
            project
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * PATCH /api/projects/:id/status - Updates project status (Admin only)
 */
async function updateProjectStatus(req, res) {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Project ID.' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        const project = await projectService.updateProject(id, status);
        return res.status(200).json({
            message: 'Project status updated successfully.',
            project
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * GET /api/projects/dashboard/stats - Returns Simple Dashboard counts
 */
async function getDashboardStats(req, res) {
    try {
        const stats = await projectService.getDashboardStats();
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getProjects,
    getProject,
    addProject,
    updateProjectStatus,
    getDashboardStats
};
