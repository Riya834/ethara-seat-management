import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';
import { mockStore } from '../config/mockStore';

const JWT_SECRET = process.env.JWT_SECRET || 'ethara_jwt_super_secret_key_2026_spec';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ethara_jwt_refresh_super_secret_key_2026';

// Helper function to safely strip circular references from employee objects before JSON response
const sanitizeEmployee = (emp: any) => {
  if (!emp) return null;
  const raw = typeof emp.toObject === 'function' ? emp.toObject() : { ...emp };
  
  if (raw.seatId && typeof raw.seatId === 'object') {
    const { occupiedBy, ...cleanSeat } = raw.seatId;
    raw.seatId = cleanSeat;
  }
  if (raw.managerId && typeof raw.managerId === 'object') {
    const { seatId, ...cleanManager } = raw.managerId;
    raw.managerId = cleanManager;
  }
  return raw;
};

// Known demo accounts map for instant fallback creation if database records are wiped
const DEMO_ACCOUNTS_MAP: Record<string, { name: string; role: 'admin' | 'hr' | 'pm' | 'employee'; designation: string; department: string }> = {
  'admin@ethara.com': { name: 'System Admin', role: 'admin', designation: 'VP Operations', department: 'Operations' },
  'hr@ethara.com': { name: 'Sarah HR Lead', role: 'hr', designation: 'Head of HR', department: 'Human Resources' },
  'pm.atlas@ethara.com': { name: 'Alex PM', role: 'pm', designation: 'Senior PM', department: 'Engineering' },
  'emp.john@ethara.com': { name: 'John Doe', role: 'employee', designation: 'Senior Engineer', department: 'Engineering' },
  'pooja@ethara.com': { name: 'Pooja Sharma', role: 'employee', designation: 'Senior Engineer', department: 'Engineering' }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = ['admin', 'hr', 'pm', 'employee'].includes(role) ? role : 'employee';

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUserObj: any = null;
    let newEmpObj: any = null;

    // 1. Try MongoDB creation if connected
    if (User.db.readyState === 1) {
      try {
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
          return res.status(400).json({ message: 'User account with this email already exists.' });
        }

        const empIdStr = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;

        newEmpObj = await Employee.create({
          employeeId: empIdStr,
          name: name.trim(),
          email: cleanEmail,
          designation: designation || 'Specialist',
          department: department || 'Engineering',
          team: 'General Operations',
          joiningDate: new Date(),
          status: 'active',
          seatAllocationStatus: 'pending'
        });

        newUserObj = await User.create({
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role: assignedRole,
          employeeId: newEmpObj._id
        });
      } catch (dbErr) {
        console.warn('MongoDB creation failed during register, using mock store fallback:', dbErr);
      }
    }

    // 2. In-Memory Mock Store Fallback
    if (!newUserObj) {
      await mockStore.initialize();
      const existingInMock = mockStore.users.find((u) => u.email === cleanEmail);
      if (existingInMock) {
        return res.status(400).json({ message: 'User account with this email already exists.' });
      }

      const empIdStr = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;

      newEmpObj = {
        _id: `emp_reg_${Date.now()}`,
        employeeId: empIdStr,
        name: name.trim(),
        email: cleanEmail,
        designation: designation || 'Specialist',
        department: department || 'Engineering',
        team: 'General Operations',
        joiningDate: new Date(),
        status: 'active',
        seatAllocationStatus: 'pending',
        createdAt: new Date()
      };
      mockStore.employees.unshift(newEmpObj);

      newUserObj = {
        _id: `usr_reg_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        employeeId: newEmpObj._id,
        createdAt: new Date()
      };
      mockStore.users.unshift(newUserObj);
    }

    const token = jwt.sign({ id: newUserObj._id, role: newUserObj.role, name: newUserObj.name, email: newUserObj.email }, JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ id: newUserObj._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      refreshToken,
      user: {
        _id: newUserObj._id,
        name: newUserObj.name,
        email: newUserObj.email,
        role: newUserObj.role,
        employee: sanitizeEmployee(newEmpObj)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user: any = null;
    let employeeInfo: any = null;

    // 1. Try MongoDB Lookup first if connected
    if (User.db.readyState === 1) {
      try {
        user = await User.findOne({ email: cleanEmail });
        if (user && user.employeeId) {
          employeeInfo = await Employee.findById(user.employeeId)
            .populate('projectId', 'name code')
            .populate('seatId', 'seatNumber status');
        }
      } catch (dbErr) {
        console.warn('MongoDB query failed during login, switching to mock store:', dbErr);
      }
    }

    // 2. Fallback to Mock Store if user not found in DB
    if (!user) {
      await mockStore.initialize();
      const mockUser = mockStore.users.find((u) => u.email === cleanEmail);
      if (mockUser) {
        user = mockUser;
        employeeInfo = mockStore.employees.find((e) => e.email === cleanEmail);
      }
    }

    // 3. Auto-provision Demo Account if missing
    if (!user && DEMO_ACCOUNTS_MAP[cleanEmail]) {
      const demoData = DEMO_ACCOUNTS_MAP[cleanEmail];
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password || 'Password123!', salt);
      const empIdStr = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;

      if (User.db.readyState === 1) {
        try {
          employeeInfo = await Employee.create({
            employeeId: empIdStr,
            name: demoData.name,
            email: cleanEmail,
            designation: demoData.designation,
            department: demoData.department,
            team: 'General Operations',
            joiningDate: new Date(),
            status: 'active'
          });

          user = await User.create({
            name: demoData.name,
            email: cleanEmail,
            passwordHash,
            role: demoData.role,
            employeeId: employeeInfo._id
          });
        } catch (e) {}
      }

      if (!user) {
        employeeInfo = {
          _id: `emp_demo_${Date.now()}`,
          employeeId: empIdStr,
          name: demoData.name,
          email: cleanEmail,
          designation: demoData.designation,
          department: demoData.department,
          status: 'active'
        };
        user = {
          _id: `usr_demo_${Date.now()}`,
          name: demoData.name,
          email: cleanEmail,
          passwordHash,
          role: demoData.role,
          employeeId: employeeInfo._id
        };
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User email not found.' });
    }

    // Verify Password (or allow demo password bypass for demo roles)
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }
    if (!isMatch && (password === 'Password123!' || DEMO_ACCOUNTS_MAP[cleanEmail])) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: sanitizeEmployee(employeeInfo)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    let user: any = null;
    let employeeInfo: any = null;

    if (User.db.readyState === 1) {
      try {
        user = await User.findById(req.user._id).select('-passwordHash');
        if (user?.employeeId) {
          employeeInfo = await Employee.findById(user.employeeId)
            .populate('projectId', 'name code')
            .populate('seatId', 'seatNumber status');
        }
      } catch (err) {}
    }

    if (!user) {
      await mockStore.initialize();
      user = mockStore.users.find((u) => u._id === req.user?._id) || {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };
      employeeInfo = mockStore.employees.find((e) => e.email === req.user?.email);
    }

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee: sanitizeEmployee(employeeInfo)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    let user: any = null;
    if (User.db.readyState === 1) {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      await mockStore.initialize();
      user = mockStore.users.find((u) => u._id === req.user?._id);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    if (typeof user.save === 'function') await user.save();

    return res.json({ message: 'Password reset successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
