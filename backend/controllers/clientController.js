/**
 * Purpose:
 * This controller handles HTTP requests related to Client CRUD actions. It parses parameters 
 * from the URL (such as client ID) and request body, triggers the appropriate ClientService database
 * function, and returns responses to the client.
 *
 * How requests flow:
 * 1. The router matches an endpoint (e.g. GET /api/clients).
 * 2. Express executes the corresponding function in this file (e.g. getClients).
 * 3. The controller extracts route parameters or req.body data and calls clientService.
 * 4. It handles promise success and failures (e.g., duplicate email) and returns status codes (200, 201, 400, 404, 500).
 *
 * Why each function exists:
 * - getClients(req, res): Fetches a list of all client accounts to display in the CRM table.
 * - getClient(req, res): Fetches details for a single client for detail views or editing forms.
 * - addClient(req, res): Inserts a new client profile (called by Admin on the 'Add Client' screen).
 * - updateClient(req, res): Saves edits to a client's profile details.
 * - deleteClient(req, res): Permanently deletes a client.
 */

const clientService = require('../services/clientService');

/**
 * Gets all client accounts
 */
async function getClients(req, res) {
    const { search } = req.query;

    // TODO: Implement search filter.
    // Query parameters like '?search=utility' should filter clients by name, email, or company.
    // Currently, search/filtering is a WORK IN PROGRESS; the API defaults to returning all clients.
    if (search) {
        console.log(`[Search/Filter In-Progress] Request received for search="${search}". Filters are not yet applied to SQLite queries.`);
    }

    try {
        const clients = await clientService.getAllClients();
        return res.status(200).json(clients);
    } catch (err) {
        console.error('Error fetching clients:', err.message);
        return res.status(500).json({ message: 'Internal server error while fetching clients.' });
    }
}

/**
 * Gets details of a single client
 */
async function getClient(req, res) {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID format.' });
    }

    try {
        const client = await clientService.getClientById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }
        return res.status(200).json(client);
    } catch (err) {
        console.error('Error fetching client by ID:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

/**
 * Adds a new client account
 */
async function addClient(req, res) {
    try {
        const newClient = await clientService.createClient(req.body);
        return res.status(201).json({
            message: 'Client created successfully.',
            client: newClient
        });
    } catch (err) {
        // Return 400 Bad Request for validation errors (e.g. duplicate email, missing fields)
        return res.status(400).json({ message: err.message });
    }
}

/**
 * Updates details of an existing client
 */
async function updateClient(req, res) {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID format.' });
    }

    try {
        const updatedClient = await clientService.updateClient(clientId, req.body);
        return res.status(200).json({
            message: 'Client updated successfully.',
            client: updatedClient
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * Deletes a client account
 */
async function deleteClient(req, res) {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID format.' });
    }

    try {
        await clientService.deleteClient(clientId);
        return res.status(200).json({ message: 'Client deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Internal server error while deleting client.' });
    }
}

module.exports = {
    getClients,
    getClient,
    addClient,
    updateClient,
    deleteClient
};
