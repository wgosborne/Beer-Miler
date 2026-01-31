import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FinalizeResultsSchema } from '@/lib/validation';
import { scoreAllBets, findClosestGuesses } from '@/lib/scoring';
import { z } from 'zod';

/**
 * POST /api/admin/finalize-results - Lock results and update all bets/leaderboard
 * Admin only. This is the point of no return for results.
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
            message: 'Only admins can finalize results',
            statusCode: 403,
          },
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const body = await req.json();
    const validatedData = FinalizeResultsSchema.parse(body);

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

    // 6. Check results have been entered (finalTimeSeconds set)
    if (event.finalTimeSeconds === null || event.vomitOutcome === null) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Must enter results before finalization',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // 7. Check results not already finalized (idempotency check)
    if (event.resultsFinalized) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Results already finalized',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // 8. Score all bets
    const scoringResults = await scoreAllBets(
      eventId,
      event.finalTimeSeconds,
      event.vomitOutcome
    );

    // 9. Handle exact time guess winners (tie-breaking)
    const exactGuesses = scoringResults.filter((r) => r.betType === 'exact_time_guess');
    const closestIds = findClosestGuesses(
      exactGuesses.map((g) => ({
        distance: g.distance || 0,
        betId: g.betId,
      }))
    );

    // 10. Update all bets with their final status
    for (const result of scoringResults) {
      let won = result.won;

      // For exact time guesses, check if this bet is one of the closest
      if (result.betType === 'exact_time_guess') {
        won = closestIds.includes(result.betId);
      }

      // Fetch bet to get current betData
      const existingBet = await prisma.bet.findUnique({
        where: { id: result.betId },
      });

      await prisma.bet.update({
        where: { id: result.betId },
        data: {
          status: won ? 'won' : 'lost',
          pointsAwarded: won ? 1 : 0,
          betData: {
            ...(existingBet?.betData as Record<string, unknown>) || {},
            won,
          },
        },
      });
    }

    // 11. Update leaderboard entries
    const leaderboardData = await calculateFinalLeaderboard(eventId);
    for (const entry of leaderboardData) {
      const existing = await prisma.leaderboardEntry.findUnique({
        where: {
          userId_eventId: {
            userId: entry.userId,
            eventId: eventId,
          },
        },
      });

      if (existing) {
        await prisma.leaderboardEntry.update({
          where: { id: existing.id },
          data: {
            pointsEarned: entry.points,
            rank: entry.rank,
          },
        });
      } else {
        // Create leaderboard entry if not exists
        await prisma.leaderboardEntry.create({
          data: {
            userId: entry.userId,
            eventId: eventId,
            pointsEarned: entry.points,
            rank: entry.rank,
          },
        });
      }
    }

    // 12. Mark event as finalized
    const finalizedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        resultsFinalized: true,
        finalizedAt: new Date(),
        status: 'completed',
      },
    });

    console.log(
      `[Admin Finalize] User ${session.user.id} finalized results for event ${eventId}`
    );

    // 13. Return success
    return NextResponse.json({
      eventId: event.id,
      resultsFinalized: true,
      finalizedAt: finalizedEvent.finalizedAt,
      message: 'Results finalized. Leaderboard is now locked.',
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

    console.error('[Admin Finalize] Error finalizing results:', error);
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
 * Calculate final leaderboard based on scoring results
 */
async function calculateFinalLeaderboard(
  eventId: string
): Promise<Array<{ userId: string; points: number; rank: number }>> {
  // Get all bets that have been scored
  const bets = await prisma.bet.findMany({
    where: { eventId },
  });

  const pointsMap = new Map<string, number>();

  // Initialize all users with 0 points
  const allUsers = await prisma.user.findMany();
  for (const user of allUsers) {
    pointsMap.set(user.id, 0);
  }

  // Add points from winning bets
  for (const bet of bets) {
    if (bet.status === 'won') {
      const current = pointsMap.get(bet.userId) || 0;
      pointsMap.set(bet.userId, current + 1);
    }
  }

  // Convert to sorted array with ranks
  const leaderboard = Array.from(pointsMap.entries())
    .map(([userId, points]) => ({
      userId,
      points,
    }))
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return leaderboard;
}
