/**
 * Purpose:
 * Connects directly to the SQLite 'users' table to perform Client CRUD operations.
 * All functions return Promises to make controller code clean and readable.
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Fetch all client profiles
 */
function getAllClients() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, name, email, company, phone, createdAt FROM users WHERE role = 'client' ORDER BY id DESC", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Fetch single client profile by ID
 */
function getClientById(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT id, name, email, company, phone, createdAt FROM users WHERE id = ? AND role = 'client'", [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

/**
 * Inserts a new Client account
 */
function createClient(data) {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, company, phone } = data;
        
        if (!name || !email || !password) {
            return reject(new Error('Name, email, and password are required.'));
        }

        try {
            const hash = await bcrypt.hash(password, 10);
            db.run(
                `INSERT INTO users (name, email, password, role, company, phone) VALUES (?, ?, ?, 'client', ?, ?)`,
                [name, email, hash, company || null, phone || null],
                function (err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            return reject(new Error('Duplicate email: This email is already registered.'));
                        }
                        return reject(err);
                    }
                    resolve({ id: this.lastID, name, email, company, phone });
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
        const { name, email, password, company, phone } = data;

        if (!name || !email) {
            return reject(new Error('Name and email are required.'));
        }

        let query = 'UPDATE users SET name = ?, email = ?, company = ?, phone = ?';
        const params = [name, email, company || null, phone || null];

        if (password) {
            const hash = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hash);
        }

        query += ' WHERE id = ? AND role = \'client\'';
        params.push(id);

        db.run(query, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return reject(new Error('Duplicate email: Email already in use.'));
                }
                return reject(err);
            }
            if (this.changes === 0) {
                return reject(new Error('Client not found.'));
            }
            resolve({ id, name, email, company, phone });
        });
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
