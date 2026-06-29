/**
 * Purpose:
 * This controller processes HTTP requests for Project Management. It includes key
 * authorization checks, ensuring Clients can only view projects assigned to them,
 * while Admins retain full CRUD privileges.
 *
 * How requests flow:
 * 1. The router matches an endpoint (e.g. GET /api/projects/:id).
 * 2. Express triggers getProject(req, res).
 * 3. The controller parses the project ID and fetches details from projectService.
 * 4. Role Authorization Check:
 *    - If the logged-in user is an Admin, they are allowed access.
 *    - If the logged-in user is a Client, the controller verifies if req.user.userId matches project.clientId.
 *    - If it matches, the project is returned; otherwise, it sends a 403 Forbidden response.
 *
 * Why each function exists:
 * - getProjects(req, res): Lists projects. Returns all projects for Admins, or only assigned projects for Clients.
 * - getProject(req, res): Fetches detailed project metadata, with access control checks.
 * - createProject(req, res): Creates a new project (Admin-only).
 * - updateProject(req, res): Modifies project properties (e.g. updating status, assigning/reassigning client) (Admin-only).
 * - deleteProject(req, res): Removes a project from the system (Admin-only).
 */

const projectService = require('../services/projectService');

/**
 * Gets a list of projects (filtered by role)
 */
async function getProjects(req, res) {
    const { search, status } = req.query;

    // TODO: Implement advanced Search and Filter.
    // Query parameters like '?search=substation' or '?status=completed' should be parsed
    // and injected into projectService SQL statements (using SQL LIKE and WHERE status = ?).
    // Currently, search/filtering is a WORK IN PROGRESS; the API defaults to returning all projects.
    if (search || status) {
        console.log(`[Search/Filter In-Progress] Request received for search="${search}", status="${status}". Filters are not yet applied to SQLite queries.`);
    }

    try {
        let projects = [];
        
        // If user is a Client, they can only view projects assigned to their client ID
        if (req.user.role === 'client') {
            projects = await projectService.getProjectsByClientId(req.user.userId);
        } else if (req.user.role === 'admin') {
            // Admins can see all projects in the system
            projects = await projectService.getAllProjects();
        } else {
            return res.status(403).json({ message: 'Access denied. Invalid user role.' });
        }

        return res.status(200).json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err.message);
        return res.status(500).json({ message: 'Internal server error while fetching projects.' });
    }
}

/**
 * Gets details of a single project (with ownership checks)
 */
async function getProject(req, res) {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID format.' });
    }

    try {
        const project = await projectService.getProjectById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Access Control: Client can only view their own projects
        if (req.user.role === 'client' && project.clientId !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied. You do not have permission to view this project.' });
        }

        return res.status(200).json(project);
    } catch (err) {
        console.error('Error fetching project details:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

/**
 * Creates a new project
 */
async function createProject(req, res) {
    try {
        const newProject = await projectService.createProject(req.body);
        return res.status(201).json({
            message: 'Project created successfully.',
            project: newProject
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * Updates an existing project (assign client, update status, change description)
 */
async function updateProject(req, res) {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID format.' });
    }

    try {
        const updatedProject = await projectService.updateProject(projectId, req.body);
        return res.status(200).json({
            message: 'Project updated successfully.',
            project: updatedProject
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * Deletes a project
 */
async function deleteProject(req, res) {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID format.' });
    }

    try {
        await projectService.deleteProject(projectId);
        return res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
};
