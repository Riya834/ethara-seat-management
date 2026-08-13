import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat extends Document {
  seatNumber: string;
  floorId: mongoose.Types.ObjectId;
  zoneId: mongoose.Types.ObjectId;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  occupiedBy?: mongoose.Types.ObjectId;
  projectTag?: mongoose.Types.ObjectId;
}

const SeatSchema: Schema = new Schema(
  {
    seatNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available'
    },
    occupiedBy: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    projectTag: { type: Schema.Types.ObjectId, ref: 'Project', default: null }
  },
  { timestamps: true }
);

SeatSchema.index({ floorId: 1, zoneId: 1, status: 1 });
SeatSchema.index({ occupiedBy: 1 });
SeatSchema.index({ projectTag: 1 });

export const Seat = mongoose.model<ISeat>('Seat', SeatSchema);
