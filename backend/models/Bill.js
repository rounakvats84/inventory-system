const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    subtotal: { type: Number, required: true },
    gst_amount: { type: Number, required: true },
    total_amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
