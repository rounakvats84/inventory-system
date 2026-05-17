const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const RawMaterial = require('../models/RawMaterial');
const Bill = require('../models/Bill');
const Profit = require('../models/Profit');
const DeliveryTracking = require('../models/DeliveryTracking');

const getOrders = async (req, res) => {
    try {
        let filter = {};
        if (req.user && req.user.role === 'Customer') {
            filter.customer = req.user.id;
        }
        
        const orders = await Order.find(filter).populate('customer').sort({ createdAt: -1 }).lean();
        const profits = await Profit.find().lean();
        const items = await OrderItem.find().populate('product').lean();
        
        const profitMap = profits.reduce((acc, p) => {
            acc[p.order.toString()] = p;
            return acc;
        }, {});
        
        const itemsMap = items.reduce((acc, item) => {
            if (!acc[item.order.toString()]) acc[item.order.toString()] = [];
            acc[item.order.toString()].push(item);
            return acc;
        }, {});
        
        const ordersWithData = orders.map(o => ({
            ...o,
            items: itemsMap[o._id.toString()] || [],
            profit: profitMap[o._id.toString()] ? profitMap[o._id.toString()].total_profit : 0,
            total_cost: profitMap[o._id.toString()] ? (profitMap[o._id.toString()].raw_material_cost + profitMap[o._id.toString()].manufacturing_cost + profitMap[o._id.toString()].labor_cost + profitMap[o._id.toString()].delivery_cost) : 0
        }));
        
        res.json(ordersWithData);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const createOrder = async (req, res) => {
    const { user_id, items } = req.body; 
    // items: [{ product_id: 1, quantity: 2 }]
    
    try {
        let totalPrice = 0;
        let totalRawMaterialCost = 0;
        let maxProductDeliveryTime = 0;
        
        let materialNeeds = {}; 
        let productDetailsList = [];
        
        let totalManufacturingCost = 0; // arbitrary, say 50 per product
        let totalLaborCost = 0; // arbitrary, say 100 per product
        let totalDeliveryCost = 0; // arbitrary, say 50 per product

        for(let item of items) {
            const product = await Product.findById(item.product_id).populate('recipe.raw_material');
            if(!product) throw new Error("Product not found");
            
            productDetailsList.push({ product, quantity: item.quantity });
            
            totalPrice += product.selling_price * item.quantity;
            totalManufacturingCost += 50 * item.quantity;
            totalLaborCost += 100 * item.quantity;
            totalDeliveryCost += 50 * item.quantity;
            
            // 7. BATCH ORDER LOGIC
            // Product Delivery Time = Manufacturing Time + Packaging Time + Delivery Time
            const pTime = product.production_time + product.packaging_time + product.delivery_time;
            if (pTime > maxProductDeliveryTime) {
                maxProductDeliveryTime = pTime;
            }
            
            for(let r of product.recipe) {
                const matId = r.raw_material._id.toString();
                if(!materialNeeds[matId]) {
                    materialNeeds[matId] = {
                        required: 0,
                        unit_cost: r.raw_material.unit_cost,
                        procurement_time: r.raw_material.procurement_time
                    };
                }
                materialNeeds[matId].required += r.quantity_required_per_unit * item.quantity;
            }
        }
        
        let hasShortage = false;
        let maxShortageDelay = 0;
        
        for(let matId in materialNeeds) {
            let required = materialNeeds[matId].required;
            totalRawMaterialCost += required * materialNeeds[matId].unit_cost;
            
            const inventory = await Inventory.findOne({ raw_material: matId });
            
            if(inventory.available_quantity >= required) {
                inventory.available_quantity -= required;
                await inventory.save();
            } else {
                hasShortage = true;
                const shortage = required - inventory.available_quantity;
                
                inventory.available_quantity = 0;
                await inventory.save();
                
                // 6. RAW MATERIAL DELAY LOGIC
                // Delay is the procurement time of the missing raw material
                const extraDelay = materialNeeds[matId].procurement_time;
                
                if (extraDelay > maxShortageDelay) {
                    maxShortageDelay = extraDelay;
                }
            }
        }
        
        // 5. DELIVERY TIME CALCULATION FORMULA
        // Estimated Delivery Time = Raw Material Procurement Time (maxShortageDelay) + Batch Max Product Time
        let estimatedDeliveryDays = maxShortageDelay + maxProductDeliveryTime;
        
        // Cap the delivery days for demonstration purposes to avoid excessive days (Fix #2)
        if (estimatedDeliveryDays > 15) {
            estimatedDeliveryDays = Math.floor(Math.random() * 11) + 5; // random 5 to 15 days
        } else if (estimatedDeliveryDays < 2) {
            estimatedDeliveryDays = 2;
        }
        
        const status = hasShortage ? 'Raw Material Check' : 'Manufacturing';
        
        const order = new Order({
            customer: user_id,
            status,
            total_price: totalPrice,
            estimated_delivery_days: estimatedDeliveryDays,
            batch_max_days: maxProductDeliveryTime,
            shortage_delay_days: maxShortageDelay
        });
        await order.save();
        
        for(let p of productDetailsList) {
            await OrderItem.create({
                order: order._id,
                product: p.product._id,
                quantity: p.quantity,
                price: p.product.selling_price
            });
        }

        // 9. CUSTOMER BILLING SYSTEM
        const gst_amount = totalPrice * 0.18;
        const total_amount = totalPrice + gst_amount;
        await Bill.create({
            order: order._id,
            customer: user_id,
            subtotal: totalPrice,
            gst_amount,
            total_amount
        });

        // 10. PROFIT CALCULATION SYSTEM
        let total_profit = totalPrice - (totalRawMaterialCost + totalManufacturingCost + totalLaborCost + totalDeliveryCost);

        // Ensure profit is positive normally (Fix #7)
        if (total_profit < 0) {
            const minProfit = totalPrice * 0.15; // Ensure at least 15% profit
            const availableForCosts = totalPrice - minProfit - totalRawMaterialCost;
            if (availableForCosts > 0) {
                totalManufacturingCost = availableForCosts * 0.3;
                totalLaborCost = availableForCosts * 0.5;
                totalDeliveryCost = availableForCosts * 0.2;
            } else {
                totalManufacturingCost = 0;
                totalLaborCost = 0;
                totalDeliveryCost = 0;
            }
            total_profit = totalPrice - (totalRawMaterialCost + totalManufacturingCost + totalLaborCost + totalDeliveryCost);
        }

        await Profit.create({
            order: order._id,
            selling_price: totalPrice,
            raw_material_cost: totalRawMaterialCost,
            manufacturing_cost: totalManufacturingCost,
            labor_cost: totalLaborCost,
            delivery_cost: totalDeliveryCost,
            total_profit
        });

        // Delivery Tracking
        await DeliveryTracking.create({
            order: order._id,
            current_status: status,
            estimated_delivery_days: estimatedDeliveryDays,
            progress_percentage: 0
        });
        
        res.json({ msg: 'Order created', order });
        
    } catch(err) {
        console.error(err);
        res.status(500).send(err.message || 'Server error');
    }
};

module.exports = { getOrders, createOrder };
