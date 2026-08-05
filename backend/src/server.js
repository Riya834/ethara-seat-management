const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { generateSeedData } = require('./utils/seedData');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Connect Database & Start Server
// ===============================
const startServer = async () => {
  try {
    // Connect MongoDB Atlas
    await connectDB();

    console.log('✅ MongoDB Connected Successfully');

    // Seed Data (if needed)
    await generateSeedData();

    // ===============================
    // Middlewares
    // ===============================
    app.use(cors());

    app.use(express.json({
      limit: '50mb'
    }));

    app.use(express.urlencoded({
      extended: true,
      limit: '50mb'
    }));

    app.use(morgan('dev'));

    // ===============================
    // API Routes
    // ===============================
    app.use('/api', apiRoutes);

    // ===============================
    // Health Check
    // ===============================
    app.get('/health', (req, res) => {
        res.status(200).json({
            success: true,
            status: 'OK',
            message: 'Ethara Seat Management Backend Running Successfully'
        });
    });

    // Root Route
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Welcome to Ethara Seat Management API'
        });
    });

    // ===============================
    // Global Error Handler
    // ===============================
    app.use((err, req, res, next) => {
        console.error(err);

        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal Server Error'
        });
    });

    // ===============================
    // Start Server
    // ===============================
    app.listen(PORT, () => {
        console.log('===============================================');
        console.log('🚀 ETHARA SEAT MANAGEMENT BACKEND STARTED');
        console.log(`🌐 Server running at http://localhost:${PORT}`);
        console.log(`📦 Environment : ${process.env.NODE_ENV || 'development'}`);
        console.log('===============================================');
    });

  } catch (error) {
      console.error('❌ Failed to start server');
      console.error(error);
      process.exit(1);
  }
};

startServer();