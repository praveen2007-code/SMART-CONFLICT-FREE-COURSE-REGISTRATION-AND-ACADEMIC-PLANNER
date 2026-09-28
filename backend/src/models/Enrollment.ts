import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  id: number;
  student_id: number;
  section_id: number;
  status: 'REGISTERED' | 'DROPPED';
  enrolled_at: Date;
  dropped_at?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  id: { type: Number, required: true, unique: true, index: true },
  student_id: { type: Number, required: true, index: true },
  section_id: { type: Number, required: true, index: true },
  status: { type: String, enum: ['REGISTERED', 'DROPPED'], default: 'REGISTERED' },
  enrolled_at: { type: Date, default: Date.now },
  dropped_at: { type: Date }
});

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
