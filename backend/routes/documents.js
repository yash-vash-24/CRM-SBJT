/**
 * Purpose:
 * This file declares endpoints for managing files within the CRM. It integrates the Multer 
 * file-handling middleware to process uploads before handing off requests to the controller.
 *
 * How requests flow:
 * 1. An incoming HTTP request hits an endpoint (e.g., POST /api/documents).
 * 2. verifySession runs to ensure a logged-in user.
 * 3. For POST / (uploads), Multer's upload.single('file') middleware intercepts, 
 *    parses the file stream, and writes it to the uploads folder.
 * 4. The controller function runs to complete database recording, downloading, or deleting.
 *
 * Why each route exists:
 * - POST /: Processes multipart file uploads and logs metadata (restricted to Admin).
 * - GET /project/:projectId: Fetches documents list linked to a specific project.
 * - GET /:id/download: Fetches the file and serves it as an attachment download.
 * - DELETE /:id: Removes the document from the database and the server's hard drive (restricted to Admin).
 */

const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');
const { verifySession, requireAdmin } = require('../middleware/auth');

// All document endpoints require authentication
router.use(verifySession);

// Upload endpoint (Admin only, uses Multer middleware to process 'file' body parameter)
router.post('/', requireAdmin, upload.single('file'), documentController.uploadDocument);

// List files by project (accessible by Admins and assigned Clients)
router.get('/project/:projectId', documentController.getProjectDocuments);

// Download file by file record ID (accessible by Admins and assigned Clients)
router.get('/:id/download', documentController.downloadDocument);

// Delete file by record ID (Admin only)
router.delete('/:id', requireAdmin, documentController.deleteDocument);

module.exports = router;
