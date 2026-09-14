import React from 'react';
import { Schedule } from '../types';

export interface TimetableItem {
  courseCode: string;
  courseName: string;
  sectionCode: string;
  room?: string;
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  startTime: string; // "10:00:00" or "10:00"
  endTime: string;   // "11:30:00" or "11:30"
  colorIndex?: number;
}

interface TimetableGridProps {
  items: TimetableItem[];
  compact?: boolean;
}

const DAYS: { key: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'; label: string }[] = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const COLOR_CLASSES = [
  'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200',
  'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200',
  'bg-violet-100 text-violet-900 border-violet-300 hover:bg-violet-200',
  'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200',
  'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200',
  'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200',
  'bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200',
  'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 hover:bg-fuchsia-200',
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({ items, compact = false }) => {
  const getMinutes = (timeStr: string) => {
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
  };

  const startHour = 8;
  const totalMinutes = 10 * 60; // 08:00 to 18:00 (600 minutes)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row (Days) */}
          <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider text-center py-3">
            <div className="text-slate-400">Time</div>
            {DAYS.map((d) => (
              <div key={d.key}>{d.label}</div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative grid grid-cols-6 divide-x divide-slate-100">
            {/* Time labels column */}
            <div className="flex flex-col">
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot}
                  className="h-16 border-b border-slate-100 px-2 py-1 text-right text-xs font-mono text-slate-400"
                >
                  {slot}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((day) => {
              const dayItems = items.filter((it) => it.dayOfWeek === day.key);

              return (
                <div key={day.key} className="relative h-[640px] border-b border-slate-100">
                  {/* Horizontal hour guidelines */}
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot} className="h-16 border-b border-slate-100 border-dashed" />
                  ))}

                  {/* Absolute positioned course slots */}
                  {dayItems.map((item, idx) => {
                    const startMin = getMinutes(item.startTime);
                    const endMin = getMinutes(item.endTime);
                    const duration = Math.max(30, endMin - startMin);

                    const topOffset = ((startMin - startHour * 60) / totalMinutes) * 640;
                    const height = (duration / totalMinutes) * 640;

                    const colorClass = COLOR_CLASSES[(item.colorIndex ?? idx) % COLOR_CLASSES.length];

                    return (
                      <div
                        key={idx}
                        style={{
                          top: `${Math.max(0, topOffset)}px`,
                          height: `${Math.max(36, height - 4)}px`,
                          left: '4px',
                          right: '4px'
                        }}
                        className={`absolute rounded-xl border p-2 shadow-xs transition-all flex flex-col justify-between overflow-hidden cursor-default ${colorClass}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs leading-tight truncate">
                              {item.courseCode}
                            </span>
                            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-white/70 shadow-2xs font-semibold">
                              {item.sectionCode}
                            </span>
                          </div>
                          {!compact && (
                            <p className="text-[11px] font-medium leading-snug truncate mt-0.5 opacity-90">
                              {item.courseName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] opacity-80 mt-1 font-mono">
                          <span>
                            {item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}
                          </span>
                          {item.room && <span className="font-semibold">{item.room}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
