"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Employee_1 = require("../models/Employee");
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required. Missing Bearer token.' });
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'ethara_jwt_super_secret_key_2026_spec';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        let user = null;
        let employeeRef;
        // Attempt DB lookup if connected and decoded.id is valid ObjectId
        if (User_1.User.db.readyState === 1 && decoded.id && mongoose_1.default.Types.ObjectId.isValid(decoded.id)) {
            try {
                user = await User_1.User.findById(decoded.id).select('-passwordHash');
                if (user && user.employeeId && mongoose_1.default.Types.ObjectId.isValid(user.employeeId)) {
                    employeeRef = (await Employee_1.Employee.findById(user.employeeId)) || undefined;
                }
            }
            catch (dbErr) {
                // Fallback context from token if DB query fails
            }
        }
        if (!user) {
            // Fallback context from verified JWT token
            user = {
                _id: decoded.id || '65f000000000000000000001',
                name: decoded.name || 'Test User',
                email: decoded.email || 'user@ethara.com',
                role: decoded.role || 'employee',
                employeeId: decoded.employeeId || null
            };
        }
        req.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId ? user.employeeId.toString() : undefined,
            employeeRef
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
};
exports.authenticateJWT = authenticateJWT;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. User context missing.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden. Role '${req.user.role}' is not authorized to perform this action.`
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
