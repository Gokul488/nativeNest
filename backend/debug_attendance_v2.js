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
    const [buyers] = await pool.query('SELECT id, name, mobile_number FROM buyers WHERE mobile_number = ?', ['9842431803']);
    console.log("Buyers with phone 9842431803:");
    console.table(buyers);

    if (buyers.length > 0) {
      const buyerId = buyers[0].id;
      const [participants] = await pool.query('SELECT * FROM event_participants WHERE buyer_id = ?', [buyerId]);
      console.log(`Event Participation for Buyer ID ${buyerId}:`);
      console.table(participants);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}
check();
