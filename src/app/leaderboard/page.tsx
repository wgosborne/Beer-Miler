'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Leaderboard } from '@/components/Leaderboard';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  pointsEarned: number;
  bets: {
    exact_time_guess: any;
    time_over_under: any[];
    vomit_prop: any;
  };
}

interface LeaderboardResponse {
  eventId: string;
  eventName: string;
  resultsFinalized: boolean;
  finalTimeSeconds: number | null;
  vomitOutcome: boolean | null;
  leaderboard: LeaderboardEntry[];
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [resultsFinalized, setResultsFinalized] = useState(false);
  const [eventName, setEventName] = useState('');
  const [finalTimeSeconds, setFinalTimeSeconds] = useState<number | null>(null);
  const [vomitOutcome, setVomitOutcome] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/leaderboard');
    }
  }, [status, router]);

  // Fetch leaderboard
  useEffect(() => {
    if (session?.user?.id) {
      fetchLeaderboard();
    }
  }, [session?.user?.id]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to load leaderboard');
        return;
      }

      const data: LeaderboardResponse = await response.json();
      setLeaderboard(data.leaderboard);
      setResultsFinalized(data.resultsFinalized);
      setEventName(data.eventName);
      setFinalTimeSeconds(data.finalTimeSeconds);
      setVomitOutcome(data.vomitOutcome);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
        {resultsFinalized && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {expanded ? 'Show Summary' : 'Show Details'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!resultsFinalized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            ⏳ Results are not finalized yet. Final leaderboard will appear here once the admin finalizes the results.
          </p>
        </div>
      )}

      {finalTimeSeconds !== null && vomitOutcome !== null && resultsFinalized && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold">Event Results:</p>
          <p className="text-green-700">
            Final Time: <span className="font-mono font-bold">{formatSeconds(finalTimeSeconds)}</span>
          </p>
          <p className="text-green-700">
            Vomit Outcome: <span className="font-bold">{vomitOutcome ? 'Yes 🤢' : 'No ✅'}</span>
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <Leaderboard
          entries={leaderboard}
          expanded={expanded && resultsFinalized}
          eventName={eventName}
          resultsFinalized={resultsFinalized}
        />
      </div>

      {/* Quick Stats */}
      {leaderboard.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">🥇 {leaderboard[0].username}</p>
            <p className="text-sm text-yellow-600">{leaderboard[0].pointsEarned} points</p>
          </div>

          {leaderboard.length > 1 && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">🥈 {leaderboard[1].username}</p>
              <p className="text-sm text-gray-600">{leaderboard[1].pointsEarned} points</p>
            </div>
          )}

          {leaderboard.length > 2 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-700">🥉 {leaderboard[2].username}</p>
              <p className="text-sm text-orange-600">{leaderboard[2].pointsEarned} points</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
