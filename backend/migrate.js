require('dotenv').config();
const pool = require('./db');

async function migrate() {
  try {
    console.log("Starting migration...");
    
    // Create sub_builders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sub_builders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        contact_person VARCHAR(100),
        mobile_number VARCHAR(15),
        email VARCHAR(100),
        password VARCHAR(255),
        contact_person_2 VARCHAR(255),
        email_2 VARCHAR(255),
        mobile_number_2 VARCHAR(50),
        parent_builder_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created sub_builders table.");

    // Migrate existing data
    const [subBuilders] = await pool.query(`SELECT * FROM builders WHERE builder_type = 'Builder'`);
    if (subBuilders.length > 0) {
      for (const sb of subBuilders) {
        // Insert into sub_builders
        await pool.query(`
          INSERT INTO sub_builders (id, name, contact_person, mobile_number, email, password, contact_person_2, email_2, mobile_number_2, parent_builder_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name)
        `, [sb.id, sb.name, sb.contact_person, sb.mobile_number, sb.email, sb.password, sb.contact_person_2, sb.email_2, sb.mobile_number_2, sb.parent_builder_id, sb.created_at]);
      }
      console.log(`Migrated ${subBuilders.length} sub_builders.`);
      
      // Delete from builders table
      await pool.query(`DELETE FROM builders WHERE builder_type = 'Builder'`);
      console.log("Deleted sub_builders from builders table.");
    } else {
      console.log("No sub_builders found to migrate.");
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

migrate();
