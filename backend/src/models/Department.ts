import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  id: number;
  code: string;
  name: string;
}

const DepartmentSchema = new Schema<IDepartment>({
  id: { type: Number, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true }
});

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
