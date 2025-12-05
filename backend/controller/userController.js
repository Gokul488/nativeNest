const pool = require('../db');
const jwt = require('jsonwebtoken');

const getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const [users] = await pool.query(
      'SELECT id, name, mobile_number, email, account_type FROM userdetails WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user details:', error);
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
    const userId = decoded.userId;

    const { name, mobile_number, email } = req.body;

    // Validation
    if (!name || !mobile_number || !email) {
      return res.status(400).json({ error: 'Name, mobile number, and email are required' });
    }

    if (mobile_number.length !== 10 || !/^\d+$/.test(mobile_number)) {
      return res.status(400).json({ error: 'Mobile number must be 10 digits' });
    }

    // Check if mobile number or email is already in use by another user
    const [existingUsers] = await pool.query(
      'SELECT * FROM userdetails WHERE (mobile_number = ? OR email = ?) AND id != ?',
      [mobile_number, email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Mobile number or email already in use' });
    }

    // Update user details
    await pool.query(
      'UPDATE userdetails SET name = ?, mobile_number = ?, email = ? WHERE id = ?',
      [name, mobile_number, email, userId]
    );

    // Fetch updated user details
    const [updatedUsers] = await pool.query(
      'SELECT id, name, mobile_number, email, account_type FROM userdetails WHERE id = ?',
      [userId]
    );

    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUserDetails, updateUserDetails };