// Modified viewPropertyRoutes.js
const express = require('express');
const router = express.Router();
const {getProperties, getPropertyById, updateProperty, deleteProperty } = require('../controller/viewPropertyController');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to match propertiesRoutes
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, MP4, MPEG, and WebM are allowed.'));
    }
  }
});

router.get('/', getProperties);

router.get('/:id', getPropertyById);

router.put('/:id', upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'images[]', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), updateProperty);

router.delete('/:id', deleteProperty);

module.exports = router;