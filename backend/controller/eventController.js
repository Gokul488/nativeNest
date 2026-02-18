// Modified eventController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { generateEventInvitationPDF } = require('../utils/generateEventInvitation');

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

    const bannerImage = req.files?.['banner_image']?.[0]?.buffer || null;

    // Insert the event
    const [result] = await pool.query(
      `INSERT INTO property_events
      (admin_id, event_name, event_type, event_location, city, state,
       start_date, end_date, start_time, end_time, description,
       contact_name, contact_phone, stall_count, banner_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
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
        stall_count || 0,
        bannerImage
      ]
    );

    const eventId = result.insertId;

    const eventForPDF = {
  id: eventId,
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
  banner_image: bannerImage
};

// Generate PDF buffer
let invitationPDF;
try {
  invitationPDF = await generateEventInvitationPDF(eventForPDF);
} catch (pdfErr) {
  console.error('PDF generation failed:', pdfErr);
  // continue anyway — don't fail event creation
}


    const formatDate = (date) => 
      new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    const formatTime = (time) => time ? time.slice(0, 5) : 'N/A';

    const eventDateStr = `${formatDate(start_date)}${end_date && start_date !== end_date ? ' – ' + formatDate(end_date) : ''}`;
    // ────────────────────────────────────────────────
    //     Notify ALL BUILDERS (existing code)
    // ────────────────────────────────────────────────
    const [builders] = await pool.query(
      `SELECT name, email FROM builders WHERE email IS NOT NULL AND email != ''`
    );

    if (builders.length > 0) {
      const builderEmails = builders.map(b => b.email).filter(Boolean);

      if (builderEmails.length > 0) {
        const subject = `New Property Event Announced: ${event_name}`;

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2e6171; text-align: center;">New Event Alert – NativeNest</h2>
            
            <p style="font-size: 16px;">Dear Builder,</p>
            
            <p>A new property event has been created on the platform:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Event Name:</td><td>${event_name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Type:</td><td>${event_type}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td>${event_location}, ${city}, ${state}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>${eventDateStr}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Time:</td><td>${formatTime(start_time)} – ${formatTime(end_time)}</td></tr>
              ${description ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Description:</td><td>${description.replace(/\n/g, '<br>')}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-weight: bold;">Contact:</td><td>${contact_name || 'N/A'} – ${contact_phone || 'N/A'}</td></tr>
            </table>

            <p style="text-align: center; margin: 30px 0;">
              <a href="https://yoursite.com/events/${eventId}" 
                 style="background: #2e6171; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Event Details & Book Stalls
              </a>
            </p>

            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Regards,<br>
              <strong>NativeNest Team</strong>
            </p>
          </div>
        `;

      try {
          await sendEmail({
            to: builderEmails.join(', '),
            subject,
            html,
            attachments: invitationPDF ? [{
              filename: `Invitation-${event_name.replace(/[^a-zA-Z0-9]/g, '-')}-${eventId}.pdf`,
              content: invitationPDF,
              contentType: 'application/pdf'
            }] : []
          });
          console.log(`Invitation with PDF sent to ${builderEmails.length} builders`);
        } catch (emailErr) {
          console.error('Builder email+PDF failed:', emailErr);
        }
      }
    }

    // ────────────────────────────────────────────────
    //     NEW: Notify ALL BUYERS
    // ────────────────────────────────────────────────
    const [buyers] = await pool.query(
      `SELECT name, email FROM buyers WHERE email IS NOT NULL AND email != ''`
    );

    if (buyers.length > 0) {
      const buyerEmails = buyers.map(b => b.email).filter(Boolean);

      if (buyerEmails.length > 0) {
        const subject = `Join Us at ${event_name}!`;

        const buyerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2e6171; text-align: center;">Exciting Property Event Invitation – NativeNest</h2>
            
            <p style="font-size: 16px;">Dear Buyer,</p>
            
            <p>Discover amazing property deals at our upcoming event:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Event Name:</td><td>${event_name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Type:</td><td>${event_type}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td>${event_location}, ${city}, ${state}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>${eventDateStr}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Time:</td><td>${formatTime(start_time)} – ${formatTime(end_time)}</td></tr>
              ${description ? `<tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Description:</td><td>${description.replace(/\n/g, '<br>')}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-weight: bold;">Contact:</td><td>${contact_name || 'N/A'} – ${contact_phone || 'N/A'}</td></tr>
            </table>

            <p style="text-align: center; margin: 30px 0;">
              <a href="https://yoursite.com/events/${eventId}" 
                 style="background: #2e6171; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                RSVP & View Details
              </a>
            </p>

            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Regards,<br>
              <strong>NativeNest Team</strong>
            </p>
          </div>
        `;

        try {
          await sendEmail({
            to: buyerEmails.join(', '),
            subject,
            html,
            attachments: invitationPDF ? [{
              filename: `Invitation-${event_name.replace(/[^a-zA-Z0-9]/g, '-')}-${eventId}.pdf`,
              content: invitationPDF,
              contentType: 'application/pdf'
            }] : []
          });
          console.log(`Invitation with PDF sent to ${buyerEmails.length} buyers`);
        } catch (emailErr) {
          console.error('Buyer email+PDF failed:', emailErr);
        }
      }
    }
    res.status(201).json({ 
      message: 'Event created successfully',
      eventId 
    });

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

    const event = rows[0];
    event.banner_image = event.banner_image 
      ? `data:image/jpeg;base64,${Buffer.from(event.banner_image).toString('base64')}` 
      : null;

    res.status(200).json(event);
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

    const bannerImage = req.files?.['banner_image']?.[0]?.buffer || null;

    const [result] = await pool.query(
      `UPDATE property_events
       SET event_name = ?, event_type = ?, event_location = ?, city = ?, state = ?,
           start_date = ?, end_date = ?, start_time = ?, end_time = ?, description = ?,
           contact_name = ?, contact_phone = ?, stall_count = ?,
           banner_image = COALESCE(?, banner_image)
       WHERE id = ?`,
      [
        event_name, event_type, event_location, city, state,
        start_date, end_date, start_time, end_time, description,
        contact_name, contact_phone, stall_count || 0,
        bannerImage, id
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

const getEventInvitationPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM property_events WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = rows[0];

    const pdfBuffer = await generateEventInvitationPDF(event);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Invitation-${event.event_name.replace(/[^a-zA-Z0-9]/g,'-')}-${event.id}.pdf"`
    );

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Get invitation PDF error:', err);
    res.status(500).json({ error: 'Failed to generate invitation PDF' });
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getEventInvitationPDF };