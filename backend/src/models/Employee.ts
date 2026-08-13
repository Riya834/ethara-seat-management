import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  department: string;
  team: string;
  projectId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  joiningDate: Date;
  status: 'active' | 'new_joiner' | 'exited';
  seatId?: mongoose.Types.ObjectId;
  seatAllocationStatus: 'allocated' | 'pending' | 'not_required';
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    team: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'new_joiner', 'exited'], default: 'active' },
    seatId: { type: Schema.Types.ObjectId, ref: 'Seat', default: null },
    seatAllocationStatus: { type: String, enum: ['allocated', 'pending', 'not_required'], default: 'pending' }
  },
  { timestamps: true }
);

// Indexes for high performance querying across 5000+ employees
EmployeeSchema.index({ name: 'text', email: 'text', department: 1 });
EmployeeSchema.index({ projectId: 1 });
EmployeeSchema.index({ seatId: 1 });
EmployeeSchema.index({ status: 1, seatAllocationStatus: 1, joiningDate: -1 });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
