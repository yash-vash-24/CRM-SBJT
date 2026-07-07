/**
 * Purpose:
 * Intercepts HTTP requests for Project management, enforces access rules,
 * forwards requests to projectService, and formats standardized JSON responses.
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
            // Admin/Supervisor: View all projects in the system
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
        const detail = await projectService.getProjectById(id);
        if (!detail) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Ownership lock: Client can only view their own projects
        if (req.user.role === 'client' && detail.project.client_id !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied: You do not have permission to view this project.' });
        }

        return res.status(200).json(detail);
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
 * PUT /api/projects/:id - Updates a project fully (Admin/Supervisor)
 */
async function updateProject(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Project ID.' });
    }

    try {
        const project = await projectService.updateProject(id, req.body);
        return res.status(200).json({
            message: 'Project updated successfully.',
            project
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/projects/:id - Deletes a project (Admin only)
 */
async function deleteProject(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Project ID.' });
    }

    try {
        await projectService.deleteProject(id);
        return res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/projects/:id/assign-worker - Assigns a worker (Admin/Supervisor)
 */
async function assignWorker(req, res) {
    const id = parseInt(req.params.id);
    const { employee_id } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Project ID.' });
    }
    if (!employee_id) {
        return res.status(400).json({ message: 'Employee ID is required.' });
    }

    try {
        await projectService.assignWorker(id, employee_id);
        return res.status(200).json({ message: 'Worker assigned successfully.' });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/projects/:id/remove-worker/:workerId - Removes worker assignment (Admin/Supervisor)
 */
async function removeWorker(req, res) {
    const id = parseInt(req.params.id);
    const workerId = parseInt(req.params.workerId);

    if (isNaN(id) || isNaN(workerId)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Project ID or Worker ID.' });
    }

    try {
        await projectService.removeWorker(id, workerId);
        return res.status(200).json({ message: 'Worker removed successfully.' });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * GET /api/projects/dashboard/stats - Returns Simple Dashboard counts (legacy)
 */
async function getDashboardStats(req, res) {
    try {
        const stats = await projectService.getDashboardStats();
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * PATCH /api/projects/:id/status - Updates status (legacy)
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
        const updated = await projectService.updateProject(id, { status });
        return res.status(200).json({
            message: 'Project status updated successfully.',
            project: updated
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

module.exports = {
    getProjects,
    getProject,
    addProject,
    updateProject,
    deleteProject,
    assignWorker,
    removeWorker,
    getDashboardStats,
    updateProjectStatus
};
