// Modified stallController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');

// 1. Get all stall types (for display / selection)
const getStallTypes = async (req, res) => {
  try {
    const [types] = await pool.query(
      'SELECT stall_type_id, stall_type_name, no_of_stalls, stall_price, description FROM stall_type ORDER BY stall_price'
    );
    res.json(types);
  } catch (error) {
    console.error('Error fetching stall types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Get available stalls for a specific event
const getAvailableStallsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [stalls] = await pool.query(`
      SELECT 
        s.stall_id,
        s.stall_number,
        st.stall_type_name,
        st.stall_price,
        s.builder_id IS NULL AS is_available
      FROM stall s
      INNER JOIN stall_type st ON s.stall_type_id = st.stall_type_id
      WHERE s.event_id = ?
      ORDER BY s.stall_number
    `, [eventId]);

    res.json({ stalls });
  } catch (error) {
    console.error('Error fetching stalls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Book a stall (Builder only)
const bookStallByType = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'builder') {
      return res.status(403).json({ error: 'Only builders can book' });
    }

    const builderId = decoded.userId;
    const { stallTypeId, eventId } = req.body;

    await connection.beginTransaction();

    // Find one pre-generated stall that hasn't been assigned a builder yet
    const [available] = await connection.query(`
      SELECT stall_id 
      FROM stall 
      WHERE event_id = ? 
      AND stall_type_id = ? 
      AND builder_id IS NULL 
      LIMIT 1 
      FOR UPDATE
    `, [eventId, stallTypeId]);

    if (available.length === 0) {
      throw new Error('No available stalls for this type');
    }

    const stallId = available[0].stall_id;

    // Assign the builder to the stall
    await connection.query(
      'UPDATE stall SET builder_id = ? WHERE stall_id = ?',
      [builderId, stallId]
    );

    await connection.commit();
    res.json({ message: 'Stall booked successfully', stallId });

  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message || 'Booking failed' });
  } finally {
    connection.release();
  }
};

// stallController.js (add this function)
const getStallTypesWithAvailabilityForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [[event]] = await pool.query(
      'SELECT event_name FROM property_events WHERE id = ?',
      [eventId]
    );

    const [types] = await pool.query(`
      SELECT 
        st.stall_type_id,
        st.stall_type_name,
        st.no_of_stalls AS total_stalls,
        st.stall_price,
        COUNT(s.stall_id) AS booked_count,
        (st.no_of_stalls - COUNT(s.stall_id)) AS available_count
      FROM stall_type st
      LEFT JOIN stall s 
        ON s.stall_type_id = st.stall_type_id 
        AND s.event_id = st.event_id 
        AND s.builder_id IS NOT NULL
      WHERE st.event_id = ?
      GROUP BY st.stall_type_id
      ORDER BY st.stall_price ASC
    `, [eventId]);

    res.json({
      eventName: event ? event.event_name : 'Unknown Event',
      stallTypes: types || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stall types' });
  }
};

// NEW: Get stall bookings for an event (Admin only)
const getStallBookingsForEvent = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const { eventId } = req.params;

    const [bookings] = await pool.query(`
      SELECT 
        s.stall_id,
        s.stall_number,
        st.stall_type_name,
        b.name AS builder_name,
        b.mobile_number,
        b.email
      FROM stall s
      INNER JOIN builders b ON s.builder_id = b.id
      INNER JOIN stall_type st ON s.stall_type_id = st.stall_type_id
      WHERE s.event_id = ?
      ORDER BY s.stall_number ASC
    `, [eventId]);

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching stall bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getStallTypes,
  getAvailableStallsForEvent,
  bookStallByType,
  getStallTypesWithAvailabilityForEvent,
  getStallBookingsForEvent,
};