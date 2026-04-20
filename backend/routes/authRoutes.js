const express = require('express');
const router = express.Router();
const { register, login, getAccountTypes, forgotPassword, resetPassword } = require('../controller/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/account-types', getAccountTypes);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;