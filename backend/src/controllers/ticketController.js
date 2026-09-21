const { Ticket, TicketMessage, TicketTemplate, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendEmail, emailTemplates } = require('../config/email');
const { emitToUser, emitToAdmin } = require('../config/websocket');
const moment = require('moment');

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, category, priority, attachment_url } = req.body;

    const slaHours = priority === 'urgent' ? 1 : priority === 'high' ? 4 : priority === 'medium' ? 24 : 72;
    const sla_deadline = moment().add(slaHours, 'hours').toDate();

    const ticket = await Ticket.create({
      user_id: req.user.id,
      subject,
      description,
      category,
      priority: priority || 'medium',
      attachment_url,
      sla_deadline
    });

    // Primo messaggio = descrizione
    await TicketMessage.create({
      ticket_id: ticket.id,
      sender_id: req.user.id,
      message: description
    });

    await sendEmail({
      to: req.user.email,
      subject: `Ticket #${ticket.ticket_number} Creato`,
      html: emailTemplates.ticketCreated(ticket.ticket_number, subject)
    });

    emitToAdmin('ticket:new', { ticket: ticket.toJSON() });

    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.getUserTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const tickets = await Ticket.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'assignee', attributes: ['id', 'username'] }]
    });

    res.json({
      tickets: tickets.rows,
      pagination: { total: tickets.count, page: parseInt(page) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        { 
          model: TicketMessage, 
          as: 'messages',
          include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'role'] }],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket non trovato' });
    
    // Controllo permessi
    if (ticket.user_id !== req.user.id && !['admin', 'founder', 'super_moderator', 'support'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    res.json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.replyToTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket non trovato' });

    const { message, is_internal } = req.body;
    const msg = await TicketMessage.create({
      ticket_id: ticket.id,
      sender_id: req.user.id,
      message,
      is_internal: is_internal || false
    });

    // Aggiorna stato
    if (ticket.status === 'open' && req.user.role !== 'user') {
      await ticket.update({ status: 'in_progress' });
    }

    // Notifica
    const notifyUserId = ticket.user_id === req.user.id ? ticket.assigned_to : ticket.user_id;
    if (notifyUserId) {
      await Notification.create({
        user_id: notifyUserId,
        type: 'ticket_reply',
        title: `Nuova risposta al ticket #${ticket.ticket_number}`,
        message: message.substring(0, 100)
      });

      emitToUser(notifyUserId, 'ticket:reply', { ticketId: ticket.id });

      const user = await User.findByPk(notifyUserId);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: `Risposta al Ticket #${ticket.ticket_number}`,
          html: emailTemplates.ticketResponse(ticket.ticket_number)
        });
      }
    }

    res.status(201).json({ message: msg });
  } catch (error) {
    next(error);
  }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket non trovato' });

    const { status, priority, assigned_to } = req.body;
    const updateData = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'resolved') updateData.resolved_at = new Date();
      if (status === 'closed') updateData.closed_at = new Date();
    }
    if (priority) updateData.priority = priority;
    if (assigned_to) updateData.assigned_to = assigned_to;

    await ticket.update(updateData);

    if (assigned_to) {
      await Notification.create({
        user_id: assigned_to,
        type: 'ticket_assigned',
        title: `Ticket #${ticket.ticket_number} assegnato a te`,
        message: ticket.subject
      });
      emitToUser(assigned_to, 'ticket:assigned', { ticketId: ticket.id });
    }

    res.json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, category, assigned_to, search } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assigned_to) where.assigned_to = assigned_to;
    if (search) {
      where[Op.or] = [
        { subject: { [Op.iLike]: `%${search}%` } },
        { ticket_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const tickets = await Ticket.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] },
        { model: User, as: 'assignee', attributes: ['id', 'username'] }
      ]
    });

    res.json({
      tickets: tickets.rows,
      pagination: { total: tickets.count, page: parseInt(page) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTicketStats = async (req, res, next) => {
  try {
    const open = await Ticket.count({ where: { status: 'open' } });
    const inProgress = await Ticket.count({ where: { status: 'in_progress' } });
    const resolved = await Ticket.count({ where: { status: 'resolved' } });
    
    const resolvedToday = await Ticket.count({
      where: {
        status: 'resolved',
        resolved_at: { [Op.gte]: moment().startOf('day').toDate() }
      }
    });

    const avgResponseTime = 2.4; // Placeholder - calcolare da dati reali
    const avgRating = 4.6; // Placeholder

    res.json({
      open,
      inProgress,
      resolved,
      resolvedToday,
      avgResponseTime,
      avgRating
    });
  } catch (error) {
    next(error);
  }
};

exports.rateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket || ticket.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Ticket non trovato' });
    }

    const { rating, rating_comment } = req.body;
    await ticket.update({ rating, rating_comment });

    res.json({ message: 'Valutazione salvata' });
  } catch (error) {
    next(error);
  }
};

// Templates
exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await TicketTemplate.findAll({ order: [['name', 'ASC']] });
    res.json({ templates });
  } catch (error) {
    next(error);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const { name, category, subject, body, variables } = req.body;
    const template = await TicketTemplate.create({
      name, category, subject, body, variables,
      created_by: req.user.id
    });
    res.status(201).json({ template });
  } catch (error) {
    next(error);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await TicketTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template non trovato' });
    await template.destroy();
    res.json({ message: 'Template eliminato' });
  } catch (error) {
    next(error);
  }
};