'use client';

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

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  expanded?: boolean;
  eventName?: string;
  resultsFinalized?: boolean;
}

export function Leaderboard({
  entries,
  expanded = false,
  eventName,
  resultsFinalized = false,
}: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No leaderboard data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {eventName && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{eventName} Leaderboard</h2>
          {resultsFinalized && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded">Finalized</span>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rank</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Points</th>
              {expanded && <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Bets</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={entry.userId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800 w-12">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${getMedalColor(entry.rank)}`}>
                    {getMedalEmoji(entry.rank)} {entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">{entry.username}</td>
                <td className="px-4 py-3 text-sm font-bold text-right">
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {entry.pointsEarned}
                  </span>
                </td>
                {expanded && <td className="px-4 py-3 text-xs text-gray-600">{formatBetSummary(entry.bets)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expanded && (
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Detailed Breakdown</h3>
          {entries.map((entry) => (
            <div key={entry.userId} className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-gray-800 mb-2">{entry.username}</h4>
              <div className="space-y-1 text-sm">
                {entry.bets.exact_time_guess && (
                  <div className="text-gray-700">
                    <span className="font-medium">Exact Guess:</span> {entry.bets.exact_time_guess.result}{' '}
                    {entry.bets.exact_time_guess.points > 0 && <span className="text-green-600">+1pt</span>}
                  </div>
                )}

                {entry.bets.time_over_under.length > 0 && (
                  <div className="text-gray-700">
                    <span className="font-medium">Over/Under:</span> {entry.bets.time_over_under.length} bets
                    {entry.bets.time_over_under.some((b: any) => b.points > 0) && (
                      <span className="text-green-600">
                        {' '}
                        +{entry.bets.time_over_under.filter((b: any) => b.points > 0).length}pts
                      </span>
                    )}
                  </div>
                )}

                {entry.bets.vomit_prop && (
                  <div className="text-gray-700">
                    <span className="font-medium">Vomit Prop:</span> {entry.bets.vomit_prop.result}{' '}
                    {entry.bets.vomit_prop.points > 0 && <span className="text-green-600">+1pt</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

function getMedalColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-yellow-100 text-yellow-700';
    case 2:
      return 'bg-gray-200 text-gray-700';
    case 3:
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

function formatBetSummary(bets: any): string {
  const parts = [];
  if (bets.exact_time_guess) parts.push('Exact');
  if (bets.time_over_under?.length > 0) parts.push(`O/U:${bets.time_over_under.length}`);
  if (bets.vomit_prop) parts.push('Vomit');
  return parts.join(' • ') || 'No bets';
}
