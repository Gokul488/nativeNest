const mysql = require('mysql2/promise');

// Load CA if provided
let sslOptions = undefined;
if (process.env.AIVEN_CA_BASE64) {
  const ca = Buffer.from(process.env.AIVEN_CA_BASE64, 'base64').toString('utf8');
  sslOptions = { ca, rejectUnauthorized: true };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslOptions || { rejectUnauthorized: false },  // TEMP fallback
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
