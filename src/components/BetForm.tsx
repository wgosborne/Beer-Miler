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

  const commonThresholds = [300, 360, 420, 480, 540]; // 5, 6, 7, 8, 9 minutes

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Time Threshold
        </label>
        <select
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          {commonThresholds.map((t) => (
            <option key={t} value={t}>
              {Math.floor(t / 60)}:{(t % 60).toString().padStart(2, '0')} ({t}s)
            </option>
          ))}
          <option value="">Custom...</option>
        </select>
        {threshold === 0 && (
          <input
            type="number"
            min="0"
            max="1200"
            placeholder="Enter seconds (0-1200)"
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full mt-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Over or Under?</label>
        <div className="flex gap-2 sm:gap-4">
          <label className="flex items-center gap-2 flex-1">
            <input
              type="radio"
              name="direction"
              value="over"
              checked={direction === 'over'}
              onChange={(e) => setDirection('over')}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm">Over</span>
          </label>
          <label className="flex items-center gap-2 flex-1">
            <input
              type="radio"
              name="direction"
              value="under"
              checked={direction === 'under'}
              onChange={(e) => setDirection('under')}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm">Under</span>
          </label>
        </div>
      </div>

      {error && <div className="text-red-600 text-xs sm:text-sm p-2 bg-red-50 rounded">{error}</div>}

      <div className="flex gap-2 sm:gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
        >
          {loading ? 'Placing...' : 'Place Bet'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-colors"
        >
          Cancel
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Exact Time Guess
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="0"
            max="20"
            value={minutes}
            onChange={(e) => setMinutes(Math.min(20, Math.max(0, Number(e.target.value))))}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="MM"
          />
          <span className="text-lg sm:text-xl font-bold text-gray-700">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(Math.min(59, Math.max(0, Number(e.target.value))))}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="SS"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total: {minutes}:{seconds.toString().padStart(2, '0')} ({minutes * 60 + seconds}s)
        </p>
      </div>

      {error && <div className="text-red-600 text-xs sm:text-sm p-2 bg-red-50 rounded">{error}</div>}

      <div className="flex gap-2 sm:gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
        >
          {loading ? 'Placing...' : 'Place Bet'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-colors"
        >
          Cancel
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
          Will Annie vomit?
        </label>
        <div className="flex gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setPrediction('yes')}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition text-sm ${
              prediction === 'yes'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Yes 🤢
          </button>
          <button
            type="button"
            onClick={() => setPrediction('no')}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold transition text-sm ${
              prediction === 'no'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            No ✅
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-xs sm:text-sm p-2 bg-red-50 rounded">{error}</div>}

      <div className="flex gap-2 sm:gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
        >
          {loading ? 'Placing...' : 'Place Bet'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-colors"
        >
          Cancel
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
