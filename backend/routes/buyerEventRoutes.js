// routes/buyerEventRoutes.js
const express = require('express');
const router = express.Router();

// Controller imports
const {
  getPublicEvents,
  participateEvent,
  getMyRegisteredEvents,
  getOngoingEventsForHome,
  getBookedBuildersForEvent, 
  registerStallInterest           
} = require('../controller/buyerEventController');

// Public / semi-public routes
router.get("/events/ongoing", getOngoingEventsForHome);

// Authenticated buyer routes (with /buyer/ prefix for clarity)
router.get('/buyer/events', getPublicEvents);
router.post('/buyer/events/participate', participateEvent);
router.get('/buyer/events/my', getMyRegisteredEvents);

router.post('/buyer/events/stall-interest', registerStallInterest);
router.get('/buyer/events/:eventId/booked-builders', getBookedBuildersForEvent);

module.exports = router;