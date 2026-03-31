const { pool } = require('./config/db');

const bootstrapDB = async () => {
    try {
        const createTablesQuery = `
            CREATE TABLE IF NOT EXISTS raw_materials (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                available_quantity INTEGER NOT NULL DEFAULT 0,
                unit_cost DECIMAL(10,2) NOT NULL,
                procurement_time INTEGER NOT NULL, -- in days
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                minimum_threshold INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                selling_price DECIMAL(10,2) NOT NULL,
                production_time INTEGER NOT NULL, -- in days
                delivery_time INTEGER NOT NULL -- in days
            );

            CREATE TABLE IF NOT EXISTS product_recipes (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                raw_material_id INTEGER REFERENCES raw_materials(id) ON DELETE CASCADE,
                quantity_required_per_unit INTEGER NOT NULL,
                UNIQUE(product_id, raw_material_id)
            );

            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
                    CREATE TYPE order_status AS ENUM ('PENDING', 'WAITING_FOR_MATERIAL', 'IN_PRODUCTION', 'COMPLETED');
                END IF;
            END$$;

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL, -- Storing MongoDB User ID as string
                total_price DECIMAL(10,2) NOT NULL,
                total_cost DECIMAL(10,2) NOT NULL,
                profit DECIMAL(10,2) NOT NULL,
                estimated_time INTEGER NOT NULL, -- Total duration in days
                estimated_wait_time INTEGER NOT NULL DEFAULT 0, -- Wait time for materials in days
                estimated_completion_time TIMESTAMP, -- Added via user refinement
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Ensure status uses standard values if ENUM is flaky
            
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL
            );
        `;
        
        await pool.query(createTablesQuery);
        console.log("PostgreSQL tables checked/created.");

        // Check if data exists
        const { rows } = await pool.query('SELECT COUNT(*) FROM raw_materials');
        if (parseInt(rows[0].count) === 0) {
            console.log("Seeding sample data...");
            await seedSampleData();
        }

    } catch (err) {
        console.error("Error bootstrapping DB:", err);
    }
};

const seedSampleData = async () => {
    const rmQuery = `
        INSERT INTO raw_materials (name, available_quantity, unit_cost, procurement_time, minimum_threshold) VALUES
        ('Steel Rod', 100, 50, 2, 10),
        ('Iron Sheet', 200, 30, 1, 20),
        ('Copper Wire', 50, 80, 3, 5)
        RETURNING id, name;
    `;
    const { rows: rms } = await pool.query(rmQuery);
    
    const rmMap = {};
    rms.forEach(r => rmMap[r.name] = r.id);

    const pdQuery = `
        INSERT INTO products (name, selling_price, production_time, delivery_time) VALUES
        ('Steel Gate', 5000, 2, 1),
        ('Metal Frame', 3000, 1, 1),
        ('Steel Door', 7000, 2, 1),
        ('Industrial Pipe', 2000, 1, 1),
        ('Reinforced Beam', 8000, 3, 2),
        ('Metal Container', 10000, 3, 2)
        RETURNING id, name;
    `;
    const { rows: pds } = await pool.query(pdQuery);
    
    const pdMap = {};
    pds.forEach(r => pdMap[r.name] = r.id);

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
        await pool.query(
            'INSERT INTO product_recipes (product_id, raw_material_id, quantity_required_per_unit) VALUES ($1, $2, $3)',
            [pdMap[r.product], rmMap[r.rm], r.qty]
        );
    }
    console.log("Sample data seeded successfully!");
};

module.exports = { bootstrapDB };
