'use client';

import React, { useState } from 'react';
import { toISODate, formatDateDisplay } from '@/lib/utils';

interface AdminLockPanelProps {
  consensusDates: string[];
  eventLocked: boolean;
  lockedDate?: string | null;
  onLockDate: (date: string) => Promise<void>;
  loading?: boolean;
}

export const AdminLockPanel: React.FC<AdminLockPanelProps> = ({
  consensusDates,
  eventLocked,
  lockedDate,
  onLockDate,
  loading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLocking, setIsLocking] = useState(false);

  const handleLockDate = async () => {
    setError('');
    setSuccess('');

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setIsLocking(true);
    try {
      await onLockDate(selectedDate);
      setSuccess(`Event locked for ${formatDateDisplay(new Date(selectedDate))}`);
      setSelectedDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock date');
    } finally {
      setIsLocking(false);
    }
  };

  if (eventLocked && lockedDate) {
    return (
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🔒</span>
          <h3 className="text-lg font-bold text-blue-900">Event Date Locked</h3>
        </div>
        <p className="text-blue-800 mb-2">
          The event date has been locked and confirmed.
        </p>
        <p className="font-semibold text-blue-900">
          📅 Scheduled for: {formatDateDisplay(new Date(lockedDate))}
        </p>
        <p className="text-sm text-blue-700 mt-3">
          Users can now begin placing bets. Availability cannot be changed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
      <h3 className="text-lg font-bold text-amber-900 mb-4">Admin: Lock Event Date</h3>

      {consensusDates.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 rounded p-3 mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠ No consensus dates available. All users must mark the same date as available before you can lock it.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-amber-900 mb-2">
            Select a consensus date to lock:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4 p-3 bg-white border border-amber-200 rounded">
            {consensusDates.map((date) => (
              <label key={date} className="flex items-center gap-3 p-2 hover:bg-amber-100 rounded cursor-pointer">
                <input
                  type="radio"
                  name="consensus-date"
                  value={date}
                  checked={selectedDate === date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-amber-900">
                  {formatDateDisplay(new Date(date))}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleLockDate}
            disabled={!selectedDate || isLocking || loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isLocking ? 'Locking...' : 'Lock Event Date'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          ✓ {success}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-amber-200 text-xs text-amber-700">
        <p>
          <strong>Note:</strong> Once locked, the event date cannot be changed. Users will be able to place bets.
        </p>
      </div>
    </div>
  );
};
