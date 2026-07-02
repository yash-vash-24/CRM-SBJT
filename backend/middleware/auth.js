/**
 * Purpose:
 * Enforces authentication and role-based access control.
 * It uses a simple in-memory session registry to map tokens to users.
 */

// In-memory token store: Maps token string -> { userId, role, name, email }
const sessions = {};

/**
 * Middleware: Confirms request has a valid session token in Authorization header
 */
function verifySession(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Authentication failed: Missing token.' });
    }

    // Handle standard 'Bearer <token>' format
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    const session = sessions[token];
    if (!session) {
        return res.status(401).json({ message: 'Authentication failed: Session expired or invalid.' });
    }

    // Attach current user session context to request object
    req.user = session;
    next();
}

/**
 * Middleware: Demands the current user have the 'admin' role
 */
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Requires Admin role.' });
    }
    next();
}

/**
 * Middleware: Allows access for 'admin' or 'supervisor' roles
 */
function requireAdminOrSupervisor(req, res, next) {
    if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: 'Access denied: Requires Admin or Supervisor role.' });
    }
    next();
}

module.exports = {
    verifySession,
    requireAdmin,
    requireAdminOrSupervisor,
    sessions
};
