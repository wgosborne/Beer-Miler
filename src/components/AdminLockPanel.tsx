'use client';

import React, { useState } from 'react';
import { toISODate, formatDateDisplay } from '@/lib/utils';

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
      setSuccess(`Event locked for ${formatDateDisplay(new Date(selectedDate))}`);
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
      <div className="bg-primary-50 border border-primary-300 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <span className="text-xl sm:text-2xl">🔒</span>
          <h3 className="text-base sm:text-lg font-bold text-primary-900">Event Locked</h3>
        </div>
        <p className="text-xs sm:text-sm text-primary-800 mb-2">
          The event date has been locked and confirmed.
        </p>
        <p className="font-semibold text-primary-900 text-sm">
          {formatDateDisplay(new Date(lockedDate))}
        </p>
        <p className="text-xs text-primary-700 mt-3">
          Betting is now available. Availability cannot be changed.
        </p>

        <button
          onClick={handleUnlockDate}
          disabled={isUnlocking}
          className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
        >
          {isUnlocking ? 'Unlocking...' : 'Unlock Date'}
        </button>

        <p className="text-xs text-red-600 mt-3">
          ⚠️ Unlocking will allow users to change availability again
        </p>

        {error && (
          <div className="mt-3 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 p-2 sm:p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-xs sm:text-sm">
            {success}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-4">Admin Controls</h3>

      {consensusDates.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4">
          <p className="text-yellow-800 text-xs sm:text-sm">
            No consensus dates. All users must mark the same date as available.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-semibold text-amber-900 mb-3">
            Select a date to lock:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4 p-2 sm:p-3 bg-white border border-amber-200 rounded-lg">
            {consensusDates.map((date) => (
              <label key={date} className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-amber-50 rounded cursor-pointer">
                <input
                  type="radio"
                  name="consensus-date"
                  value={date}
                  checked={selectedDate === date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-xs sm:text-sm text-amber-900">
                  {formatDateDisplay(new Date(date))}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleLockDate}
            disabled={!selectedDate || isLocking || loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            {isLocking ? 'Locking...' : 'Lock Date'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-xs sm:text-sm">
          {success}
        </div>
      )}

      <div className="mt-4 pt-3 sm:pt-4 border-t border-amber-200 text-xs text-amber-700">
        <p>
          <strong>Note:</strong> Locked dates prevent availability changes until unlocked.
        </p>
      </div>
    </div>
  );
};
