const express = require('express');
const router = express.Router();
const { getAdminDetails, updateAdminDetails, getWhatsappAdmin,  getAllUsers, getAllEvents, getEventParticipants, getAllBuilders, getDashboardStats, adminUpdateUser, createAdmin, approveAccount, getAllAdmins, deleteAdmin} = require('../controller/adminController');

router.get('/admin', getAdminDetails);
router.put('/admin', updateAdminDetails);
router.post('/admin/create', createAdmin);
router.get('/admin/all', getAllAdmins);
router.delete('/admin/:adminId', deleteAdmin);
router.put('/admin/approve/:type/:id', approveAccount);
router.get('/public/admin-whatsapp', getWhatsappAdmin);
router.get('/admin/users', getAllUsers);
router.put('/admin/users/:userId', adminUpdateUser);
router.get('/admin/events', getAllEvents);
router.get('/admin/events/:eventId/participants', getEventParticipants);
router.get('/admin/builders', getAllBuilders);
router.get('/admin/dashboard-stats', getDashboardStats);

module.exports = router;