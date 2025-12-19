// controller/buyerEventController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');

/* ================= BUYER: GET ALL EVENTS ================= */
const getPublicEvents = async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT id, event_name, event_type, event_location, city, state,
              start_date, end_date, start_time, end_time, description
       FROM property_events
       ORDER BY start_date DESC`
    );

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/* ================= BUYER: PARTICIPATE EVENT ================= */
const participateEvent = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { eventId, name, phone, email } = req.body;

    if (!eventId || !name || !phone) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    /* ================= INSERT PARTICIPATION ================= */
    await pool.query(
      `INSERT INTO event_participants (event_id, buyer_id, name, phone, email)
       VALUES (?, ?, ?, ?, ?)`,
      [eventId, decoded.userId, name, phone, email || null]
    );

    /* ================= WHATSAPP MESSAGE ================= */
    const whatsappMessage =
      `✅ Registration Confirmed!\n\n` +
      `Event ID: ${eventId}\n` +
      `Name: ${name}\n\n` +
      `Thank you for registering with NativeNest.`;

    /* ================= RESPONSE ================= */
    res.status(201).json({
      message: 'Successfully registered for the event',
      whatsappMessage
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to participate in event' });
  }
};



/* ================= BUYER: MY REGISTERED EVENTS ================= */
const getMyRegisteredEvents = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.query(
      `SELECT pe.*
       FROM event_participants ep
       JOIN property_events pe ON pe.id = ep.event_id
       WHERE ep.buyer_id = ?
       ORDER BY pe.start_date DESC`,
      [decoded.userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registered events' });
  }
};

module.exports = { getPublicEvents, participateEvent, getMyRegisteredEvents };
