/**
 * Purpose:
 * Entry point for the simplified Express application.
 * Mounts core routers and handles global settings (JSON parsing, CORS).
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database configuration to trigger SQLite setup and seeding
const db = require('./config/database');

// Import routers
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Global Middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Enable body parsing for JSON payloads
app.use(express.urlencoded({ extended: true }));

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        database: 'sqlite',
        timestamp: new Date()
    });
});

// Handle 404 Route Not Found fallback
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Global Error Catcher:', err.message);
    return res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
        message: err.message || 'An unexpected error occurred on the server.'
    });
});

// Listen on the configured port
app.listen(PORT, () => {
    console.log(`⚡ VoltFlow CRM Backend is running on http://localhost:${PORT}`);
});
