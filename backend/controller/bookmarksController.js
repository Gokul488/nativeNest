const pool = require('../db');
const jwt = require('jsonwebtoken');

const addBookmark = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') return res.status(403).json({ error: 'Forbidden' });

    const buyerId = decoded.userId;
    const { propertyId } = req.params;

    await pool.query('INSERT INTO bookmarks (buyer_id, property_id) VALUES (?, ?)', [buyerId, propertyId]);
    res.status(201).json({ message: 'Bookmarked' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Already bookmarked' });
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') return res.status(403).json({ error: 'Forbidden' });

    const buyerId = decoded.userId;
    const { propertyId } = req.params;

    await pool.query('DELETE FROM bookmarks WHERE buyer_id = ? AND property_id = ?', [buyerId, propertyId]);
    res.json({ message: 'Removed bookmark' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') return res.status(403).json({ error: 'Forbidden' });

    const buyerId = decoded.userId;
    const [rows] = await pool.query('SELECT property_id FROM bookmarks WHERE buyer_id = ?', [buyerId]);
    res.json({ bookmarks: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBookmarkedProperties = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.account_type !== 'buyer') return res.status(403).json({ error: 'Forbidden' });

    const buyerId = decoded.userId;
    const connection = await pool.getConnection();
    
    try {
      const [bookmarks] = await connection.query(
        'SELECT property_id FROM bookmarks WHERE buyer_id = ? ORDER BY created_at DESC',
        [buyerId]
      );

      if (bookmarks.length === 0) {
        return res.json({ properties: [] });
      }

      const propertyIds = bookmarks.map(b => b.property_id);
      const placeholders = propertyIds.map(() => '?').join(',');

      const [properties] = await connection.query(
        `SELECT 
           p.property_id AS id,
           p.title,
           p.price,
           p.city,
           b.name AS builderName,
           p.cover_image
         FROM properties p
         LEFT JOIN builders b ON p.builder_id = b.id
         WHERE p.property_id IN (${placeholders})
         ORDER BY FIELD(p.property_id, ${propertyIds.join(',')})`,
        propertyIds
      );

      const formatted = await Promise.all(
        properties.map(async (property) => {
          let img = null;

          if (property.cover_image) {
            img = `data:image/jpeg;base64,${Buffer.from(property.cover_image).toString('base64')}`;
          } else {
            const [fallback] = await connection.query(
              'SELECT image FROM property_images WHERE property_id = ? LIMIT 1',
              [property.id]
            );
            if (fallback.length > 0) {
              img = `data:image/jpeg;base64,${Buffer.from(fallback[0].image).toString('base64')}`;
            }
          }

          return {
            id: property.id,
            title: property.title,
            city: property.city,
            price: parseFloat(property.price),
            img,
            builderName: property.builderName || null, 
          };
        })
      );

      res.json({ properties: formatted });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in getBookmarkedProperties:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addBookmark, removeBookmark, getBookmarks, getBookmarkedProperties };