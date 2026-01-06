const pool = require('../db');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

/* ================= BUYER: GET ALL EVENTS ================= */
const getPublicEvents = async (req, res) => {
  try {
    let buyerId = null;

    // Token is optional here
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.account_type === 'buyer') {
          buyerId = decoded.userId;
        }
      } catch (err) {
        // ignore invalid token
      }
    }

    let query = `
      SELECT 
        pe.id,
        pe.event_name,
        pe.event_type,
        pe.event_location,
        pe.city,
        pe.state,
        pe.start_date,
        pe.end_date,
        pe.start_time,
        pe.end_time,
        pe.description,
        ${
          buyerId
            ? 'CASE WHEN ep.id IS NULL THEN 0 ELSE 1 END AS isRegistered'
            : '0 AS isRegistered'
        }
      FROM property_events pe
      ${
        buyerId
          ? 'LEFT JOIN event_participants ep ON ep.event_id = pe.id AND ep.buyer_id = ?'
          : ''
      }
      ORDER BY pe.start_date DESC
    `;

    const [events] = buyerId
      ? await pool.query(query, [buyerId])
      : await pool.query(query);

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

    // Fetch event details for email
    const [eventRows] = await pool.query(
      `SELECT event_name, event_location, city, state, start_date, end_date, start_time, end_time
       FROM property_events WHERE id = ?`,
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventRows[0];

    /* ================= INSERT PARTICIPATION ================= */
    await pool.query(
      `INSERT INTO event_participants (event_id, buyer_id, name, phone, email)
       VALUES (?, ?, ?, ?, ?)`,
      [eventId, decoded.userId, name, phone, email || null]
    );

    /* ================= SEND CONFIRMATION EMAIL ================= */
    const subject = `Registration Confirmed: ${event.event_name}`;

    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const formatTime = (time) => time ? time.slice(0, 5) : 'N/A';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2e6171; text-align: center;">🎉 Registration Confirmed!</h2>
        <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
        <p>Thank you for registering for the event with <strong>NativeNest</strong>. Here are your registration details:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px 0; font-weight: bold;">Event Name:</td><td>${event.event_name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td>${event.event_location || ''} ${event.city}, ${event.state}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>${formatDate(event.start_date)} ${event.end_date && event.start_date !== event.end_date ? ' to ' + formatDate(event.end_date) : ''}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Time:</td><td>${formatTime(event.start_time)} - ${formatTime(event.end_time)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${phone}</td></tr>
        </table>

        <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; font-size: 15px;">
          We look forward to seeing you at the event!
        </p>

        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
          Regards,<br><strong>NativeNest Team</strong>
        </p>
      </div>
    `;

    // Send email (only if email is provided)
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject,
          html,
        });
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
        // Don't fail the registration if email fails
      }
    }

    /* ================= RESPONSE ================= */
    res.status(201).json({
      message: 'Successfully registered for the event',
      emailSent: !!email, 
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }
    console.error('Error in participateEvent:', err);
    res.status(500).json({ error: 'Failed to register for event' });
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

/* ================= HOME PAGE: GET ONGOING EVENTS (PUBLIC) ================= */
const getOngoingEventsForHome = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [events] = await pool.query(
      `
      SELECT 
        id,
        event_name,
        event_type,
        event_location,
        city,
        state,
        start_date,
        end_date
      FROM property_events
      WHERE start_date <= ? 
        AND end_date >= ?
      ORDER BY start_date ASC
      `,
      [today, today]
    );

    res.json(events);
  } catch (error) {
    console.error("Ongoing events error:", error);
    res.status(500).json({ error: "Failed to fetch ongoing events" });
  }
};


module.exports = { getPublicEvents, participateEvent, getMyRegisteredEvents, getOngoingEventsForHome };