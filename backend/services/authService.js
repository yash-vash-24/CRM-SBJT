/**
 * Purpose:
 * Performs verification of user email, password checking using bcrypt,
 * and maintains active sessions in the memory registry.
 * Supports unified login for all roles (admin, supervisor, client, worker).
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { sessions } = require('../middleware/auth');

/**
 * Validates user credentials and initiates a session (unified for all roles)
 */
function loginUser(email, password) {
    return new Promise((resolve, reject) => {
        // Query the database for the given email
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) return reject(err);
            if (!user) return reject(new Error('Authentication failed: Email not found.'));

            // Verify password using bcrypt
            const matches = await bcrypt.compare(password, user.password);
            if (!matches) {
                return reject(new Error('Authentication failed: Incorrect password.'));
            }

            // Check if account is active
            if (user.status === 'inactive') {
                return reject(new Error('Authentication failed: Account is deactivated.'));
            }

            // Generate a simple unique token string
            const token = 'token_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

            // Save user details into our in-memory session registry
            sessions[token] = {
                userId: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            };

            resolve({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company: user.company
                }
            });
        });
    });
}

/**
 * Invalidates a session by deleting the token
 */
function logoutUser(token) {
    if (sessions[token]) {
        delete sessions[token];
        return true;
    }
    return false;
}

module.exports = {
    loginUser,
    logoutUser
};
