/**
 * Purpose:
 * Intercepts HTTP requests for HR Employees ledger and daily site attendance,
 * checks parameter bounds, invokes employeeService functions, and returns standard JSON.
 */

const employeeService = require('../services/employeeService');

/**
 * GET /api/employees - Retrieves all employee cards
 */
async function getEmployees(req, res) {
    try {
        const employees = await employeeService.getAllEmployees();
        return res.status(200).json(employees);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * GET /api/employees/:id - Retrieves details of a specific employee
 */
async function getEmployee(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Employee ID.' });
    }

    try {
        const employee = await employeeService.getEmployeeById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        return res.status(200).json(employee);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * POST /api/employees - Adds a new employee card (Admin only)
 */
async function addEmployee(req, res) {
    try {
        const employee = await employeeService.createEmployee(req.body);
        return res.status(201).json({
            message: 'Employee record created successfully.',
            employee
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

/**
 * PUT /api/employees/:id - Modifies an existing employee (Admin only)
 */
async function updateEmployee(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Employee ID.' });
    }

    try {
        const employee = await employeeService.updateEmployee(id, req.body);
        return res.status(200).json({
            message: 'Employee record updated successfully.',
            employee
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * PATCH /api/employees/:id/attendance - Saves daily shift attendance records (Admin / Supervisor)
 */
async function updateAttendance(req, res) {
    const id = parseInt(req.params.id);
    const { attendance_records } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Employee ID.' });
    }
    if (!attendance_records) {
        return res.status(400).json({ message: 'Attendance records are required.' });
    }

    try {
        const result = await employeeService.updateAttendance(id, attendance_records);
        return res.status(200).json({
            message: 'Attendance saved successfully.',
            result
        });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
}

/**
 * DELETE /api/employees/:id - Permanently deletes an employee record (Admin only)
 */
async function deleteEmployee(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Validation failed: Invalid Employee ID.' });
    }

    try {
        await employeeService.deleteEmployee(id);
        return res.status(200).json({ message: 'Employee record deleted successfully.' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getEmployees,
    getEmployee,
    addEmployee,
    updateEmployee,
    updateAttendance,
    deleteEmployee
};
