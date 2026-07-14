const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: IS_PROD ? 'none' : 'lax',   // 'none' required for cross-origin cookies
  secure: IS_PROD,                        // secure required when sameSite is 'none'
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function issueToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required').isLength({ max: 50 }),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ errors: [{ msg: 'An account with this email already exists.' }] });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ username, email, passwordHash });
      const token = issueToken(user);
      res.cookie('token', token, COOKIE_OPTS);
      res.status(201).json({
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('[auth/register]', err);
      res.status(500).json({ errors: [{ msg: 'Server error. Please try again.' }] });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ errors: [{ msg: 'Invalid email or password.' }] });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ errors: [{ msg: 'Invalid email or password.' }] });
      }
      const token = issueToken(user);
      res.cookie('token', token, COOKIE_OPTS);
      res.json({
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('[auth/login]', err);
      res.status(500).json({ errors: [{ msg: 'Server error. Please try again.' }] });
    }
  }
);

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: IS_PROD ? 'none' : 'lax', secure: IS_PROD });
  res.json({ message: 'Signed out successfully.' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
