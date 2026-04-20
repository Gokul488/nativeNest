const pool = require('../db');
const jwt = require('jsonwebtoken');

const createProperty = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const accountType = decoded.account_type;

    const {
      title, description,
      price, address, city, state, country, pincode,
      property_type, builder_id, sqft, quantity,
      other_amenity,
      variants   // JSON string
    } = req.body;

    let amenities = req.body.amenities || req.body['amenities[]'] || [];
    if (!Array.isArray(amenities)) amenities = [amenities].filter(Boolean);

    // ── Required fields ──────────────────────────────────────────────────────
    if (!title || !description || !address || !city || !state || !country || !pincode || !property_type) {
      return res.status(400).json({ error: 'All required fields must be filled (title, description, address, city, state, country, pincode, property_type)' });
    }

    const validPropertyTypes = ['Villas', 'Apartment', 'Plots', 'Commercial'];
    if (!validPropertyTypes.includes(property_type)) {
      return res.status(400).json({ error: 'Invalid property type. Allowed: Villas, Apartment, Plots, Commercial' });
    }

    // ── Price / sqft / qty ───────────────────────────────────────────────────
    let finalPrice = null;
    let finalSqft = sqft ? Number(sqft) : null;
    let finalQuantity = (quantity && !isNaN(quantity)) ? Number(quantity) : 1;

    if (property_type !== 'Apartment' && property_type !== 'Villas') {
      if (!price || isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({ error: 'Valid price (> 0) is required for this property type' });
      }
      finalPrice = Number(price);
      if (finalSqft && (isNaN(finalSqft) || finalSqft <= 0)) {
        return res.status(400).json({ error: 'Sqft must be a positive number' });
      }
    } else if (property_type === 'Villas') {
      // For Villas, we will calculate finalPrice from variants later
      finalPrice = null;
      finalSqft = null;
      finalQuantity = null;
    } else {
      // Apartments store details in sub-tables
      finalPrice = null;
      finalSqft = null;
      finalQuantity = null;
    }

    // ── Builder ──────────────────────────────────────────────────────────────
    let adminId = null;
    let builderId = null;

    if (accountType === 'admin') {
      adminId = userId;
      builderId = builder_id;
      if (!builderId) return res.status(400).json({ error: 'Builder ID is required when posting as admin' });
    } else if (accountType === 'builder') {
      builderId = userId;
    } else {
      return res.status(403).json({ error: 'Access denied - only admin or builder can create properties' });
    }

    const [builderCheck] = await pool.query('SELECT id FROM builders WHERE id = ?', [builderId]);
    if (builderCheck.length === 0) return res.status(400).json({ error: 'Invalid builder ID' });

    // ── Files ────────────────────────────────────────────────────────────────
    const coverImage = req.files?.['cover_image']?.[0]?.buffer || null;
    const video = req.files?.['video']?.[0]?.buffer || null;
    const images = req.files?.['images[]']
      ? (Array.isArray(req.files['images[]']) ? req.files['images[]'] : [req.files['images[]']])
      : [];

    // ── Transaction ──────────────────────────────────────────────────────────
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert main property row (re-added pincode, sqft, quantity as they are required by DB)
      const [propertyResult] = await connection.query(
        `INSERT INTO properties
         (admin_id, builder_id, title, description, price, address, city, state, country,
          pincode, property_type, sqft, quantity, cover_image, video, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [adminId, builderId, title, description, finalPrice, address, city, state, country,
          pincode, property_type, finalSqft, finalQuantity, coverImage, video]
      );

      const propertyId = propertyResult.insertId;

      // ── Apartment variants ───────────────────────────────────────────────
      if (property_type === 'Apartment' && variants) {
        let variantData;
        try {
          variantData = typeof variants === 'string' ? JSON.parse(variants) : variants;
        } catch {
          throw new Error('Invalid variants format');
        }
        if (Array.isArray(variantData)) {
          for (const v of variantData) {
            await connection.query(
              `INSERT INTO property_variants
               (property_id, block_name, floor, apartment_type, price, sqft, quantity)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [propertyId, v.block_name, v.floor, v.apartment_type, v.price, v.sqft, v.quantity]
            );
          }
        }
      }

      // ── Villa variants ───────────────────────────────────────────────
      const villaVariantsReq = req.body.villa_variants || (property_type === 'Villas' ? variants : null);
      if (property_type === 'Villas' && villaVariantsReq) {
        let villaData;
        try {
          villaData = typeof villaVariantsReq === 'string' ? JSON.parse(villaVariantsReq) : villaVariantsReq;
        } catch {
          throw new Error('Invalid villa variants format');
        }

        if (Array.isArray(villaData)) {
          let minPrice = Infinity;
          for (const v of villaData) {
            await connection.query(
              `INSERT INTO villa_details
               (property_id, facing, price, sqft, quantity, sold, created_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW())`,
              [propertyId, v.facing, v.price, v.sqft, v.quantity, 0]
            );
            if (Number(v.price) < minPrice) minPrice = Number(v.price);
          }

          // If we found valid variants, update the main price in properties table
          if (minPrice !== Infinity) {
            await connection.query(
              'UPDATE properties SET price = ? WHERE property_id = ?',
              [minPrice, propertyId]
            );
          }
        }
      }

      // ── Additional images ────────────────────────────────────────────────
      for (const image of images) {
        if (image?.buffer) {
          await connection.query(
            'INSERT INTO property_images (property_id, image) VALUES (?, ?)',
            [propertyId, image.buffer]
          );
        }
      }

      // ── Standard amenities ───────────────────────────────────────────────
      for (const amenityId of amenities) {
        const [exists] = await connection.query('SELECT 1 FROM amenities WHERE amenity_id = ?', [amenityId]);
        if (exists.length > 0) {
          await connection.query(
            'INSERT IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
            [propertyId, amenityId]
          );
        }
      }

      // ── Custom "Other" amenity ───────────────────────────────────────────
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
          const [insert] = await connection.query('INSERT INTO amenities (name, icon) VALUES (?, NULL)', [customName]);
          customAmenityId = insert.insertId;
        }
        await connection.query(
          'INSERT IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
          [propertyId, customAmenityId]
        );
      }

      await connection.commit();
      return res.status(201).json({ message: 'Property created successfully', propertyId });

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

const formatVariant = (v) => ({
  block_name: v.block_name || null,
  floor: v.floor || null,
  apartment_type: v.apartment_type || null,
  price: v.price ? parseFloat(v.price) : null,
  sqft: v.sqft ? Number(v.sqft) : null,
  quantity: v.quantity ? Number(v.quantity) : null,
});

const getPropertyTypes = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'properties' AND COLUMN_NAME = 'property_type'`
    );
    if (result.length === 0) return res.status(404).json({ error: 'Property type column not found' });
    const enumString = result[0].COLUMN_TYPE;
    const propertyTypes = enumString.slice(5, -1).split(',').map(t => t.slice(1, -1));
    res.status(200).json({ propertyTypes });
  } catch (error) {
    console.error('Error fetching property types:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAmenities = async (req, res) => {
  try {
    const [result] = await pool.query(`SELECT amenity_id, name, icon FROM amenities ORDER BY name`);
    res.status(200).json({ amenities: result });
  } catch (error) {
    console.error('Error fetching amenities:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBuilders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT b.id, b.name
      FROM builders b
      INNER JOIN properties p ON p.builder_id = b.id
      ORDER BY b.name ASC
    `);
    res.json({ builders: rows.map(row => ({ id: row.id, name: row.name })) });
  } catch (error) {
    console.error('Error fetching builders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMaxPrice = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT MAX(price) AS maxPrice FROM properties');
    res.status(200).json({ maxPrice: result[0].maxPrice || 0 });
  } catch (error) {
    console.error('Error fetching max price:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFeaturedProperties = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { location, priceRange, propertyType, builder, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
    `;
    const params = [];
    const conditions = [];

    if (location && location !== 'All') {
      conditions.push(`(p.city LIKE ? OR p.state LIKE ? OR p.country LIKE ?)`);
      const s = `%${location}%`;
      params.push(s, s, s);
    }
    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-');
      const minPrice = Number(minStr), maxPrice = Number(maxStr);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        conditions.push(`p.price BETWEEN ? AND ?`); params.push(minPrice, maxPrice);
      } else if (!isNaN(minPrice) && priceRange.endsWith('+')) {
        conditions.push(`p.price >= ?`); params.push(minPrice);
      }
    }
    if (propertyType && propertyType !== 'All') { conditions.push(`p.property_type = ?`); params.push(propertyType); }
    if (builder && builder !== 'All') { conditions.push(`b.name = ?`); params.push(builder); }

    if (conditions.length > 0) baseQuery += ` WHERE ` + conditions.join(' AND ');

    const [countResult] = await connection.query(`SELECT COUNT(*) AS total ${baseQuery}`, params);
    const total = countResult[0].total;

    let dataQuery = `
      SELECT p.property_id AS id, p.title, p.price, p.city, p.pincode,
             p.property_type, p.sqft, p.quantity, p.created_at, p.cover_image,
             (SELECT COUNT(*) FROM property_views WHERE property_id = p.property_id) AS views,
             b.name AS builderName
      ${baseQuery}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [properties] = await connection.query(dataQuery, [...params, limitNum, offset]);

    const featuredProperties = await Promise.all(properties.map(async (property) => {
      let imageBase64 = null;
      if (property.cover_image) {
        imageBase64 = `data:image/jpeg;base64,${Buffer.from(property.cover_image).toString('base64')}`;
      }

      let variants = [];
      if (property.property_type === 'Apartment') {
        const [vRows] = await connection.query(`SELECT * FROM property_variants WHERE property_id = ?`, [property.id]);
        variants = vRows.map(formatVariant);
      } else if (property.property_type === 'Villas') {
        const [vRows] = await connection.query(`SELECT * FROM villa_details WHERE property_id = ?`, [property.id]);
        variants = vRows.map(v => ({ facing: v.facing, price: parseFloat(v.price), sqft: v.sqft, quantity: v.quantity }));
      }

      return { ...property, img: imageBase64, price: parseFloat(property.price), variants };
    }));

    res.json({ properties: featuredProperties, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

const getPropertyById = async (req, res) => {
  const { id } = req.params;
  const propertyId = parseInt(id, 10);
  if (isNaN(propertyId) || propertyId <= 0) return res.status(400).json({ error: 'Invalid property ID' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [properties] = await connection.query(
      `SELECT p.*, b.name AS builderName, b.mobile_number, b.email
       FROM properties p
       LEFT JOIN builders b ON p.builder_id = b.id
       WHERE p.property_id = ?`,
      [propertyId]
    );

    if (properties.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    const [images] = await connection.query(`SELECT image FROM property_images WHERE property_id = ?`, [propertyId]);
    const [amenitiesResult] = await connection.query(
      `SELECT a.* FROM amenities a JOIN property_amenities pa ON a.amenity_id = pa.amenity_id WHERE pa.property_id = ?`,
      [propertyId]
    );

    let variants = [];
    if (property.property_type === 'Apartment') {
      const [vRows] = await connection.query(`SELECT * FROM property_variants WHERE property_id = ?`, [propertyId]);
      variants = vRows.map(formatVariant);
    } else if (property.property_type === 'Villas') {
      const [vRows] = await connection.query(`SELECT * FROM villa_details WHERE property_id = ?`, [propertyId]);
      variants = vRows.map(v => ({ facing: v.facing, price: parseFloat(v.price), sqft: v.sqft, quantity: v.quantity }));
    }

    await connection.commit();

    const coverImage = property.cover_image ? `data:image/jpeg;base64,${Buffer.from(property.cover_image).toString('base64')}` : null;
    const imageBase64s = images.map(img => `data:image/jpeg;base64,${Buffer.from(img.image).toString('base64')}`);

    res.json({
      property: {
        ...property,
        price: parseFloat(property.price),
        cover_image: coverImage,
        images: imageBase64s,
        amenities: amenitiesResult,
        variants
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error fetching property by id:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

const getMostViewedProperties = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.name AS builderName, (SELECT COUNT(*) FROM property_views WHERE property_id = p.property_id) AS views
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
      ORDER BY views DESC LIMIT 50
    `);
    const properties = rows.map(p => ({
      ...p,
      price: parseFloat(p.price),
      cover_image: p.cover_image ? `data:image/jpeg;base64,${Buffer.from(p.cover_image).toString('base64')}` : null,
    }));
    res.json({ properties });
  } catch (error) {
    console.error('Error fetching most viewed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPropertyViewers = async (req, res) => {
  const propertyId = parseInt(req.params.propertyId, 10);
  try {
    const [rows] = await pool.query(
      `SELECT pv.*, b.name AS buyer_name, b.email AS buyer_email, b.mobile_number
       FROM property_views pv
       LEFT JOIN buyers b ON pv.buyer_id = b.id
       WHERE pv.property_id = ?
       ORDER BY pv.viewed_at DESC`,
      [propertyId]
    );
    res.json({ viewers: rows });
  } catch (error) {
    console.error('Error fetching property viewers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllBuilders = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name, mobile_number, email FROM builders ORDER BY name ASC`);
    res.json({ builders: rows });
  } catch (error) {
    console.error('Error fetching builders list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCities = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT city FROM properties WHERE city IS NOT NULL AND city != "" ORDER BY city ASC');
    const cities = rows.map(row => row.city);
    res.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
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
  getAllBuilders,
  getCities
};