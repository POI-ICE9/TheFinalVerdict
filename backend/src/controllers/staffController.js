const { User, StaffLog } = require('../models');
const jwt = require('jsonwebtoken');
const { sendEmail, emailTemplates } = require('../config/email');
const { Op } = require('sequelize');

exports.getStaffMembers = async (req, res, next) => {
  try {
    const staff = await User.findAll({
      where: {
        role: { [Op.in]: ['moderator', 'super_moderator', 'content_manager', 'support', 'analytics', 'admin', 'founder'] }
      },
      attributes: { exclude: ['password_hash', 'two_factor_secret'] },
      order: [['created_at', 'ASC']]
    });

    res.json({ staff });
  } catch (error) {
    next(error);
  }
};

exports.inviteStaff = async (req, res, next) => {
  try {
    const { email, role, message } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email già registrata' });
    }

    const inviteToken = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    await sendEmail({
      to: email,
      subject: 'Invito Staff - TheFinalVerdict',
      html: emailTemplates.staffInvite(role, inviteToken)
    });

    res.json({ message: 'Invito inviato' });
  } catch (error) {
    next(error);
  }
};

exports.acceptInvite = async (req, res, next) => {
  try {
    const { token, username, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.create({
      username,
      email: decoded.email,
      password_hash: password,
      role: decoded.role,
      email_verified: true
    });

    res.status(201).json({ message: 'Account creato', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

exports.updateStaffRole = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    const { role } = req.body;
    const allowedRoles = ['moderator', 'super_moderator', 'content_manager', 'support', 'analytics'];
    
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Ruolo non valido' });
    }

    await user.update({ role });

    await StaffLog.create({
      staff_id: req.user.id,
      action: 'ROLE_CHANGE',
      target_type: 'user',
      target_id: user.id,
      details: { from: user.role, to: role },
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({ message: 'Ruolo aggiornato', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

exports.removeStaff = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    await user.update({ role: 'user' });

    await StaffLog.create({
      staff_id: req.user.id,
      action: 'STAFF_REMOVED',
      target_type: 'user',
      target_id: user.id,
      ip_address: req.ip
    });

    res.json({ message: 'Membro rimosso dallo staff' });
  } catch (error) {
    next(error);
  }
};

exports.getStaffStats = async (req, res, next) => {
  try {
    const staff = await User.findAll({
      where: { role: { [Op.in]: ['moderator', 'super_moderator', 'support', 'admin', 'founder'] } },
      attributes: ['id', 'username', 'role', 'last_login', 'created_at']
    });

    const stats = await Promise.all(staff.map(async (s) => {
      const logsCount = await StaffLog.count({ where: { staff_id: s.id } });
      return { ...s.toJSON(), actionsCount: logsCount };
    }));

    res.json({ staff: stats });
  } catch (error) {
    next(error);
  }
};