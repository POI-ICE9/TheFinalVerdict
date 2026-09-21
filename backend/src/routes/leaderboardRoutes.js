const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/judges', leaderboardController.getTopJudges);
router.get('/realms', leaderboardController.getTopRealms);
router.get('/sentences', leaderboardController.getTopSentences);
router.get('/rank/:userId?', optionalAuth, leaderboardController.getUserRank);

module.exports = router;