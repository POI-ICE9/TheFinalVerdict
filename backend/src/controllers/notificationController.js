const { Notification } = require('../models');
const { Op } = require('sequelize');

exports.getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const where = { user_id: req.user.id };
    if (unread_only === 'true') where.is_read = false;

    const notifications = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      notifications: notifications.rows,
      pagination: { total: notifications.count, page: parseInt(page) },
      unreadCount: await Notification.count({ where: { user_id: req.user.id, is_read: false } })
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification || notification.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Notifica non trovata' });
    }

    await notification.update({ is_read: true });
    res.json({ message: 'Notifica letta' });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ message: 'Tutte le notifiche segnate come lette' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification || notification.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Notifica non trovata' });
    }

    await notification.destroy();
    res.json({ message: 'Notifica eliminata' });
  } catch (error) {
    next(error);
  }
};