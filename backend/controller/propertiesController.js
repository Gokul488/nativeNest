// --- START OF FILE propertiesController.js ---

const pool = require('../db');
const jwt = require('jsonwebtoken');

const createProperty = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const {
      title,
      description,
      price,
      address,
      city,
      state,
      country,
      pincode,
      property_type,
      builder_name,
      sqft,
      amenities = [],
      other_amenity
    } = req.body;

    if (!title || !description || !price || !address || !city || !state || !country || !pincode || !property_type || !builder_name) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Optional: make sqft required or validate
    if (sqft && (isNaN(sqft) || sqft <= 0)) {
      return res.status(400).json({ error: 'Sqft must be a positive number' });
    }

    const validPropertyTypes = ['Villas', 'Apartment', 'Plots', 'Commercial'];
    if (!validPropertyTypes.includes(property_type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    // Validate amenities - must be array of numbers
    if (!Array.isArray(amenities)) {
      return res.status(400).json({ error: 'Amenities must be an array' });
    }

    const coverImage = req.files?.['cover_image']?.[0]?.buffer || null;
    const video = req.files?.['video']?.[0] || null;
    const images = req.files && req.files['images[]'] ? 
      (Array.isArray(req.files['images[]']) ? req.files['images[]'] : [req.files['images[]']]) 
      : [];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [propertyResult] = await connection.query(
        `INSERT INTO properties (admin_id, builder_name, title, description, price, address, city, state, country, pincode, property_type, sqft, cover_image, video, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [userId, builder_name, title, description, price, address, city, state, country, pincode, property_type, sqft || null, coverImage, video?.buffer || null]
      );

      const propertyId = propertyResult.insertId;

      // Insert property images
      if (images.length > 0) {
        for (const image of images) {
          if (image && image.buffer) {
            await connection.query(
              'INSERT INTO property_images (property_id, image) VALUES (?, ?)',
              [propertyId, image.buffer]
            );
          }
        }
      }

      // Insert DB amenities
      if (amenities.length > 0) {
        for (const amenityId of amenities) {
          const [amenityCheck] = await connection.query(
            'SELECT amenity_id FROM amenities WHERE amenity_id = ?',
            [amenityId]
          );
          
          if (amenityCheck.length > 0) {
            await connection.query(
              'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
              [propertyId, amenityId]
            );
          }
        }
      }

      // Handle custom "Other" amenity
      if (other_amenity && other_amenity.trim()) {
        const customName = other_amenity.trim();

        // Check if custom amenity already exists (case-insensitive)
        const [existing] = await connection.query(
          'SELECT amenity_id FROM amenities WHERE LOWER(name) = LOWER(?)',
          [customName]
        );

        let customAmenityId;
        if (existing.length > 0) {
          customAmenityId = existing[0].amenity_id;
        } else {
          const [insertResult] = await connection.query(
            'INSERT INTO amenities (name, icon) VALUES (?, ?)',
            [customName, null]
          );
          customAmenityId = insertResult.insertId;
        }

        // Link custom amenity to property
        await connection.query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
          [propertyId, customAmenityId]
        );
      }

      await connection.commit();

      res.status(201).json({
        message: 'Property created successfully',
        propertyId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating property:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPropertyTypes = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT COLUMN_TYPE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'properties' AND COLUMN_NAME = 'property_type'`
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Property type column not found' });
    }

    const enumString = result[0].COLUMN_TYPE;
    const propertyTypes = enumString
      .slice(5, -1)
      .split(',')
      .map(type => type.slice(1, -1));

    res.status(200).json({ propertyTypes });
  } catch (error) {
    console.error('Error fetching property types:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAmenities = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT amenity_id, name, icon 
       FROM amenities 
       ORDER BY name`
    );
    res.status(200).json({ amenities: result });
  } catch (error) {
    console.error('Error fetching amenities:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBuilders = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT builder_name FROM properties WHERE builder_name IS NOT NULL`
  );
  res.json({ builders: rows.map(r => r.builder_name) });
};

const getMaxPrice = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT MAX(price) AS maxPrice FROM properties');
    const maxPrice = result[0].maxPrice || 0;
    res.status(200).json({ maxPrice });
  } catch (error) {
    console.error('Error fetching max price:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFeaturedProperties = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { location, priceRange, propertyType, builder } = req.query;

    let query = `
      SELECT
  p.property_id AS id,
  p.title,
  p.price,
  p.city,
  p.pincode,
  p.property_type,
  p.sqft,
  p.created_at,
  p.cover_image,
  p.builder_name AS builderName
FROM properties p

    `;
    const params = [];
    const conditions = [];

    if (location) {
      conditions.push(`(p.city LIKE ? OR p.state LIKE ? OR p.country LIKE ?)`);
      const searchLocation = `%${location}%`;
      params.push(searchLocation, searchLocation, searchLocation);
    }

    if (priceRange) {
      const [minPriceStr, maxPriceStr] = priceRange.split('-');
      const minPrice = Number(minPriceStr);
      const maxPrice = Number(maxPriceStr);

      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        conditions.push(`p.price BETWEEN ? AND ?`);
        params.push(minPrice, maxPrice);
      } else if (!isNaN(minPrice) && priceRange.endsWith('+')) {
        conditions.push(`p.price >= ?`);
        params.push(minPrice);
      }
    }

    if (propertyType && propertyType !== 'All') {
      conditions.push(`p.property_type = ?`);
      params.push(propertyType);
    }

    if (builder && builder !== 'All') {
      conditions.push(`p.builder_name = ?`);  // Fixed: was joining admins incorrectly
      params.push(builder);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY p.created_at DESC`;
    const [properties] = await connection.query(query, params);

    if (properties.length === 0) {
      return res.status(200).json({ properties: [] });
    }

    const featuredProperties = await Promise.all(
      properties.map(async (property) => {
        const [images] = await connection.query(
          `SELECT image 
           FROM property_images 
           WHERE property_id = ? AND image_id = 1`,
          [property.id]
        );

        let imageBase64 = null;
        if (images.length > 0 && images[0].image) {
          imageBase64 = `data:image/jpeg;base64,${Buffer.from(images[0].image).toString('base64')}`;
        } else if (property.cover_image) {
          imageBase64 = `data:image/jpeg;base64,${Buffer.from(property.cover_image).toString('base64')}`;
        }

        return {
          id: property.id,
          title: property.title,
          city: property.city,
          price: parseFloat(property.price),
          pincode: property.pincode,
          property_type: property.property_type,
          sqft: property.sqft || null,
          created_at: property.created_at,
          img: imageBase64,
          builderName: property.builderName,
        };
      })
    );

    res.status(200).json({ properties: featuredProperties });
  } catch (error) {
    console.error('Error fetching featured properties:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

const getPropertyById = async (req, res) => {
  const { id } = req.params;

  // Validate property ID
  const propertyId = parseInt(id, 10);
  if (isNaN(propertyId) || propertyId <= 0) {
    return res.status(400).json({ error: "Invalid property ID" });
  }

  /* =========================
     IDENTIFY USER TYPE
  ========================= */
  const token = req.headers.authorization?.split(" ")[1];
  const guestId = req.query.guestId || null;

  let buyerId = null;
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.account_type === "buyer") {
        buyerId = decoded.userId;
      }

      if (decoded.account_type === "admin") {
        isAdmin = true; // 🚫 Admin views should NOT be tracked
      }
    } catch (err) {
      console.log("Invalid token, treating as guest");
    }
  }

  const ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /* =========================
       TRACK VIEW (BUYER / GUEST ONLY)
    ========================= */
    if (!isAdmin) {
      const [existingView] = await connection.query(
        `
        SELECT id FROM property_views
        WHERE property_id = ?
          AND (
            (buyer_id IS NOT NULL AND buyer_id = ?)
            OR
            (buyer_id IS NULL AND guest_id = ?)
          )
          AND viewed_at >= NOW() - INTERVAL 1 DAY
        LIMIT 1
        `,
        [propertyId, buyerId, guestId]
      );

      if (existingView.length === 0) {
        await connection.query(
          `
          INSERT INTO property_views
          (property_id, buyer_id, guest_id, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            propertyId,
            buyerId,
            buyerId ? null : guestId,
            ipAddress,
            userAgent
          ]
        );

        await connection.query(
          "UPDATE properties SET views = views + 1 WHERE property_id = ?",
          [propertyId]
        );
      }
    }

    /* =========================
       FETCH PROPERTY DETAILS
    ========================= */
    const [properties] = await connection.query(
      `
      SELECT
        p.property_id AS id,
        p.title,
        p.description,
        p.price,
        p.address,
        p.city,
        p.state,
        p.country,
        p.pincode,
        p.property_type,
        p.builder_name AS builderName,
        p.sqft,
        p.created_at,
        p.cover_image,
        p.video,
        p.views,
        a.mobile_number,
        a.email
      FROM properties p
      LEFT JOIN admins a ON p.admin_id = a.id
      WHERE p.property_id = ?
      `,
      [propertyId]
    );

    if (properties.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Property not found" });
    }

    const property = properties[0];

    /* =========================
       FETCH PROPERTY IMAGES
    ========================= */
    const [images] = await connection.query(
      `SELECT image FROM property_images WHERE property_id = ?`,
      [propertyId]
    );

    /* =========================
       FETCH AMENITIES
    ========================= */
    const [amenitiesResult] = await connection.query(
      `
      SELECT a.amenity_id, a.name, a.icon
      FROM amenities a
      JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
      WHERE pa.property_id = ?
      `,
      [propertyId]
    );

    await connection.commit();

    /* =========================
       FORMAT MEDIA
    ========================= */
    const coverImage = property.cover_image
      ? `data:image/jpeg;base64,${Buffer.from(
          property.cover_image
        ).toString("base64")}`
      : null;

    const imageBase64s = images.map(img =>
      `data:image/jpeg;base64,${Buffer.from(img.image).toString("base64")}`
    );

    let video = null;
    if (property.video && Buffer.isBuffer(property.video)) {
      video = {
        url: `data:video/mp4;base64,${Buffer.from(property.video).toString(
          "base64"
        )}`,
        mimeType: "video/mp4"
      };
    }

    /* =========================
       FINAL RESPONSE
    ========================= */
    res.json({
      property: {
        id: property.id,
        title: property.title,
        description: property.description,
        price: parseFloat(property.price),
        address: property.address,
        city: property.city,
        state: property.state,
        country: property.country,
        pincode: property.pincode,
        property_type: property.property_type,
        sqft: property.sqft,
        created_at: property.created_at,
        cover_image: coverImage,
        images: imageBase64s,
        video,
        views: property.views,
        amenities: amenitiesResult.map(a => ({
          id: a.amenity_id,
          name: a.name,
          icon: a.icon
        })),
        builderName: property.builderName,
        mobile_number: property.mobile_number,
        email: property.email
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("View tracking error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

const getMostViewedProperties = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.account_type === 'admin') {
          isAdmin = true;
        }
      } catch (jwtErr) {
        // Invalid or expired token — just deny access silently
        console.log('Invalid token in most-viewed');
      }
    }

    if (!isAdmin) {
      return res.status(401).json({ error: 'Unauthorized: Admin access required' });
    }

    const [rows] = await pool.query(`
      SELECT 
        property_id AS id,
        title,
        city,
        price,
        property_type,
        views,
        created_at,
        cover_image
      FROM properties
      WHERE views > 0
      ORDER BY views DESC
      LIMIT 50
    `);

    const properties = rows.map(p => ({
      ...p,
      cover_image: p.cover_image 
        ? `data:image/jpeg;base64,${Buffer.from(p.cover_image).toString('base64')}`
        : null
    }));

    res.json({ properties });
  } catch (error) {
    console.error('Error fetching most viewed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPropertyViewers = async (req, res) => {
  const propertyId = parseInt(req.params.propertyId, 10);
  if (isNaN(propertyId)) {
    return res.status(400).json({ error: "Invalid property ID" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        pv.id,
        pv.viewed_at,
        pv.ip_address,
        pv.guest_id,
        b.id AS buyer_id,
        b.name AS buyer_name,
        b.email AS buyer_email,
        b.mobile_number
      FROM property_views pv
      LEFT JOIN buyers b ON pv.buyer_id = b.id
      INNER JOIN (
        SELECT
          MAX(id) AS latest_id
        FROM property_views
        WHERE property_id = ?
        GROUP BY
          CASE
            WHEN buyer_id IS NOT NULL THEN buyer_id
            ELSE guest_id
          END
      ) latest ON pv.id = latest.latest_id
      ORDER BY pv.viewed_at DESC
      `,
      [propertyId]
    );

    res.json({ viewers: rows });
  } catch (error) {
    console.error("Error fetching property viewers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { 
  createProperty, 
  getPropertyTypes, 
  getFeaturedProperties, 
  getPropertyById, 
  getMaxPrice, 
  getBuilders,
  getAmenities,
  getMostViewedProperties,
  getPropertyViewers
};