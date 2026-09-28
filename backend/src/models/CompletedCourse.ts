import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletedCourse extends Document {
  id: number;
  student_id: number;
  course_id: number;
  semester_completed: number;
  grade: string;
}

const CompletedCourseSchema = new Schema<ICompletedCourse>({
  id: { type: Number, required: true, unique: true, index: true },
  student_id: { type: Number, required: true, index: true },
  course_id: { type: Number, required: true, index: true },
  semester_completed: { type: Number, required: true },
  grade: { type: String, default: 'A' }
});

export const CompletedCourse = mongoose.model<ICompletedCourse>('CompletedCourse', CompletedCourseSchema);
