const express = require('express');
const router = express.Router();
const { getAdminDetails, updateAdminDetails, getWhatsappAdmin,  getAllUsers, getAllEvents, getEventParticipants, getAllBuilders, getDashboardStats} = require('../controller/adminController');

router.get('/admin', getAdminDetails);
router.put('/admin', updateAdminDetails);
router.get('/public/admin-whatsapp', getWhatsappAdmin);
router.get('/admin/users', getAllUsers);
router.get('/admin/events', getAllEvents);
router.get('/admin/events/:eventId/participants', getEventParticipants);
router.get('/admin/builders', getAllBuilders);
router.get('/admin/dashboard-stats', getDashboardStats);

module.exports = router;