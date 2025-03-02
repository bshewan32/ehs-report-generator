// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/auth
// @desc    Get user data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get user from the database except password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: config.get('jwtExpiration') },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;