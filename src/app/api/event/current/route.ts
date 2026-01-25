import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'User must be logged in to view event',
          },
        },
        { status: 401 }
      );
    }

    // Get current event (singleton for MVP)
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

    // Format response
    return NextResponse.json(
      {
        id: event.id,
        name: event.name,
        status: event.status,
        scheduledDate: event.scheduledDate ? event.scheduledDate.toISOString().split('T')[0] : null,
        lockedAt: event.lockedAt ? event.lockedAt.toISOString() : null,
        finalTimeSeconds: event.finalTimeSeconds,
        vomitOutcome: event.vomitOutcome,
        resultsFinalized: event.resultsFinalized,
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
