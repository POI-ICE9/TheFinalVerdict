const { Achievement, UserAchievement, User } = require('../models');

exports.getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.findAll({
      include: [{
        model: UserAchievement,
        as: 'userAchievements',
        where: { user_id: req.user.id },
        required: false
      }]
    });

    res.json({ achievements });
  } catch (error) {
    next(error);
  }
};

exports.checkAchievements = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;

    const achievements = await Achievement.findAll();
    const unlocked = await UserAchievement.findAll({ where: { user_id: userId } });
    const unlockedIds = unlocked.map(a => a.achievement_id);

    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      let shouldUnlock = false;
      if (achievement.requirement_type === 'karma' && user.karma >= achievement.requirement_value) {
        shouldUnlock = true;
      } else if (achievement.requirement_type === 'level' && user.level >= achievement.requirement_value) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        await UserAchievement.create({ user_id: userId, achievement_id: achievement.id });
        await user.increment('xp', { by: achievement.xp_reward });
      }
    }
  } catch (error) {
    console.error('Achievement check error:', error);
  }
};