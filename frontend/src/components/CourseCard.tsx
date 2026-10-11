import React from 'react';
import { Course } from '../types';
import { SeatBadge } from './SeatBadge';
import { Clock, User, CheckCircle2, AlertCircle, BookmarkCheck } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onViewDetails: (course: Course) => void;
  onQuickRegister?: (sectionId: number) => void;
  isRegistering?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onQuickRegister,
  isRegistering = false
}) => {
  const primarySection = course.sections?.[0];
  const allPrereqsMet = course.satisfiesPrerequisites ?? true;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              {course.code}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {course.credits} Credits
            </span>
            {course.isCore && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Core
              </span>
            )}
          </div>

          {/* Seat status badge */}
          {primarySection && (
            <SeatBadge
              status={primarySection.seatStatus}
              available={course.totalAvailableSeats}
              capacity={primarySection.maxCapacity}
            />
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors">
          {course.name}
        </h3>

        {/* Department & Semester */}
        <p className="text-xs text-slate-500 mt-1">
          {course.departmentName} • Semester {course.semester}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Schedule snippet */}
        {primarySection?.schedules && primarySection.schedules.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {primarySection.schedules
                .map((s) => `${s.day_of_week} ${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`)
                .join(', ')}
            </span>
          </div>
        )}

        {/* Faculty */}
        {primarySection?.facultyName && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{primarySection.facultyName}</span>
          </div>
        )}

        {/* Prerequisites Badge */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">Prerequisites:</span>
          {course.prerequisites && course.prerequisites.length > 0 ? (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                allPrereqsMet
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {allPrereqsMet ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Satisfied</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>Missing ({course.prerequisites.length})</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">None required</span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(course)}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
        >
          Details & Sections
        </button>

        {course.isRegistered ? (
          <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Registered</span>
          </span>
        ) : course.isCompleted ? (
          <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        ) : onQuickRegister && primarySection ? (
          <button
            type="button"
            disabled={!allPrereqsMet || primarySection.availableSeats === 0 || isRegistering}
            onClick={() => onQuickRegister(primarySection.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              !allPrereqsMet || primarySection.availableSeats === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
            }`}
          >
            {primarySection.availableSeats === 0 ? 'Full' : 'Register'}
          </button>
        ) : null}
      </div>
    </div>
  );
};
