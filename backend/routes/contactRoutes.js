const express = require('express');
const router = express.Router();
const { createContactMessage, getContactMessages, deleteContactMessage } = require('../controller/contactController');

router.post('/', createContactMessage);
router.get('/', getContactMessages);
router.delete('/:id', deleteContactMessage);

module.exports = router;