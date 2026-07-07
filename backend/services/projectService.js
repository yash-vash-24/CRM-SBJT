/**
 * Purpose:
 * Connects directly to the SQLite 'projects', 'users', 'employees', 'project_workers', 'documents', and 'invoices' tables.
 * Implements projects CRUD operations, worker assignment mapping, and aggregated project detail fetch.
 */

const db = require('../config/database');

/**
 * Fetch all projects in the system (Admin / Supervisor)
 */
function getAllProjects() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT p.*, 
                    u.name AS client_name, u.company AS client_company, 
                    s.name AS supervisor_name 
             FROM projects p 
             LEFT JOIN users u ON p.client_id = u.id 
             LEFT JOIN users s ON p.supervisor_id = s.id 
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
            `SELECT p.*, 
                    u.name AS client_name, u.company AS client_company, 
                    s.name AS supervisor_name 
             FROM projects p 
             LEFT JOIN users u ON p.client_id = u.id 
             LEFT JOIN users s ON p.supervisor_id = s.id 
             WHERE p.client_id = ? 
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
 * Fetch detailed project info including workers, documents, and invoices
 */
function getProjectById(id) {
    return new Promise((resolve, reject) => {
        // Query 1: Project details
        db.get(
            `SELECT p.*, 
                    u.name AS client_name, u.company AS client_company, u.phone AS client_phone, 
                    s.name AS supervisor_name 
             FROM projects p 
             LEFT JOIN users u ON p.client_id = u.id 
             LEFT JOIN users s ON p.supervisor_id = s.id 
             WHERE p.id = ?`,
            [id],
            (err, projectRow) => {
                if (err) return reject(err);
                if (!projectRow) return resolve(null);

                // Query 2: Assigned workers
                db.all(
                    `SELECT e.id, e.first_name, e.last_name, e.designation, e.phone, e.email, e.status 
                     FROM employees e 
                     INNER JOIN project_workers pw ON e.id = pw.employee_id 
                     WHERE pw.project_id = ?`,
                    [id],
                    (err, workerRows) => {
                        if (err) return reject(err);

                        // Query 3: Linked documents
                        db.all(
                            `SELECT id, name, type, file_path, uploaded_at 
                             FROM documents 
                             WHERE project_id = ?`,
                            [id],
                            (err, documentRows) => {
                                if (err) return reject(err);

                                // Query 4: Linked invoices
                                db.all(
                                    `SELECT id, invoice_number, amount, issue_date, due_date, status 
                                     FROM invoices 
                                     WHERE project_id = ?`,
                                    [id],
                                    (err, invoiceRows) => {
                                        if (err) return reject(err);

                                        resolve({
                                            project: projectRow,
                                            workers: workerRows || [],
                                            documents: documentRows || [],
                                            invoices: invoiceRows || []
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
}

/**
 * Creates a new project in the database
 */
function createProject(data) {
    return new Promise((resolve, reject) => {
        const { 
            name, description, client_id, supervisor_id, 
            start_date, completion_date, budget, status, 
            progress_percent, site_location 
        } = data;

        if (!name) {
            return reject(new Error('Project name is required.'));
        }

        db.run(
            `INSERT INTO projects (
                name, description, client_id, supervisor_id, 
                start_date, completion_date, budget, status, 
                progress_percent, site_location
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, 
                description || null, 
                client_id || null, 
                supervisor_id || null, 
                start_date || null, 
                completion_date || null, 
                budget || 0, 
                status || 'planning', 
                progress_percent || 0, 
                site_location || null
            ],
            function (err) {
                if (err) return reject(err);
                resolve({ 
                    id: this.lastID, 
                    name, 
                    description, 
                    client_id, 
                    supervisor_id, 
                    start_date, 
                    completion_date, 
                    budget, 
                    status, 
                    progress_percent, 
                    site_location 
                });
            }
        );
    });
}

/**
 * Updates a project details fully
 */
function updateProject(id, data) {
    return new Promise((resolve, reject) => {
        const { 
            name, description, client_id, supervisor_id, 
            start_date, completion_date, budget, status, 
            progress_percent, site_location 
        } = data;

        if (!name) {
            return reject(new Error('Project name is required.'));
        }

        db.run(
            `UPDATE projects 
             SET name = ?, description = ?, client_id = ?, supervisor_id = ?, 
                 start_date = ?, completion_date = ?, budget = ?, status = ?, 
                 progress_percent = ?, site_location = ? 
             WHERE id = ?`,
            [
                name, 
                description || null, 
                client_id || null, 
                supervisor_id || null, 
                start_date || null, 
                completion_date || null, 
                budget || 0, 
                status || 'planning', 
                progress_percent || 0, 
                site_location || null, 
                id
            ],
            function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('Project not found.'));
                resolve({ 
                    id, name, description, client_id, supervisor_id, 
                    start_date, completion_date, budget, status, 
                    progress_percent, site_location 
                });
            }
        );
    });
}

/**
 * Deletes a project from the system
 */
function deleteProject(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM projects WHERE id = ?`, [id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error('Project not found.'));
            resolve();
        });
    });
}

/**
 * Assigns a worker to a project site team
 */
function assignWorker(projectId, employeeId) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO project_workers (project_id, employee_id) VALUES (?, ?)`,
            [projectId, employeeId],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(new Error('This worker is already assigned to this project site.'));
                    }
                    return reject(err);
                }
                resolve();
            }
        );
    });
}

/**
 * Removes a worker assignment from a project site team
 */
function removeWorker(projectId, employeeId) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM project_workers WHERE project_id = ? AND employee_id = ?`,
            [projectId, employeeId],
            function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('Worker assignment not found.'));
                resolve();
            }
        );
    });
}

/**
 * Aggregates client and project counts for the Simple Dashboard stats (legacy)
 */
function getDashboardStats() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) AS totalClients FROM users WHERE role = 'client'", (err, clientRow) => {
            if (err) return reject(err);
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
    deleteProject,
    assignWorker,
    removeWorker,
    getDashboardStats
};
