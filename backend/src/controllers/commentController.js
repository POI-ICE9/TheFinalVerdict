const { Comment, User, UserSoul } = require('../models');
const { Op } = require('sequelize');

exports.createComment = async (req, res, next) => {
  try {
    const { content, user_soul_id } = req.body;
    const comment = await Comment.create({
      user_id: req.user.id,
      user_soul_id,
      content
    });

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const { user_soul_id } = req.query;
    const where = {};
    if (user_soul_id) where.user_soul_id = user_soul_id;

    const comments = await Comment.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment || comment.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Commento non trovato' });
    }

    const { content } = req.body;
    await comment.update({ content });
    res.json({ comment });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Commento non trovato' });
    
    if (comment.user_id !== req.user.id && !['admin', 'founder', 'moderator', 'super_moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    await comment.update({ deleted_at: new Date() });
    res.json({ message: 'Commento eliminato' });
  } catch (error) {
    next(error);
  }
};

exports.voteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Commento non trovato' });

    const { vote_type } = req.body;
    if (vote_type === 'like') await comment.increment('likes');
    else if (vote_type === 'dislike') await comment.increment('dislikes');

    res.json({ likes: comment.likes, dislikes: comment.dislikes });
  } catch (error) {
    next(error);
  }
};

exports.flagComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Commento non trovato' });

    const { reason } = req.body;
    await comment.update({ is_flagged: true, flag_reason: reason });

    res.json({ message: 'Commento segnalato' });
  } catch (error) {
    next(error);
  }
};