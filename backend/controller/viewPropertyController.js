// Modified viewPropertyController.js (Optimized for fast listing)
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

    // Optimized query: Only fetch essential text fields + image count (no BLOBs)
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
    b.name AS builder_name, -- Added builder name
    COALESCE(pi.image_count, 0) AS image_count
  FROM properties p
  LEFT JOIN builders b ON p.builder_id = b.id -- Join with builders
  LEFT JOIN (
    SELECT property_id, COUNT(*) AS image_count
    FROM property_images
    GROUP BY property_id
  ) pi ON p.property_id = pi.property_id
  WHERE p.admin_id = ?
  ORDER BY p.created_at DESC
`, [userId]);

    // No need for Promise.all loop — we return lightweight data only
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

    const property = { 
      ...properties[0], 
      images,
      sqft: properties[0].sqft || null,
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
      title, builder_id, description, price, address, city, state, country, pincode, property_type, sqft,
      amenities,
      other_amenity
    } = req.body;

    if (!title || !builder_id || !description || !price || !address || !city || !state || !country || !pincode || !property_type) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    if (sqft && (isNaN(sqft) || sqft <= 0)) {
      return res.status(400).json({ error: 'Sqft must be a positive number' });
    }

    const validPropertyTypes = ['Villas', 'Plots', 'Apartment', 'Commercial'];
    if (!validPropertyTypes.includes(property_type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const [properties] = await pool.query('SELECT admin_id FROM properties WHERE property_id = ?', [id]);
    if (properties.length === 0) return res.status(404).json({ error: 'Property not found' });
    if (properties[0].admin_id !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const coverImage = req.files?.['cover_image']?.[0]?.buffer || null;
    const video = req.files?.['video']?.[0]?.buffer || null;
    const images = req.files && req.files['images[]']
      ? (Array.isArray(req.files['images[]']) ? req.files['images[]'] : [req.files['images[]']])
      : [];

    const amenityIds = amenities ? JSON.parse(amenities) : [];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE properties SET 
          title = ?, builder_id = ?, description = ?, price = ?, address = ?, city = ?, state = ?, country = ?, 
          pincode = ?, property_type = ?, sqft = ?,
          cover_image = COALESCE(?, cover_image),
          video = COALESCE(?, video)
         WHERE property_id = ?`,
        [title, builder_id, description, price, address, city, state, country, pincode, property_type, sqft || null, coverImage, video, id]
      );

      if (images.length > 0) {
        await connection.query('DELETE FROM property_images WHERE property_id = ?', [id]);
        for (const image of images) {
          if (image && image.buffer) {
            await connection.query(
              'INSERT INTO property_images (property_id, image) VALUES (?, ?)',
              [id, image.buffer]
            );
          }
        }
      }

      // Update amenities
      await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      if (amenityIds.length > 0) {
        const values = amenityIds.map(aid => [id, aid]);
        await connection.query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES ?',
          [values]
        );
      }

      // Handle custom "Other" amenity
      if (other_amenity && other_amenity.trim()) {
        const customName = other_amenity.trim();

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

        await connection.query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
          [id, customAmenityId]
        );
      }

      await connection.commit();
      res.status(200).json({ message: 'Property updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
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
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { id } = req.params;

    const [properties] = await pool.query(
      'SELECT admin_id FROM properties WHERE property_id = ?',
      [id]
    );
    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (properties[0].admin_id !== userId) {
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


module.exports = { getProperties, getPropertyById, updateProperty, deleteProperty };