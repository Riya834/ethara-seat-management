"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSeatStatus = exports.releaseSeatDirect = exports.assignSeatDirect = exports.getSeats = exports.getZonesByFloor = exports.getFloors = void 0;
const Seat_1 = require("../models/Seat");
const FloorZone_1 = require("../models/FloorZone");
const Employee_1 = require("../models/Employee");
const mockStore_1 = require("../config/mockStore");
const getFloors = async (req, res) => {
    try {
        if (FloorZone_1.Floor.db.readyState === 1) {
            const floors = await FloorZone_1.Floor.find().sort({ floorNumber: 1 });
            if (floors.length > 0)
                return res.json(floors);
        }
        await mockStore_1.mockStore.initialize();
        return res.json(mockStore_1.mockStore.floors);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getFloors = getFloors;
const getZonesByFloor = async (req, res) => {
    try {
        const { floorId } = req.params;
        if (FloorZone_1.Zone.db.readyState === 1) {
            const zones = await FloorZone_1.Zone.find({ floorId }).sort({ zoneName: 1 });
            if (zones.length > 0)
                return res.json(zones);
        }
        await mockStore_1.mockStore.initialize();
        const zones = mockStore_1.mockStore.zones.filter((z) => z.floorId === floorId || z.floorId?._id === floorId);
        return res.json(zones);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getZonesByFloor = getZonesByFloor;
const getSeats = async (req, res) => {
    try {
        const { floorId, zoneId, status, projectId } = req.query;
        if (Seat_1.Seat.db.readyState === 1) {
            const filter = {};
            if (floorId)
                filter.floorId = floorId;
            if (zoneId)
                filter.zoneId = zoneId;
            if (status)
                filter.status = status;
            if (projectId)
                filter.projectTag = projectId;
            const seats = await Seat_1.Seat.find(filter)
                .populate('floorId', 'floorNumber name building')
                .populate('zoneId', 'zoneName capacity')
                .populate('occupiedBy', 'employeeId name email designation department team projectId')
                .populate('projectTag', 'name code')
                .sort({ seatNumber: 1 });
            if (seats.length > 0)
                return res.json(seats);
        }
        await mockStore_1.mockStore.initialize();
        let filtered = [...mockStore_1.mockStore.seats];
        if (floorId)
            filtered = filtered.filter((s) => s.floorId === floorId || s.floorId?._id === floorId);
        if (zoneId)
            filtered = filtered.filter((s) => s.zoneId === zoneId || s.zoneId?._id === zoneId);
        if (status)
            filtered = filtered.filter((s) => s.status === status);
        return res.json(filtered);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getSeats = getSeats;
const assignSeatDirect = async (req, res) => {
    try {
        const { seatId, employeeId } = req.body;
        if (!seatId || !employeeId) {
            return res.status(400).json({ message: 'Both seatId and employeeId are required.' });
        }
        if (Seat_1.Seat.db.readyState === 1) {
            const seat = await Seat_1.Seat.findById(seatId);
            const employee = await Employee_1.Employee.findById(employeeId);
            if (seat && employee) {
                if (employee.seatId && employee.seatId.toString() !== seatId) {
                    await Seat_1.Seat.findByIdAndUpdate(employee.seatId, { status: 'available', occupiedBy: null });
                }
                seat.status = 'occupied';
                seat.occupiedBy = employee._id;
                await seat.save();
                employee.seatId = seat._id;
                employee.seatAllocationStatus = 'allocated';
                await employee.save();
                return res.json({ message: `Seat ${seat.seatNumber} allocated to ${employee.name} successfully.`, seat, employee });
            }
        }
        await mockStore_1.mockStore.initialize();
        const seat = mockStore_1.mockStore.seats.find((s) => s._id === seatId);
        const employee = mockStore_1.mockStore.employees.find((e) => e._id === employeeId);
        if (!seat || !employee)
            return res.status(404).json({ message: 'Seat or Employee not found.' });
        seat.status = 'occupied';
        seat.occupiedBy = employee;
        employee.seatId = seat;
        employee.seatAllocationStatus = 'allocated';
        return res.json({ message: `Seat ${seat.seatNumber} allocated to ${employee.name} successfully.`, seat, employee });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.assignSeatDirect = assignSeatDirect;
const releaseSeatDirect = async (req, res) => {
    try {
        const { seatId } = req.params;
        if (Seat_1.Seat.db.readyState === 1) {
            const seat = await Seat_1.Seat.findById(seatId);
            if (seat) {
                if (seat.occupiedBy) {
                    await Employee_1.Employee.findByIdAndUpdate(seat.occupiedBy, { seatId: null, seatAllocationStatus: 'pending' });
                }
                seat.status = 'available';
                seat.occupiedBy = undefined;
                await seat.save();
                return res.json({ message: `Seat ${seat.seatNumber} released successfully.`, seat });
            }
        }
        await mockStore_1.mockStore.initialize();
        const seat = mockStore_1.mockStore.seats.find((s) => s._id === seatId);
        if (!seat)
            return res.status(404).json({ message: 'Seat not found.' });
        if (seat.occupiedBy) {
            seat.occupiedBy.seatId = null;
            seat.occupiedBy.seatAllocationStatus = 'pending';
        }
        seat.status = 'available';
        seat.occupiedBy = null;
        return res.json({ message: `Seat ${seat.seatNumber} released successfully.`, seat });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.releaseSeatDirect = releaseSeatDirect;
const updateSeatStatus = async (req, res) => {
    try {
        const { seatId } = req.params;
        const { status, projectTag } = req.body;
        if (Seat_1.Seat.db.readyState === 1) {
            const seat = await Seat_1.Seat.findById(seatId);
            if (seat) {
                if (status)
                    seat.status = status;
                if (projectTag !== undefined)
                    seat.projectTag = projectTag || null;
                await seat.save();
                return res.json(seat);
            }
        }
        await mockStore_1.mockStore.initialize();
        const seat = mockStore_1.mockStore.seats.find((s) => s._id === seatId);
        if (!seat)
            return res.status(404).json({ message: 'Seat not found.' });
        if (status)
            seat.status = status;
        return res.json(seat);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.updateSeatStatus = updateSeatStatus;
