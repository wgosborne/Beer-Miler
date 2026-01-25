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
    return 'bg-gray-400 text-white cursor-not-allowed';
  }

  // Event locked - lighter gray (no interaction)
  if (eventLocked) {
    return 'bg-gray-300 text-gray-700 cursor-not-allowed';
  }

  // If user hasn't marked this date
  if (userAvail === undefined) {
    return 'bg-gray-100 text-gray-700 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200';
  }

  // User is available
  if (userAvail) {
    // Consensus date - green
    if (day?.allAvailable) {
      return 'bg-green-500 text-white font-bold cursor-pointer hover:bg-green-600';
    }
    // User available but not consensus - light blue
    return 'bg-blue-300 text-white cursor-pointer hover:bg-blue-400';
  }

  // User is unavailable - light red
  return 'bg-red-300 text-white cursor-pointer hover:bg-red-400';
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {MONTH_NAMES[month - 1]} {year}
      </h2>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center font-semibold text-gray-700 py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {grid.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const cellKey = `${weekIdx}-${dayIdx}`;

            if (!day) {
              return (
                <div key={cellKey} className="bg-white rounded p-2"></div>
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
                className={`rounded p-2 text-center font-semibold transition-colors min-h-12 flex items-center justify-center ${getDateColorClass(
                  dateStr,
                  dayData,
                  userAvail,
                  eventLocked,
                  isPast
                )} ${isLoading ? 'opacity-50' : ''}`}
                title={getDateTooltip(dayData, userAvail, isPast)}
              >
                <span className="text-sm">{day}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Consensus (all available)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <span>You available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-300 rounded"></div>
            <span>You unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded"></div>
            <span>Not marked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Past date</span>
          </div>
        </div>
      </div>

      {/* Consensus info */}
      {consensusDates.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-900 mb-2">Available Dates (Green)</h3>
          <p className="text-sm text-green-800">
            {consensusDates.map((d) => formatDateDisplay(new Date(d))).join(', ')}
          </p>
        </div>
      )}

      {eventLocked && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-900 font-semibold">
            ✓ Event date is locked. Availability cannot be changed.
          </p>
        </div>
      )}
    </div>
  );
};
