const express = require('express');
const router = express.Router();
const { 
  getAdminDetails, 
  updateAdminDetails, 
  getWhatsappAdmin,  
  getAllUsers, 
  getAllEvents, 
  getEventParticipants, 
  getAllBuilders, 
  getDashboardStats, 
  adminUpdateUser, 
  createAdmin, 
  getAllAdmins, 
  deleteAdmin, 
  getSpecificAdmin, 
  updateSpecificAdmin,
  getSettings,
  updateSettings
} = require('../controller/adminController');

router.get('/admin', getAdminDetails);
router.put('/admin', updateAdminDetails);
router.post('/admin/create', createAdmin);
router.get('/admin/all', getAllAdmins);
router.get('/admin/users', getAllUsers);
router.put('/admin/users/:userId', adminUpdateUser);
router.get('/admin/manage/:adminId', getSpecificAdmin);
router.put('/admin/manage/:adminId', updateSpecificAdmin);
router.delete('/admin/manage/:adminId', deleteAdmin);
router.get('/public/admin-whatsapp', getWhatsappAdmin);
router.get('/admin/events', getAllEvents);
router.get('/admin/events/:eventId/participants', getEventParticipants);
router.get('/admin/builders', getAllBuilders);
router.get('/admin/dashboard-stats', getDashboardStats);
router.get('/admin/settings', getSettings);
router.put('/admin/settings', updateSettings);

module.exports = router;