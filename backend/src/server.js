const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { generateSeedData } = require('./utils/seedData');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ethara Seat Management API Server running smoothly.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Initialize database seed & start server
const startServer = async () => {
  try {
    await generateSeedData();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 ETHARA SEAT MANAGEMENT BACKEND SERVER READY!`);
      console.log(`📡 Listening on http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
