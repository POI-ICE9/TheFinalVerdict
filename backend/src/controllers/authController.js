const jwt = require('jsonwebtoken');
const { User, Realm } = require('../models');
const { sendEmail, emailTemplates } = require('../config/email');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username o email già in uso' });
    }

    const user = await User.create({
      username,
      email,
      password_hash: password
    });

    // Crea i 3 regni personali
    await Realm.bulkCreate([
      { user_id: user.id, realm_type: 'inferno', custom_name: 'Il Mio Inferno' },
      { user_id: user.id, realm_type: 'purgatorio', custom_name: 'Il Mio Purgatorio' },
      { user_id: user.id, realm_type: 'paradiso', custom_name: 'Il Mio Paradiso' }
    ]);

    const { accessToken, refreshToken } = generateTokens(user);

    await redisClient.set(`refresh:${user.id}`, refreshToken, { EX: 60 * 60 * 24 * 30 });

    await sendEmail({
      to: user.email,
      subject: 'Benvenuto su TheFinalVerdict!',
      html: emailTemplates.welcome(user.username)
    });

    logger.info('User registered', { userId: user.id, email });

    res.status(201).json({
      message: 'Registrazione completata',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: `Account ${user.status}` });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    await user.update({ last_login: new Date() });

    const { accessToken, refreshToken } = generateTokens(user);
    await redisClient.set(`refresh:${user.id}`, refreshToken, { EX: 60 * 60 * 24 * 30 });

    res.json({
      message: 'Login effettuato',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token richiesto' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const storedToken = await redisClient.get(`refresh:${decoded.id}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token non valido' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Utente non valido' });
    }

    const tokens = generateTokens(user);
    await redisClient.set(`refresh:${user.id}`, tokens.refreshToken, { EX: 60 * 60 * 24 * 30 });

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await redisClient.del(`refresh:${req.user.id}`);
    res.json({ message: 'Logout effettuato' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.json({ message: 'Se l\'email esiste, riceverai un link di reset' });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await redisClient.set(`reset:${user.id}`, resetToken, { EX: 3600 });

    await sendEmail({
      to: user.email,
      subject: 'Recupero Password - TheFinalVerdict',
      html: emailTemplates.passwordReset(resetToken)
    });

    res.json({ message: 'Email di reset inviata' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const storedToken = await redisClient.get(`reset:${decoded.id}`);
    if (storedToken !== token) {
      return res.status(400).json({ error: 'Token non valido o scaduto' });
    }

    const user = await User.findByPk(decoded.id);
    await user.update({ password_hash: newPassword });
    await redisClient.del(`reset:${decoded.id}`);

    res.json({ message: 'Password aggiornata' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Realm, as: 'realms' }]
    });
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};