const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getEventInvitationPDF } = require('../controller/eventController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed for banner.'));
    }
  }
});

router.post('/admin/events', upload.fields([{ name: 'banner_image', maxCount: 1 }]), createEvent);
router.get('/admin/events', getAllEvents);
router.get('/admin/events/:id', getEventById);
router.put('/admin/events/:id', upload.fields([{ name: 'banner_image', maxCount: 1 }]), updateEvent);
router.delete('/admin/events/:id', deleteEvent);

router.get('/admin/events/:id/invitation.pdf', getEventInvitationPDF);

module.exports = router;