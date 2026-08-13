import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import seatRoutes from './routes/seatRoutes';
import projectRoutes from './routes/projectRoutes';
import requestRoutes from './routes/requestRoutes';
import importRoutes from './routes/importRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import aiRoutes from './routes/aiRoutes';
import auditRoutes from './routes/auditRoutes';
import { autoSeedIfEmpty } from './seed/autoSeed';

dotenv.config();

export const app = express();

// Dynamic CORS setup for deployed frontend and local dev
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route - Clean API Connection & Success Status JSON Response
app.get('/', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const host = mongoose.connection.host || 'none';

  res.json({
    success: true,
    status: 'connected',
    message: 'Ethara Seat Management Backend Server Active & Connected',
    database: {
      connected: isConnected,
      host,
      name: mongoose.connection.name || 'ethara_seat_db',
      connectionType: isConnected
        ? host.includes('mongodb.net') || host.includes('cluster0')
          ? 'MongoDB Atlas Cloud'
          : 'Local MongoDB'
        : 'In-Memory Fallback'
    },
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Healthcheck & Detailed Database Status Inspection Endpoint
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const host = mongoose.connection.host || 'none';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'Ethara Seat Management System',
    database: {
      connected: isConnected,
      host,
      name: mongoose.connection.name || 'ethara_seat_db',
      isAtlas: host.includes('mongodb.net') || host.includes('cluster0'),
      connectionType: isConnected
        ? host.includes('mongodb.net') || host.includes('cluster0')
          ? 'MongoDB Atlas (Cloud)'
          : 'Local MongoDB (127.0.0.1)'
        : 'In-Memory Mock Store Fallback'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/seat-requests', requestRoutes);
app.use('/api/import', importRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit', auditRoutes);

// Backend API 404 Handler - Pure JSON Response for invalid routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Backend API Endpoint Not Found',
    requestedUrl: req.originalUrl
  });
});

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled Server Error:', err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
);

const startServer = async () => {
  const PORT = process.env.PORT || 5000;

  const MONGODB_URI =
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/ethara_seat_db';

  if (process.env.NODE_ENV !== 'test') {
    let connected = false;

    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });

      const isAtlas =
        mongoose.connection.host.includes('mongodb.net') ||
        mongoose.connection.host.includes('cluster0');

      console.log(
        `Connected to ${
          isAtlas ? 'MongoDB Atlas (Cloud)' : 'Database'
        } [Host: ${mongoose.connection.host}]`
      );

      connected = true;

      // Auto seed database on cloud deployment if empty
      autoSeedIfEmpty();
    } catch (err: any) {
      console.warn(
        `Primary MongoDB Connection Warning (${
          err.code || err.message
        }). Attempting local MongoDB fallback...`
      );
    }

    if (
      !connected &&
      !MONGODB_URI.includes('127.0.0.1') &&
      !MONGODB_URI.includes('localhost')
    ) {
      try {
        await mongoose.connect(
          'mongodb://127.0.0.1:27017/ethara_seat_db',
          {
            serverSelectionTimeoutMS: 2500
          }
        );

        console.log(
          'Connected to Local MongoDB at mongodb://127.0.0.1:27017/ethara_seat_db'
        );

        connected = true;
      } catch (err) {
        console.warn(
          'Local MongoDB unavailable. Using In-Memory Mock Store Fallback.'
        );
      }
    }

    const server = app.listen(PORT, () => {
      const type = connected
        ? mongoose.connection.host.includes('mongodb.net')
          ? 'MongoDB Atlas Cloud'
          : 'Local MongoDB'
        : 'In-Memory Fallback';

      console.log(
        `Ethara Backend Server listening on port ${PORT} [${type}]`
      );
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `\n❌ Error: Port ${PORT} is already in use by a running backend process.`
        );
        console.error(
          'Stop the running background process or run: Stop-Process -Name node -Force\n'
        );
        process.exit(1);
      } else {
        console.error('Server Error:', err);
      }
    });
  }
};

startServer();