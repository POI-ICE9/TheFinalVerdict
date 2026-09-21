const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const { authenticate } = require('../middleware/auth');

router.post('/request', authenticate, friendshipController.sendRequest);
router.get('/', authenticate, friendshipController.getFriends);
router.get('/pending', authenticate, friendshipController.getPendingRequests);
router.post('/:id/accept', authenticate, friendshipController.acceptRequest);
router.post('/:id/reject', authenticate, friendshipController.rejectRequest);
router.delete('/:id', authenticate, friendshipController.removeFriend);

module.exports = router;