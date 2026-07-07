/**
 * Purpose:
 * Connects directly to the SQLite 'users', 'projects', and 'invoices' tables to perform Client CRUD operations.
 * Resolves properties to snake_case format as expected by the frontend.
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Fetch all client profiles
 */
function getAllClients() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, name AS contact_name, email, company AS company_name, phone, address, status, createdAt 
             FROM users 
             WHERE role = 'client' 
             ORDER BY id DESC`,
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
}

/**
 * Fetch single client profile by ID along with their projects and invoices
 */
function getClientById(id) {
    return new Promise((resolve, reject) => {
        // Query 1: Get client profile info
        db.get(
            `SELECT id, name AS contact_name, email, company AS company_name, phone, address, status, createdAt 
             FROM users 
             WHERE id = ? AND role = 'client'`,
            [id],
            (err, clientRow) => {
                if (err) return reject(err);
                if (!clientRow) return resolve(null);

                // Query 2: Get client projects history
                db.all(
                    `SELECT id, name, budget, progress_percent, status 
                     FROM projects 
                     WHERE client_id = ? 
                     ORDER BY id DESC`,
                    [id],
                    (err, projectRows) => {
                        if (err) return reject(err);

                        // Query 3: Get client invoices history
                        db.all(
                            `SELECT id, invoice_number, due_date, amount, status 
                             FROM invoices 
                             WHERE client_id = ? 
                             ORDER BY id DESC`,
                            [id],
                            (err, invoiceRows) => {
                                if (err) return reject(err);

                                resolve({
                                    client: clientRow,
                                    projects: projectRows || [],
                                    invoices: invoiceRows || []
                                });
                            }
                        );
                    }
                );
            }
        );
    });
}

/**
 * Inserts a new Client account.
 * Defaults password to 'client123' if not provided since the frontend doesn't prompt for password.
 */
function createClient(data) {
    return new Promise(async (resolve, reject) => {
        const { company_name, contact_name, email, phone, address, status } = data;
        
        if (!contact_name || !email) {
            return reject(new Error('Contact name and email are required.'));
        }

        try {
            // Set a default password for the client
            const defaultPassword = 'client123';
            const hash = await bcrypt.hash(defaultPassword, 10);
            
            db.run(
                `INSERT INTO users (name, email, password, role, company, phone, address, status) 
                 VALUES (?, ?, ?, 'client', ?, ?, ?, ?)`,
                [
                    contact_name, 
                    email, 
                    hash, 
                    company_name || null, 
                    phone || null, 
                    address || null, 
                    status || 'active'
                ],
                function (err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            return reject(new Error('Duplicate email: This email is already registered.'));
                        }
                        return reject(err);
                    }
                    resolve({ 
                        id: this.lastID, 
                        company_name, 
                        contact_name, 
                        email, 
                        phone, 
                        address, 
                        status: status || 'active' 
                    });
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Updates details of an existing Client
 */
function updateClient(id, data) {
    return new Promise(async (resolve, reject) => {
        const { company_name, contact_name, email, phone, address, status } = data;

        if (!contact_name || !email) {
            return reject(new Error('Contact name and email are required.'));
        }

        db.run(
            `UPDATE users 
             SET name = ?, email = ?, company = ?, phone = ?, address = ?, status = ? 
             WHERE id = ? AND role = 'client'`,
            [
                contact_name, 
                email, 
                company_name || null, 
                phone || null, 
                address || null, 
                status || 'active', 
                id
            ],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(new Error('Duplicate email: Email already in use.'));
                    }
                    return reject(err);
                }
                if (this.changes === 0) {
                    return reject(new Error('Client not found.'));
                }
                resolve({ id, company_name, contact_name, email, phone, address, status });
            }
        );
    });
}

/**
 * Deletes a Client profile
 */
function deleteClient(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM users WHERE id = ? AND role = 'client'", [id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) {
                return reject(new Error('Client not found.'));
            }
            resolve();
        });
    });
}

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
};
