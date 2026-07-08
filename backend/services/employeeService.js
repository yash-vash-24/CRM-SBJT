/**
 * Purpose:
 * Connects directly to the SQLite 'employees' table.
 * Implements CRUD operations for employees and daily shift attendance updates.
 */

const db = require('../config/database');

/**
 * Fetch all employee records
 */
function getAllEmployees() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, user_id, first_name, last_name, designation, phone, email, salary, status, joined_date, attendance_records, createdAt 
             FROM employees 
             ORDER BY id DESC`,
            (err, rows) => {
                if (err) return reject(err);
                
                // Parse attendance records JSON strings into objects
                const formatted = rows.map(row => {
                    let records = {};
                    if (row.attendance_records) {
                        try {
                            records = JSON.parse(row.attendance_records);
                        } catch (e) {
                            records = {};
                        }
                    }
                    return { ...row, attendance_records: records };
                });
                resolve(formatted);
            }
        );
    });
}

/**
 * Fetch single employee record by ID
 */
function getEmployeeById(id) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT id, user_id, first_name, last_name, designation, phone, email, salary, status, joined_date, attendance_records, createdAt 
             FROM employees 
             WHERE id = ?`,
            [id],
            (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);

                let records = {};
                if (row.attendance_records) {
                    try {
                        records = JSON.parse(row.attendance_records);
                    } catch (e) {
                        records = {};
                    }
                }
                resolve({ ...row, attendance_records: records });
            }
        );
    });
}

/**
 * Creates a new employee record
 */
function createEmployee(data) {
    return new Promise((resolve, reject) => {
        const { 
            first_name, last_name, designation, phone, email, salary, status, joined_date 
        } = data;

        if (!first_name || !last_name || !designation) {
            return reject(new Error('First name, last name, and designation are required.'));
        }

        db.run(
            `INSERT INTO employees (
                first_name, last_name, designation, phone, email, salary, status, joined_date, attendance_records
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
            [
                first_name, 
                last_name, 
                designation, 
                phone || null, 
                email || null, 
                salary || 0, 
                status || 'active', 
                joined_date || null
            ],
            function (err) {
                if (err) return reject(err);
                resolve({
                    id: this.lastID,
                    first_name,
                    last_name,
                    designation,
                    phone,
                    email,
                    salary,
                    status: status || 'active',
                    joined_date,
                    attendance_records: {}
                });
            }
        );
    });
}

/**
 * Updates details of an existing employee card
 */
function updateEmployee(id, data) {
    return new Promise((resolve, reject) => {
        const { 
            first_name, last_name, designation, phone, email, salary, status, joined_date 
        } = data;

        if (!first_name || !last_name || !designation) {
            return reject(new Error('First name, last name, and designation are required.'));
        }

        db.run(
            `UPDATE employees 
             SET first_name = ?, last_name = ?, designation = ?, phone = ?, email = ?, salary = ?, status = ?, joined_date = ? 
             WHERE id = ?`,
            [
                first_name, 
                last_name, 
                designation, 
                phone || null, 
                email || null, 
                salary || 0, 
                status || 'active', 
                joined_date || null, 
                id
            ],
            function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('Employee not found.'));
                resolve({ id, first_name, last_name, designation, phone, email, salary, status, joined_date });
            }
        );
    });
}

/**
 * Updates/Saves employee attendance log JSON
 */
function updateAttendance(id, attendanceRecords) {
    return new Promise((resolve, reject) => {
        const serialized = JSON.stringify(attendanceRecords || {});
        db.run(
            `UPDATE employees SET attendance_records = ? WHERE id = ?`,
            [serialized, id],
            function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('Employee not found.'));
                resolve({ id, attendance_records: attendanceRecords });
            }
        );
    });
}

/**
 * Deletes an employee record
 */
function deleteEmployee(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM employees WHERE id = ?`, [id], function (err) {
            if (err) return reject(err);
            if (this.changes === 0) return reject(new Error('Employee not found.'));
            resolve();
        });
    });
}

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    updateAttendance,
    deleteEmployee
};
