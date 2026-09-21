const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roleCheck');

router.post('/report', authenticate, moderationController.createReport);
router.get('/reports', authenticate, requireMinRole('moderator'), moderationController.getReports);
router.patch('/reports/:id', authenticate, requireMinRole('moderator'), moderationController.resolveReport);
router.post('/reports/:id/assign', authenticate, requireMinRole('moderator'), moderationController.assignReport);
router.get('/custom-souls/pending', authenticate, requireMinRole('content_manager'), moderationController.getPendingCustomSouls);

module.exports = router;