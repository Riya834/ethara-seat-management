import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { Employee } from '../models/Employee';
import { Seat } from '../models/Seat';
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

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    if (Project.db.readyState === 1) {
      const projects = await Project.find()
        .populate('projectManagerId', 'name employeeId designation email')
        .sort({ createdAt: -1 });

      const projectData = await Promise.all(
        projects.map(async (project) => {
          const totalAssignedEmployees = await Employee.countDocuments({ projectId: project._id });
          const occupiedSeats = await Seat.countDocuments({ projectTag: project._id, status: 'occupied' });
          const totalReservedSeats = await Seat.countDocuments({ projectTag: project._id });
          
          return {
            ...project.toObject(),
            headcount: totalAssignedEmployees,
            occupiedSeats,
            totalReservedSeats,
            utilizationPercentage: totalReservedSeats > 0 ? Math.round((occupiedSeats / totalReservedSeats) * 100) : 0
          };
        })
      );

      return res.json(projectData);
    }

    await mockStore.initialize();
    const mockProjects = mockStore.projects.map((p) => {
      const totalAssigned = mockStore.employees.filter(
        (e) => e.projectId && (e.projectId._id === p._id || e.projectId === p._id)
      ).length;
      return {
        ...p,
        headcount: totalAssigned,
        occupiedSeats: Math.min(totalAssigned, 50),
        totalReservedSeats: 60,
        utilizationPercentage: Math.round((totalAssigned / 60) * 100)
      };
    });

    return res.json(mockProjects);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Project.db.readyState === 1) {
      const project = await Project.findById(id).populate(
        'projectManagerId',
        'name employeeId designation email'
      );

      if (!project) return res.status(404).json({ message: 'Project not found.' });

      const assignedEmployees = await Employee.find({ projectId: project._id })
        .populate({
          path: 'seatId',
          populate: [{ path: 'floorId' }, { path: 'zoneId' }]
        })
        .select('employeeId name email designation department team seatId seatAllocationStatus');

      const taggedSeats = await Seat.find({ projectTag: project._id })
        .populate('floorId', 'floorNumber name')
        .populate('zoneId', 'zoneName')
        .populate('occupiedBy', 'name employeeId');

      const occupiedSeatsCount = taggedSeats.filter((s) => s.status === 'occupied').length;

      return res.json({
        project,
        assignedEmployees,
        taggedSeats,
        metrics: {
          totalHeadcount: assignedEmployees.length,
          totalReservedBlockSeats: taggedSeats.length,
          occupiedSeats: occupiedSeatsCount,
          utilizationPercentage:
            taggedSeats.length > 0 ? Math.round((occupiedSeatsCount / taggedSeats.length) * 100) : 0
        }
      });
    }

    await mockStore.initialize();
    const proj = mockStore.projects.find((p) => p._id === id);
    if (!proj) return res.status(404).json({ message: 'Project not found.' });

    const members = mockStore.employees.filter(
      (e) => e.projectId && (e.projectId._id === id || e.projectId === id)
    );

    return res.json({
      project: proj,
      assignedEmployees: members,
      taggedSeats: [],
      metrics: {
        totalHeadcount: members.length,
        totalReservedBlockSeats: 60,
        occupiedSeats: members.length,
        utilizationPercentage: 85
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, projectManagerId, startDate, endDate } = req.body;

    if (Project.db.readyState === 1) {
      const existing = await Project.findOne({ code: code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ message: 'Project code already exists.' });
      }

      const project = await Project.create({
        name,
        code: code.toUpperCase(),
        description,
        projectManagerId: projectManagerId || null,
        startDate: startDate || new Date(),
        endDate: endDate || null
      });

      await logAudit(getActor(req), 'CREATE_PROJECT', 'Project', (project._id as any).toString(), {
        code: project.code,
        name: project.name
      });

      return res.status(201).json(project);
    }

    await mockStore.initialize();
    const newProj = {
      _id: `proj_${Date.now()}`,
      name,
      code: code.toUpperCase(),
      description,
      status: 'active',
      startDate: startDate ? new Date(startDate) : new Date()
    };

    mockStore.projects.unshift(newProj);
    return res.status(201).json(newProj);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const addProjectMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'employeeIds array must not be empty.' });
    }

    if (Project.db.readyState === 1) {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ message: 'Project not found.' });

      await Employee.updateMany(
        { _id: { $in: employeeIds } },
        { $set: { projectId: project._id } }
      );

      await logAudit(getActor(req), 'ADD_PROJECT_MEMBERS', 'Project', id, {
        addedCount: employeeIds.length,
        projectCode: project.code
      });

      return res.json({ message: `Successfully added ${employeeIds.length} team members to ${project.name}.` });
    }

    await mockStore.initialize();
    const proj = mockStore.projects.find((p) => p._id === id);
    if (!proj) return res.status(404).json({ message: 'Project not found.' });

    employeeIds.forEach((empId: string) => {
      const emp = mockStore.employees.find((e) => e._id === empId || e.employeeId === empId);
      if (emp) {
        emp.projectId = proj;
      }
    });

    return res.json({ message: `Successfully added ${employeeIds.length} team members to ${proj.name}.` });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, employeeId } = req.params;

    if (Employee.db.readyState === 1) {
      await Employee.findByIdAndUpdate(employeeId, { $set: { projectId: null } });
      await logAudit(getActor(req), 'REMOVE_PROJECT_MEMBER', 'Project', id, { employeeId });
      return res.json({ message: 'Team member removed from project.' });
    }

    await mockStore.initialize();
    const emp = mockStore.employees.find((e) => e._id === employeeId || e.employeeId === employeeId);
    if (emp) {
      emp.projectId = null;
    }
    return res.json({ message: 'Team member removed from project.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const reserveProjectBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, seatIds } = req.body;

    if (!projectId || !Array.isArray(seatIds)) {
      return res.status(400).json({ message: 'projectId and seatIds array are required.' });
    }

    if (Seat.db.readyState === 1) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found.' });

      await Seat.updateMany(
        { _id: { $in: seatIds } },
        { $set: { projectTag: project._id } }
      );

      await logAudit(getActor(req), 'RESERVE_PROJECT_BLOCK', 'Project', (project._id as any).toString(), {
        seatsCount: seatIds.length,
        projectCode: project.code
      });

      return res.json({ message: `Successfully tagged ${seatIds.length} seats for Project ${project.code}.` });
    }

    await mockStore.initialize();
    return res.json({ message: `Successfully tagged ${seatIds.length} seats.` });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
