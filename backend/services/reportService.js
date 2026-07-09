/**
 * Purpose:
 * Runs SQL queries on SQLite to generate aggregated metrics for the Overview Dashboard.
 */

const db = require('../config/database');

/**
 * Generates all dashboard stats
 */
function getDashboardStats() {
    return new Promise((resolve, reject) => {
        const stats = {
            projects: { total: 0, active: 0, completed: 0, planning: 0 },
            finances: { total_revenue: 0, collected: 0, pending: 0 },
            inventory: { low_stock_count: 0, categories: [] },
            tenders: { total: 0, total_value: 0, awarded: 0, total_emd: 0 },
            activities: [],
            charts: { budgets: [] }
        };

        // Query 1: Projects count breakdown
        db.all(
            `SELECT status, COUNT(*) AS cnt FROM projects GROUP BY status`,
            [],
            (err, projectRows) => {
                if (err) return reject(err);
                
                projectRows.forEach(row => {
                    stats.projects.total += row.cnt;
                    if (row.status === 'active') stats.projects.active = row.cnt;
                    else if (row.status === 'completed') stats.projects.completed = row.cnt;
                    else if (row.status === 'planning') stats.projects.planning = row.cnt;
                });

                // Query 2: Finances from invoices
                db.all(
                    `SELECT status, SUM(amount) AS total_amt FROM invoices WHERE status != 'cancelled' GROUP BY status`,
                    [],
                    (err, financeRows) => {
                        if (err) return reject(err);

                        financeRows.forEach(row => {
                            stats.finances.total_revenue += row.total_amt;
                            if (row.status === 'paid') stats.finances.collected = row.total_amt;
                            else if (row.status === 'pending') stats.finances.pending = row.total_amt;
                        });

                        // Query 3: Low stock count
                        db.get(
                            `SELECT COUNT(*) AS cnt FROM inventory WHERE quantity <= low_stock_threshold`,
                            [],
                            (err, lowStockRow) => {
                                if (err) return reject(err);
                                stats.inventory.low_stock_count = lowStockRow.cnt || 0;

                                // Query 4: Inventory category aggregations
                                db.all(
                                    `SELECT category, COUNT(*) AS items_count, SUM(quantity) AS total_quantity 
                                     FROM inventory 
                                     GROUP BY category`,
                                    [],
                                    (err, categoryRows) => {
                                        if (err) return reject(err);
                                        stats.inventory.categories = categoryRows.map(row => ({
                                            category: row.category,
                                            items_count: String(row.items_count),
                                            total_quantity: String(row.total_quantity)
                                        }));

                                        // Query 5: Tenders aggregation
                                        db.all(
                                            `SELECT status, COUNT(*) AS cnt, SUM(value) AS total_val, SUM(emd_value) AS total_emd_val 
                                             FROM tenders 
                                             GROUP BY status`,
                                            [],
                                            (err, tenderRows) => {
                                                if (err) return reject(err);

                                                tenderRows.forEach(row => {
                                                    stats.tenders.total += row.cnt;
                                                    stats.tenders.total_value += row.total_val || 0;
                                                    stats.tenders.total_emd += row.emd_val || 0;
                                                    if (row.status === 'awarded') stats.tenders.awarded = row.cnt;
                                                });

                                                // Query 6: Project budgets list for charts
                                                db.all(
                                                    `SELECT name, budget FROM projects ORDER BY budget DESC LIMIT 6`,
                                                    [],
                                                    (err, chartRows) => {
                                                        if (err) return reject(err);
                                                        stats.charts.budgets = chartRows.map(row => ({
                                                            name: row.name,
                                                            budget: String(row.budget)
                                                        }));

                                                        // Query 7: Combine dynamic activities
                                                        // Get recent projects
                                                        db.all(
                                                            `SELECT 'New project created: ' || name AS description, createdAt AS logged_at 
                                                             FROM projects 
                                                             ORDER BY id DESC LIMIT 3`,
                                                            [],
                                                            (err, recentProjs) => {
                                                                if (err) return reject(err);

                                                                // Get recent invoices
                                                                db.all(
                                                                    `SELECT 'Invoice generated: ' || invoice_number AS description, createdAt AS logged_at 
                                                                     FROM invoices 
                                                                     ORDER BY id DESC LIMIT 3`,
                                                                    [],
                                                                    (err, recentInvs) => {
                                                                        if (err) return reject(err);

                                                                        const combined = [...recentProjs, ...recentInvs];
                                                                        combined.sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at));
                                                                        stats.activities = combined.slice(0, 5);

                                                                        resolve(stats);
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
}

module.exports = {
    getDashboardStats
};
