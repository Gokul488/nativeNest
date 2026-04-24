
const pool = require('./db');

async function addColumns() {
    try {
        console.log('Adding is_approved column to buyers table...');
        await pool.query('ALTER TABLE buyers ADD COLUMN is_approved TINYINT(1) DEFAULT 0');
        console.log('Successfully added to buyers.');

        console.log('Adding is_approved column to builders table...');
        await pool.query('ALTER TABLE builders ADD COLUMN is_approved TINYINT(1) DEFAULT 0');
        console.log('Successfully added to builders.');

        console.log('\nMigration complete! You can now restart your server.');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Columns already exist. You are good to go!');
        } else {
            console.error('Error during migration:', err.message);
        }
    } finally {
        process.exit();
    }
}

addColumns();
