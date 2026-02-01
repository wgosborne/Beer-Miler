import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toISODate } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'User must be logged in to unlock event date',
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
            message: 'Only admins can unlock event dates',
          },
        },
        { status: 403 }
      );
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

    // Check if event is currently locked
    if (event.scheduledDate === null) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Event is not currently locked',
          },
        },
        { status: 400 }
      );
    }

    // Unlock the event date
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        scheduledDate: null,
        lockedAt: null,
      },
    });

    return NextResponse.json(
      {
        eventId: updatedEvent.id,
        message: 'Event date unlocked successfully. Users can now update availability.',
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
