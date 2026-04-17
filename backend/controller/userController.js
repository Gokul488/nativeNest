// userController.js (buyers only)
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') {
      return res.status(403).json({ error: 'Access denied: Buyer only' });
    }

    const [users] = await pool.query(
      'SELECT id, name, mobile_number, email, gender, dob, city, country, photo FROM buyers WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const user = users[0];
    if (user.photo) {
      try {
        user.photo = Buffer.from(user.photo).toString('base64');
      } catch (e) {
        console.error('Error converting photo to base64:', e);
        user.photo = null;
      }
    }

    res.json({ ...user, account_type: 'buyer' });
  } catch (error) {
    console.error('Error fetching buyer details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') {
      return res.status(403).json({ error: 'Access denied: Buyer only' });
    }

    const userId = decoded.userId;
    const { name, email, mobile_number, password, gender, dob, city, country, photo } = req.body;

    if (!name || !email || !mobile_number) {
      return res.status(400).json({
        error: 'Name, email and mobile number are required'
      });
    }

    if (!/^\d{10}$/.test(mobile_number)) {
      return res.status(400).json({ error: 'Mobile number must be 10 digits' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check for duplicate mobile or email (excluding current user)
    const [existing] = await pool.query(
      `SELECT id 
       FROM buyers 
       WHERE (mobile_number = ? OR email = ?) 
       AND id != ?`,
      [mobile_number, email, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Mobile number or email is already in use by another account'
      });
    }

    // Build dynamic query
    let query = `
      UPDATE buyers 
      SET name = ?, 
          email = ?, 
          mobile_number = ?,
          gender = ?,
          dob = ?,
          city = ?,
          country = ?,
          photo = ?
    `;
    let photoBuffer = null;
    if (photo) {
      // Remove prefix if exists before converting to Buffer
      const cleanBase64 = photo.includes(',') ? photo.split(',')[1] : photo;
      photoBuffer = Buffer.from(cleanBase64, 'base64');
    }

    let params = [
      name,
      email,
      mobile_number,
      gender || null,
      dob || null,
      city || null,
      country || null,
      photoBuffer
    ];

    // Handle optional password change
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);

      query += `, password = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE id = ?`;
    params.push(userId);

    await pool.query(query, params);

    // Fetch updated user data to return
    const [updatedRows] = await pool.query(
      `SELECT id, name, email, mobile_number, gender, dob, city, country, photo 
       FROM buyers 
       WHERE id = ?`,
      [userId]
    );

    if (updatedRows.length === 0) {
      return res.status(404).json({ error: 'Buyer not found after update' });
    }

    const updatedUser = {
      ...updatedRows[0],
      account_type: 'buyer'
    };

    if (updatedUser.photo) {
      try {
        updatedUser.photo = Buffer.from(updatedUser.photo).toString('base64');
      } catch (e) {
        console.error('Error converting updated photo to base64:', e);
        updatedUser.photo = null;
      }
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser   // ← returning full updated object (helps frontend)
    });

  } catch (error) {
    console.error('Error updating buyer details:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.status(500).json({
      error: 'Internal server error while updating profile'
    });
  }
};

const getBuyerDashboardStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 1. Count events the buyer has registered for
    const [registeredEvents] = await pool.query(
      "SELECT COUNT(*) as total FROM event_participants WHERE buyer_id = ?",
      [userId]
    );

    // 2. Count total bookmarked properties
    const [bookmarks] = await pool.query(
      "SELECT COUNT(*) as total FROM bookmarks WHERE buyer_id = ?",
      [userId]
    );

    // 3. Count total available upcoming events
    const [totalEvents] = await pool.query(
      "SELECT COUNT(*) as total FROM property_events WHERE end_date >= CURDATE()"
    );

    res.json({
      myEvents: registeredEvents[0].total,
      bookmarks: bookmarks[0].total,
      totalEvents: totalEvents[0].total
    });
  } catch (error) {
    console.error("Buyer stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUserDetails, updateUserDetails, getBuyerDashboardStats };