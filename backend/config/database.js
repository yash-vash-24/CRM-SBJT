/**
 * Purpose:
 * Establishes the connection to the SQLite database, runs schema setup,
 * and automatically seeds default accounts and demo data if tables are empty.
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
            seedAllData();
        }
    });
}

// Seeds all default accounts and demo data to make testing immediate
async function seedAllData() {
    try {
        const row = await dbGet("SELECT id FROM users WHERE email = 'admin@electrical.com'");
        if (row) {
            console.log('Seed data already exists. Skipping seeder.');
            return;
        }

        console.log('Seeding default accounts and demo data...');

        // ----- 1. Seed User Accounts -----
        const adminHash = await bcrypt.hash('admin123', 10);
        const supervisorHash = await bcrypt.hash('super123', 10);
        const clientHash = await bcrypt.hash('client123', 10);
        const client2Hash = await bcrypt.hash('client123', 10);

        // Admin
        await dbRun(
            `INSERT INTO users (name, email, password, role, company, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['Subhash Tanwar', 'admin@electrical.com', adminHash, 'admin', 'VoltFlow Electricals', '9999999999', 'active']
        );
        console.log('  Seeded Admin: admin@electrical.com / admin123');

        // Supervisor
        await dbRun(
            `INSERT INTO users (name, email, password, role, company, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['Rajesh Kumar', 'supervisor1@electrical.com', supervisorHash, 'supervisor', 'VoltFlow Electricals', '9888877777', 'active']
        );
        console.log('  Seeded Supervisor: supervisor1@electrical.com / super123');

        // Client 1 - Jio
        await dbRun(
            `INSERT INTO users (name, email, password, role, company, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Amit Sharma', 'client1@jio.com', clientHash, 'client', 'Reliance Jio Infocomm', '8888888888', 'Jio HQ, RIL Campus, Navi Mumbai', 'active']
        );
        console.log('  Seeded Client: client1@jio.com / client123');

        // Client 2 - DHBVN
        await dbRun(
            `INSERT INTO users (name, email, password, role, company, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Vikram Singh', 'client2@dhbvn.com', client2Hash, 'client', 'DHBVN Sirsa Division', '7777777777', 'DHBVN Office, Sector 6, Sirsa, Haryana', 'active']
        );
        console.log('  Seeded Client: client2@dhbvn.com / client123');

        // ----- 2. Seed Employees -----
        await dbRun(
            `INSERT INTO employees (user_id, first_name, last_name, designation, phone, email, salary, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [2, 'Rajesh', 'Kumar', 'Supervisor', '9888877777', 'supervisor1@electrical.com', 45000, 'active', '2024-01-15']
        );
        await dbRun(
            `INSERT INTO employees (first_name, last_name, designation, phone, email, salary, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Manoj', 'Yadav', 'Lineman', '9666655555', 'manoj.y@voltflow.com', 22000, 'active', '2024-03-10']
        );
        await dbRun(
            `INSERT INTO employees (first_name, last_name, designation, phone, email, salary, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Suresh', 'Meena', 'Technician', '9555544444', 'suresh.m@voltflow.com', 25000, 'active', '2024-02-01']
        );
        await dbRun(
            `INSERT INTO employees (first_name, last_name, designation, phone, email, salary, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Deepak', 'Verma', 'Lineman', '9444433333', 'deepak.v@voltflow.com', 20000, 'active', '2024-06-15']
        );
        await dbRun(
            `INSERT INTO employees (first_name, last_name, designation, phone, email, salary, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Pankaj', 'Singh', 'Helper', '9333322222', 'pankaj.s@voltflow.com', 15000, 'inactive', '2023-11-20']
        );
        console.log('  Seeded 5 employees.');

        // ----- 3. Seed Projects -----
        await dbRun(
            `INSERT INTO projects (name, description, client_id, supervisor_id, start_date, completion_date, budget, status, progress_percent, site_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['33/11KV Substation Commissioning - Sirsa', 'Commissioning of a new 33/11KV substation with 2x10MVA power transformers for DHBVN Sirsa division.', 4, 2, '2025-01-15', '2025-08-30', 4500000, 'active', 45, 'Sirsa, Haryana']
        );
        await dbRun(
            `INSERT INTO projects (name, description, client_id, supervisor_id, start_date, completion_date, budget, status, progress_percent, site_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['HT Line Extension - Jio Tower Cluster', 'Extension of 11KV HT overhead line to supply power to 8 Jio telecom tower sites across Hisar district.', 3, 2, '2025-03-01', '2025-06-30', 1800000, 'active', 70, 'Hisar, Haryana']
        );
        await dbRun(
            `INSERT INTO projects (name, description, client_id, supervisor_id, start_date, budget, status, progress_percent, site_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['LT Pole Erection - Village Electrification', 'Erection of 120 GI/PSC poles for LT distribution network under DDUGJY scheme.', 4, 2, '2025-05-01', 950000, 'planning', 5, 'Fatehabad, Haryana']
        );
        await dbRun(
            `INSERT INTO projects (name, description, client_id, start_date, completion_date, budget, status, progress_percent, site_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Transformer Replacement - Sector 14', 'Replacement of damaged 250KVA distribution transformer at Sector 14 feeder point.', 4, '2024-10-01', '2025-01-10', 320000, 'completed', 100, 'Sirsa Sector 14, Haryana']
        );
        console.log('  Seeded 4 projects.');

        // ----- 4. Seed Project Worker Assignments -----
        await dbRun(`INSERT INTO project_workers (project_id, employee_id) VALUES (?, ?)`, [1, 2]);
        await dbRun(`INSERT INTO project_workers (project_id, employee_id) VALUES (?, ?)`, [1, 3]);
        await dbRun(`INSERT INTO project_workers (project_id, employee_id) VALUES (?, ?)`, [2, 2]);
        await dbRun(`INSERT INTO project_workers (project_id, employee_id) VALUES (?, ?)`, [2, 4]);
        console.log('  Seeded project worker assignments.');

        // ----- 5. Seed Inventory -----
        await dbRun(
            `INSERT INTO inventory (item_name, description, category, unit, quantity, low_stock_threshold, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['9 Meter GI Poles', 'Galvanized iron poles for LT line support', 'Poles', 'Pcs', 85, 20, 4500]
        );
        await dbRun(
            `INSERT INTO inventory (item_name, description, category, unit, quantity, low_stock_threshold, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['100KVA Distribution Transformer', 'Oil-cooled distribution transformer 11/0.4KV', 'Transformers', 'Pcs', 3, 2, 185000]
        );
        await dbRun(
            `INSERT INTO inventory (item_name, description, category, unit, quantity, low_stock_threshold, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['Rabbit ACSR Conductor', 'Aluminium Conductor Steel Reinforced for 11KV lines', 'Conductors', 'Km', 12, 5, 42000]
        );
        await dbRun(
            `INSERT INTO inventory (item_name, description, category, unit, quantity, low_stock_threshold, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['11KV Pin Insulator', 'Porcelain pin type insulator for HT lines', 'Insulators', 'Pcs', 150, 30, 350]
        );
        await dbRun(
            `INSERT INTO inventory (item_name, description, category, unit, quantity, low_stock_threshold, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['LT AB Cable 3x95+70', 'Aerial Bunched Cable for LT distribution', 'Cables', 'Mtr', 800, 200, 280]
        );
        await dbRun(
            `INSERT INTO inventory (item_name, description, category, unit, quantity, low_stock_threshold, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['D-Iron Cross Arm', 'Galvanized cross arm for 11KV pole mounting', 'Hardware', 'Pcs', 8, 15, 1200]
        );
        console.log('  Seeded 6 inventory items.');

        // ----- 6. Seed Tenders -----
        await dbRun(
            `INSERT INTO tenders (title, department, value, submission_deadline, status, emd_value, emd_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['NIT/DHBVN/2025/TR-45 — 33KV Bay Extension Sirsa', 'DHBVN Sirsa Circle', 8500000, '2025-09-15', 'submitted', 170000, 'paid']
        );
        await dbRun(
            `INSERT INTO tenders (title, department, value, submission_deadline, status, emd_value, emd_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['NIT/UHBVN/2025/LT-12 — LT Network Augmentation', 'UHBVN Karnal Division', 3200000, '2025-08-01', 'draft', 64000, 'pending']
        );
        await dbRun(
            `INSERT INTO tenders (title, department, value, submission_deadline, status, emd_value, emd_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['NIT/DHBVN/2024/SS-08 — Substation Maintenance AMC', 'DHBVN Hisar Circle', 1200000, '2024-12-01', 'awarded', 24000, 'refunded']
        );
        console.log('  Seeded 3 tenders.');

        // ----- 7. Seed Invoices -----
        await dbRun(
            `INSERT INTO invoices (invoice_number, project_id, client_id, amount, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['VF-INV-2025-001', 1, 4, 1350000, '2025-04-01', '2025-05-01', 'paid']
        );
        await dbRun(
            `INSERT INTO invoices (invoice_number, project_id, client_id, amount, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['VF-INV-2025-002', 1, 4, 900000, '2025-06-15', '2025-07-15', 'pending']
        );
        await dbRun(
            `INSERT INTO invoices (invoice_number, project_id, client_id, amount, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['VF-INV-2025-003', 2, 3, 720000, '2025-05-01', '2025-06-01', 'paid']
        );
        await dbRun(
            `INSERT INTO invoices (invoice_number, project_id, client_id, amount, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['VF-INV-2025-004', 2, 3, 540000, '2025-06-20', '2025-07-20', 'pending']
        );
        await dbRun(
            `INSERT INTO invoices (invoice_number, project_id, client_id, amount, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['VF-INV-2024-010', 4, 4, 320000, '2024-12-15', '2025-01-15', 'paid']
        );
        console.log('  Seeded 5 invoices.');

        // ----- 8. Seed Documents -----
        await dbRun(
            `INSERT INTO documents (name, type, file_path, project_id) VALUES (?, ?, ?, ?)`,
            ['33KV Substation SLD Drawing', 'blueprint', '/uploads/sld_33kv_sirsa.pdf', 1]
        );
        await dbRun(
            `INSERT INTO documents (name, type, file_path, project_id) VALUES (?, ?, ?, ?)`,
            ['CEIG Approval Certificate', 'clearance', '/uploads/ceig_approval_sirsa.pdf', 1]
        );
        await dbRun(
            `INSERT INTO documents (name, type, file_path, project_id) VALUES (?, ?, ?, ?)`,
            ['Jio Tower Supply Agreement', 'contract', '/uploads/jio_supply_agreement.pdf', 2]
        );
        await dbRun(
            `INSERT INTO documents (name, type, file_path, tender_id) VALUES (?, ?, ?, ?)`,
            ['NIT Document TR-45', 'other', '/uploads/nit_tr45_dhbvn.pdf', 1]
        );
        console.log('  Seeded 4 documents.');

        console.log('Database seeding completed successfully!');

    } catch (err) {
        console.error('Seeding error:', err.message);
    }
}

// ---- Promise wrappers for cleaner async/await seeding ----

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

module.exports = db;
