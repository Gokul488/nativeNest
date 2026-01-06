// routes/buyerEventRoutes.js
const express = require('express');
const router = express.Router();
const { getPublicEvents, participateEvent, getMyRegisteredEvents, getOngoingEventsForHome} = require('../controller/buyerEventController');

router.get("/events/ongoing", getOngoingEventsForHome);

router.get('/buyer/events', getPublicEvents);
router.post('/buyer/events/participate', participateEvent);
router.get('/buyer/events/my', getMyRegisteredEvents);

module.exports = router;
