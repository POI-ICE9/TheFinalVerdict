const { Realm, UserSoul, Soul, User } = require('../models');
const { Op } = require('sequelize');

exports.getUserRealms = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const realms = await Realm.findAll({
      where: { user_id: userId },
      include: [{
        model: UserSoul,
        as: 'userSouls',
        include: [{ model: Soul, as: 'soul' }]
      }]
    });

    res.json({ realms });
  } catch (error) {
    next(error);
  }
};

exports.getRealmById = async (req, res, next) => {
  try {
    const realm = await Realm.findByPk(req.params.id, {
      include: [{
        model: UserSoul,
        as: 'userSouls',
        include: [
          { model: Soul, as: 'soul' },
          { model: User, as: 'user', attributes: ['id', 'username'] }
        ]
      }, {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar_url']
      }]
    });

    if (!realm) return res.status(404).json({ error: 'Regno non trovato' });
    
    await realm.increment('visit_count');
    res.json({ realm });
  } catch (error) {
    next(error);
  }
};

exports.updateRealm = async (req, res, next) => {
  try {
    const realm = await Realm.findByPk(req.params.id);
    if (!realm) return res.status(404).json({ error: 'Regno non trovato' });
    if (realm.user_id !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const { custom_name, description, theme, primary_color, background_url, music_url, visibility } = req.body;
    await realm.update({ custom_name, description, theme, primary_color, background_url, music_url, visibility });

    res.json({ realm });
  } catch (error) {
    next(error);
  }
};