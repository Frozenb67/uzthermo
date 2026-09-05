const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('Email is already registered');
    }

    const user = await User.create({ name, email, password, phone });

    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getMe };
