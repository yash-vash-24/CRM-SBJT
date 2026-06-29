-- =========================================================================
-- Purpose of this file:
-- This SQL script defines the simplified database schema for the CRM.
-- It creates two clean relational tables: users and projects.
-- =========================================================================

-- Enable foreign keys so SQLite validates relationships during write operations
PRAGMA foreign_keys = ON;

-- 1. Users Table (Handles both Admins and Clients)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'client')),
    company TEXT, -- Used for Clients (e.g. Utility Board names)
    phone TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table (Tracks contracting jobs and assigns them to clients)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    clientId INTEGER, -- Links this project to a row in 'users'
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clientId) REFERENCES users(id) ON DELETE SET NULL
);
