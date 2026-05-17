const mongoose = require('mongoose');

const connectDB = async () => {
    let retries = 5;
    while (retries > 0) {
        try {
            const conn = await mongoose.connect('mongodb://127.0.0.1:27017/inventory_system', {
                serverSelectionTimeoutMS: 3000 // 3 seconds timeout
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
            console.log(`Retrying to connect... (${retries} attempts left). Please ensure MongoDB is running on your machine.`);
            retries -= 1;
            await new Promise(res => setTimeout(res, 3000));
        }
    }
    console.error("Could not connect to MongoDB after multiple attempts. Make sure MongoDB service is running locally on port 27017.");
    process.exit(1);
};

module.exports = connectDB;
