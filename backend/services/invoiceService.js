/**
 * Purpose:
 * Connects directly to the SQLite 'invoices', 'projects', and 'users' tables.
 * Implements CRUD operations for Running Account invoices.
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
 * Fetch all invoices with client & project details
 */
async function getAllInvoices() {
    return await dbAll(
        `SELECT i.*, 
                p.name AS project_name, 
                u.name AS client_name, 
                u.company AS client_company
         FROM invoices i
         LEFT JOIN projects p ON i.project_id = p.id
         LEFT JOIN users u ON i.client_id = u.id
         ORDER BY i.id DESC`
    );
}

/**
 * Fetch all invoices for a specific client
 */
async function getInvoicesByClientId(clientId) {
    return await dbAll(
        `SELECT i.*, 
                p.name AS project_name, 
                u.name AS client_name, 
                u.company AS client_company
         FROM invoices i
         LEFT JOIN projects p ON i.project_id = p.id
         LEFT JOIN users u ON i.client_id = u.id
         WHERE i.client_id = ?
         ORDER BY i.id DESC`,
        [clientId]
    );
}

/**
 * Fetch a single invoice by ID
 */
async function getInvoiceById(id) {
    return await dbGet(
        `SELECT i.*, 
                p.name AS project_name, 
                u.name AS client_name, 
                u.company AS client_company
         FROM invoices i
         LEFT JOIN projects p ON i.project_id = p.id
         LEFT JOIN users u ON i.client_id = u.id
         WHERE i.id = ?`,
        [id]
    );
}

/**
 * Create a new invoice
 */
async function createInvoice(data) {
    const { invoice_number, project_id, client_id, amount, issue_date, due_date, status } = data;

    if (!invoice_number || !project_id || !amount || !issue_date || !due_date) {
        throw new Error('Invoice number, project ID, amount, issue date, and due date are required.');
    }

    const amt = parseFloat(amount) || 0;
    const stat = status || 'pending';

    const result = await dbRun(
        `INSERT INTO invoices (invoice_number, project_id, client_id, amount, issue_date, due_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoice_number, project_id, client_id || null, amt, issue_date, due_date, stat]
    );

    return {
        id: result.lastID,
        invoice_number,
        project_id,
        client_id: client_id || null,
        amount: amt,
        issue_date,
        due_date,
        status: stat
    };
}

/**
 * Update the status of an invoice
 */
async function updateInvoiceStatus(id, status) {
    if (!status || !['pending', 'paid', 'cancelled'].includes(status)) {
        throw new Error('Valid status (pending, paid, cancelled) is required.');
    }

    const result = await dbRun(
        `UPDATE invoices
         SET status = ?
         WHERE id = ?`,
        [status, id]
    );

    if (result.changes === 0) throw new Error('Invoice not found.');

    return { id, status };
}

/**
 * Delete an invoice
 */
async function deleteInvoice(id) {
    const result = await dbRun(`DELETE FROM invoices WHERE id = ?`, [id]);
    if (result.changes === 0) throw new Error('Invoice not found.');
}

module.exports = {
    getAllInvoices,
    getInvoicesByClientId,
    getInvoiceById,
    createInvoice,
    updateInvoiceStatus,
    deleteInvoice
};
