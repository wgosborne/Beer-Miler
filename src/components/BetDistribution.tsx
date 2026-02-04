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
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="font-black text-white mb-4 uppercase tracking-wide">Time Over/Under Bets</h3>
        {Object.keys(distribution.time_over_under).length === 0 ? (
          <p className="text-sm text-white/50">No over/under bets placed yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(distribution.time_over_under).map(([key, count]) => {
              const [threshold, direction] = key.split('_');
              const minutes = Math.floor(Number(threshold) / 60);
              const seconds = Number(threshold) % 60;
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300">
                  <span className="text-sm text-white/80 font-medium">
                    {direction === 'over' ? 'Over' : 'Under'} {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                  <div className="bg-purple-600/30 border border-purple-500/50 rounded-full px-4 py-1">
                    <span className="text-sm font-bold text-purple-300">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exact Time Guesses */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="font-black text-white mb-4 uppercase tracking-wide">Exact Time Guesses</h3>
        {distribution.exact_time_guess.length === 0 ? (
          <p className="text-sm text-white/50">No exact time guesses placed yet</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {distribution.exact_time_guess.map((guess, idx) => {
              const minutes = Math.floor(guess.time / 60);
              const seconds = guess.time % 60;
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300">
                  <span className="text-sm text-white/70 font-medium">{guess.user}</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vomit Prop Distribution */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="font-black text-white mb-4 uppercase tracking-wide">Vomit Prop Predictions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300">
            <span className="text-sm text-white/80 font-medium">She will vomit</span>
            <div className="bg-pink-600/30 border border-pink-500/50 rounded-full px-4 py-1">
              <span className="text-sm font-bold text-pink-300">{distribution.vomit_prop.yes}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all duration-300">
            <span className="text-sm text-white/80 font-medium">She will not vomit</span>
            <div className="bg-emerald-600/30 border border-emerald-500/50 rounded-full px-4 py-1">
              <span className="text-sm font-bold text-emerald-300">{distribution.vomit_prop.no}</span>
            </div>
          </div>
          <div className="text-xs text-white/40 mt-4 pt-3 border-t border-white/10">
            Total: {distribution.vomit_prop.yes + distribution.vomit_prop.no} predictions
          </div>
        </div>
      </div>
    </div>
  );
}
