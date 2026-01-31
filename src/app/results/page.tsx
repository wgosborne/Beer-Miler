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

interface PreviewWinner {
  betType: string;
  users: string[];
  points: number;
  details: string;
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [resultsFinalized, setResultsFinalized] = useState(false);
  const [finalTimeSeconds, setFinalTimeSeconds] = useState<number | null>(null);
  const [vomitOutcome, setVomitOutcome] = useState<boolean | null>(null);
  const [eventName, setEventName] = useState('');

  // Admin form state
  const [adminMinutes, setAdminMinutes] = useState(5);
  const [adminSeconds, setAdminSeconds] = useState(47);
  const [adminVomit, setAdminVomit] = useState<'yes' | 'no'>('no');
  const [preview, setPreview] = useState<{
    winners: PreviewWinner[];
    finalLeaderboard: Array<{ rank: number; userId: string; username: string; points: number }>;
  } | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = session?.user?.role === 'admin';

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/results');
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
      setFinalTimeSeconds(data.finalTimeSeconds);
      setVomitOutcome(data.vomitOutcome);
      setEventName(data.eventName);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnterResults() {
    try {
      setSubmitting(true);
      setError('');
      const totalSeconds = adminMinutes * 60 + adminSeconds;

      const response = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalTimeSeconds: totalSeconds,
          vomitOutcome: adminVomit === 'yes',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to enter results');
      }

      const data = await response.json();
      setPreview(data.preview);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enter results');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinalizeResults() {
    if (!confirm('Are you sure? This cannot be undone. Results will be locked.')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/finalize-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to finalize results');
      }

      // Refresh leaderboard
      setPreview(null);
      setShowAdminForm(false);
      await fetchLeaderboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize results');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetResults() {
    const reason = prompt('Why are you resetting? (for audit trail)');
    if (!reason) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/reset-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to reset results');
      }

      setPreview(null);
      setShowAdminForm(false);
      await fetchLeaderboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset results');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Results & Leaderboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Admin Form */}
      {isAdmin && (
        <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-4">Admin Results Entry</h2>

          {resultsFinalized ? (
            <div className="text-yellow-800">
              <p className="font-semibold mb-2">Results Finalized</p>
              <p className="text-sm">
                Final Time: {finalTimeSeconds !== null ? formatSeconds(finalTimeSeconds) : 'N/A'}
              </p>
              <p className="text-sm">Vomit Outcome: {vomitOutcome !== null ? (vomitOutcome ? 'Yes' : 'No') : 'N/A'}</p>
            </div>
          ) : (
            <div>
              {!showAdminForm ? (
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Enter Results
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Time (MM:SS)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={adminMinutes}
                        onChange={(e) =>
                          setAdminMinutes(Math.min(20, Math.max(0, Number(e.target.value))))
                        }
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="MM"
                      />
                      <span className="text-xl font-bold">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={adminSeconds}
                        onChange={(e) =>
                          setAdminSeconds(Math.min(59, Math.max(0, Number(e.target.value))))
                        }
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="SS"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {adminMinutes}:{adminSeconds.toString().padStart(2, '0')} ({adminMinutes * 60 + adminSeconds}s)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Did Annie vomit?</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setAdminVomit('yes')}
                        className={`flex-1 py-2 rounded-lg font-medium transition ${
                          adminVomit === 'yes'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminVomit('no')}
                        className={`flex-1 py-2 rounded-lg font-medium transition ${
                          adminVomit === 'no'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleEnterResults}
                      disabled={submitting}
                      className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
                    >
                      {submitting ? 'Processing...' : 'Preview Results'}
                    </button>
                    <button
                      onClick={() => setShowAdminForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Results Preview</h2>

          <div className="mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Winners</h3>
            <div className="space-y-2">
              {preview.winners.map((winner, idx) => (
                <div key={idx} className="bg-white rounded p-3">
                  <p className="font-medium text-gray-800">{winner.betType}</p>
                  <p className="text-sm text-gray-600">
                    {winner.users.join(', ')} - +{winner.points} point
                    {winner.points > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500">{winner.details}</p>
                </div>
              ))}
            </div>
          </div>

          {preview.finalLeaderboard && (
            <div className="mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">Final Leaderboard</h3>
              <table className="w-full text-sm">
                <thead className="border-b border-blue-200">
                  <tr>
                    <th className="px-2 py-1 text-left">Rank</th>
                    <th className="px-2 py-1 text-left">User</th>
                    <th className="px-2 py-1 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.finalLeaderboard.map((entry) => (
                    <tr key={entry.userId} className="border-b border-blue-100">
                      <td className="px-2 py-1">{entry.rank}</td>
                      <td className="px-2 py-1">{entry.username}</td>
                      <td className="px-2 py-1 text-right font-bold">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleFinalizeResults}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting ? 'Finalizing...' : 'Finalize Results'}
              </button>
              <button
                onClick={() => setPreview(null)}
                disabled={submitting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-400"
              >
                Go Back
              </button>
              <button
                onClick={handleResetResults}
                disabled={submitting}
                className="flex-1 bg-red-300 text-red-700 py-2 rounded-lg hover:bg-red-400 disabled:bg-gray-400"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <Leaderboard
          entries={leaderboard}
          expanded={resultsFinalized}
          eventName={eventName}
          resultsFinalized={resultsFinalized}
        />
      </div>
    </div>
  );
}

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
