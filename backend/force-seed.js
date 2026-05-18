const mongoose = require('mongoose');
const { bootstrapDB } = require('./seed');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventory_system').then(async () => {
    console.log("Connected. Dropping collections...");
    await mongoose.connection.db.dropDatabase();
    console.log("Seeding...");
    await bootstrapDB();
    console.log("Done.");
    process.exit(0);
}).catch(console.error);
