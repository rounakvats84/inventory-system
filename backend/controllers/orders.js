const { pool } = require('../config/db');

const getOrders = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const createOrder = async (req, res) => {
    const { user_id, items } = req.body; 
    // items: [{ product_id: 1, quantity: 2 }]
    
    const conn = await pool.getConnection();
    
    try {
        await conn.beginTransaction();
        
        let totalCost = 0;
        let totalPrice = 0;
        let maxWaitTime = 0;
        let maxProductionTimeTotal = 0;
        let maxDeliveryTime = 0;
        
        let materialNeeds = {}; 
        
        for(let item of items) {
            const [prodRes] = await conn.execute('SELECT * FROM products WHERE id = ?', [item.product_id]);
            if(prodRes.length === 0) throw new Error("Product not found");
            const product = prodRes[0];
            
            totalPrice += product.selling_price * item.quantity;
            
            let prodTimeTotal = product.production_time * item.quantity;
            if(prodTimeTotal > maxProductionTimeTotal) maxProductionTimeTotal = prodTimeTotal;
            if(product.delivery_time > maxDeliveryTime) maxDeliveryTime = product.delivery_time;
            
            const [recipeRes] = await conn.execute('SELECT * FROM product_recipes WHERE product_id = ?', [product.id]);
            for(let r of recipeRes) {
                if(!materialNeeds[r.raw_material_id]) materialNeeds[r.raw_material_id] = 0;
                materialNeeds[r.raw_material_id] += r.quantity_required_per_unit * item.quantity;
            }
        }
        
        let hasShortage = false;
        
        for(let matId in materialNeeds) {
            let required = materialNeeds[matId];
            
            const [matRes] = await conn.execute('SELECT * FROM raw_materials WHERE id = ? FOR UPDATE', [matId]);
            const material = matRes[0];
            
            totalCost += required * material.unit_cost;
            
            if(material.available_quantity >= required) {
                await conn.execute('UPDATE raw_materials SET available_quantity = available_quantity - ? WHERE id = ?', [required, matId]);
            } else {
                hasShortage = true;
                const shortage = required - material.available_quantity;
                
                if (material.available_quantity > 0) {
                     await conn.execute('UPDATE raw_materials SET available_quantity = 0 WHERE id = ?', [matId]);
                }
                
                if(material.procurement_time > maxWaitTime) {
                    maxWaitTime = material.procurement_time;
                }
            }
        }
        
        const profit = totalPrice - totalCost;
        const status = hasShortage ? 'WAITING_FOR_MATERIAL' : 'IN_PRODUCTION';
        
        const estimatedTime = maxWaitTime + maxProductionTimeTotal + maxDeliveryTime;
        
        const [orderInsertRes] = await conn.execute(`
            INSERT INTO orders (user_id, total_price, total_cost, profit, estimated_time, estimated_wait_time, estimated_completion_time, status)
            VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY), ?)
        `, [user_id, totalPrice, totalCost, profit, estimatedTime, maxWaitTime, estimatedTime, status]);
        
        const orderId = orderInsertRes.insertId;
        
        for(let item of items) {
            await conn.execute('INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)', [orderId, item.product_id, item.quantity]);
        }
        
        await conn.commit();
        
        const [insertedOrderRows] = await conn.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        
        res.json({ msg: 'Order created', order: insertedOrderRows[0] });
        
    } catch(err) {
        await conn.rollback();
        console.error(err);
        res.status(500).send(err.message || 'Server error');
    } finally {
        conn.release();
    }
};

module.exports = { getOrders, createOrder };
