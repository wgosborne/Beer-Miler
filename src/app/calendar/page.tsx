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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📅 Beer Mile Calendar
          </h1>
          <p className="text-gray-600">
            Mark your availability and help us find a date that works for everyone!
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Event status */}
        {eventData && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Event:</strong> {eventData.name}
              {eventData.scheduledDate ? (
                <span className="ml-2 text-green-600 font-semibold">
                  ✓ Scheduled for {new Date(eventData.scheduledDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="ml-2 text-amber-600">Awaiting date consensus...</span>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <div className="space-y-6">
            {session.user.role === 'admin' && calendarData && (
              <AdminLockPanel
                consensusDates={calendarData.consensusDates}
                eventLocked={calendarData.eventLocked}
                lockedDate={eventData?.scheduledDate}
                onLockDate={handleLockDate}
                loading={loading}
              />
            )}

            {/* Info panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">How it Works</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>1. Mark Availability:</strong> Click on dates to mark yourself as available or unavailable.
                </p>
                <p>
                  <strong>2. Consensus Building:</strong> Green dates show when everyone is available.
                </p>
                <p>
                  <strong>3. Admin Locks Date:</strong> Once consensus is reached, the admin locks the event date.
                </p>
                <p>
                  <strong>4. Ready to Bet:</strong> After the date is locked, betting becomes available!
                </p>
              </div>
            </div>

            {/* Your availability */}
            {calendarData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Your Availability</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong className="text-green-600">Available:</strong>{' '}
                    {Object.values(calendarData.userAvailability).filter((v) => v === true).length} dates
                  </p>
                  <p>
                    <strong className="text-red-600">Unavailable:</strong>{' '}
                    {Object.values(calendarData.userAvailability).filter((v) => v === false).length} dates
                  </p>
                  <p>
                    <strong className="text-gray-600">Not Marked:</strong>{' '}
                    {
                      Object.values(calendarData.userAvailability).filter((v) => v === undefined)
                        .length
                    } dates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ← Previous Month
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Next Month →
          </button>
        </div>
      </div>
    </div>
  );
}
