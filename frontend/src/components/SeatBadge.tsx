import React from 'react';
import { SeatStatus } from '../types';

interface SeatBadgeProps {
  status: SeatStatus;
  available: number;
  capacity?: number;
  showCount?: boolean;
}

export const SeatBadge: React.FC<SeatBadgeProps> = ({
  status,
  available,
  capacity,
  showCount = true
}) => {
  if (status === 'AVAILABLE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        <span>Available</span>
        {showCount && (
          <span className="font-mono text-emerald-800 font-bold ml-0.5">
            ({available})
          </span>
        )}
      </span>
    );
  }

  if (status === 'ALMOST_FULL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
        <span>Almost Full</span>
        {showCount && (
          <span className="font-mono text-amber-800 font-bold ml-0.5">
            ({available} left)
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shrink-0 whitespace-nowrap">
      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
      <span>Full</span>
      {showCount && (
        <span className="font-mono text-rose-800 font-bold ml-0.5">
          (0)
        </span>
      )}
    </span>
  );
};
