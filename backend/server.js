/**
 * Purpose of the file:
 * This is the main entry point for the Electrical Contractor CRM backend server.
 * It configures the Express application, applies global middlewares (CORS, JSON parsing, 
 * Static directories), mounts all route handlers, and starts listening for HTTP requests.
 *
 * How requests flow:
 * 1. A client application makes an HTTP request to the backend (e.g., GET http://localhost:5000/api/projects).
 * 2. The request enters server.js and passes through global middlewares (cors, express.json).
 * 3. It checks matched paths under route mounts (e.g., /api/auth, /api/projects).
 * 4. If a route match is found, control moves to the corresponding router file, then to the middleware/controller.
 * 5. If any error occurs during processing, it falls through to the global error-handling middleware at the bottom.
 * 6. If no route matches, a 404 response is sent.
 *
 * Why each function exists:
 * - app.use(cors(...)): Enables Cross-Origin Resource Sharing so our Next.js frontend (on port 3000) can communicate with this API.
 * - app.use('/uploads', ...): Serves files in the 'uploads/' folder as static assets.
 * - app.use((err, req, res, next) => ...): Global error handler that catches Express and Multer errors and sends clean JSON instead of crash logs.
 * - app.listen(...): Boots up the Express HTTP server on the configured port.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection to trigger its self-initialization and seed process
const db = require('./config/database');

// Import routers
const authRouter = require('./routes/auth');
const clientsRouter = require('./routes/clients');
const projectsRouter = require('./routes/projects');
const documentsRouter = require('./routes/documents');
const dashboardRouter = require('./routes/dashboard');
const notificationsRouter = require('./routes/notifications');
const reportsRouter = require('./routes/reports');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Apply Global Middlewares
// Enable CORS so the React/Next.js frontend can call the REST APIs from localhost
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming requests with JSON payloads (replaces bodyParser.json())
app.use(express.json());

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// 2. Serve Static files
// Makes files uploaded into backend/uploads accessible at http://localhost:5000/uploads/filename
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Mount REST API Routes
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);

// Health check endpoint (useful for checking if backend is alive)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        database: 'sqlite',
        timestamp: new Date()
    });
});

// 4. Handle 404 Route Not Found
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// 5. Global Error Handling Middleware
// Catches parsing errors, Multer upload rejections, and runtime exceptions
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.message);
    
    // Multer error check
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum allowed size is 10MB.' });
    }
    
    // General Express validation/runtime errors
    return res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
        message: err.message || 'An unexpected error occurred on the server.'
    });
});

// 6. Start the Express Server
app.listen(PORT, () => {
    console.log(`===========================================================`);
    console.log(`⚡ VoltFlow CRM Backend is running on http://localhost:${PORT}`);
    console.log(`📂 Uploads directory is served at: http://localhost:${PORT}/uploads`);
    console.log(`===========================================================`);
});
