/**
 * Purpose:
 * Connects directly to the SQLite 'inventory' and 'stock_logs' tables.
 * Implements CRUD operations for material items and stock movement logging
 * with automatic quantity adjustments.
 */

const db = require('../config/database');

// ---- Promise helpers ----

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
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

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

// ---- Inventory Item CRUD ----

/**
 * Fetch all inventory items with a computed is_low_stock flag
 */
async function getAllItems() {
    const rows = await dbAll(
        `SELECT id, item_name, description, category, unit, quantity, low_stock_threshold, unit_price
         FROM inventory
         ORDER BY id DESC`
    );

    return rows.map(row => ({
        ...row,
        is_low_stock: row.quantity <= row.low_stock_threshold
    }));
}

/**
 * Fetch a single inventory item by ID along with its stock movement logs
 * Returns: { item: {..., is_low_stock}, logs: [...] }
 */
async function getItemById(id) {
    const item = await dbGet(
        `SELECT id, item_name, description, category, unit, quantity, low_stock_threshold, unit_price
         FROM inventory
         WHERE id = ?`,
        [id]
    );

    if (!item) return null;

    const logs = await dbAll(
        `SELECT id, type, quantity, reference_id, logged_at, logged_by_name
         FROM stock_logs
         WHERE item_id = ?
         ORDER BY logged_at DESC`,
        [id]
    );

    return {
        item: {
            ...item,
            is_low_stock: item.quantity <= item.low_stock_threshold
        },
        logs
    };
}

/**
 * Creates a new inventory item
 */
async function createItem(data) {
    const { item_name, description, category, unit, quantity, low_stock_threshold, unit_price } = data;

    if (!item_name || !category || !unit) {
        throw new Error('Item name, category, and unit are required.');
    }

    const qty = parseInt(quantity) || 0;
    const threshold = parseInt(low_stock_threshold) || 5;
    const price = parseFloat(unit_price) || 0;

    const result = await dbRun(
        `INSERT INTO inventory (item_name, description, category, unit, quantity, low_stock_threshold, unit_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item_name, description || null, category, unit, qty, threshold, price]
    );

    return {
        id: result.lastID,
        item_name,
        description: description || null,
        category,
        unit,
        quantity: qty,
        low_stock_threshold: threshold,
        unit_price: price,
        is_low_stock: qty <= threshold
    };
}

/**
 * Updates metadata of an existing inventory item (does NOT change quantity — use stock logs for that)
 */
async function updateItem(id, data) {
    const { item_name, description, category, unit, low_stock_threshold, unit_price } = data;

    if (!item_name || !category || !unit) {
        throw new Error('Item name, category, and unit are required.');
    }

    const threshold = parseInt(low_stock_threshold) || 5;
    const price = parseFloat(unit_price) || 0;

    const result = await dbRun(
        `UPDATE inventory
         SET item_name = ?, description = ?, category = ?, unit = ?, low_stock_threshold = ?, unit_price = ?
         WHERE id = ?`,
        [item_name, description || null, category, unit, threshold, price, id]
    );

    if (result.changes === 0) throw new Error('Inventory item not found.');

    return { id, item_name, description, category, unit, low_stock_threshold: threshold, unit_price: price };
}

/**
 * Deletes an inventory item (stock_logs cascade via FK)
 */
async function deleteItem(id) {
    const result = await dbRun(`DELETE FROM inventory WHERE id = ?`, [id]);
    if (result.changes === 0) throw new Error('Inventory item not found.');
}

// ---- Stock Movement Logging ----

/**
 * Posts a stock movement log (IN or OUT) and adjusts the item quantity accordingly.
 * For OUT movements, validates that sufficient stock is available.
 */
async function postStockLog(itemId, data, loggedByName) {
    const { type, quantity, reference_id } = data;

    if (!type || !['IN', 'OUT'].includes(type)) {
        throw new Error('Type must be either IN or OUT.');
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
        throw new Error('Quantity must be a positive integer.');
    }

    // Fetch current stock level
    const item = await dbGet(`SELECT id, quantity FROM inventory WHERE id = ?`, [itemId]);
    if (!item) throw new Error('Inventory item not found.');

    // Prevent overdrawing stock
    if (type === 'OUT' && item.quantity < qty) {
        throw new Error(`Insufficient stock. Available: ${item.quantity}, Requested: ${qty}`);
    }

    // Calculate new quantity
    const newQuantity = type === 'IN' ? item.quantity + qty : item.quantity - qty;

    // Update inventory quantity
    await dbRun(`UPDATE inventory SET quantity = ? WHERE id = ?`, [newQuantity, itemId]);

    // Insert stock log entry
    const logResult = await dbRun(
        `INSERT INTO stock_logs (item_id, type, quantity, reference_id, logged_by_name)
         VALUES (?, ?, ?, ?, ?)`,
        [itemId, type, qty, reference_id || null, loggedByName || null]
    );

    return {
        id: logResult.lastID,
        item_id: itemId,
        type,
        quantity: qty,
        reference_id: reference_id || null,
        logged_by_name: loggedByName || null,
        new_stock_level: newQuantity
    };
}

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    postStockLog
};
