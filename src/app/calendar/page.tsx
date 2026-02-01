'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/Calendar';
import { AdminLockPanel } from '@/components/AdminLockPanel';

interface AvailabilityDay {
  date: string;
  allAvailable: boolean;
  unavailableCount: number;
  unavailableUsers: string[];
}

interface CalendarData {
  eventId: string;
  eventLocked: boolean;
  month: string;
  availabilities: AvailabilityDay[];
  userAvailability: Record<string, boolean>;
  consensusDates: string[];
}

interface EventData {
  id: string;
  name: string;
  status: string;
  scheduledDate: string | null;
  lockedAt: string | null;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch calendar and event data
  useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const monthStr = `${currentMonth.getFullYear()}-${String(
          currentMonth.getMonth() + 1
        ).padStart(2, '0')}`;

        const [calRes, eventRes] = await Promise.all([
          fetch(`/api/availability?month=${monthStr}`),
          fetch('/api/event/current'),
        ]);

        if (!calRes.ok) {
          throw new Error('Failed to fetch availability data');
        }
        if (!eventRes.ok) {
          throw new Error('Failed to fetch event data');
        }

        const cal = await calRes.json();
        const evt = await eventRes.json();

        setCalendarData(cal);
        setEventData(evt);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, currentMonth]);

  const handleToggleDate = async (date: string, isAvailable: boolean) => {
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ date, isAvailable }],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to update availability');
      }

      // Refresh calendar data
      const monthStr = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1
      ).padStart(2, '0')}`;

      const calRes = await fetch(`/api/availability?month=${monthStr}`);
      const cal = await calRes.json();
      setCalendarData(cal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    }
  };

  const handleLockDate = async (date: string) => {
    try {
      const res = await fetch('/api/admin/lock-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledDate: date }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to lock date');
      }

      // Refresh event data and calendar
      const eventRes = await fetch('/api/event/current');
      const evt = await eventRes.json();
      setEventData(evt);

      const monthStr = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1
      ).padStart(2, '0')}`;
      const calRes = await fetch(`/api/availability?month=${monthStr}`);
      const cal = await calRes.json();
      setCalendarData(cal);
    } catch (err) {
      throw err; // Let AdminLockPanel handle the error display
    }
  };

  const handleUnlockDate = async () => {
    try {
      const res = await fetch('/api/admin/unlock-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to unlock date');
      }

      // Refresh event data and calendar
      const eventRes = await fetch('/api/event/current');
      const evt = await eventRes.json();
      setEventData(evt);

      const monthStr = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1
      ).padStart(2, '0')}`;
      const calRes = await fetch(`/api/availability?month=${monthStr}`);
      const cal = await calRes.json();
      setCalendarData(cal);
    } catch (err) {
      throw err; // Let AdminLockPanel handle the error display
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-4 sm:py-8">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-1">
            📅 Calendar
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Mark your availability for Annie's beer mile
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Event status */}
        {eventData && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white border border-primary-200 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong className="text-primary-900">Event:</strong> {eventData.name}
              {eventData.scheduledDate ? (
                <span className="block sm:inline sm:ml-2 text-primary-600 font-semibold mt-1 sm:mt-0">
                  Locked for {new Date(eventData.scheduledDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="block sm:inline sm:ml-2 text-amber-600 mt-1 sm:mt-0">
                  Waiting for consensus...
                </span>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {calendarData && (
              <Calendar
                year={year}
                month={month}
                availabilities={calendarData.availabilities}
                userAvailability={calendarData.userAvailability}
                consensusDates={calendarData.consensusDates}
                eventLocked={calendarData.eventLocked}
                onToggleDate={handleToggleDate}
                loading={loading}
              />
            )}
          </div>

          {/* Sidebar with admin panel or info */}
          <div className="space-y-4 sm:space-y-6">
            {session.user.role === 'admin' && calendarData && (
              <AdminLockPanel
                consensusDates={calendarData.consensusDates}
                eventLocked={calendarData.eventLocked}
                lockedDate={eventData?.scheduledDate}
                onLockDate={handleLockDate}
                onUnlockDate={handleUnlockDate}
                loading={loading}
              />
            )}

            {/* Your availability */}
            {calendarData && (
              <div className="bg-white rounded-lg border border-primary-200 p-4 sm:p-6 shadow-sm">
                <h3 className="text-sm sm:text-base font-bold text-primary-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <span>✓</span> Your Status
                </h3>
                <div className="text-xs sm:text-sm text-gray-700 space-y-2 sm:space-y-3">
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span>Available:</span>
                    <strong className="text-green-700">{Object.values(calendarData.userAvailability).filter((v) => v === true).length}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span>Unavailable:</span>
                    <strong className="text-red-700">{Object.values(calendarData.userAvailability).filter((v) => v === false).length}</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Not marked:</span>
                    <strong className="text-gray-700">{Object.values(calendarData.userAvailability).filter((v) => v === undefined).length}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Info panel */}
            <div className="bg-primary-50 rounded-lg border border-primary-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-sm sm:text-base font-bold text-primary-900 mb-3 sm:mb-4 flex items-center gap-2">
                <span>🎯</span> How It Works
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                <p><strong>1. Mark:</strong> Click dates to show availability.</p>
                <p><strong>2. Consensus:</strong> Green = everyone available.</p>
                <p><strong>3. Lock:</strong> Admin locks the final date.</p>
                <p><strong>4. Bet:</strong> Place your bets after lock.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
          >
            Previous
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
          >
            Today
          </button>

          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
