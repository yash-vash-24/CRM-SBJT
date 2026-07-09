/**
 * Purpose:
 * Intercepts HTTP requests for executive dashboard reports,
 * invokes reportService, and returns structured analytics metrics in JSON.
 */

const reportService = require('../services/reportService');

/**
 * GET /api/reports/dashboard - Retrieves overview analytics stats (Admin/Supervisor only)
 */
async function getDashboardStats(req, res) {
    try {
        const stats = await reportService.getDashboardStats();
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getDashboardStats
};
