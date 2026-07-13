/**
 * Purpose:
 * Routes RA Billing Invoice endpoints to invoiceController.
 * Enforces role-based security using verifySession, requireAdmin, and requireAdminOrSupervisor.
 * Clients can view their own invoices via the GET routes.
 */

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifySession, requireAdmin, requireAdminOrSupervisor } = require('../middleware/auth');

// All invoice routes require authentication
router.use(verifySession);

// GET routes (accessible by all authenticated users — controller enforces client ownership)
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoice);

// Write routes (Admin/Supervisor only)
router.post('/', requireAdminOrSupervisor, invoiceController.addInvoice);
router.patch('/:id/status', requireAdminOrSupervisor, invoiceController.updateStatus);

// Delete route (Admin only)
router.delete('/:id', requireAdmin, invoiceController.deleteInvoice);

module.exports = router;
