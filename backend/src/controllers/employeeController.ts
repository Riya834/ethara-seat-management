import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Employee } from '../models/Employee';
import { Seat } from '../models/Seat';
import { User } from '../models/User';
import { logAudit } from '../utils/auditLogger';
import { mockStore } from '../config/mockStore';

const getActor = (req: AuthRequest) => {
  return (
    req.user || {
      _id: 'admin_sys',
      name: 'System Admin',
      email: 'admin@ethara.com',
      role: 'admin'
    }
  );
};

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { search, department, projectId, status, seatAllocationStatus, team } = req.query;

    if (Employee.db.readyState === 1) {
      const filter: any = {};
      if (search) {
        const regex = new RegExp(search as string, 'i');
        filter.$or = [
          { name: regex },
          { employeeId: regex },
          { email: regex },
          { designation: regex },
          { department: regex }
        ];
      }
      if (department) filter.department = department;
      if (projectId && projectId !== '') filter.projectId = projectId;
      if (status) filter.status = status;
      if (seatAllocationStatus) filter.seatAllocationStatus = seatAllocationStatus;
      if (team) filter.team = team;

      const total = await Employee.countDocuments(filter);
      const employees = await Employee.find(filter)
        .populate('projectId', 'name code')
        .populate('managerId', 'name employeeId designation')
        .populate({
          path: 'seatId',
          populate: [
            { path: 'floorId', select: 'floorNumber name' },
            { path: 'zoneId', select: 'zoneName' }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        data: employees,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
      });
    }

    // In-memory Fallback
    await mockStore.initialize();
    let filtered = [...mockStore.employees];

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }
    if (department) filtered = filtered.filter((e) => e.department === department);
    if (status) filtered = filtered.filter((e) => e.status === status);
    if (seatAllocationStatus) filtered = filtered.filter((e) => e.seatAllocationStatus === seatAllocationStatus);

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return res.json({
      data: paginated,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.json([]);

    if (Employee.db.readyState === 1) {
      const regex = new RegExp(q, 'i');
      const matchingSeats = await Seat.find({ seatNumber: regex }).select('_id');
      const seatIds = matchingSeats.map((s) => s._id);

      const employees = await Employee.find({
        $or: [
          { name: regex },
          { employeeId: regex },
          { email: regex },
          { designation: regex },
          { seatId: { $in: seatIds } }
        ]
      })
        .populate('seatId', 'seatNumber floorId zoneId')
        .populate('projectId', 'name code')
        .limit(10);

      return res.json(employees);
    }

    await mockStore.initialize();
    const queryStr = (q as string).toLowerCase();
    const matches = mockStore.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(queryStr) ||
        e.employeeId.toLowerCase().includes(queryStr) ||
        e.email.toLowerCase().includes(queryStr) ||
        (e.seatId && e.seatId.seatNumber && e.seatId.seatNumber.toLowerCase().includes(queryStr))
    ).slice(0, 20);

    return res.json(matches);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    if (Employee.db.readyState === 1) {
      const employee = await Employee.findById(req.params.id)
        .populate('projectId', 'name code description startDate endDate')
        .populate('managerId', 'name employeeId designation email')
        .populate({
          path: 'seatId',
          populate: [
            { path: 'floorId', select: 'floorNumber name building' },
            { path: 'zoneId', select: 'zoneName capacity' }
          ]
        });

      if (employee) return res.json(employee);
    }

    await mockStore.initialize();
    const emp = mockStore.employees.find((e) => e._id === req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });
    return res.json(emp);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    let { employeeId, name, email, phone, designation, department, team, projectId, managerId, joiningDate, status } = req.body;

    const cleanProjectId = (projectId && typeof projectId === 'string' && projectId.trim() !== '') ? projectId : null;
    const cleanManagerId = (managerId && typeof managerId === 'string' && managerId.trim() !== '') ? managerId : null;

    if (!employeeId) {
      employeeId = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    if (Employee.db.readyState === 1) {
      const existing = await Employee.findOne({ $or: [{ employeeId }, { email }] });
      if (existing) {
        return res.status(400).json({ message: 'Employee with this ID or Email already exists.' });
      }

      const employee = await Employee.create({
        employeeId,
        name,
        email,
        phone: phone || '',
        designation: designation || 'Specialist',
        department: department || 'Engineering',
        team: team || department || 'Frontend',
        projectId: cleanProjectId,
        managerId: cleanManagerId,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        status: status || 'active',
        seatAllocationStatus: 'pending'
      });

      await logAudit(
        getActor(req),
        'CREATE_EMPLOYEE',
        'Employee',
        employee._id.toString(),
        { name, employeeId }
      );

      return res.status(201).json(employee);
    }

    await mockStore.initialize();
    const newEmpObj: any = {
      _id: `emp_${Date.now()}`,
      employeeId,
      name,
      email,
      phone: phone || '',
      designation: designation || 'Specialist',
      department: department || 'Engineering',
      team: team || department || 'Frontend',
      projectId: cleanProjectId,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: status || 'active',
      seatId: null,
      seatAllocationStatus: 'pending',
      createdAt: new Date()
    };

    mockStore.employees.unshift(newEmpObj);
    return res.status(201).json(newEmpObj);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.projectId === '') updateData.projectId = null;
    if (updateData.managerId === '') updateData.managerId = null;

    if (Employee.db.readyState === 1) {
      const employee = await Employee.findByIdAndUpdate(id, updateData, { new: true });
      if (!employee) return res.status(404).json({ message: 'Employee not found.' });

      await logAudit(
        getActor(req),
        'UPDATE_EMPLOYEE',
        'Employee',
        id,
        { name: employee.name }
      );

      return res.json(employee);
    }

    await mockStore.initialize();
    const idx = mockStore.employees.findIndex((e) => e._id === id);
    if (idx !== -1) {
      mockStore.employees[idx] = { ...mockStore.employees[idx], ...updateData };
      return res.json(mockStore.employees[idx]);
    }
    return res.status(404).json({ message: 'Employee not found.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Employee.db.readyState === 1) {
      const employee = await Employee.findById(id);
      if (!employee) return res.status(404).json({ message: 'Employee not found.' });

      if (employee.seatId) {
        await Seat.findByIdAndUpdate(employee.seatId, {
          status: 'available',
          occupiedBy: null
        });
      }

      await Employee.findByIdAndDelete(id);
      await User.findOneAndDelete({ employeeId: id });

      await logAudit(
        getActor(req),
        'DELETE_EMPLOYEE',
        'Employee',
        id,
        { name: employee.name }
      );

      return res.json({ message: 'Employee deleted successfully.' });
    }

    await mockStore.initialize();
    const idx = mockStore.employees.findIndex((e) => e._id === id);
    if (idx !== -1) {
      const emp = mockStore.employees[idx];
      if (emp.seatId) {
        const seat = mockStore.seats.find((s) => s._id === emp.seatId?._id || s._id === emp.seatId);
        if (seat) {
          seat.status = 'available';
          seat.occupiedBy = null;
        }
      }
      mockStore.employees.splice(idx, 1);
      return res.json({ message: 'Employee deleted successfully.' });
    }
    return res.status(404).json({ message: 'Employee not found.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
