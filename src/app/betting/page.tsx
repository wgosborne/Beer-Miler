'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BetForm } from '@/components/BetForm';
import { MyBetsList } from '@/components/MyBetsList';
import { BetDistribution } from '@/components/BetDistribution';
import { Spinner } from '@/components/Spinner';
import { BetInput } from '@/lib/validation';

interface Bet {
  id: string;
  betType: string;
  status: string;
  pointsAwarded: number;
  betData: any;
  createdAt: string;
}

interface Distribution {
  time_over_under: Record<string, number>;
  exact_time_guess: Array<{ time: number; user: string }>;
  vomit_prop: { yes: number; no: number };
}

interface BetsResponse {
  eventId: string;
  resultsFinalized: boolean;
  myBets: Bet[];
  distribution: Distribution;
}

type TabType = 'bets' | 'your-bets' | 'crowd';

export default function BettingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('bets');
  const [bets, setBets] = useState<Bet[]>([]);
  const [distribution, setDistribution] = useState<Distribution>({
    time_over_under: {},
    exact_time_guess: [],
    vomit_prop: { yes: 0, no: 0 },
  });
  const [resultsFinalized, setResultsFinalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<'time_over_under' | 'exact_time_guess' | 'vomit_prop' | null>(null);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/betting');
    }
  }, [status, router]);

  // Fetch bets on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchBets();
    }
  }, [session?.user?.id]);

  async function fetchBets() {
    try {
      setLoading(true);
      const response = await fetch('/api/bets');
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to load bets');
        return;
      }

      const data: BetsResponse = await response.json();
      setBets(data.myBets);
      setDistribution(data.distribution);
      setResultsFinalized(data.resultsFinalized);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bets');
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceBet(betData: BetInput) {
    try {
      setSubmitting(true);
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to place bet');
      }

      // Refresh bets
      setSelectedBetType(null);
      await fetchBets();
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBet(betId: string) {
    try {
      const response = await fetch(`/api/bets/${betId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete bet');
      }

      // Refresh bets
      await fetchBets();
    } catch (err) {
      throw err;
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="betting-page-background flex items-center justify-center min-h-screen">
        <svg className="track-outline" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice">
          <rect x="40" y="20" width="320" height="240" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" rx="40" />
          <ellipse cx="200" cy="140" rx="80" ry="60" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <line x1="40" y1="140" x2="120" y2="140" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <line x1="280" y1="140" x2="360" y2="140" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        </svg>
        <Spinner size="lg" variant="bright" />
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="betting-page-background min-h-screen relative overflow-hidden">
      {/* Neon Track Background SVG - Responsive scaling for mobile */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.15 }}
      >
        {/* Define neon glow filter */}
        <defs>
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer oval track boundary (cyan) */}
        <ellipse cx="600" cy="400" rx="450" ry="280" fill="none" stroke="#00ffff" strokeWidth="4" filter="url(#neon-glow)" />

        {/* Inner oval track boundary (cyan) */}
        <ellipse cx="600" cy="400" rx="380" ry="220" fill="none" stroke="#00ffff" strokeWidth="3" filter="url(#neon-glow)" />

        {/* Lane dividers */}
        <ellipse cx="600" cy="400" rx="415" ry="255" fill="none" stroke="#00ff88" strokeWidth="2" strokeDasharray="10,10" opacity="0.6" />
        <ellipse cx="600" cy="400" rx="330" ry="200" fill="none" stroke="#00ff88" strokeWidth="2" strokeDasharray="10,10" opacity="0.6" />
        <ellipse cx="600" cy="400" rx="240" ry="145" fill="none" stroke="#ff00ff" strokeWidth="2" strokeDasharray="10,10" opacity="0.6" />

        {/* Straight sections markers */}
        <line x1="100" y1="390" x2="100" y2="410" stroke="#ffff00" strokeWidth="4" />
        <line x1="1100" y1="390" x2="1100" y2="410" stroke="#ffff00" strokeWidth="4" />

        {/* Curve marker dots - top */}
        <circle cx="600" cy="110" r="10" fill="#00ffff" opacity="0.8" />
        {/* Curve marker dots - right */}
        <circle cx="1020" cy="400" r="10" fill="#00ffff" opacity="0.8" />
        {/* Curve marker dots - bottom */}
        <circle cx="600" cy="690" r="10" fill="#00ffff" opacity="0.8" />
        {/* Curve marker dots - left */}
        <circle cx="180" cy="400" r="10" fill="#00ffff" opacity="0.8" />

        {/* Diagonal curve markers */}
        <circle cx="820" cy="170" r="8" fill="#ff00ff" opacity="0.6" />
        <circle cx="950" cy="310" r="8" fill="#ff00ff" opacity="0.6" />
        <circle cx="950" cy="490" r="8" fill="#ff00ff" opacity="0.6" />
        <circle cx="820" cy="630" r="8" fill="#ff00ff" opacity="0.6" />
        <circle cx="380" cy="630" r="8" fill="#ff00ff" opacity="0.6" />
        <circle cx="250" cy="490" r="8" fill="#ff00ff" opacity="0.6" />
        <circle cx="250" cy="310" r="8" fill="#ff00ff" opacity="0.6" />
        <circle cx="380" cy="170" r="8" fill="#ff00ff" opacity="0.6" />
      </svg>

      {/* Content container with proper z-index */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Max-width container for consistent layout with other pages */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col flex-1">
          {/* Header - Compact for mobile */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-1 tracking-tight">PLACE YOUR BETS</h1>
            <p className="text-sm sm:text-base text-white/60">Annie's beer mile</p>
          </div>


          {/* Status Messages */}
          {(resultsFinalized || error) && (
            <div className="mb-4 space-y-2">
            {resultsFinalized && (
              <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-emerald-300 font-semibold text-sm sm:text-base">Results finalized. No more bets accepted.</p>
              </div>
            )}
            {error && (
              <div className="bg-red-950/40 border border-red-500/50 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-red-300 text-sm sm:text-base">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation - Mobile optimized */}
        <div className="mb-4">
          <div className="flex gap-2 sm:gap-3 bg-white/5 rounded-lg p-1 border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('bets')}
              className={`flex-1 px-3 sm:px-4 py-2 rounded-md font-bold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'bets'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              BET TYPES
            </button>
            <button
              onClick={() => setActiveTab('your-bets')}
              className={`flex-1 px-3 sm:px-4 py-2 rounded-md font-bold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'your-bets'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              YOUR BETS
            </button>
            <button
              onClick={() => setActiveTab('crowd')}
              className={`flex-1 px-3 sm:px-4 py-2 rounded-md font-bold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'crowd'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              CROWD
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 pb-8 overflow-y-auto">
          {/* BET TYPES Tab */}
          {activeTab === 'bets' && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Choose Bet Type</h2>

              {/* Bet Type Cards */}
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedBetType('time_over_under')}
                  disabled={resultsFinalized}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left group relative ${
                    selectedBetType === 'time_over_under'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/10'
                  } ${resultsFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-white group-hover:text-purple-300 transition-colors text-sm sm:text-base">Time Over/Under</p>
                      <p className="text-xs sm:text-sm text-white/50 mt-1">Guess if Annie finishes over or under a certain time</p>
                    </div>
                    <div className="ml-2 px-2.5 py-1 rounded-full bg-purple-500/40 border border-purple-400/60 text-purple-300 font-bold text-xs whitespace-nowrap shadow-lg shadow-purple-500/50">
                      1pt
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedBetType('exact_time_guess')}
                  disabled={resultsFinalized}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left group relative ${
                    selectedBetType === 'exact_time_guess'
                      ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
                      : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-cyan-500/10'
                  } ${resultsFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-white group-hover:text-cyan-300 transition-colors text-sm sm:text-base">Exact Time Guess</p>
                      <p className="text-xs sm:text-sm text-white/50 mt-1">Predict Annie's exact finish time</p>
                    </div>
                    <div className="ml-2 px-2.5 py-1 rounded-full bg-cyan-500/40 border border-cyan-400/60 text-cyan-300 font-bold text-xs whitespace-nowrap shadow-lg shadow-cyan-500/50">
                      2pts
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedBetType('vomit_prop')}
                  disabled={resultsFinalized}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left group relative ${
                    selectedBetType === 'vomit_prop'
                      ? 'border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/20'
                      : 'border-white/20 bg-white/5 hover:border-pink-400/50 hover:bg-pink-500/10'
                  } ${resultsFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-white group-hover:text-pink-300 transition-colors text-sm sm:text-base">Vomit Prop</p>
                      <p className="text-xs sm:text-sm text-white/50 mt-1">Will Annie vomit?</p>
                    </div>
                    <div className="ml-2 px-2.5 py-1 rounded-full bg-pink-500/40 border border-pink-400/60 text-pink-300 font-bold text-xs whitespace-nowrap shadow-lg shadow-pink-500/50">
                      1pt
                    </div>
                  </div>
                </button>
              </div>

              {/* Bet Form */}
              {selectedBetType && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Complete Your Bet</h3>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-5 sm:p-6 backdrop-blur-sm">
                    <BetForm
                      betType={selectedBetType}
                      onSubmit={handlePlaceBet}
                      onCancel={() => setSelectedBetType(null)}
                      loading={submitting}
                    />
                  </div>
                </div>
              )}

              {!selectedBetType && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center backdrop-blur-sm">
                  <p className="text-white/60 text-sm sm:text-base">Select a bet type above to get started</p>
                </div>
              )}
            </div>
          )}

          {/* YOUR BETS Tab */}
          {activeTab === 'your-bets' && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Your Bets</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 sm:p-6 backdrop-blur-sm">
                <MyBetsList
                  bets={bets}
                  loading={submitting}
                  onDeleteBet={handleDeleteBet}
                  resultsFinalized={resultsFinalized}
                />
              </div>
            </div>
          )}

          {/* CROWD Tab */}
          {activeTab === 'crowd' && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Crowd Predictions</h2>
              <BetDistribution distribution={distribution} />
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
