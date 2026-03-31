const { pool } = require('../config/db');

const getInventory = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM raw_materials ORDER BY id');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateInventory = async (req, res) => {
    try {
        // expect body: { items: [ { id: 1, available_quantity: 150 }, ... ] }
        const { items } = req.body;
        
        await pool.query('BEGIN');
        for (let item of items) {
            await pool.query(
                'UPDATE raw_materials SET available_quantity = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2',
                [item.available_quantity, item.id]
            );
        }
        await pool.query('COMMIT');
        
        res.json({ msg: 'Inventory updated successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getInventory, updateInventory };
