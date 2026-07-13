/**
 * Purpose:
 * Routes inventory CRUD and stock movement logging requests to inventoryController.
 * Enforces role-based security using verifySession, requireAdmin, and requireAdminOrSupervisor.
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifySession, requireAdmin, requireAdminOrSupervisor } = require('../middleware/auth');

// All inventory operations require authentication and admin/supervisor role
router.use(verifySession);
router.use(requireAdminOrSupervisor);

// GET routes
router.get('/', inventoryController.getItems);
router.get('/:id', inventoryController.getItem);

// Admin-only write routes
router.post('/', requireAdmin, inventoryController.addItem);
router.put('/:id', requireAdmin, inventoryController.updateItem);
router.delete('/:id', requireAdmin, inventoryController.deleteItem);

// Stock log movement logging (accessible to Admin and Supervisor)
router.post('/:id/log', inventoryController.postLog);

module.exports = router;
