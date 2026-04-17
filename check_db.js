
const pool = require('./backend/db');

async function checkTable() {
    try {
        const [rows] = await pool.query('DESCRIBE buyers');
        console.log('Buyers table structure:');
        console.table(rows);
        
        const [users] = await pool.query('SELECT name, photo FROM buyers LIMIT 1');
        if (users.length > 0) {
            console.log('Sample user photo data type:', typeof users[0].photo);
            if (users[0].photo) {
                console.log('Photo is Buffer?', Buffer.isBuffer(users[0].photo));
                console.log('Photo length:', users[0].photo.length);
            } else {
                console.log('Photo is null/empty for first user');
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkTable();
