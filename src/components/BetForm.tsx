'use client';

import { useState } from 'react';
import { BetInput } from '@/lib/validation';

interface BetFormProps {
  betType: 'time_over_under' | 'exact_time_guess' | 'vomit_prop';
  onSubmit: (betData: BetInput) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function TimeOverUnderForm({ onSubmit, onCancel, loading }: BetFormProps & { betType: 'time_over_under' }) {
  const [threshold, setThreshold] = useState<number>(360); // Default 6 minutes
  const [direction, setDirection] = useState<'over' | 'under'>('over');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onSubmit({
        betType: 'time_over_under',
        thresholdSeconds: threshold,
        direction,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    }
  };

  const commonThresholds = [360, 480, 600, 720, 840, 960]; // 6, 8, 10, 12, 14, 16 minutes
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-white mb-3 uppercase tracking-wide">
          Time Threshold
        </label>
        <div className="relative">
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full px-4 py-3 pr-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white transition-all text-sm font-medium appearance-none cursor-pointer hover:bg-white/15 hover:border-white/30"
          >
            {commonThresholds.map((t) => (
              <option key={t} value={t} className="bg-gray-900 text-white">
                {formatTime(t)} ({t}s)
              </option>
            ))}
            <option value="" className="bg-gray-900 text-white">Custom...</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        {threshold === 0 && (
          <input
            type="number"
            min="0"
            max="1200"
            placeholder="Enter seconds (0-1200)"
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full mt-3 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-white/40 transition-all text-sm font-medium hover:bg-white/15 hover:border-white/30"
          />
        )}
        <p className="text-xs text-white/50 mt-2">
          Selected: {formatTime(threshold)} ({threshold}s)
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-3">Prediction</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDirection('over')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 text-sm ${
              direction === 'over'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/70 border border-white/20 hover:bg-purple-500/20'
            }`}
          >
            OVER
          </button>
          <button
            type="button"
            onClick={() => setDirection('under')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 text-sm ${
              direction === 'under'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/70 border border-white/20 hover:bg-purple-500/20'
            }`}
          >
            UNDER
          </button>
        </div>
      </div>

      {error && <div className="text-red-300 text-sm p-3 bg-red-500/20 border border-red-500/30 rounded-lg">{error}</div>}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-sm transition-all duration-300 shadow-lg shadow-purple-500/30"
        >
          {loading ? 'PLACING...' : 'PLACE BET'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/10 text-white/70 py-3 rounded-lg hover:bg-white/20 font-bold text-sm transition-all duration-300 border border-white/20"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

export function ExactTimeGuessForm({ onSubmit, onCancel, loading }: BetFormProps & { betType: 'exact_time_guess' }) {
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(47);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds < 0 || totalSeconds > 1200) {
      setError('Time must be between 0 and 20 minutes');
      return;
    }

    try {
      await onSubmit({
        betType: 'exact_time_guess',
        guessedTimeSeconds: totalSeconds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Your Prediction
        </label>
        <div className="flex gap-2 items-center justify-center">
          <input
            type="number"
            min="0"
            max="20"
            value={minutes}
            onChange={(e) => setMinutes(Math.min(20, Math.max(0, Number(e.target.value))))}
            className="w-20 px-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-center font-bold text-lg placeholder-white/40 transition-all"
            placeholder="MM"
          />
          <span className="text-3xl font-bold text-white">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(Math.min(59, Math.max(0, Number(e.target.value))))}
            className="w-20 px-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-center font-bold text-lg placeholder-white/40 transition-all"
            placeholder="SS"
          />
        </div>
        <p className="text-xs text-white/50 mt-3 text-center">
          {minutes}:{seconds.toString().padStart(2, '0')} ({minutes * 60 + seconds}s)
        </p>
      </div>

      {error && <div className="text-red-300 text-sm p-3 bg-red-500/20 border border-red-500/30 rounded-lg">{error}</div>}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-sm transition-all duration-300 shadow-lg shadow-cyan-500/30"
        >
          {loading ? 'PLACING...' : 'PLACE BET'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/10 text-white/70 py-3 rounded-lg hover:bg-white/20 font-bold text-sm transition-all duration-300 border border-white/20"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

export function VomitPropForm({ onSubmit, onCancel, loading }: BetFormProps & { betType: 'vomit_prop' }) {
  const [prediction, setPrediction] = useState<'yes' | 'no'>('no');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onSubmit({
        betType: 'vomit_prop',
        prediction,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Will Annie Vomit?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPrediction('yes')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 text-sm ${
              prediction === 'yes'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white/10 text-white/70 border border-white/20 hover:bg-pink-500/20'
            }`}
          >
            YES
          </button>
          <button
            type="button"
            onClick={() => setPrediction('no')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-300 text-sm ${
              prediction === 'no'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white/10 text-white/70 border border-white/20 hover:bg-pink-500/20'
            }`}
          >
            NO
          </button>
        </div>
      </div>

      {error && <div className="text-red-300 text-sm p-3 bg-red-500/20 border border-red-500/30 rounded-lg">{error}</div>}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-sm transition-all duration-300 shadow-lg shadow-pink-500/30"
        >
          {loading ? 'PLACING...' : 'PLACE BET'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/10 text-white/70 py-3 rounded-lg hover:bg-white/20 font-bold text-sm transition-all duration-300 border border-white/20"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

export function BetForm({ betType, onSubmit, onCancel, loading }: BetFormProps) {
  switch (betType) {
    case 'time_over_under':
      return <TimeOverUnderForm betType={betType} onSubmit={onSubmit} onCancel={onCancel} loading={loading} />;
    case 'exact_time_guess':
      return <ExactTimeGuessForm betType={betType} onSubmit={onSubmit} onCancel={onCancel} loading={loading} />;
    case 'vomit_prop':
      return <VomitPropForm betType={betType} onSubmit={onSubmit} onCancel={onCancel} loading={loading} />;
  }
}
