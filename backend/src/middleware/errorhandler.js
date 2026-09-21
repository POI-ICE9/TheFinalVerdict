const { sequelize } = require('../models');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Errore di validazione',
      details: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Conflitto',
      details: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Riferimento non valido' });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Errore interno del server' });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Risorsa non trovata' });
};

module.exports = { errorHandler, notFoundHandler };