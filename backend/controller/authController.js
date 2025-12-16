// authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, mobile_number, email, password, confirm_password, account_type } = req.body;

        // Validation
        if (!name || !mobile_number || !password || !confirm_password || !account_type) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const validTypes = ['seller', 'buyer', 'admin'];
        if (!validTypes.includes(account_type)) {
            return res.status(400).json({ error: 'Invalid account type' });
        }

        if (mobile_number.length !== 10 || !/^\d+$/.test(mobile_number)) {
            return res.status(400).json({ error: 'Mobile number must be 10 digits' });
        }

        let insertId, userData;

        if (account_type === 'seller') {
            // Check if seller already exists
            const [existing] = await pool.query(
                'SELECT * FROM sellers WHERE mobile_number = ? OR email = ?',
                [mobile_number, email || null]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: 'Seller already exists with this mobile/email' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert into sellers
            const [result] = await pool.query(
                'INSERT INTO sellers (name, mobile_number, email, password, created_at) VALUES (?, ?, ?, ?, NOW())',
                [name, mobile_number, email || null, hashedPassword]
            );

            insertId = result.insertId;
            userData = { id: insertId, name, mobile_number, email, account_type: 'seller' };

        } else if (account_type === 'admin') {
            // Check if admin already exists
            const [existing] = await pool.query(
                'SELECT * FROM admins WHERE mobile_number = ? OR email = ?',
                [mobile_number, email || null]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: 'Admin already exists with this mobile/email' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const [result] = await pool.query(
                'INSERT INTO admins (name, mobile_number, email, password, created_at) VALUES (?, ?, ?, ?, NOW())',
                [name, mobile_number, email || null, hashedPassword]
            );

            insertId = result.insertId;
            userData = { id: insertId, name, mobile_number, email, account_type: 'admin' };

        } else {
            // Buyer: no persistent storage, just return token
            userData = { name, mobile_number, email, account_type: 'buyer' };
            insertId = null; // no DB id
        }

        // Generate JWT (include account_type)
        const token = jwt.sign(
            { 
                userId: insertId || `buyer_${mobile_number}`, // unique identifier even for buyer
                account_type 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Mobile number/email and password are required' });
        }

        let user = null;
        let account_type = null;

        // Try sellers table
        let [rows] = await pool.query(
            'SELECT id, name, mobile_number, email, password, "seller" as account_type FROM sellers WHERE mobile_number = ? OR email = ?',
            [identifier, identifier]
        );

        if (rows.length > 0) {
            user = rows[0];
            account_type = 'seller';
        } else {
            // Try admins table
            [rows] = await pool.query(
                'SELECT id, name, mobile_number, email, password, "admin" as account_type FROM admins WHERE mobile_number = ? OR email = ?',
                [identifier, identifier]
            );

            if (rows.length > 0) {
                user = rows[0];
                account_type = 'admin';
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
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

// Remove getAccountTypes or keep for frontend
const getAccountTypes = async (req, res) => {
    res.json({ accountTypes: ['seller', 'buyer', 'admin'] });
};

module.exports = { register, login, getAccountTypes };