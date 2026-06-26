require('dotenv').config();
const pool = require('./db');
async function run() {
  try {
    const [rows] = await pool.query('DESCRIBE builders');
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
