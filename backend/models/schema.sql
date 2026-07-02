-- =========================================================================
-- VoltFlow CRM — Full Relational Database Schema (SQLite)
-- Creates all tables required by the frontend modules.
-- =========================================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table (Handles logins for Admin, Supervisor, Client, Worker)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'supervisor', 'client', 'worker')),
    company TEXT,
    phone TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees Table (HR Ledger)
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    salary REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    joined_date TEXT,
    attendance_records TEXT DEFAULT '{}',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Projects Table (Utility infrastructure jobs)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    client_id INTEGER,
    supervisor_id INTEGER,
    start_date TEXT,
    completion_date TEXT,
    budget REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'planning' CHECK(status IN ('planning', 'active', 'completed', 'lost', 'cancelled')),
    progress_percent INTEGER DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
    site_location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(supervisor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Project Workers Mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS project_workers (
    project_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, employee_id),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 5. Inventory Table (Material stock register)
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN ('Poles', 'Transformers', 'Conductors', 'Insulators', 'Switchgears', 'Cables', 'Hardware', 'Other')),
    unit TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    unit_price REAL DEFAULT 0
);

-- 6. Stock Logs Table (Inventory movement ledger)
CREATE TABLE IF NOT EXISTS stock_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL,
    reference_id TEXT,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    logged_by_name TEXT,
    FOREIGN KEY(item_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- 7. Tenders Table (Bidding pipeline)
CREATE TABLE IF NOT EXISTS tenders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    value REAL DEFAULT 0,
    submission_deadline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'awarded', 'lost', 'cancelled')),
    emd_value REAL DEFAULT 0,
    emd_status TEXT NOT NULL DEFAULT 'pending' CHECK(emd_status IN ('pending', 'paid', 'refunded')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Invoices Table (RA Billing)
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    project_id INTEGER NOT NULL,
    client_id INTEGER,
    amount REAL NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'cancelled')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(client_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Documents Table (File metadata register)
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('contract', 'blueprint', 'clearance', 'other')),
    file_path TEXT NOT NULL,
    project_id INTEGER,
    tender_id INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY(tender_id) REFERENCES tenders(id) ON DELETE SET NULL
);
