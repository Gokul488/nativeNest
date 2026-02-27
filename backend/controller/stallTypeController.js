// stallTypeController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');

const getStallTypesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const [types] = await pool.query(
      `SELECT stall_type_id, stall_type_name, no_of_stalls, stall_price
       FROM stall_type
       WHERE event_id = ?
       ORDER BY stall_type_name`,
      [eventId]
    );

    const [[event]] = await pool.query(
      'SELECT stall_count FROM property_events WHERE id = ?',
      [eventId]
    );

    if (!event) return res.status(404).json({ error: 'Event not found' });

    res.json({
      stallTypes: types,
      eventTotalStalls: event.stall_count || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// stallTypeController.js - Updated createStallType with auto-incrementing stall numbers
const createStallType = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { eventId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { stall_type_name, no_of_stalls, stall_price } = req.body;
    const requestedAmount = Number(no_of_stalls);

    await connection.beginTransaction();

    // 1. Capacity Validation
    const [[{ currentSum }]] = await connection.query(
      'SELECT COALESCE(SUM(no_of_stalls), 0) as currentSum FROM stall_type WHERE event_id = ?',
      [eventId]
    );
    const [[event]] = await connection.query(
      'SELECT stall_count FROM property_events WHERE id = ?',
      [eventId]
    );

    if (Number(currentSum) + requestedAmount > (event?.stall_count || 0)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Event capacity exceeded' });
    }

    // 2. Insert into stall_type
    const [typeResult] = await connection.query(
      'INSERT INTO stall_type (event_id, stall_type_name, no_of_stalls, stall_price) VALUES (?,?,?,?)',
      [eventId, stall_type_name.trim(), requestedAmount, stall_price]
    );
    const stallTypeId = typeResult.insertId;

    // --- NEW LOGIC: FIND STARTING STALL NUMBER ---
    // Look for the highest stall_number currently in the stall table for THIS event
    const [[{ maxStallNum }]] = await connection.query(
      'SELECT COALESCE(MAX(stall_number), 0) as maxStallNum FROM stall WHERE event_id = ?',
      [eventId]
    );

    // 3. SEED THE STALL TABLE 
    // Start from maxStallNum + 1 to ensure unique numbering per event
    for (let i = 1; i <= requestedAmount; i++) {
      const nextStallNumber = maxStallNum + i;
      await connection.query(
        'INSERT INTO stall (stall_number, event_id, stall_type_id, builder_id) VALUES (?, ?, ?, NULL)',
        [nextStallNumber, eventId, stallTypeId]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Stall type created and stalls numbered sequentially' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
};


const updateStallType = async (req, res) => {
  try {
    const { typeId, eventId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { stall_type_name, no_of_stalls, stall_price } = req.body;

    // Validation: Check capacity excluding the current record being updated
    const [[{ otherStallsSum }]] = await pool.query(
      'SELECT COALESCE(SUM(no_of_stalls), 0) as otherStallsSum FROM stall_type WHERE event_id = ? AND stall_type_id != ?',
      [eventId, typeId]
    );

    const [[event]] = await pool.query(
      'SELECT stall_count FROM property_events WHERE id = ?',
      [eventId]
    );

    const totalAllowed = event?.stall_count || 0;
    const requestedAmount = Number(no_of_stalls);

    if (Number(otherStallsSum) + requestedAmount > totalAllowed) {
      return res.status(400).json({
        error: `Cannot update to ${requestedAmount} stalls. Max available: ${totalAllowed - otherStallsSum}`
      });
    }

    const [result] = await pool.query(
      'UPDATE stall_type SET stall_type_name = ?, no_of_stalls = ?, stall_price = ? WHERE stall_type_id = ? AND event_id = ?',
      [stall_type_name.trim(), requestedAmount, stall_price, typeId, eventId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Stall type not found' });

    res.json({ message: 'Stall type updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteStallType = async (req, res) => {
  try {
    const { typeId, eventId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') return res.status(403).json({ error: 'Admin only' });

    // Optional: verify event_id match
    const [[row]] = await pool.query(
      'SELECT 1 FROM stall_type WHERE stall_type_id = ? AND event_id = ?',
      [typeId, eventId]
    );

    if (!row) return res.status(404).json({ error: 'Stall type not found or not associated with event' });

    await pool.query('DELETE FROM stall_type WHERE stall_type_id = ?', [typeId]);

    res.json({ message: 'Stall type deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getStallTypesByEvent,
  createStallType,
  updateStallType,
  deleteStallType,
};