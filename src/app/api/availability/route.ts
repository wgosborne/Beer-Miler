import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toISODate, getMonthStart, getMonthEnd, isPastDate, isOutof3MonthWindow } from '@/lib/utils';
import { AvailabilityUpdateSchema } from '@/lib/validation';

interface AvailabilityDay {
  date: string;
  allAvailable: boolean;
  unavailableCount: number;
  unavailableUsers: string[];
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'User must be logged in to view availability',
          },
        },
        { status: 401 }
      );
    }

    // Get month parameter (defaults to current month)
    const monthParam = req.nextUrl.searchParams.get('month');
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;

    if (monthParam) {
      const [y, m] = monthParam.split('-').map(Number);
      if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid month parameter. Use YYYY-MM format.',
            },
          },
          { status: 400 }
        );
      }
      year = y;
      month = m;
    }

    // Get event
    const event = await prisma.event.findFirst({
      where: { id: process.env.EVENT_ID || 'event-1' },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Event not found',
          },
        },
        { status: 404 }
      );
    }

    // Get all users count for consensus calculation
    const allUsers = await prisma.user.findMany({
      select: { id: true, username: true },
    });

    const monthStart = getMonthStart(year, month);
    const monthEnd = getMonthEnd(year, month);

    // Get all availability records for the month
    const availabilities = await prisma.availability.findMany({
      where: {
        eventId: event.id,
        calendarDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: { user: { select: { id: true, username: true } } },
    });

    // Build calendar grid for the month
    const daysInMonth = monthEnd.getDate();
    const calendarData: Record<string, AvailabilityDay> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Find all availability records for this date
      const dayAvailabilities = availabilities.filter(
        (a) => toISODate(new Date(a.calendarDate)) === dateStr
      );

      // Users who are NOT available (marked as unavailable)
      const unavailableUsers = dayAvailabilities
        .filter((a) => !a.isAvailable)
        .map((a) => a.user.username);

      // All users available if all have marked as available OR (all users tracked and all marked available)
      const allAvailable =
        dayAvailabilities.length === allUsers.length &&
        dayAvailabilities.every((a) => a.isAvailable);

      calendarData[dateStr] = {
        date: dateStr,
        allAvailable,
        unavailableCount: unavailableUsers.length,
        unavailableUsers,
      };
    }

    // Get current user's availability for this month
    const userAvailability = await prisma.availability.findMany({
      where: {
        userId: session.user.id,
        eventId: event.id,
        calendarDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const userAvailabilityMap: Record<string, boolean> = {};
    userAvailability.forEach((a) => {
      const dateStr = toISODate(new Date(a.calendarDate));
      userAvailabilityMap[dateStr] = a.isAvailable;
    });

    // Find consensus dates (all available)
    const consensusDates = Object.entries(calendarData)
      .filter(([_, day]) => day.allAvailable && !isPastDate(new Date(day.date)))
      .map(([dateStr, _]) => dateStr);

    return NextResponse.json(
      {
        eventId: event.id,
        eventLocked: event.scheduledDate !== null,
        month: `${year}-${String(month).padStart(2, '0')}`,
        availabilities: Object.values(calendarData),
        userAvailability: userAvailabilityMap,
        consensusDates,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'User must be logged in to update availability',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = AvailabilityUpdateSchema.parse(body);

    // Get event
    const event = await prisma.event.findFirst({
      where: { id: process.env.EVENT_ID || 'event-1' },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Event not found',
          },
        },
        { status: 404 }
      );
    }

    // Check if event is locked
    if (event.scheduledDate !== null) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Event is locked; cannot modify availability',
          },
        },
        { status: 409 }
      );
    }

    // Validate each date
    const updateData = validatedData.updates;
    for (const update of updateData) {
      const updateDate = new Date(update.date + 'T00:00:00Z');

      // Check if date is in the past
      if (isPastDate(updateDate)) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Cannot update availability for past dates: ${update.date}`,
            },
          },
          { status: 400 }
        );
      }

      // Check if date is beyond 3 months
      if (isOutof3MonthWindow(updateDate)) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Cannot update availability more than 3 months in the future: ${update.date}`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Update or create availability records
    const results = await Promise.all(
      updateData.map(async (update) => {
        const updateDate = new Date(update.date + 'T00:00:00Z');
        return prisma.availability.upsert({
          where: {
            userId_eventId_calendarDate: {
              userId: session.user.id,
              eventId: event.id,
              calendarDate: updateDate,
            },
          },
          update: {
            isAvailable: update.isAvailable,
          },
          create: {
            userId: session.user.id,
            eventId: event.id,
            calendarDate: updateDate,
            isAvailable: update.isAvailable,
          },
        });
      })
    );

    return NextResponse.json(
      {
        updated: results.length,
        message: 'Availability updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error('[API Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
