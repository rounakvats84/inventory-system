const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

// Ensure the data directory exists
const dbPath = path.join(__dirname, 'mongodb-data');
if (!fs.existsSync(dbPath)){
    fs.mkdirSync(dbPath);
}

(async () => {
    try {
        console.log("Starting local MongoDB instance...");
        const mongod = await MongoMemoryServer.create({
            instance: {
                port: 27017,
                dbPath: dbPath,
                storageEngine: 'wiredTiger'
            }
        });

        const uri = mongod.getUri();
        console.log(`\n========================================`);
        console.log(`✅ MongoDB successfully started locally!`);
        console.log(`📡 URI: ${uri}`);
        console.log(`💾 Data saved to: ${dbPath}`);
        console.log(`========================================\n`);
        console.log(`Do not close this terminal. Press Ctrl+C to stop the database.\n`);

    } catch (error) {
        if (error.message.includes('EADDRINUSE')) {
            console.error("❌ Port 27017 is already in use. MongoDB might already be running.");
        } else {
            console.error("❌ Failed to start MongoDB:", error);
        }
    }
})();
