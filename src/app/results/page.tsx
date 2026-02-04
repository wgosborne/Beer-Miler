'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Leaderboard } from '@/components/Leaderboard';
import { Spinner } from '@/components/Spinner';

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
    return <Spinner fullScreen size="lg" variant="default" />;
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Results & Leaderboard</h1>
          <p className="text-sm sm:text-base text-gray-300">View scoring and final rankings</p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900 bg-opacity-30 border border-red-600 text-red-200 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Admin Form */}
        {isAdmin && (
          <div className="mb-4 sm:mb-8 bg-purple-900 bg-opacity-20 border border-purple-600 border-opacity-40 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
            <h2 className="text-lg sm:text-xl font-bold text-purple-300 mb-4">Admin Results Entry</h2>

            {resultsFinalized ? (
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-semibold text-green-400">Results Finalized</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded p-3 sm:p-4">
                    <p className="text-xs text-gray-400 mb-1">Final Time</p>
                    <p className="text-lg sm:text-xl font-black text-white">
                      {finalTimeSeconds !== null ? formatSeconds(finalTimeSeconds) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded p-3 sm:p-4">
                    <p className="text-xs text-gray-400 mb-1">Vomit Outcome</p>
                    <p className="text-lg sm:text-xl font-black text-white">
                      {vomitOutcome !== null ? (vomitOutcome ? 'Yes' : 'No') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {!showAdminForm ? (
                  <button
                    onClick={() => setShowAdminForm(true)}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm sm:text-base shadow-lg hover:shadow-xl"
                  >
                    Enter Results
                  </button>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">
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
                          className="w-16 px-3 py-2 sm:py-2.5 bg-gray-900 border border-gray-700 rounded text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                          placeholder="MM"
                        />
                        <span className="text-lg sm:text-xl font-bold text-gray-300">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={adminSeconds}
                          onChange={(e) =>
                            setAdminSeconds(Math.min(59, Math.max(0, Number(e.target.value))))
                          }
                          className="w-16 px-3 py-2 sm:py-2.5 bg-gray-900 border border-gray-700 rounded text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                          placeholder="SS"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {adminMinutes}:{adminSeconds.toString().padStart(2, '0')} ({adminMinutes * 60 + adminSeconds}s)
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">Did Annie vomit?</label>
                      <div className="flex gap-2 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => setAdminVomit('yes')}
                          className={`flex-1 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                            adminVomit === 'yes'
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminVomit('no')}
                          className={`flex-1 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                            adminVomit === 'no'
                              ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-2.5 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-purple-900 disabled:to-purple-900 disabled:cursor-not-allowed font-semibold transition-all text-xs sm:text-sm shadow-lg hover:shadow-xl"
                      >
                        {submitting ? 'Processing...' : 'Preview Results'}
                      </button>
                      <button
                        onClick={() => setShowAdminForm(false)}
                        className="flex-1 bg-gray-700 text-gray-300 py-2 sm:py-2.5 rounded-lg hover:bg-gray-600 font-semibold transition-all text-xs sm:text-sm"
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
          <div className="mb-4 sm:mb-8 bg-blue-900 bg-opacity-20 border border-blue-600 border-opacity-40 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
            <h2 className="text-lg sm:text-xl font-bold text-blue-300 mb-4 sm:mb-6">Results Preview</h2>

            <div className="mb-6">
              <h3 className="font-semibold text-blue-400 mb-3 text-sm sm:text-base">Winners</h3>
              <div className="space-y-2">
                {preview.winners.map((winner, idx) => (
                  <div key={idx} className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded p-3 sm:p-4">
                    <p className="font-semibold text-white text-sm sm:text-base">{winner.betType}</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1">
                      {winner.users.join(', ')}
                    </p>
                    <p className="text-sm sm:text-base font-black text-green-400 mt-2">
                      +{winner.points} point{winner.points > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{winner.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {preview.finalLeaderboard && (
              <div className="mb-6">
                <h3 className="font-semibold text-blue-400 mb-3 text-sm sm:text-base">Final Leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="border-b border-blue-600 border-opacity-40">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left text-gray-400 font-semibold">Rank</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-gray-400 font-semibold">User</th>
                        <th className="px-2 sm:px-4 py-2 text-right text-gray-400 font-semibold">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.finalLeaderboard.map((entry, idx) => (
                        <tr key={entry.userId} className={`border-b border-gray-700 border-opacity-30 ${idx % 2 === 0 ? 'bg-gray-800 bg-opacity-20' : ''}`}>
                          <td className="px-2 sm:px-4 py-2 text-white font-semibold">{entry.rank}</td>
                          <td className="px-2 sm:px-4 py-2 text-gray-300">{entry.username}</td>
                          <td className="px-2 sm:px-4 py-2 text-right font-black text-green-400">{entry.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleFinalizeResults}
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed font-semibold transition-all text-xs sm:text-sm shadow-lg hover:shadow-xl"
                >
                  {submitting ? 'Finalizing...' : 'Finalize Results'}
                </button>
                <button
                  onClick={() => setPreview(null)}
                  disabled={submitting}
                  className="flex-1 bg-gray-700 text-gray-300 py-2 sm:py-2.5 rounded-lg hover:bg-gray-600 disabled:cursor-not-allowed font-semibold transition-all text-xs sm:text-sm"
                >
                  Go Back
                </button>
                <button
                  onClick={handleResetResults}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed font-semibold transition-all text-xs sm:text-sm shadow-lg hover:shadow-xl"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
          <Leaderboard
            entries={leaderboard}
            expanded={resultsFinalized}
            eventName={eventName}
            resultsFinalized={resultsFinalized}
          />
        </div>
      </div>
    </div>
  );
}

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
