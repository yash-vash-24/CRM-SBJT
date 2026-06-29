/**
 * Purpose:
 * Intercepts HTTP requests for Client CRUD management, validates IDs,
 * forwards requests to clientService, and outputs standard JSON.
 */

const clientService = require('../services/clientService');

/**
 * GET /api/clients - Retrieves all client profiles
 */
async function getClients(req, res) {
    try {
        const clients = await clientService.getAllClients();
        return res.status(200).json(clients);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/clients/:id - Retrieves details of a specific client
 */
async function getClient(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Client ID.' });
    }

    try {
        const client = await clientService.getClientById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }
        return res.status(200).json(client);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/clients - Adds a new client account (Admin only)
 */
async function addClient(req, res) {
    try {
        const client = await clientService.createClient(req.body);
        return res.status(201).json({
            message: 'Client created successfully.',
            client
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * PUT /api/clients/:id - Modifies an existing client account (Admin only)
 */
async function updateClient(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Client ID.' });
    }

    try {
        const client = await clientService.updateClient(id, req.body);
        return res.status(200).json({
            message: 'Client updated successfully.',
            client
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/clients/:id - Permanently deletes a client account (Admin only)
 */
async function deleteClient(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Client ID.' });
    }

    try {
        await clientService.deleteClient(id);
        return res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getClients,
    getClient,
    addClient,
    updateClient,
    deleteClient
};
