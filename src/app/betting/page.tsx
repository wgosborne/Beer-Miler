'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BetForm } from '@/components/BetForm';
import { MyBetsList } from '@/components/MyBetsList';
import { BetDistribution } from '@/components/BetDistribution';
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

export default function BettingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Place Your Bets</h1>

      {resultsFinalized && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">✅ Results have been finalized. No more bets can be placed.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bet Type Selection */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Bet Types</h2>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedBetType('time_over_under')}
              disabled={resultsFinalized}
              className={`w-full p-4 rounded-lg border-2 transition text-left ${
                selectedBetType === 'time_over_under'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              } ${resultsFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <p className="font-semibold text-gray-800">Time Over/Under</p>
              <p className="text-xs text-gray-500 mt-1">Guess if Annie finishes over or under a certain time</p>
            </button>

            <button
              onClick={() => setSelectedBetType('exact_time_guess')}
              disabled={resultsFinalized}
              className={`w-full p-4 rounded-lg border-2 transition text-left ${
                selectedBetType === 'exact_time_guess'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              } ${resultsFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <p className="font-semibold text-gray-800">Exact Time Guess</p>
              <p className="text-xs text-gray-500 mt-1">Predict Annie's exact finish time (one guess per person)</p>
            </button>

            <button
              onClick={() => setSelectedBetType('vomit_prop')}
              disabled={resultsFinalized}
              className={`w-full p-4 rounded-lg border-2 transition text-left ${
                selectedBetType === 'vomit_prop'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              } ${resultsFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <p className="font-semibold text-gray-800">Vomit Prop</p>
              <p className="text-xs text-gray-500 mt-1">Will Annie vomit? (one bet per person)</p>
            </button>
          </div>
        </div>

        {/* Bet Form or Form Description */}
        <div className="lg:col-span-2">
          {selectedBetType ? (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Place Your Bet</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <BetForm
                  betType={selectedBetType}
                  onSubmit={handlePlaceBet}
                  onCancel={() => setSelectedBetType(null)}
                  loading={submitting}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">Select a bet type on the left to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* My Bets Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bets</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <MyBetsList
            bets={bets}
            loading={submitting}
            onDeleteBet={handleDeleteBet}
            resultsFinalized={resultsFinalized}
          />
        </div>
      </div>

      {/* Bet Distribution Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bet Distribution</h2>
        <BetDistribution distribution={distribution} />
      </div>
    </div>
  );
}
