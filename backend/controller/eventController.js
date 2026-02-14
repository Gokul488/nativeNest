// Modified eventController.js
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
      contact_phone,
      stall_count
    } = req.body;

    if (!event_name || !event_location || !city || !state || !start_date || !end_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    await pool.query(
      `INSERT INTO property_events
      (admin_id, event_name, event_type, event_location, city, state,
       start_date, end_date, start_time, end_time, description,
       contact_name, contact_phone, stall_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        contact_phone,
        stall_count || 0
      ]
    );

    res.status(201).json({ message: 'Event created successfully' });

  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.query(
      `SELECT id, event_name, event_type, event_location, city, state,
              start_date, end_date, start_time, end_time, description,
              contact_name, contact_phone, stall_count,
              (SELECT COUNT(*) FROM stall WHERE event_id = property_events.id AND builder_id IS NOT NULL) AS booked_count
       FROM property_events
       ORDER BY start_date DESC`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEventById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM property_events WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get Event By ID Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const {
      event_name, event_type, event_location, city, state,
      start_date, end_date, start_time, end_time, description,
      contact_name, contact_phone, stall_count
    } = req.body;

    if (!event_name || !event_location || !city || !state || !start_date || !end_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const [result] = await pool.query(
      `UPDATE property_events
       SET event_name = ?, event_type = ?, event_location = ?, city = ?, state = ?,
           start_date = ?, end_date = ?, start_time = ?, end_time = ?, description = ?,
           contact_name = ?, contact_phone = ?, stall_count = ?
       WHERE id = ?`,
      [
        event_name, event_type, event_location, city, state,
        start_date, end_date, start_time, end_time, description,
        contact_name, contact_phone, stall_count || 0, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update Event Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM property_events WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };