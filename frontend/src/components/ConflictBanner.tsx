import React from 'react';
import { ScheduleConflict } from '../types';
import { CheckCircle2, AlertOctagon, ArrowRight, Sparkles } from 'lucide-react';

interface ConflictBannerProps {
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
  onApplyAlternative?: (alt: NonNullable<ScheduleConflict['suggestedAlternative']>) => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  hasConflicts,
  conflicts,
  onApplyAlternative
}) => {
  if (!hasConflicts || conflicts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-emerald-900 font-semibold text-sm">Schedule Status</h4>
          <p className="text-emerald-700 text-sm font-medium">✓ No conflicts detected in selected courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
          <h4 className="text-rose-900 font-bold text-sm uppercase tracking-wide">
            Schedule Conflict Detected
          </h4>
        </div>

        <div className="space-y-3">
          {conflicts.map((conflict, idx) => (
            <div key={idx} className="bg-white/80 rounded-lg p-3 border border-rose-100 shadow-sm space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-rose-50/60 border border-rose-200/60">
                  <span className="font-semibold text-slate-700 block">
                    {conflict.course1.code} ({conflict.course1.section})
                  </span>
                  <span className="text-rose-700 font-mono font-medium">
                    {conflict.course1.day} {conflict.course1.time}
                  </span>
                </div>
                <div className="p-2 rounded bg-rose-50/60 border border-rose-200/60">
                  <span className="font-semibold text-slate-700 block">
                    {conflict.course2.code} ({conflict.course2.section})
                  </span>
                  <span className="text-rose-700 font-mono font-medium">
                    {conflict.course2.day} {conflict.course2.time}
                  </span>
                </div>
              </div>

              {conflict.suggestedAlternative && (
                <div className="mt-3 pt-3 border-t border-slate-100 bg-indigo-50/70 p-3 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                          Suggested Alternative
                        </span>
                        <p className="text-xs text-indigo-950 font-medium mt-0.5">
                          {conflict.suggestedAlternative.courseCode} – Section {conflict.suggestedAlternative.sectionCode}
                        </p>
                        <p className="text-xs text-indigo-700 font-mono">
                          {conflict.suggestedAlternative.time}
                        </p>
                        <p className="text-xs text-emerald-700 font-semibold mt-1">
                          🟢 Seats Available: {conflict.suggestedAlternative.availableSeats}
                        </p>
                      </div>
                    </div>

                    {onApplyAlternative && (
                      <button
                        type="button"
                        onClick={() => onApplyAlternative(conflict.suggestedAlternative!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <span>Apply Alternative</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
