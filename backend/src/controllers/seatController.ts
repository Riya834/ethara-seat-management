import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Seat } from '../models/Seat';
import { Floor, Zone } from '../models/FloorZone';
import { Employee } from '../models/Employee';
import { mockStore } from '../config/mockStore';

export const getFloors = async (req: AuthRequest, res: Response) => {
  try {
    if (Floor.db.readyState === 1) {
      const floors = await Floor.find().sort({ floorNumber: 1 });
      if (floors.length > 0) return res.json(floors);
    }
    await mockStore.initialize();
    return res.json(mockStore.floors);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getZonesByFloor = async (req: AuthRequest, res: Response) => {
  try {
    const { floorId } = req.params;
    if (Zone.db.readyState === 1) {
      const zones = await Zone.find({ floorId }).sort({ zoneName: 1 });
      if (zones.length > 0) return res.json(zones);
    }
    await mockStore.initialize();
    const zones = mockStore.zones.filter((z) => z.floorId === floorId || z.floorId?._id === floorId);
    return res.json(zones);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSeats = async (req: AuthRequest, res: Response) => {
  try {
    const { floorId, zoneId, status, projectId } = req.query;

    if (Seat.db.readyState === 1) {
      const filter: any = {};
      if (floorId) filter.floorId = floorId;
      if (zoneId) filter.zoneId = zoneId;
      if (status) filter.status = status;
      if (projectId) filter.projectTag = projectId;

      const seats = await Seat.find(filter)
        .populate('floorId', 'floorNumber name building')
        .populate('zoneId', 'zoneName capacity')
        .populate('occupiedBy', 'employeeId name email designation department team projectId')
        .populate('projectTag', 'name code')
        .sort({ seatNumber: 1 });

      if (seats.length > 0) return res.json(seats);
    }

    await mockStore.initialize();
    let filtered = [...mockStore.seats];
    if (floorId) filtered = filtered.filter((s) => s.floorId === floorId || s.floorId?._id === floorId);
    if (zoneId) filtered = filtered.filter((s) => s.zoneId === zoneId || s.zoneId?._id === zoneId);
    if (status) filtered = filtered.filter((s) => s.status === status);

    return res.json(filtered);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const assignSeatDirect = async (req: AuthRequest, res: Response) => {
  try {
    const { seatId, employeeId } = req.body;
    if (!seatId || !employeeId) {
      return res.status(400).json({ message: 'Both seatId and employeeId are required.' });
    }

    if (Seat.db.readyState === 1) {
      const seat = await Seat.findById(seatId);
      const employee = await Employee.findById(employeeId);
      if (seat && employee) {
        if (employee.seatId && employee.seatId.toString() !== seatId) {
          await Seat.findByIdAndUpdate(employee.seatId, { status: 'available', occupiedBy: null });
        }
        seat.status = 'occupied';
        seat.occupiedBy = employee._id as any;
        await seat.save();

        employee.seatId = seat._id as any;
        employee.seatAllocationStatus = 'allocated';
        await employee.save();

        return res.json({ message: `Seat ${seat.seatNumber} allocated to ${employee.name} successfully.`, seat, employee });
      }
    }

    await mockStore.initialize();
    const seat = mockStore.seats.find((s) => s._id === seatId);
    const employee = mockStore.employees.find((e) => e._id === employeeId);
    if (!seat || !employee) return res.status(404).json({ message: 'Seat or Employee not found.' });

    seat.status = 'occupied';
    seat.occupiedBy = employee;
    employee.seatId = seat;
    employee.seatAllocationStatus = 'allocated';

    return res.json({ message: `Seat ${seat.seatNumber} allocated to ${employee.name} successfully.`, seat, employee });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const releaseSeatDirect = async (req: AuthRequest, res: Response) => {
  try {
    const { seatId } = req.params;
    if (Seat.db.readyState === 1) {
      const seat = await Seat.findById(seatId);
      if (seat) {
        if (seat.occupiedBy) {
          await Employee.findByIdAndUpdate(seat.occupiedBy, { seatId: null, seatAllocationStatus: 'pending' });
        }
        seat.status = 'available';
        seat.occupiedBy = undefined;
        await seat.save();
        return res.json({ message: `Seat ${seat.seatNumber} released successfully.`, seat });
      }
    }

    await mockStore.initialize();
    const seat = mockStore.seats.find((s) => s._id === seatId);
    if (!seat) return res.status(404).json({ message: 'Seat not found.' });

    if (seat.occupiedBy) {
      seat.occupiedBy.seatId = null;
      seat.occupiedBy.seatAllocationStatus = 'pending';
    }
    seat.status = 'available';
    seat.occupiedBy = null;

    return res.json({ message: `Seat ${seat.seatNumber} released successfully.`, seat });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSeatStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { seatId } = req.params;
    const { status, projectTag } = req.body;

    if (Seat.db.readyState === 1) {
      const seat = await Seat.findById(seatId);
      if (seat) {
        if (status) seat.status = status;
        if (projectTag !== undefined) seat.projectTag = projectTag || null;
        await seat.save();
        return res.json(seat);
      }
    }

    await mockStore.initialize();
    const seat = mockStore.seats.find((s) => s._id === seatId);
    if (!seat) return res.status(404).json({ message: 'Seat not found.' });

    if (status) seat.status = status;
    return res.json(seat);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
