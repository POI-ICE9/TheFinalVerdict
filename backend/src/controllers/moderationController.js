const { Report, User, Comment, UserSoul, Soul } = require('../models');
const { Op } = require('sequelize');
const { emitToUser } = require('../config/websocket');

exports.createReport = async (req, res, next) => {
  try {
    const { report_type, target_type, target_id, reported_user_id, reason, priority } = req.body;
    
    const report = await Report.create({
      reporter_id: req.user.id,
      report_type,
      target_type,
      target_id,
      reported_user_id,
      reason,
      priority: priority || 'medium'
    });

    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, report_type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (report_type) where.report_type = report_type;

    const reports = await Report.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'username'] },
        { model: User, as: 'reportedUser', attributes: ['id', 'username'] },
        { model: User, as: 'assignee', attributes: ['id', 'username'] }
      ]
    });

    res.json({
      reports: reports.rows,
      pagination: { total: reports.count, page: parseInt(page) }
    });
  } catch (error) {
    next(error);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Segnalazione non trovata' });

    const { status, resolution_notes, action } = req.body;
    await report.update({
      status: status || 'resolved',
      resolution_notes,
      resolved_at: new Date(),
      assigned_to: req.user.id
    });

    // Azione sul target
    if (action === 'delete_comment') {
      await Comment.update({ deleted_at: new Date() }, { where: { id: report.target_id } });
    } else if (action === 'ban_user' && report.reported_user_id) {
      await User.update({ status: 'banned' }, { where: { id: report.reported_user_id } });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

exports.assignReport = async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Segnalazione non trovata' });

    const { assigned_to } = req.body;
    await report.update({ assigned_to, status: 'reviewing' });

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

exports.getPendingCustomSouls = async (req, res, next) => {
  try {
    const souls = await Soul.findAll({
      where: { status: 'pending', category: 'personal' },
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({ souls });
  } catch (error) {
    next(error);
  }
};