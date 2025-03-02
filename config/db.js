// config/db.js - MongoDB connection setup
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true
      // Removed deprecated options:
      // useCreateIndex: true,
      // useFindAndModify: false
    });
    
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;