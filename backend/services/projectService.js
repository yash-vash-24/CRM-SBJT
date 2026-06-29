/**
 * Purpose:
 * Connects directly to the SQLite 'projects' and 'users' tables.
 * Uses SQL LEFT JOIN to combine project and client information,
 * and performs COUNT query aggregations for the dashboard.
 */

const db = require('../config/database');

/**
 * Fetch all projects in the system (Admin only)
 */
function getAllProjects() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT p.id, p.name, p.description, p.clientId, p.status, p.createdAt, u.name AS clientName, u.company AS clientCompany 
             FROM projects p 
             LEFT JOIN users u ON p.clientId = u.id 
             ORDER BY p.id DESC`,
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
}

/**
 * Fetch projects assigned to a specific Client
 */
function getProjectsByClientId(clientId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT p.id, p.name, p.description, p.clientId, p.status, p.createdAt, u.name AS clientName 
             FROM projects p 
             LEFT JOIN users u ON p.clientId = u.id 
             WHERE p.clientId = ? 
             ORDER BY p.id DESC`,
            [clientId],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
}

/**
 * Fetch details of a single project
 */
function getProjectById(id) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT p.id, p.name, p.description, p.clientId, p.status, p.createdAt, u.name AS clientName, u.company AS clientCompany, u.phone AS clientPhone 
             FROM projects p 
             LEFT JOIN users u ON p.clientId = u.id 
             WHERE p.id = ?`,
            [id],
            (err, row) => {
                if (err) return reject(err);
                resolve(row);
            }
        );
    });
}

/**
 * Creates a new project in the database
 */
function createProject(data) {
    return new Promise((resolve, reject) => {
        const { name, description, clientId } = data;
        if (!name) {
            return reject(new Error('Project name is required.'));
        }

        db.run(
            `INSERT INTO projects (name, description, clientId, status) VALUES (?, ?, ?, 'pending')`,
            [name, description || null, clientId || null],
            function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, name, description, clientId, status: 'pending' });
            }
        );
    });
}

/**
 * Updates a project's status
 */
function updateProject(id, status) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE projects SET status = ? WHERE id = ?`,
            [status, id],
            function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('Project not found.'));
                resolve({ id, status });
            }
        );
    });
}

/**
 * Aggregates client and project counts for the Simple Dashboard
 */
function getDashboardStats() {
    return new Promise((resolve, reject) => {
        // Query 1: Count clients
        db.get("SELECT COUNT(*) AS totalClients FROM users WHERE role = 'client'", (err, clientRow) => {
            if (err) return reject(err);
            
            // Query 2: Count projects
            db.get("SELECT COUNT(*) AS totalProjects FROM projects", (err, projectRow) => {
                if (err) return reject(err);
                
                resolve({
                    totalClients: clientRow.totalClients || 0,
                    totalProjects: projectRow.totalProjects || 0
                });
            });
        });
    });
}

module.exports = {
    getAllProjects,
    getProjectsByClientId,
    getProjectById,
    createProject,
    updateProject,
    getDashboardStats
};
