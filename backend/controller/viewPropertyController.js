const pool = require('../db');
const jwt = require('jsonwebtoken');

const getProperties = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

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
        p.quantity,
        p.sold,
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

    // Attach variants (apartment_type = BHK value, block_name = block)
    if (properties.length > 0) {
      const propertyIds = properties.map(p => p.id);
      const [variantRows] = await pool.query(`
        SELECT variant_id, property_id, apartment_type, block_name, floor, price, sqft, quantity, sold
        FROM property_variants 
        WHERE property_id IN (?)
        ORDER BY block_name, floor, apartment_type ASC
      `, [propertyIds]);

      const variantsMap = {};
      variantRows.forEach(row => {
        if (!variantsMap[row.property_id]) variantsMap[row.property_id] = [];
        variantsMap[row.property_id].push({
          apartment_type: row.apartment_type,
          block_name: row.block_name || null,
          floor: row.floor || null,
          price: row.price ? parseFloat(row.price) : null,
          sqft: row.sqft ? Number(row.sqft) : null,
          quantity: row.quantity ? Number(row.quantity) : null,
          sold: row.sold ? Number(row.sold) : 0,
          variant_id: row.variant_id
        });
      });

      properties.forEach(prop => {
        prop.variants = variantsMap[prop.id] || [];
      });
    } else {
      properties.forEach(prop => { prop.variants = []; });
    }

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
        p.quantity, 
        p.video,
        p.cover_image, 
        p.created_at
      FROM properties p
      LEFT JOIN builders b ON p.builder_id = b.id
      WHERE p.property_id = ?
    `, [id]);

    if (properties.length === 0) return res.status(404).json({ error: 'Property not found' });

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

    // Fetch variants with block_name — apartment_type holds the BHK value
    const [variantRows] = await pool.query(
      `SELECT variant_id, apartment_type, block_name, floor, price, sqft, quantity
       FROM property_variants WHERE property_id = ?
       ORDER BY block_name, floor, apartment_type ASC`,
      [id]
    );

    const variants = variantRows.map(v => ({
      variant_id: v.variant_id,
      apartment_type: v.apartment_type,
      block_name: v.block_name || null,
      floor: v.floor || null,
      price: v.price ? parseFloat(v.price) : null,
      sqft: v.sqft ? Number(v.sqft) : null,
      quantity: v.quantity ? Number(v.quantity) : 1,
    }));

    const property = {
      ...properties[0],
      images,
      sqft: properties[0].sqft || null,
      quantity: properties[0].quantity || 1,
      variants,
      amenities: amenitiesResult.map(a => ({ id: a.amenity_id, name: a.name, icon: a.icon })),
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
      title, builder_id, description,
      price, address, city, state, country, pincode,
      property_type, sqft, quantity,
      other_amenity,
      variants    // JSON string
    } = req.body;

    let amenityIds = req.body.amenities || req.body['amenities[]'] || [];
    if (!Array.isArray(amenityIds)) amenityIds = [amenityIds].filter(Boolean);

    // ── Required fields ──────────────────────────────────────────────────────
    const requiredFields = { title, builder_id, description, address, city, state, country, pincode, property_type };
    const missing = Object.entries(requiredFields)
      .filter(([, val]) => !val || String(val).trim() === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({ error: 'All required fields must be filled', missingFields: missing });
    }

    // ── Price / sqft / qty ───────────────────────────────────────────────────
    let finalPrice = price ? Number(price) : null;
    let finalSqft = sqft ? Number(sqft) : null;
    let finalQuantity = (quantity && !isNaN(quantity)) ? Number(quantity) : 1;

    if (property_type === 'Apartment') {
      // NULLs in main row — all details live in property_variants
      finalPrice = null;
      finalSqft = null;
      finalQuantity = null;
    } else {
      if (!price || isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ error: 'Valid price (> 0) is required for non-apartment properties' });
      }
    }

    // ── Authorization ────────────────────────────────────────────────────────
    const [propCheck] = await pool.query('SELECT admin_id FROM properties WHERE property_id = ?', [id]);
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
          title = ?, builder_id = ?, description = ?, price = ?,
          address = ?, city = ?, state = ?, country = ?, pincode = ?,
          property_type = ?, sqft = ?, quantity = ?,
          cover_image = COALESCE(?, cover_image),
          video = COALESCE(?, video)
         WHERE property_id = ?`,
        [title, builder_id, description, finalPrice,
          address, city, state, country, pincode,
          property_type, finalSqft, finalQuantity,
          coverImage, video, id]
      );

      // ── Images ────────────────────────────────────────────────────────────
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

      // ── Amenities ─────────────────────────────────────────────────────────
      await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      if (amenityIds.length > 0) {
        const values = amenityIds.map(aid => [id, aid]);
        await connection.query('INSERT INTO property_amenities (property_id, amenity_id) VALUES ?', [values]);
      }

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
          [id, customAmenityId]
        );
      }

      // ── Variants (Apartment blocks) ───────────────────────────────────────
      // Always wipe and re-insert so edits are fully applied
      await connection.query('DELETE FROM property_variants WHERE property_id = ?', [id]);

      if (property_type === 'Apartment' && variants) {
        let variantData;
        try {
          variantData = JSON.parse(variants);
        } catch {
          throw new Error('Invalid variants JSON format');
        }

        if (Array.isArray(variantData) && variantData.length > 0) {
          for (const v of variantData) {
            const aptType = (v.apartment_type || '').trim();  // BHK value
            const blockName = (v.block_name || '').trim();
            const floor = (v.floor || '').trim();
            const vPrice = Number(v.price);
            const vSqft = Number(v.sqft);
            const vQty = Number(v.quantity) || 1;

            if (!aptType) {
              throw new Error('Each block must have an apartment_type (e.g. 2BHK)');
            }
            if (!blockName) {
              throw new Error(`Variant "${aptType}" is missing a block_name`);
            }
            if (!floor) {
              throw new Error(`Variant "${aptType}" in block "${blockName}" is missing a floor`);
            }
            if (isNaN(vPrice) || vPrice <= 0) {
              throw new Error(`Block "${blockName}" (${aptType}) has an invalid price`);
            }
            if (isNaN(vSqft) || vSqft <= 0) {
              throw new Error(`Block "${blockName}" (${aptType}) has an invalid sqft`);
            }

            await connection.query(
              `INSERT INTO property_variants (property_id, apartment_type, block_name, floor, price, sqft, quantity)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [id, aptType, blockName, floor, vPrice, vSqft, vQty]
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

    const [properties] = await pool.query('SELECT admin_id FROM properties WHERE property_id = ?', [id]);
    if (properties.length === 0) return res.status(404).json({ error: 'Property not found' });
    if (properties[0].admin_id !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete child tables first (FK constraints)
      await connection.query('DELETE FROM property_images    WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM property_views     WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM property_variants  WHERE property_id = ?', [id]);
      await connection.query('DELETE FROM properties         WHERE property_id = ?', [id]);

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

const sellProperty = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params; // property_id
    const { variant_id, buyer_id, buyer_name, buyer_mobile, buyer_email } = req.body;

    if (variant_id) {
      // Sell a specific variant
      const [result] = await connection.query(
        'UPDATE property_variants SET quantity = quantity - 1, sold = sold + 1 WHERE variant_id = ? AND quantity > 0',
        [variant_id]
      );
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Property variant out of stock or not found' });
      }
    } else {
      // Sell the main property
      const [result] = await connection.query(
        'UPDATE properties SET quantity = quantity - 1, sold = sold + 1 WHERE property_id = ? AND quantity > 0',
        [id]
      );
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Property out of stock or not found' });
      }
    }

    // Record the sale
    await connection.query(
      `INSERT INTO property_sales (property_id, variant_id, buyer_id, buyer_name, buyer_mobile, buyer_email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, variant_id || null, buyer_id || null, buyer_name || null, buyer_mobile || null, buyer_email || null]
    );

    await connection.commit();
    res.json({ message: 'Property sold successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error selling property:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
};

const getSoldProperties = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch sold properties from properties table
    const [soldMain] = await pool.query(`
      SELECT 
        p.property_id AS id, 
        p.title, 
        p.property_type,
        p.price,
        p.sqft,
        p.sold,
        'Main' as unit_type,
        NULL as block_name,
        NULL as apartment_type
      FROM properties p
      WHERE p.admin_id = ? AND p.sold > 0 AND p.property_type != 'Apartment'
    `, [userId]);

    // Fetch sold variants from property_variants table
    const [soldVariants] = await pool.query(`
      SELECT 
        p.property_id AS id, 
        p.title, 
        p.property_type,
        v.price,
        v.sqft,
        v.sold,
        'Variant' as unit_type,
        v.block_name,
        v.apartment_type
      FROM property_variants v
      JOIN properties p ON v.property_id = p.property_id
      WHERE p.admin_id = ? AND v.sold > 0
    `, [userId]);

    const soldProperties = [...soldMain, ...soldVariants];
    res.json({ soldProperties });
  } catch (error) {
    console.error('Error fetching sold properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getProperties, getPropertyById, updateProperty, deleteProperty, sellProperty, getSoldProperties };