const Product = require('../models/Product');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('recipe.raw_material');
        
        // Transform to match the old format somewhat, or just return as is
        // Old format: array of { id, name, selling_price, production_time, delivery_time, recipe: [{ material_id, name, qty }] }
        const formattedProducts = products.map(p => ({
            id: p._id,
            name: p.name,
            selling_price: p.selling_price,
            production_time: p.production_time,
            packaging_time: p.packaging_time,
            delivery_time: p.delivery_time,
            recipe: p.recipe.map(r => ({
                material_id: r.raw_material ? r.raw_material._id : null,
                name: r.raw_material ? r.raw_material.name : 'Unknown',
                qty: r.quantity_required_per_unit
            }))
        }));
        
        res.json(formattedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getProducts };
