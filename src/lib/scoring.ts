/**
 * Betting Scoring Logic
 *
 * This module contains all logic for scoring bets after the admin enters final results.
 * Supports three bet types: time_over_under, exact_time_guess, vomit_prop
 */

import { prisma } from './prisma';

export interface ScoringResult {
  betId: string;
  userId: string;
  betType: string;
  won: boolean;
  pointsAwarded: number;
  distance?: number; // For exact time guesses
}

export interface ScoringPreview {
  winners: Array<{
    betType: string;
    users: string[];
    points: number;
    details: string;
  }>;
  finalLeaderboard: Array<{
    rank: number;
    userId: string;
    username: string;
    points: number;
  }>;
}

/**
 * Score all bets for an event based on final results
 * Called after admin enters final time and vomit outcome
 */
export async function scoreAllBets(
  eventId: string,
  finalTimeSeconds: number,
  vomitOutcome: boolean
): Promise<ScoringResult[]> {
  // Fetch all pending bets for this event
  const pendingBets = await prisma.bet.findMany({
    where: {
      eventId: eventId,
      status: 'pending',
    },
    include: {
      user: true,
    },
  });

  const results: ScoringResult[] = [];

  // Score each bet
  for (const bet of pendingBets) {
    let won = false;
    let distance: number | undefined;

    if (bet.betType === 'time_over_under') {
      won = scoreTimeOverUnderBet(bet.betData, finalTimeSeconds);
    } else if (bet.betType === 'exact_time_guess') {
      const result = scoreExactTimeGuessBet(bet.betData, finalTimeSeconds);
      won = result.won;
      distance = result.distance;
    } else if (bet.betType === 'vomit_prop') {
      won = scoreVomitPropBet(bet.betData, vomitOutcome);
    }

    results.push({
      betId: bet.id,
      userId: bet.userId,
      betType: bet.betType,
      won,
      pointsAwarded: won ? 1 : 0,
      distance,
    });

    console.log(
      `[Scoring] Bet ${bet.id} (${bet.betType}): ${won ? 'WON' : 'LOST'}`
    );
  }

  return results;
}

/**
 * Time Over/Under Scoring
 * Bet wins if final time is on the correct side of the threshold
 */
function scoreTimeOverUnderBet(betData: any, finalTimeSeconds: number): boolean {
  const { thresholdSeconds, direction } = betData;

  if (direction === 'over') {
    return finalTimeSeconds > thresholdSeconds;
  } else {
    return finalTimeSeconds < thresholdSeconds;
  }
}

/**
 * Exact Time Guess Scoring
 * Bet wins if it's the closest guess (or tied for closest)
 * Returns { won, distance }
 */
function scoreExactTimeGuessBet(
  betData: any,
  finalTimeSeconds: number
): { won: boolean; distance: number } {
  const { guessedTimeSeconds } = betData;
  const distance = Math.abs(guessedTimeSeconds - finalTimeSeconds);
  return { won: false, distance }; // won determined later by findClosestGuesses
}

/**
 * Vomit Prop Scoring
 * Bet wins if prediction matches the outcome
 */
function scoreVomitPropBet(betData: any, vomitOutcome: boolean): boolean {
  const { prediction } = betData;
  if (prediction === 'yes') {
    return vomitOutcome === true;
  } else {
    return vomitOutcome === false;
  }
}

/**
 * Find exact time guess winners (handles tie-breaking)
 * If two users guess equally close, both get the point
 */
export function findClosestGuesses(
  guesses: Array<{ distance: number; betId: string }>
): string[] {
  if (guesses.length === 0) return [];

  const minDistance = Math.min(...guesses.map((g) => g.distance));
  return guesses
    .filter((g) => g.distance === minDistance)
    .map((g) => g.betId);
}

/**
 * Generate a preview of scoring results
 * Called before finalization so admin can review winners
 */
export async function generateScoringPreview(
  eventId: string,
  finalTimeSeconds: number,
  vomitOutcome: boolean
): Promise<ScoringPreview> {
  // Score all bets
  const scoringResults = await scoreAllBets(
    eventId,
    finalTimeSeconds,
    vomitOutcome
  );

  // Group by bet type and determine winners
  const winners: ScoringPreview['winners'] = [];

  // Time over/under winners
  const overUnderWins = scoringResults.filter(
    (r) => r.betType === 'time_over_under' && r.won
  );
  if (overUnderWins.length > 0) {
    const usernames = await getUsernames(overUnderWins.map((w) => w.userId));
    winners.push({
      betType: 'time_over_under',
      users: usernames,
      points: 1,
      details: `Final time: ${secondsToMMSS(finalTimeSeconds)}`,
    });
  }

  // Exact time guess winners (closest guess(es))
  const exactGuesses = scoringResults.filter(
    (r) => r.betType === 'exact_time_guess'
  );
  if (exactGuesses.length > 0) {
    const closestIds = findClosestGuesses(
      exactGuesses.map((g) => ({
        distance: g.distance || 0,
        betId: g.betId,
      }))
    );
    const closestBets = await prisma.bet.findMany({
      where: { id: { in: closestIds } },
      include: { user: true },
    });
    const usernames = closestBets.map((b) => b.user.username);
    const minDistance = Math.min(...exactGuesses.map((g) => g.distance || 0));
    winners.push({
      betType: 'exact_time_guess',
      users: usernames,
      points: 1,
      details: `Closest guess: ${usernames.join(', ')} (${minDistance}s off)`,
    });
  }

  // Vomit prop winners
  const vomitWins = scoringResults.filter(
    (r) => r.betType === 'vomit_prop' && r.won
  );
  if (vomitWins.length > 0) {
    const usernames = await getUsernames(vomitWins.map((w) => w.userId));
    winners.push({
      betType: 'vomit_prop',
      users: usernames,
      points: 1,
      details: vomitOutcome ? 'Annie vomited' : 'Annie did not vomit',
    });
  }

  // Calculate leaderboard
  const leaderboardData = await calculateLeaderboard(eventId, scoringResults);

  return {
    winners,
    finalLeaderboard: leaderboardData,
  };
}

/**
 * Calculate final leaderboard after scoring
 */
async function calculateLeaderboard(
  eventId: string,
  scoringResults: ScoringResult[]
): Promise<Array<{ rank: number; userId: string; username: string; points: number }>> {
  // Get all users who placed bets
  const allBets = await prisma.bet.findMany({
    where: { eventId },
    distinct: ['userId'],
    include: { user: { select: { username: true } } },
  });

  const pointsMap = new Map<string, number>();
  for (const bet of allBets) {
    pointsMap.set(bet.userId, 0);
  }

  // Add points from scoring results
  for (const result of scoringResults) {
    const current = pointsMap.get(result.userId) || 0;
    pointsMap.set(result.userId, current + result.pointsAwarded);
  }

  // Convert to sorted array with usernames
  const leaderboard = Array.from(pointsMap.entries())
    .map(([userId, points]) => {
      const user = allBets.find((b) => b.userId === userId);
      return {
        userId,
        username: user?.user.username || 'Unknown',
        points,
      };
    })
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

  return leaderboard;
}

/**
 * Helper: Get usernames from user IDs
 */
async function getUsernames(userIds: string[]): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { username: true },
  });
  return users.map((u) => u.username);
}

/**
 * Helper: Convert seconds to MM:SS format
 */
export function secondsToMMSS(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper: Convert MM:SS format to seconds
 */
export function mmssToSeconds(mmss: string): number {
  const [minutes, seconds] = mmss.split(':').map(Number);
  return minutes * 60 + seconds;
}
