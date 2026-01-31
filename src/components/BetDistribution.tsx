'use client';

interface BetDistributionProps {
  distribution: {
    time_over_under: Record<string, number>;
    exact_time_guess: Array<{ time: number; user: string }>;
    vomit_prop: { yes: number; no: number };
  };
}

export function BetDistribution({ distribution }: BetDistributionProps) {
  return (
    <div className="space-y-6">
      {/* Time Over/Under Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Time Over/Under Bets</h3>
        {Object.keys(distribution.time_over_under).length === 0 ? (
          <p className="text-sm text-gray-500">No over/under bets placed yet</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(distribution.time_over_under).map(([key, count]) => {
              const [threshold, direction] = key.split('_');
              const minutes = Math.floor(Number(threshold) / 60);
              const seconds = Number(threshold) % 60;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {direction === 'over' ? '>' : '<'} {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 rounded-full px-3 py-1">
                      <span className="text-sm font-medium text-blue-700">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exact Time Guesses */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Exact Time Guesses</h3>
        {distribution.exact_time_guess.length === 0 ? (
          <p className="text-sm text-gray-500">No exact time guesses placed yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {distribution.exact_time_guess.map((guess, idx) => {
              const minutes = Math.floor(guess.time / 60);
              const seconds = guess.time % 60;
              return (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{guess.user}</span>
                  <span className="font-medium text-gray-800">
                    {minutes}:{seconds.toString().padStart(2, '0')} ({guess.time}s)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vomit Prop Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Vomit Prop</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Will vomit 🤢</span>
            <div className="bg-red-100 rounded-full px-3 py-1">
              <span className="text-sm font-medium text-red-700">{distribution.vomit_prop.yes}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Won't vomit ✅</span>
            <div className="bg-green-100 rounded-full px-3 py-1">
              <span className="text-sm font-medium text-green-700">{distribution.vomit_prop.no}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-3">
            Total predictions: {distribution.vomit_prop.yes + distribution.vomit_prop.no}
          </div>
        </div>
      </div>
    </div>
  );
}
