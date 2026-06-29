/**
 * Purpose:
 * This middleware intercepts incoming HTTP requests to verify session tokens and
 * enforce role-based access control (RBAC). It ensures only logged-in users 
 * (and specifically admins or clients) can access protected endpoints.
 *
 * How requests flow:
 * 1. An incoming request hits a route protected by one of these middleware functions.
 * 2. verifySession checks for the "Authorization" header (e.g. "Bearer sess_abc123").
 * 3. It parses the token and checks authService.getSession(token).
 * 4. If the token is valid, the user's details are attached to req.user and next() is called.
 * 5. If the route also requires admin authorization, requireAdmin checks if req.user.role is 'admin'.
 * 6. If any check fails, the middleware responds with a 401 (Unauthorized) or 403 (Forbidden) error.
 *
 * Why each function exists:
 * - verifySession(req, res, next): Authenticates that the client holds a valid active session.
 * - requireAdmin(req, res, next): Ensures the authenticated user is an administrator.
 * - requireClient(req, res, next): Ensures the authenticated user is a client.
 */

const authService = require('../services/authService');

/**
 * Middleware to check if the request is authenticated with a valid session token
 */
function verifySession(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // We expect the header format: "Bearer <session_token>" or just "<session_token>"
    if (!authHeader) {
        return res.status(401).json({ message: 'Authentication required. No session token provided.' });
    }

    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    const session = authService.getSession(token);

    if (!session) {
        return res.status(401).json({ message: 'Invalid or expired session token.' });
    }

    // Attach the user profile to the request object so subsequent controllers can use it
    req.user = session;
    req.token = token; // Keep the token reference for logout operations
    next();
}

/**
 * Middleware to restrict access to Admins only
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }

    next();
}

/**
 * Middleware to restrict access to Clients only
 */
function requireClient(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role !== 'client') {
        return res.status(403).json({ message: 'Access denied. Client privileges required.' });
    }

    next();
}

module.exports = {
    verifySession,
    requireAdmin,
    requireClient
};
