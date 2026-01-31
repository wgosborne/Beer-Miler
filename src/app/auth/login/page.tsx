'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="text-5xl mb-4">🍺</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-2">
            Beer Mile
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
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
              className="w-full px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base placeholder-gray-400"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="w-full px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base mt-6"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary-600 hover:text-primary-700">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-xs font-semibold text-primary-900 mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-700 mb-1">
            Email: <code className="bg-white px-2 py-1 rounded text-xs font-mono">admin@beer-mile.test</code>
          </p>
          <p className="text-xs text-gray-700">
            Password: <code className="bg-white px-2 py-1 rounded text-xs font-mono">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
