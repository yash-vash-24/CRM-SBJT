/**
 * Purpose:
 * This service handles database interactions for Document Management, linking files stored
 * on disk to specific electrical projects in the 'documents' table.
 *
 * How requests flow:
 * 1. The DocumentController calls a function in this service.
 * 2. This service queries the SQLite database to record an upload or fetch document files.
 * 3. Relational JOINs are used to retrieve the name of the user who uploaded the file.
 * 4. It returns the query records to the DocumentController.
 *
 * Why each function exists:
 * - addDocument(docData): Inserts a record of a newly uploaded file (names, disk path, uploader, project link).
 * - getDocumentsByProjectId(projectId): Fetches all documents associated with a project.
 * - getDocumentById(id): Fetches a single document's metadata (essential to find files on disk for download/deletion).
 * - deleteDocument(id): Removes the document reference from the SQLite database.
 */

const db = require('../config/database');

/**
 * Logs a new uploaded document in the database
 * @param {object} docData - { projectId, name, filename, filepath, uploadedBy }
 * @returns {Promise<object>} Inserted document metadata
 */
function addDocument(docData) {
    return new Promise((resolve, reject) => {
        const { projectId, name, filename, filepath, uploadedBy } = docData;

        if (!projectId || !name || !filename || !filepath) {
            return reject(new Error('Project ID, name, filename, and filepath are required.'));
        }

        const query = `
            INSERT INTO documents (projectId, name, filename, filepath, uploadedBy) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(query, [projectId, name, filename, filepath, uploadedBy || null], function(err) {
            if (err) {
                return reject(err);
            }

            resolve({
                id: this.lastID,
                projectId,
                name,
                filename,
                filepath,
                uploadedBy
            });
        });
    });
}

/**
 * Retrieves all documents for a project, including uploader name
 * @param {number} projectId 
 * @returns {Promise<Array>} List of document metadata objects
 */
function getDocumentsByProjectId(projectId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT d.*, u.name as uploaderName 
            FROM documents d 
            LEFT JOIN users u ON d.uploadedBy = u.id 
            WHERE d.projectId = ? 
            ORDER BY d.uploadedAt DESC
        `;
        db.all(query, [projectId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Retrieves a single document record by ID
 * @param {number} id 
 * @returns {Promise<object>} The document metadata object
 */
function getDocumentById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM documents WHERE id = ?';
        db.get(query, [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

/**
 * Deletes a document record from the database
 * @param {number} id 
 * @returns {Promise<boolean>} True if record was deleted
 */
function deleteDocument(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
            if (err) {
                return reject(err);
            }
            if (this.changes === 0) {
                return reject(new Error('Document record not found in database.'));
            }
            resolve(true);
        });
    });
}

module.exports = {
    addDocument,
    getDocumentsByProjectId,
    getDocumentById,
    deleteDocument
};
