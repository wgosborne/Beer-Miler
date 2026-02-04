'use client';

import { useState } from 'react';

interface BetData {
  id: string;
  betType: string;
  status: string;
  pointsAwarded: number;
  betData: any;
  createdAt: string;
}

interface MyBetsListProps {
  bets: BetData[];
  loading: boolean;
  onDeleteBet: (betId: string) => Promise<void>;
  resultsFinalized: boolean;
}

export function MyBetsList({ bets, loading, onDeleteBet, resultsFinalized }: MyBetsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (betId: string) => {
    setDeletingId(betId);
    try {
      await onDeleteBet(betId);
    } finally {
      setDeletingId(null);
    }
  };

  if (bets.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        <p>No bets placed yet. Choose a bet type to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bets.map((bet) => (
        <div
          key={bet.id}
          className="bg-white/5 border border-white/10 rounded-lg p-5 flex justify-between items-center hover:bg-white/8 hover:border-white/20 transition-all duration-300 group"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-white text-sm">{formatBetType(bet.betType)}</span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  bet.status === 'pending'
                    ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/30'
                    : bet.status === 'won'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/30 text-red-300 border border-red-500/30'
                }`}
              >
                {bet.status === 'pending' ? 'Pending' : bet.status === 'won' ? 'Won' : 'Lost'}
              </span>
            </div>
            <p className="text-sm text-white/70">{formatBetDetails(bet)}</p>
            <p className="text-xs text-white/40 mt-2">
              {new Date(bet.createdAt).toLocaleDateString()} {new Date(bet.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {bet.pointsAwarded > 0 && (
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-400">{bet.pointsAwarded}</p>
                <p className="text-xs text-emerald-300/60 font-semibold">POINTS</p>
              </div>
            )}

            {!resultsFinalized && bet.status === 'pending' && (
              <button
                onClick={() => handleDelete(bet.id)}
                disabled={deletingId === bet.id || loading}
                className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/40 disabled:bg-gray-600/20 disabled:text-gray-400 text-sm font-semibold transition-all duration-300 border border-red-600/30"
              >
                {deletingId === bet.id ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatBetType(betType: string): string {
  switch (betType) {
    case 'time_over_under':
      return 'TIME OVER/UNDER';
    case 'exact_time_guess':
      return 'EXACT TIME GUESS';
    case 'vomit_prop':
      return 'VOMIT PROP';
    default:
      return betType.toUpperCase();
  }
}

function formatBetDetails(bet: BetData): string {
  const data = bet.betData;

  switch (bet.betType) {
    case 'time_over_under':
      const minutes = Math.floor(data.thresholdSeconds / 60);
      const seconds = data.thresholdSeconds % 60;
      return `${data.direction === 'over' ? 'Over' : 'Under'} ${minutes}:${seconds.toString().padStart(2, '0')} (${data.thresholdSeconds}s)`;

    case 'exact_time_guess':
      const m = Math.floor(data.guessedTimeSeconds / 60);
      const s = data.guessedTimeSeconds % 60;
      return `${m}:${s.toString().padStart(2, '0')} (${data.guessedTimeSeconds}s)`;

    case 'vomit_prop':
      return data.prediction === 'yes' ? 'She will vomit' : 'She will not vomit';

    default:
      return 'Unknown bet type';
  }
}
