const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Raw Material Check', 'Manufacturing', 'Packaging', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    total_price: { type: Number, required: true },
    estimated_delivery_days: { type: Number, required: true },
    batch_max_days: { type: Number, default: 0 },
    shortage_delay_days: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
