/**
 * Purpose:
 * Routes client management requests to clientController.
 * Utilizes verifySession and requireAdmin middlewares to enforce security.
 */

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifySession, requireAdmin } = require('../middleware/auth');

// All client operations require an active login session
router.use(verifySession);

// Route endpoints mapping
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);

// Administrative CRUD operations
router.post('/', requireAdmin, clientController.addClient);
router.put('/:id', requireAdmin, clientController.updateClient);
router.delete('/:id', requireAdmin, clientController.deleteClient);

module.exports = router;
