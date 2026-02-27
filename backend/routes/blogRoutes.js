const express = require('express');
const router = express.Router();
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, getFeaturedBlogs } = require('../controller/blogController');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }]), createBlog);
router.get('/', authenticateToken, getBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/:id', getBlogById);
router.put('/:id', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }]), updateBlog);
router.delete('/:id', authenticateToken, deleteBlog);

module.exports = router;