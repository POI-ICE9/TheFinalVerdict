const { User, Realm, UserSoul, Vote } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

exports.getTopJudges = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const where = { status: 'active' };
    
    if (period !== 'all') {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      where.last_login = { [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'avatar_url', 'karma', 'xp', 'level'],
      order: [['karma', 'DESC']],
      limit: 100
    });

    res.json({ leaderboard: users });
  } catch (error) {
    next(error);
  }
};

exports.getTopRealms = async (req, res, next) => {
  try {
    const realms = await Realm.findAll({
      where: { visibility: 'public' },
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
      order: [['visit_count', 'DESC']],
      limit: 50
    });

    res.json({ realms });
  } catch (error) {
    next(error);
  }
};

exports.getTopSentences = async (req, res, next) => {
  try {
    const sentences = await UserSoul.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] },
        { model: Soul, as: 'soul', attributes: ['id', 'name'] }
      ],
      order: [[sequelize.literal('(SELECT COUNT(*) FROM votes WHERE votes.user_soul_id = "UserSoul".id)'), 'DESC']],
      limit: 50
    });

    res.json({ sentences });
  } catch (error) {
    next(error);
  }
};

exports.getUserRank = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await User.findByPk(userId);
    
    const rank = await User.count({
      where: {
        karma: { [Op.gt]: user.karma },
        status: 'active'
      }
    }) + 1;

    res.json({ userId, rank, karma: user.karma, level: user.level });
  } catch (error) {
    next(error);
  }
};