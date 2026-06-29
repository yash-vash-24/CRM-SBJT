/**
 * Purpose:
 * This controller handles HTTP request logic for authentication operations. It parses
 * input fields (email, password) from requests, invokes the AuthService to perform verification,
 * and sends back HTTP responses with appropriate status codes (200, 400, 401).
 *
 * How requests flow:
 * 1. The router matches routes like "/api/auth/admin/login" or "/api/auth/client/login".
 * 2. Express triggers the corresponding function in this controller (e.g. loginAdmin or loginClient).
 * 3. The function reads request body params, invokes authService.loginUser(), and awaits results.
 * 4. It responds to the client with the session token and user details, or an error message.
 *
 * Why each function exists:
 * - loginAdmin(req, res): End-point for Administrator login.
 * - loginClient(req, res): End-point for Client login.
 * - logout(req, res): End-point to terminate the user's active session.
 * - getMe(req, res): Endpoint to return details of the currently authenticated user session.
 */

const authService = require('../services/authService');

/**
 * Handles Administrator authentication
 */
async function loginAdmin(req, res) {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Authenticate user with role 'admin'
        const sessionData = await authService.loginUser(email, password, 'admin');
        
        return res.status(200).json({
            message: 'Admin login successful.',
            sessionToken: sessionData.sessionToken,
            user: sessionData.user
        });
    } catch (err) {
        // If login fails (invalid email, password or role), return 401 Unauthorized
        return res.status(401).json({ message: err.message });
    }
}

/**
 * Handles Client authentication
 */
async function loginClient(req, res) {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Authenticate user with role 'client'
        const sessionData = await authService.loginUser(email, password, 'client');
        
        return res.status(200).json({
            message: 'Client login successful.',
            sessionToken: sessionData.sessionToken,
            user: sessionData.user
        });
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
}

/**
 * Destroys current active session
 */
function logout(req, res) {
    // req.token is attached by the verifySession middleware
    const token = req.token;
    
    if (token) {
        const deleted = authService.logoutUser(token);
        if (deleted) {
            return res.status(200).json({ message: 'Logout successful.' });
        }
    }
    
    return res.status(400).json({ message: 'No active session found.' });
}

/**
 * Returns current authenticated user profile
 */
function getMe(req, res) {
    // req.user is populated by verifySession middleware
    return res.status(200).json({ user: req.user });
}

module.exports = {
    loginAdmin,
    loginClient,
    logout,
    getMe
};
