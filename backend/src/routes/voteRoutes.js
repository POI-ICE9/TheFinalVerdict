const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, voteController.vote);
router.get('/:userSoulId', authenticate, voteController.getVoteStatus);

module.exports = router;