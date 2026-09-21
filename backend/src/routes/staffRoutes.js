const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roleCheck');

router.get('/', authenticate, requireMinRole('admin'), staffController.getStaffMembers);
router.get('/stats', authenticate, requireMinRole('admin'), staffController.getStaffStats);
router.post('/invite', authenticate, requireMinRole('admin'), staffController.inviteStaff);
router.post('/accept-invite', staffController.acceptInvite);
router.patch('/:id/role', authenticate, requireMinRole('admin'), staffController.updateStaffRole);
router.delete('/:id', authenticate, requireMinRole('admin'), staffController.removeStaff);

module.exports = router;