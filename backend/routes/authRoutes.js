const express = require('express');
const router = express.Router();
const { register, login, getAccountTypes } = require('../controller/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/account-types', getAccountTypes);

module.exports = router;