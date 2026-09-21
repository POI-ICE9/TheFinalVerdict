const { Vote, UserSoul, Soul, Realm } = require('../models');

exports.vote = async (req, res, next) => {
  try {
    const { user_soul_id, vote_type } = req.body;
    
    const existing = await Vote.findOne({
      where: { user_id: req.user.id, user_soul_id }
    });

    if (existing) {
      if (existing.vote_type === vote_type) {
        await existing.destroy();
        return res.json({ message: 'Voto rimosso' });
      }
      await existing.update({ vote_type });
    } else {
      await Vote.create({ user_id: req.user.id, user_soul_id, vote_type });
    }

    res.json({ message: 'Voto registrato' });
  } catch (error) {
    next(error);
  }
};

exports.getVoteStatus = async (req, res, next) => {
  try {
    const vote = await Vote.findOne({
      where: { user_id: req.user.id, user_soul_id: req.params.userSoulId }
    });
    res.json({ vote: vote?.vote_type || null });
  } catch (error) {
    next(error);
  }
};