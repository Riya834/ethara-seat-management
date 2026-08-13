"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSeatRequest = exports.createSeatRequest = exports.getSeatRequests = void 0;
const SeatRequest_1 = require("../models/SeatRequest");
const Seat_1 = require("../models/Seat");
const Employee_1 = require("../models/Employee");
const auditLogger_1 = require("../utils/auditLogger");
const getSeatRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        // PM can view their submitted requests
        if (req.user?.role === 'pm') {
            filter.requestedBy = req.user._id;
        }
        const requests = await SeatRequest_1.SeatRequest.find(filter)
            .populate('requestedBy', 'name email role')
            .populate('employeeId', 'employeeId name email designation department team')
            .populate({
            path: 'fromSeatId',
            populate: [{ path: 'floorId' }, { path: 'zoneId' }]
        })
            .populate({
            path: 'toSeatId',
            populate: [{ path: 'floorId' }, { path: 'zoneId' }]
        })
            .populate('reviewedBy', 'name email role')
            .sort({ createdAt: -1 });
        return res.json(requests);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getSeatRequests = getSeatRequests;
const createSeatRequest = async (req, res) => {
    try {
        const { type, employeeId, toSeatId, reason } = req.body;
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!type || !employeeId || !reason) {
            return res.status(400).json({ message: 'type, employeeId, and reason are required.' });
        }
        const employee = await Employee_1.Employee.findById(employeeId);
        if (!employee)
            return res.status(404).json({ message: 'Employee not found.' });
        let toSeat = null;
        if (toSeatId) {
            toSeat = await Seat_1.Seat.findById(toSeatId);
            if (!toSeat)
                return res.status(404).json({ message: 'Target seat not found.' });
            if (toSeat.status === 'occupied') {
                return res.status(400).json({ message: `Target seat ${toSeat.seatNumber} is already occupied.` });
            }
        }
        const seatRequest = await SeatRequest_1.SeatRequest.create({
            requestedBy: req.user._id,
            type,
            employeeId: employee._id,
            fromSeatId: employee.seatId || null,
            toSeatId: toSeat ? toSeat._id : null,
            status: 'pending',
            reason
        });
        await (0, auditLogger_1.logAudit)(req.user, 'SUBMIT_SEAT_REQUEST', 'SeatRequest', seatRequest._id.toString(), {
            type,
            employeeName: employee.name,
            toSeatNumber: toSeat ? toSeat.seatNumber : null,
            reason
        });
        return res.status(201).json(seatRequest);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.createSeatRequest = createSeatRequest;
const reviewSeatRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, comments } = req.body; // action: 'approve' | 'reject'
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: "Action must be 'approve' or 'reject'." });
        }
        const seatRequest = await SeatRequest_1.SeatRequest.findById(requestId)
            .populate('employeeId')
            .populate('toSeatId')
            .populate('fromSeatId');
        if (!seatRequest)
            return res.status(404).json({ message: 'Seat request not found.' });
        if (seatRequest.status !== 'pending') {
            return res.status(400).json({ message: `Request is already ${seatRequest.status}.` });
        }
        if (action === 'reject') {
            seatRequest.status = 'rejected';
            seatRequest.reviewedBy = req.user._id;
            seatRequest.reviewedAt = new Date();
            seatRequest.comments = comments || 'Request rejected by Admin/HR.';
            await seatRequest.save();
            await (0, auditLogger_1.logAudit)(req.user, 'REJECT_SEAT_REQUEST', 'SeatRequest', seatRequest._id.toString(), {
                comments
            });
            return res.json({ message: 'Request rejected.', seatRequest });
        }
        // ON APPROVAL: Auto update seats & employee record
        const employee = await Employee_1.Employee.findById(seatRequest.employeeId);
        if (!employee)
            return res.status(404).json({ message: 'Employee associated with request not found.' });
        if (seatRequest.type === 'assign' || seatRequest.type === 'transfer') {
            if (!seatRequest.toSeatId) {
                return res.status(400).json({ message: 'Target seat missing for assignment/transfer.' });
            }
            const targetSeat = await Seat_1.Seat.findById(seatRequest.toSeatId);
            if (!targetSeat)
                return res.status(404).json({ message: 'Target seat not found.' });
            // Unassign current seat if any
            if (employee.seatId) {
                await Seat_1.Seat.findByIdAndUpdate(employee.seatId, {
                    status: 'available',
                    occupiedBy: null
                });
            }
            // Occupy target seat
            targetSeat.status = 'occupied';
            targetSeat.occupiedBy = employee._id;
            await targetSeat.save();
            // Update employee
            employee.seatId = targetSeat._id;
            employee.seatAllocationStatus = 'allocated';
            await employee.save();
        }
        else if (seatRequest.type === 'release') {
            if (employee.seatId) {
                await Seat_1.Seat.findByIdAndUpdate(employee.seatId, {
                    status: 'available',
                    occupiedBy: null
                });
            }
            employee.seatId = undefined;
            employee.seatAllocationStatus = 'pending';
            await employee.save();
        }
        seatRequest.status = 'approved';
        seatRequest.reviewedBy = req.user._id;
        seatRequest.reviewedAt = new Date();
        seatRequest.comments = comments || 'Request approved.';
        await seatRequest.save();
        await (0, auditLogger_1.logAudit)(req.user, 'APPROVE_SEAT_REQUEST', 'SeatRequest', seatRequest._id.toString(), {
            type: seatRequest.type,
            employeeName: employee.name,
            comments
        });
        return res.json({
            message: `Seat request approved and executed successfully.`,
            seatRequest
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.reviewSeatRequest = reviewSeatRequest;
