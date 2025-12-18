const express = require('express');
const router = express.Router();
const { createEvent } = require('../controller/eventController');

router.post('/admin/events', createEvent);

module.exports = router;
