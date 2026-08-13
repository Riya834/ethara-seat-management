import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Employee, IEmployee } from '../models/Employee';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'hr' | 'pm' | 'employee';
    employeeId?: string;
    employeeRef?: IEmployee;
  };
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Missing Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'ethara_jwt_super_secret_key_2026_spec';

    const decoded = jwt.verify(token, secret) as any;
    
    let user: any = null;
    let employeeRef: IEmployee | undefined;

    // Attempt DB lookup if connected and decoded.id is valid ObjectId
    if (User.db.readyState === 1 && decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
      try {
        user = await User.findById(decoded.id).select('-passwordHash');
        if (user && user.employeeId && mongoose.Types.ObjectId.isValid(user.employeeId)) {
          employeeRef = (await Employee.findById(user.employeeId)) || undefined;
        }
      } catch (dbErr) {
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
      _id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId ? (user.employeeId as any).toString() : undefined,
      employeeRef
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

export const authorizeRoles = (...allowedRoles: Array<'admin' | 'hr' | 'pm' | 'employee'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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
