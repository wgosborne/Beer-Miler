import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/leaderboard - Get current leaderboard with bet breakdown
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
            message: 'You must be logged in to view leaderboard',
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

    // 4. Get all leaderboard entries for this event
    const entries = await prisma.leaderboardEntry.findMany({
      where: { eventId },
      include: {
        user: { select: { username: true } },
      },
      orderBy: { rank: 'asc' },
    });

    // 5. Get bets for detailed breakdown
    const allBets = await prisma.bet.findMany({
      where: { eventId },
      include: {
        user: { select: { username: true } },
      },
    });

    // 6. Build detailed leaderboard response
    const leaderboard = entries.map((entry) => {
      const userBets = allBets.filter((b) => b.userId === entry.userId);
      const betsBreakdown = buildBetBreakdown(userBets);

      return {
        rank: entry.rank,
        userId: entry.userId,
        username: entry.user.username,
        pointsEarned: entry.pointsEarned,
        bets: betsBreakdown,
      };
    });

    // 7. Return leaderboard
    return NextResponse.json({
      eventId: event.id,
      eventName: event.name,
      resultsFinalized: event.resultsFinalized,
      finalTimeSeconds: event.finalTimeSeconds,
      vomitOutcome: event.vomitOutcome,
      leaderboard,
    });
  } catch (error) {
    console.error('[Leaderboard API] Error fetching leaderboard:', error);
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
 * Build detailed bet breakdown for a user
 * Groups bets by type and includes result information
 */
function buildBetBreakdown(
  userBets: Array<{
    id: string;
    betType: string;
    status: string;
    pointsAwarded: number;
    betData: any;
  }>
) {
  const breakdown: any = {
    exact_time_guess: null,
    time_over_under: [],
    vomit_prop: null,
  };

  for (const bet of userBets) {
    if (bet.betType === 'exact_time_guess') {
      breakdown.exact_time_guess = {
        bet: bet.betData,
        result: bet.status,
        points: bet.pointsAwarded,
      };
    } else if (bet.betType === 'time_over_under') {
      breakdown.time_over_under.push({
        bet: bet.betData,
        result: bet.status,
        points: bet.pointsAwarded,
      });
    } else if (bet.betType === 'vomit_prop') {
      breakdown.vomit_prop = {
        bet: bet.betData,
        result: bet.status,
        points: bet.pointsAwarded,
      };
    }
  }

  return breakdown;
}
