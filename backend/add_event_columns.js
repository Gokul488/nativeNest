require('dotenv').config();
const mysql = require('mysql2/promise');

async function addColumns() {
    let sslOptions = undefined;
    if (process.env.AIVEN_CA_BASE64) {
        const ca = Buffer.from(process.env.AIVEN_CA_BASE64, 'base64').toString('utf8');
        sslOptions = { ca, rejectUnauthorized: true };
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: sslOptions || { rejectUnauthorized: false },
    });

    try {
        console.log('Adding address and pincode columns to property_events table...');
        
        await connection.query(`
            ALTER TABLE property_events 
            ADD COLUMN address TEXT AFTER event_location,
            ADD COLUMN pincode VARCHAR(10) AFTER address;
        `);
        
        console.log('Columns added successfully!');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN') {
            console.log('Columns already exist.');
        } else {
            console.error('Error adding columns:', error);
        }
    } finally {
        await connection.end();
    }
}

addColumns();
