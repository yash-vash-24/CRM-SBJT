/**
 * Purpose:
 * This file contains route declarations for Client Management. It acts as the routing table
 * for client-related actions (adding, updating, deleting, listing clients).
 *
 * How requests flow:
 * 1. An incoming HTTP request hits an endpoint (e.g. DELETE /api/clients/4).
 * 2. It is first validated by verifySession to ensure a logged-in user session exists.
 * 3. It is then intercepted by requireAdmin because managing clients is an administrative duty.
 * 4. Finally, the request is dispatched to clientController.deleteClient.
 *
 * Why each route exists:
 * - GET /: Returns a list of all clients (restricted to Admin).
 * - GET /:id: Returns details of a specific client by ID (restricted to Admin).
 * - POST /: Creates a new client profile (restricted to Admin).
 * - PUT /:id: Updates an existing client profile (restricted to Admin).
 * - DELETE /:id: Deletes a client profile (restricted to Admin).
 */

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifySession, requireAdmin } = require('../middleware/auth');

// All client management endpoints require a valid session and admin role
router.use(verifySession);
router.use(requireAdmin);

// CRUD routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post('/', clientController.addClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
