// Modified builderController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getMobileVariations } = require('../utils/phoneUtils');

const getBuilderDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'builder') {
      return res.status(403).json({ error: 'Access denied: Builder only' });
    }

    let builders;
    if (decoded.is_sub_builder) {
      if (decoded.is_secondary) {
        [builders] = await pool.query(
          'SELECT id, name, contact_person_2 AS contact_person, mobile_number_2 AS mobile_number, email_2 AS email FROM sub_builders WHERE id = ?',
          [decoded.userId]
        );
      } else {
        [builders] = await pool.query(
          'SELECT id, name, contact_person, mobile_number, email FROM sub_builders WHERE id = ?',
          [decoded.userId]
        );
      }
    } else {
      if (decoded.is_secondary) {
        [builders] = await pool.query(
          'SELECT id, name, contact_person_2 AS contact_person, mobile_number_2 AS mobile_number, email_2 AS email FROM builders WHERE id = ?',
          [decoded.userId]
        );
      } else {
        [builders] = await pool.query(
          'SELECT id, name, contact_person, mobile_number, email FROM builders WHERE id = ?',
          [decoded.userId]
        );
      }
    }

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

    if (!/^\+?\d{10,15}$/.test(mobile_number)) {
      return res.status(400).json({ error: 'Mobile number must be between 10 and 15 digits' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const mobileVariations = getMobileVariations(mobile_number);
    const table = decoded.is_sub_builder ? 'sub_builders' : 'builders';
    const [existing] = await pool.query(
      `SELECT id 
       FROM ${table} 
       WHERE (mobile_number IN (?) OR mobile_number_2 IN (?) OR (email IS NOT NULL AND email = ?) OR (email_2 IS NOT NULL AND email_2 = ?)) 
       AND id != ?`,
      [mobileVariations, mobileVariations, email, email, builderId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Mobile number or email is already in use by another account'
      });
    }

    let query = `
      UPDATE ${table} 
      SET name = ?, 
          ${decoded.is_secondary ? 'email_2' : 'email'} = ?, 
          ${decoded.is_secondary ? 'mobile_number_2' : 'mobile_number'} = ?, 
          ${decoded.is_secondary ? 'contact_person_2' : 'contact_person'} = ?
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
      `SELECT id, name, ${decoded.is_secondary ? 'email_2 AS email' : 'email'}, 
              ${decoded.is_secondary ? 'mobile_number_2 AS mobile_number' : 'mobile_number'}, 
              ${decoded.is_secondary ? 'contact_person_2 AS contact_person' : 'contact_person'} 
       FROM ${table} 
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

    const builderId = decoded.is_sub_builder ? decoded.parent_builder_id : decoded.userId;

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

    // ====================== NEW: Attach variants ======================
    const variantsMap = {};
    if (properties.length > 0) {
      const propertyIds = properties.map(p => p.property_id);
      const [variantRows] = await pool.query(`
        SELECT property_id, apartment_type, price, sqft 
        FROM property_variants 
        WHERE property_id IN (?)
        ORDER BY apartment_type ASC
      `, [propertyIds]);

      variantRows.forEach(row => {
        if (!variantsMap[row.property_id]) variantsMap[row.property_id] = [];
        variantsMap[row.property_id].push({
          apartment_type: row.apartment_type,
          price: row.price ? parseFloat(row.price) : null,
          sqft: row.sqft ? Number(row.sqft) : null,
        });
      });
    }

    // Attach variants to each property
    properties.forEach(prop => {
      prop.variants = variantsMap[prop.property_id] || [];
    });
    // =================================================================

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
    const userId = decoded.is_sub_builder ? decoded.parent_builder_id : decoded.userId;
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

// Add this function to builderController.js

// src/controller/builderController.js

const getBuilderStallInterests = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "builder") {
      return res.status(403).json({ error: "Access denied: Builders only" });
    }

    const builderId = decoded.is_sub_builder ? decoded.parent_builder_id : decoded.userId;
    const { eventId } = req.query; // Get eventId from query string

    let query = `
      SELECT 
        bsi.id,
        bsi.created_at AS interest_date,
        bsi.is_attended,
        pe.event_name,
        pe.city,
        pe.state,
        st.stall_type_name,
        st.stall_price,
        buy.name AS buyer_name,
        buy.mobile_number AS buyer_mobile,
        buy.email AS buyer_email
      FROM buyer_stall_interest bsi
      INNER JOIN stall_type st       ON st.stall_type_id = bsi.stall_type_id
      INNER JOIN stall s             ON s.stall_type_id = st.stall_type_id 
                                     AND s.event_id = st.event_id
      INNER JOIN property_events pe  ON pe.id = st.event_id
      INNER JOIN buyers buy          ON buy.id = bsi.buyer_id
      WHERE s.builder_id = ?
    `;

    const params = [builderId];

    // If an eventId is provided, filter the SQL results immediately
    if (eventId) {
      query += ` AND pe.id = ?`;
      params.push(eventId);
    }

    query += ` ORDER BY bsi.created_at DESC`;

    const [interests] = await pool.query(query, params);
    res.json({ interests });

  } catch (err) {
    console.error("Error fetching stall interests:", err);
    res.status(500).json({ error: "Failed to load buyer interests" });
  }
};

const getBuilderBookedStallsCount = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "builder") {
      return res.status(403).json({ error: "Access denied: Builders only" });
    }

    const builderId = decoded.is_sub_builder ? decoded.parent_builder_id : decoded.userId;

    const [result] = await pool.query(
      `SELECT COUNT(*) AS bookedStalls FROM stall WHERE builder_id = ?`,
      [builderId]
    );

    res.status(200).json({ bookedStalls: result[0].bookedStalls || 0 });
  } catch (error) {
    console.error("Error fetching booked stalls count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   GET BUILDER DASHBOARD STATS
========================= */
const getBuilderDashboardStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "builder") {
      return res.status(403).json({ error: "Access denied: Builders only" });
    }

    const builderId = decoded.is_sub_builder ? decoded.parent_builder_id : decoded.userId;

    // 1. Total Properties Count
    const [propCount] = await pool.query(
      "SELECT COUNT(*) as total FROM properties WHERE builder_id = ?",
      [builderId]
    );

    // 2. Events Attended Count (Unique events where builder has booked a stall)
    const [eventCount] = await pool.query(
      "SELECT COUNT(DISTINCT event_id) as total FROM stall WHERE builder_id = ?",
      [builderId]
    );

    // 3. Buyer Interests Count
    const [interestCount] = await pool.query(
      `SELECT COUNT(*) as total FROM buyer_stall_interest bsi
       INNER JOIN stall s ON s.stall_type_id = bsi.stall_type_id
       WHERE s.builder_id = ?`,
      [builderId]
    );

    // 4. Month-wise Property Postings (Last 6 Months)
    const [monthlyStats] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month,
        COUNT(*) as count
      FROM properties
      WHERE builder_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY MIN(created_at) ASC
    `, [builderId]);

    res.json({
      totals: {
        properties: propCount[0].total,
        eventsAttended: eventCount[0].total,
        interests: interestCount[0].total
      },
      monthlyStats
    });
  } catch (error) {
    console.error("Builder Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createBuilder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let isAuthorized = false;
    if (decoded.account_type === "admin") {
      isAuthorized = true;
    } else if (decoded.account_type === "builder" && !decoded.is_sub_builder) {
      const [requester] = await pool.query("SELECT builder_type FROM builders WHERE id = ?", [decoded.userId]);
      if (requester.length && requester[0].builder_type === "BuilderAdmin") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Handle dynamic array of sub-builders from Builder Portal
    if (req.body.subBuilders && Array.isArray(req.body.subBuilders)) {
      const subBuilders = req.body.subBuilders;
      const builderType = "Builder";
      const parentBuilderId = decoded.userId;

      for (const builder of subBuilders) {
        if (!builder.name || !builder.mobile_number || !builder.email || !builder.password) {
          continue; // Skip invalid entries
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(builder.password, salt);

        const checkMobiles = getMobileVariations(builder.mobile_number);
        const [existing] = await pool.query(
          "SELECT id FROM builders WHERE mobile_number IN (?) OR email = ?",
          [checkMobiles, builder.email]
        );

        if (existing.length === 0) {
          await pool.query(
            "INSERT INTO sub_builders (name, contact_person, mobile_number, email, password, parent_builder_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [builder.name, builder.name, builder.mobile_number, builder.email, hashedPassword, parentBuilderId]
          );
        }
      }
      return res.status(201).json({ message: "Builders created successfully" });
    }

    // Fallback: Legacy single-builder creation (for Admin Portal)
    const { name, contact_person, mobile_number, email, password, contact_person_2, email_2, mobile_number_2 } = req.body;

    if (!name || !contact_person || !mobile_number || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const checkMobiles = [
      ...getMobileVariations(mobile_number),
      ...(mobile_number_2 ? getMobileVariations(mobile_number_2) : [])
    ];
    const checkEmails = [email, email_2].filter(Boolean);

    const [existing] = await pool.query(
      "SELECT id FROM builders WHERE mobile_number IN (?) OR email IN (?) OR (mobile_number_2 IS NOT NULL AND mobile_number_2 IN (?)) OR (email_2 IS NOT NULL AND email_2 IN (?))",
      [checkMobiles, checkEmails, checkMobiles, checkEmails]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Builder with this email/mobile already exists" });
    }

    const parentBuilderId = decoded.account_type === "admin" ? null : decoded.userId;

    if (decoded.account_type === "admin") {
      await pool.query(
        "INSERT INTO builders (name, contact_person, mobile_number, email, password, builder_type, contact_person_2, email_2, mobile_number_2, parent_builder_id, created_at) VALUES (?, ?, ?, ?, ?, 'BuilderAdmin', ?, ?, ?, ?, NOW())",
        [name, contact_person, mobile_number, email, hashedPassword, contact_person_2 || null, email_2 || null, mobile_number_2 || null, parentBuilderId]
      );
    } else {
      await pool.query(
        "INSERT INTO sub_builders (name, contact_person, mobile_number, email, password, contact_person_2, email_2, mobile_number_2, parent_builder_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [name, contact_person, mobile_number, email, hashedPassword, contact_person_2 || null, email_2 || null, mobile_number_2 || null, parentBuilderId]
      );
    }

    res.status(201).json({ message: "Builder created successfully" });
  } catch (error) {
    console.error("Create builder error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBuilders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "builder" || decoded.is_sub_builder) return res.status(403).json({ error: "Access denied" });

    // Check if the current requester is a BuilderAdmin
    const [requester] = await pool.query("SELECT builder_type FROM builders WHERE id = ?", [decoded.userId]);
    if (!requester.length || requester[0].builder_type !== "BuilderAdmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const [builders] = await pool.query(
      "SELECT id, name, contact_person, mobile_number, email, 'Builder' AS builder_type, contact_person_2, email_2, mobile_number_2, created_at FROM sub_builders WHERE parent_builder_id = ? ORDER BY created_at DESC",
      [decoded.userId]
    );

    res.json(builders);
  } catch (error) {
    console.error("Get all builders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteBuilderByAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let isAuthorized = false;
    if (decoded.account_type === "admin") {
      isAuthorized = true;
    } else if (decoded.account_type === "builder" && !decoded.is_sub_builder) {
      const [requester] = await pool.query("SELECT builder_type FROM builders WHERE id = ?", [decoded.userId]);
      if (requester.length && requester[0].builder_type === "BuilderAdmin") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { builderId } = req.params;

    // Prevent deleting self
    if (parseInt(builderId) === decoded.userId && decoded.account_type === "builder") {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    if (decoded.account_type === "admin") {
      await pool.query("DELETE FROM builders WHERE id = ?", [builderId]);
    } else {
      await pool.query("DELETE FROM sub_builders WHERE id = ?", [builderId]);
    }

    res.json({ message: "Builder deleted successfully" });
  } catch (error) {
    console.error("Delete builder error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateBuilderByAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if requester is either a super admin OR a BuilderAdmin
    let isAuthorized = false;
    if (decoded.account_type === "admin") {
      isAuthorized = true;
    } else if (decoded.account_type === "builder" && !decoded.is_sub_builder) {
      const [requester] = await pool.query("SELECT builder_type FROM builders WHERE id = ?", [decoded.userId]);
      if (requester.length && requester[0].builder_type === "BuilderAdmin") {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { builderId } = req.params;
    const { name, contact_person, mobile_number, email, contact_person_2, email_2, mobile_number_2 } = req.body;

    if (!name || !contact_person || !mobile_number || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkMobiles = [
      ...getMobileVariations(mobile_number),
      ...(mobile_number_2 ? getMobileVariations(mobile_number_2) : [])
    ];
    const checkEmails = [email, email_2].filter(Boolean);

    const table = decoded.account_type === "admin" ? "builders" : "sub_builders";

    const [existing] = await pool.query(
      `SELECT id FROM ${table} WHERE (mobile_number IN (?) OR email IN (?) OR (mobile_number_2 IS NOT NULL AND mobile_number_2 IN (?)) OR (email_2 IS NOT NULL AND email_2 IN (?))) AND id != ?`,
      [checkMobiles, checkEmails, checkMobiles, checkEmails, builderId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Builder with this email/mobile already exists" });
    }

    await pool.query(
      `UPDATE ${table} SET name = ?, contact_person = ?, mobile_number = ?, email = ?, contact_person_2 = ?, email_2 = ?, mobile_number_2 = ? WHERE id = ?`,
      [name, contact_person, mobile_number, email, contact_person_2 || null, email_2 || null, mobile_number_2 || null, builderId]
    );

    res.json({ message: "Builder updated successfully" });
  } catch (error) {
    console.error("Update builder error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getBuilderDetails,
  updateBuilderDetails,
  getBuilderEvents,
  getBuilderProperties,
  deleteBuilderProperty,
  getBuilderStallInterests,
  getBuilderBookedStallsCount,
  getBuilderDashboardStats,
  createBuilder,
  getAllBuilders,
  deleteBuilderByAdmin,
  updateBuilderByAdmin
};