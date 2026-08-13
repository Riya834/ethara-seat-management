import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatRequest extends Document {
  requestedBy: mongoose.Types.ObjectId;
  type: 'assign' | 'transfer' | 'release';
  employeeId: mongoose.Types.ObjectId;
  fromSeatId?: mongoose.Types.ObjectId;
  toSeatId?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  comments?: string;
  createdAt: Date;
}

const SeatRequestSchema: Schema = new Schema(
  {
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['assign', 'transfer', 'release'], required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    fromSeatId: { type: Schema.Types.ObjectId, ref: 'Seat', default: null },
    toSeatId: { type: Schema.Types.ObjectId, ref: 'Seat', default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reason: { type: String, required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    comments: { type: String, default: '' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SeatRequestSchema.index({ status: 1, createdAt: -1 });
SeatRequestSchema.index({ requestedBy: 1 });
SeatRequestSchema.index({ employeeId: 1 });

export const SeatRequest = mongoose.model<ISeatRequest>('SeatRequest', SeatRequestSchema);
