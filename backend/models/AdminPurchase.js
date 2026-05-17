const mongoose = require('mongoose');

const adminPurchaseItemSchema = new mongoose.Schema({
    raw_material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true }
});

const adminPurchaseSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    items: [adminPurchaseItemSchema],
    total_cost: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AdminPurchase', adminPurchaseSchema);
