import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  code: string;
  description?: string;
  projectManagerId?: mongoose.Types.ObjectId;
  status: 'active' | 'closed';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    projectManagerId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

ProjectSchema.index({ projectManagerId: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
