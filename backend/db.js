// backend/db.js
const fs = require('fs');   // <---- YOU WERE MISSING THIS
const mysql = require('mysql2/promise');

let sslOption = undefined;

if (process.env.MYSQL_USE_SSL === "true") {
  try {
    const ca = fs.readFileSync('/etc/secrets/aiven-ca.pem', 'utf8');
    sslOption = { ca };
    console.log("Loaded AIVEN SSL CA successfully.");
  } catch (err) {
    console.error("Failed to load Aiven CA file:", err);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: sslOption
});

module.exports = pool;
