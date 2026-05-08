const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nativenest'
  });

  try {
    const [rows1] = await pool.query('DESCRIBE property_variants');
    console.log("property_variants:");
    console.table(rows1);
    const [rows2] = await pool.query('DESCRIBE villa_details');
    console.log("villa_details:");
    console.table(rows2);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}
check();
