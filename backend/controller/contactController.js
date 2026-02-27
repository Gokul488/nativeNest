const pool = require('../db');

const createContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Insert contact message
    const [result] = await pool.query(
      `INSERT INTO contactus (name, email, message, created_at)
       VALUES (?, ?, ?, NOW())`,
      [name, email, message]
    );

    res.status(201).json({
      message: 'Contact message sent successfully',
      contactId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const [messages] = await pool.query(
      `SELECT id, name, email, message, created_at
       FROM contactus
       ORDER BY created_at DESC`
    );

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM contactus WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    res.status(200).json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createContactMessage, getContactMessages, deleteContactMessage };