const { pool } = require('./config/db');

const bootstrapDB = async () => {
    try {
        const createTablesQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'Customer'
            );

            CREATE TABLE IF NOT EXISTS raw_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                available_quantity INT NOT NULL DEFAULT 0,
                unit_cost DECIMAL(10,2) NOT NULL,
                procurement_time INT NOT NULL,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                minimum_threshold INT DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                selling_price DECIMAL(10,2) NOT NULL,
                production_time INT NOT NULL,
                delivery_time INT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS product_recipes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT,
                raw_material_id INT,
                quantity_required_per_unit INT NOT NULL,
                UNIQUE(product_id, raw_material_id),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                total_cost DECIMAL(10,2) NOT NULL,
                profit DECIMAL(10,2) NOT NULL,
                estimated_time INT NOT NULL,
                estimated_wait_time INT NOT NULL DEFAULT 0,
                estimated_completion_time TIMESTAMP NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                product_id INT,
                quantity INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            );
        `;
        
        // MySQL driver doesn't natively support executing multiple statements by default
        // unless multipleStatements: true is set, but it's safer to just split them.
        const queries = createTablesQuery.split(';').map(q => q.trim()).filter(q => q !== '');
        for (let q of queries) {
            await pool.query(q);
        }
        console.log("MySQL tables checked/created.");

        // Check if data exists
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM raw_materials');
        if (parseInt(rows[0].count) === 0) {
            console.log("Seeding sample data...");
            await seedSampleData();
        }

    } catch (err) {
        console.error("Error bootstrapping DB:", err);
    }
};

const seedSampleData = async () => {
    const rmData = [
        ['Steel Rod', 100, 50, 2, 10],
        ['Iron Sheet', 200, 30, 1, 20],
        ['Copper Wire', 50, 80, 3, 5]
    ];
    
    const rmMap = {};
    for (const rm of rmData) {
        const [result] = await pool.execute(
            'INSERT INTO raw_materials (name, available_quantity, unit_cost, procurement_time, minimum_threshold) VALUES (?, ?, ?, ?, ?)',
            rm
        );
        rmMap[rm[0]] = result.insertId;
    }

    const pdData = [
        ['Steel Gate', 5000, 2, 1],
        ['Metal Frame', 3000, 1, 1],
        ['Steel Door', 7000, 2, 1],
        ['Industrial Pipe', 2000, 1, 1],
        ['Reinforced Beam', 8000, 3, 2],
        ['Metal Container', 10000, 3, 2]
    ];

    const pdMap = {};
    for (const pd of pdData) {
        const [result] = await pool.execute(
            'INSERT INTO products (name, selling_price, production_time, delivery_time) VALUES (?, ?, ?, ?)',
            pd
        );
        pdMap[pd[0]] = result.insertId;
    }

    // Recipes
    const recipes = [
        { product: 'Steel Gate', rm: 'Steel Rod', qty: 5 },
        { product: 'Steel Gate', rm: 'Iron Sheet', qty: 10 },
        
        { product: 'Metal Frame', rm: 'Steel Rod', qty: 3 },
        { product: 'Metal Frame', rm: 'Copper Wire', qty: 2 },
        
        { product: 'Steel Door', rm: 'Steel Rod', qty: 6 },
        { product: 'Steel Door', rm: 'Iron Sheet', qty: 12 },
        { product: 'Steel Door', rm: 'Copper Wire', qty: 2 },
        
        { product: 'Industrial Pipe', rm: 'Steel Rod', qty: 4 },
        { product: 'Industrial Pipe', rm: 'Copper Wire', qty: 1 },
        
        { product: 'Reinforced Beam', rm: 'Steel Rod', qty: 10 },
        { product: 'Reinforced Beam', rm: 'Iron Sheet', qty: 8 },
        
        { product: 'Metal Container', rm: 'Iron Sheet', qty: 15 },
        { product: 'Metal Container', rm: 'Steel Rod', qty: 5 },
        { product: 'Metal Container', rm: 'Copper Wire', qty: 3 },
    ];

    for (let r of recipes) {
        await pool.execute(
            'INSERT INTO product_recipes (product_id, raw_material_id, quantity_required_per_unit) VALUES (?, ?, ?)',
            [pdMap[r.product], rmMap[r.rm], r.qty]
        );
    }
    console.log("Sample data seeded successfully!");
};

module.exports = { bootstrapDB };
