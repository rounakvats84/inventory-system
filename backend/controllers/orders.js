const { pool } = require('../config/db');

const getOrders = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const createOrder = async (req, res) => {
    const { user_id, items } = req.body; 
    // items: [{ product_id: 1, quantity: 2 }]
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        let totalCost = 0;
        let totalPrice = 0;
        let maxWaitTime = 0;
        let maxProductionTimeTotal = 0;
        let maxDeliveryTime = 0;
        
        let materialNeeds = {}; 
        
        for(let item of items) {
            const prodRes = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
            if(prodRes.rows.length === 0) throw new Error("Product not found");
            const product = prodRes.rows[0];
            
            totalPrice += product.selling_price * item.quantity;
            
            let prodTimeTotal = product.production_time * item.quantity;
            if(prodTimeTotal > maxProductionTimeTotal) maxProductionTimeTotal = prodTimeTotal;
            if(product.delivery_time > maxDeliveryTime) maxDeliveryTime = product.delivery_time;
            
            const recipeRes = await client.query('SELECT * FROM product_recipes WHERE product_id = $1', [product.id]);
            for(let r of recipeRes.rows) {
                if(!materialNeeds[r.raw_material_id]) materialNeeds[r.raw_material_id] = 0;
                materialNeeds[r.raw_material_id] += r.quantity_required_per_unit * item.quantity;
            }
        }
        
        let hasShortage = false;
        
        for(let matId in materialNeeds) {
            let required = materialNeeds[matId];
            
            const matRes = await client.query('SELECT * FROM raw_materials WHERE id = $1 FOR UPDATE', [matId]);
            const material = matRes.rows[0];
            
            totalCost += required * material.unit_cost;
            
            if(material.available_quantity >= required) {
                await client.query('UPDATE raw_materials SET available_quantity = available_quantity - $1 WHERE id = $2', [required, matId]);
            } else {
                hasShortage = true;
                const shortage = required - material.available_quantity;
                
                if (material.available_quantity > 0) {
                     await client.query('UPDATE raw_materials SET available_quantity = 0 WHERE id = $1', [matId]);
                }
                
                if(material.procurement_time > maxWaitTime) {
                    maxWaitTime = material.procurement_time;
                }
            }
        }
        
        const profit = totalPrice - totalCost;
        const status = hasShortage ? 'WAITING_FOR_MATERIAL' : 'IN_PRODUCTION';
        
        const estimatedTime = maxWaitTime + maxProductionTimeTotal + maxDeliveryTime;
        
        const orderRes = await client.query(`
            INSERT INTO orders (user_id, total_price, total_cost, profit, estimated_time, estimated_wait_time, estimated_completion_time, status)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP + (CAST($5 AS INTEGER) * INTERVAL '1 day'), $7)
            RETURNING *
        `, [user_id, totalPrice, totalCost, profit, estimatedTime, maxWaitTime, status]);
        
        const orderId = orderRes.rows[0].id;
        
        for(let item of items) {
            await client.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)', [orderId, item.product_id, item.quantity]);
        }
        
        await client.query('COMMIT');
        
        res.json({ msg: 'Order created', order: orderRes.rows[0] });
        
    } catch(err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send(err.message || 'Server error');
    } finally {
        client.release();
    }
};

module.exports = { getOrders, createOrder };
