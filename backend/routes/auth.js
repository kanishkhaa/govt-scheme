const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Manual signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Manual login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth Start
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=auth_failed', session: false }),
  (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.redirect(`http://localhost:5173/login?token=${token}`);
    } catch (err) {
      console.error('Callback Error:', err.message);
      res.redirect('http://localhost:5173/login?error=callback_failed');
    }
  }
);

// Google OAuth Token Exchange
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client("236615308696-6hubivfe1m0k6tmpp424hu4flt4bvjtt.apps.googleusercontent.com");
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "236615308696-6hubivfe1m0k6tmpp424hu4flt4bvjtt.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: '',
        phone: '',
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Save profile data
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const profileData = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profile: profileData } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile saved successfully', user });
  } catch (err) {
    console.error('Save Profile Error:', err.message);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get profile data
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('profile');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.profile || {});
  } catch (err) {
    console.error('Get Profile Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user email
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ email: user.email });
  } catch (err) {
    console.error('Get User Email Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user email' });
  }
});

module.exports = router;