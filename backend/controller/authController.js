const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* ===================== REGISTER ===================== */
const register = async (req, res) => {
  try {
    const { name, mobile_number, email, password, confirm_password, account_type } = req.body;

    if (!name || !mobile_number || !password || !confirm_password || !account_type) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Updated: Add 'builder' to valid types
    if (!['buyer', 'admin', 'builder'].includes(account_type)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    if (!/^\d{10}$/.test(mobile_number)) {
      return res.status(400).json({ error: 'Mobile number must be 10 digits' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let result, user;

    /* -------- BUYER REGISTER -------- */
    if (account_type === 'buyer') {
      const [existing] = await pool.query(
        'SELECT id FROM buyers WHERE mobile_number = ? OR email = ?',
        [mobile_number, email || null]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Buyer already exists' });
      }

      [result] = await pool.query(
        'INSERT INTO buyers (name, mobile_number, email, password, created_at) VALUES (?, ?, ?, ?, NOW())',
        [name, mobile_number, email || null, hashedPassword]
      );

      user = {
        id: result.insertId,
        name,
        mobile_number,
        email,
        account_type: 'buyer'
      };
    }

    /* -------- ADMIN REGISTER -------- */
    if (account_type === 'admin') {
      const [existing] = await pool.query(
        'SELECT id FROM admins WHERE mobile_number = ? OR email = ?',
        [mobile_number, email || null]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Admin already exists' });
      }

      [result] = await pool.query(
        'INSERT INTO admins (name, mobile_number, email, password, created_at) VALUES (?, ?, ?, ?, NOW())',
        [name, mobile_number, email || null, hashedPassword]
      );

      user = {
        id: result.insertId,
        name,
        mobile_number,
        email,
        account_type: 'admin'
      };
    }

    // New: Builder Register
    if (account_type === 'builder') {

      const { contact_person } = req.body;

      if (!contact_person) {
        return res.status(400).json({ error: 'Contact person is required for builders' });
      }
      
      const [existing] = await pool.query(
        'SELECT id FROM builders WHERE mobile_number = ? OR email = ?',
        [mobile_number, email || null]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Builder already exists' });
      }

      [result] = await pool.query(
        'INSERT INTO builders (name, contact_person, mobile_number, email, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [name, contact_person, mobile_number, email || null, hashedPassword]
      );

      user = {
        id: result.insertId,
        name,
        contact_person,
        mobile_number,
        email,
        account_type: 'builder'
      };
    }

    const token = jwt.sign(
      { userId: user.id, account_type: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ===================== LOGIN ===================== */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Mobile/email and password are required' });
    }

    let user, account_type;

    /* -------- BUYER LOGIN -------- */
    let [rows] = await pool.query(
      `SELECT id, name, mobile_number, email, password
       FROM buyers
       WHERE mobile_number = ? OR email = ?`,
      [identifier, identifier]
    );

    if (rows.length > 0) {
      user = rows[0];
      account_type = 'buyer';
    } else {
      /* -------- ADMIN LOGIN -------- */
      [rows] = await pool.query(
        `SELECT id, name, mobile_number, email, password
         FROM admins
         WHERE mobile_number = ? OR email = ?`,
        [identifier, identifier]
      );

      if (rows.length > 0) {
        user = rows[0];
        account_type = 'admin';
      } else {
        // New: Builder Login
        [rows] = await pool.query(
          `SELECT id, name, mobile_number, email, password
           FROM builders
           WHERE mobile_number = ? OR email = ?`,
          [identifier, identifier]
        );

        if (rows.length > 0) {
          user = rows[0];
          account_type = 'builder';
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, account_type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile_number: user.mobile_number,
        email: user.email,
        account_type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ===================== ACCOUNT TYPES ===================== */
const getAccountTypes = (req, res) => {
  // Updated: Add 'builder' to account types
  res.json({ accountTypes: ['buyer', 'admin', 'builder'] });
};

module.exports = { register, login, getAccountTypes };