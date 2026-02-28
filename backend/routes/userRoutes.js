const express = require('express');
const router = express.Router();

const { getUserDetails, updateUserDetails, getBuyerDashboardStats} = require('../controller/userController');

router.get('/user', getUserDetails);
router.put('/user', updateUserDetails);
router.get('/user/stats', getBuyerDashboardStats);

module.exports = router;