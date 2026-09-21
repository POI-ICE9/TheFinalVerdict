const { UserSoul, Soul, Realm, User } = require('../models');
const { Op } = require('sequelize');

exports.assignSoul = async (req, res, next) => {
  try {
    const { soul_id, realm_id, motivation, punishment, beatitude, tags, circle_name } = req.body;

    const realm = await Realm.findByPk(realm_id);
    if (!realm || realm.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Regno non trovato' });
    }

    const soul = await Soul.findByPk(soul_id);
    if (!soul || soul.status !== 'approved') {
      return res.status(404).json({ error: 'Anima non disponibile' });
    }

    const existing = await UserSoul.findOne({
      where: { user_id: req.user.id, soul_id, realm_id }
    });

    if (existing) {
      return res.status(409).json({ error: 'Anima già presente in questo regno' });
    }

    const userSoul = await UserSoul.create({
      user_id: req.user.id,
      soul_id,
      realm_id,
      motivation,
      punishment,
      beatitude,
      tags: tags || [],
      circle_name
    });

    // Aggiorna contatori
    const realmField = realm.realm_type === 'inferno' ? 'inferno_count' : 
                       realm.realm_type === 'purgatorio' ? 'purgatorio_count' : 'paradiso_count';
    await soul.increment(realmField);
    await soul.increment('total_judgments');
    await realm.increment('souls_count');

    res.status(201).json({ userSoul });
  } catch (error) {
    next(error);
  }
};

exports.getUserSouls = async (req, res, next) => {
  try {
    const { realm_id, search, sortBy = 'created_at', order = 'DESC' } = req.query;
    const where = { user_id: req.user.id };
    
    if (realm_id) where.realm_id = realm_id;
    if (search) {
      // Join con Soul per cercare per nome
    }

    const userSouls = await UserSoul.findAll({
      where,
      include: [
        { model: Soul, as: 'soul' },
        { model: Realm, as: 'realm' }
      ],
      order: [[sortBy, order]]
    });

    res.json({ userSouls });
  } catch (error) {
    next(error);
  }
};

exports.updateUserSoul = async (req, res, next) => {
  try {
    const userSoul = await UserSoul.findByPk(req.params.id);
    if (!userSoul || userSoul.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Sentenza non trovata' });
    }

    const { realm_id, motivation, punishment, beatitude, tags, circle_name } = req.body;

    // Se cambia regno, aggiorna i contatori
    if (realm_id && realm_id !== userSoul.realm_id) {
      const oldRealm = await Realm.findByPk(userSoul.realm_id);
      const newRealm = await Realm.findByPk(realm_id);
      
      if (oldRealm && newRealm) {
        const oldField = oldRealm.realm_type === 'inferno' ? 'inferno_count' : 
                        oldRealm.realm_type === 'purgatorio' ? 'purgatorio_count' : 'paradiso_count';
        const newField = newRealm.realm_type === 'inferno' ? 'inferno_count' : 
                        newRealm.realm_type === 'purgatorio' ? 'purgatorio_count' : 'paradiso_count';
        
        const soul = await Soul.findByPk(userSoul.soul_id);
        await soul.decrement(oldField);
        await soul.increment(newField);
      }
    }

    await userSoul.update({ realm_id, motivation, punishment, beatitude, tags, circle_name });
    res.json({ userSoul });
  } catch (error) {
    next(error);
  }
};

exports.removeUserSoul = async (req, res, next) => {
  try {
    const userSoul = await UserSoul.findByPk(req.params.id);
    if (!userSoul || userSoul.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Sentenza non trovata' });
    }

    const realm = await Realm.findByPk(userSoul.realm_id);
    const soul = await Soul.findByPk(userSoul.soul_id);
    
    if (realm && soul) {
      const realmField = realm.realm_type === 'inferno' ? 'inferno_count' : 
                        realm.realm_type === 'purgatorio' ? 'purgatorio_count' : 'paradiso_count';
      await soul.decrement(realmField);
      await soul.decrement('total_judgments');
      await realm.decrement('souls_count');
    }

    await userSoul.destroy();
    res.json({ message: 'Sentenza rimossa' });
  } catch (error) {
    next(error);
  }
};

exports.reorderSouls = async (req, res, next) => {
  try {
    const { items } = req.body;
    const updates = items.map((item, index) => 
      UserSoul.update({ custom_order: index }, { where: { id: item.id, user_id: req.user.id } })
    );
    await Promise.all(updates);
    res.json({ message: 'Ordine aggiornato' });
  } catch (error) {
    next(error);
  }
};