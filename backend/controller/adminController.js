const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      "SELECT id, name, mobile_number, email FROM admins WHERE id = ?",
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

    if (mobile_number.length !== 10 || !/^\d+$/.test(mobile_number)) {
      return res
        .status(400)
        .json({ error: "Mobile number must be exactly 10 digits" });
    }

    /* Check duplicate email / mobile */
    const [existing] = await pool.query(
      "SELECT id FROM admins WHERE (mobile_number = ? OR email = ?) AND id != ?",
      [mobile_number, email, decoded.userId]
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
       WHERE id = 1
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(rows[0]);
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
      `SELECT id, name, mobile_number, email, created_at
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
      `SELECT id, name, contact_person, mobile_number, email, created_at
       FROM builders
       ORDER BY created_at DESC`
    );

    res.json(builders);
  } catch (error) {
    console.error("Get builders error:", error);
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
        events: eventCount[0].total
      },
      monthlyStats
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAdminDetails,
  updateAdminDetails,
  getWhatsappAdmin,
  getAllUsers,
  getAllEvents,
  getEventParticipants,
  getAllBuilders,
  getDashboardStats
};
