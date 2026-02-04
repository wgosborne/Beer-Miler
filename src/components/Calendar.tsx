'use client';

import React, { useState } from 'react';
import {
  getCalendarGrid,
  toISODate,
  isPastDate,
  getMonthStart,
  formatDateDisplay,
} from '@/lib/utils';

interface AvailabilityDay {
  date: string;
  allAvailable: boolean;
  unavailableCount: number;
  unavailableUsers: string[];
}

interface CalendarProps {
  year: number;
  month: number;
  availabilities: AvailabilityDay[];
  userAvailability: Record<string, boolean>;
  consensusDates: string[];
  eventLocked: boolean;
  onToggleDate: (date: string, isAvailable: boolean) => Promise<void>;
  loading?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get color class for a date cell based on availability status
 */
function getDateColorClass(
  dateStr: string,
  day: AvailabilityDay | null,
  userAvail: boolean | undefined,
  eventLocked: boolean,
  isPast: boolean
): string {
  // Past dates - dark gray
  if (isPast) {
    return 'bg-gray-700 text-gray-400 cursor-not-allowed';
  }

  // Event locked - darker gray (no interaction)
  if (eventLocked) {
    return 'bg-gray-700 text-gray-500 cursor-not-allowed';
  }

  // If user hasn't marked this date
  if (userAvail === undefined) {
    return 'bg-gray-700 text-gray-300 border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-600';
  }

  // User is available
  if (userAvail) {
    // Consensus date - green
    if (day?.allAvailable) {
      return 'bg-green-600 text-white font-bold cursor-pointer hover:bg-green-700 shadow-lg shadow-green-600/50';
    }
    // User available but not consensus - blue
    return 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-600/30';
  }

  // User is unavailable - red
  return 'bg-red-600 text-white cursor-pointer hover:bg-red-700 shadow-lg shadow-red-600/30';
}

/**
 * Get tooltip text for a date cell
 */
function getDateTooltip(
  day: AvailabilityDay | null,
  userAvail: boolean | undefined,
  isPast: boolean
): string {
  if (!day) return '';
  if (isPast) return 'Past date';

  const parts: string[] = [];

  if (day.allAvailable) {
    parts.push('✓ CONSENSUS - All available');
  } else if (day.unavailableCount > 0) {
    parts.push(`${day.unavailableCount} unavailable: ${day.unavailableUsers.join(', ')}`);
  }

  if (userAvail === true) {
    parts.push('(You: available)');
  } else if (userAvail === false) {
    parts.push('(You: unavailable)');
  } else {
    parts.push('(You: not marked)');
  }

  return parts.join(' ');
}

export const Calendar: React.FC<CalendarProps> = ({
  year,
  month,
  availabilities,
  userAvailability,
  consensusDates,
  eventLocked,
  onToggleDate,
  loading = false,
}) => {
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());

  // Build availability map for quick lookup
  const availabilityMap: Record<string, AvailabilityDay> = {};
  availabilities.forEach((day) => {
    availabilityMap[day.date] = day;
  });

  const grid = getCalendarGrid(year, month);
  const monthStart = getMonthStart(year, month);

  const handleDateClick = async (day: number | null) => {
    if (!day) return;

    const date = new Date(year, month - 1, day);
    const dateStr = toISODate(date);
    const currentAvail = userAvailability[dateStr];

    // Don't allow clicking if locked or past
    if (eventLocked || isPastDate(date)) return;

    setLoadingDates((prev) => new Set(prev).add(dateStr));
    try {
      // Toggle availability
      await onToggleDate(dateStr, currentAvail !== true);
    } finally {
      setLoadingDates((prev) => {
        const next = new Set(prev);
        next.delete(dateStr);
        return next;
      });
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 backdrop-blur-sm p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-white">
        {MONTH_NAMES[month - 1]} {year}
      </h2>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center font-semibold text-purple-400 py-2 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden">{name[0]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {grid.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const cellKey = `${weekIdx}-${dayIdx}`;

            if (!day) {
              return (
                <div key={cellKey} className="bg-transparent rounded p-2"></div>
              );
            }

            const date = new Date(year, month - 1, day);
            const dateStr = toISODate(date);
            const dayData = availabilityMap[dateStr];
            const userAvail = userAvailability[dateStr];
            const isPast = isPastDate(date);
            const isLoading = loadingDates.has(dateStr);

            return (
              <button
                key={cellKey}
                onClick={() => handleDateClick(day)}
                disabled={eventLocked || isPast || loading || isLoading}
                className={`rounded p-1 sm:p-2 text-center font-semibold transition-colors min-h-10 sm:min-h-12 flex items-center justify-center text-xs sm:text-sm ${getDateColorClass(
                  dateStr,
                  dayData,
                  userAvail,
                  eventLocked,
                  isPast
                )} ${isLoading ? 'opacity-50' : ''}`}
                title={getDateTooltip(dayData, userAvail, isPast)}
              >
                <span>{day}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="font-semibold text-white mb-3 text-sm">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Everyone available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>You&apos;re available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>You&apos;re unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 border-2 border-dashed border-gray-500 rounded"></div>
            <span>Not marked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <span>Past date</span>
          </div>
        </div>
      </div>

      {/* Consensus info */}
      {consensusDates.length > 0 && (
        <div className="mt-6 p-3 sm:p-4 bg-green-900 bg-opacity-20 border border-green-600 border-opacity-40 rounded-lg">
          <h3 className="font-semibold text-green-400 mb-2 text-sm">Consensus Dates</h3>
          <p className="text-xs sm:text-sm text-green-300 break-words">
            {consensusDates.map((d) => formatDateDisplay(new Date(d))).join(', ')}
          </p>
        </div>
      )}

      {eventLocked && (
        <div className="mt-4 p-3 sm:p-4 bg-purple-900 bg-opacity-20 border border-purple-600 border-opacity-40 rounded-lg">
          <p className="text-xs sm:text-sm text-purple-300 font-semibold">
            Event date is locked. You cannot change your availability.
          </p>
        </div>
      )}
    </div>
  );
};
