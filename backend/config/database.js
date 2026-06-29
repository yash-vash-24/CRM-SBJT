/**
 * Purpose:
 * This file configures the connection to the SQLite database and handles its initialization.
 * It reads the schema SQL script to set up tables and automatically seeds a default Admin
 * and Client if the database is new.
 *
 * How requests flow:
 * 1. Upon server startup, server.js imports this file.
 * 2. This file opens the SQLite database file (configured in .env or default 'database.sqlite').
 * 3. It runs the schema setup and database seeds.
 * 4. Other services and models import the exported 'db' instance to execute SQL queries.
 *
 * Why each function exists:
 * - initDB(): Reads the SQL schema file and runs it to construct tables, followed by seeding default users.
 * - seedDefaultUsers(): Inserts dummy admin and client accounts with hashed passwords if they don't already exist.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Determine database path (defaulting to database.sqlite in the backend directory)
const dbPath = path.resolve(__dirname, '..', process.env.DATABASE_FILE || 'database.sqlite');

// Create/open the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
    } else {
        console.log(`Connected to SQLite database at: ${dbPath}`);
        // Enable foreign key support
        db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
            if (pragmaErr) {
                console.error('Error enabling foreign keys:', pragmaErr.message);
            }
        });
        initDB();
    }
});

/**
 * Initializes the database schema by executing the schema.sql file
 */
function initDB() {
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error('Schema file not found at:', schemaPath);
        return;
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Run schema commands sequentially
    // In SQLite, db.exec runs multiple statements separated by semicolons
    db.exec(schemaSql, (err) => {
        if (err) {
            console.error('Error executing schema SQL:', err.message);
        } else {
            console.log('Database tables verified/created successfully.');
            seedDefaultUsers();
        }
    });
}

/**
 * Seeds a default admin and client so the API can be tested immediately
 */
function seedDefaultUsers() {
    // Check if the admin already exists
    db.get('SELECT * FROM users WHERE email = ?', ['admin@voltflow.com'], async (err, row) => {
        if (err) {
            console.error('Error checking for existing admin user:', err.message);
            return;
        }

        if (!row) {
            try {
                // Hash default passwords using bcrypt
                const adminPasswordHash = await bcrypt.hash('admin123', 10);
                const clientPasswordHash = await bcrypt.hash('client123', 10);

                // Insert Default Admin
                db.run(
                    `INSERT INTO users (name, email, password, role, company, phone, address) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['VoltFlow Admin', 'admin@voltflow.com', adminPasswordHash, 'admin', 'VoltFlow Corp', '123-456-7890', '123 Main St, New Delhi'],
                    (insertAdminErr) => {
                        if (insertAdminErr) {
                            console.error('Failed to seed default admin:', insertAdminErr.message);
                        } else {
                            console.log('Successfully seeded default admin user (admin@voltflow.com / admin123).');
                        }
                    }
                );

                // Insert Default Client
                db.run(
                    `INSERT INTO users (name, email, password, role, company, phone, address) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['DHBVN Utility Client', 'client@voltflow.com', clientPasswordHash, 'client', 'DHBVN Haryana', '987-654-3210', 'Substation Sector 14, Sirsa'],
                    (insertClientErr) => {
                        if (insertClientErr) {
                            console.error('Failed to seed default client:', insertClientErr.message);
                        } else {
                            console.log('Successfully seeded default client user (client@voltflow.com / client123).');
                        }
                    }
                );

            } catch (hashError) {
                console.error('Error hashing default user passwords during seed:', hashError.message);
            }
        } else {
            // Admin already exists, database is already seeded
            console.log('Seed users already exist in database.');
        }
    });
}

// Export the db connection object so it can be reused in our services
module.exports = db;
