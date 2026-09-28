import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  id: number;
  code: string;
  name: string;
  department_id: number;
  credits: number;
  semester: number;
  description: string;
  is_core: boolean;
  prerequisites: number[]; // prerequisite course IDs
  created_at: Date;
}

const CourseSchema = new Schema<ICourse>({
  id: { type: Number, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true },
  department_id: { type: Number, required: true, index: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  semester: { type: Number, required: true, min: 1, max: 8 },
  description: { type: String, default: '' },
  is_core: { type: Boolean, default: true },
  prerequisites: [{ type: Number }],
  created_at: { type: Date, default: Date.now }
});

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
