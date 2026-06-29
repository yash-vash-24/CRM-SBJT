/**
 * Purpose:
 * This service handles authentication operations: validating credentials, hashing,
 * and managing active session tokens in-memory.
 *
 * How requests flow:
 * 1. The AuthController receives login requests and calls functions in this file.
 * 2. This file queries the SQLite database to locate the user by email.
 * 3. It uses bcryptjs to verify if the passwords match.
 * 4. On successful login, it generates a unique session token, stores it in an
 *    in-memory map (activeSessions), and returns it.
 * 5. The Auth middleware reads tokens from headers and calls getSession() to authenticate requests.
 *
 * Why each function exists:
 * - loginUser(email, password, expectedRole): Validates email, role, and password, creating a session.
 * - logoutUser(sessionToken): Deletes a session token from the in-memory map.
 * - getSession(sessionToken): Retrieves user details associated with an active session token.
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');

// In-memory session store: maps a session token (string) to user details (object).
// In-memory is lightweight, requires no external dependencies, and is easy to explain.
const activeSessions = {};

/**
 * Validates credentials and generates a session token
 * @param {string} email 
 * @param {string} password 
 * @param {string} expectedRole - 'admin' or 'client'
 * @returns {Promise<object>} contains user info and sessionToken
 */
function loginUser(email, password, expectedRole) {
    return new Promise((resolve, reject) => {
        // Look up user by email and role in the database
        db.get(
            'SELECT * FROM users WHERE email = ? AND role = ?', 
            [email, expectedRole], 
            async (err, user) => {
                if (err) {
                    return reject(new Error('Database error during login.'));
                }
                
                if (!user) {
                    return reject(new Error('Invalid email or password.'));
                }

                try {
                    // Compare hashed password in DB with user-provided password
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) {
                        return reject(new Error('Invalid email or password.'));
                    }

                    // Generate a unique session token (simple random string)
                    const sessionToken = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

                    // Store user details in the active sessions map
                    activeSessions[sessionToken] = {
                        userId: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        company: user.company
                    };

                    // Return user data (excluding password) and session token
                    resolve({
                        sessionToken,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            company: user.company
                        }
                    });

                } catch (hashErr) {
                    reject(new Error('Error validating credentials.'));
                }
            }
        );
    });
}

/**
 * Destroys an active session token
 * @param {string} sessionToken 
 * @returns {boolean} true if session was deleted
 */
function logoutUser(sessionToken) {
    if (activeSessions[sessionToken]) {
        delete activeSessions[sessionToken];
        return true;
    }
    return false;
}

/**
 * Looks up session details for a session token
 * @param {string} sessionToken 
 * @returns {object|null} user details, or null if session is invalid
 */
function getSession(sessionToken) {
    return activeSessions[sessionToken] || null;
}

module.exports = {
    loginUser,
    logoutUser,
    getSession
};
