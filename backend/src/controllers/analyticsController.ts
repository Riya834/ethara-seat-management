import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Seat } from '../models/Seat';
import { Floor, Zone } from '../models/FloorZone';
import { Employee } from '../models/Employee';
import { Project } from '../models/Project';

export const getUtilizationDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;

    const totalSeats = await Seat.countDocuments();
    const occupiedSeats = await Seat.countDocuments({ status: 'occupied' });
    const availableSeats = await Seat.countDocuments({ status: 'available' });
    const reservedSeats = await Seat.countDocuments({ status: 'reserved' });
    const maintenanceSeats = await Seat.countDocuments({ status: 'maintenance' });

    const overallUtilization = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

    // Floor Utilization Summary
    const floors = await Floor.find().sort({ floorNumber: 1 });
    const floorMetrics = await Promise.all(
      floors.map(async (floor) => {
        const floorSeats = await Seat.countDocuments({ floorId: floor._id });
        const floorOccupied = await Seat.countDocuments({ floorId: floor._id, status: 'occupied' });
        const floorAvailable = await Seat.countDocuments({ floorId: floor._id, status: 'available' });
        
        return {
          floorId: floor._id,
          floorNumber: floor.floorNumber,
          floorName: floor.name,
          totalSeats: floorSeats,
          occupiedSeats: floorOccupied,
          availableSeats: floorAvailable,
          utilizationPercentage: floorSeats > 0 ? Math.round((floorOccupied / floorSeats) * 100) : 0
        };
      })
    );

    // Zone Utilization Summary
    const zones = await Zone.find().populate('floorId', 'floorNumber name').sort({ zoneName: 1 });
    const zoneMetrics = await Promise.all(
      zones.map(async (zone: any) => {
        const zoneSeats = await Seat.countDocuments({ zoneId: zone._id });
        const zoneOccupied = await Seat.countDocuments({ zoneId: zone._id, status: 'occupied' });
        const zoneAvailable = await Seat.countDocuments({ zoneId: zone._id, status: 'available' });

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
      })
    );

    // Project Utilization Summary
    const projects = await Project.find().sort({ name: 1 });
    const projectMetrics = await Promise.all(
      projects.map(async (proj) => {
        const totalHeadcount = await Employee.countDocuments({ projectId: proj._id });
        const allocatedHeadcount = await Employee.countDocuments({
          projectId: proj._id,
          seatAllocationStatus: 'allocated'
        });
        const reservedSeatsCount = await Seat.countDocuments({ projectTag: proj._id });
        const occupiedSeatsCount = await Seat.countDocuments({ projectTag: proj._id, status: 'occupied' });

        return {
          projectId: proj._id,
          projectCode: proj.code,
          projectName: proj.name,
          totalHeadcount,
          allocatedHeadcount,
          reservedBlockSeats: reservedSeatsCount,
          occupiedBlockSeats: occupiedSeatsCount,
          utilizationPercentage:
            reservedSeatsCount > 0 ? Math.round((occupiedSeatsCount / reservedSeatsCount) * 100) : 0
        };
      })
    );

    // Department Headcount & Allocation Breakdown
    const deptAggregation = await Employee.aggregate([
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
    const thresholdDays = parseInt(req.query.slaDays as string) || 3;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const pendingNewJoinersCount = await Employee.countDocuments({
      status: 'new_joiner',
      seatAllocationStatus: 'pending'
    });

    const slaBreachedJoinersCount = await Employee.countDocuments({
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
        totalEmployees: await Employee.countDocuments(),
        pendingNewJoinersCount,
        slaBreachedJoinersCount
      },
      floors: floorMetrics,
      zones: zoneMetrics,
      projects: projectMetrics,
      departments: deptAggregation
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getNewJoinerPendingList = async (req: AuthRequest, res: Response) => {
  try {
    const thresholdDays = parseInt(req.query.slaDays as string) || 3;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    const joiners = await Employee.find({
      status: 'new_joiner'
    })
      .populate('projectId', 'name code')
      .populate('managerId', 'name employeeId designation')
      .sort({ joiningDate: -1 });

    const formatted = joiners.map((j) => {
      const isSlaBreached = j.seatAllocationStatus === 'pending' && j.joiningDate <= thresholdDate;
      const daysSinceJoining = Math.floor(
        (new Date().getTime() - new Date(j.joiningDate).getTime()) / (1000 * 3600 * 24)
      );

      return {
        ...j.toObject(),
        isSlaBreached,
        daysSinceJoining: Math.max(0, daysSinceJoining)
      };
    });

    return res.json(formatted);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
