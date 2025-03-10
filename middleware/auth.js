// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || config.get('jwtSecret');
    const decoded = jwt.verify(token, jwtSecret);
    
    
    // Get user from payload
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set user in request object
    req.user = user;
    
    // Update last login time
    await User.findByIdAndUpdate(user.id, { lastLogin: Date.now() });
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};