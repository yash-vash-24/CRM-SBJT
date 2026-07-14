/**
 * Purpose:
 * Intercepts HTTP requests for Document Vault operations,
 * validates parameters, invokes documentService functions, and returns standard JSON.
 */

const documentService = require('../services/documentService');

/**
 * GET /api/documents - Lists all documents (filtered by user session role)
 */
async function getDocuments(req, res) {
    try {
        let documents = [];
        if (req.user.role === 'client') {
            documents = await documentService.getDocumentsByClientId(req.user.userId);
        } else if (req.user.role === 'worker') {
            documents = await documentService.getDocumentsByWorkerUserId(req.user.userId);
        } else {
            // Admin/Supervisor see all documents
            documents = await documentService.getAllDocuments();
        }
        return res.status(200).json(documents);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/documents/:id - Retrieves details of a specific document
 */
async function getDocument(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Document ID.' });
    }

    try {
        const document = await documentService.getDocumentById(id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Ownership/Assignment guard
        if (req.user.role === 'client' && document.project_id && document.client_id !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied: You do not have permission to view this document.' });
        }

        return res.status(200).json(document);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/documents - Uploads/indexes a new document (Admin/Supervisor only)
 */
async function addDocument(req, res) {
    try {
        const document = await documentService.createDocument(req.body);
        return res.status(201).json({
            message: 'Document uploaded and indexed successfully.',
            document
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/documents/:id - Deletes a document record (Admin only)
 */
async function deleteDocument(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Document ID.' });
    }

    try {
        await documentService.deleteDocument(id);
        return res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getDocuments,
    getDocument,
    addDocument,
    deleteDocument
};
