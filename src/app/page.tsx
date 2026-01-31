'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6">
            <p className="text-4xl mb-4">🍺</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-2">
              Annie's Beer Mile
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Join the friendly betting app for Annie's beer mile performance!
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <Link
              href="/auth/login"
              className="block w-full px-4 py-3 sm:py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full px-4 py-3 sm:py-4 border-2 border-primary-600 text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors text-sm sm:text-base"
            >
              Create Account
            </Link>
          </div>

          <div className="bg-primary-50 rounded-lg p-4 text-xs sm:text-sm text-left text-gray-700">
            <p className="font-semibold text-primary-900 mb-2">Demo Credentials:</p>
            <p>Email: <code className="bg-white px-2 py-1 rounded text-xs">admin@beer-mile.test</code></p>
            <p>Password: <code className="bg-white px-2 py-1 rounded text-xs">admin123</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gradient-to-b from-primary-50 to-white">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <p className="text-sm text-primary-600 font-semibold mb-1">Welcome back!</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">
            {session.user?.username}
          </h1>
          {session.user?.role === 'admin' && (
            <p className="text-xs sm:text-sm text-primary-600 font-semibold mt-1">Admin Access Enabled</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8">
          <Link
            href="/calendar"
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-lg border-2 border-primary-200 hover:border-primary-400 hover:shadow-md transition-all"
          >
            <span className="text-2xl sm:text-3xl mb-2">📅</span>
            <span className="text-xs sm:text-sm font-semibold text-primary-900">Calendar</span>
            <span className="text-xs text-gray-500 mt-1">Availability</span>
          </Link>

          <Link
            href="/calendar"
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:shadow-md transition-all opacity-60 cursor-not-allowed"
          >
            <span className="text-2xl sm:text-3xl mb-2">🎲</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-600">Betting</span>
            <span className="text-xs text-gray-400 mt-1">Coming soon</span>
          </Link>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg border border-primary-200 p-4 sm:p-6 shadow-sm mb-6">
          <h2 className="text-sm sm:text-base font-bold text-primary-900 mb-4 flex items-center gap-2">
            <span>📊</span> Status
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-primary-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Email</span>
              <span className="text-xs sm:text-sm font-semibold text-primary-900 truncate ml-2">
                {session.user?.email}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Role</span>
              <span className="text-xs sm:text-sm font-semibold text-blue-900">
                {session.user?.role === 'admin' ? 'Admin 👨‍💼' : 'User 👤'}
              </span>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg border border-primary-100 p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm sm:text-base font-bold text-primary-900 mb-4 flex items-center gap-2">
            <span>🎯</span> How It Works
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="font-bold text-primary-600 flex-shrink-0">1</span>
              <p>
                <strong>Mark Your Availability:</strong> Use the calendar to show which dates you can attend.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary-600 flex-shrink-0">2</span>
              <p>
                <strong>Reach Consensus:</strong> When everyone marks the same date, it becomes available (shown in green).
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary-600 flex-shrink-0">3</span>
              <p>
                <strong>Admin Locks Date:</strong> Once consensus is reached, admin locks the final date.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary-600 flex-shrink-0">4</span>
              <p>
                <strong>Place Your Bets:</strong> After the date is locked, betting becomes available!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
