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
    const [columns] = await pool.query('DESCRIBE event_participants');
    console.log("event_participants columns:");
    console.table(columns);

    const [rows] = await pool.query('SELECT * FROM event_participants WHERE phone = ?', ['9842431803']);
    console.log("Participants with phone 9842431803:");
    console.table(rows);

    const [allEvents] = await pool.query('SELECT id, event_name FROM property_events');
    console.log("All Events:");
    console.table(allEvents);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}
check();
