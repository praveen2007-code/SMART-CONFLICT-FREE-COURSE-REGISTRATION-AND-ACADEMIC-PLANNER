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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>🟢 Available</span>
        {showCount && (
          <span className="font-mono text-emerald-700 font-bold">
            ({available}{capacity ? `/${capacity}` : ''})
          </span>
        )}
      </span>
    );
  }

  if (status === 'ALMOST_FULL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>🟡 Almost Full</span>
        {showCount && (
          <span className="font-mono text-amber-700 font-bold">
            ({available} left)
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100/80 text-rose-800 border border-rose-200">
      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
      <span>🔴 Full</span>
      {showCount && (
        <span className="font-mono text-rose-700 font-bold">
          (0 seats)
        </span>
      )}
    </span>
  );
};
