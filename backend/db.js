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

pool.query("ALTER TABLE builders ADD COLUMN builder_type VARCHAR(50) DEFAULT 'BuilderAdmin'").catch(e => {
  if (e.code !== 'ER_DUP_FIELDNAME') {
    console.error('Error adding builder_type:', e);
  } else {
    pool.query("ALTER TABLE builders ALTER COLUMN builder_type SET DEFAULT 'BuilderAdmin'").catch(err => {
      console.error('Error altering builder_type default:', err);
    });
  }
});

pool.query("UPDATE builders SET builder_type = 'BuilderAdmin' WHERE builder_type = 'Builder' OR builder_type IS NULL").catch(e => {
  console.error('Error updating builders type:', e);
});

pool.query("ALTER TABLE builders ADD COLUMN contact_person_2 VARCHAR(255) DEFAULT NULL").catch(e => {
  if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding contact_person_2:', e);
});

pool.query("ALTER TABLE builders ADD COLUMN email_2 VARCHAR(255) DEFAULT NULL").catch(e => {
  if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding email_2:', e);
});

pool.query("ALTER TABLE builders ADD COLUMN mobile_number_2 VARCHAR(50) DEFAULT NULL").catch(e => {
  if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding mobile_number_2:', e);
});

pool.query("ALTER TABLE builders ADD COLUMN parent_builder_id INT DEFAULT NULL").catch(e => {
  if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding parent_builder_id:', e);
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
