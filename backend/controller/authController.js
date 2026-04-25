const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/* ===================== REGISTER ===================== */
const register = async (req, res) => {
  try {
    const {
      name, mobile_number, email, password, confirm_password, account_type,
      gender, dob, city, country, photo
    } = req.body;

    if (!name || !mobile_number || !password || !confirm_password || !account_type) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Updated: Add 'builder' to valid types
    if (!['buyer', 'builder'].includes(account_type)) {
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
        'INSERT INTO buyers (name, mobile_number, email, password, gender, dob, city, country, photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [
          name,
          mobile_number,
          email || null,
          hashedPassword,
          gender || null,
          dob || null,
          city || null,
          country || null,
          photo ? Buffer.from(photo.includes(',') ? photo.split(',')[1] : photo, 'base64') : null
        ]
      );

      const [newUser] = await pool.query(
        'SELECT id, name, mobile_number, email, gender, dob, city, country, photo FROM buyers WHERE id = ?',
        [result.insertId]
      );

      const photoBase = newUser[0].photo ? Buffer.from(newUser[0].photo).toString('base64') : null;

      user = {
        ...newUser[0],
        photo: photoBase,
        account_type: 'buyer'
      };
    }

    /* ADMIN REGISTER logic removed for security - Admin creation is handled via Superadmin dashboard */

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

      const [newUser] = await pool.query(
        'SELECT id, name, contact_person, mobile_number, email FROM builders WHERE id = ?',
        [result.insertId]
      );

      user = {
        ...newUser[0],
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
      `SELECT id, name, mobile_number, email, password, gender, dob, city, country, photo
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
        `SELECT id, name, mobile_number, email, password, admin_type
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

    const photoBase = user.photo ? Buffer.from(user.photo).toString('base64') : null;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile_number: user.mobile_number,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        city: user.city,
        country: user.country,
        photo: photoBase,
        account_type,
        admin_type: user.admin_type || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ===================== ACCOUNT TYPES ===================== */
const getAccountTypes = (req, res) => {
  res.json({ accountTypes: ['buyer', 'builder'] });
};

/* ===================== FORGOT PASSWORD ===================== */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user;
    let table = '';

    let [rows] = await pool.query('SELECT id, email FROM buyers WHERE email = ?', [email]);
    if (rows.length > 0) {
      user = rows[0];
      table = 'buyers';
    } else {
      [rows] = await pool.query('SELECT id, email FROM admins WHERE email = ?', [email]);
      if (rows.length > 0) {
        user = rows[0];
        table = 'admins';
      } else {
        [rows] = await pool.query('SELECT id, email FROM builders WHERE email = ?', [email]);
        if (rows.length > 0) {
          user = rows[0];
          table = 'builders';
        }
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    const resetToken = jwt.sign(
      { userId: user.id, table },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const clientUrl = req.headers.origin || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"NativeNest Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the following link to reset your password: ${resetLink}\nIf you did not request this, please ignore this email.`,
      html: `<h3>Password Reset</h3><p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>If you did not request this, please ignore this email.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'A password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error while sending email' });
  }
};

/* ===================== RESET PASSWORD ===================== */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const { userId, table } = decoded;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, userId]);

    res.json({ message: 'Password has been successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, getAccountTypes, forgotPassword, resetPassword };