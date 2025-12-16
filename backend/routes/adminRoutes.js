const express = require('express');
const router = express.Router();
const { getAdminDetails, updateAdminDetails } = require('../controller/adminController');

router.get('/admin', getAdminDetails);
router.put('/admin', updateAdminDetails);

module.exports = router;