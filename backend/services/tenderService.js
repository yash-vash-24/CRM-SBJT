/**
 * Purpose:
 * Connects directly to the SQLite 'tenders' and 'documents' tables.
 * Implements CRUD operations for tenders and returns associated document metadata.
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
 * Fetch all tenders sorted by ID descending
 */
async function getAllTenders() {
    return await dbAll(
        `SELECT id, title, department, value, submission_deadline, status, emd_value, emd_status, createdAt
         FROM tenders
         ORDER BY id DESC`
    );
}

/**
 * Fetch detailed tender by ID along with its uploaded files
 * Returns: { tender: {...}, documents: [...] }
 */
async function getTenderById(id) {
    const tender = await dbGet(
        `SELECT id, title, department, value, submission_deadline, status, emd_value, emd_status, createdAt
         FROM tenders
         WHERE id = ?`,
        [id]
    );

    if (!tender) return null;

    const documents = await dbAll(
        `SELECT id, name, type, file_path, uploaded_at
         FROM documents
         WHERE tender_id = ?
         ORDER BY uploaded_at DESC`,
        [id]
    );

    return { tender, documents };
}

/**
 * Create a new tender
 */
async function createTender(data) {
    const { title, department, value, submission_deadline, status, emd_value, emd_status } = data;

    if (!title || !department || !submission_deadline) {
        throw new Error('Title, department, and submission deadline are required.');
    }

    const val = parseFloat(value) || 0;
    const emdVal = parseFloat(emd_value) || 0;
    const stat = status || 'draft';
    const emdStat = emd_status || 'pending';

    const result = await dbRun(
        `INSERT INTO tenders (title, department, value, submission_deadline, status, emd_value, emd_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, department, val, submission_deadline, stat, emdVal, emdStat]
    );

    return {
        id: result.lastID,
        title,
        department,
        value: val,
        submission_deadline,
        status: stat,
        emd_value: emdVal,
        emd_status: emdStat
    };
}

/**
 * Update an existing tender by ID
 */
async function updateTender(id, data) {
    const { title, department, value, submission_deadline, status, emd_value, emd_status } = data;

    if (!title || !department || !submission_deadline) {
        throw new Error('Title, department, and submission deadline are required.');
    }

    const val = parseFloat(value) || 0;
    const emdVal = parseFloat(emd_value) || 0;
    const stat = status || 'draft';
    const emdStat = emd_status || 'pending';

    const result = await dbRun(
        `UPDATE tenders
         SET title = ?, department = ?, value = ?, submission_deadline = ?, status = ?, emd_value = ?, emd_status = ?
         WHERE id = ?`,
        [title, department, val, submission_deadline, stat, emdVal, emdStat, id]
    );

    if (result.changes === 0) throw new Error('Tender not found.');

    return {
        id,
        title,
        department,
        value: val,
        submission_deadline,
        status: stat,
        emd_value: emdVal,
        emd_status: emdStat
    };
}

/**
 * Delete a tender by ID
 */
async function deleteTender(id) {
    const result = await dbRun(`DELETE FROM tenders WHERE id = ?`, [id]);
    if (result.changes === 0) throw new Error('Tender not found.');
}

module.exports = {
    getAllTenders,
    getTenderById,
    createTender,
    updateTender,
    deleteTender
};
