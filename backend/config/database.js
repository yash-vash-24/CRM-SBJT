/**
 * Purpose:
 * Establishes the connection to the SQLite database, runs schema setup,
 * and automatically seeds default admin and client accounts if empty.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Resolve database path (defaults to database.sqlite in backend root)
const dbPath = path.resolve(__dirname, '..', process.env.DATABASE_FILE || 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('SQLite connection error:', err.message);
    } else {
        console.log('Connected to SQLite Database:', dbPath);
        initDB();
    }
});

// Runs the schema.sql table creator script
function initDB() {
    db.run('PRAGMA foreign_keys = ON;'); // Enforce relational foreign keys
    
    const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schemaSql, (err) => {
        if (err) {
            console.error('Failed to execute database schema:', err.message);
        } else {
            console.log('Database schema initialization completed.');
            seedUsers();
        }
    });
}

// Seeds default accounts to make testing immediate
function seedUsers() {
    db.get("SELECT id FROM users WHERE email = 'admin@voltflow.com'", async (err, row) => {
        if (err) return console.error('Error checking seed data:', err.message);
        
        // Seed if users table is empty
        if (!row) {
            const adminHash = await bcrypt.hash('admin123', 10);
            const clientHash = await bcrypt.hash('client123', 10);

            db.run(
                `INSERT INTO users (name, email, password, role, company, phone) VALUES (?, ?, ?, ?, ?, ?)`,
                ['VoltFlow Admin', 'admin@voltflow.com', adminHash, 'admin', 'VoltFlow Corp', '9999999999'],
                (err) => {
                    if (err) console.error('Failed to seed admin:', err.message);
                    else console.log('Seeded Default Admin: admin@voltflow.com / admin123');
                }
            );

            db.run(
                `INSERT INTO users (name, email, password, role, company, phone) VALUES (?, ?, ?, ?, ?, ?)`,
                ['Haryana Utilities', 'client@voltflow.com', clientHash, 'client', 'DHBVN Sirsa', '8888888888'],
                (err) => {
                    if (err) console.error('Failed to seed client:', err.message);
                    else console.log('Seeded Default Client: client@voltflow.com / client123');
                }
            );
        }
    });
}

module.exports = db;
