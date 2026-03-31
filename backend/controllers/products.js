const { pool } = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.id, p.name, p.selling_price, p.production_time, p.delivery_time,
                   r.raw_material_id as material_id, rm.name as material_name, r.quantity_required_per_unit as qty
            FROM products p
            LEFT JOIN product_recipes r ON p.id = r.product_id
            LEFT JOIN raw_materials rm ON r.raw_material_id = rm.id
            ORDER BY p.id
        `);
        
        const productsMap = {};
        for (let row of rows) {
            if (!productsMap[row.id]) {
                productsMap[row.id] = {
                    id: row.id,
                    name: row.name,
                    selling_price: row.selling_price,
                    production_time: row.production_time,
                    delivery_time: row.delivery_time,
                    recipe: []
                };
            }
            if (row.material_id) {
                productsMap[row.id].recipe.push({
                    material_id: row.material_id,
                    name: row.material_name,
                    qty: row.qty
                });
            }
        }
        res.json(Object.values(productsMap));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getProducts };
