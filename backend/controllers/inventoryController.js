/**
 * Purpose:
 * Intercepts HTTP requests for Material Inventory and Stock Log operations,
 * validates parameters, invokes inventoryService functions, and returns standard JSON.
 */

const inventoryService = require('../services/inventoryService');

/**
 * GET /api/inventory - Retrieves all inventory items with low-stock flags
 */
async function getItems(req, res) {
    try {
        const items = await inventoryService.getAllItems();
        return res.status(200).json(items);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/inventory/:id - Retrieves item details with stock movement logs
 */
async function getItem(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Inventory Item ID.' });
    }

    try {
        const detail = await inventoryService.getItemById(id);
        if (!detail) {
            return res.status(404).json({ message: 'Inventory item not found.' });
        }
        return res.status(200).json(detail);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/inventory - Creates a new material item (Admin only)
 */
async function addItem(req, res) {
    try {
        const item = await inventoryService.createItem(req.body);
        return res.status(201).json({
            message: 'Inventory item created successfully.',
            item
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * PUT /api/inventory/:id - Updates material item metadata (Admin only)
 */
async function updateItem(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Inventory Item ID.' });
    }

    try {
        const item = await inventoryService.updateItem(id, req.body);
        return res.status(200).json({
            message: 'Inventory item updated successfully.',
            item
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/inventory/:id - Deletes an inventory item and its logs (Admin only)
 */
async function deleteItem(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Inventory Item ID.' });
    }

    try {
        await inventoryService.deleteItem(id);
        return res.status(200).json({ message: 'Inventory item deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/inventory/:id/log - Posts a stock movement (IN/OUT) and adjusts quantity
 */
async function postLog(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Inventory Item ID.' });
    }

    try {
        // Use the authenticated user's name for the log attribution
        const loggedByName = req.user ? req.user.name : null;
        const log = await inventoryService.postStockLog(id, req.body, loggedByName);
        return res.status(201).json({
            message: `Stock ${log.type} recorded. New level: ${log.new_stock_level}`,
            log
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        if (err.message.includes('Insufficient')) {
            return res.status(409).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

module.exports = {
    getItems,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    postLog
};
