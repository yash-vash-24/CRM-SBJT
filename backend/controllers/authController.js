/**
 * Purpose:
 * Intercepts HTTP auth requests, validates request payloads, invokes
 * authService methods, and returns structured JSON responses.
 */

const authService = require('../services/authService');

/**
 * Handle Admin login requests
 */
async function loginAdmin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const responseData = await authService.loginUser(email, password, 'admin');
        return res.status(200).json(responseData);
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
}

/**
 * Handle Client login requests
 */
async function loginClient(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const responseData = await authService.loginUser(email, password, 'client');
        return res.status(200).json(responseData);
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
}

/**
 * Destroys an active session token
 */
function logout(req, res) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(400).json({ message: 'Missing Authorization header.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    const success = authService.logoutUser(token);
    
    if (success) {
        return res.status(200).json({ message: 'Logged out successfully.' });
    }
    return res.status(400).json({ message: 'Failed: Token was not active.' });
}

/**
 * Returns current authenticated user session data
 */
function getMe(req, res) {
    // req.user is already validated and injected by verifySession middleware
    return res.status(200).json(req.user);
}

module.exports = {
    loginAdmin,
    loginClient,
    logout,
    getMe
};
