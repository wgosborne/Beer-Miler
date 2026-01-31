import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BetSchema } from '@/lib/validation';
import { z } from 'zod';

/**
 * POST /api/bets - Place a new bet
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
            message: 'You must be logged in to place bets',
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const validatedData = BetSchema.parse(body);

    // 3. Get event ID from environment
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

    // 4. Check event exists and is locked
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

    // 5. Check event date is locked
    if (!event.scheduledDate) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Event date must be locked before placing bets',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // 6. Check results not finalized
    if (event.resultsFinalized) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Results already finalized; no more bets allowed',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // 7. Enforce uniqueness for single-bet-per-user types
    if (validatedData.betType === 'exact_time_guess') {
      const existing = await prisma.bet.findFirst({
        where: {
          userId: session.user.id,
          eventId: event.id,
          betType: 'exact_time_guess',
        },
      });

      if (existing) {
        // Replace existing bet
        await prisma.bet.delete({ where: { id: existing.id } });
      }
    } else if (validatedData.betType === 'vomit_prop') {
      const existing = await prisma.bet.findFirst({
        where: {
          userId: session.user.id,
          eventId: event.id,
          betType: 'vomit_prop',
        },
      });

      if (existing) {
        // Replace existing bet
        await prisma.bet.delete({ where: { id: existing.id } });
      }
    }

    // 8. Create bet
    const bet = await prisma.bet.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        betType: validatedData.betType,
        betData: validatedData,
        status: 'pending',
        pointsAwarded: 0,
      },
    });

    console.log(`[Bets API] User ${session.user.id} placed ${validatedData.betType} bet`);

    // 9. Return success
    return NextResponse.json(bet, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid bet data',
            details: error.flatten().fieldErrors,
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    // Log and return generic error
    console.error('[Bets API] Error placing bet:', error);
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

/**
 * GET /api/bets - View all bets and distribution
 * Query params: eventId (optional, defaults to current event)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'You must be logged in to view bets',
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // 2. Get event ID
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

    // 3. Get event
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

    // 4. Get user's bets
    const myBets = await prisma.bet.findMany({
      where: {
        userId: session.user.id,
        eventId: event.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Get all bets for distribution
    const allBets = await prisma.bet.findMany({
      where: { eventId: event.id },
      include: {
        user: { select: { username: true } },
      },
    });

    // 6. Calculate distribution
    const distribution = calculateDistribution(allBets);

    // 7. Return response
    return NextResponse.json({
      eventId: event.id,
      resultsFinalized: event.resultsFinalized,
      myBets,
      distribution,
    });
  } catch (error) {
    console.error('[Bets API] Error fetching bets:', error);
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

/**
 * Calculate bet distribution statistics
 */
interface BetWithUser {
  betType: string;
  betData: any;
  user: { username: string };
}

function calculateDistribution(bets: BetWithUser[]) {
  const distribution: any = {
    time_over_under: {},
    exact_time_guess: { guesses: [] },
    vomit_prop: { yes: 0, no: 0 },
  };

  for (const bet of bets) {
    if (bet.betType === 'time_over_under') {
      const { thresholdSeconds, direction } = bet.betData;
      const key = `${thresholdSeconds}_${direction}`;
      distribution.time_over_under[key] = (distribution.time_over_under[key] || 0) + 1;
    } else if (bet.betType === 'exact_time_guess') {
      distribution.exact_time_guess.guesses.push({
        time: bet.betData.guessedTimeSeconds,
        user: bet.user.username,
      });
    } else if (bet.betType === 'vomit_prop') {
      const prediction = bet.betData.prediction;
      if (prediction === 'yes') {
        distribution.vomit_prop.yes += 1;
      } else {
        distribution.vomit_prop.no += 1;
      }
    }
  }

  // Sort guesses by time
  distribution.exact_time_guess.guesses.sort((a: any, b: any) => a.time - b.time);

  return distribution;
}
