const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
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
} = require('../controller/propertiesController');

const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, MP4, MPEG, and WebM are allowed.'));
    }
  }
});

// ────────────────────────────────────────────────
//  PUBLIC ROUTES – no authentication required
// ────────────────────────────────────────────────
router.get('/types', getPropertyTypes);
router.get('/amenities', getAmenities);
router.get('/builders', getBuilders);
router.get('/builders-list', getAllBuilders);
router.get('/featured', getFeaturedProperties);
router.get('/max-price', getMaxPrice);

// ────────────────────────────────────────────────
//  PROTECTED ROUTES
// ────────────────────────────────────────────────
router.use(authMiddleware);

router.get('/most-viewed', getMostViewedProperties); 
router.get('/:propertyId/viewers', getPropertyViewers);

router.get('/:id', getPropertyById); 

router.post('/', upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'images[]', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), createProperty);

module.exports = router;