const pool = require('./db');
async function alter() {
  try {
    await pool.query("ALTER TABLE builders ADD COLUMN builder_type VARCHAR(50) DEFAULT 'Builder'");
    console.log("Column builder_type added");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists");
    } else {
      console.error(e);
    }
  }
  process.exit();
}
alter();
