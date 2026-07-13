/**
 * Purpose:
 * Intercepts HTTP requests for RA Billing Invoices,
 * validates parameters, invokes invoiceService functions, and returns standard JSON.
 */

const invoiceService = require('../services/invoiceService');

/**
 * GET /api/invoices - Lists all invoices (filtered by client if logged in as client)
 */
async function getInvoices(req, res) {
    try {
        let invoices = [];
        if (req.user.role === 'client') {
            invoices = await invoiceService.getInvoicesByClientId(req.user.userId);
        } else {
            invoices = await invoiceService.getAllInvoices();
        }
        return res.status(200).json(invoices);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/invoices/:id - Retrieves details of a specific invoice
 */
async function getInvoice(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Invoice ID.' });
    }

    try {
        const invoice = await invoiceService.getInvoiceById(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }

        // Ownership check: Client can only view their own invoices
        if (req.user.role === 'client' && invoice.client_id !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied: You do not have permission to view this invoice.' });
        }

        return res.status(200).json(invoice);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/invoices - Creates a new invoice (Admin/Supervisor only)
 */
async function addInvoice(req, res) {
    try {
        const invoice = await invoiceService.createInvoice(req.body);
        return res.status(201).json({
            message: 'Invoice created successfully.',
            invoice
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Validation failed: Invoice number must be unique.' });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * PATCH /api/invoices/:id/status - Updates completion status (Admin/Supervisor only)
 */
async function updateStatus(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Invoice ID.' });
    }

    try {
        const { status } = req.body;
        const invoice = await invoiceService.updateInvoiceStatus(id, status);
        return res.status(200).json({
            message: 'Invoice status updated successfully.',
            invoice
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/invoices/:id - Removes an invoice (Admin only)
 */
async function deleteInvoice(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Invoice ID.' });
    }

    try {
        await invoiceService.deleteInvoice(id);
        return res.status(200).json({ message: 'Invoice deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getInvoices,
    getInvoice,
    addInvoice,
    updateStatus,
    deleteInvoice
};
