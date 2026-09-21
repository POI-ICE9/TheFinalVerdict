const { User, Soul, Ticket, Report, Realm, StaffLog, Setting, Announcement, Blacklist, Notification } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { emitToAll, emitToAdmin } = require('../config/websocket');
const { sendEmail } = require('../config/email');
const moment = require('moment');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = moment().startOf('day').toDate();
    const weekAgo = moment().subtract(7, 'days').toDate();
    const monthAgo = moment().subtract(30, 'days').toDate();

    const usersActiveToday = await User.count({
      where: { last_login: { [Op.gte]: today }, status: 'active' }
    });

    const newRegistrations = await User.count({
      where: { created_at: { [Op.gte]: today } }
    });

    const totalSouls = await Soul.count({ where: { status: 'approved' } });
    const openTickets = await Ticket.count({ where: { status: { [Op.in]: ['open', 'in_progress'] } } });

    const infernoCount = await Realm.sum('souls_count', { where: { realm_type: 'inferno' } }) || 0;
    const purgatorioCount = await Realm.sum('souls_count', { where: { realm_type: 'purgatorio' } }) || 0;
    const paradisoCount = await Realm.sum('souls_count', { where: { realm_type: 'paradiso' } }) || 0;
    const totalRealms = infernoCount + purgatorioCount + paradisoCount;

    const pendingReports = await Report.count({ where: { status: 'pending' } });
    const urgentTickets = await Ticket.count({ where: { priority: 'urgent', status: { [Op.in]: ['open', 'in_progress'] } } });

    res.json({
      usersActiveToday,
      newRegistrations,
      totalSouls,
      openTickets,
      realmDistribution: {
        inferno: { count: infernoCount, percentage: totalRealms > 0 ? ((infernoCount / totalRealms) * 100).toFixed(1) : 0 },
        purgatorio: { count: purgatorioCount, percentage: totalRealms > 0 ? ((purgatorioCount / totalRealms) * 100).toFixed(1) : 0 },
        paradiso: { count: paradisoCount, percentage: totalRealms > 0 ? ((paradisoCount / totalRealms) * 100).toFixed(1) : 0 }
      },
      pendingReports,
      urgentTickets
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecentActivity = async (req, res, next) => {
  try {
    const logs = await StaffLog.findAll({
      limit: 20,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'staff', attributes: ['id', 'username'] }]
    });

    const recentUsers = await User.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'username', 'created_at']
    });

    const recentTickets = await Ticket.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
    });

    res.json({ logs, recentUsers, recentTickets });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const since = moment().subtract(parseInt(period), 'days').toDate();

    const userGrowth = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { created_at: { [Op.gte]: since } },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { last_login: { [Op.gte]: since } } });
    const engagementRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;

    res.json({
      userGrowth,
      totalUsers,
      activeUsers,
      engagementRate
    });
  } catch (error) {
    next(error);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, target_audience, start_date, end_date } = req.body;
    
    const announcement = await Announcement.create({
      title, content, type, target_audience,
      start_date, end_date,
      created_by: req.user.id
    });

    if (type === 'push') {
      emitToAll('announcement:new', announcement.toJSON());
    }

    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
};

exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
    });
    res.json({ announcements });
  } catch (error) {
    next(error);
  }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Annuncio non trovato' });

    const { title, content, type, target_audience, start_date, end_date, is_active } = req.body;
    await announcement.update({ title, content, type, target_audience, start_date, end_date, is_active });

    res.json({ announcement });
  } catch (error) {
    next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Annuncio non trovato' });
    await announcement.destroy();
    res.json({ message: 'Annuncio eliminato' });
  } catch (error) {
    next(error);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findAll();
    const grouped = settings.reduce((acc, s) => {
      const cat = s.category || 'general';
      if (!acc[cat]) acc[cat] = {};
      acc[cat][s.key] = s.value;
      return acc;
    }, {});

    res.json({ settings: grouped });
  } catch (error) {
    next(error);
  }
};

exports.updateSetting = async (req, res, next) => {
  try {
    const { key, value, category, description } = req.body;
    
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: { value, category, description, updated_by: req.user.id }
    });

    if (!created) {
      await setting.update({ value, category, description, updated_by: req.user.id });
    }

    res.json({ setting });
  } catch (error) {
    next(error);
  }
};

exports.addBlacklistEntry = async (req, res, next) => {
  try {
    const { type, value, category, reason, expires_at } = req.body;
    const entry = await Blacklist.create({
      type, value, category, reason, expires_at,
      added_by: req.user.id
    });
    res.status(201).json({ entry });
  } catch (error) {
    next(error);
  }
};

exports.getBlacklist = async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = { is_active: true };
    if (type) where.type = type;

    const entries = await Blacklist.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ entries });
  } catch (error) {
    next(error);
  }
};

exports.removeBlacklistEntry = async (req, res, next) => {
  try {
    const entry = await Blacklist.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Voce non trovata' });
    await entry.update({ is_active: false });
    res.json({ message: 'Voce rimossa' });
  } catch (error) {
    next(error);
  }
};

exports.getStaffLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, staff_id, action } = req.query;
    const where = {};
    if (staff_id) where.staff_id = staff_id;
    if (action) where.action = action;

    const logs = await StaffLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'staff', attributes: ['id', 'username', 'role'] }]
    });

    res.json({
      logs: logs.rows,
      pagination: { total: logs.count, page: parseInt(page) }
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMassEmail = async (req, res, next) => {
  try {
    const { subject, content, targetRole } = req.body;
    const where = { status: 'active', email_verified: true };
    if (targetRole) where.role = targetRole;

    const users = await User.findAll({ where, attributes: ['email', 'username'] });
    
    let sent = 0;
    for (const user of users) {
      try {
        await sendEmail({ to: user.email, subject, html: content });
        sent++;
      } catch (e) {
        console.error(`Failed to send to ${user.email}:`, e);
      }
    }

    res.json({ message: `Email inviate a ${sent} utenti` });
  } catch (error) {
    next(error);
  }
};