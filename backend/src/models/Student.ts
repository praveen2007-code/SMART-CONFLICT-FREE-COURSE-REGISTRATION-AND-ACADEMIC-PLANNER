import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  id: number;
  user_id: number;
  student_id: string;
  department_id: number;
  semester: number;
  max_credits: number;
  current_gpa: number;
}

const StudentSchema = new Schema<IStudent>({
  id: { type: Number, required: true, unique: true, index: true },
  user_id: { type: Number, required: true, unique: true, index: true },
  student_id: { type: String, required: true, unique: true },
  department_id: { type: Number, required: true, index: true },
  semester: { type: Number, default: 1 },
  max_credits: { type: Number, default: 18 },
  current_gpa: { type: Number, default: 0.0 }
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
