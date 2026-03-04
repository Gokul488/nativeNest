const pool = require('../db');
const jwt = require('jsonwebtoken');

const getProperties = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Original lightweight query
    const [properties] = await pool.query(`
      SELECT 
        p.property_id AS id, 
        p.admin_id, 
        p.title, 
        p.price, 
        p.city,
        p.address,
        p.property_type,
        p.sqft,
        p.created_at,
        b.name AS builder_name,
        COALESCE(pi.image_count, 0) AS image_count
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
      LEFT JOIN (
        SELECT property_id, COUNT(*) AS image_count
        FROM property_images
        GROUP BY property_id
      ) pi ON p.property_id = pi.property_id
      WHERE p.admin_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    // ====================== NEW: Attach variants ======================
    const variantsMap = {};
    if (properties.length > 0) {
      const propertyIds = properties.map(p => p.id);
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
      prop.variants = variantsMap[prop.id] || [];
    });
    // =================================================================

    res.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const [properties] = await pool.query(`
      SELECT 
        p.property_id AS id, 
        p.admin_id, 
        p.builder_id,
        b.name AS builder_name,
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
        p.video,
        p.cover_image, 
        p.created_at
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
      WHERE p.property_id = ?
    `, [id]);

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const [images] = await pool.query(
      'SELECT image_id AS id, image FROM property_images WHERE property_id = ?',
      [id]
    );

    const [amenitiesResult] = await pool.query(
      `SELECT a.amenity_id, a.name, a.icon 
       FROM amenities a
       JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
       WHERE pa.property_id = ?`,
      [id]
    );

    const [variants] = await pool.query(
      'SELECT variant_id, apartment_type, price, sqft FROM property_variants WHERE property_id = ?',
      [id]
    );

    const property = {
      ...properties[0],
      images,
      sqft: properties[0].sqft || null,
      variants, // Add variants here
      amenities: amenitiesResult.map(a => ({
        id: a.amenity_id,
        name: a.name,
        icon: a.icon
      }))
    };

    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { id } = req.params;

    const {
      title,
      builder_id,
      description,
      price,
      address,
      city,
      state,
      country,
      pincode,
      property_type,
      sqft,
      other_amenity,
      variants
    } = req.body;

    let amenityIds = req.body.amenities || req.body['amenities[]'] || [];
    if (!Array.isArray(amenityIds)) {
      amenityIds = [amenityIds].filter(Boolean);
    }

    // ── Required fields validation ───────────────────────────────────────
    const requiredFields = { title, builder_id, description, address, city, state, country, pincode, property_type };
    const missing = Object.entries(requiredFields)
      .filter(([key, val]) => !val || String(val).trim() === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'All required fields must be filled',
        missingFields: missing
      });
    }

    const validPropertyTypes = ['Villas', 'Plots', 'Apartment', 'Commercial'];
    if (!validPropertyTypes.includes(property_type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    // ── Price & sqft validation depending on type ─────────────────────────
    let finalPrice = price ? Number(price) : null;
    let finalSqft = sqft ? Number(sqft) : null;

    if (property_type !== 'Apartment') {
      if (!price || isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ error: 'Valid price (> 0) is required for non-apartment properties' });
      }
      if (sqft && (isNaN(finalSqft) || finalSqft <= 0)) {
        return res.status(400).json({ error: 'Sqft must be a positive number for non-apartment properties' });
      }
    } else {
      // Apartment → allow price to be null/empty
      finalPrice = null;
      // sqft usually null or average/total — accept what's sent
    }

    // ── Authorization check ──────────────────────────────────────────────
    const [propCheck] = await pool.query(
      'SELECT admin_id FROM properties WHERE property_id = ?',
      [id]
    );
    if (propCheck.length === 0) return res.status(404).json({ error: 'Property not found' });
    if (propCheck[0].admin_id !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const coverImage = req.files?.['cover_image']?.[0]?.buffer || null;
    const video = req.files?.['video']?.[0]?.buffer || null;
    const images = req.files?.['images[]']
      ? (Array.isArray(req.files['images[]']) ? req.files['images[]'] : [req.files['images[]']])
      : [];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update main property row
      await connection.query(
        `UPDATE properties SET 
          title = ?, 
          builder_id = ?, 
          description = ?, 
          price = ?, 
          address = ?, 
          city = ?, 
          state = ?, 
          country = ?, 
          pincode = ?, 
          property_type = ?, 
          sqft = ?,
          cover_image = COALESCE(?, cover_image),
          video = COALESCE(?, video)
         WHERE property_id = ?`,
        [
          title,
          builder_id,
          description,
          finalPrice,
          address,
          city,
          state,
          country,
          pincode,
          property_type,
          finalSqft,
          coverImage,
          video,
          id
        ]
      );

      // Replace images if new ones uploaded
      if (images.length > 0) {
        await connection.query('DELETE FROM property_images WHERE property_id = ?', [id]);
        for (const image of images) {
          if (image?.buffer) {
            await connection.query(
              'INSERT INTO property_images (property_id, image) VALUES (?, ?)',
              [id, image.buffer]
            );
          }
        }
      }

      // ── Amenities ─────────────────────────────────────────────────────
      await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);

      if (amenityIds.length > 0) {
        const values = amenityIds.map(aid => [id, aid]);
        await connection.query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES ?',
          [values]
        );
      }

      // Custom "Other" amenity
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
          [id, customAmenityId]
        );
      }

      // ── Variants (only for Apartment) ────────────────────────────────
      await connection.query('DELETE FROM property_variants WHERE property_id = ?', [id]);

      if (property_type === 'Apartment' && variants) {
        let variantData;
        try {
          variantData = JSON.parse(variants);
        } catch (e) {
          throw new Error("Invalid variants JSON format");
        }

        if (Array.isArray(variantData) && variantData.length > 0) {
          for (const v of variantData) {
            const aptType = (v.apartment_type || '').trim();
            const vPrice = Number(v.price);
            const vSqft = Number(v.sqft);

            if (!aptType || isNaN(vPrice) || vPrice <= 0 || isNaN(vSqft) || vSqft <= 0) {
              throw new Error("Every apartment variant must have valid apartment_type, price (>0) and sqft (>0)");
            }

            await connection.query(
              `INSERT INTO property_variants (property_id, apartment_type, price, sqft) 
               VALUES (?, ?, ?, ?)`,
              [id, aptType, vPrice, vSqft]
            );
          }
        }
      }

      await connection.commit();
      res.status(200).json({ message: 'Property updated successfully' });
    } catch (innerErr) {
      await connection.rollback();
      console.error('Update transaction failed:', innerErr);
      return res.status(400).json({ error: innerErr.message || 'Failed to update property' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { id } = req.params;

    const [properties] = await pool.query(
      'SELECT admin_id FROM properties WHERE property_id = ?',
      [id]
    );

    if (properties.length === 0) return res.status(404).json({ error: 'Property not found' });
    if (properties[0].admin_id !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Delete from child tables FIRST to satisfy Foreign Key constraints
      await connection.query('DELETE FROM property_images WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM property_views WHERE property_id = ?', [id]); // Fixed the error
      await connection.query('DELETE FROM property_variants WHERE property_id = ?', [id]); // Added for variants

      // 2. Delete the parent property LAST
      await connection.query('DELETE FROM properties WHERE property_id = ?', [id]);

      await connection.commit();
      res.status(200).json({ message: 'Property and all related data deleted successfully' });
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

module.exports = { getProperties, getPropertyById, updateProperty, deleteProperty };