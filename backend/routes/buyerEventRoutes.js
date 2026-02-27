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
  registerStallInterest,
  markAttendance,
  markStallAttendance,
  getStallCheckInDetails
} = require('../controller/buyerEventController');

// Public / semi-public routes
router.get("/events/ongoing", getOngoingEventsForHome);

// Authenticated buyer routes (with /buyer/ prefix for clarity)
router.get('/buyer/events', getPublicEvents);
router.post('/buyer/events/participate', participateEvent);
router.get('/buyer/events/my', getMyRegisteredEvents);

router.post('/buyer/events/stall-interest', registerStallInterest);
router.get('/buyer/events/:eventId/booked-builders', getBookedBuildersForEvent);

// Add this route (it's public because people scan it physically at the venue)
router.post('/events/mark-attendance', markAttendance);
router.post('/events/mark-stall-attendance', markStallAttendance);
router.get('/events/stall-details/:stallId', getStallCheckInDetails);
module.exports = router;