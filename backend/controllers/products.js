const { pool } = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT p.*, 
                   json_agg(json_build_object('material_id', r.raw_material_id, 'name', rm.name, 'qty', r.quantity_required_per_unit)) as recipe
            FROM products p
            LEFT JOIN product_recipes r ON p.id = r.product_id
            LEFT JOIN raw_materials rm ON r.raw_material_id = rm.id
            GROUP BY p.id
            ORDER BY p.id
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getProducts };
