/**
 * Purpose:
 * This middleware configures Multer to handle file uploads for the CRM (e.g. project blueprints, contracts).
 * It manages file storage destinations, generates unique names to avoid overwrites, and restricts 
 * uploaded files to accepted document formats.
 *
 * How requests flow:
 * 1. A client submits a form-data request containing a file to an upload endpoint.
 * 2. Express triggers this Multer middleware (upload.single('file')).
 * 3. Multer reads the incoming stream, verifies the file extension, generates a filename,
 *    and saves the file to the disk under 'uploads/'.
 * 4. The request proceeds to the controller, where req.file contains information about the saved file.
 *
 * Why each function exists:
 * - diskStorage: Configures disk storage options for uploads.
 * - destination: Directs file writes to the 'uploads/' directory, creating it if missing.
 * - filename: Generates a unique name by prefixing the current timestamp to the original file name.
 * - fileFilter: Inspects the file extension/MIME-type to prevent upload of dangerous files (like .exe).
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists utility
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Configure storage properties
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Clean original filename: replace spaces with underscores and append timestamp
        const cleanName = file.originalname.replace(/\s+/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + cleanName);
    }
});

// 2. Filter acceptable file formats
const fileFilter = (req, file, cb) => {
    // List of allowed file extensions
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.dwg'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error(`Invalid file type. Allowed formats: ${allowedExtensions.join(', ')}`), false); // Reject file
    }
};

// 3. Instantiate and export Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    }
});

module.exports = upload;
