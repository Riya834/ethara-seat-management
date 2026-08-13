import { Router, Response } from 'express';
import { AuthRequest, authenticateJWT, authorizeRoles } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles('admin', 'hr'), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
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
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
