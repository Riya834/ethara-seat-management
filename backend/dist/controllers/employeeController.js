"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.searchEmployees = exports.getEmployees = exports.invalidateEmployeeCache = void 0;
const Employee_1 = require("../models/Employee");
const Seat_1 = require("../models/Seat");
const User_1 = require("../models/User");
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
// High-performance in-memory query cache for 5000+ employee dataset
const queryCache = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds
const invalidateEmployeeCache = () => {
    queryCache.clear();
};
exports.invalidateEmployeeCache = invalidateEmployeeCache;
const getEmployees = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { search, department, projectId, status, seatAllocationStatus, team } = req.query;
        const cacheKey = JSON.stringify({ page, limit, search, department, projectId, status, seatAllocationStatus, team });
        const cached = queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return res.json(cached.data);
        }
        if (Employee_1.Employee.db.readyState === 1) {
            const filter = {};
            if (search) {
                const regex = new RegExp(search, 'i');
                filter.$or = [
                    { name: regex },
                    { employeeId: regex },
                    { email: regex },
                    { designation: regex },
                    { department: regex }
                ];
            }
            if (department)
                filter.department = new RegExp(`^${department}$`, 'i');
            if (projectId && projectId !== '')
                filter.projectId = projectId;
            if (status)
                filter.status = new RegExp(`^${status}$`, 'i');
            if (seatAllocationStatus)
                filter.seatAllocationStatus = new RegExp(`^${seatAllocationStatus}$`, 'i');
            if (team)
                filter.team = new RegExp(`^${team}$`, 'i');
            // Execute count & find concurrently in parallel with 2500ms maxTimeMS budget
            const [total, employees] = await Promise.all([
                Employee_1.Employee.countDocuments(filter).maxTimeMS(2500),
                Employee_1.Employee.find(filter)
                    .maxTimeMS(2500)
                    .lean()
                    .populate('projectId', 'name code')
                    .populate('managerId', 'name employeeId designation')
                    .populate({
                    path: 'seatId',
                    select: 'seatNumber floorId zoneId',
                    populate: [
                        { path: 'floorId', select: 'floorNumber name' },
                        { path: 'zoneId', select: 'zoneName' }
                    ]
                })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
            ]);
            const resultPayload = {
                data: employees,
                pagination: { total, page, limit, pages: Math.ceil(total / limit) }
            };
            queryCache.set(cacheKey, { data: resultPayload, timestamp: Date.now() });
            return res.json(resultPayload);
        }
        // In-memory Fallback
        await mockStore_1.mockStore.initialize();
        let filtered = [...mockStore_1.mockStore.employees];
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((e) => e.name.toLowerCase().includes(q) ||
                e.employeeId.toLowerCase().includes(q) ||
                e.email.toLowerCase().includes(q) ||
                e.department.toLowerCase().includes(q));
        }
        if (department)
            filtered = filtered.filter((e) => e.department === department);
        if (status)
            filtered = filtered.filter((e) => e.status === status);
        if (seatAllocationStatus)
            filtered = filtered.filter((e) => e.seatAllocationStatus === seatAllocationStatus);
        const total = filtered.length;
        const paginated = filtered.slice(skip, skip + limit);
        return res.json({
            data: paginated,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getEmployees = getEmployees;
const searchEmployees = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string')
            return res.json([]);
        if (Employee_1.Employee.db.readyState === 1) {
            const regex = new RegExp(q, 'i');
            const matchingSeats = await Seat_1.Seat.find({ seatNumber: regex }).select('_id');
            const seatIds = matchingSeats.map((s) => s._id);
            const employees = await Employee_1.Employee.find({
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
        await mockStore_1.mockStore.initialize();
        const queryStr = q.toLowerCase();
        const matches = mockStore_1.mockStore.employees.filter((e) => e.name.toLowerCase().includes(queryStr) ||
            e.employeeId.toLowerCase().includes(queryStr) ||
            e.email.toLowerCase().includes(queryStr) ||
            (e.seatId && e.seatId.seatNumber && e.seatId.seatNumber.toLowerCase().includes(queryStr))).slice(0, 20);
        return res.json(matches);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.searchEmployees = searchEmployees;
const getEmployeeById = async (req, res) => {
    try {
        if (Employee_1.Employee.db.readyState === 1) {
            const employee = await Employee_1.Employee.findById(req.params.id)
                .populate('projectId', 'name code description startDate endDate')
                .populate('managerId', 'name employeeId designation email')
                .populate({
                path: 'seatId',
                populate: [
                    { path: 'floorId', select: 'floorNumber name building' },
                    { path: 'zoneId', select: 'zoneName capacity' }
                ]
            });
            if (employee)
                return res.json(employee);
        }
        await mockStore_1.mockStore.initialize();
        const emp = mockStore_1.mockStore.employees.find((e) => e._id === req.params.id);
        if (!emp)
            return res.status(404).json({ message: 'Employee not found.' });
        return res.json(emp);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getEmployeeById = getEmployeeById;
const createEmployee = async (req, res) => {
    try {
        let { employeeId, name, email, phone, designation, department, team, projectId, managerId, joiningDate, status } = req.body;
        const cleanProjectId = (projectId && typeof projectId === 'string' && projectId.trim() !== '') ? projectId : null;
        const cleanManagerId = (managerId && typeof managerId === 'string' && managerId.trim() !== '') ? managerId : null;
        if (!employeeId) {
            employeeId = `ETH-${Math.floor(10000 + Math.random() * 90000)}`;
        }
        if (Employee_1.Employee.db.readyState === 1) {
            const existing = await Employee_1.Employee.findOne({ $or: [{ employeeId }, { email }] });
            if (existing) {
                return res.status(400).json({ message: 'Employee with this ID or Email already exists.' });
            }
            const employee = await Employee_1.Employee.create({
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
            (0, exports.invalidateEmployeeCache)();
            (0, auditLogger_1.logAudit)(getActor(req), 'CREATE_EMPLOYEE', 'Employee', employee._id.toString(), { name, employeeId }).catch(() => { });
            return res.status(201).json(employee);
        }
        await mockStore_1.mockStore.initialize();
        const newEmpObj = {
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
        mockStore_1.mockStore.employees.unshift(newEmpObj);
        return res.status(201).json(newEmpObj);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.createEmployee = createEmployee;
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (updateData.projectId === '')
            updateData.projectId = null;
        if (updateData.managerId === '')
            updateData.managerId = null;
        if (Employee_1.Employee.db.readyState === 1) {
            const employee = await Employee_1.Employee.findByIdAndUpdate(id, updateData, { new: true });
            if (!employee)
                return res.status(404).json({ message: 'Employee not found.' });
            await (0, auditLogger_1.logAudit)(getActor(req), 'UPDATE_EMPLOYEE', 'Employee', id, { name: employee.name });
            return res.json(employee);
        }
        await mockStore_1.mockStore.initialize();
        const idx = mockStore_1.mockStore.employees.findIndex((e) => e._id === id);
        if (idx !== -1) {
            mockStore_1.mockStore.employees[idx] = { ...mockStore_1.mockStore.employees[idx], ...updateData };
            return res.json(mockStore_1.mockStore.employees[idx]);
        }
        return res.status(404).json({ message: 'Employee not found.' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        if (Employee_1.Employee.db.readyState === 1) {
            const employee = await Employee_1.Employee.findById(id);
            if (!employee)
                return res.status(404).json({ message: 'Employee not found.' });
            if (employee.seatId) {
                await Seat_1.Seat.findByIdAndUpdate(employee.seatId, {
                    status: 'available',
                    occupiedBy: null
                });
            }
            await Employee_1.Employee.findByIdAndDelete(id);
            await User_1.User.findOneAndDelete({ employeeId: id });
            (0, exports.invalidateEmployeeCache)();
            (0, auditLogger_1.logAudit)(getActor(req), 'DELETE_EMPLOYEE', 'Employee', id, { name: employee.name }).catch(() => { });
            return res.json({ message: 'Employee deleted successfully.' });
        }
        await mockStore_1.mockStore.initialize();
        const idx = mockStore_1.mockStore.employees.findIndex((e) => e._id === id);
        if (idx !== -1) {
            const emp = mockStore_1.mockStore.employees[idx];
            if (emp.seatId) {
                const seat = mockStore_1.mockStore.seats.find((s) => s._id === emp.seatId?._id || s._id === emp.seatId);
                if (seat) {
                    seat.status = 'available';
                    seat.occupiedBy = null;
                }
            }
            mockStore_1.mockStore.employees.splice(idx, 1);
            return res.json({ message: 'Employee deleted successfully.' });
        }
        return res.status(404).json({ message: 'Employee not found.' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.deleteEmployee = deleteEmployee;
