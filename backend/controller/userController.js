// userController.js (buyers only)
const pool = require('../db');
const jwt = require('jsonwebtoken');

const getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') {
      return res.status(403).json({ error: 'Access denied: Buyer only' });
    }

    const [users] = await pool.query(
      'SELECT id, name, mobile_number, email FROM buyers WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json({ ...users[0], account_type: 'buyer' });
  } catch (error) {
    console.error('Error fetching buyer details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') {
      return res.status(403).json({ error: 'Access denied: Buyer only' });
    }

    const { name, mobile_number, email } = req.body;

    if (!name || !mobile_number || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM buyers WHERE (mobile_number = ? OR email = ?) AND id != ?',
      [mobile_number, email, decoded.userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Mobile number or email already in use' });
    }

    await pool.query(
      'UPDATE buyers SET name=?, mobile_number=?, email=? WHERE id=?',
      [name, mobile_number, email, decoded.userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating buyer details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUserDetails, updateUserDetails };
