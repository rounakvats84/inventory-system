const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const RawMaterial = require('./models/RawMaterial');
const Inventory = require('./models/Inventory');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Admin = require('./models/Admin');

const bootstrapDB = async () => {
    try {
        const rmCount = await RawMaterial.countDocuments();
        if (rmCount < 10) {
            console.log("Seeding comprehensive MongoDB data...");
            // Drop existing to prevent mixing if there's partial data
            await RawMaterial.deleteMany({});
            await Inventory.deleteMany({});
            await Product.deleteMany({});
            
            await seedSampleData();
        } else {
            console.log("MongoDB already seeded with comprehensive data.");
        }
    } catch (err) {
        console.error("Error bootstrapping DB:", err);
    }
};

const seedSampleData = async () => {
    // 1. Seed 25 Raw Materials
    const materialsData = [
        { name: 'Copper', unit_cost: 2, procurement_time: 3, minimum_threshold: 1000 },
        { name: 'Iron', unit_cost: 0.5, procurement_time: 1, minimum_threshold: 2000 },
        { name: 'Aluminum', unit_cost: 1.5, procurement_time: 2, minimum_threshold: 1500 },
        { name: 'Steel', unit_cost: 1, procurement_time: 2, minimum_threshold: 2000 },
        { name: 'Zinc', unit_cost: 0.8, procurement_time: 4, minimum_threshold: 800 },
        { name: 'Plastic', unit_cost: 0.2, procurement_time: 1, minimum_threshold: 5000 },
        { name: 'Carbon Fiber', unit_cost: 5, procurement_time: 5, minimum_threshold: 500 },
        { name: 'Ferrous Metal', unit_cost: 0.6, procurement_time: 2, minimum_threshold: 1000 },
        { name: 'Alloy Material', unit_cost: 3, procurement_time: 3, minimum_threshold: 1000 },
        { name: 'Nickel', unit_cost: 4, procurement_time: 4, minimum_threshold: 400 },
        { name: 'Lead', unit_cost: 0.5, procurement_time: 2, minimum_threshold: 800 },
        { name: 'Tin', unit_cost: 1.2, procurement_time: 2, minimum_threshold: 600 },
        { name: 'Titanium', unit_cost: 10, procurement_time: 7, minimum_threshold: 100 },
        { name: 'Brass', unit_cost: 2.5, procurement_time: 3, minimum_threshold: 1000 },
        { name: 'Bronze', unit_cost: 2.2, procurement_time: 3, minimum_threshold: 1000 },
        { name: 'Rubber', unit_cost: 0.3, procurement_time: 1, minimum_threshold: 3000 },
        { name: 'Silicone', unit_cost: 1.8, procurement_time: 2, minimum_threshold: 1500 },
        { name: 'Glass', unit_cost: 0.4, procurement_time: 2, minimum_threshold: 2000 },
        { name: 'Fiberglass', unit_cost: 1.5, procurement_time: 3, minimum_threshold: 1000 },
        { name: 'Ceramic', unit_cost: 0.8, procurement_time: 2, minimum_threshold: 1000 },
        { name: 'Nylon', unit_cost: 0.6, procurement_time: 1, minimum_threshold: 2000 },
        { name: 'Teflon', unit_cost: 3.5, procurement_time: 3, minimum_threshold: 500 },
        { name: 'Cobalt', unit_cost: 8, procurement_time: 5, minimum_threshold: 200 },
        { name: 'Lithium', unit_cost: 12, procurement_time: 6, minimum_threshold: 300 },
        { name: 'Silver Contact', unit_cost: 50, procurement_time: 4, minimum_threshold: 50 }
    ];

    const rawMaterials = {};
    for (let md of materialsData) {
        const doc = await RawMaterial.create(md);
        rawMaterials[md.name] = doc;
        
        // 2. Seed Inventory
        // Simulate some low stocks for shortage demonstration
        let qty = md.minimum_threshold * 2;
        if (['Copper', 'Ferrous Metal', 'Titanium'].includes(md.name)) {
            qty = md.minimum_threshold / 2; // Low stock
        }
        await Inventory.create({ raw_material: doc._id, available_quantity: qty });
    }

    // 3. Seed 10 Final Products
    const productsData = [
        {
            name: 'Copper Wire', selling_price: 6000, production_time: 1, packaging_time: 1, delivery_time: 1,
            recipe: [
                { raw_material: rawMaterials['Copper']._id, quantity_required_per_unit: 50 },
                { raw_material: rawMaterials['Ferrous Metal']._id, quantity_required_per_unit: 20 },
                { raw_material: rawMaterials['Plastic']._id, quantity_required_per_unit: 10 }
            ]
        },
        {
            name: 'Iron Gate', selling_price: 15000, production_time: 3, packaging_time: 1, delivery_time: 2,
            recipe: [
                { raw_material: rawMaterials['Iron']._id, quantity_required_per_unit: 5000 },
                { raw_material: rawMaterials['Steel']._id, quantity_required_per_unit: 1000 },
                { raw_material: rawMaterials['Zinc']._id, quantity_required_per_unit: 200 }
            ]
        },
        {
            name: 'Steel Rod', selling_price: 2500, production_time: 1, packaging_time: 1, delivery_time: 1,
            recipe: [
                { raw_material: rawMaterials['Steel']._id, quantity_required_per_unit: 1000 },
                { raw_material: rawMaterials['Carbon Fiber']._id, quantity_required_per_unit: 50 }
            ]
        },
        {
            name: 'Aluminum Pipe', selling_price: 3500, production_time: 2, packaging_time: 1, delivery_time: 1,
            recipe: [
                { raw_material: rawMaterials['Aluminum']._id, quantity_required_per_unit: 800 },
                { raw_material: rawMaterials['Zinc']._id, quantity_required_per_unit: 100 }
            ]
        },
        {
            name: 'Metal Sheet', selling_price: 4500, production_time: 2, packaging_time: 1, delivery_time: 1,
            recipe: [
                { raw_material: rawMaterials['Alloy Material']._id, quantity_required_per_unit: 1500 },
                { raw_material: rawMaterials['Iron']._id, quantity_required_per_unit: 500 }
            ]
        },
        {
            name: 'Electrical Cable', selling_price: 8000, production_time: 2, packaging_time: 1, delivery_time: 1,
            recipe: [
                { raw_material: rawMaterials['Copper']._id, quantity_required_per_unit: 200 },
                { raw_material: rawMaterials['Rubber']._id, quantity_required_per_unit: 150 },
                { raw_material: rawMaterials['Silicone']._id, quantity_required_per_unit: 50 }
            ]
        },
        {
            name: 'Industrial Bolt', selling_price: 500, production_time: 1, packaging_time: 1, delivery_time: 1,
            recipe: [
                { raw_material: rawMaterials['Titanium']._id, quantity_required_per_unit: 20 },
                { raw_material: rawMaterials['Steel']._id, quantity_required_per_unit: 80 }
            ]
        },
        {
            name: 'Iron Frame', selling_price: 12000, production_time: 2, packaging_time: 1, delivery_time: 2,
            recipe: [
                { raw_material: rawMaterials['Iron']._id, quantity_required_per_unit: 3000 },
                { raw_material: rawMaterials['Brass']._id, quantity_required_per_unit: 200 }
            ]
        },
        {
            name: 'Steel Panel', selling_price: 9000, production_time: 2, packaging_time: 1, delivery_time: 2,
            recipe: [
                { raw_material: rawMaterials['Steel']._id, quantity_required_per_unit: 2000 },
                { raw_material: rawMaterials['Lead']._id, quantity_required_per_unit: 100 }
            ]
        },
        {
            name: 'Copper Coil', selling_price: 11000, production_time: 3, packaging_time: 1, delivery_time: 1,
            recipe: [
                { raw_material: rawMaterials['Copper']._id, quantity_required_per_unit: 400 },
                { raw_material: rawMaterials['Silver Contact']._id, quantity_required_per_unit: 5 }
            ]
        }
    ];

    for (let pd of productsData) {
        await Product.create(pd);
    }

    // 4. Seed Admin
    const adminExists = await Admin.findOne({ email: 'admin@company.com' });
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedAdminPassword = await bcrypt.hash('admin123', salt);
        await Admin.create({ name: 'Admin User', email: 'admin@company.com', password: hashedAdminPassword });
    }

    console.log("Sample data seeded successfully!");
};

module.exports = { bootstrapDB };
