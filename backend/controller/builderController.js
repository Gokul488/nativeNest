// Modified builderController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const getBuilderDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'builder') {
      return res.status(403).json({ error: 'Access denied: Builder only' });
    }

    const [builders] = await pool.query(
      'SELECT id, name, contact_person, mobile_number, email FROM builders WHERE id = ?',
      [decoded.userId]
    );

    if (builders.length === 0) {
      return res.status(404).json({ error: 'Builder not found' });
    }

    res.json({ ...builders[0], account_type: 'builder' });
  } catch (error) {
    console.error('Error fetching builder details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBuilderDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'builder') {
      return res.status(403).json({ error: 'Access denied: Builder only' });
    }

    const builderId = decoded.userId;
    const { name, email, mobile_number, contact_person, password } = req.body;

    if (!name || !email || !mobile_number || !contact_person) {
      return res.status(400).json({ 
        error: 'Name, email, mobile number, and contact person are required' 
      });
    }

    if (!/^\d{10}$/.test(mobile_number)) {
      return res.status(400).json({ error: 'Mobile number must be 10 digits' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const [existing] = await pool.query(
      `SELECT id 
       FROM builders 
       WHERE (mobile_number = ? OR email = ?) 
       AND id != ?`,
      [mobile_number, email, builderId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'Mobile number or email is already in use by another account' 
      });
    }

    let query = `
      UPDATE builders 
      SET name = ?, 
          email = ?, 
          mobile_number = ?, 
          contact_person = ?
    `;
    let params = [name, email, mobile_number, contact_person];

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);
      
      query += `, password = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE id = ?`;
    params.push(builderId);

    await pool.query(query, params);

    const [updatedRows] = await pool.query(
      `SELECT id, name, email, mobile_number, contact_person 
       FROM builders 
       WHERE id = ?`,
      [builderId]
    );

    if (updatedRows.length === 0) {
      return res.status(404).json({ error: 'Builder not found after update' });
    }

    const updatedBuilder = {
      ...updatedRows[0],
      account_type: 'builder'
    };

    res.status(200).json({
      message: 'Profile updated successfully',
      builder: updatedBuilder
    });

  } catch (error) {
    console.error('Error updating builder details:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.status(500).json({ 
      error: 'Internal server error while updating profile' 
    });
  }
};


const getBuilderEvents = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.account_type !== "builder") {
      return res.status(403).json({ error: "Access denied: Builder only" });
    }

    const [events] = await pool.query(`
      SELECT 
        id,
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
        contact_phone
      FROM property_events
      ORDER BY created_at DESC
    `);

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching builder events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add this function
const getBuilderProperties = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "builder") {
      return res.status(403).json({ error: "Access denied: Builders only" });
    }

    const builderId = decoded.userId;

    const [properties] = await pool.query(
      `SELECT 
         property_id,
         title,
         price,
         city,
         state,
         pincode,
         sqft,
         property_type,
         created_at,
         views
       FROM properties 
       WHERE builder_id = ?
       ORDER BY created_at DESC`,
      [builderId]
    );

    res.status(200).json({ properties });
  } catch (error) {
    console.error("Error fetching builder properties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteBuilderProperty = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "builder") {
      return res.status(403).json({ error: "Access denied: Builders only" });
    }
    const userId = decoded.userId;
    const { id } = req.params;

    const [properties] = await pool.query(
      'SELECT builder_id FROM properties WHERE property_id = ?',
      [id]
    );
    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (properties[0].builder_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this property' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query('DELETE FROM property_images WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM properties WHERE property_id = ?', [id]);

      await connection.commit();
      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getBuilderDetails,
  updateBuilderDetails,
  getBuilderEvents,
  getBuilderProperties,
  deleteBuilderProperty,
};