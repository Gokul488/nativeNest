const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function createTable() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS property_villa_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT NOT NULL,
                facing ENUM('East', 'West', 'North', 'South') NOT NULL,
                price DECIMAL(15, 2) NOT NULL,
                sqft INT NOT NULL,
                quantity INT DEFAULT 1,
                sold INT DEFAULT 0,
                FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
            )
        `);
        console.log("Table 'property_villa_details' created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
}

createTable();
