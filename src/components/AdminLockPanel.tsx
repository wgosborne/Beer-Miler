'use client';

import React, { useState } from 'react';
import { toISODate, formatDateDisplay, fromISODate } from '@/lib/utils';

interface AdminLockPanelProps {
  consensusDates: string[];
  eventLocked: boolean;
  lockedDate?: string | null;
  onLockDate: (date: string) => Promise<void>;
  onUnlockDate: () => Promise<void>;
  loading?: boolean;
}

export const AdminLockPanel: React.FC<AdminLockPanelProps> = ({
  consensusDates,
  eventLocked,
  lockedDate,
  onLockDate,
  onUnlockDate,
  loading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLocking, setIsLocking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

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
      setSuccess(`Event locked for ${formatDateDisplay(fromISODate(selectedDate))}`);
      setSelectedDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock date');
    } finally {
      setIsLocking(false);
    }
  };

  const handleUnlockDate = async () => {
    setError('');
    setSuccess('');

    setIsUnlocking(true);
    try {
      await onUnlockDate();
      setSuccess('Event date unlocked. Users can now update availability.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock date');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (eventLocked && lockedDate) {
    return (
      <div className="bg-green-900 bg-opacity-20 border border-green-600 border-opacity-40 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-bold text-green-400">Event Confirmed</h3>
        </div>
        <p className="text-xs sm:text-sm text-green-300 mb-2">
          The event date has been locked and confirmed.
        </p>
        <p className="font-semibold text-green-400 text-sm">
          {formatDateDisplay(fromISODate(lockedDate))}
        </p>
        <p className="text-xs text-green-300 mt-3">
          Betting is now available. Availability cannot be changed.
        </p>

        <button
          onClick={handleUnlockDate}
          disabled={isUnlocking}
          className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all text-sm sm:text-base"
        >
          {isUnlocking ? 'Unlocking...' : 'Unlock Date'}
        </button>

        <p className="text-xs text-red-400 mt-3">
          Warning: Unlocking will allow users to change availability again.
        </p>

        {error && (
          <div className="mt-3 p-2 sm:p-3 bg-red-900 bg-opacity-30 border border-red-600 text-red-300 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 p-2 sm:p-3 bg-green-900 bg-opacity-30 border border-green-600 text-green-300 rounded-lg text-xs sm:text-sm">
            {success}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-purple-900 bg-opacity-20 border border-purple-600 border-opacity-40 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
      <h3 className="text-base sm:text-lg font-bold text-purple-300 mb-4">Admin Controls</h3>

      {consensusDates.length === 0 ? (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 border-opacity-40 rounded-lg p-3 mb-4">
          <p className="text-yellow-300 text-xs sm:text-sm">
            No consensus dates yet. All users must mark the same date as available.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-semibold text-purple-300 mb-3">
            Select a date to confirm:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4 p-2 sm:p-3 bg-gray-900 bg-opacity-50 border border-purple-600 border-opacity-30 rounded-lg">
            {consensusDates.map((date) => (
              <label key={date} className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="consensus-date"
                  value={date}
                  checked={selectedDate === date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-4 h-4 text-purple-500"
                />
                <span className="text-xs sm:text-sm text-purple-300">
                  {formatDateDisplay(fromISODate(date))}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleLockDate}
            disabled={!selectedDate || isLocking || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-900 disabled:to-purple-900 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            {isLocking ? 'Confirming...' : 'Confirm Date'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-900 bg-opacity-30 border border-red-600 text-red-300 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-900 bg-opacity-30 border border-green-600 text-green-300 rounded-lg text-xs sm:text-sm">
          {success}
        </div>
      )}

      <div className="mt-4 pt-3 sm:pt-4 border-t border-purple-600 border-opacity-30 text-xs text-purple-300">
        <p>
          <strong>Note:</strong> Confirmed dates lock in the event date and prevent availability changes.
        </p>
      </div>
    </div>
  );
};
