import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistrationLog extends Document {
  id: number;
  student_id: number;
  section_id: number;
  action: 'ENROLL' | 'DROP';
  status: 'SUCCESS' | 'FAILED';
  details: string;
  created_at: Date;
}

const RegistrationLogSchema = new Schema<IRegistrationLog>({
  id: { type: Number, required: true, unique: true, index: true },
  student_id: { type: Number, required: true, index: true },
  section_id: { type: Number, required: true },
  action: { type: String, enum: ['ENROLL', 'DROP'], required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
  details: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

export const RegistrationLog = mongoose.model<IRegistrationLog>('RegistrationLog', RegistrationLogSchema);
