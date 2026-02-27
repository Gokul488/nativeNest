const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  addBookmark,
  removeBookmark,
  getBookmarks,
  getBookmarkedProperties
} = require('../controller/bookmarksController');

// Proper JWT Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure only buyers can access bookmark routes
    if (decoded.account_type !== 'buyer') {
      return res.status(403).json({ message: 'Access denied: Buyers only' });
    }

    req.user = {
      id: decoded.userId,
      account_type: decoded.account_type
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Routes
router.post('/:propertyId', authMiddleware, addBookmark);
router.delete('/:propertyId', authMiddleware, removeBookmark);
router.get('/', authMiddleware, getBookmarks);
router.get('/properties', authMiddleware, getBookmarkedProperties);

module.exports = router;