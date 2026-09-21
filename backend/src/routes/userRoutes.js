const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roleCheck');

router.get('/', authenticate, requireMinRole('moderator'), userController.getAllUsers);
router.get('/export', authenticate, requireMinRole('admin'), userController.exportUsers);
router.get('/:id', authenticate, userController.getUserById);
router.get('/:id/stats', authenticate, userController.getUserStats);
router.patch('/:id', authenticate, requireMinRole('admin'), userController.updateUser);
router.post('/:id/suspend', authenticate, requireMinRole('moderator'), userController.suspendUser);
router.post('/:id/ban', authenticate, requireMinRole('moderator'), userController.banUser);
router.post('/bulk-ban', authenticate, requireMinRole('admin'), userController.bulkBan);
router.delete('/:id', authenticate, requireMinRole('admin'), userController.deleteUser);

module.exports = router;