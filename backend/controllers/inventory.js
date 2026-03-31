const { pool } = require('../config/db');

const getInventory = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM raw_materials ORDER BY id');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateInventory = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        // expect body: { items: [ { id: 1, available_quantity: 150 }, ... ] }
        const { items } = req.body;
        
        await conn.beginTransaction();
        for (let item of items) {
            await conn.execute(
                'UPDATE raw_materials SET available_quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
                [item.available_quantity, item.id]
            );
        }
        await conn.commit();
        
        res.json({ msg: 'Inventory updated successfully' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        conn.release();
    }
};

module.exports = { getInventory, updateInventory };
