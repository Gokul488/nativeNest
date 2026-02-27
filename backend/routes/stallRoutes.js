const express = require('express');
const router = express.Router();

const {
  getAvailableStallsForEvent,
  bookStallByType,
  getStallTypesWithAvailabilityForEvent,
  getStallBookingsForEvent,
} = require('../controller/stallController');

const {
  getStallTypesByEvent,
  createStallType,
  updateStallType,
  deleteStallType,
} = require('../controller/stallTypeController');

// ── Stall Type Management (Admin + event-specific) ──
router.get('/types/event/:eventId',    getStallTypesByEvent);
router.post('/types/event/:eventId',   createStallType);
router.put('/types/:typeId/event/:eventId', updateStallType);
router.delete('/types/:typeId/event/:eventId', deleteStallType);

// ── Stall booking & availability (public / user facing) ──
router.get('/event/:eventId/available', getAvailableStallsForEvent);
router.post('/book-by-type', bookStallByType);
router.get('/event/:eventId/types-availability', getStallTypesWithAvailabilityForEvent);
router.get('/event/:eventId/bookings', getStallBookingsForEvent);

module.exports = router;