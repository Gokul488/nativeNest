const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTable() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nativenest'
  });

  try {
    console.log('Altering buyers table to allow NULLs for optional fields...');
    await pool.query('ALTER TABLE buyers MODIFY COLUMN gender VARCHAR(255) NULL');
    await pool.query('ALTER TABLE buyers MODIFY COLUMN dob DATE NULL');
    await pool.query('ALTER TABLE buyers MODIFY COLUMN city VARCHAR(255) NULL');
    await pool.query('ALTER TABLE buyers MODIFY COLUMN country VARCHAR(255) NULL');
    await pool.query('ALTER TABLE buyers MODIFY COLUMN photo LONGBLOB NULL');
    console.log('Successfully updated table schema!');
  } catch (error) {
    console.error('Error updating table:', error);
  } finally {
    await pool.end();
  }
}

fixTable();
