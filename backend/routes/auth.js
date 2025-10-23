const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const CryptoJS = require('crypto-js');
const User = require('../models/userModel');
const router = express.Router();

// Rate limiting for auth endpoints (5 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many auth attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Encryption key (must match frontend)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'AvpsUT9vnOL5t2L19Kkhis1p5kUaTyGcSHW2yKBKYoU';

// Decrypt payload
const decryptPayload = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Decryption failed');
  }
};

// Middleware to verify JWT from cookie
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Manual signup with encryption and validation
router.post('/signup', authLimiter, [
  body('encryptedData').notEmpty().withMessage('Encrypted data is required')
], async (req, res) => {
  try {
    // Validation already run by chain; no manual call needed

    const { encryptedData } = req.body;
    const { name, email, phone, password } = decryptPayload(encryptedData);

    // Validate decrypted payload
    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!phone || !/^\+?[\d\s-]{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Valid phone is required' });
    }
    if (!password || password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return res.status(400).json({ error: 'Password must be 8+ chars with letter, number, special char' });
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedPhone = phone.trim();

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: sanitizedEmail }, { phone: sanitizedPhone }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({ name: sanitizedName, email: sanitizedEmail, phone: sanitizedPhone, password });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.status(201).json({ message: 'Signup successful', user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    if (err.message === 'Decryption failed') {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    console.error('Signup Error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Manual login with encryption and validation
router.post('/login', authLimiter, [
  body('encryptedData').notEmpty().withMessage('Encrypted data is required')
], async (req, res) => {
  try {
    // Validation already run by chain; no manual call needed

    const { encryptedData } = req.body;
    const { email, password } = decryptPayload(encryptedData);

    // Validate decrypted payload
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has a password
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.json({ message: 'Login successful', user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    if (err.message === 'Decryption failed') {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

// Save profile data
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    // Optional: Decrypt if profile data is encrypted; assuming plain for now
    const profileData = req.body;
    
    // Basic validation
    if (!profileData.fullName || !profileData.state) {
      return res.status(400).json({ error: 'Full name and state are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profile: profileData } },
      { new: true, runValidators: true }
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

// Get user info (for authenticated user)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('email name picture');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get User Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Apply or update scheme status (user-specific)
router.post('/apply-scheme', authenticateToken, async (req, res) => {
  try {
    const { schemeId, schemeName, category, description, state, status } = req.body;
    
    if (!schemeId || !schemeName || !status) {
      return res.status(400).json({ error: 'Missing required fields (schemeId, schemeName, status)' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure profile.appliedSchemes exists
    if (!user.profile.appliedSchemes) {
      user.profile.appliedSchemes = [];
    }

    // Check if scheme already exists
    const existingIndex = user.profile.appliedSchemes.findIndex(s => s.id === schemeId);
    if (existingIndex > -1) {
      // Update status
      user.profile.appliedSchemes[existingIndex].status = status;
      user.profile.appliedSchemes[existingIndex].appliedDate = new Date();
    } else {
      // Add new
      user.profile.appliedSchemes.push({
        id: schemeId,
        name: schemeName,
        category: category || 'General',
        description: description || '',
        state: state || 'Pan India',
        status,
        appliedDate: new Date()
      });
    }

    await user.save();
    res.json({ 
      message: 'Scheme application status updated successfully', 
      appliedSchemes: user.profile.appliedSchemes 
    });
  } catch (err) {
    console.error('Apply Scheme Error:', err.message);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Get user's applied schemes (user-specific)
router.get('/applied-schemes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('profile.appliedSchemes');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.profile?.appliedSchemes || []);
  } catch (err) {
    console.error('Get Applied Schemes Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applied schemes' });
  }
});

// Bookmark or unbookmark scheme (user-specific)
router.post('/bookmark-scheme', authenticateToken, async (req, res) => {
  try {
    const { schemeId, schemeName, category, description, state, action } = req.body; // action: 'add' or 'remove'
    
    if (!schemeId || !schemeName || !action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Missing required fields (schemeId, schemeName, action)' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure profile.bookmarkedSchemes exists
    if (!user.profile.bookmarkedSchemes) {
      user.profile.bookmarkedSchemes = [];
    }

    if (action === 'add') {
      // Check if already bookmarked
      const existingIndex = user.profile.bookmarkedSchemes.findIndex(s => s.id === schemeId);
      if (existingIndex === -1) {
        user.profile.bookmarkedSchemes.push({
          id: schemeId,
          name: schemeName,
          category: category || 'General',
          description: description || '',
          state: state || 'Pan India',
          bookmarkedDate: new Date()
        });
      }
    } else if (action === 'remove') {
      user.profile.bookmarkedSchemes = user.profile.bookmarkedSchemes.filter(s => s.id !== schemeId);
    }

    await user.save();
    res.json({ 
      message: `Scheme ${action === 'add' ? 'bookmarked' : 'unbookmarked'} successfully`, 
      bookmarkedSchemes: user.profile.bookmarkedSchemes 
    });
  } catch (err) {
    console.error('Bookmark Scheme Error:', err.message);
    res.status(500).json({ error: 'Failed to update bookmark status' });
  }
});

// Get user's bookmarked schemes (user-specific)
router.get('/bookmarked-schemes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('profile.bookmarkedSchemes');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.profile?.bookmarkedSchemes || []);
  } catch (err) {
    console.error('Get Bookmarked Schemes Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch bookmarked schemes' });
  }
});

module.exports = router;