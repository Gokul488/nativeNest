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

        // Fetch valid account types from the database
        const [enumResult] = await pool.query(
            "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'userdetails' AND COLUMN_NAME = 'account_type'"
        );
        const enumValues = enumResult[0].COLUMN_TYPE
            .match(/'([^']+)'/g)
            .map(val => val.replace(/'/g, ''));

        if (!enumValues.includes(account_type)) {
            return res.status(400).json({ error: 'Invalid account type' });
        }

        if (mobile_number.length !== 10 || !/^\d+$/.test(mobile_number)) {
            return res.status(400).json({ error: 'Mobile number must be 10 digits' });
        }

        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM userdetails WHERE mobile_number = ? OR email = ?',
            [mobile_number, email || null]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists with this mobile number or email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO userdetails (name, mobile_number, email, password, account_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [name, mobile_number, email || null, hashedPassword, account_type]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: result.insertId, account_type },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: result.insertId, name, mobile_number, email, account_type }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Validation
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Mobile number/email and password are required' });
        }

        // Find user by mobile or email
        const [users] = await pool.query(
            'SELECT * FROM userdetails WHERE mobile_number = ? OR email = ?',
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, account_type: user.account_type },
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
                account_type: user.account_type
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAccountTypes = async (req, res) => {
    try {
        const [result] = await pool.query(
            "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'userdetails' AND COLUMN_NAME = 'account_type'"
        );

        if (!result.length) {
            return res.status(404).json({ error: 'Account type information not found' });
        }

        const accountTypes = result[0].COLUMN_TYPE
            .match(/'([^']+)'/g)
            .map(val => val.replace(/'/g, ''));

        res.json({ accountTypes });
    } catch (error) {
        console.error('Error fetching account types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, login, getAccountTypes };