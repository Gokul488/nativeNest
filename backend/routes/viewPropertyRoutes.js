// Modified viewPropertyRoutes.js
const express = require('express');
const router = express.Router();
const {getProperties, getPropertyById, updateProperty, deleteProperty, sellProperty, getSoldProperties } = require('../controller/viewPropertyController');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to match propertiesRoutes
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mpeg', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${file.mimetype}). Only JPEG, PNG, WEBP, MP4, MPEG, and WebM are allowed.`));
    }
  }
});

router.get('/', getProperties);

router.get('/sold', getSoldProperties);

router.get('/:id', getPropertyById);

router.put('/sell/:id', sellProperty);

const uploadMiddleware = upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'images[]', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]);

router.put('/:id', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, updateProperty);

router.delete('/:id', deleteProperty);

module.exports = router;