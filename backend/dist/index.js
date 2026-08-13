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
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const seatRoutes_1 = __importDefault(require("./routes/seatRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const requestRoutes_1 = __importDefault(require("./routes/requestRoutes"));
const importRoutes_1 = __importDefault(require("./routes/importRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
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
// Global Error Handler
exports.app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});
const startServer = async () => {
    const PORT = process.env.PORT || 5000;
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ethara_seat_db';
    if (process.env.NODE_ENV !== 'test') {
        let connected = false;
        // 1. Try primary configured MongoDB URI (e.g. Atlas)
        try {
            await mongoose_1.default.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
            const isAtlas = mongoose_1.default.connection.host.includes('mongodb.net') || mongoose_1.default.connection.host.includes('cluster0');
            console.log(`Connected to ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Database'} [Host: ${mongoose_1.default.connection.host}]`);
            connected = true;
        }
        catch (err) {
            console.warn(`Primary MongoDB Connection Warning (${err.code || err.message}). Attempting local MongoDB fallback...`);
        }
        // 2. If primary failed, try local MongoDB
        if (!connected && !MONGODB_URI.includes('127.0.0.1') && !MONGODB_URI.includes('localhost')) {
            try {
                await mongoose_1.default.connect('mongodb://127.0.0.1:27017/ethara_seat_db', { serverSelectionTimeoutMS: 2500 });
                console.log(`Connected to Local MongoDB at mongodb://127.0.0.1:27017/ethara_seat_db`);
                connected = true;
            }
            catch (err) {
                console.warn(`Local MongoDB unavailable. Using In-Memory Mock Store Fallback.`);
            }
        }
        // 3. Start Express HTTP Server
        const server = exports.app.listen(PORT, () => {
            const type = connected
                ? mongoose_1.default.connection.host.includes('mongodb.net')
                    ? 'MongoDB Atlas Cloud'
                    : 'Local MongoDB'
                : 'In-Memory Fallback';
            console.log(`Ethara Backend Server listening on http://localhost:${PORT} [${type}]`);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ Error: Port ${PORT} is already in use by a running backend process.`);
                console.error(`Stop the running background process or run: Stop-Process -Name node -Force\n`);
                process.exit(1);
            }
            else {
                console.error('Server Error:', err);
            }
        });
    }
};
startServer();
