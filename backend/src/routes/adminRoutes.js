const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roleCheck');

router.get('/dashboard', authenticate, requireMinRole('admin'), adminController.getDashboardStats);
router.get('/activity', authenticate, requireMinRole('admin'), adminController.getRecentActivity);
router.get('/analytics', authenticate, requireMinRole('analytics'), adminController.getAnalytics);

// Announcements
router.get('/announcements', authenticate, requireMinRole('admin'), adminController.getAllAnnouncements);
router.post('/announcements', authenticate, requireMinRole('admin'), adminController.createAnnouncement);
router.patch('/announcements/:id', authenticate, requireMinRole('admin'), adminController.updateAnnouncement);
router.delete('/announcements/:id', authenticate, requireMinRole('admin'), adminController.deleteAnnouncement);

// Settings
router.get('/settings', authenticate, requireMinRole('admin'), adminController.getSettings);
router.post('/settings', authenticate, requireMinRole('admin'), adminController.updateSetting);

// Blacklist
router.get('/blacklist', authenticate, requireMinRole('moderator'), adminController.getBlacklist);
router.post('/blacklist', authenticate, requireMinRole('admin'), adminController.addBlacklistEntry);
router.delete('/blacklist/:id', authenticate, requireMinRole('admin'), adminController.removeBlacklistEntry);

// Staff Logs
router.get('/staff-logs', authenticate, requireMinRole('admin'), adminController.getStaffLogs);

// Mass Email
router.post('/mass-email', authenticate, requireMinRole('admin'), adminController.sendMassEmail);

module.exports = router;