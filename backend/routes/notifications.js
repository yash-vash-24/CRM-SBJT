/**
 * Purpose:
 * Provides a placeholder endpoint for the Notifications feature.
 * This represents an IN-PROGRESS feature (approx. 65% complete).
 *
 * How requests flow:
 * 1. Client requests GET /api/notifications.
 * 2. verifySession validates token.
 * 3. Router returns mock notifications and logging info.
 *
 * Why each route exists:
 * - GET /: Returns recent alerts about site operations.
 */

const express = require('express');
const router = express.Router();
const { verifySession } = require('../middleware/auth');

// GET /api/notifications - IN PROGRESS
router.get('/', verifySession, (req, res) => {
    // TODO: Create a notifications database table or establish a WebSocket (Socket.io)
    // server connection to push real-time project alerts to clients/admins.
    
    return res.status(200).json({
        message: 'Returning mock notifications. [TODO: Implement SQLite notifications table & Socket.io for live updates].',
        status: 'in_progress',
        notifications: [
            {
                id: 101,
                title: 'New Project Assigned',
                message: 'You have been assigned to the 33KV Substation Commisioning project.',
                createdAt: new Date(),
                read: false
            },
            {
                id: 102,
                title: 'Safety Inspector Approval',
                message: 'Blueprint safety clearance is pending admin verification.',
                createdAt: new Date(Date.now() - 3600000), // 1 hour ago
                read: true
            }
        ]
    });
});

module.exports = router;
