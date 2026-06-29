/**
 * Purpose:
 * This service handles all database operations related to Client management in the 'users' table.
 * It is responsible for query construction, error handling for database writes, and password hashing.
 *
 * How requests flow:
 * 1. The ClientController calls a function in this service (e.g. createClient).
 * 2. This service runs the SQLite query on the 'users' table.
 * 3. It hashes passwords using bcryptjs if they are being added or updated.
 * 4. It returns the query results (or throws/rejects an error) back to the ClientController.
 *
 * Why each function exists:
 * - getAllClients(): Fetches a list of all clients (users where role = 'client').
 * - getClientById(id): Fetches details of a single client by their database ID.
 * - createClient(clientData): Hashes password and inserts a new client into the database.
 * - updateClient(id, updateData): Updates an existing client. If password is provided, it is re-hashed.
 * - deleteClient(id): Permanently removes a client from the database.
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Fetches all users who are clients
 * @returns {Promise<Array>} List of client objects (excluding passwords)
 */
function getAllClients() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, name, email, role, company, phone, address, createdAt FROM users WHERE role = ? ORDER BY createdAt DESC';
        db.all(query, ['client'], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Fetches a single client by ID
 * @param {number} id 
 * @returns {Promise<object>} The client object (excluding password)
 */
function getClientById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, name, email, role, company, phone, address, createdAt FROM users WHERE id = ? AND role = ?';
        db.get(query, [id, 'client'], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

/**
 * Creates a new client account
 * @param {object} clientData - { name, email, password, company, phone, address }
 * @returns {Promise<object>} The created client details
 */
function createClient(clientData) {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, company, phone, address } = clientData;

        // Validation
        if (!name || !email || !password) {
            return reject(new Error('Name, email, and password are required.'));
        }

        try {
            // Hash the password
            const passwordHash = await bcrypt.hash(password, 10);

            const query = `
                INSERT INTO users (name, email, password, role, company, phone, address) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.run(query, [name, email, passwordHash, 'client', company || null, phone || null, address || null], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(new Error('A client with this email already exists.'));
                    }
                    return reject(err);
                }
                
                // Return the inserted client's details (excluding password)
                resolve({
                    id: this.lastID,
                    name,
                    email,
                    role: 'client',
                    company,
                    phone,
                    address
                });
            });
        } catch (hashErr) {
            reject(hashErr);
        }
    });
}

/**
 * Updates an existing client's details
 * @param {number} id 
 * @param {object} updateData - { name, email, company, phone, address, password }
 * @returns {Promise<object>} The updated client details
 */
function updateClient(id, updateData) {
    return new Promise(async (resolve, reject) => {
        const { name, email, company, phone, address, password } = updateData;

        if (!name || !email) {
            return reject(new Error('Name and email are required.'));
        }

        try {
            let query = '';
            let params = [];

            if (password && password.trim() !== '') {
                // If password is being updated, hash it and update password column
                const passwordHash = await bcrypt.hash(password, 10);
                query = `
                    UPDATE users 
                    SET name = ?, email = ?, password = ?, company = ?, phone = ?, address = ? 
                    WHERE id = ? AND role = ?
                `;
                params = [name, email, passwordHash, company || null, phone || null, address || null, id, 'client'];
            } else {
                // Otherwise, leave the password unchanged
                query = `
                    UPDATE users 
                    SET name = ?, email = ?, company = ?, phone = ?, address = ? 
                    WHERE id = ? AND role = ?
                `;
                params = [name, email, company || null, phone || null, address || null, id, 'client'];
            }

            db.run(query, params, function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(new Error('A client with this email already exists.'));
                    }
                    return reject(err);
                }

                if (this.changes === 0) {
                    return reject(new Error('Client not found or no changes made.'));
                }

                resolve({
                    id,
                    name,
                    email,
                    role: 'client',
                    company,
                    phone,
                    address
                });
            });
        } catch (hashErr) {
            reject(hashErr);
        }
    });
}

/**
 * Deletes a client by ID
 * @param {number} id 
 * @returns {Promise<boolean>} True if deleted
 */
function deleteClient(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ? AND role = ?', [id, 'client'], function(err) {
            if (err) {
                return reject(err);
            }
            if (this.changes === 0) {
                return reject(new Error('Client not found.'));
            }
            resolve(true);
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
