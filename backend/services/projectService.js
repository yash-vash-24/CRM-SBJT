/**
 * Purpose:
 * This service handles all SQL database interactions with the 'projects' table in SQLite.
 * It implements queries to create, retrieve, update, and search projects, including 
 * relational SQL JOINs to fetch client contact information.
 *
 * How requests flow:
 * 1. ProjectController calls a function in this service (e.g. getProjectById).
 * 2. This service queries the SQLite database, joining the projects table with the users table.
 * 3. It returns the project records (or errors) back to the ProjectController.
 *
 * Why each function exists:
 * - getAllProjects(): Retrieves all projects in the system (used by Admins to see overall operations).
 * - getProjectsByClientId(clientId): Retrieves only the projects assigned to a specific client.
 * - getProjectById(id): Retrieves detailed info of a project, joining client information for a rich detail view.
 * - createProject(projectData): Inserts a new project, setting default status to 'pending'.
 * - updateProject(id, updateData): Updates project info, including client assignment and status.
 * - deleteProject(id): Deletes a project record.
 */

const db = require('../config/database');

/**
 * Retrieves all projects, joining client names and companies
 * @returns {Promise<Array>} List of project objects
 */
function getAllProjects() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, u.name as clientName, u.company as clientCompany 
            FROM projects p 
            LEFT JOIN users u ON p.clientId = u.id 
            ORDER BY p.createdAt DESC
        `;
        db.all(query, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Retrieves all projects assigned to a specific client ID
 * @param {number} clientId 
 * @returns {Promise<Array>} List of client's project objects
 */
function getProjectsByClientId(clientId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, u.name as clientName, u.company as clientCompany 
            FROM projects p 
            LEFT JOIN users u ON p.clientId = u.id 
            WHERE p.clientId = ?
            ORDER BY p.createdAt DESC
        `;
        db.all(query, [clientId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Retrieves a single project's details, joining client details
 * @param {number} id 
 * @returns {Promise<object>} Project detail object
 */
function getProjectById(id) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, u.name as clientName, u.email as clientEmail, u.company as clientCompany, u.phone as clientPhone
            FROM projects p 
            LEFT JOIN users u ON p.clientId = u.id 
            WHERE p.id = ?
        `;
        db.get(query, [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

/**
 * Inserts a new project
 * @param {object} projectData - { name, description, clientId, status }
 * @returns {Promise<object>} Created project details
 */
function createProject(projectData) {
    return new Promise((resolve, reject) => {
        const { name, description, clientId, status } = projectData;

        if (!name) {
            return reject(new Error('Project name is required.'));
        }

        const projectStatus = status || 'pending';

        const query = `
            INSERT INTO projects (name, description, clientId, status) 
            VALUES (?, ?, ?, ?)
        `;

        db.run(query, [name, description || null, clientId || null, projectStatus], function(err) {
            if (err) {
                return reject(err);
            }
            
            resolve({
                id: this.lastID,
                name,
                description,
                clientId,
                status: projectStatus
            });
        });
    });
}

/**
 * Updates an existing project
 * @param {number} id 
 * @param {object} updateData - { name, description, clientId, status }
 * @returns {Promise<object>} Updated project details
 */
function updateProject(id, updateData) {
    return new Promise((resolve, reject) => {
        const { name, description, clientId, status } = updateData;

        if (!name) {
            return reject(new Error('Project name is required.'));
        }

        const query = `
            UPDATE projects 
            SET name = ?, description = ?, clientId = ?, status = ?, updatedAt = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;

        db.run(query, [name, description || null, clientId || null, status, id], function(err) {
            if (err) {
                return reject(err);
            }

            if (this.changes === 0) {
                return reject(new Error('Project not found.'));
            }

            resolve({
                id,
                name,
                description,
                clientId,
                status
            });
        });
    });
}

/**
 * Deletes a project record
 * @param {number} id 
 * @returns {Promise<boolean>} True if deleted
 */
function deleteProject(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
            if (err) {
                return reject(err);
            }
            if (this.changes === 0) {
                return reject(new Error('Project not found.'));
            }
            resolve(true);
        });
    });
}

module.exports = {
    getAllProjects,
    getProjectsByClientId,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};
