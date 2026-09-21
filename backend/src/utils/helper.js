const crypto = require('crypto');

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, two_factor_secret, ...safe } = user.toJSON ? user.toJSON() : user;
  return safe;
};

const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  return {
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    page: pageNum
  };
};

const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

module.exports = { generateSlug, generateToken, sanitizeUser, paginate, calculateLevel };