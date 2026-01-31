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
      <div className="text-center py-8 text-gray-500">
        <p>No bets placed yet. Choose a bet type to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bets.map((bet) => (
        <div
          key={bet.id}
          className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-800">{formatBetType(bet.betType)}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  bet.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : bet.status === 'won'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {bet.status === 'pending' ? 'Pending' : bet.status === 'won' ? 'Won' : 'Lost'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{formatBetDetails(bet)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(bet.createdAt).toLocaleDateString()} {new Date(bet.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-4">
            {bet.pointsAwarded > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{bet.pointsAwarded}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            )}

            {!resultsFinalized && bet.status === 'pending' && (
              <button
                onClick={() => handleDelete(bet.id)}
                disabled={deletingId === bet.id || loading}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-400 text-sm"
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
      return 'Time Over/Under';
    case 'exact_time_guess':
      return 'Exact Time Guess';
    case 'vomit_prop':
      return 'Vomit Prop';
    default:
      return betType;
  }
}

function formatBetDetails(bet: BetData): string {
  const data = bet.betData;

  switch (bet.betType) {
    case 'time_over_under':
      const minutes = Math.floor(data.thresholdSeconds / 60);
      const seconds = data.thresholdSeconds % 60;
      return `${data.direction === 'over' ? '>' : '<'} ${minutes}:${seconds.toString().padStart(2, '0')} (${data.thresholdSeconds}s)`;

    case 'exact_time_guess':
      const m = Math.floor(data.guessedTimeSeconds / 60);
      const s = data.guessedTimeSeconds % 60;
      return `Guess: ${m}:${s.toString().padStart(2, '0')} (${data.guessedTimeSeconds}s)`;

    case 'vomit_prop':
      return data.prediction === 'yes' ? 'Prediction: Yes, she will vomit 🤢' : 'Prediction: No, she will not vomit ✅';

    default:
      return 'Unknown bet type';
  }
}
