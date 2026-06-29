/**
 * Purpose:
 * This controller serves operations statistics for the Executive Dashboard.
 * It is currently IN PROGRESS (approx. 65% complete).
 *
 * How requests flow:
 * 1. Client app makes a request to GET /api/dashboard/stats.
 * 2. Express triggers getStats(req, res) in this controller.
 * 3. The controller currently returns mock data and lists SQL aggregates as TODOs.
 *
 * Why each function exists:
 * - getStats: Returns dashboard analytics counts, outstanding invoice totals, and monthly expenditure charts.
 */

const db = require('../config/database');

/**
 * Returns summary stats for the dashboard - IN PROGRESS
 */
async function getStats(req, res) {
    // TODO: Replace these mock statistics with real database aggregations:
    // 1. SELECT COUNT(*) FROM users WHERE role = 'client'
    // 2. SELECT COUNT(*) FROM projects WHERE status = 'in_progress'
    // 3. SELECT SUM(budget) FROM invoices WHERE status = 'unpaid'
    // Currently, we return mock statistics for the executive dashboard UI.

    return res.status(200).json({
        message: 'Returning mock dashboard stats. [TODO: Write SQL aggregation queries].',
        status: 'in_progress',
        stats: {
            totalClients: 12,        // TODO: COUNT(users) where role = 'client'
            activeProjects: 5,       // TODO: COUNT(projects) where status = 'in_progress'
            pendingTenders: 3,       // TODO: COUNT(tenders) where status = 'open'
            outstandingInvoices: 450000, // TODO: SUM(amount) where status = 'unpaid'
            expenditureData: [       // TODO: Query monthly accounts ledger
                { month: 'Jan', amount: 80000 },
                { month: 'Feb', amount: 120000 },
                { month: 'Mar', amount: 95000 },
                { month: 'Apr', amount: 140000 },
                { month: 'May', amount: 160000 },
                { month: 'Jun', amount: 110000 }
            ]
        }
    });
}

module.exports = {
    getStats
};
