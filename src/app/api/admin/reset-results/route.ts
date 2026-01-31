import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResetResultsSchema } from '@/lib/validation';
import { z } from 'zod';

/**
 * POST /api/admin/reset-results - Reset results if data entry error detected
 * Admin only. Can only be called before finalization.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'You must be logged in',
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // 2. Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Only admins can reset results',
            statusCode: 403,
          },
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const body = await req.json();
    const validatedData = ResetResultsSchema.parse(body);

    // 4. Get event ID
    const eventId = process.env.EVENT_ID;
    if (!eventId) {
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Event ID not configured',
            statusCode: 500,
          },
        },
        { status: 500 }
      );
    }

    // 5. Get event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Event not found',
            statusCode: 404,
          },
        },
        { status: 404 }
      );
    }

    // 6. Check results not already finalized
    if (event.resultsFinalized) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Results already finalized; cannot reset',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // 7. Reset all bets to pending status
    await prisma.bet.updateMany({
      where: { eventId: eventId },
      data: {
        status: 'pending',
        pointsAwarded: 0,
      }
    });

    // 8. Reset event final time and vomit outcome
    await prisma.event.update({
      where: { id: eventId },
      data: {
        finalTimeSeconds: null,
        vomitOutcome: null,
      },
    });

    // 9. Reset leaderboard entries
    await prisma.leaderboardEntry.updateMany({
      where: { eventId: eventId },
      data: {
        pointsEarned: 0,
        rank: null,
      }
    });

    console.log(
      `[Admin Reset] User ${session.user.id} reset results for event ${eventId}. Reason: ${validatedData.reason}`
    );

    // 10. Return success
    return NextResponse.json({
      eventId: event.id,
      message: 'Results reset. All bets returned to pending status.',
      allBetsReset: true,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.flatten().fieldErrors,
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    console.error('[Admin Reset] Error resetting results:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          statusCode: 500,
        },
      },
      { status: 500 }
    );
  }
}
