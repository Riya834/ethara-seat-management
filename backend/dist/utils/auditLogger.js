"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const AuditLog_1 = require("../models/AuditLog");
const logAudit = async (actor, action, targetType, targetId, details = {}) => {
    try {
        await AuditLog_1.AuditLog.create({
            actorId: actor._id,
            actorName: actor.name,
            actorEmail: actor.email,
            actorRole: actor.role,
            action,
            targetType,
            targetId: targetId ? String(targetId) : '',
            details,
            timestamp: new Date()
        });
    }
    catch (err) {
        console.error('Failed to log audit entry:', err);
    }
};
exports.logAudit = logAudit;
