import mongoose, { Schema, Document } from 'mongoose';

export interface IFloor extends Document {
  floorNumber: number;
  name: string;
  building: string;
}

const FloorSchema: Schema = new Schema(
  {
    floorNumber: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    building: { type: String, required: true, default: 'Ethara HQ - Tower A' }
  },
  { timestamps: true }
);

export const Floor = mongoose.model<IFloor>('Floor', FloorSchema);

export interface IZone extends Document {
  floorId: mongoose.Types.ObjectId;
  zoneName: string;
  capacity: number;
}

const ZoneSchema: Schema = new Schema(
  {
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
    zoneName: { type: String, required: true },
    capacity: { type: Number, required: true, default: 40 }
  },
  { timestamps: true }
);

ZoneSchema.index({ floorId: 1, zoneName: 1 }, { unique: true });

export const Zone = mongoose.model<IZone>('Zone', ZoneSchema);
