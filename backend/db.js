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

pool.query("ALTER TABLE builders ADD COLUMN builder_type VARCHAR(50) DEFAULT 'Builder'").catch(e => {
  if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding builder_type:', e);
});

pool.query("ALTER TABLE builders ADD COLUMN team_members TEXT DEFAULT NULL").catch(e => {
  if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding team_members:', e);
});

pool.query(`
  CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
  )
`).then(() => {
  pool.query(`
    INSERT IGNORE INTO settings (setting_key, setting_value) 
    VALUES ('whatsapp_send_to_builder', 'false')
  `).catch(e => console.error('Error seeding settings table:', e));
}).catch(e => console.error('Error creating settings table:', e));

module.exports = pool;
