import React from 'react';
import { BookOpen, Coffee, Utensils, Clock, MapPin, Sparkles } from 'lucide-react';

export interface TimetableItem {
  courseCode: string;
  courseName: string;
  sectionCode: string;
  room?: string;
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  startTime: string; // e.g. "09:00" or "9:00 AM"
  endTime: string;   // e.g. "10:00" or "10:00 AM"
  colorIndex?: number;
  isLibrary?: boolean;
}

interface TimetableGridProps {
  items: TimetableItem[];
  compact?: boolean;
  studentSeed?: string | number;
  showLibraryPeriod?: boolean;
}

export interface TimetablePeriod {
  id: string;
  name: string;
  timeLabel: string;
  startMinutes: number;
  endMinutes: number;
  isBreak?: boolean;
  breakType?: 'short' | 'lunch';
  breakLabel?: string;
  breakEmoji?: string;
}

export const DAYS: { key: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'; label: string; short: string }[] = [
  { key: 'MON', label: 'Monday', short: 'Mon' },
  { key: 'TUE', label: 'Tuesday', short: 'Tue' },
  { key: 'WED', label: 'Wednesday', short: 'Wed' },
  { key: 'THU', label: 'Thursday', short: 'Thu' },
  { key: 'FRI', label: 'Friday', short: 'Fri' },
];

export const TIMETABLE_PERIODS: TimetablePeriod[] = [
  {
    id: 'hour-1',
    name: 'Hour 1',
    timeLabel: '9:00 AM – 10:00 AM',
    startMinutes: 9 * 60,       // 540
    endMinutes: 10 * 60,        // 600
  },
  {
    id: 'hour-2',
    name: 'Hour 2',
    timeLabel: '10:00 AM – 11:00 AM',
    startMinutes: 10 * 60,      // 600
    endMinutes: 11 * 60,        // 660
  },
  {
    id: 'break-short',
    name: '☕ Short Break',
    timeLabel: '11:00 AM – 11:10 AM',
    startMinutes: 11 * 60,      // 660
    endMinutes: 11 * 60 + 10,   // 670
    isBreak: true,
    breakType: 'short',
    breakLabel: 'Morning Refreshment & Tea Break (10 mins)',
    breakEmoji: '☕'
  },
  {
    id: 'hour-3',
    name: 'Hour 3',
    timeLabel: '11:10 AM – 12:10 PM',
    startMinutes: 11 * 60 + 10, // 670
    endMinutes: 12 * 60 + 10,   // 730
  },
  {
    id: 'break-lunch',
    name: '🍱 Lunch Break',
    timeLabel: '12:10 PM – 1:00 PM',
    startMinutes: 12 * 60 + 10, // 730
    endMinutes: 13 * 60,        // 780
    isBreak: true,
    breakType: 'lunch',
    breakLabel: 'Midday Lunch Break & Campus Dining (50 mins)',
    breakEmoji: '🍱'
  },
  {
    id: 'hour-4',
    name: 'Hour 4',
    timeLabel: '1:00 PM – 2:00 PM',
    startMinutes: 13 * 60,      // 780
    endMinutes: 14 * 60,        // 840
  },
  {
    id: 'hour-5',
    name: 'Hour 5',
    timeLabel: '2:00 PM – 3:00 PM',
    startMinutes: 14 * 60,      // 840
    endMinutes: 15 * 60,        // 900
  }
];

const COLOR_CLASSES = [
  'bg-blue-50/90 text-blue-950 border-blue-200/90 hover:bg-blue-100/90',
  'bg-indigo-50/90 text-indigo-950 border-indigo-200/90 hover:bg-indigo-100/90',
  'bg-violet-50/90 text-violet-950 border-violet-200/90 hover:bg-violet-100/90',
  'bg-sky-50/90 text-sky-950 border-sky-200/90 hover:bg-sky-100/90',
  'bg-purple-50/90 text-purple-950 border-purple-200/90 hover:bg-purple-100/90',
  'bg-amber-50/90 text-amber-950 border-amber-200/90 hover:bg-amber-100/90',
  'bg-rose-50/90 text-rose-950 border-rose-200/90 hover:bg-rose-100/90',
  'bg-cyan-50/90 text-cyan-950 border-cyan-200/90 hover:bg-cyan-100/90',
];

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  // Handle "9:00 AM", "11:10 PM", or "09:00", "13:00:00"
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  let h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  items,
  compact = false,
  studentSeed = 'default_student_seed',
  showLibraryPeriod = true
}) => {
  // Check if a timetable item overlaps with a period
  const matchItemToPeriod = (item: TimetableItem, period: TimetablePeriod) => {
    const itemStart = parseTimeToMinutes(item.startTime);
    const itemEnd = parseTimeToMinutes(item.endTime);
    // Overlap: itemStart < period.endMinutes && period.startMinutes < itemEnd
    return itemStart < period.endMinutes && period.startMinutes < itemEnd;
  };

  // Find all occupied (day, period) slots
  const occupiedSlots = new Set<string>();
  items.forEach((item) => {
    TIMETABLE_PERIODS.filter((p) => !p.isBreak).forEach((period) => {
      if (matchItemToPeriod(item, period)) {
        occupiedSlots.add(`${item.dayOfWeek}_${period.id}`);
      }
    });
  });

  // Assign one random Library Period per week (guaranteed not to clash with any enrolled classes)
  let libraryItem: TimetableItem | null = null;
  const existingLibraryItem = items.find((it) => it.isLibrary || it.courseCode === 'LIBRARY');

  if (existingLibraryItem) {
    libraryItem = existingLibraryItem;
  } else if (showLibraryPeriod) {
    // Generate candidates from all non-break periods
    const candidateSlots: { day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'; period: TimetablePeriod }[] = [];
    DAYS.forEach((d) => {
      TIMETABLE_PERIODS.filter((p) => !p.isBreak).forEach((period) => {
        const slotKey = `${d.key}_${period.id}`;
        if (!occupiedSlots.has(slotKey)) {
          candidateSlots.push({ day: d.key, period });
        }
      });
    });

    if (candidateSlots.length > 0) {
      // Prefer Wednesday Hour 4 (matches college timetable 'LIB' period) if available
      const wedSlot = candidateSlots.find((c) => c.day === 'WED' && c.period.id === 'hour-4');
      let chosen = wedSlot;

      if (!chosen) {
        // Fallback to deterministic hash based on studentSeed
        const strSeed = String(studentSeed);
        let hash = 0;
        for (let i = 0; i < strSeed.length; i++) {
          hash = (hash << 5) - hash + strSeed.charCodeAt(i);
          hash |= 0;
        }
        const chosenIdx = Math.abs(hash) % candidateSlots.length;
        chosen = candidateSlots[chosenIdx];
      }

      libraryItem = {
        courseCode: 'LIBRARY',
        courseName: 'Library & Digital Resource Hour',
        sectionCode: 'LIB',
        room: 'Central Library, 2nd Floor',
        dayOfWeek: chosen.day,
        startTime: chosen.period.timeLabel.split(' – ')[0],
        endTime: chosen.period.timeLabel.split(' – ')[1],
        isLibrary: true
      };
    }
  }

  // Combine items including libraryItem
  const allItems = [...items];
  if (libraryItem && !allItems.some((it) => it.isLibrary || it.courseCode === 'LIBRARY')) {
    allItems.push(libraryItem);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Legend / Info Bar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Clock className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Official Bell Schedule • 5 Instructional Hours + 2 Scheduled Breaks</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span>Lecture Course</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
            <span className="font-semibold text-teal-800">📚 Library Period</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>☕ Short Break (10m)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>🍱 Lunch Break (50m)</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[620px] sm:min-w-[700px] border-collapse text-left text-xs">
          {/* Day Headers */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700">
              <th className="py-2.5 px-3 w-28 sm:w-36 font-black uppercase tracking-wider text-[11px] text-slate-600 border-r border-slate-200/80">
                Time / Schedule
              </th>
              {DAYS.map((d) => (
                <th
                  key={d.key}
                  className="py-2.5 px-2 text-center font-bold uppercase tracking-wider text-xs border-r last:border-r-0 border-slate-200/80"
                >
                  <span className="block text-slate-800">{d.label}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {TIMETABLE_PERIODS.map((period) => {
              // Break Row (Spanning all days)
              if (period.isBreak) {
                const isShort = period.breakType === 'short';
                return (
                  <tr
                    key={period.id}
                    className={
                      isShort
                        ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-y border-amber-200/70'
                        : 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-y border-emerald-200/70'
                    }
                  >
                    <td
                      className={`py-2 px-4 font-mono font-bold text-xs border-r ${
                        isShort
                          ? 'border-amber-200/70 text-amber-900 bg-amber-100/50'
                          : 'border-emerald-200/70 text-emerald-900 bg-emerald-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isShort ? <Coffee className="w-3.5 h-3.5 text-amber-700 shrink-0" /> : <Utensils className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                        <span className="truncate">{period.name}</span>
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5">{period.timeLabel}</div>
                    </td>
                    <td colSpan={5} className="py-2.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                        <span className="text-base">{period.breakEmoji}</span>
                        <span className={isShort ? 'text-amber-900 font-bold tracking-wide' : 'text-emerald-900 font-bold tracking-wide'}>
                          {period.breakLabel}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isShort ? 'bg-amber-200/70 text-amber-950' : 'bg-emerald-200/70 text-emerald-950'
                        }`}>
                          Recess
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }

              // Standard Instructional Hour Row
              return (
                <tr key={period.id} className="hover:bg-slate-50/40 transition-colors">
                  {/* Period Time Column */}
                  <td className="py-3 px-4 bg-slate-50/60 border-r border-slate-200/80 align-middle">
                    <div className="font-black text-slate-800 text-xs tracking-tight flex items-center gap-1.5">
                      <span>{period.name}</span>
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-brand-700 mt-0.5">
                      {period.timeLabel}
                    </div>
                  </td>

                  {/* Day Columns */}
                  {DAYS.map((d) => {
                    const matchedItems = allItems.filter(
                      (item) => item.dayOfWeek === d.key && matchItemToPeriod(item, period)
                    );

                    return (
                      <td
                        key={d.key}
                        className="p-1.5 border-r last:border-r-0 border-slate-200/70 align-top h-24 min-w-[95px] sm:min-w-[110px]"
                      >
                        {matchedItems.length === 0 ? (
                          <div className="h-full rounded-xl border border-dashed border-slate-200/60 bg-slate-50/20 flex items-center justify-center text-[10px] text-slate-400 font-medium hover:bg-slate-50/70 transition-colors">
                            <span>Self-Study / Elective</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 h-full">
                            {matchedItems.map((item, idx) => {
                              // Special Library Period Card
                              if (item.isLibrary || item.courseCode === 'LIBRARY') {
                                return (
                                  <div
                                    key={idx}
                                    className="h-full rounded-xl p-2.5 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-300/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-black px-1.5 py-0.5 rounded bg-teal-600 text-white shadow-2xs">
                                          <BookOpen className="w-3 h-3" />
                                          <span>LIBRARY</span>
                                        </span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                                          Weekly
                                        </span>
                                      </div>
                                      <p className="font-bold text-[11px] text-teal-950 leading-tight">
                                        {item.courseName}
                                      </p>
                                    </div>
                                    <div className="pt-1.5 flex items-center justify-between text-[10px] text-teal-800/80 font-medium">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                        <span className="truncate">{item.room || 'Central Library'}</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              }

                              // Regular Registered Course Card
                              const colorClass = COLOR_CLASSES[(item.colorIndex ?? idx) % COLOR_CLASSES.length];
                              return (
                                <div
                                  key={idx}
                                  className={`h-full rounded-xl p-2.5 border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${colorClass}`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="font-mono text-xs font-black tracking-tight">
                                        {item.courseCode}
                                      </span>
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/90 shadow-2xs text-slate-800">
                                        {item.sectionCode}
                                      </span>
                                    </div>
                                    {!compact && (
                                      <p className="font-semibold text-[11px] leading-snug line-clamp-2 opacity-95">
                                        {item.courseName}
                                      </p>
                                    )}
                                  </div>

                                  <div className="pt-1.5 flex items-center justify-between text-[10px] font-medium opacity-80">
                                    {item.room && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="truncate">{item.room}</span>
                                      </span>
                                    )}
                                    <span className="font-mono text-[9px] uppercase tracking-wider ml-auto">
                                      {item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
