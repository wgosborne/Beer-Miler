'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/Calendar';
import { AdminLockPanel } from '@/components/AdminLockPanel';
import { Spinner } from '@/components/Spinner';

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
    return <Spinner fullScreen size="lg" variant="default" />;
  }

  if (!session?.user) {
    return null;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-4 sm:py-8">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Mark Your Availability
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Select dates you can attend Annie&apos;s beer mile
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900 bg-opacity-30 border border-red-600 text-red-200 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Event status */}
        {eventData && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg backdrop-blur-sm">
            <p className="text-xs sm:text-sm text-gray-200">
              <span className="text-purple-400 font-semibold">Event Status:</span> {eventData.name}
              {eventData.scheduledDate ? (
                <span className="block sm:inline sm:ml-2 text-green-400 font-semibold mt-1 sm:mt-0">
                  Confirmed for {new Date(eventData.scheduledDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="block sm:inline sm:ml-2 text-yellow-400 mt-1 sm:mt-0">
                  Awaiting consensus...
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
              <div className="bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 p-4 sm:p-6 backdrop-blur-sm">
                <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">
                  Your Status
                </h3>
                <div className="text-xs sm:text-sm text-gray-200 space-y-2 sm:space-y-3">
                  <div className="flex justify-between p-2 sm:p-3 bg-green-900 bg-opacity-20 border border-green-700 border-opacity-40 rounded">
                    <span className="text-gray-300">Available:</span>
                    <strong className="text-green-400">{Object.values(calendarData.userAvailability).filter((v) => v === true).length}</strong>
                  </div>
                  <div className="flex justify-between p-2 sm:p-3 bg-red-900 bg-opacity-20 border border-red-700 border-opacity-40 rounded">
                    <span className="text-gray-300">Unavailable:</span>
                    <strong className="text-red-400">{Object.values(calendarData.userAvailability).filter((v) => v === false).length}</strong>
                  </div>
                  <div className="flex justify-between p-2 sm:p-3 bg-gray-700 bg-opacity-30 border border-gray-600 border-opacity-40 rounded">
                    <span className="text-gray-300">Not marked:</span>
                    <strong className="text-gray-400">{Object.values(calendarData.userAvailability).filter((v) => v === undefined).length}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Info panel */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg border border-purple-500 border-opacity-30 p-4 sm:p-6 backdrop-blur-sm">
              <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">
                How It Works
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-300">
                <p><span className="text-purple-400 font-semibold">1. Mark:</span> Click dates to show availability.</p>
                <p><span className="text-purple-400 font-semibold">2. Consensus:</span> Green dates = everyone available.</p>
                <p><span className="text-purple-400 font-semibold">3. Lock:</span> Admin confirms the final date.</p>
                <p><span className="text-purple-400 font-semibold">4. Bet:</span> Place your bets once locked.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            Previous
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            Today
          </button>

          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
