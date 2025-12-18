const express = require('express');
const router = express.Router();
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../controller/eventController');

router.post('/admin/events', createEvent);
router.get('/admin/events', getAllEvents);
router.get('/admin/events/:id', getEventById);
router.put('/admin/events/:id', updateEvent);
router.delete('/admin/events/:id', deleteEvent);

module.exports = router;