const mongoose = require('mongoose');

const deliveryTrackingSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    current_status: { type: String, required: true },
    estimated_delivery_days: { type: Number, required: true },
    progress_percentage: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);
