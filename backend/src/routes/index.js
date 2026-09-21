const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/souls', require('./soulRoutes'));
router.use('/realms', require('./realmRoutes'));
router.use('/user-souls', require('./userSoulRoutes'));
router.use('/tickets', require('./ticketRoutes'));
router.use('/comments', require('./commentRoutes'));
router.use('/moderation', require('./moderationRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/staff', require('./staffRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/messages', require('./messageRoutes'));
router.use('/leaderboard', require('./leaderboardRoutes'));
router.use('/votes', require('./voteRoutes'));
router.use('/friendships', require('./friendshipRoutes'));
router.use('/achievements', require('./achievementRoutes'));

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;