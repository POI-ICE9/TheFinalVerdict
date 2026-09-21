const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, messageController.sendMessage);
router.get('/conversations', authenticate, messageController.getConversations);
router.get('/conversation/:userId', authenticate, messageController.getConversation);
router.get('/unread', authenticate, messageController.getUnreadCount);

module.exports = router;