const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    raw_material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    available_quantity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
