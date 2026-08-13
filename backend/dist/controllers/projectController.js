"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveProjectBlock = exports.removeProjectMember = exports.addProjectMembers = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const Project_1 = require("../models/Project");
const Employee_1 = require("../models/Employee");
const Seat_1 = require("../models/Seat");
const auditLogger_1 = require("../utils/auditLogger");
const mockStore_1 = require("../config/mockStore");
const getActor = (req) => {
    return (req.user || {
        _id: 'admin_sys',
        name: 'System Admin',
        email: 'admin@ethara.com',
        role: 'admin'
    });
};
const getProjects = async (req, res) => {
    try {
        if (Project_1.Project.db.readyState === 1) {
            const projects = await Project_1.Project.find()
                .populate('projectManagerId', 'name employeeId designation email')
                .sort({ createdAt: -1 });
            const projectData = await Promise.all(projects.map(async (project) => {
                const totalAssignedEmployees = await Employee_1.Employee.countDocuments({ projectId: project._id });
                const occupiedSeats = await Seat_1.Seat.countDocuments({ projectTag: project._id, status: 'occupied' });
                const totalReservedSeats = await Seat_1.Seat.countDocuments({ projectTag: project._id });
                return {
                    ...project.toObject(),
                    headcount: totalAssignedEmployees,
                    occupiedSeats,
                    totalReservedSeats,
                    utilizationPercentage: totalReservedSeats > 0 ? Math.round((occupiedSeats / totalReservedSeats) * 100) : 0
                };
            }));
            return res.json(projectData);
        }
        await mockStore_1.mockStore.initialize();
        const mockProjects = mockStore_1.mockStore.projects.map((p) => {
            const totalAssigned = mockStore_1.mockStore.employees.filter((e) => e.projectId && (e.projectId._id === p._id || e.projectId === p._id)).length;
            return {
                ...p,
                headcount: totalAssigned,
                occupiedSeats: Math.min(totalAssigned, 50),
                totalReservedSeats: 60,
                utilizationPercentage: Math.round((totalAssigned / 60) * 100)
            };
        });
        return res.json(mockProjects);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        if (Project_1.Project.db.readyState === 1) {
            const project = await Project_1.Project.findById(id).populate('projectManagerId', 'name employeeId designation email');
            if (!project)
                return res.status(404).json({ message: 'Project not found.' });
            const assignedEmployees = await Employee_1.Employee.find({ projectId: project._id })
                .populate({
                path: 'seatId',
                populate: [{ path: 'floorId' }, { path: 'zoneId' }]
            })
                .select('employeeId name email designation department team seatId seatAllocationStatus');
            const taggedSeats = await Seat_1.Seat.find({ projectTag: project._id })
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
                    utilizationPercentage: taggedSeats.length > 0 ? Math.round((occupiedSeatsCount / taggedSeats.length) * 100) : 0
                }
            });
        }
        await mockStore_1.mockStore.initialize();
        const proj = mockStore_1.mockStore.projects.find((p) => p._id === id);
        if (!proj)
            return res.status(404).json({ message: 'Project not found.' });
        const members = mockStore_1.mockStore.employees.filter((e) => e.projectId && (e.projectId._id === id || e.projectId === id));
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
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
    try {
        const { name, code, description, projectManagerId, startDate, endDate } = req.body;
        if (Project_1.Project.db.readyState === 1) {
            const existing = await Project_1.Project.findOne({ code: code.toUpperCase() });
            if (existing) {
                return res.status(400).json({ message: 'Project code already exists.' });
            }
            const project = await Project_1.Project.create({
                name,
                code: code.toUpperCase(),
                description,
                projectManagerId: projectManagerId || null,
                startDate: startDate || new Date(),
                endDate: endDate || null
            });
            await (0, auditLogger_1.logAudit)(getActor(req), 'CREATE_PROJECT', 'Project', project._id.toString(), {
                code: project.code,
                name: project.name
            });
            return res.status(201).json(project);
        }
        await mockStore_1.mockStore.initialize();
        const newProj = {
            _id: `proj_${Date.now()}`,
            name,
            code: code.toUpperCase(),
            description,
            status: 'active',
            startDate: startDate ? new Date(startDate) : new Date()
        };
        mockStore_1.mockStore.projects.unshift(newProj);
        return res.status(201).json(newProj);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.createProject = createProject;
const addProjectMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeIds } = req.body;
        if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({ message: 'employeeIds array must not be empty.' });
        }
        if (Project_1.Project.db.readyState === 1) {
            const project = await Project_1.Project.findById(id);
            if (!project)
                return res.status(404).json({ message: 'Project not found.' });
            await Employee_1.Employee.updateMany({ _id: { $in: employeeIds } }, { $set: { projectId: project._id } });
            await (0, auditLogger_1.logAudit)(getActor(req), 'ADD_PROJECT_MEMBERS', 'Project', id, {
                addedCount: employeeIds.length,
                projectCode: project.code
            });
            return res.json({ message: `Successfully added ${employeeIds.length} team members to ${project.name}.` });
        }
        await mockStore_1.mockStore.initialize();
        const proj = mockStore_1.mockStore.projects.find((p) => p._id === id);
        if (!proj)
            return res.status(404).json({ message: 'Project not found.' });
        employeeIds.forEach((empId) => {
            const emp = mockStore_1.mockStore.employees.find((e) => e._id === empId || e.employeeId === empId);
            if (emp) {
                emp.projectId = proj;
            }
        });
        return res.json({ message: `Successfully added ${employeeIds.length} team members to ${proj.name}.` });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.addProjectMembers = addProjectMembers;
const removeProjectMember = async (req, res) => {
    try {
        const { id, employeeId } = req.params;
        if (Employee_1.Employee.db.readyState === 1) {
            await Employee_1.Employee.findByIdAndUpdate(employeeId, { $set: { projectId: null } });
            await (0, auditLogger_1.logAudit)(getActor(req), 'REMOVE_PROJECT_MEMBER', 'Project', id, { employeeId });
            return res.json({ message: 'Team member removed from project.' });
        }
        await mockStore_1.mockStore.initialize();
        const emp = mockStore_1.mockStore.employees.find((e) => e._id === employeeId || e.employeeId === employeeId);
        if (emp) {
            emp.projectId = null;
        }
        return res.json({ message: 'Team member removed from project.' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.removeProjectMember = removeProjectMember;
const reserveProjectBlock = async (req, res) => {
    try {
        const { projectId, seatIds } = req.body;
        if (!projectId || !Array.isArray(seatIds)) {
            return res.status(400).json({ message: 'projectId and seatIds array are required.' });
        }
        if (Seat_1.Seat.db.readyState === 1) {
            const project = await Project_1.Project.findById(projectId);
            if (!project)
                return res.status(404).json({ message: 'Project not found.' });
            await Seat_1.Seat.updateMany({ _id: { $in: seatIds } }, { $set: { projectTag: project._id } });
            await (0, auditLogger_1.logAudit)(getActor(req), 'RESERVE_PROJECT_BLOCK', 'Project', project._id.toString(), {
                seatsCount: seatIds.length,
                projectCode: project.code
            });
            return res.json({ message: `Successfully tagged ${seatIds.length} seats for Project ${project.code}.` });
        }
        await mockStore_1.mockStore.initialize();
        return res.json({ message: `Successfully tagged ${seatIds.length} seats.` });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.reserveProjectBlock = reserveProjectBlock;
