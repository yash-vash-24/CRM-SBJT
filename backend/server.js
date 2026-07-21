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
const employeeRoutes = require('./routes/employeeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const documentRoutes = require('./routes/documentRoutes');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Global Middlewares
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin === 'http://localhost:3000' ||
      origin === 'http://127.0.0.1:3000' ||
      origin === process.env.CLIENT_URL ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all Vercel deployment URLs dynamically
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Enable body parsing for JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/documents', documentRoutes);

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
    console.log(`⚡ Shree Balaji Traders CRM Backend is running on http://localhost:${PORT}`);
});
