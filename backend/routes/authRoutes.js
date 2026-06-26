const express = require('express');
const router = express.Router();
const { register, login, subBuilderLogin, getAccountTypes, forgotPassword, resetPassword } = require('../controller/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/sub-builder/login', subBuilderLogin);
router.get('/account-types', getAccountTypes);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;