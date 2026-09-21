const { Friendship, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { emitToUser } = require('../config/websocket');

exports.sendRequest = async (req, res, next) => {
  try {
    const { friend_id } = req.body;
    
    if (friend_id === req.user.id) {
      return res.status(400).json({ error: 'Non puoi aggiungere te stesso' });
    }

    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user_id: req.user.id, friend_id },
          { user_id: friend_id, friend_id: req.user.id }
        ]
      }
    });

    if (existing) return res.status(409).json({ error: 'Richiesta già esistente' });

    await Friendship.create({ user_id: req.user.id, friend_id, status: 'pending' });

    await Notification.create({
      user_id: friend_id,
      type: 'friend_request',
      title: 'Nuova richiesta di amicizia',
      message: `${req.user.username} ti ha inviato una richiesta`
    });

    emitToUser(friend_id, 'friend:request', { from: req.user.id });

    res.status(201).json({ message: 'Richiesta inviata' });
  } catch (error) {
    next(error);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      where: { id: req.params.id, friend_id: req.user.id, status: 'pending' }
    });

    if (!friendship) return res.status(404).json({ error: 'Richiesta non trovata' });

    await friendship.update({ status: 'accepted' });
    res.json({ message: 'Amicizia accettata' });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      where: { id: req.params.id, friend_id: req.user.id, status: 'pending' }
    });

    if (!friendship) return res.status(404).json({ error: 'Richiesta non trovata' });

    await friendship.update({ status: 'rejected' });
    res.json({ message: 'Richiesta rifiutata' });
  } catch (error) {
    next(error);
  }
};

exports.getFriends = async (req, res, next) => {
  try {
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [{ user_id: req.user.id }, { friend_id: req.user.id }],
        status: 'accepted'
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] },
        { model: User, as: 'friend', attributes: ['id', 'username', 'avatar_url'] }
      ]
    });

    const friends = friendships.map(f => 
      f.user_id === req.user.id ? f.friend : f.user
    );

    res.json({ friends });
  } catch (error) {
    next(error);
  }
};

exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await Friendship.findAll({
      where: { friend_id: req.user.id, status: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }]
    });

    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

exports.removeFriend = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [{ user_id: req.user.id }, { friend_id: req.user.id }]
      }
    });

    if (!friendship) return res.status(404).json({ error: 'Amicizia non trovata' });
    await friendship.destroy();
    res.json({ message: 'Amicizia rimossa' });
  } catch (error) {
    next(error);
  }
};