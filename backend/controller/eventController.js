const pool = require('../db');
const jwt = require('jsonwebtoken');

const createEvent = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      event_name,
      event_type,
      event_location,
      city,
      state,
      start_date,
      end_date,
      start_time,
      end_time,
      description,
      contact_name,
      contact_phone
    } = req.body;

    if (!event_name || !event_location || !city || !state || !start_date || !end_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    await pool.query(
      `INSERT INTO property_events
      (admin_id, event_name, event_type, event_location, city, state,
       start_date, end_date, start_time, end_time, description,
       contact_name, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        decoded.userId,
        event_name,
        event_type,
        event_location,
        city,
        state,
        start_date,
        end_date,
        start_time,
        end_time,
        description,
        contact_name,
        contact_phone
      ]
    );

    res.status(201).json({ message: 'Event created successfully' });

  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createEvent };
