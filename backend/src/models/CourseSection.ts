import mongoose, { Schema, Document } from 'mongoose';
import { Schedule } from './types';

export interface ICourseSection extends Document {
  id: number;
  course_id: number;
  section_code: string;
  faculty_name: string;
  max_capacity: number;
  enrolled_count: number;
  room_number: string;
  semester_term: string;
  schedules: {
    id?: number;
    section_id: number;
    day_of_week: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
    start_time: string;
    end_time: string;
    building?: string;
    room?: string;
  }[];
}

const ScheduleSubSchema = new Schema(
  {
    id: { type: Number },
    section_id: { type: Number, required: true },
    day_of_week: {
      type: String,
      enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      required: true
    },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    building: { type: String, default: '' },
    room: { type: String, default: '' }
  },
  { _id: false }
);

const CourseSectionSchema = new Schema<ICourseSection>({
  id: { type: Number, required: true, unique: true, index: true },
  course_id: { type: Number, required: true, index: true },
  section_code: { type: String, required: true },
  faculty_name: { type: String, required: true },
  max_capacity: { type: Number, required: true, default: 30 },
  enrolled_count: { type: Number, default: 0 },
  room_number: { type: String, default: 'Hall-101' },
  semester_term: { type: String, default: 'Fall 2026' },
  schedules: [ScheduleSubSchema]
});

export const CourseSection = mongoose.model<ICourseSection>('CourseSection', CourseSectionSchema);
