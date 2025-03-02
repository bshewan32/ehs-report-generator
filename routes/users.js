// routes/users.js - User management routes
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, password, department } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      department,
      role: 'user' // Default role
    });
    
    await user.save();
    
    // Return user data
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  // Only allow admins or the user themselves to update
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const { name, email, department, role } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (department) userFields.department = department;
    
    // Only admins can change roles
    if (role && req.user.role === 'admin') {
      userFields.role = role;
    }
    
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;