import { AuditLog } from '../models/AuditLog';
import { IUser } from '../models/User';

export const logAudit = async (
  actor: { _id: any; name: string; email: string; role: string },
  action: string,
  targetType: string,
  targetId?: string,
  details: Record<string, any> = {}
) => {
  try {
    await AuditLog.create({
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
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
};
