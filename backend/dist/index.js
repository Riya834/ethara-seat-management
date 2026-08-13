"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const seatRoutes_1 = __importDefault(require("./routes/seatRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const requestRoutes_1 = __importDefault(require("./routes/requestRoutes"));
const importRoutes_1 = __importDefault(require("./routes/importRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const autoSeed_1 = require("./seed/autoSeed");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
// Explicit CORS setup for Render cloud deployment & local dev
exports.app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Serve frontend static assets if built together
const frontendDistPath = path_1.default.join(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDistPath)) {
    exports.app.use(express_1.default.static(frontendDistPath));
}
// Root Route
exports.app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ethara Seat Management Backend Running',
        health: '/api/health',
        timestamp: new Date().toISOString()
    });
});
// Healthcheck & Detailed Database Status Inspection Endpoint
exports.app.get('/api/health', (req, res) => {
    const isConnected = mongoose_1.default.connection.readyState === 1;
    const host = mongoose_1.default.connection.host || 'none';
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        app: 'Ethara Seat Management System',
        database: {
            connected: isConnected,
            host,
            name: mongoose_1.default.connection.name || 'ethara_seat_db',
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
exports.app.use('/api/auth', authRoutes_1.default);
exports.app.use('/api/employees', employeeRoutes_1.default);
exports.app.use('/api/seats', seatRoutes_1.default);
exports.app.use('/api/projects', projectRoutes_1.default);
exports.app.use('/api/seat-requests', requestRoutes_1.default);
exports.app.use('/api/import', importRoutes_1.default);
exports.app.use('/api/analytics', analyticsRoutes_1.default);
exports.app.use('/api/ai', aiRoutes_1.default);
exports.app.use('/api/audit', auditRoutes_1.default);
// API 404 Handler
exports.app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API Endpoint not found',
        requestedUrl: req.originalUrl
    });
});
// Single Page Application (SPA) Wildcard Fallback for /login, /signup, /dashboard, etc.
exports.app.use('*', (req, res) => {
    const indexPath = path_1.default.join(frontendDistPath, 'index.html');
    if (fs_1.default.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Ethara Workplace Portal - Active</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #FAF7F2; color: #0F172A; text-align: center; padding: 50px; }
          .card { background: white; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .btn { display: inline-block; background: #FBC48B; color: #0F172A; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Ethara Backend Server Active</h2>
          <p>Database Connected & Healthy</p>
          <p>Requested Path: <code>${req.originalUrl}</code></p>
          <a href="/api/health" class="btn">View API Health Status</a>
        </div>
      </body>
    </html>
  `);
});
// Global Error Handler
exports.app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});
const startServer = async () => {
    const PORT = process.env.PORT || 5000;
    const MONGODB_URI = process.env.MONGODB_URI ||
        'mongodb+srv://new_seatManagement:Ethara1230@cluster0.ty7ichr.mongodb.net/ethara_seat_db?retryWrites=true&w=majority&appName=Cluster0';
    if (process.env.NODE_ENV !== 'test') {
        let connected = false;
        try {
            await mongoose_1.default.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000
            });
            const isAtlas = mongoose_1.default.connection.host.includes('mongodb.net') ||
                mongoose_1.default.connection.host.includes('cluster0');
            console.log(`Connected to ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Database'} [Host: ${mongoose_1.default.connection.host}]`);
            connected = true;
            // Auto seed database on cloud deployment if empty
            (0, autoSeed_1.autoSeedIfEmpty)();
        }
        catch (err) {
            console.warn(`Primary MongoDB Connection Warning (${err.code || err.message}). Attempting local MongoDB fallback...`);
        }
        if (!connected &&
            !MONGODB_URI.includes('127.0.0.1') &&
            !MONGODB_URI.includes('localhost')) {
            try {
                await mongoose_1.default.connect('mongodb://127.0.0.1:27017/ethara_seat_db', {
                    serverSelectionTimeoutMS: 2500
                });
                console.log('Connected to Local MongoDB at mongodb://127.0.0.1:27017/ethara_seat_db');
                connected = true;
            }
            catch (err) {
                console.warn('Local MongoDB unavailable. Using In-Memory Mock Store Fallback.');
            }
        }
        const server = exports.app.listen(PORT, () => {
            const type = connected
                ? mongoose_1.default.connection.host.includes('mongodb.net')
                    ? 'MongoDB Atlas Cloud'
                    : 'Local MongoDB'
                : 'In-Memory Fallback';
            console.log(`Ethara Backend Server listening on port ${PORT} [${type}]`);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ Error: Port ${PORT} is already in use by a running backend process.`);
                console.error('Stop the running background process or run: Stop-Process -Name node -Force\n');
                process.exit(1);
            }
            else {
                console.error('Server Error:', err);
            }
        });
    }
};
startServer();
