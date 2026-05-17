const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    selling_price: { type: Number, required: true },
    production_time: { type: Number, required: true }, // in days
    packaging_time: { type: Number, default: 1 }, // in days
    delivery_time: { type: Number, required: true }, // in days
    recipe: [{
        raw_material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial' },
        quantity_required_per_unit: { type: Number, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
