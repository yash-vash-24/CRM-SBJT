/**
 * Purpose:
 * This controller processes document-related requests (uploads, downloads).
 * It represents an IN-PROGRESS feature (approx. 65% complete).
 *
 * How requests flow:
 * 1. An Admin sends a multipart request to upload a file.
 * 2. Multer uploads the file to the disk.
 * 3. This controller intercepts the request, returning a temporary mockup response.
 *    [TODO: Connect this controller to the database to log the uploaded file's metadata].
 *
 * Why each function exists:
 * - uploadDocument: Accepts files from Multer but does not log them in SQLite yet (TODO).
 * - getProjectDocuments: Returns mock documents list for testing UI components.
 * - downloadDocument: Placeholder for file downloading (TODO).
 * - deleteDocument: Placeholder for deleting file records (TODO).
 */

const fs = require('fs');
const path = require('path');

/**
 * Handles file uploads - IN PROGRESS
 * Currently saves file to uploads/ but database logging is pending.
 */
async function uploadDocument(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file format.' });
    }

    const { projectId } = req.body;

    // TODO: Connect this to documentService to persist file metadata in SQLite
    // db.run('INSERT INTO documents ...')
    // Currently, we just return a success response with mock metadata for testing.
    
    console.log(`[TODO] File stored at ${req.file.path}. Database log is pending.`);

    return res.status(202).json({
        message: 'File uploaded to server storage. [TODO: Implement SQLite database logging for metadata persistence].',
        status: 'in_progress',
        tempDocument: {
            name: req.file.originalname,
            filename: req.file.filename,
            filepath: req.file.path,
            projectId: projectId || 'Not Assigned',
            uploadedAt: new Date()
        }
    });
}

/**
 * Returns documents list for a project - IN PROGRESS
 * Currently returns mock list of files.
 */
async function getProjectDocuments(req, res) {
    const projectId = parseInt(req.params.projectId);
    
    // TODO: Query SQLite 'documents' table to get real files uploaded for this project.
    // SELECT * FROM documents WHERE projectId = ?
    // Returning mock data for frontend development purposes.

    return res.status(200).json({
        message: 'Returning mock documents. [TODO: Fetch from SQLite documents table].',
        projectId: projectId,
        documents: [
            {
                id: 999,
                projectId: projectId,
                name: 'mock_electrical_blueprint.dwg',
                filename: '168393939-mock_blueprint.dwg',
                filepath: '/uploads/168393939-mock_blueprint.dwg',
                uploadedBy: 1,
                uploaderName: 'VoltFlow Admin (Mock)',
                uploadedAt: new Date()
            }
        ]
    });
}

/**
 * Downloads a project document file - TODO
 */
async function downloadDocument(req, res) {
    // TODO: Implement download logic.
    // 1. Fetch filepath from database by ID
    // 2. Run res.download(filepath)
    return res.status(501).json({ 
        message: 'Feature In Progress: File downloading from database metadata is not implemented yet.' 
    });
}

/**
 * Deletes a document record and unlinks its physical file - TODO
 */
async function deleteDocument(req, res) {
    // TODO: Implement delete logic
    // 1. Fetch file record from DB
    // 2. Run fs.unlink to delete physical file
    // 3. Run DELETE SQL query
    return res.status(501).json({ 
        message: 'Feature In Progress: File deletion from database and disk is not implemented yet.' 
    });
}

module.exports = {
    uploadDocument,
    getProjectDocuments,
    downloadDocument,
    deleteDocument
};
