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
    const accountType = decoded.account_type;

    const {
      title,
      description,
      price,           // may be empty/null for apartments
      address,
      city,
      state,
      country,
      pincode,
      property_type,
      builder_id,
      sqft,
      quantity,
      other_amenity,
      variants         // JSON string for apartments
    } = req.body;

    let amenities = req.body.amenities || req.body['amenities[]'] || [];
    if (!Array.isArray(amenities)) {
      amenities = [amenities].filter(Boolean);
    }

    // ── Required fields validation ───────────────────────────────────────
    if (!title || !description || !address || !city || !state || !country || !pincode || !property_type) {
      return res.status(400).json({ error: 'All required fields must be filled (title, description, address, city, state, country, pincode, property_type)' });
    }

    const validPropertyTypes = ['Villas', 'Apartment', 'Plots', 'Commercial'];
    if (!validPropertyTypes.includes(property_type)) {
      return res.status(400).json({ error: 'Invalid property type. Allowed: Villas, Apartment, Plots, Commercial' });
    }

    // ── Price, Sqft & Quantity validation depending on type ─────────────────────────
    let finalPrice = null;
    let finalSqft = sqft ? Number(sqft) : null;
    let finalQuantity = (quantity && !isNaN(quantity)) ? Number(quantity) : 1;

    if (property_type !== 'Apartment') {
      if (!price || isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({ error: 'Valid price (> 0) is required for non-apartment properties' });
      }
      finalPrice = Number(price);
      if (finalSqft && (isNaN(finalSqft) || finalSqft <= 0)) {
        return res.status(400).json({ error: 'Sqft must be a positive number for non-apartment properties' });
      }
    } else {
      // For Apartments: force NULL in main properties table
      finalPrice = null;
      finalSqft = null;
      finalQuantity = null;
    }

    // ── Builder validation ───────────────────────────────────────────────
    let adminId = null;
    let builderId = null;

    if (accountType === 'admin') {
      adminId = userId;
      builderId = builder_id;
      if (!builderId) {
        return res.status(400).json({ error: 'Builder ID is required when posting as admin' });
      }
    } else if (accountType === 'builder') {
      builderId = userId;
    } else {
      return res.status(403).json({ error: 'Access denied - only admin or builder can create properties' });
    }

    const [builderCheck] = await pool.query(
      'SELECT id FROM builders WHERE id = ?',
      [builderId]
    );
    if (builderCheck.length === 0) {
      return res.status(400).json({ error: 'Invalid builder ID' });
    }

    // ── File handling ────────────────────────────────────────────────────
    const coverImage = req.files?.['cover_image']?.[0]?.buffer || null;
    const video = req.files?.['video']?.[0]?.buffer || null;
    const images = req.files?.['images[]']
      ? (Array.isArray(req.files['images[]']) ? req.files['images[]'] : [req.files['images[]']])
      : [];

    // ── Transaction ──────────────────────────────────────────────────────
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert main property
      const [propertyResult] = await connection.query(
        `INSERT INTO properties 
        (admin_id, builder_id, title, description, price, address, city, state, country, pincode, property_type, sqft, quantity, cover_image, video, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminId,
          builderId,
          title,
          description,
          finalPrice,
          address,
          city,
          state,
          country,
          pincode,
          property_type,
          finalSqft,
          finalQuantity,
          coverImage,
          video
        ]
      );

      const propertyId = propertyResult.insertId;

      // ── Insert apartment variants (if applicable) ─────────────────────
      if (property_type === 'Apartment' && variants) {
        let variantData;
        try {
          variantData = JSON.parse(variants);
        } catch (e) {
          throw new Error("Invalid variants format - must be valid JSON array");
        }

        if (!Array.isArray(variantData) || variantData.length === 0) {
          throw new Error("At least one apartment variant is required for Apartment type");
        }

        for (const v of variantData) {
          const aptType = v.apartment_type?.trim();
          const vPrice = Number(v.price);
          const vSqft = Number(v.sqft);
          const vQty = Number(v.quantity) || 1;

          if (!aptType || isNaN(vPrice) || vPrice <= 0 || isNaN(vSqft) || vSqft <= 0) {
            throw new Error(`Invalid variant: apartment_type, price (>0) and sqft (>0) are all required`);
          }

          await connection.query(
            `INSERT INTO property_variants (property_id, apartment_type, price, sqft, quantity) 
            VALUES (?, ?, ?, ?, ?)`,
            [propertyId, aptType, vPrice, vSqft, vQty]
          );
        }
      }

      // ── Insert additional images ──────────────────────────────────────
      if (images.length > 0) {
        for (const image of images) {
          if (image?.buffer) {
            await connection.query(
              'INSERT INTO property_images (property_id, image) VALUES (?, ?)',
              [propertyId, image.buffer]
            );
          }
        }
      }

      // ── Insert standard (DB) amenities ────────────────────────────────
      if (amenities.length > 0) {
        for (const amenityId of amenities) {
          const [exists] = await connection.query(
            'SELECT 1 FROM amenities WHERE amenity_id = ?',
            [amenityId]
          );
          if (exists.length > 0) {
            await connection.query(
              'INSERT IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
              [propertyId, amenityId]
            );
          }
        }
      }

      // ── Handle custom "Other" amenity ─────────────────────────────────
      if (other_amenity && other_amenity.trim()) {
        const customName = other_amenity.trim();

        let [existing] = await connection.query(
          'SELECT amenity_id FROM amenities WHERE LOWER(name) = LOWER(?) LIMIT 1',
          [customName]
        );

        let customAmenityId;
        if (existing.length > 0) {
          customAmenityId = existing[0].amenity_id;
        } else {
          const [insert] = await connection.query(
            'INSERT INTO amenities (name, icon) VALUES (?, NULL)',
            [customName]
          );
          customAmenityId = insert.insertId;
        }

        await connection.query(
          'INSERT IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
          [propertyId, customAmenityId]
        );
      }

      await connection.commit();

      return res.status(201).json({
        message: 'Property created successfully',
        propertyId
      });

    } catch (innerError) {
      await connection.rollback();
      console.error('Transaction failed:', innerError);
      return res.status(400).json({ error: innerError.message || 'Failed to create property' });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating property:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal server error' });
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
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT 
        b.id,
        b.name
      FROM builders b
      INNER JOIN properties p ON p.builder_id = b.id
      ORDER BY b.name ASC
    `);

    // Return format that frontend usually expects
    res.json({
      builders: rows.map(row => ({
        id: row.id,
        name: row.name
      }))
    });
  } catch (error) {
    console.error('Error fetching builders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
        b.name AS builderName
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
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
      conditions.push(`b.name = ?`);
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

        // --- Fetch variants for apartments ---
        let variants = [];
        if (property.property_type === 'Apartment') {
          const [vRows] = await connection.query(
            `SELECT apartment_type, price, sqft FROM property_variants WHERE property_id = ? ORDER BY price ASC`,
            [property.id]
          );
          variants = vRows.map(v => ({
            apartment_type: v.apartment_type,
            price: v.price ? parseFloat(v.price) : null,
            sqft: v.sqft ? Number(v.sqft) : null
          }));
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
          variants: variants // Added field
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
        p.sqft,
        p.created_at,
        p.cover_image,
        p.video,
        p.views,
        b.name,
        COALESCE(a.mobile_number, b.mobile_number) AS mobile_number,
        COALESCE(a.email, b.email) AS email,
        b.name AS builderName
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
      LEFT JOIN admins   a ON p.admin_id   = a.id
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

    /* =========================
       FETCH VARIANTS (IF APARTMENT)
    ========================= */
    let variants = [];
    if (property.property_type === 'Apartment') {
      const [variantRows] = await connection.query(
        `SELECT apartment_type, price, sqft 
         FROM property_variants 
         WHERE property_id = ?
         ORDER BY apartment_type ASC`,
        [propertyId]
      );
      variants = variantRows.map(v => ({
        apartment_type: v.apartment_type,
        price: v.price ? parseFloat(v.price) : null,
        sqft: v.sqft ? Number(v.sqft) : null
      }));
    }

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
        email: property.email,
        variants: variants
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
        p.property_id           AS id,
        p.title,
        p.city,
        p.price,
        p.property_type,
        p.sqft,
        p.views,
        p.created_at,
        p.cover_image,
        b.name                  AS builderName
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
      WHERE p.views > 0
      ORDER BY p.views DESC
      LIMIT 50
    `);

    const propertyIds = rows.map(p => p.id);
    let variants = [];
    if (propertyIds.length > 0) {
      const [vRows] = await pool.query(
        `SELECT property_id, apartment_type, price, sqft FROM property_variants WHERE property_id IN (?) ORDER BY price ASC`,
        [propertyIds]
      );
      variants = vRows;
    }

    const properties = rows.map(p => {
      const pVariants = variants.filter(v => v.property_id === p.id).map(v => ({
        apartment_type: v.apartment_type,
        price: v.price ? parseFloat(v.price) : null,
        sqft: v.sqft ? Number(v.sqft) : null
      }));

      return {
        ...p,
        builderName: p.builderName || 'Unknown',
        variants: pVariants,
        cover_image: p.cover_image
          ? `data:image/jpeg;base64,${Buffer.from(p.cover_image).toString('base64')}`
          : null
      };
    });

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

const getAllBuilders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, mobile_number, email 
       FROM builders 
       ORDER BY name ASC`
    );
    res.json({ builders: rows });
  } catch (error) {
    console.error('Error fetching builders list:', error);
    res.status(500).json({ error: 'Internal server error' });
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
  getPropertyViewers,
  getAllBuilders
};