const { User, Realm, UserSoul, Soul, Friendship, Message, Notification } = require('../models');
const { Op } = require('sequelize');
const { emitToUser } = require('../config/websocket');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, role, sortBy = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (role) where.role = role;

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      attributes: { exclude: ['password_hash', 'two_factor_secret'] }
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'two_factor_secret'] },
      include: [
        { model: Realm, as: 'realms' }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const { username, email, status, role, bio, quote, avatar_url } = req.body;
    await user.update({ username, email, status, role, bio, quote, avatar_url });

    res.json({ message: 'Utente aggiornato', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    const { duration, reason } = req.body;
    await user.update({ status: 'suspended' });

    await Notification.create({
      user_id: user.id,
      type: 'suspension',
      title: 'Account Sospeso',
      message: `Il tuo account è stato sospeso. Motivo: ${reason || 'Non specificato'}`
    });

    emitToUser(user.id, 'account:suspended', { reason });

    res.json({ message: 'Utente sospeso' });
  } catch (error) {
    next(error);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    const { reason } = req.body;
    await user.update({ status: 'banned' });

    await Notification.create({
      user_id: user.id,
      type: 'ban',
      title: 'Account Bannato',
      message: `Il tuo account è stato bannato. Motivo: ${reason || 'Non specificato'}`
    });

    res.json({ message: 'Utente bannato' });
  } catch (error) {
    next(error);
  }
};

exports.bulkBan = async (req, res, next) => {
  try {
    const { userIds, reason } = req.body;
    await User.update({ status: 'banned' }, {
      where: { id: { [Op.in]: userIds } }
    });
    res.json({ message: `${userIds.length} utenti bannati` });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    await user.destroy();
    res.json({ message: 'Utente eliminato' });
  } catch (error) {
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const soulsCount = await UserSoul.count({ where: { user_id: userId } });
    const realms = await Realm.findAll({ where: { user_id: userId } });
    const friendsCount = await Friendship.count({ 
      where: { [Op.or]: [{ user_id: userId }, { friend_id: userId }], status: 'accepted' } 
    });

    res.json({
      soulsCount,
      realms: realms.length,
      friendsCount,
      totalVisits: realms.reduce((sum, r) => sum + r.visit_count, 0)
    });
  } catch (error) {
    next(error);
  }
};

exports.exportUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'status', 'role', 'created_at', 'last_login']
    });

    const csv = [
      'ID,Username,Email,Status,Ruolo,Registrato,Ultimo Accesso',
      ...users.map(u => `${u.id},${u.username},${u.email},${u.status},${u.role},${u.created_at},${u.last_login}`)
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};