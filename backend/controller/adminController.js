// adminController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');

const getAdminDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [admins] = await pool.query(
      'SELECT id, name, mobile_number, email FROM admins WHERE id = ?',
      [decoded.userId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ ...admins[0], account_type: 'admin' });
  } catch (error) {
    console.error('Error fetching admin details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAdminDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, mobile_number, email } = req.body;

    if (!name || !mobile_number || !email) {
      return res.status(400).json({ error: 'Name, mobile number, and email are required' });
    }

    if (mobile_number.length !== 10 || !/^\d+$/.test(mobile_number)) {
      return res.status(400).json({ error: 'Mobile number must be 10 digits' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM admins WHERE (mobile_number = ? OR email = ?) AND id != ?',
      [mobile_number, email, decoded.userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Mobile number or email already in use' });
    }

    await pool.query(
      'UPDATE admins SET name = ?, mobile_number = ?, email = ? WHERE id = ?',
      [name, mobile_number, email, decoded.userId]
    );

    const [updated] = await pool.query(
      'SELECT id, name, mobile_number, email FROM admins WHERE id = ?',
      [decoded.userId]
    );

    res.json({ ...updated[0], account_type: 'admin' });
  } catch (error) {
    console.error('Error updating admin details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAdminDetails, updateAdminDetails };