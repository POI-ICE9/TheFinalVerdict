const { Message, User } = require('../models');
const { Op } = require('sequelize');
const { emitToUser } = require('../config/websocket');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, content } = req.body;
    
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) return res.status(404).json({ error: 'Destinatario non trovato' });

    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      content
    });

    emitToUser(receiver_id, 'message:new', {
      id: message.id,
      sender: { id: req.user.id, username: req.user.username },
      content,
      created_at: message.created_at
    });

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: req.user.id }, { receiver_id: req.user.id }]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, receiver_id: userId },
          { sender_id: userId, receiver_id: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'receiver', attributes: ['id', 'username'] }
      ],
      order: [['created_at', 'ASC']]
    });

    // Segna come letti
    await Message.update(
      { is_read: true },
      { where: { sender_id: userId, receiver_id: req.user.id, is_read: false } }
    );

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.count({
      where: { receiver_id: req.user.id, is_read: false }
    });
    res.json({ count });
  } catch (error) {
    next(error);
  }
};