'use client';

import { FormEvent, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Carousel auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || 'Failed to sign in');
      } else if (result?.ok) {
        router.push('/betting');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Carousel Slides */}
      <div className="absolute inset-0">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentCarouselIndex === index - 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={`/images/annie/annie-${index}.jpg`}
              alt={`Annie Beer Mile - Photo ${index}`}
              fill
              className="object-cover"
              priority={index === 1}
            />
          </div>
        ))}
      </div>

      {/* Dark Overlay (subtle) */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      {/* Overlay Content - Absolutely positioned */}
      <div className="absolute inset-0 z-40 flex flex-col">
        {!showForm ? (
          // Button View - Positioned at bottom
          <div className="absolute bottom-0 left-0 right-0 w-full flex flex-col items-center px-4 pb-6 sm:pb-8">
            {/* Title and Subtitle - Centered */}
            <div className="text-center mb-4 sm:mb-5">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-widest uppercase drop-shadow-lg">
                Beer Mile 2026
              </h1>
              <p className="text-sm sm:text-base neon-glow-text mt-1 italic font-light">
                We know Annie eats muffins... but does she toss cookies?
              </p>
            </div>

            {/* Action Buttons - Narrower and more rounded */}
            <div className="space-y-2 flex flex-col w-1/2">
              <button
                onClick={() => setShowForm(true)}
                className="py-3 sm:py-4 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full text-sm sm:text-base shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 duration-200 whitespace-nowrap"
              >
                Sign In
              </button>
              <Link
                href="/auth/signup"
                className="py-3 sm:py-4 px-8 border-2 border-purple-400 text-purple-300 font-semibold rounded-full text-sm sm:text-base hover:bg-purple-900 hover:bg-opacity-20 transition-all text-center transform hover:scale-105 duration-200 whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>

            {/* Demo Credentials - Minimal line */}
            <p className="text-center mt-3 sm:mt-4 text-xs text-gray-300 drop-shadow">
              Demo: <code className="text-purple-300">admin@beer-mile.test</code> / <code className="text-purple-300">admin123</code>
            </p>
          </div>
        ) : (
          // Form View - Centered modal overlay
          <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center pb-6 sm:pb-8 px-4">
            <div className="w-full max-w-sm max-h-96 overflow-y-auto">
              {/* Form Container */}
              <div className="bg-black bg-opacity-90 border border-purple-500 border-opacity-40 rounded-lg p-5 sm:p-6 backdrop-blur-sm shadow-2xl relative">
                {/* Close Button */}
              <button
                onClick={() => {
                  setShowForm(false);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-xl font-light"
                aria-label="Close form"
              >
                ×
              </button>

              {/* Form Header */}
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-black text-white mb-0.5">
                  Sign In
                </h2>
                <p className="text-xs text-gray-400">
                  Enter your credentials to continue
                </p>
              </div>

              {/* Form */}
              <form className="space-y-3" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                  <div className="p-2 bg-red-900 bg-opacity-60 border border-red-700 rounded text-xs text-red-200">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded text-xs sm:text-sm hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl mt-4"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

                {/* Sign Up Link */}
                <div className="text-center mt-3 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/auth/signup"
                      className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Create one
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
