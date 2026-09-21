const { Soul, UserSoul, Realm, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.getAllSouls = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, category, status, sortBy = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;
    if (status) where.status = status;

    const { count, rows } = await Soul.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]]
    });

    res.json({
      souls: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSoulById = async (req, res, next) => {
  try {
    const soul = await Soul.findByPk(req.params.id, {
      include: [{
        model: UserSoul,
        as: 'userSouls',
        include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
      }]
    });

    if (!soul) return res.status(404).json({ error: 'Anima non trovata' });
    res.json({ soul });
  } catch (error) {
    next(error);
  }
};

exports.createSoul = async (req, res, next) => {
  try {
    const { name, category, epoch, nationality, biography } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Soul.findOne({ where: { slug } });
    if (existing) return res.status(409).json({ error: 'Anima già esistente' });

    const soul = await Soul.create({
      name,
      slug,
      category,
      epoch,
      nationality,
      biography,
      status: req.user.role === 'admin' || req.user.role === 'founder' ? 'approved' : 'pending',
      created_by: req.user.id,
      approved_by: req.user.role === 'admin' || req.user.role === 'founder' ? req.user.id : null,
      approved_at: req.user.role === 'admin' || req.user.role === 'founder' ? new Date() : null
    });

    res.status(201).json({ soul });
  } catch (error) {
    next(error);
  }
};

exports.updateSoul = async (req, res, next) => {
  try {
    const soul = await Soul.findByPk(req.params.id);
    if (!soul) return res.status(404).json({ error: 'Anima non trovata' });

    const { name, category, epoch, nationality, biography, image_url } = req.body;
    await soul.update({ name, category, epoch, nationality, biography, image_url });

    res.json({ soul });
  } catch (error) {
    next(error);
  }
};

exports.deleteSoul = async (req, res, next) => {
  try {
    const soul = await Soul.findByPk(req.params.id);
    if (!soul) return res.status(404).json({ error: 'Anima non trovata' });

    await soul.destroy();
    res.json({ message: 'Anima eliminata' });
  } catch (error) {
    next(error);
  }
};

exports.approveSoul = async (req, res, next) => {
  try {
    const soul = await Soul.findByPk(req.params.id);
    if (!soul) return res.status(404).json({ error: 'Anima non trovata' });

    await soul.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    res.json({ message: 'Anima approvata', soul });
  } catch (error) {
    next(error);
  }
};

exports.rejectSoul = async (req, res, next) => {
  try {
    const soul = await Soul.findByPk(req.params.id);
    if (!soul) return res.status(404).json({ error: 'Anima non trovata' });

    const { reason } = req.body;
    await soul.update({
      status: 'rejected',
      rejection_reason: reason
    });

    res.json({ message: 'Anima rifiutata', soul });
  } catch (error) {
    next(error);
  }
};

exports.mergeSouls = async (req, res, next) => {
  try {
    const { sourceId, targetId } = req.body;
    
    const source = await Soul.findByPk(sourceId);
    const target = await Soul.findByPk(targetId);
    
    if (!source || !target) {
      return res.status(404).json({ error: 'Una o entrambe le anime non esistono' });
    }

    await UserSoul.update({ soul_id: targetId }, { where: { soul_id: sourceId } });
    await source.destroy();

    res.json({ message: 'Anime unite', target });
  } catch (error) {
    next(error);
  }
};

exports.getSoulStats = async (req, res, next) => {
  try {
    const soul = await Soul.findByPk(req.params.id);
    if (!soul) return res.status(404).json({ error: 'Anima non trovata' });

    const total = soul.inferno_count + soul.purgatorio_count + soul.paradiso_count;
    const distribution = {
      inferno: total > 0 ? ((soul.inferno_count / total) * 100).toFixed(1) : 0,
      purgatorio: total > 0 ? ((soul.purgatorio_count / total) * 100).toFixed(1) : 0,
      paradiso: total > 0 ? ((soul.paradiso_count / total) * 100).toFixed(1) : 0
    };

    res.json({ soul, distribution, totalJudgments: total });
  } catch (error) {
    next(error);
  }
};