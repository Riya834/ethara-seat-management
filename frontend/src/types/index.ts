export type Role = 'admin' | 'hr' | 'pm' | 'employee';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  employee?: Employee;
}

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  team: string;
  projectId?: Project | any;
  managerId?: Employee | any;
  joiningDate: string;
  status: 'active' | 'new_joiner' | 'exited';
  seatId?: Seat | any;
  seatAllocationStatus: 'allocated' | 'pending' | 'not_required';
  isSlaBreached?: boolean;
  daysSinceJoining?: number;
}

export interface Project {
  _id: string;
  name: string;
  code: string;
  description?: string;
  projectManagerId?: Employee | any;
  status: 'active' | 'closed';
  startDate: string;
  endDate?: string;
  headcount?: number;
  occupiedSeats?: number;
  totalReservedSeats?: number;
  utilizationPercentage?: number;
}

export interface Floor {
  _id: string;
  floorNumber: number;
  name: string;
  building: string;
}

export interface Zone {
  _id: string;
  floorId: Floor | string;
  zoneName: string;
  capacity: number;
}

export interface Seat {
  _id: string;
  seatNumber: string;
  floorId: Floor;
  zoneId: Zone;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  occupiedBy?: Employee;
  projectTag?: Project;
}

export interface SeatRequest {
  _id: string;
  requestedBy: User;
  type: 'assign' | 'transfer' | 'release';
  employeeId: Employee;
  fromSeatId?: Seat;
  toSeatId?: Seat;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  reviewedBy?: User;
  reviewedAt?: string;
  comments?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  timestamp: string;
}
