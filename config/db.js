// config/db.js - Updated version
const mongoose = require('mongoose');
const config = require('./index'); // Use our custom config
require('dotenv').config();

// Prioritize environment variables over config files for the MongoDB URI
const db = process.env.MONGODB_URI || config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;