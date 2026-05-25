const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getMobileVariations } = require("../utils/phoneUtils");

/* =========================
   GET ADMIN DETAILS
========================= */
const getAdminDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const [admins] = await pool.query(
      "SELECT id, name, mobile_number, email, admin_type FROM admins WHERE id = ?",
      [decoded.userId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      ...admins[0],
      account_type: "admin",
    });
  } catch (error) {
    console.error("Get admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   UPDATE ADMIN DETAILS
========================= */
const updateAdminDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { name, mobile_number, email, password } = req.body;

    if (!name || !mobile_number || !email) {
      return res
        .status(400)
        .json({ error: "Name, mobile number and email are required" });
    }

    if (!/^\+?\d{10,15}$/.test(mobile_number)) {
      return res
        .status(400)
        .json({ error: "Mobile number must be between 10 and 15 digits" });
    }

    /* Check duplicate email / mobile */
    const mobileVariations = getMobileVariations(mobile_number);
    const [existing] = await pool.query(
      "SELECT id FROM admins WHERE (mobile_number IN (?) OR (email IS NOT NULL AND email = ?)) AND id != ?",
      [mobileVariations, email, decoded.userId]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Mobile number or email already in use" });
    }

    /* Update with or without password */
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        `UPDATE admins 
         SET name = ?, mobile_number = ?, email = ?, password = ?
         WHERE id = ?`,
        [name, mobile_number, email, hashedPassword, decoded.userId]
      );
    } else {
      await pool.query(
        `UPDATE admins 
         SET name = ?, mobile_number = ?, email = ?
         WHERE id = ?`,
        [name, mobile_number, email, decoded.userId]
      );
    }

    const [updated] = await pool.query(
      "SELECT id, name, mobile_number, email FROM admins WHERE id = ?",
      [decoded.userId]
    );

    res.json({
      ...updated[0],
      account_type: "admin",
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   GET WHATSAPP ADMIN
========================= */
const getWhatsappAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT name, mobile_number
       FROM admins
       WHERE admin_type = 'SuperAdmin' OR id = 1
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const [settings] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_send_to_builder' LIMIT 1"
    );

    const sendToBuilder = settings.length > 0 ? (settings[0].setting_value === 'true') : false;

    // Fetch the builderAdmin details if they exist
    const [builderAdminRows] = await pool.query(
      `SELECT name, mobile_number
       FROM admins
       WHERE admin_type = 'builderAdmin'
       LIMIT 1`
    );

    const builderAdmin = builderAdminRows.length > 0 ? builderAdminRows[0] : null;

    res.json({
      name: rows[0].name,
      mobile_number: rows[0].mobile_number,
      whatsapp_send_to_builder: sendToBuilder,
      builder_admin_name: builderAdmin ? builderAdmin.name : null,
      builder_admin_mobile: builderAdmin ? builderAdmin.mobile_number : null
    });
  } catch (error) {
    console.error("WhatsApp admin fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: GET ALL BUYERS (USERS)
========================= */
const getAllUsers = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const [buyers] = await pool.query(
      `SELECT id, name, mobile_number, email, gender, dob, city, country, created_at
       FROM buyers
       ORDER BY created_at DESC`
    );

    res.json(buyers);
  } catch (error) {
    console.error("Get buyers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: GET SINGLE USER (BUYER)
========================= */
const getSingleUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { userId } = req.params;

    const [buyers] = await pool.query(
      `SELECT id, name, mobile_number, email, gender, dob, city, country, photo, created_at
       FROM buyers
       WHERE id = ?`,
      [userId]
    );

    if (buyers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const buyer = buyers[0];
    if (buyer.photo) {
      buyer.photo = Buffer.from(buyer.photo).toString('base64');
    }

    res.json(buyer);
  } catch (error) {
    console.error("Get single user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: GET ALL EVENTS (for dropdown)
========================= */
const getAllEvents = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    /**
     * Updated query:
     * 1. Fetches event details.
     * 2. Uses a subquery to count rows in the 'stall' table 
     * where builder_id is NOT NULL (Booked Stalls).
     */
    const [events] = await pool.query(
      `SELECT 
        e.id, e.event_name, e.event_type, e.city, e.state, 
        e.start_date, e.end_date, e.start_time, e.end_time, e.stall_count,
        (SELECT COUNT(*) FROM stall s WHERE s.event_id = e.id AND s.builder_id IS NOT NULL) AS booked_stall_count
       FROM property_events e
       ORDER BY e.start_date DESC, e.created_at DESC`
    );

    res.json(events);
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/* =========================
   ADMIN: EVENT PARTICIPANTS
========================= */
const getEventParticipants = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { eventId } = req.params;

    const [rows] = await pool.query(
      `SELECT ep.id, ep.name, ep.phone, ep.email, ep.created_at, ep.is_attended,
              b.name AS buyer_name
       FROM event_participants ep
       LEFT JOIN buyers b ON b.id = ep.buyer_id
       WHERE ep.event_id = ?
       ORDER BY ep.created_at DESC`,
      [eventId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Event participants error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: GET ALL BUILDERS
========================= */
const getAllBuilders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const [builders] = await pool.query(
      `SELECT 
        b.id, b.name, b.contact_person, b.mobile_number, b.email, b.created_at, b.team_members,
        COUNT(p.property_id) AS total_properties
       FROM builders b
       LEFT JOIN properties p ON p.builder_id = b.id
       GROUP BY b.id, b.name, b.contact_person, b.mobile_number, b.email, b.team_members, b.created_at
       ORDER BY b.created_at DESC`
    );

    res.json(builders);
  } catch (error) {
    console.error("Get builders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: UPDATE A SPECIFIC USER
========================= */
const adminUpdateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { userId } = req.params;
    const { name, email, mobile_number, gender, dob, city, country, photo, password } = req.body;

    if (!name || !email || !mobile_number) {
      return res.status(400).json({ error: "Name, email and mobile number are required" });
    }

    // Check for duplicate mobile or email (excluding this user)
    const mobileVariations = getMobileVariations(mobile_number);
    const [existing] = await pool.query(
      `SELECT id FROM buyers WHERE (mobile_number IN (?) OR (email IS NOT NULL AND email = ?)) AND id != ?`,
      [mobileVariations, email, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Mobile number or email already in use" });
    }

    let photoBuffer = null;
    if (photo) {
      const cleanBase64 = photo.includes(',') ? photo.split(',')[1] : photo;
      photoBuffer = Buffer.from(cleanBase64, 'base64');
    }

    let query = `
      UPDATE buyers 
      SET name = ?, email = ?, mobile_number = ?, gender = ?, dob = ?, city = ?, country = ?, photo = ?
    `;
    let params = [name, email, mobile_number, gender || null, dob || null, city || null, country || null, photoBuffer];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      query += ", password = ?";
      params.push(hashedPassword);
    }

    query += " WHERE id = ?";
    params.push(userId);

    await pool.query(query, params);
    res.json({ message: "User updated successfully" });

  } catch (error) {
    console.error("Admin: Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   GET DASHBOARD STATISTICS
========================= */
const getDashboardStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    // 1. Get Total Counts
    const [userCount] = await pool.query("SELECT COUNT(*) as total FROM buyers");
    const [builderCount] = await pool.query("SELECT COUNT(*) as total FROM builders");
    const [propertyCount] = await pool.query("SELECT COUNT(*) as total FROM properties");
    const [eventCount] = await pool.query("SELECT COUNT(*) as total FROM property_events");
    const [blogCount] = await pool.query("SELECT COUNT(*) as total FROM blogs");

    // 2. Get Month-wise Registrations (Last 6 Months)
    // This query generates a list of counts grouped by month
    const [monthlyStats] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month,
        SUM(CASE WHEN type = 'property' THEN 1 ELSE 0 END) as properties,
        SUM(CASE WHEN type = 'buyer' THEN 1 ELSE 0 END) as buyers
      FROM (
        SELECT created_at, 'property' as type FROM properties
        UNION ALL
        SELECT created_at, 'buyer' as type FROM buyers
      ) as combined
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY MIN(created_at) ASC
    `);

    res.json({
      totals: {
        users: userCount[0].total,
        builders: builderCount[0].total,
        properties: propertyCount[0].total,
        events: eventCount[0].total,
        blogs: blogCount[0].total
      },
      monthlyStats
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: CREATE NEW ADMIN
========================= */
const createAdmin = async (req, res) => {
  try {
    const { name, mobile_number, email, password, admin_type } = req.body;

    if (!name || !mobile_number || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const finalAdminType = admin_type || "Admin";
    if (!["Admin", "SuperAdmin", "builderAdmin"].includes(finalAdminType)) {
      return res.status(400).json({ error: "Invalid admin type" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mobileVariations = getMobileVariations(mobile_number);
    const [existing] = await pool.query(
      "SELECT id FROM admins WHERE mobile_number IN (?) OR (email IS NOT NULL AND email = ?)",
      [mobileVariations, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Admin with this email/mobile already exists" });
    }

    await pool.query(
      "INSERT INTO admins (name, mobile_number, email, password, admin_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [name, mobile_number, email, hashedPassword, finalAdminType]
    );

    if (finalAdminType === "builderAdmin") {
      // Also insert into builders table to ensure database schema compatibility
      await pool.query(
        "INSERT INTO builders (name, contact_person, mobile_number, email, password, builder_type) VALUES (?, 'Admin', ?, ?, ?, 'BuilderAdmin')",
        [name, mobile_number, email || null, hashedPassword]
      );
    }

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



/* =========================
   ADMIN: GET ALL ADMINS
========================= */
const getAllAdmins = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if the current requester is a SuperAdmin
    const [requester] = await pool.query("SELECT admin_type FROM admins WHERE id = ?", [decoded.userId]);
    if (!requester.length || requester[0].admin_type !== "SuperAdmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const [admins] = await pool.query(
      "SELECT id, name, mobile_number, email, admin_type, created_at FROM admins ORDER BY created_at DESC"
    );

    res.json(admins);
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: DELETE ADMIN
========================= */
const deleteAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if the current requester is a SuperAdmin
    const [requester] = await pool.query("SELECT admin_type FROM admins WHERE id = ?", [decoded.userId]);
    if (!requester.length || requester[0].admin_type !== "SuperAdmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { adminId } = req.params;

    // Prevent deleting self
    if (parseInt(adminId) === decoded.userId) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    // Get old admin details for syncing/cleanup
    const [oldAdmins] = await pool.query("SELECT email, mobile_number, admin_type FROM admins WHERE id = ?", [adminId]);
    if (oldAdmins.length > 0 && oldAdmins[0].admin_type === "builderAdmin") {
      const mobileVariations = getMobileVariations(oldAdmins[0].mobile_number);
      // Delete the corresponding builder from builders table
      await pool.query("DELETE FROM builders WHERE mobile_number IN (?) OR email = ?", [mobileVariations, oldAdmins[0].email || '']);
    }

    await pool.query("DELETE FROM admins WHERE id = ?", [adminId]);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: GET SPECIFIC ADMIN
========================= */
const getSpecificAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { adminId } = req.params;

    const [admins] = await pool.query(
      "SELECT id, name, mobile_number, email, admin_type FROM admins WHERE id = ?",
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(admins[0]);
  } catch (error) {
    console.error("Get specific admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   ADMIN: UPDATE SPECIFIC ADMIN
========================= */
const updateSpecificAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if the current requester is a SuperAdmin
    const [requester] = await pool.query("SELECT admin_type FROM admins WHERE id = ?", [decoded.userId]);
    if (!requester.length || requester[0].admin_type !== "SuperAdmin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { adminId } = req.params;
    const { name, email, mobile_number, admin_type, password } = req.body;

    if (!name || !email || !mobile_number || !admin_type) {
      return res.status(400).json({ error: "Name, email, mobile number and admin type are required" });
    }

    if (!["Admin", "SuperAdmin", "builderAdmin"].includes(admin_type)) {
      return res.status(400).json({ error: "Invalid admin type" });
    }

    // Get old admin details for syncing/cleanup before update
    const [oldAdmins] = await pool.query("SELECT name, email, mobile_number, admin_type, password FROM admins WHERE id = ?", [adminId]);
    if (oldAdmins.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const oldAdmin = oldAdmins[0];

    // Check for duplicate mobile or email (excluding this admin)
    const mobileVariations = getMobileVariations(mobile_number);
    const [existing] = await pool.query(
      `SELECT id FROM admins WHERE (mobile_number IN (?) OR (email IS NOT NULL AND email = ?)) AND id != ?`,
      [mobileVariations, email, adminId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Mobile number or email already in use" });
    }

    let query = `
      UPDATE admins 
      SET name = ?, email = ?, mobile_number = ?, admin_type = ?
    `;
    let params = [name, email, mobile_number, admin_type];

    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
      query += ", password = ?";
      params.push(hashedPassword);
    }

    query += " WHERE id = ?";
    params.push(adminId);

    await pool.query(query, params);

    // Sync with builders table
    const oldMobileVariations = getMobileVariations(oldAdmin.mobile_number);
    if (admin_type === "builderAdmin") {
      const newMobileVariations = getMobileVariations(mobile_number);
      const [existingBuilders] = await pool.query(
        "SELECT id FROM builders WHERE mobile_number IN (?) OR email = ? OR mobile_number IN (?) OR email = ?",
        [oldMobileVariations, oldAdmin.email || '', newMobileVariations, email || '']
      );

      const finalPassword = hashedPassword || oldAdmin.password;

      if (existingBuilders.length > 0) {
        await pool.query(
          "UPDATE builders SET name = ?, email = ?, mobile_number = ?, password = ?, builder_type = ? WHERE id = ?",
          [name, email, mobile_number, finalPassword, "BuilderAdmin", existingBuilders[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO builders (name, contact_person, mobile_number, email, password, builder_type) VALUES (?, 'Admin', ?, ?, ?, 'BuilderAdmin')",
          [name, mobile_number, email || null, finalPassword]
        );
      }
    } else if (oldAdmin.admin_type === "builderAdmin") {
      // Demote the builder if they were a builderAdmin before but aren't anymore
      await pool.query(
        "UPDATE builders SET builder_type = 'Builder' WHERE mobile_number IN (?) OR email = ?",
        [oldMobileVariations, oldAdmin.email || '']
      );
    }

    res.json({ message: "Admin updated successfully" });

  } catch (error) {
    console.error("Admin: Update admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSettings = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const [settings] = await pool.query(
      "SELECT setting_key, setting_value FROM settings"
    );

    // Map rows to key-value object
    const settingsObj = {};
    settings.forEach(row => {
      settingsObj[row.setting_key] = row.setting_value === "true" || row.setting_value === true;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if user is SuperAdmin
    const [admins] = await pool.query(
      "SELECT admin_type FROM admins WHERE id = ?",
      [decoded.userId]
    );
    if (admins.length === 0 || admins[0].admin_type !== "SuperAdmin") {
      return res.status(403).json({ error: "Access denied - SuperAdmin only" });
    }

    const { whatsapp_send_to_builder } = req.body;
    if (whatsapp_send_to_builder !== undefined) {
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES ('whatsapp_send_to_builder', ?) " +
        "ON DUPLICATE KEY UPDATE setting_value = ?",
        [String(whatsapp_send_to_builder), String(whatsapp_send_to_builder)]
      );
    }

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAdminDetails,
  updateAdminDetails,
  getWhatsappAdmin,
  getAllUsers,
  getSingleUser,
  getAllEvents,
  getEventParticipants,
  getAllBuilders,
  adminUpdateUser,
  getDashboardStats,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  getSpecificAdmin,
  updateSpecificAdmin,
  getSettings,
  updateSettings
};