const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }

    req.user = user;
    return next();
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized, token failed'));
  }
}

module.exports = { protect };
