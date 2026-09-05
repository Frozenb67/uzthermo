function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden: insufficient permissions'));
    }
    return next();
  };
}

module.exports = { requireRole };
