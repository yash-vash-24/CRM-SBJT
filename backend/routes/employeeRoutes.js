/**
 * Purpose:
 * Routes employee management and daily attendance requests to employeeController.
 * Enforces role-based security using verifySession, requireAdmin, and requireAdminOrSupervisor.
 */

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifySession, requireAdmin, requireAdminOrSupervisor } = require('../middleware/auth');

// All employee operations require an active login session
router.use(verifySession);

// GET routes (accessible by Admin and Supervisor)
router.get('/', requireAdminOrSupervisor, employeeController.getEmployees);
router.get('/:id', requireAdminOrSupervisor, employeeController.getEmployee);

// Administrative CRUD operations
router.post('/', requireAdmin, employeeController.addEmployee);
router.put('/:id', requireAdmin, employeeController.updateEmployee);
router.delete('/:id', requireAdmin, employeeController.deleteEmployee);

// Attendance daily logging route (accessible by Admin and Supervisor)
router.patch('/:id/attendance', requireAdminOrSupervisor, employeeController.updateAttendance);

module.exports = router;
