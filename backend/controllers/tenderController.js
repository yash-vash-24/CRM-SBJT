/**
 * Purpose:
 * Intercepts HTTP requests for Tender Pipeline operations,
 * validates parameters, invokes tenderService functions, and returns standard JSON.
 */

const tenderService = require('../services/tenderService');

/**
 * GET /api/tenders - Retrieves all tenders
 */
async function getTenders(req, res) {
    try {
        const tenders = await tenderService.getAllTenders();
        return res.status(200).json(tenders);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/tenders/:id - Retrieves detailed tender record
 */
async function getTender(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Tender ID.' });
    }

    try {
        const detail = await tenderService.getTenderById(id);
        if (!detail) {
            return res.status(404).json({ message: 'Tender not found.' });
        }
        return res.status(200).json(detail);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/tenders - Creates a new tender
 */
async function addTender(req, res) {
    try {
        const tender = await tenderService.createTender(req.body);
        return res.status(201).json({
            message: 'Tender registered successfully.',
            tender
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * PUT /api/tenders/:id - Updates tender details
 */
async function updateTender(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Tender ID.' });
    }

    try {
        const tender = await tenderService.updateTender(id, req.body);
        return res.status(200).json({
            message: 'Tender updated successfully.',
            tender
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/tenders/:id - Deletes a tender (Admin only)
 */
async function deleteTender(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Tender ID.' });
    }

    try {
        await tenderService.deleteTender(id);
        return res.status(200).json({ message: 'Tender deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getTenders,
    getTender,
    addTender,
    updateTender,
    deleteTender
};
