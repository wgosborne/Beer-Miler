import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toISODate, isPastDate } from '@/lib/utils';
import { LockDateSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'User must be logged in to lock event date',
          },
        },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Only admins can lock event dates',
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = LockDateSchema.parse(body);

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

    // Check if event is already locked
    if (event.scheduledDate !== null) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Event is already locked',
          },
        },
        { status: 409 }
      );
    }

    // Validate the proposed date is not in the past
    const proposedDate = new Date(validatedData.scheduledDate + 'T00:00:00Z');
    if (isPastDate(proposedDate)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot lock event date in the past',
          },
        },
        { status: 400 }
      );
    }

    // Verify consensus: all users must be available on this date
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    const availabilityOnDate = await prisma.availability.findMany({
      where: {
        eventId: event.id,
        calendarDate: proposedDate,
      },
    });

    // Check if ALL users are available
    const availableUserIds = new Set(
      availabilityOnDate
        .filter((a) => a.isAvailable)
        .map((a) => a.userId)
    );

    const hasConsensus =
      allUsers.length > 0 &&
      availableUserIds.size === allUsers.length;

    if (!hasConsensus) {
      const unavailableCount = allUsers.length - availableUserIds.size;
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: `Date does not have full consensus. ${unavailableCount} user(s) are unavailable.`,
          },
        },
        { status: 409 }
      );
    }

    // Lock the event date
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        scheduledDate: proposedDate,
        lockedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        eventId: updatedEvent.id,
        scheduledDate: toISODate(proposedDate),
        lockedAt: updatedEvent.lockedAt?.toISOString(),
        message: 'Event date locked successfully. Users notified.',
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
