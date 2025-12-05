const express = require('express');
const router = express.Router();

const { getUserDetails, updateUserDetails } = require('../controller/userController');

router.get('/user', getUserDetails);
router.put('/user', updateUserDetails);

module.exports = router;

