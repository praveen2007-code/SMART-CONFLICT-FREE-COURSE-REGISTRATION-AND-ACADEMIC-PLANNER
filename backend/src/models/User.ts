import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from './types';

export interface IUser extends Document {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  id: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
  created_at: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
