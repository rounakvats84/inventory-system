const Inventory = require('../models/Inventory');

const getInventory = async (req, res) => {
    try {
        const inventories = await Inventory.find().populate('raw_material');
        // Map to return old format { id: inventory_id or raw_material_id, name, available_quantity, unit_cost, etc }
        const formatted = inventories.map(inv => ({
            id: inv.raw_material._id,
            inventory_id: inv._id,
            name: inv.raw_material.name,
            available_quantity: inv.available_quantity,
            unit_cost: inv.raw_material.unit_cost,
            procurement_time: inv.raw_material.procurement_time,
            minimum_threshold: inv.raw_material.minimum_threshold
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateInventory = async (req, res) => {
    try {
        const { items } = req.body;
        for (let item of items) {
            await Inventory.findOneAndUpdate(
                { raw_material: item.id },
                { available_quantity: item.available_quantity }
            );
        }
        res.json({ msg: 'Inventory updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const AdminPurchase = require('../models/AdminPurchase');

const createPurchase = async (req, res) => {
    try {
        const { items, total_cost } = req.body;
        const purchase = new AdminPurchase({
            admin: req.user.id,
            items,
            total_cost
        });
        await purchase.save();

        for (let item of items) {
            await Inventory.findOneAndUpdate(
                { raw_material: item.raw_material },
                { $inc: { available_quantity: item.quantity } }
            );
        }

        res.json({ msg: 'Purchase successful', purchase });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const getPurchases = async (req, res) => {
    try {
        const purchases = await AdminPurchase.find().populate('items.raw_material').populate('admin').sort({ createdAt: -1 });
        res.json(purchases);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getInventory, updateInventory, createPurchase, getPurchases };
