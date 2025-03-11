// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

// Add debugging to middleware/auth.js
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  console.log('Auth middleware checking token:', !!token);

  // Check if no token
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET || config.get('jwtSecret');
    console.log('JWT Secret available:', !!jwtSecret);
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token verified for user:', decoded.user?.id);
    
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};