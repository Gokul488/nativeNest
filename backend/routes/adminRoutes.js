const express = require('express');
const router = express.Router();
const { getAdminDetails, updateAdminDetails, getWhatsappAdmin } = require('../controller/adminController');

router.get('/admin', getAdminDetails);
router.put('/admin', updateAdminDetails);
router.get('/public/admin-whatsapp', getWhatsappAdmin);

module.exports = router;