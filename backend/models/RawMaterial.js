const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    unit_cost: { type: Number, required: true },
    procurement_time: { type: Number, required: true }, // in days
    minimum_threshold: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
