const mongoose = require('mongoose');

const profitSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    selling_price: { type: Number, required: true },
    raw_material_cost: { type: Number, required: true },
    manufacturing_cost: { type: Number, required: true },
    labor_cost: { type: Number, required: true },
    delivery_cost: { type: Number, required: true },
    total_profit: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Profit', profitSchema);
