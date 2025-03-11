// server.js - Main application file
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// In server.js
app.use(cors({
  origin: ['https://ehs-report-generator.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/inspections', require('./routes/inspections'));

// Check if client/build directory exists before trying to serve static files
const clientBuildPath = path.resolve(__dirname, 'client', 'build');
const hasClientBuild = fs.existsSync(clientBuildPath) && 
                       fs.existsSync(path.join(clientBuildPath, 'index.html'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production' && hasClientBuild) {
  // Set static folder
  app.use(express.static(clientBuildPath));
  
  // Route all non-API requests to React frontend
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    } else {
      // If it's an API route but wasn't caught by the earlier handlers
      res.status(404).json({ msg: 'API endpoint not found' });
    }
  });
} else {
  // API-only mode - handle undefined frontend routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(404).json({ 
        msg: 'Frontend not deployed with this server',
        apiEndpoints: ['/api/users', '/api/auth', '/api/reports', '/api/inspections']
      });
    } else {
      // If it's an API route but wasn't caught by the earlier handlers
      res.status(404).json({ msg: 'API endpoint not found' });
    }
  });
  
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in API-only mode - frontend not found at client/build');
  }
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));