const mysql = require('mysql2/promise');

let ca = undefined;
if (process.env.AIVEN_CA_BASE64) {
  ca = Buffer.from(process.env.AIVEN_CA_BASE64, 'base64').toString('utf8');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: ca ? { ca, rejectUnauthorized: true } : false,
  waitForConnections: true,
  connectionLimit: 10,
});
