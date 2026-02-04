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
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm sm:text-base">No leaderboard data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {eventName && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{eventName} Leaderboard</h2>
          {resultsFinalized && (
            <span className="text-xs sm:text-sm bg-green-600 bg-opacity-30 text-green-300 border border-green-600 border-opacity-40 px-3 py-1 rounded-full">
              Finalized
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-purple-600 border-opacity-40">
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-purple-400 font-semibold">Rank</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-purple-400 font-semibold">User</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-purple-400 font-semibold">Points</th>
              {expanded && <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-purple-400 font-semibold">Bets</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={entry.userId}
                className={`border-b border-gray-700 border-opacity-30 ${
                  idx % 2 === 0 ? 'bg-gray-800 bg-opacity-20' : ''
                } hover:bg-gray-800 hover:bg-opacity-40 transition-colors`}
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold w-12">
                  <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm ${getMedalColor(entry.rank)}`}>
                    {getMedalBadge(entry.rank)}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-300">{entry.username}</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                  <span className="inline-block bg-green-600 bg-opacity-30 text-green-300 border border-green-600 border-opacity-40 px-2 py-1 rounded-full font-black text-xs sm:text-sm">
                    {entry.pointsEarned}
                  </span>
                </td>
                {expanded && <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 text-xs">{formatBetSummary(entry.bets)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expanded && (
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-gray-700 border-opacity-30">
          <h3 className="text-lg sm:text-xl font-bold text-white">Detailed Breakdown</h3>
          {entries.map((entry) => (
            <div key={entry.userId} className="border-l-4 border-purple-600 border-opacity-40 pl-3 sm:pl-4 py-2 sm:py-3 bg-gray-800 bg-opacity-20 rounded p-3 sm:p-4">
              <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">{entry.username}</h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                {entry.bets.exact_time_guess && (
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-medium text-purple-400">Exact Guess:</span> {entry.bets.exact_time_guess.result}
                    </span>
                    {entry.bets.exact_time_guess.points > 0 && <span className="text-green-400 font-semibold">+1pt</span>}
                  </div>
                )}

                {entry.bets.time_over_under.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-medium text-purple-400">Over/Under:</span> {entry.bets.time_over_under.length} bets
                    </span>
                    {entry.bets.time_over_under.some((b: any) => b.points > 0) && (
                      <span className="text-green-400 font-semibold">
                        +{entry.bets.time_over_under.filter((b: any) => b.points > 0).length}pts
                      </span>
                    )}
                  </div>
                )}

                {entry.bets.vomit_prop && (
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-medium text-purple-400">Vomit Prop:</span> {entry.bets.vomit_prop.result}
                    </span>
                    {entry.bets.vomit_prop.points > 0 && <span className="text-green-400 font-semibold">+1pt</span>}
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

function getMedalBadge(rank: number): string {
  switch (rank) {
    case 1:
      return '1st';
    case 2:
      return '2nd';
    case 3:
      return '3rd';
    default:
      return `${rank}`;
  }
}

function getMedalColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-yellow-600 bg-opacity-30 text-yellow-300 border border-yellow-600 border-opacity-40';
    case 2:
      return 'bg-gray-600 bg-opacity-30 text-gray-300 border border-gray-600 border-opacity-40';
    case 3:
      return 'bg-orange-600 bg-opacity-30 text-orange-300 border border-orange-600 border-opacity-40';
    default:
      return 'bg-blue-600 bg-opacity-30 text-blue-300 border border-blue-600 border-opacity-40';
  }
}

function formatBetSummary(bets: any): string {
  const parts = [];
  if (bets.exact_time_guess) parts.push('Exact');
  if (bets.time_over_under?.length > 0) parts.push(`O/U:${bets.time_over_under.length}`);
  if (bets.vomit_prop) parts.push('Vomit');
  return parts.join(' • ') || 'No bets';
}
