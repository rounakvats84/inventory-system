const mongoose = require('mongoose');
const { Pool } = require('pg');

const mongoUri = 'mongodb://127.0.0.1:27017/inventory_db';
const pgUri = 'postgres://postgres:password@127.0.0.1:5432/inventory_db';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

const pool = new Pool({
    connectionString: pgUri,
});

pool.on('connect', () => {
    // console.log('PostgreSQL connected successfully.');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = { connectDB, pool };
