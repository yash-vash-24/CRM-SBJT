/**
 * Purpose:
 * Connects directly to the SQLite 'documents', 'projects', and 'tenders' tables.
 * Implements CRUD operations for document metadata with relation joins.
 */

const db = require('../config/database');

// ---- Promise helpers ----

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

/**
 * Fetch all documents with project and tender details
 */
async function getAllDocuments() {
    return await dbAll(
        `SELECT d.*, 
                p.name AS project_name, 
                t.title AS tender_title
         FROM documents d
         LEFT JOIN projects p ON d.project_id = p.id
         LEFT JOIN tenders t ON d.tender_id = t.id
         ORDER BY d.id DESC`
    );
}

/**
 * Fetch all documents associated with projects owned by a specific client
 */
async function getDocumentsByClientId(clientId) {
    return await dbAll(
        `SELECT d.*, 
                p.name AS project_name, 
                t.title AS tender_title
         FROM documents d
         LEFT JOIN projects p ON d.project_id = p.id
         LEFT JOIN tenders t ON d.tender_id = t.id
         WHERE p.client_id = ? OR d.project_id IS NULL
         ORDER BY d.id DESC`,
        [clientId]
    );
}

/**
 * Fetch all documents associated with projects assigned to a specific worker
 */
async function getDocumentsByWorkerUserId(userId) {
    return await dbAll(
        `SELECT d.*, 
                p.name AS project_name, 
                t.title AS tender_title
         FROM documents d
         LEFT JOIN projects p ON d.project_id = p.id
         LEFT JOIN tenders t ON d.tender_id = t.id
         LEFT JOIN project_workers pw ON p.id = pw.project_id
         LEFT JOIN employees e ON pw.employee_id = e.id
         WHERE e.user_id = ? OR d.project_id IS NULL
         ORDER BY d.id DESC`,
        [userId]
    );
}

/**
 * Fetch a single document by ID
 */
async function getDocumentById(id) {
    return await dbGet(
        `SELECT d.*, 
                p.name AS project_name, 
                t.title AS tender_title
         FROM documents d
         LEFT JOIN projects p ON d.project_id = p.id
         LEFT JOIN tenders t ON d.tender_id = t.id
         WHERE d.id = ?`,
        [id]
    );
}

/**
 * Create a new document metadata entry
 */
async function createDocument(data) {
    const { name, type, file_path, project_id, tender_id } = data;

    if (!name || !type || !file_path) {
        throw new Error('Name, type, and file path are required.');
    }

    const projId = project_id ? parseInt(project_id) : null;
    const tendId = tender_id ? parseInt(tender_id) : null;

    const result = await dbRun(
        `INSERT INTO documents (name, type, file_path, project_id, tender_id)
         VALUES (?, ?, ?, ?, ?)`,
        [name, type, file_path, projId, tendId]
    );

    return {
        id: result.lastID,
        name,
        type,
        file_path,
        project_id: projId,
        tender_id: tendId
    };
}

/**
 * Delete a document entry
 */
async function deleteDocument(id) {
    const result = await dbRun(`DELETE FROM documents WHERE id = ?`, [id]);
    if (result.changes === 0) throw new Error('Document not found.');
}

module.exports = {
    getAllDocuments,
    getDocumentsByClientId,
    getDocumentsByWorkerUserId,
    getDocumentById,
    createDocument,
    deleteDocument
};
