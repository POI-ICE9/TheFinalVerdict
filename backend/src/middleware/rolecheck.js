const roleHierarchy = {
  user: 0,
  moderator: 1,
  super_moderator: 2,
  content_manager: 2,
  support: 2,
  analytics: 1,
  admin: 3,
  founder: 4
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autenticato' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permessi insufficienti' });
    }

    next();
  };
};

const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autenticato' });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ error: 'Permessi insufficienti' });
    }

    next();
  };
};

module.exports = { requireRole, requireMinRole, roleHierarchy };