// config/index.js - Create this new file
const configValues = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ehs-reports',
    jwtSecret: process.env.JWT_SECRET || 'your_default_jwt_secret',
    jwtExpiration: process.env.JWT_EXPIRATION || 604800
  };
  
  module.exports = {
    get: function(key) {
      return configValues[key];
    }
  };