"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewJoinerPendingList = exports.getUtilizationDashboard = void 0;
const Seat_1 = require("../models/Seat");
const FloorZone_1 = require("../models/FloorZone");
const Employee_1 = require("../models/Employee");
const Project_1 = require("../models/Project");
const getUtilizationDashboard = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const totalSeats = await Seat_1.Seat.countDocuments();
        const occupiedSeats = await Seat_1.Seat.countDocuments({ status: 'occupied' });
        const availableSeats = await Seat_1.Seat.countDocuments({ status: 'available' });
        const reservedSeats = await Seat_1.Seat.countDocuments({ status: 'reserved' });
        const maintenanceSeats = await Seat_1.Seat.countDocuments({ status: 'maintenance' });
        const overallUtilization = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;
        // Floor Utilization Summary
        const floors = await FloorZone_1.Floor.find().sort({ floorNumber: 1 });
        const floorMetrics = await Promise.all(floors.map(async (floor) => {
            const floorSeats = await Seat_1.Seat.countDocuments({ floorId: floor._id });
            const floorOccupied = await Seat_1.Seat.countDocuments({ floorId: floor._id, status: 'occupied' });
            const floorAvailable = await Seat_1.Seat.countDocuments({ floorId: floor._id, status: 'available' });
            return {
                floorId: floor._id,
                floorNumber: floor.floorNumber,
                floorName: floor.name,
                totalSeats: floorSeats,
                occupiedSeats: floorOccupied,
                availableSeats: floorAvailable,
                utilizationPercentage: floorSeats > 0 ? Math.round((floorOccupied / floorSeats) * 100) : 0
            };
        }));
        // Zone Utilization Summary
        const zones = await FloorZone_1.Zone.find().populate('floorId', 'floorNumber name').sort({ zoneName: 1 });
        const zoneMetrics = await Promise.all(zones.map(async (zone) => {
            const zoneSeats = await Seat_1.Seat.countDocuments({ zoneId: zone._id });
            const zoneOccupied = await Seat_1.Seat.countDocuments({ zoneId: zone._id, status: 'occupied' });
            const zoneAvailable = await Seat_1.Seat.countDocuments({ zoneId: zone._id, status: 'available' });
            return {
                zoneId: zone._id,
                zoneName: zone.zoneName,
                floorNumber: zone.floorId?.floorNumber,
                capacity: zone.capacity,
                totalSeats: zoneSeats,
                occupiedSeats: zoneOccupied,
                availableSeats: zoneAvailable,
                utilizationPercentage: zoneSeats > 0 ? Math.round((zoneOccupied / zoneSeats) * 100) : 0
            };
        }));
        // Project Utilization Summary
        const projects = await Project_1.Project.find().sort({ name: 1 });
        const projectMetrics = await Promise.all(projects.map(async (proj) => {
            const totalHeadcount = await Employee_1.Employee.countDocuments({ projectId: proj._id });
            const allocatedHeadcount = await Employee_1.Employee.countDocuments({
                projectId: proj._id,
                seatAllocationStatus: 'allocated'
            });
            const reservedSeatsCount = await Seat_1.Seat.countDocuments({ projectTag: proj._id });
            const occupiedSeatsCount = await Seat_1.Seat.countDocuments({ projectTag: proj._id, status: 'occupied' });
            return {
                projectId: proj._id,
                projectCode: proj.code,
                projectName: proj.name,
                totalHeadcount,
                allocatedHeadcount,
                reservedBlockSeats: reservedSeatsCount,
                occupiedBlockSeats: occupiedSeatsCount,
                utilizationPercentage: reservedSeatsCount > 0 ? Math.round((occupiedSeatsCount / reservedSeatsCount) * 100) : 0
            };
        }));
        // Department Headcount & Allocation Breakdown
        const deptAggregation = await Employee_1.Employee.aggregate([
            {
                $group: {
                    _id: '$department',
                    totalEmployees: { $sum: 1 },
                    allocated: {
                        $sum: { $cond: [{ $eq: ['$seatAllocationStatus', 'allocated'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$seatAllocationStatus', 'pending'] }, 1, 0] }
                    }
                }
            },
            { $sort: { totalEmployees: -1 } }
        ]);
        // New Joiner Pending SLA metrics (threshold default 3 days)
        const thresholdDays = parseInt(req.query.slaDays) || 3;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
        const pendingNewJoinersCount = await Employee_1.Employee.countDocuments({
            status: 'new_joiner',
            seatAllocationStatus: 'pending'
        });
        const slaBreachedJoinersCount = await Employee_1.Employee.countDocuments({
            status: 'new_joiner',
            seatAllocationStatus: 'pending',
            joiningDate: { $lte: thresholdDate }
        });
        return res.json({
            summary: {
                totalSeats,
                occupiedSeats,
                availableSeats,
                reservedSeats,
                maintenanceSeats,
                overallUtilizationPercentage: overallUtilization,
                totalEmployees: await Employee_1.Employee.countDocuments(),
                pendingNewJoinersCount,
                slaBreachedJoinersCount
            },
            floors: floorMetrics,
            zones: zoneMetrics,
            projects: projectMetrics,
            departments: deptAggregation
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getUtilizationDashboard = getUtilizationDashboard;
const getNewJoinerPendingList = async (req, res) => {
    try {
        const thresholdDays = parseInt(req.query.slaDays) || 3;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
        const joiners = await Employee_1.Employee.find({
            status: 'new_joiner'
        })
            .populate('projectId', 'name code')
            .populate('managerId', 'name employeeId designation')
            .sort({ joiningDate: -1 });
        const formatted = joiners.map((j) => {
            const isSlaBreached = j.seatAllocationStatus === 'pending' && j.joiningDate <= thresholdDate;
            const daysSinceJoining = Math.floor((new Date().getTime() - new Date(j.joiningDate).getTime()) / (1000 * 3600 * 24));
            return {
                ...j.toObject(),
                isSlaBreached,
                daysSinceJoining: Math.max(0, daysSinceJoining)
            };
        });
        return res.json(formatted);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getNewJoinerPendingList = getNewJoinerPendingList;
