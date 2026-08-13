"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const AuditLog_1 = require("../models/AuditLog");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.get('/', (0, auth_1.authorizeRoles)('admin', 'hr'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const total = await AuditLog_1.AuditLog.countDocuments();
        const logs = await AuditLog_1.AuditLog.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
        return res.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.default = router;
